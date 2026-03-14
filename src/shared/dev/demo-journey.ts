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
  { index: 0, slug: 'lukla', nepali: 'लुक्ला', english: 'Lukla', trigger: 0, elevation: 2860, facts: ['Edmund Hillary built this airport in 1964, buying land from local Sherpas — he paid for it with a school for their children.', '460m runway at 12% gradient, ending at a mountain wall on one side and a 600m cliff drop on the other.', 'Renamed Tenzing-Hillary Airport in January 2008, the same month Hillary died at age 88.', 'Most porters loading supplies here are Rai, Tamang, and Magar — not Sherpa. They carry 30-60kg using a namlo headstrap.'], tier: 'free', ceremony: 'standard' },
  { index: 1, slug: 'phakding', nepali: 'फक्दिङ', english: 'Phakding', trigger: 8000, elevation: 2610, facts: ["Dudh Koshi means 'milk river' — glacial meltwater from the Khumbu Glacier turns it white with sediment.", 'The name Phakding derives from a legend about Lama Sangwa Dorje who meditated and flew to this spot.', 'The lower Khumbu valley is Rai territory. The Rai practice Mundhum — an oral scripture tradition older than written text in this region.', 'Teahouse lodges are often run by women while husbands work as guides or porters at higher elevations.'], tier: 'free', ceremony: 'standard' },
  { index: 2, slug: 'namche-bazaar', nepali: 'नाम्चे बजार', english: 'Namche Bazaar', trigger: 19000, elevation: 3440, facts: ['The Saturday haat has operated for centuries — Tibetan salt came south over the Nangpa La pass, Nepali rice went north.', 'Nangpa La was also the migration route of the Sherpa people 500+ years ago, crossing from Kham in eastern Tibet.', 'You hear Hindi, Nepali, Tibetan, and English on market day. Nepal has 126 ethnic groups — many meet in Namche.', "Nepal's highest police station is here, along with the Sagarmatha National Park headquarters and museum."], tier: 'free', ceremony: 'paywall' },
  { index: 3, slug: 'tengboche', nepali: 'टेङबोचे', english: 'Tengboche Monastery', trigger: 29000, elevation: 3867, facts: ['Founded in 1916 by Lama Gulu. Destroyed by earthquake in 1934, fire in 1989 — rebuilt both times by the community, not the government.', 'Mani Rimdu festival: monks in painted masks dance for three days, depicting the triumph of Buddhism over the ancient Bon religion.', 'Above Tengboche, trees disappear. This is the ecological boundary — the landscape becomes rock, ice, and sky.', 'Many experienced trekkers say the emotional peak of the entire journey is Tengboche, not Base Camp.'], tier: 'premium', ceremony: 'standard' },
  { index: 4, slug: 'dingboche', nepali: 'डिङबोचे', english: 'Dingboche', trigger: 44000, elevation: 4410, facts: ['The highest permanent agricultural settlement in the Khumbu. Potatoes and buckwheat grow behind stone walls built to block the wind.', 'Yaks cannot survive below 3,000m — they overheat. Lowland cattle cannot survive above 4,000m. The crossbreed dzo works in between.', 'At this altitude, water boils at roughly 85°C. Cooking rice takes twice as long.', 'The acclimatization hike to Nagarjun Hill offers views of Lhotse, Ama Dablam, and Island Peak.'], tier: 'premium', ceremony: 'standard' },
  { index: 5, slug: 'lobuche', nepali: 'लोबुचे', english: 'Lobuche', trigger: 55000, elevation: 4940, facts: ['Thukla Pass memorials — stone cairns honor climbers and Sherpas who died on Everest and surrounding peaks.', 'Over 300 people have died on Everest since 1922. The majority are Nepali.', 'Oxygen levels here are roughly 55% of sea level. No one lives here permanently.', 'Scott Fischer (1996) and Babu Chiri Sherpa (10 summits, died 2001) are both memorialized at Thukla.'], tier: 'premium', ceremony: 'standard' },
  { index: 6, slug: 'gorak-shep', nepali: 'गोरक शेप', english: 'Gorak Shep', trigger: 62000, elevation: 5164, facts: ["The name means 'dead crow' in Sherpa — even birds struggle at this altitude.", 'A frozen lakebed covered in sand. The 1952 Swiss expedition used this as their base camp.', "Kala Patthar nearby offers the best view of Everest's summit. Base Camp itself cannot see the peak."], tier: 'premium', ceremony: 'standard' },
  { index: 7, slug: 'everest-base-camp', nepali: 'एभरेष्ट बेस क्याम्प', english: 'Everest Base Camp', trigger: 68000, elevation: 5364, facts: ['Before every expedition, a Puja ceremony is held — a lama builds a stone altar, juniper branches are burned, and offerings are made to Chomolungma.', 'Sherpas call it Chomolungma — Mother Goddess of the World. The government calls it Sagarmatha — Forehead of the Sky. Three names, three cultures.', 'During climbing season, a tent city of 1,000+ people forms here at the foot of the Khumbu Icefall.', 'In 1953, Tenzing Norgay left chocolates on the summit as an offering. Hillary left a crucifix. Both left something sacred.'], tier: 'premium', ceremony: 'standard' },
  { index: 8, slug: 'camp-1', nepali: 'क्याम्प १', english: 'Camp 1 - Khumbu Icefall', trigger: 74000, elevation: 5943, facts: ['The Khumbu Icefall shifts roughly 1 meter per day. Crevasses open and close without warning.', 'Icefall Doctors — an elite Sherpa team — fix the route each season with aluminum ladders and ropes. First on the glacier, last off.', 'Most Everest deaths since 2000 have occurred in or near the Icefall. Climbers cross before dawn when ice is most stable.'], tier: 'premium', ceremony: 'standard' },
  { index: 9, slug: 'camp-2', nepali: 'क्याम्प २', english: 'Camp 2 - Western Cwm', trigger: 81000, elevation: 6400, facts: ["'Cwm' is Welsh for valley, named by George Mallory in 1921. Also called the Valley of Silence.", 'Temperature swings of 50°C in a single day — minus 20 before dawn, plus 35 in the afternoon from reflected radiation.', 'From Camp 2, climbers see the upper slopes of Everest for the first time since Base Camp.'], tier: 'premium', ceremony: 'standard' },
  { index: 10, slug: 'camp-3', nepali: 'क्याम्प ३', english: 'Camp 3 - Lhotse Face', trigger: 87000, elevation: 7162, facts: ['Tents pitched on the Lhotse Face — a 50-degree ice wall anchored by ice screws.', 'The Yellow Band here contains fossilized sea creatures from the Tethys Sea, 450 million years old. The summit is made of ocean floor.', 'One of the most exposed camps on any mountain on Earth.'], tier: 'premium', ceremony: 'standard' },
  { index: 11, slug: 'camp-4-south-col', nepali: 'क्याम्प ४', english: 'Camp 4 - South Col', trigger: 93000, elevation: 7920, facts: ['The Death Zone. Above 8,000m, cells deteriorate faster than they regenerate. The brain loses function.', 'Winds can exceed 160 km/h. Summit bids start at 9-11 PM — climbers ascend through the night.', 'Every breath delivers roughly one-third the oxygen of sea level.'], tier: 'premium', ceremony: 'standard' },
  { index: 12, slug: 'the-summit', nepali: 'शिखर', english: 'The Summit', trigger: 98000, elevation: 8849, facts: ['The summit is roughly the size of two ping-pong tables. Room for maybe five or six people.', 'Kami Rita Sherpa holds the record — 30 summits as of 2024. He has spent more time above 8,000m than almost anyone alive.', 'Most climbers spend 15-20 minutes on top. Longer risks death. The descent is more dangerous than the ascent.', 'Tenzing Norgay and Edmund Hillary reached the top on May 29, 1953. Neither claimed to be first — they said they reached it together.'], tier: 'premium', ceremony: 'standard' },
  { index: 13, slug: 'base-camp-return', nepali: 'बेस क्याम्प फिर्ता', english: 'Back to Base Camp', trigger: 128000, elevation: 5364, facts: ['The descent typically takes 2-3 days. Most accidents happen going down — exhaustion and complacency are the biggest dangers.', 'Climbers describe a strange emptiness after the summit. The goal is behind you. The mountain is done with you.'], tier: 'premium', ceremony: 'standard' },
  { index: 14, slug: 'lukla-return', nepali: 'लुक्ला फिर्ता', english: 'Lukla', trigger: 190000, elevation: 2860, facts: ['After weeks above 5,000m, the thick lowland air feels intoxicating. Colors are brighter. Smells are stronger.', 'The flight to Kathmandu depends entirely on weather. Delays of days are common. Ke garne — what to do.'], tier: 'premium', ceremony: 'standard' },
  { index: 15, slug: 'kathmandu', nepali: 'काठमाडौं', english: 'Kathmandu', trigger: 340000, elevation: 1400, facts: ['The valley was a lake until roughly 10,000 years ago. The bodhisattva Manjushri cut Chobar Gorge with his sword to drain it. Geologists confirm the paleolake.', 'Seven UNESCO World Heritage Sites in one valley. Newar civilization built Durbar Square over 1,500 years ago.', 'Boudhanath Stupa — one of the largest in the world. Tibetan refugees rebuilt their community around it after 1959.', "Dashain, Nepal's biggest festival, empties the cities. Millions travel home to receive tika from elders."], tier: 'premium', ceremony: 'completion' },
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
  { index: 0, slug: 'namche-return', nepali: 'नाम्चे फिर्ता', english: 'Leaving Namche Bazaar', trigger: 0, elevation: 3440, facts: ['Leaving the trading capital. The steep descent back toward the river begins.', 'You hear the Dudh Koshi before you see it.'], tier: 'free', ceremony: 'standard' },
  { index: 1, slug: 'phakding-return', nepali: 'फक्दिङ फिर्ता', english: 'Phakding', trigger: 6000, elevation: 2610, facts: ['The river valley feels warmer, greener. After the high altitude, the thick air fills your lungs like a gift.'], tier: 'free', ceremony: 'standard' },
  { index: 2, slug: 'lukla-return-free', nepali: 'लुक्ला फिर्ता', english: 'Lukla', trigger: 11000, elevation: 2860, facts: ['The circle is nearly complete. The runway that terrified you on arrival now feels like an old friend.', 'One more flight home.'], tier: 'free', ceremony: 'standard' },
  { index: 3, slug: 'kathmandu-return', nepali: 'काठमाडौं फिर्ता', english: 'Kathmandu', trigger: 19000, elevation: 1400, facts: ['Home. The valley that was once a lake. The city of 126 languages.', 'The journey was shorter, but no less real.'], tier: 'free', ceremony: 'completion' },
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
