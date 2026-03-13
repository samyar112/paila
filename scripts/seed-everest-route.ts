/**
 * Seed script: Everest Summit & Return route + milestones
 *
 * Populates the dev Firestore with the RouteDoc and all MilestoneDoc entries
 * for the Everest Summit & Return route.
 *
 * Run with:
 *   GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json npx ts-node scripts/seed-everest-route.ts
 */

import * as admin from 'firebase-admin';

// ---------------------------------------------------------------------------
// Initialize Firebase Admin (uses GOOGLE_APPLICATION_CREDENTIALS env var)
// ---------------------------------------------------------------------------
admin.initializeApp();
const db = admin.firestore();

// ---------------------------------------------------------------------------
// Milestone seed data
// ---------------------------------------------------------------------------
interface MilestoneSeed {
  index: number;
  slug: string;
  nepaliTitle: string;
  englishTitle: string;
  triggerMeters: number;
  altitude: number;
  tier: 'free' | 'premium';
  ceremonyType: 'standard' | 'paywall' | 'completion';
}

const TOTAL_METERS = 340000;
const TOTAL_STEPS_CANONICAL = 500000;

const milestones: MilestoneSeed[] = [
  { index: 0,  slug: 'lukla',             nepaliTitle: 'लुक्ला',              englishTitle: 'Lukla',                    triggerMeters: 0,      altitude: 2860, tier: 'free',    ceremonyType: 'standard'   },
  { index: 1,  slug: 'phakding',          nepaliTitle: 'फक्दिङ',             englishTitle: 'Phakding',                 triggerMeters: 8000,   altitude: 2610, tier: 'free',    ceremonyType: 'standard'   },
  { index: 2,  slug: 'namche-bazaar',     nepaliTitle: 'नाम्चे बजार',        englishTitle: 'Namche Bazaar',            triggerMeters: 19000,  altitude: 3440, tier: 'free',    ceremonyType: 'paywall'    },
  { index: 3,  slug: 'tengboche',         nepaliTitle: 'टेङबोचे',            englishTitle: 'Tengboche Monastery',      triggerMeters: 29000,  altitude: 3867, tier: 'premium', ceremonyType: 'standard'   },
  { index: 4,  slug: 'dingboche',         nepaliTitle: 'डिङबोचे',            englishTitle: 'Dingboche',                triggerMeters: 44000,  altitude: 4410, tier: 'premium', ceremonyType: 'standard'   },
  { index: 5,  slug: 'lobuche',           nepaliTitle: 'लोबुचे',             englishTitle: 'Lobuche',                  triggerMeters: 55000,  altitude: 4940, tier: 'premium', ceremonyType: 'standard'   },
  { index: 6,  slug: 'gorak-shep',        nepaliTitle: 'गोरक शेप',           englishTitle: 'Gorak Shep',               triggerMeters: 62000,  altitude: 5164, tier: 'premium', ceremonyType: 'standard'   },
  { index: 7,  slug: 'everest-base-camp', nepaliTitle: 'एभरेष्ट बेस क्याम्प', englishTitle: 'Everest Base Camp',        triggerMeters: 68000,  altitude: 5364, tier: 'premium', ceremonyType: 'standard'   },
  { index: 8,  slug: 'camp-1',            nepaliTitle: 'क्याम्प १',           englishTitle: 'Camp 1 - Khumbu Icefall',  triggerMeters: 74000,  altitude: 5943, tier: 'premium', ceremonyType: 'standard'   },
  { index: 9,  slug: 'camp-2',            nepaliTitle: 'क्याम्प २',           englishTitle: 'Camp 2 - Western Cwm',     triggerMeters: 81000,  altitude: 6400, tier: 'premium', ceremonyType: 'standard'   },
  { index: 10, slug: 'camp-3',            nepaliTitle: 'क्याम्प ३',           englishTitle: 'Camp 3 - Lhotse Face',     triggerMeters: 87000,  altitude: 7162, tier: 'premium', ceremonyType: 'standard'   },
  { index: 11, slug: 'camp-4-south-col',  nepaliTitle: 'क्याम्प ४',           englishTitle: 'Camp 4 - South Col',       triggerMeters: 93000,  altitude: 7920, tier: 'premium', ceremonyType: 'standard'   },
  { index: 12, slug: 'the-summit',        nepaliTitle: 'शिखर',               englishTitle: 'The Summit',               triggerMeters: 98000,  altitude: 8849, tier: 'premium', ceremonyType: 'standard'   },
  { index: 13, slug: 'base-camp-return',  nepaliTitle: 'बेस क्याम्प फिर्ता',  englishTitle: 'Back to Base Camp',        triggerMeters: 128000, altitude: 5364, tier: 'premium', ceremonyType: 'standard'   },
  { index: 14, slug: 'lukla-return',      nepaliTitle: 'लुक्ला फिर्ता',       englishTitle: 'Lukla',                    triggerMeters: 190000, altitude: 2860, tier: 'premium', ceremonyType: 'standard'   },
  { index: 15, slug: 'kathmandu',         nepaliTitle: 'काठमाडौं',            englishTitle: 'Kathmandu',                triggerMeters: 340000, altitude: 1400, tier: 'premium', ceremonyType: 'completion' },
];

// ---------------------------------------------------------------------------
// Seed function
// ---------------------------------------------------------------------------
async function seed(): Promise<void> {
  const routeId = 'everest-summit';
  const now = new Date();
  const milestoneSlugs = milestones.map((m) => m.slug);

  // --- Route document ---
  const routeDoc = {
    slug: routeId,
    name: 'Everest Summit & Return',
    version: 1,
    isPublished: true,
    isComingSoon: false,
    totalMeters: TOTAL_METERS,
    totalStepsCanonical: TOTAL_STEPS_CANONICAL,
    totalAltitudeGainMeters: 8849,
    estimatedDays: 120,
    difficulty: 'extreme',
    regionTag: 'himalaya',
    tags: ['everest', 'nepal', 'himalaya', 'summit', 'expedition'],
    priceUSD: 4.99,
    isFreeRoute: false,
    shortDescription:
      'Summit Everest and return to Kathmandu. The ultimate walking journey.',
    longDescription:
      'From the dramatic flight into Lukla to the summit of the world at 8,849 meters and back. 17 milestones through real expedition camps. Your daily steps carry you along the most iconic mountaineering route on Earth.',
    heroImageKey: 'everest-hero',
    freeContentDeliveryMode: 'bundled' as const,
    premiumContentDeliveryMode: 'download_pack' as const,
    premiumContentPackId: 'everest-summit-pack-v1',
    paywallMilestoneId: 'namche-bazaar',
    paywallTriggerMeters: 19000,
    polylineRef: 'routes/everest-summit/polyline',
    bounds: {
      north: 28.0025,
      south: 27.68,
      east: 86.9528,
      west: 86.71,
    },
    milestoneIds: milestoneSlugs,
    createdAt: now,
    updatedAt: now,
  };

  const routeRef = db.doc(`routes/${routeId}`);
  await routeRef.set(routeDoc);
  console.log(`✅ RouteDoc created: routes/${routeId}`);

  // --- Milestone documents ---
  const batch = db.batch();

  for (const m of milestones) {
    const triggerSteps = Math.round(
      (m.triggerMeters / TOTAL_METERS) * TOTAL_STEPS_CANONICAL,
    );

    const milestoneDoc = {
      routeId,
      routeVersion: 1,
      index: m.index,
      nepaliTitle: m.nepaliTitle,
      englishTitle: m.englishTitle,
      titleSlug: m.slug,
      triggerMeters: m.triggerMeters,
      triggerSteps,
      tier: m.tier,
      assetBundleId: `everest-${m.slug}`,
      unlockOnce: true as const,
      badgeId: null,
      ceremonyType: m.ceremonyType,
      createdAt: now,
      updatedAt: now,
    };

    const milestoneRef = db.doc(
      `routes/${routeId}/milestones/${m.slug}`,
    );
    batch.set(milestoneRef, milestoneDoc);
  }

  await batch.commit();
  console.log(
    `✅ ${milestones.length} MilestoneDoc(s) created under routes/${routeId}/milestones/`,
  );

  const totalDocs = 1 + milestones.length;
  console.log(`\n🏔  Seed complete — ${totalDocs} documents written.`);
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------
seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  });
