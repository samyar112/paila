import type { JourneyDoc, RouteDoc, MilestoneDoc } from '../schemas';

export const DEMO_JOURNEY_ID = 'demo-journey-001';
export const EVEREST_ROUTE_ID = 'everest-summit';

const now = new Date();

export const DEMO_ROUTE: RouteDoc = {
  slug: EVEREST_ROUTE_ID,
  name: 'Everest Summit & Return',
  version: 1,
  isPublished: true,
  isComingSoon: false,
  totalMeters: 340000,
  totalStepsCanonical: 500000,
  totalAltitudeGainMeters: 8849,
  estimatedDays: 120,
  difficulty: 'extreme',
  regionTag: 'himalaya',
  tags: ['everest', 'nepal', 'himalaya'],
  priceUSD: 4.99,
  isFreeRoute: false,
  shortDescription: 'Summit Everest and return to Kathmandu.',
  longDescription: 'From the dramatic flight into Lukla to the summit of the world.',
  heroImageKey: 'everest-hero',
  freeContentDeliveryMode: 'bundled' as const,
  premiumContentDeliveryMode: 'download_pack' as const,
  premiumContentPackId: 'everest-summit-pack-v1',
  paywallMilestoneId: 'namche-bazaar',
  paywallTriggerMeters: 19000,
  polylineRef: 'routes/everest-summit/polyline',
  bounds: { north: 28.0025, south: 27.68, east: 86.9528, west: 86.71 },
  milestoneIds: [
    'lukla', 'phakding', 'namche-bazaar', 'tengboche', 'dingboche',
    'lobuche', 'gorak-shep', 'everest-base-camp', 'camp-1', 'camp-2',
    'camp-3', 'camp-4-south-col', 'the-summit', 'base-camp-return',
    'lukla-return', 'kathmandu',
  ],
  returnTotalMeters: 19000,
  returnTotalStepsCanonical: 28000,
  returnMilestoneIds: ['namche-return', 'phakding-return', 'lukla-return-free', 'kathmandu-return'],
  createdAt: now,
  updatedAt: now,
};

const milestonesRaw: Array<{
  index: number;
  slug: string;
  nepali: string;
  english: string;
  trigger: number;
  elevation: number;
  facts: string[];
  tier: 'free' | 'premium';
  ceremony: 'standard' | 'paywall' | 'completion';
}> = [
  { index: 0, slug: 'lukla', nepali: 'लुक्ला', english: 'Lukla', trigger: 0, elevation: 2860, facts: ['Tenzing-Hillary Airport — one of the most dangerous airports in the world.', 'Only 460m runway ending at a cliff edge.', 'Named after the first Everest summiteers.', 'Gateway to the Khumbu region.'], tier: 'free', ceremony: 'standard' },
  { index: 1, slug: 'phakding', nepali: 'फक्दिङ', english: 'Phakding', trigger: 8000, elevation: 2610, facts: ['A small settlement along the Dudh Koshi river.', 'First overnight stop for most trekkers.', "The name means 'the place where a holy lama flew here.'", 'Multiple suspension bridges cross the river here.'], tier: 'free', ceremony: 'standard' },
  { index: 2, slug: 'namche-bazaar', nepali: 'नाम्चे बजार', english: 'Namche Bazaar', trigger: 19000, elevation: 3440, facts: ['The trading capital of the Sherpa people.', 'Saturday market has operated for centuries.', 'Home to the Sagarmatha National Park visitor center.', 'Most trekkers spend an extra day here to acclimatize.'], tier: 'free', ceremony: 'paywall' },
  { index: 3, slug: 'tengboche', nepali: 'टेङबोचे', english: 'Tengboche Monastery', trigger: 29000, elevation: 3867, facts: ['The largest monastery in the Khumbu region.', 'Destroyed by earthquake in 1934, fire in 1989, rebuilt both times.', 'Hosts the annual Mani Rimdu festival.', 'First clear view of Everest from the trail.'], tier: 'premium', ceremony: 'standard' },
  { index: 4, slug: 'dingboche', nepali: 'डिङबोचे', english: 'Dingboche', trigger: 44000, elevation: 4410, facts: ['Above the treeline — yak farming village.', 'The highest cultivated land in the valley.', 'Stone walls protect potato and buckwheat fields from wind.', 'The acclimatization hike to Nagarjun Hill offers views of Lhotse and Ama Dablam.'], tier: 'premium', ceremony: 'standard' },
  { index: 5, slug: 'lobuche', nepali: 'लोबुचे', english: 'Lobuche', trigger: 55000, elevation: 4940, facts: ['Named after Lobuche Peak nearby.', 'The stone memorials honor climbers who died on Everest.', 'Oxygen levels are about 55% of sea level.'], tier: 'premium', ceremony: 'standard' },
  { index: 6, slug: 'gorak-shep', nepali: 'गोरक शेप', english: 'Gorak Shep', trigger: 62000, elevation: 5164, facts: ['The last settlement — a frozen lakebed.', "Name means 'dead crow' in Sherpa.", 'The original 1952 Swiss expedition base camp was here.'], tier: 'premium', ceremony: 'standard' },
  { index: 7, slug: 'everest-base-camp', nepali: 'एभरेष्ट बेस क्याम्प', english: 'Everest Base Camp', trigger: 68000, elevation: 5364, facts: ['Staging ground for summit attempts since 1953.', 'During climbing season, a tent city of 1,000+ people forms.', 'The Khumbu Icefall begins just above — the most dangerous section.'], tier: 'premium', ceremony: 'standard' },
  { index: 8, slug: 'camp-1', nepali: 'क्याम्प १', english: 'Camp 1 - Khumbu Icefall', trigger: 74000, elevation: 5943, facts: ['Above the Khumbu Icefall — ice blocks the size of buildings.', 'Climbers cross aluminum ladders over deep crevasses.', 'The route changes every season as the glacier shifts.'], tier: 'premium', ceremony: 'standard' },
  { index: 9, slug: 'camp-2', nepali: 'क्याम्प २', english: 'Camp 2 - Western Cwm', trigger: 81000, elevation: 6400, facts: ["In the Western Cwm — the 'Valley of Silence.'", 'Temperatures swing from -20°C at night to 35°C in direct sun.', 'Reflected radiation from surrounding walls causes extreme heat.'], tier: 'premium', ceremony: 'standard' },
  { index: 10, slug: 'camp-3', nepali: 'क्याम्प ३', english: 'Camp 3 - Lhotse Face', trigger: 87000, elevation: 7162, facts: ['Carved into the steep Lhotse Face.', 'A 1,125m wall of glacial blue ice.', 'Tents are anchored to ice screws.'], tier: 'premium', ceremony: 'standard' },
  { index: 11, slug: 'camp-4-south-col', nepali: 'क्याम्प ४', english: 'Camp 4 - South Col', trigger: 93000, elevation: 7920, facts: ['The Death Zone begins — above 8,000m the body cannot acclimatize.', 'Winds can exceed 160 km/h.', 'Summit bids launch from here around midnight.'], tier: 'premium', ceremony: 'standard' },
  { index: 12, slug: 'the-summit', nepali: 'शिखर', english: 'The Summit', trigger: 98000, elevation: 8849, facts: ['The highest point on Earth.', 'First reached by Tenzing Norgay and Edmund Hillary on May 29, 1953.', 'The summit is roughly the size of a dining table.', 'You can see the curvature of the Earth.'], tier: 'premium', ceremony: 'standard' },
  { index: 13, slug: 'base-camp-return', nepali: 'बेस क्याम्प फिर्ता', english: 'Back to Base Camp', trigger: 128000, elevation: 5364, facts: ['The descent typically takes 2-3 days.', 'Most accidents happen on the way down.', 'Exhaustion and complacency are the biggest dangers.'], tier: 'premium', ceremony: 'standard' },
  { index: 14, slug: 'lukla-return', nepali: 'लुक्ला फिर्ता', english: 'Lukla', trigger: 190000, elevation: 2860, facts: ['After weeks above 5,000m, the thick air feels intoxicating.', 'The flight back to Kathmandu depends on weather.', 'Delays of days are common.'], tier: 'premium', ceremony: 'standard' },
  { index: 15, slug: 'kathmandu', nepali: 'काठमाडौं', english: 'Kathmandu', trigger: 340000, elevation: 1400, facts: ["Nepal's capital and a UNESCO World Heritage Site.", 'Durbar Square, Boudhanath Stupa, Pashupatinath Temple.', 'The city sits in a valley that was once a lake.'], tier: 'premium', ceremony: 'completion' },
];

const returnMilestonesRaw: Array<{
  index: number;
  slug: string;
  nepali: string;
  english: string;
  trigger: number;
  elevation: number;
  facts: string[];
  tier: 'free' | 'premium';
  ceremony: 'standard' | 'paywall' | 'completion';
}> = [
  { index: 0, slug: 'namche-return', nepali: 'नाम्चे फिर्ता', english: 'Leaving Namche Bazaar', trigger: 0, elevation: 3440, facts: ['Leaving the trading capital.', 'The trail descends steeply back toward the river.'], tier: 'free', ceremony: 'standard' },
  { index: 1, slug: 'phakding-return', nepali: 'फक्दिङ फिर्ता', english: 'Phakding', trigger: 6000, elevation: 2610, facts: ['The river valley feels warmer, greener after the high altitude.'], tier: 'free', ceremony: 'standard' },
  { index: 2, slug: 'lukla-return-free', nepali: 'लुक्ला फिर्ता', english: 'Lukla', trigger: 11000, elevation: 2860, facts: ['The circle is nearly complete.', 'One more flight home.'], tier: 'free', ceremony: 'standard' },
  { index: 3, slug: 'kathmandu-return', nepali: 'काठमाडौं फिर्ता', english: 'Kathmandu', trigger: 19000, elevation: 1400, facts: ['Home. The journey was shorter, but no less real.'], tier: 'free', ceremony: 'completion' },
];

function buildMilestones(
  raw: typeof milestonesRaw,
  totalMeters: number,
  totalSteps: number,
): MilestoneDoc[] {
  return raw.map((m) => ({
    routeId: EVEREST_ROUTE_ID,
    routeVersion: 1,
    index: m.index,
    nepaliTitle: m.nepali,
    englishTitle: m.english,
    titleSlug: m.slug,
    triggerMeters: m.trigger,
    triggerSteps: Math.round((m.trigger / totalMeters) * totalSteps),
    tier: m.tier,
    assetBundleId: `everest-${m.slug}`,
    unlockOnce: true as const,
    badgeId: null,
    ceremonyType: m.ceremony,
    elevationMeters: m.elevation,
    facts: m.facts,
    createdAt: now,
    updatedAt: now,
  }));
}

export const DEMO_MILESTONES: MilestoneDoc[] = buildMilestones(milestonesRaw, 340000, 500000);
export const DEMO_RETURN_MILESTONES: MilestoneDoc[] = buildMilestones(returnMilestonesRaw, 19000, 28000);

export function makeDemoJourney(userId: string): JourneyDoc {
  const today = new Date().toISOString().slice(0, 10);
  return {
    userId,
    routeId: EVEREST_ROUTE_ID,
    routeVersion: 1,
    status: 'active',
    journeyState: 'WALKING',
    startedAt: now,
    completedAt: null,
    totalStepsApplied: 12000,
    progressMeters: 8200,
    progressPercent: 8200 / 340000,
    currentMilestoneIndex: 1,
    currentCheckpointId: null,
    unlockedMilestoneIds: ['lukla', 'phakding'],
    pausedAtCheckpoint: false,
    keepWalkingToday: false,
    keepWalkingExpiresAt: null,
    lastClaimedSourceStepsToday: 0,
    purchaseState: 'premium_unlocked',
    accessTier: 'paid',
    frozenAtPaywall: false,
    freezeReason: null,
    paywallArrivalDate: null,
    acclimatizationDays: 0,
    streakDays: 3,
    longestStreakDays: 3,
    lastStepDate: today,
    isReturnPath: false,
    returnProgressMeters: 0,
    completionShareUnlocked: false,
    ratingPromptEligible: false,
    updatedAt: now,
  };
}
