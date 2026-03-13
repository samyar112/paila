import { MidnightBoundaryHandler } from '../src/services/journey/MidnightBoundaryHandler';
import type { JourneyDoc } from '../src/shared/schemas';
import { getLocalDateString, getLocalMidnightISO } from '../src/utils/dates';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function makeJourney(overrides: Partial<JourneyDoc> = {}): JourneyDoc {
  const now = new Date();
  return {
    userId: 'user_1',
    routeId: 'route_1',
    routeVersion: 1,
    status: 'active',
    journeyState: 'WALKING',
    startedAt: now,
    completedAt: null,
    totalStepsApplied: 5000,
    progressMeters: 4000,
    progressPercent: 0.1,
    currentMilestoneIndex: 1,
    currentCheckpointId: null,
    unlockedMilestoneIds: [],
    pausedAtCheckpoint: false,
    keepWalkingToday: false,
    keepWalkingExpiresAt: null,
    lastClaimedSourceStepsToday: 500,
    purchaseState: 'free',
    accessTier: 'standard_free',
    frozenAtPaywall: false,
    freezeReason: null,
    paywallArrivalDate: null,
    acclimatizationDays: 0,
    streakDays: 3,
    longestStreakDays: 5,
    lastStepDate: getLocalDateString(now),
    completionShareUnlocked: false,
    ratingPromptEligible: false,
    updatedAt: now,
    ...overrides,
  };
}

// ─────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────

describe('MidnightBoundaryHandler', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-03-13T14:00:00'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns { updated: false } for COMPLETED journey', () => {
    // Arrange
    const journey = makeJourney({
      journeyState: 'COMPLETED',
      status: 'completed',
      completedAt: new Date('2026-03-12T10:00:00'),
    });

    // Act
    const result = MidnightBoundaryHandler.check(journey);

    // Assert
    expect(result.updated).toBe(false);
    expect(result.journey).toBe(journey);
  });

  it('returns { updated: false } for PAYWALL_FROZEN journey', () => {
    // Arrange
    const journey = makeJourney({
      journeyState: 'PAYWALL_FROZEN',
      frozenAtPaywall: true,
      freezeReason: 'paywall',
    });

    // Act
    const result = MidnightBoundaryHandler.check(journey);

    // Assert
    expect(result.updated).toBe(false);
    expect(result.journey).toBe(journey);
  });

  it('does not change WALKING journey when lastStepDate is today', () => {
    // Arrange — lastStepDate matches the faked "today"
    const journey = makeJourney({
      journeyState: 'WALKING',
      lastStepDate: '2026-03-13',
    });

    // Act
    const result = MidnightBoundaryHandler.check(journey);

    // Assert
    expect(result.updated).toBe(false);
    expect(result.journey).toBe(journey);
  });

  it('transitions WALKING to RESTING on a new day', () => {
    // Arrange — lastStepDate is yesterday
    const journey = makeJourney({
      journeyState: 'WALKING',
      lastStepDate: '2026-03-12',
      keepWalkingToday: true,
      keepWalkingExpiresAt: '2026-03-13T00:00:00.000Z',
      lastClaimedSourceStepsToday: 750,
    });

    // Act
    const result = MidnightBoundaryHandler.check(journey);

    // Assert
    expect(result.updated).toBe(true);
    expect(result.journey.journeyState).toBe('RESTING');
    expect(result.journey.keepWalkingToday).toBe(false);
    expect(result.journey.keepWalkingExpiresAt).toBeNull();
    expect(result.journey.lastClaimedSourceStepsToday).toBe(0);
    expect(result.journey.updatedAt).toBeInstanceOf(Date);
  });

  it('transitions PAUSED_AT_CHECKPOINT to RESTING on a new day', () => {
    // Arrange
    const journey = makeJourney({
      journeyState: 'PAUSED_AT_CHECKPOINT',
      pausedAtCheckpoint: true,
      lastStepDate: '2026-03-12',
      keepWalkingToday: true,
      keepWalkingExpiresAt: '2026-03-13T00:00:00.000Z',
      lastClaimedSourceStepsToday: 300,
    });

    // Act
    const result = MidnightBoundaryHandler.check(journey);

    // Assert
    expect(result.updated).toBe(true);
    expect(result.journey.journeyState).toBe('RESTING');
    expect(result.journey.pausedAtCheckpoint).toBe(false);
    expect(result.journey.keepWalkingToday).toBe(false);
    expect(result.journey.keepWalkingExpiresAt).toBeNull();
    expect(result.journey.lastClaimedSourceStepsToday).toBe(0);
  });

  it('transitions to RESTING when keepWalkingToday is true and keepWalkingExpiresAt has passed', () => {
    // Arrange — same day, but keepWalkingExpiresAt already expired
    const journey = makeJourney({
      journeyState: 'RESTING',
      lastStepDate: '2026-03-13', // same day → isNewDay = false
      keepWalkingToday: true,
      keepWalkingExpiresAt: '2026-03-13T10:00:00.000Z', // in the past relative to 14:00
      lastClaimedSourceStepsToday: 200,
    });

    // Act
    const result = MidnightBoundaryHandler.check(journey);

    // Assert
    expect(result.updated).toBe(true);
    expect(result.journey.journeyState).toBe('RESTING');
    expect(result.journey.keepWalkingToday).toBe(false);
    expect(result.journey.keepWalkingExpiresAt).toBeNull();
    expect(result.journey.lastClaimedSourceStepsToday).toBe(0);
  });

  it('does not change when keepWalkingToday is true but keepWalkingExpiresAt has not passed', () => {
    // Arrange — same day, keepWalkingExpiresAt in the future
    const journey = makeJourney({
      journeyState: 'WALKING',
      lastStepDate: '2026-03-13', // same day → isNewDay = false
      keepWalkingToday: true,
      keepWalkingExpiresAt: '2026-03-14T00:00:00.000Z', // future
    });

    // Act
    const result = MidnightBoundaryHandler.check(journey);

    // Assert
    expect(result.updated).toBe(false);
    expect(result.journey).toBe(journey);
  });
});
