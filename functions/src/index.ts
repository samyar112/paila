import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { onRequest } from 'firebase-functions/v2/https';

admin.initializeApp();

const db = admin.firestore();
const now = () => admin.firestore.Timestamp.now();

type StepSource = 'healthkit' | 'health_connect' | 'phone_pedometer' | 'manual';
type FreezeReason = 'paywall' | null;
type CeremonyType = 'standard' | 'paywall' | 'completion';

type StepSourceReading = {
  steps: number;
  fetchedAt: admin.firestore.Timestamp | string;
  startAt: admin.firestore.Timestamp | string;
  endAt: admin.firestore.Timestamp | string;
  isComplete: boolean;
  deviceLabel?: string;
};

type StepSnapshotDoc = {
  userId: string;
  localDate: string;
  timezone: string;
  sources: Partial<Record<StepSource, StepSourceReading>>;
  chosenSource: StepSource | null;
  chosenSteps: number;
  isFinal: boolean;
  computedAt: admin.firestore.Timestamp | string;
  updatedAt: admin.firestore.Timestamp | string;
};

type RouteDoc = {
  slug: string;
  name: string;
  version: number;
  isPublished: boolean;
  isComingSoon: boolean;
  totalMeters: number;
  totalStepsCanonical: number;
  totalAltitudeGainMeters: number;
  estimatedDays: number;
  difficulty: 'easy' | 'moderate' | 'challenging' | 'extreme';
  regionTag: string;
  tags: string[];
  priceUSD: number;
  isFreeRoute: boolean;
  shortDescription: string;
  longDescription: string;
  heroImageUrl: string;
  heroVideoUrl?: string;
  paywallMilestoneId?: string | null;
  paywallTriggerMeters?: number | null;
  polylineRef: string;
  bounds: { north: number; south: number; east: number; west: number };
  milestoneIds: string[];
};

type MilestoneDoc = {
  routeId: string;
  routeVersion: number;
  index: number;
  nepaliTitle: string;
  englishTitle: string;
  titleSlug: string;
  triggerMeters: number;
  triggerSteps: number;
  tier: 'free' | 'premium';
  assetBundleId: string;
  unlockOnce: true;
  badgeId?: string | null;
  ceremonyType: CeremonyType;
};

type JourneyDoc = {
  userId: string;
  routeId: string;
  routeVersion: number;
  status: 'active' | 'completed' | 'abandoned';
  startedAt: admin.firestore.Timestamp | string;
  completedAt?: admin.firestore.Timestamp | string | null;
  totalStepsApplied: number;
  progressMeters: number;
  progressPercent: number;
  currentMilestoneIndex: number;
  unlockedMilestoneIds: string[];
  purchaseState: 'free' | 'premium_unlocked';
  accessTier: 'local_free' | 'standard_free' | 'paid';
  frozenAtPaywall: boolean;
  freezeReason: FreezeReason;
  paywallArrivalDate?: string | null;
  acclimatizationDays: number;
  streakDays: number;
  longestStreakDays: number;
  lastStepDate?: string | null;
  completionShareUnlocked: boolean;
  ratingPromptEligible: boolean;
  updatedAt: admin.firestore.Timestamp | string;
};

type JourneyLedgerDoc = {
  userId: string;
  journeyId: string;
  localDate: string;
  snapshotRef: string;
  appliedSource: StepSource;
  appliedSteps: number;
  appliedMeters: number;
  wasFrozen: boolean;
  freezeReason: FreezeReason;
  appliedAt: admin.firestore.Timestamp | string;
  recomputeVersion: number;
};

type UsageCounterDoc = {
  localDate: string;
  userId: string;
  stepSyncCount: number;
  weatherCallCount: number;
  lastStepSyncAt?: admin.firestore.Timestamp | string | null;
  lastWeatherFetchAt?: admin.firestore.Timestamp | string | null;
  updatedAt: admin.firestore.Timestamp | string;
};

type WeatherCacheDoc = {
  cacheKey: string;
  locationKey: string;
  provider: 'openweathermap';
  payload: Record<string, unknown>;
  fetchedAt: admin.firestore.Timestamp | string;
  expiresAt: admin.firestore.Timestamp | string;
};

const SOURCE_PRIORITY: StepSource[] = [
  'healthkit',
  'health_connect',
  'phone_pedometer',
  'manual',
];
const MAX_STEP_SYNCS_PER_DAY = 10;
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

function timestampToMillis(
  value: admin.firestore.Timestamp | string | null | undefined,
): number | null {
  if (!value) {
    return null;
  }

  if (value instanceof admin.firestore.Timestamp) {
    return value.toMillis();
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

async function incrementUsageCounter(
  userId: string,
  localDate: string,
  field: 'stepSyncCount' | 'weatherCallCount',
  lastAtField: 'lastStepSyncAt' | 'lastWeatherFetchAt',
): Promise<UsageCounterDoc> {
  const counterRef = db
    .collection('users')
    .doc(userId)
    .collection('usageCounters')
    .doc(localDate);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(counterRef);
    const current = (snap.exists ? (snap.data() as UsageCounterDoc) : null) ?? {
      localDate,
      userId,
      stepSyncCount: 0,
      weatherCallCount: 0,
      updatedAt: now(),
    };

    tx.set(
      counterRef,
      {
        ...current,
        localDate,
        userId,
        [field]: (current[field] ?? 0) + 1,
        [lastAtField]: now(),
        updatedAt: now(),
      },
      { merge: true },
    );
  });

  return (await counterRef.get()).data() as UsageCounterDoc;
}

async function getUsageCounter(
  userId: string,
  localDate: string,
): Promise<UsageCounterDoc | null> {
  const snap = await db
    .collection('users')
    .doc(userId)
    .collection('usageCounters')
    .doc(localDate)
    .get();

  return snap.exists ? (snap.data() as UsageCounterDoc) : null;
}

async function getActiveJourney(
  userId: string,
): Promise<{ ref: FirebaseFirestore.DocumentReference; data: JourneyDoc } | null> {
  const snap = await db
    .collection('users')
    .doc(userId)
    .collection('journeys')
    .where('status', '==', 'active')
    .limit(1)
    .get();

  if (snap.empty) {
    return null;
  }

  const doc = snap.docs[0];
  return { ref: doc.ref, data: doc.data() as JourneyDoc };
}

async function listRouteMilestones(routeId: string): Promise<MilestoneDoc[]> {
  const snap = await db
    .collection('routes')
    .doc(routeId)
    .collection('milestones')
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
  const ledgerSnap = await journeyRef.collection('ledger').orderBy('localDate', 'asc').get();
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
      ? milestones.filter((milestone) => milestone.triggerMeters <= progressMeters).slice(-1)[0].index
      : 0;

  const stepDays = appliedLedgers
    .filter((entry) => entry.appliedSteps > 0)
    .map((entry) => entry.localDate)
    .sort();

  let streakDays = 0;
  if (stepDays.length > 0) {
    streakDays = 1;
    for (let i = stepDays.length - 1; i > 0; i -= 1) {
      if (diffCalendarDays(stepDays[i - 1], stepDays[i]) === 1) {
        streakDays += 1;
      } else {
        break;
      }
    }
  }

  const longestStreakDays = Math.max(journey.longestStreakDays ?? 0, streakDays);
  const lastStepDate = stepDays.at(-1) ?? null;

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

export const stepSnapshotUpdated = onDocumentWritten(
  'users/{userId}/stepSnapshots/{localDate}',
  async (event) => {
    const after = event.data?.after;
    if (!after?.exists) {
      return;
    }

    const snapshot = after.data() as StepSnapshotDoc;
    const userId = event.params.userId;
    const localDate = event.params.localDate;
    const usage = await getUsageCounter(userId, localDate);
    if ((usage?.stepSyncCount ?? 0) >= MAX_STEP_SYNCS_PER_DAY) {
      logger.info('Skipping step sync due to daily limit', { userId, localDate });
      return;
    }

    await incrementUsageCounter(userId, localDate, 'stepSyncCount', 'lastStepSyncAt');
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

    const routeRef = db.collection('routes').doc(activeJourney.data.routeId);
    const routeSnap = await routeRef.get();
    if (!routeSnap.exists) {
      throw new Error(`Missing route ${activeJourney.data.routeId}`);
    }

    const route = routeSnap.data() as RouteDoc;
    const milestones = await listRouteMilestones(activeJourney.data.routeId);
    const ledgerRef = activeJourney.ref.collection('ledger').doc(localDate);

    if (!chosen.source) {
      await ledgerRef.set(
        {
          userId,
          journeyId: activeJourney.ref.id,
          localDate,
          snapshotRef: after.ref.path,
          appliedSource: 'manual',
          appliedSteps: 0,
          appliedMeters: 0,
          wasFrozen: false,
          freezeReason: null,
          appliedAt: now(),
          recomputeVersion: 1,
        } satisfies JourneyLedgerDoc,
        { merge: true },
      );
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
          snapshotRef: after.ref.path,
          appliedSource: chosen.source,
          appliedSteps: 0,
          appliedMeters: 0,
          wasFrozen: true,
          freezeReason: 'paywall',
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
        snapshotRef: after.ref.path,
        appliedSource: chosen.source,
        appliedSteps: chosen.steps,
        appliedMeters: chosen.steps * metersPerStep,
        wasFrozen: false,
        freezeReason: null,
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
    .collection('users')
    .doc(appUserId)
    .collection('entitlements')
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
  const cacheRef = db.collection('weatherCache').doc(cacheKey);
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

  await incrementUsageCounter(userId, localDate, 'weatherCallCount', 'lastWeatherFetchAt');

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
      provider: 'openweathermap',
      payload: normalizedPayload,
      fetchedAt: now(),
      expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + WEATHER_TTL_MS),
    } satisfies WeatherCacheDoc,
    { merge: true },
  );

  res.status(200).json({ source: 'origin', weather: normalizedPayload });
});
