import type { JourneyDoc, MilestoneDoc, RouteDoc } from '../src/shared/schemas';
import { JourneyProgressionService } from '../src/services/journey/JourneyProgressionService';
import { InvalidStateError } from '../src/utils/errors';
import { getLocalDateString } from '../src/utils/dates';

// ---------------------------------------------------------------------------
// Mock dates – control getLocalDateString so streak / date logic is
// deterministic.  diffCalendarDays and every other export stay real.
// ---------------------------------------------------------------------------
jest.mock('../src/utils/dates', () => {
  const actual = jest.requireActual('../src/utils/dates');
  return {
    ...actual,
    getLocalDateString: jest.fn(() => '2026-03-13'),
  };
});

const mockedGetLocalDateString = getLocalDateString as jest.MockedFunction<
  typeof getLocalDateString
>;

// ---------------------------------------------------------------------------
// Factory helpers
// ---------------------------------------------------------------------------

function makeJourney(overrides: Partial<JourneyDoc> = {}): JourneyDoc {
  return {
    userId: 'user_1',
    routeId: 'route_1',
    routeVersion: 1,
    status: 'active',
    journeyState: 'WALKING',
    startedAt: new Date('2026-03-01'),
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
    streakDays: 1,
    longestStreakDays: 1,
    lastStepDate: '2026-03-12', // yesterday relative to mocked today
    isReturnPath: false,
    returnProgressMeters: 0,
    completionShareUnlocked: false,
    ratingPromptEligible: false,
    updatedAt: new Date('2026-03-12'),
    ...overrides,
  };
}

function makeRoute(overrides: Partial<RouteDoc> = {}): RouteDoc {
  return {
    slug: 'everest',
    name: 'Everest Trek',
    version: 1,
    isPublished: true,
    isComingSoon: false,
    totalMeters: 100_000,
    totalStepsCanonical: 130_000,
    totalAltitudeGainMeters: 5_000,
    estimatedDays: 30,
    difficulty: 'challenging',
    regionTag: 'nepal',
    tags: [],
    priceUSD: 9.99,
    isFreeRoute: false,
    shortDescription: 'A trek to Everest',
    longDescription: 'A long trek to Everest base camp and back',
    heroImageKey: 'everest-hero',
    freeContentDeliveryMode: 'bundled',
    premiumContentDeliveryMode: 'download_pack',
    premiumContentPackId: 'pack_1',
    paywallMilestoneId: 'namche-bazaar',
    paywallTriggerMeters: 50_000,
    polylineRef: 'polyline_1',
    bounds: { north: 28, south: 27, east: 87, west: 86 },
    milestoneIds: ['lukla', 'namche-bazaar', 'tengboche', 'base-camp'],
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  } as RouteDoc;
}

function makeMilestone(
  index: number,
  triggerMeters: number,
  overrides: Partial<MilestoneDoc> = {},
): MilestoneDoc {
  return {
    routeId: 'route_1',
    routeVersion: 1,
    index,
    nepaliTitle: `माइलस्टोन ${index}`,
    englishTitle: `Milestone ${index}`,
    titleSlug: `milestone-${index}`,
    triggerMeters,
    triggerSteps: Math.round(triggerMeters * 1.3),
    tier: 'free',
    assetBundleId: `bundle-${index}`,
    unlockOnce: true as const,
    ceremonyType: 'standard',
    elevationMeters: 0,
    facts: [],
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('JourneyProgressionService.applySteps', () => {
  beforeEach(() => {
    mockedGetLocalDateString.mockReturnValue('2026-03-13');
  });

  // ---- 1. Zero delta ----
  it('returns unchanged journey when step delta is zero', () => {
    // Arrange
    const journey = makeJourney({ lastClaimedSourceStepsToday: 500 });
    const route = makeRoute();
    const milestones = [makeMilestone(0, 5_000)];

    // Act — newSourceSteps equals lastClaimedSourceStepsToday → delta = 0
    const { updatedJourney, events } =
      JourneyProgressionService.applySteps(journey, route, milestones, 500);

    // Assert
    expect(updatedJourney).toBe(journey); // same reference
    expect(events).toHaveLength(0);
  });

  // ---- 2. Increases progressMeters correctly ----
  it('increases progressMeters by the correct delta', () => {
    // Arrange
    const journey = makeJourney({ purchaseState: 'premium_unlocked' });
    const route = makeRoute({ totalMeters: 100_000, totalStepsCanonical: 100_000 });
    // No milestones ahead → no checkpoint
    const milestones = [makeMilestone(0, 200_000)]; // far away

    // Act — 1000 steps, 1:1 ratio → 1000 meters
    const { updatedJourney } =
      JourneyProgressionService.applySteps(journey, route, milestones, 1_000);

    // Assert
    expect(updatedJourney.progressMeters).toBe(1_000);
    expect(updatedJourney.totalStepsApplied).toBe(1_000);
    expect(updatedJourney.lastClaimedSourceStepsToday).toBe(1_000);
  });

  // ---- 3. Detects checkpoint arrival ----
  it('emits CHECKPOINT_ARRIVED when progress reaches a milestone', () => {
    // Arrange — premium user so paywall branch is skipped
    const journey = makeJourney({ purchaseState: 'premium_unlocked' });
    const route = makeRoute({ totalMeters: 100_000, totalStepsCanonical: 100_000 });
    const milestones = [makeMilestone(0, 5_000, { titleSlug: 'lukla' })];

    // Act — 6000 steps → 6000 m, exceeds checkpoint at 5000
    const { events } =
      JourneyProgressionService.applySteps(journey, route, milestones, 6_000);

    // Assert
    expect(events).toEqual([
      { type: 'CHECKPOINT_ARRIVED', milestoneId: 'lukla', milestoneIndex: 0 },
    ]);
  });

  // ---- 4. Caps progress at checkpoint triggerMeters ----
  it('caps progressMeters at the checkpoint triggerMeters', () => {
    // Arrange
    const journey = makeJourney({ purchaseState: 'premium_unlocked' });
    const route = makeRoute({ totalMeters: 100_000, totalStepsCanonical: 100_000 });
    const milestones = [makeMilestone(0, 5_000)];

    // Act — 7000 steps → 7000 m, but should cap at 5000
    const { updatedJourney } =
      JourneyProgressionService.applySteps(journey, route, milestones, 7_000);

    // Assert
    expect(updatedJourney.progressMeters).toBe(5_000);
    expect(updatedJourney.journeyState).toBe('PAUSED_AT_CHECKPOINT');
    expect(updatedJourney.pausedAtCheckpoint).toBe(true);
  });

  // ---- 5. Detects paywall for paid routes ----
  it('emits PAYWALL_REACHED for a free user on a paid route', () => {
    // Arrange
    const journey = makeJourney({
      progressMeters: 49_000,
      purchaseState: 'free',
    });
    const route = makeRoute({
      isFreeRoute: false,
      paywallTriggerMeters: 50_000,
      totalMeters: 100_000,
      totalStepsCanonical: 100_000,
    });
    const milestones = [
      makeMilestone(0, 50_000, { titleSlug: 'namche-bazaar' }),
    ];

    // Act — 2000 steps → 2000 m; 49000+2000 = 51000 ≥ 50000
    const { events } =
      JourneyProgressionService.applySteps(journey, route, milestones, 2_000);

    // Assert
    expect(events).toEqual([
      { type: 'PAYWALL_REACHED', milestoneId: 'namche-bazaar' },
    ]);
  });

  // ---- 6. Caps progress at paywallTriggerMeters ----
  it('caps progressMeters at paywallTriggerMeters', () => {
    // Arrange
    const journey = makeJourney({
      progressMeters: 49_000,
      purchaseState: 'free',
    });
    const route = makeRoute({
      isFreeRoute: false,
      paywallTriggerMeters: 50_000,
      totalMeters: 100_000,
      totalStepsCanonical: 100_000,
    });
    const milestones = [
      makeMilestone(0, 50_000, { titleSlug: 'namche-bazaar' }),
    ];

    // Act — 5000 steps → 5000 m; 49000+5000 = 54000 but should cap at 50000
    const { updatedJourney } =
      JourneyProgressionService.applySteps(journey, route, milestones, 5_000);

    // Assert
    expect(updatedJourney.progressMeters).toBe(50_000);
    expect(updatedJourney.journeyState).toBe('PAYWALL_FROZEN');
    expect(updatedJourney.frozenAtPaywall).toBe(true);
    expect(updatedJourney.freezeReason).toBe('paywall');
  });

  // ---- 7. Detects journey completion ----
  it('emits JOURNEY_COMPLETED when progress reaches totalMeters', () => {
    // Arrange — use a free route so paywall branch is skipped
    const journey = makeJourney({
      progressMeters: 99_000,
      purchaseState: 'premium_unlocked',
    });
    const route = makeRoute({
      totalMeters: 100_000,
      totalStepsCanonical: 100_000,
      isFreeRoute: true,
      paywallTriggerMeters: null,
      paywallMilestoneId: null,
      premiumContentPackId: null,
    });
    // All milestones already passed
    const milestones = [makeMilestone(0, 10_000)];

    // Act — 2000 steps → 2000 m; 99000+2000 = 101000 ≥ 100000
    const { updatedJourney, events } =
      JourneyProgressionService.applySteps(journey, route, milestones, 2_000);

    // Assert
    expect(events).toEqual([{ type: 'JOURNEY_COMPLETED' }]);
    expect(updatedJourney.progressMeters).toBe(100_000);
    expect(updatedJourney.journeyState).toBe('COMPLETED');
    expect(updatedJourney.status).toBe('completed');
    expect(updatedJourney.completionShareUnlocked).toBe(true);
    expect(updatedJourney.ratingPromptEligible).toBe(true);
    expect(updatedJourney.completedAt).toBeInstanceOf(Date);
  });

  // ---- 8. Throws InvalidStateError when not WALKING ----
  it('throws InvalidStateError when journeyState is not WALKING', () => {
    // Arrange
    const journey = makeJourney({ journeyState: 'RESTING' });
    const route = makeRoute();
    const milestones = [makeMilestone(0, 5_000)];

    // Act & Assert
    expect(() =>
      JourneyProgressionService.applySteps(journey, route, milestones, 1_000),
    ).toThrow(InvalidStateError);
  });

  // ---- 9. Streak increments on consecutive days ----
  it('increments streakDays on consecutive day', () => {
    // Arrange — lastStepDate is yesterday, mocked today = 2026-03-13
    mockedGetLocalDateString.mockReturnValue('2026-03-13');
    const journey = makeJourney({
      lastStepDate: '2026-03-12',
      streakDays: 5,
      longestStreakDays: 10,
      purchaseState: 'premium_unlocked',
    });
    const route = makeRoute({ totalMeters: 100_000, totalStepsCanonical: 100_000 });
    const milestones = [makeMilestone(0, 200_000)]; // far away

    // Act
    const { updatedJourney } =
      JourneyProgressionService.applySteps(journey, route, milestones, 100);

    // Assert
    expect(updatedJourney.streakDays).toBe(6);
    expect(updatedJourney.longestStreakDays).toBe(10); // unchanged
    expect(updatedJourney.lastStepDate).toBe('2026-03-13');
  });

  // ---- 10. Streak resets after gap ----
  it('resets streakDays to 1 after a multi-day gap', () => {
    // Arrange — lastStepDate 3 days ago
    mockedGetLocalDateString.mockReturnValue('2026-03-13');
    const journey = makeJourney({
      lastStepDate: '2026-03-10', // 3 days gap
      streakDays: 7,
      longestStreakDays: 7,
      purchaseState: 'premium_unlocked',
    });
    const route = makeRoute({ totalMeters: 100_000, totalStepsCanonical: 100_000 });
    const milestones = [makeMilestone(0, 200_000)]; // far away

    // Act
    const { updatedJourney } =
      JourneyProgressionService.applySteps(journey, route, milestones, 100);

    // Assert
    expect(updatedJourney.streakDays).toBe(1);
    expect(updatedJourney.longestStreakDays).toBe(7); // preserved
    expect(updatedJourney.lastStepDate).toBe('2026-03-13');
  });
});
