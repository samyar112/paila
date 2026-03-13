import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';
import { beforeUserCreated as onAuthUserCreated } from 'firebase-functions/v2/identity';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { onRequest } from 'firebase-functions/v2/https';

import type {
  ContentPackDoc,
  JourneyDoc,
  JourneyLedgerDoc,
  MilestoneDoc,
  RouteDoc,
  StepSnapshotDoc,
  StepSource,
  UsageCounterDoc,
  WeatherCacheDoc,
} from '../../src/shared/schemas';
import {
  COLLECTIONS,
  userDocPath,
  journeyLedgerPath,
  userStepSnapshotPath,
  userUsageCounterPath,
} from '../../src/shared/paths';
import { buildUserDoc } from './user-doc';

admin.initializeApp();

const db = admin.firestore();
const now = () => new Date();

const SOURCE_PRIORITY: StepSource[] = [
  'healthkit',
  'health_connect',
  'phone_pedometer',
];
const MAX_WEATHER_CALLS_PER_DAY = 4;
const WEATHER_TTL_MS = 6 * 60 * 60 * 1000;

function chooseSource(
  snapshot: StepSnapshotDoc,
): { source: StepSource | null; steps: number } {
  for (const source of SOURCE_PRIORITY) {
    const reading = snapshot.sources[source];
    if (reading && Number.isFinite(reading.steps) && reading.steps >= 0) {
      return { source, steps: Math.floor(reading.steps) };
    }
  }

  return { source: null, steps: 0 };
}

function diffCalendarDays(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / 86400000));
}

function cacheKeyForLocation(locationKey: string): string {
  return locationKey.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
}

function stepSnapshotInputsChanged(
  before: StepSnapshotDoc | undefined,
  after: StepSnapshotDoc,
): boolean {
  if (!before) {
    return true;
  }

  return JSON.stringify(before.sources ?? {}) !== JSON.stringify(after.sources ?? {})
    || before.timezone !== after.timezone
    || before.localDate !== after.localDate;
}

async function getContentPack(
  contentPackId: string,
): Promise<ContentPackDoc | null> {
  const snap = await db
    .collection(COLLECTIONS.contentPacks)
    .doc(contentPackId)
    .get();
  return snap.exists ? (snap.data() as ContentPackDoc) : null;
}

function timestampToMillis(value: unknown): number | null {
  if (!value) {
    return null;
  }

  if (value instanceof admin.firestore.Timestamp) {
    return value.toMillis();
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
}

async function incrementWeatherUsageCounter(
  userId: string,
  localDate: string,
): Promise<UsageCounterDoc> {
  const counterRef = db.doc(userUsageCounterPath(userId, localDate));

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(counterRef);
    const current = (snap.exists ? (snap.data() as UsageCounterDoc) : null) ?? {
      localDate,
      userId,
      weatherCallCount: 0,
      updatedAt: now(),
    };

    tx.set(counterRef, {
      ...current,
      localDate,
      userId,
      weatherCallCount: (current.weatherCallCount ?? 0) + 1,
      lastWeatherFetchAt: now(),
      updatedAt: now(),
    }, { merge: true });
  });

  return (await counterRef.get()).data() as UsageCounterDoc;
}

async function getUsageCounter(
  userId: string,
  localDate: string,
): Promise<UsageCounterDoc | null> {
  const snap = await db.doc(userUsageCounterPath(userId, localDate)).get();

  return snap.exists ? (snap.data() as UsageCounterDoc) : null;
}

async function getActiveJourney(
  userId: string,
): Promise<{ ref: FirebaseFirestore.DocumentReference; data: JourneyDoc } | null> {
  const snap = await db
    .collection(COLLECTIONS.users)
    .doc(userId)
    .collection(COLLECTIONS.journeys)
    .where('status', '==', 'active')
    .limit(1)
    .get();

  if (snap.empty) {
    return null;
  }

  const doc = snap.docs[0];
  if (!doc) return null;
  return { ref: doc.ref, data: doc.data() as JourneyDoc };
}

async function listRouteMilestones(routeId: string): Promise<MilestoneDoc[]> {
  const snap = await db
    .collection(COLLECTIONS.routes)
    .doc(routeId)
    .collection(COLLECTIONS.milestones)
    .orderBy('index', 'asc')
    .get();

  return snap.docs.map((doc) => doc.data() as MilestoneDoc);
}

async function rebuildJourneyFromLedger(
  userId: string,
  journeyRef: FirebaseFirestore.DocumentReference,
  journey: JourneyDoc,
  route: RouteDoc,
  milestones: MilestoneDoc[],
  localDate: string,
): Promise<JourneyDoc> {
  const ledgerSnap = await journeyRef
    .collection(COLLECTIONS.ledger)
    .orderBy('localDate', 'asc')
    .get();
  const ledgers = ledgerSnap.docs.map((doc) => doc.data() as JourneyLedgerDoc);
  const appliedLedgers = ledgers.filter((entry) => !entry.wasFrozen);

  const totalStepsApplied = appliedLedgers.reduce((sum, entry) => sum + entry.appliedSteps, 0);
  let progressMeters = appliedLedgers.reduce((sum, entry) => sum + entry.appliedMeters, 0);

  if (!route.isFreeRoute && journey.purchaseState === 'free' && route.paywallTriggerMeters != null) {
    progressMeters = Math.min(progressMeters, route.paywallTriggerMeters);
  }

  progressMeters = Math.min(progressMeters, route.totalMeters);

  const unlockedMilestones = milestones
    .filter((milestone) => milestone.triggerMeters <= progressMeters)
    .map((milestone) => milestone.titleSlug);

  const currentMilestoneIndex =
    milestones.filter((milestone) => milestone.triggerMeters <= progressMeters).length > 0
      ? (milestones.filter((milestone) => milestone.triggerMeters <= progressMeters).slice(-1)[0]?.index ?? 0)
      : 0;

  const stepDays = appliedLedgers
    .filter((entry) => entry.appliedSteps > 0)
    .map((entry) => entry.localDate)
    .sort();

  let streakDays = 0;
  if (stepDays.length > 0) {
    streakDays = 1;
    for (let i = stepDays.length - 1; i > 0; i -= 1) {
      if (diffCalendarDays(stepDays[i - 1] ?? '', stepDays[i] ?? '') === 1) {
        streakDays += 1;
      } else {
        break;
      }
    }
  }

  const longestStreakDays = Math.max(journey.longestStreakDays ?? 0, streakDays);
  const lastStepDate = stepDays.length > 0 ? stepDays[stepDays.length - 1] ?? null : null;

  const completed = progressMeters >= route.totalMeters;

  const updated: JourneyDoc = {
    ...journey,
    totalStepsApplied,
    progressMeters,
    progressPercent: route.totalMeters === 0 ? 0 : progressMeters / route.totalMeters,
    currentMilestoneIndex,
    unlockedMilestoneIds: unlockedMilestones,
    streakDays,
    longestStreakDays,
    lastStepDate,
    acclimatizationDays:
      journey.frozenAtPaywall && journey.paywallArrivalDate
        ? diffCalendarDays(journey.paywallArrivalDate, localDate) + 1
        : 0,
    status: completed ? 'completed' : journey.status,
    completedAt: completed ? now() : journey.completedAt ?? null,
    completionShareUnlocked: completed,
    ratingPromptEligible: completed,
    updatedAt: now(),
  };

  return updated;
}

export const onUserCreated = onAuthUserCreated(async (event) => {
  const user = event.data;
  if (!user) {
    return;
  }

  const userRef = db.doc(userDocPath(user.uid));
  await userRef.set(
    buildUserDoc(user, now()),
    { merge: true },
  );
});

export const stepSnapshotUpdated = onDocumentWritten(
  `${COLLECTIONS.users}/{userId}/${COLLECTIONS.stepSnapshots}/{localDate}`,
  async (event) => {
    const before = event.data?.before;
    const after = event.data?.after;
    if (!after?.exists) {
      return;
    }

    const snapshot = after.data() as StepSnapshotDoc;
    const previousSnapshot = before?.exists ? (before.data() as StepSnapshotDoc) : undefined;
    if (!stepSnapshotInputsChanged(previousSnapshot, snapshot)) {
      logger.info('Skipping step sync because only derived fields changed', {
        userId: event.params.userId,
        localDate: event.params.localDate,
      });
      return;
    }

    const userId = event.params.userId;
    const localDate = event.params.localDate;
    const chosen = chooseSource(snapshot);

    await after.ref.set(
      {
        chosenSource: chosen.source,
        chosenSteps: chosen.steps,
        computedAt: now(),
      },
      { merge: true },
    );

    const activeJourney = await getActiveJourney(userId);
    if (!activeJourney) {
      logger.info('No active journey for step snapshot', { userId, localDate });
      return;
    }

    const routeRef = db
      .collection(COLLECTIONS.routes)
      .doc(activeJourney.data.routeId);
    const routeSnap = await routeRef.get();
    if (!routeSnap.exists) {
      throw new Error(`Missing route ${activeJourney.data.routeId}`);
    }

    const route = routeSnap.data() as RouteDoc;
    const milestones = await listRouteMilestones(activeJourney.data.routeId);
    const ledgerRef = db.doc(
      journeyLedgerPath(userId, activeJourney.ref.id, localDate),
    );

    if (!chosen.source) {
      logger.info('No valid step source found', { userId, localDate });
      return;
    }

    if (
      activeJourney.data.frozenAtPaywall &&
      activeJourney.data.freezeReason === 'paywall' &&
      activeJourney.data.purchaseState !== 'premium_unlocked'
    ) {
      await ledgerRef.set(
        {
          userId,
          journeyId: activeJourney.ref.id,
          localDate,
          snapshotRef: userStepSnapshotPath(userId, localDate),
          appliedSource: chosen.source,
          appliedSteps: 0,
          appliedMeters: 0,
          wasFrozen: true,
          freezeReason: 'paywall',
          checkpointsReachedToday: [],
          restDecision: null,
          discardedSurplusSteps: 0,
          appliedAt: now(),
          recomputeVersion: 1,
        } satisfies JourneyLedgerDoc,
        { merge: true },
      );

      const updated = await rebuildJourneyFromLedger(
        userId,
        activeJourney.ref,
        activeJourney.data,
        route,
        milestones,
        localDate,
      );

      await activeJourney.ref.set(updated, { merge: true });
      return;
    }

    const metersPerStep = route.totalStepsCanonical === 0
      ? 0
      : route.totalMeters / route.totalStepsCanonical;

    await ledgerRef.set(
      {
        userId,
        journeyId: activeJourney.ref.id,
        localDate,
        snapshotRef: userStepSnapshotPath(userId, localDate),
        appliedSource: chosen.source,
        appliedSteps: chosen.steps,
        appliedMeters: chosen.steps * metersPerStep,
        wasFrozen: false,
        freezeReason: null,
        checkpointsReachedToday: [],
        restDecision: null,
        discardedSurplusSteps: 0,
        appliedAt: now(),
        recomputeVersion: 1,
      } satisfies JourneyLedgerDoc,
      { merge: true },
    );

    let updated = await rebuildJourneyFromLedger(
      userId,
      activeJourney.ref,
      activeJourney.data,
      route,
      milestones,
      localDate,
    );

    if (
      !route.isFreeRoute &&
      updated.purchaseState === 'free' &&
      route.paywallTriggerMeters != null &&
      updated.progressMeters >= route.paywallTriggerMeters
    ) {
      updated = {
        ...updated,
        progressMeters: route.paywallTriggerMeters,
        progressPercent:
          route.totalMeters === 0 ? 0 : route.paywallTriggerMeters / route.totalMeters,
        frozenAtPaywall: true,
        freezeReason: 'paywall',
        paywallArrivalDate: updated.paywallArrivalDate ?? localDate,
        acclimatizationDays:
          updated.paywallArrivalDate == null
            ? 1
            : diffCalendarDays(updated.paywallArrivalDate, localDate) + 1,
      };
    }

    await activeJourney.ref.set(updated, { merge: true });
  },
);

export const revenueCatEntitlementSync = onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed');
    return;
  }

  const secret = process.env.REVENUECAT_WEBHOOK_SECRET;
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    res.status(401).send('Unauthorized');
    return;
  }

  const event = req.body?.event;
  const appUserId = event?.app_user_id as string | undefined;
  if (!appUserId) {
    res.status(400).send('Missing app_user_id');
    return;
  }

  const entitlementId = String(event?.entitlement_id ?? 'default');
  const productId = String(event?.product_id ?? '');
  const isActive = ['INITIAL_PURCHASE', 'RENEWAL', 'UNCANCELLATION'].includes(event?.type);

  const entitlementRef = db
    .collection(COLLECTIONS.users)
    .doc(appUserId)
    .collection(COLLECTIONS.entitlements)
    .doc(entitlementId);

  await entitlementRef.set(
    {
      provider: 'revenuecat',
      productId,
      entitlementKey: entitlementId,
      status: isActive ? 'active' : 'inactive',
      purchasedAt: event?.purchased_at_ms
        ? admin.firestore.Timestamp.fromMillis(Number(event.purchased_at_ms))
        : null,
      expiresAt: event?.expiration_at_ms
        ? admin.firestore.Timestamp.fromMillis(Number(event.expiration_at_ms))
        : null,
      rawEnvironment: event?.environment === 'SANDBOX' ? 'sandbox' : 'production',
      updatedAt: now(),
    },
    { merge: true },
  );

  const activeJourney = await getActiveJourney(appUserId);
  if (!activeJourney) {
    res.status(200).send('ok');
    return;
  }

  if (isActive) {
    const routeSnap = await db
      .collection(COLLECTIONS.routes)
      .doc(activeJourney.data.routeId)
      .get();
    if (!routeSnap.exists) {
      throw new Error();
    }

    const route = routeSnap.data() as RouteDoc;
    if (!route.isFreeRoute) {
      if (!route.premiumContentPackId) {
        throw new Error();
      }

      const contentPack = await getContentPack(route.premiumContentPackId);
      if (!contentPack || contentPack.routeId !== activeJourney.data.routeId) {
        throw new Error();
      }
    }

    await activeJourney.ref.set(
      {
        purchaseState: 'premium_unlocked',
        accessTier:
          activeJourney.data.accessTier === 'local_free' ? 'local_free' : 'paid',
        frozenAtPaywall: false,
        freezeReason: null,
        updatedAt: now(),
      },
      { merge: true },
    );
  }

  res.status(200).send('ok');
});

export const weatherProxy = onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed');
    return;
  }

  const userId = String(req.body?.userId ?? '');
  const localDate = String(req.body?.localDate ?? '');
  const locationKey = String(req.body?.locationKey ?? '');

  if (!userId || !localDate || !locationKey) {
    res.status(400).send('Missing required fields');
    return;
  }

  const usage = await getUsageCounter(userId, localDate);
  if ((usage?.weatherCallCount ?? 0) >= MAX_WEATHER_CALLS_PER_DAY) {
    res.status(204).send();
    return;
  }

  const cacheKey = cacheKeyForLocation(locationKey);
  const cacheRef = db.collection(COLLECTIONS.weatherCache).doc(cacheKey);
  const cacheSnap = await cacheRef.get();
  const cache = cacheSnap.exists ? (cacheSnap.data() as WeatherCacheDoc) : null;
  const expiresAtMs = timestampToMillis(cache?.expiresAt);

  if (cache && expiresAtMs != null && expiresAtMs > Date.now()) {
    res.status(200).json({ source: 'cache', weather: cache.payload });
    return;
  }

  if ((usage?.weatherCallCount ?? 0) >= MAX_WEATHER_CALLS_PER_DAY) {
    res.status(204).send();
    return;
  }

  await incrementWeatherUsageCounter(userId, localDate);

  // Placeholder for the external OpenWeatherMap call.
  // The real implementation should fetch once, store the normalized payload,
  // and reuse it for all users in the same location until expiry.
  const normalizedPayload = {
    locationKey,
    summary: 'stubbed-weather-response',
    fetchedAt: new Date().toISOString(),
  };

  await cacheRef.set(
    {
      cacheKey,
      locationKey,
      provider: 'open_meteo',
      payload: normalizedPayload,
      fetchedAt: now(),
      expiresAt: new Date(Date.now() + WEATHER_TTL_MS),
    } satisfies WeatherCacheDoc,
    { merge: true },
  );

  res.status(200).json({ source: 'origin', weather: normalizedPayload });
});
