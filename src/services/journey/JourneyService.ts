import firestore from '@react-native-firebase/firestore';
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
    const db = firestore();
    const journeyRef = db
      .collection(COLLECTIONS.users)
      .doc(userId)
      .collection(COLLECTIONS.journeys)
      .doc();

    const userRef = db.doc(userDocPath(userId));
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

    const batch = db.batch();
    batch.set(journeyRef, journey);
    batch.update(userRef, { activeJourneyId: journeyRef.id, updatedAt: now });
    await batch.commit();

    return journeyRef.id;
  }

  static async getActiveJourney(
    userId: string,
  ): Promise<{ id: string; data: JourneyDoc } | null> {
    const snap = await firestore()
      .collection(COLLECTIONS.users)
      .doc(userId)
      .collection(COLLECTIONS.journeys)
      .where('status', '==', 'active')
      .limit(1)
      .get();

    if (snap.empty) return null;
    const doc = snap.docs[0];
    if (!doc) return null;
    return { id: doc.id, data: doc.data() as JourneyDoc };
  }

  static async updateJourney(
    userId: string,
    journeyId: string,
    data: Partial<JourneyDoc>,
  ): Promise<void> {
    await firestore()
      .doc(userJourneyPath(userId, journeyId))
      .update({ ...data, updatedAt: new Date() });
  }
}
