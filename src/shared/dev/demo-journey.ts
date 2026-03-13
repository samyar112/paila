import type { JourneyDoc, RouteDoc, MilestoneDoc } from '../schemas';

const now = new Date();

export const DEMO_ROUTE: RouteDoc = {
  slug: 'everest-summit',
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
  createdAt: now,
  updatedAt: now,
};

const milestonesRaw: Array<{
  index: number;
  slug: string;
  nepali: string;
  english: string;
  trigger: number;
  tier: 'free' | 'premium';
  ceremony: 'standard' | 'paywall' | 'completion';
}> = [
  { index: 0, slug: 'lukla', nepali: 'लुक्ला', english: 'Lukla', trigger: 0, tier: 'free', ceremony: 'standard' },
  { index: 1, slug: 'phakding', nepali: 'फक्दिङ', english: 'Phakding', trigger: 8000, tier: 'free', ceremony: 'standard' },
  { index: 2, slug: 'namche-bazaar', nepali: 'नाम्चे बजार', english: 'Namche Bazaar', trigger: 19000, tier: 'free', ceremony: 'paywall' },
  { index: 3, slug: 'tengboche', nepali: 'टेङबोचे', english: 'Tengboche Monastery', trigger: 29000, tier: 'premium', ceremony: 'standard' },
  { index: 4, slug: 'dingboche', nepali: 'डिङबोचे', english: 'Dingboche', trigger: 44000, tier: 'premium', ceremony: 'standard' },
  { index: 5, slug: 'lobuche', nepali: 'लोबुचे', english: 'Lobuche', trigger: 55000, tier: 'premium', ceremony: 'standard' },
  { index: 6, slug: 'gorak-shep', nepali: 'गोरक शेप', english: 'Gorak Shep', trigger: 62000, tier: 'premium', ceremony: 'standard' },
  { index: 7, slug: 'everest-base-camp', nepali: 'एभरेष्ट बेस क्याम्प', english: 'Everest Base Camp', trigger: 68000, tier: 'premium', ceremony: 'standard' },
  { index: 8, slug: 'camp-1', nepali: 'क्याम्प १', english: 'Camp 1 - Khumbu Icefall', trigger: 74000, tier: 'premium', ceremony: 'standard' },
  { index: 9, slug: 'camp-2', nepali: 'क्याम्प २', english: 'Camp 2 - Western Cwm', trigger: 81000, tier: 'premium', ceremony: 'standard' },
  { index: 10, slug: 'camp-3', nepali: 'क्याम्प ३', english: 'Camp 3 - Lhotse Face', trigger: 87000, tier: 'premium', ceremony: 'standard' },
  { index: 11, slug: 'camp-4-south-col', nepali: 'क्याम्प ४', english: 'Camp 4 - South Col', trigger: 93000, tier: 'premium', ceremony: 'standard' },
  { index: 12, slug: 'the-summit', nepali: 'शिखर', english: 'The Summit', trigger: 98000, tier: 'premium', ceremony: 'standard' },
  { index: 13, slug: 'base-camp-return', nepali: 'बेस क्याम्प फिर्ता', english: 'Back to Base Camp', trigger: 128000, tier: 'premium', ceremony: 'standard' },
  { index: 14, slug: 'lukla-return', nepali: 'लुक्ला फिर्ता', english: 'Lukla', trigger: 190000, tier: 'premium', ceremony: 'standard' },
  { index: 15, slug: 'kathmandu', nepali: 'काठमाडौं', english: 'Kathmandu', trigger: 340000, tier: 'premium', ceremony: 'completion' },
];

export const DEMO_MILESTONES: MilestoneDoc[] = milestonesRaw.map((m) => ({
  routeId: 'everest-summit',
  routeVersion: 1,
  index: m.index,
  nepaliTitle: m.nepali,
  englishTitle: m.english,
  titleSlug: m.slug,
  triggerMeters: m.trigger,
  triggerSteps: Math.round((m.trigger / 340000) * 500000),
  tier: m.tier,
  assetBundleId: `everest-${m.slug}`,
  unlockOnce: true as const,
  badgeId: null,
  ceremonyType: m.ceremony,
  createdAt: now,
  updatedAt: now,
}));

export function makeDemoJourney(userId: string): JourneyDoc {
  const today = new Date().toISOString().slice(0, 10);
  return {
    userId,
    routeId: 'everest-summit',
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
    completionShareUnlocked: false,
    ratingPromptEligible: false,
    updatedAt: now,
  };
}
