/**
 * Everest route seed data for Firestore.
 *
 * This file inlines the essential data from:
 *   - src/shared/dev/demo-journey.ts  (DEMO_ROUTE, DEMO_MILESTONES)
 *   - src/shared/data/pemba-dialogue.ts (PEMBA_CHARACTER)
 *
 * Kept inside functions/src/ so the Cloud Function can import it without
 * pulling in client-side dependencies.
 */

// ─────────────────────────────────────────────
// Route
// ─────────────────────────────────────────────

export function buildRouteDoc(now: Date) {
  return {
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
}

// ─────────────────────────────────────────────
// Milestones
// ─────────────────────────────────────────────

const TOTAL_METERS = 340000;
const TOTAL_STEPS = 500000;

interface MilestoneRaw {
  index: number;
  slug: string;
  nepali: string;
  english: string;
  trigger: number;
  tier: 'free' | 'premium';
  ceremony: 'standard' | 'paywall' | 'completion';
}

const milestonesRaw: MilestoneRaw[] = [
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

export function buildMilestoneDocs(now: Date) {
  return milestonesRaw.map((m) => ({
    slug: m.slug,
    doc: {
      routeId: 'everest-summit',
      routeVersion: 1,
      index: m.index,
      nepaliTitle: m.nepali,
      englishTitle: m.english,
      titleSlug: m.slug,
      triggerMeters: m.trigger,
      triggerSteps: Math.round((m.trigger / TOTAL_METERS) * TOTAL_STEPS),
      tier: m.tier,
      assetBundleId: `everest-${m.slug}`,
      unlockOnce: true as const,
      badgeId: null,
      ceremonyType: m.ceremony,
      createdAt: now,
      updatedAt: now,
    },
  }));
}

// ─────────────────────────────────────────────
// Pemba Character
// ─────────────────────────────────────────────

export function buildCharacterDoc(now: Date) {
  return {
    routeId: 'everest-summit',
    characterId: 'pemba-dorje-sherpa',
    name: 'Pemba Dorje Sherpa',
    role: 'Guide',
    description: 'Your guide through the Himalayas. Born in Namche Bazaar, summited Everest three times.',
    milestoneDialogue: {
      'lukla': [
        'Welcome to Lukla. The gateway to the Himalayas.',
        'From here, every step takes you higher.',
        'The mountain is patient. So must we be.',
      ],
      'phakding': [
        'Phakding. A good first stop.',
        'The river will guide us to Namche tomorrow.',
        'Rest well. The climb begins in earnest from here.',
      ],
      'namche-bazaar': [
        'Namche Bazaar — the last town before the wild.',
        'My family has lived here for generations.',
        'Take a day to acclimatize. The mountain rewards patience.',
      ],
      'tengboche': [
        'Tengboche Monastery. The monks have blessed this trail for centuries.',
        'From here, you can see Everest for the first time.',
        'Breathe deeply. The air grows thin.',
      ],
      'dingboche': [
        'Dingboche. We are above the treeline now.',
        'The yaks carry what we cannot. Respect them.',
        'Your body is adapting. Trust the process.',
      ],
      'lobuche': [
        'Lobuche. The memorials here honor those who came before.',
        'Every stone tells a story of courage.',
        'We climb not to conquer, but to understand.',
      ],
      'gorak-shep': [
        'Gorak Shep. The last settlement.',
        'Tomorrow, you will stand where dreams become real.',
        'The cold is fierce here. Stay warm, stay focused.',
      ],
      'everest-base-camp': [
        'Base Camp. You have made it to where expeditions begin.',
        'Look up. The summit is closer than you think.',
        'From here, every step is earned twice.',
      ],
      'camp-1': [
        'Camp 1. The Khumbu Icefall is behind you.',
        'That is the most dangerous part. You survived it.',
        'The Western Cwm awaits.',
      ],
      'camp-2': [
        'Camp 2. The Western Cwm.',
        'This valley of silence holds its secrets.',
        'Rest here. The Lhotse Face is next.',
      ],
      'camp-3': [
        'Camp 3. The Lhotse Face.',
        'You are higher than almost every mountain on Earth.',
        'Your courage brought you here. Keep it close.',
      ],
      'camp-4-south-col': [
        'The South Col. Camp 4. The Death Zone.',
        'Above 8,000 meters, the body begins to die.',
        'Tonight we rest. Tomorrow, the summit.',
      ],
      'the-summit': [
        'You are standing on top of the world.',
        'Every step you have taken led to this moment.',
        'The mountain welcomed you. Remember this feeling forever.',
      ],
      'base-camp-return': [
        'Back at Base Camp. The descent is its own journey.',
        'You carry the summit in your heart now.',
        'The mountain will always be here. So will this memory.',
      ],
      'lukla-return': [
        'Lukla again. Full circle.',
        'You left as a trekker. You return as someone who has touched the sky.',
        'One more flight, and you are home.',
      ],
      'kathmandu': [
        'Kathmandu. You have completed the journey.',
        'From Lukla to the summit and back. Every step was yours.',
        'The mountain thanks you. And so do I. Namaste.',
      ],
    },
    keepWalkingLines: [
      'The trail is calling. One more push today.',
      'Good. The mountain respects those who keep moving.',
      'Your legs are strong. Trust them.',
      'A little further. The next checkpoint is waiting.',
    ],
    restLines: [
      'Rest well. The mountain will be here tomorrow.',
      'A wise trekker knows when to pause.',
      'Sleep deeply. Tomorrow we climb again.',
      'The stars over the Himalayas are watching over you tonight.',
    ],
    notifications: [
      { trigger: 'idle_1day', copy: 'The trail misses your footsteps. Even a short walk counts.' },
      { trigger: 'idle_3days', copy: 'Three days without walking. The mountain is patient, but the path grows cold.' },
      { trigger: 'idle_7days', copy: 'A week has passed. Pemba is waiting at your last checkpoint. Shall we continue?' },
      { trigger: 'streak_milestone', copy: 'You have walked every day this week. The mountain notices your dedication.' },
      { trigger: 'morning_nudge', copy: 'Good morning. The Himalayas are waiting. Open Paila and take your steps.' },
    ],
    createdAt: now,
    updatedAt: now,
  };
}

// ─────────────────────────────────────────────
// Asset Bundles (placeholder)
// ─────────────────────────────────────────────

const milestoneStoryLines: Record<string, string[]> = {
  'lukla': ['The tiny airstrip clings to the mountainside. Your journey begins.'],
  'phakding': ['The trail follows the Dudh Kosi river through pine forests.'],
  'namche-bazaar': ['The Sherpa capital buzzes with trekkers and traders from all over the world.'],
  'tengboche': ['The monastery bells echo across the valley as Everest reveals itself.'],
  'dingboche': ['Stone walls divide the barren fields. The treeline is far below.'],
  'lobuche': ['Memorial cairns dot the ridge — a reminder of the mountain\'s toll.'],
  'gorak-shep': ['The frozen lakebed sits at the foot of Kala Patthar.'],
  'everest-base-camp': ['Colorful tents sprawl across the Khumbu Glacier. The air crackles with ambition.'],
  'camp-1': ['The Khumbu Icefall groans and shifts beneath your feet.'],
  'camp-2': ['The Western Cwm stretches wide and silent under the midday sun.'],
  'camp-3': ['Fixed ropes snake up the blue ice of the Lhotse Face.'],
  'camp-4-south-col': ['Wind screams across the South Col. Every breath is a battle.'],
  'the-summit': ['The world falls away in every direction. You are on top of the Earth.'],
  'base-camp-return': ['The descent carries you back through familiar camps, lighter now.'],
  'lukla-return': ['The sounds of Lukla feel impossibly warm after the silence above.'],
  'kathmandu': ['The streets of Kathmandu embrace you. The journey is complete.'],
};

export function buildAssetBundleDocs(now: Date) {
  return milestonesRaw.map((m) => {
    const isFree = m.tier === 'free';
    return {
      id: `everest-${m.slug}`,
      doc: {
        imageAsset: {
          source: (isFree ? 'bundled' : 'content_pack') as 'bundled' | 'content_pack',
          assetPath: `images/everest/${m.slug}.jpg`,
        },
        storyLines: milestoneStoryLines[m.slug] ?? [`You have arrived at ${m.english}.`],
        weatherMode: 'live' as const,
        updatedAt: now,
      },
    };
  });
}
