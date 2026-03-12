import {
  journeyLedgerSchema,
  journeySchema,
  journeyStateSchema,
  stepSourceSchema,
} from '../src/shared/schemas';
import { userStepSnapshotPath } from '../src/shared/paths';

describe('schemas', () => {
  it('stepSource excludes manual', () => {
    expect(() => stepSourceSchema.parse('manual')).toThrow();
    expect(stepSourceSchema.parse('healthkit')).toBe('healthkit');
  });

  it('journeyState includes required states', () => {
    expect(journeyStateSchema.parse('WALKING')).toBe('WALKING');
    expect(journeyStateSchema.parse('PAYWALL_FROZEN')).toBe('PAYWALL_FROZEN');
  });

  it('journey includes checkpoint fields', () => {
    const parsed = journeySchema.parse({
      userId: 'user_1',
      routeId: 'route_1',
      routeVersion: 1,
      status: 'active',
      journeyState: 'WALKING',
      startedAt: new Date(),
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
      completionShareUnlocked: false,
      ratingPromptEligible: false,
      updatedAt: new Date(),
    });

    expect(parsed.journeyState).toBe('WALKING');
  });

  it('journey ledger supports multiple checkpoints', () => {
    const parsed = journeyLedgerSchema.parse({
      userId: 'user_1',
      journeyId: 'journey_1',
      localDate: '2026-03-10',
      snapshotRef: userStepSnapshotPath('user_1', '2026-03-10'),
      appliedSource: 'healthkit',
      appliedSteps: 1000,
      appliedMeters: 800,
      wasFrozen: false,
      freezeReason: null,
      checkpointsReachedToday: ['m1', 'm2'],
      restDecision: 'keep_walking',
      discardedSurplusSteps: 0,
      appliedAt: new Date(),
      recomputeVersion: 1,
    });

    expect(parsed.checkpointsReachedToday.length).toBe(2);
  });
});
