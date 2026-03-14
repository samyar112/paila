import {
  collection,
  doc,
  getDocs,
  getFirestore,
  limit,
  query,
  updateDoc,
  where,
  writeBatch,
} from '@react-native-firebase/firestore';
import type { JourneyDoc } from '../../shared/schemas';
import {
  COLLECTIONS,
  userDocPath,
  userJourneyPath,
} from '../../shared/paths';

export class JourneyService {
  static async startJourney(
    userId: string,
    routeId: string,
    routeVersion: number,
  ): Promise<string> {
    const db = getFirestore();
    const journeyRef = doc(
      collection(doc(collection(db, COLLECTIONS.users), userId), COLLECTIONS.journeys),
    );

    const userRef = doc(db, userDocPath(userId));
    const now = new Date();

    const journey: JourneyDoc = {
      userId,
      routeId,
      routeVersion,
      status: 'active',
      journeyState: 'WALKING',
      startedAt: now,
      completedAt: null,
      totalStepsApplied: 0,
      progressMeters: 0,
      progressPercent: 0,
      currentMilestoneIndex: 0,
      currentCheckpointId: null,
      unlockedMilestoneIds: [],
      pausedAtCheckpoint: false,
      keepWalkingToday: false,
      keepWalkingExpiresAt: null,
      lastClaimedSourceStepsToday: 0,
      purchaseState: 'free',
      accessTier: 'standard_free',
      frozenAtPaywall: false,
      freezeReason: null,
      paywallArrivalDate: null,
      acclimatizationDays: 0,
      streakDays: 0,
      longestStreakDays: 0,
      lastStepDate: null,
      isReturnPath: false,
      returnProgressMeters: 0,
      completionShareUnlocked: false,
      ratingPromptEligible: false,
      updatedAt: now,
    };

    // Check for existing active journey, then batch-write journey + user doc atomically
    const existingJourney = await this.getActiveJourney(userId);
    if (existingJourney) {
      throw new Error('User already has an active journey');
    }

    const batch = writeBatch(db);
    batch.set(journeyRef, journey);
    batch.update(userRef, { activeJourneyId: journeyRef.id, updatedAt: now });
    await batch.commit();

    return journeyRef.id;
  }

  static async getActiveJourney(
    userId: string,
  ): Promise<{ id: string; data: JourneyDoc } | null> {
    const db = getFirestore();
    const journeysRef = collection(
      doc(collection(db, COLLECTIONS.users), userId),
      COLLECTIONS.journeys,
    );
    const snap = await getDocs(
      query(journeysRef, where('status', '==', 'active'), limit(1)),
    );

    if (snap.empty) return null;
    const journeyDoc = snap.docs[0];
    if (!journeyDoc) return null;
    return { id: journeyDoc.id, data: journeyDoc.data() as JourneyDoc };
  }

  static async updateJourney(
    userId: string,
    journeyId: string,
    data: Partial<JourneyDoc>,
  ): Promise<void> {
    const db = getFirestore();
    await updateDoc(doc(db, userJourneyPath(userId, journeyId)), {
      ...data,
      updatedAt: new Date(),
    });
  }

  static async resetActiveJourneyForDev(userId: string): Promise<void> {
    const isDevMode = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';
    if (!isDevMode) return;

    const activeJourney = await this.getActiveJourney(userId);
    if (!activeJourney) return;

    const db = getFirestore();
    const batch = writeBatch(db);
    batch.delete(doc(db, userJourneyPath(userId, activeJourney.id)));
    batch.update(doc(db, userDocPath(userId)), {
      activeJourneyId: null,
      updatedAt: new Date(),
    });
    await batch.commit();
  }
}
