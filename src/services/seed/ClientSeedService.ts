import firestore from '@react-native-firebase/firestore';
import { COLLECTIONS } from '../../shared/paths';

const ROUTE_ID = 'everest-summit';
const TOTAL_METERS = 340_000;
const TOTAL_STEPS_CANONICAL = 500_000;

interface MilestoneSeed {
  index: number;
  slug: string;
  nepaliTitle: string;
  englishTitle: string;
  triggerMeters: number;
  altitude: number;
  tier: 'free' | 'premium';
  ceremonyType: 'standard' | 'paywall' | 'completion';
  elevationMeters: number;
  facts: string[];
}

const milestones: MilestoneSeed[] = [
  { index: 0, slug: 'lukla', nepaliTitle: 'लुक्ला', englishTitle: 'Lukla', triggerMeters: 0, altitude: 2860, tier: 'free', ceremonyType: 'standard', elevationMeters: 2860, facts: ['Tenzing-Hillary Airport — one of the most dangerous airports in the world.', 'Only 460m runway ending at a cliff edge.', 'Named after the first Everest summiteers.', 'Gateway to the Khumbu region.'] },
  { index: 1, slug: 'phakding', nepaliTitle: 'फक्दिङ', englishTitle: 'Phakding', triggerMeters: 8000, altitude: 2610, tier: 'free', ceremonyType: 'standard', elevationMeters: 2610, facts: ['A small settlement along the Dudh Koshi river.', 'First overnight stop for most trekkers.', "The name means 'the place where a holy lama flew here.'", 'Multiple suspension bridges cross the river here.'] },
  { index: 2, slug: 'namche-bazaar', nepaliTitle: 'नाम्चे बजार', englishTitle: 'Namche Bazaar', triggerMeters: 19000, altitude: 3440, tier: 'free', ceremonyType: 'paywall', elevationMeters: 3440, facts: ['The trading capital of the Sherpa people.', 'Saturday market has operated for centuries.', 'Home to the Sagarmatha National Park visitor center.', 'Most trekkers spend an extra day here to acclimatize.'] },
  { index: 3, slug: 'tengboche', nepaliTitle: 'टेङबोचे', englishTitle: 'Tengboche Monastery', triggerMeters: 29000, altitude: 3867, tier: 'premium', ceremonyType: 'standard', elevationMeters: 3867, facts: ['The largest monastery in the Khumbu region.', 'Destroyed by earthquake in 1934, fire in 1989, rebuilt both times.', 'Hosts the annual Mani Rimdu festival.', 'First clear view of Everest from the trail.'] },
  { index: 4, slug: 'dingboche', nepaliTitle: 'डिङबोचे', englishTitle: 'Dingboche', triggerMeters: 44000, altitude: 4410, tier: 'premium', ceremonyType: 'standard', elevationMeters: 4410, facts: ['Above the treeline — yak farming village.', 'The highest cultivated land in the valley.', 'Stone walls protect potato and buckwheat fields from wind.', 'The acclimatization hike to Nagarjun Hill offers views of Lhotse and Ama Dablam.'] },
  { index: 5, slug: 'lobuche', nepaliTitle: 'लोबुचे', englishTitle: 'Lobuche', triggerMeters: 55000, altitude: 4940, tier: 'premium', ceremonyType: 'standard', elevationMeters: 4940, facts: ['Named after Lobuche Peak nearby.', 'The stone memorials honor climbers who died on Everest.', 'Oxygen levels are about 55% of sea level.'] },
  { index: 6, slug: 'gorak-shep', nepaliTitle: 'गोरक शेप', englishTitle: 'Gorak Shep', triggerMeters: 62000, altitude: 5164, tier: 'premium', ceremonyType: 'standard', elevationMeters: 5164, facts: ["The last settlement — a frozen lakebed.", "Name means 'dead crow' in Sherpa.", 'The original 1952 Swiss expedition base camp was here.'] },
  { index: 7, slug: 'everest-base-camp', nepaliTitle: 'एभरेष्ट बेस क्याम्प', englishTitle: 'Everest Base Camp', triggerMeters: 68000, altitude: 5364, tier: 'premium', ceremonyType: 'standard', elevationMeters: 5364, facts: ['Staging ground for summit attempts since 1953.', 'During climbing season, a tent city of 1,000+ people forms.', 'The Khumbu Icefall begins just above — the most dangerous section.'] },
  { index: 8, slug: 'camp-1', nepaliTitle: 'क्याम्प १', englishTitle: 'Camp 1 - Khumbu Icefall', triggerMeters: 74000, altitude: 5943, tier: 'premium', ceremonyType: 'standard', elevationMeters: 5943, facts: ['Above the Khumbu Icefall — ice blocks the size of buildings.', 'Climbers cross aluminum ladders over deep crevasses.', 'The route changes every season as the glacier shifts.'] },
  { index: 9, slug: 'camp-2', nepaliTitle: 'क्याम्प २', englishTitle: 'Camp 2 - Western Cwm', triggerMeters: 81000, altitude: 6400, tier: 'premium', ceremonyType: 'standard', elevationMeters: 6400, facts: ["In the Western Cwm — the 'Valley of Silence.'", 'Temperatures swing from -20C at night to 35C in direct sun.', 'Reflected radiation from surrounding walls causes extreme heat.'] },
  { index: 10, slug: 'camp-3', nepaliTitle: 'क्याम्प ३', englishTitle: 'Camp 3 - Lhotse Face', triggerMeters: 87000, altitude: 7162, tier: 'premium', ceremonyType: 'standard', elevationMeters: 7162, facts: ['Carved into the steep Lhotse Face.', 'A 1,125m wall of glacial blue ice.', 'Tents are anchored to ice screws.'] },
  { index: 11, slug: 'camp-4-south-col', nepaliTitle: 'क्याम्प ४', englishTitle: 'Camp 4 - South Col', triggerMeters: 93000, altitude: 7920, tier: 'premium', ceremonyType: 'standard', elevationMeters: 7920, facts: ["The Death Zone begins — above 8,000m the body cannot acclimatize.", 'Winds can exceed 160 km/h.', 'Summit bids launch from here around midnight.'] },
  { index: 12, slug: 'the-summit', nepaliTitle: 'शिखर', englishTitle: 'The Summit', triggerMeters: 98000, altitude: 8849, tier: 'premium', ceremonyType: 'standard', elevationMeters: 8849, facts: ['The highest point on Earth.', 'First reached by Tenzing Norgay and Edmund Hillary on May 29, 1953.', 'The summit is roughly the size of a dining table.', 'You can see the curvature of the Earth.'] },
  { index: 13, slug: 'base-camp-return', nepaliTitle: 'बेस क्याम्प फिर्ता', englishTitle: 'Back to Base Camp', triggerMeters: 128000, altitude: 5364, tier: 'premium', ceremonyType: 'standard', elevationMeters: 5364, facts: ['The descent typically takes 2-3 days.', 'Most accidents happen on the way down.', 'Exhaustion and complacency are the biggest dangers.'] },
  { index: 14, slug: 'lukla-return', nepaliTitle: 'लुक्ला फिर्ता', englishTitle: 'Lukla', triggerMeters: 190000, altitude: 2860, tier: 'premium', ceremonyType: 'standard', elevationMeters: 2860, facts: ['After weeks above 5,000m, the thick air feels intoxicating.', 'The flight back to Kathmandu depends on weather.', 'Delays of days are common.'] },
  { index: 15, slug: 'kathmandu', nepaliTitle: 'काठमाडौं', englishTitle: 'Kathmandu', triggerMeters: 340000, altitude: 1400, tier: 'premium', ceremonyType: 'completion', elevationMeters: 1400, facts: ["Nepal's capital and a UNESCO World Heritage Site.", 'Durbar Square, Boudhanath Stupa, Pashupatinath Temple.', 'The city sits in a valley that was once a lake.'] },
];

const returnMilestones: MilestoneSeed[] = [
  { index: 100, slug: 'namche-return', nepaliTitle: 'नाम्चे फिर्ता', englishTitle: 'Namche Bazaar (Return)', triggerMeters: 5000, altitude: 3440, tier: 'free', ceremonyType: 'standard', elevationMeters: 3440, facts: ['Leaving the trading capital.', 'The trail descends steeply back toward the river.'] },
  { index: 101, slug: 'phakding-return', nepaliTitle: 'फक्दिङ फिर्ता', englishTitle: 'Phakding (Return)', triggerMeters: 12000, altitude: 2610, tier: 'free', ceremonyType: 'standard', elevationMeters: 2610, facts: ['The river valley feels warmer, greener after the high altitude.'] },
  { index: 102, slug: 'lukla-return-free', nepaliTitle: 'लुक्ला फिर्ता', englishTitle: 'Lukla (Return)', triggerMeters: 16000, altitude: 2860, tier: 'free', ceremonyType: 'standard', elevationMeters: 2860, facts: ['The circle is nearly complete.', 'One more flight home.'] },
  { index: 103, slug: 'kathmandu-return', nepaliTitle: 'काठमाडौं फिर्ता', englishTitle: 'Kathmandu (Return)', triggerMeters: 19000, altitude: 1400, tier: 'free', ceremonyType: 'completion', elevationMeters: 1400, facts: ['Home. The journey was shorter, but no less real.'] },
];

export class ClientSeedService {
  static async seedRouteIfNeeded(): Promise<boolean> {
    const db = firestore();
    const routeRef = db.collection(COLLECTIONS.routes).doc(ROUTE_ID);
    const snap = await routeRef.get();

    const exists = typeof snap.exists === 'function' ? snap.exists() : snap.exists;
    if (exists) return false;

    const now = new Date();
    const milestoneSlugs = milestones.map((m) => m.slug);

    await routeRef.set({
      slug: ROUTE_ID,
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
      shortDescription: 'Summit Everest and return to Kathmandu.',
      longDescription: 'From the dramatic flight into Lukla to the summit at 8,849m and back. 17 milestones through real expedition camps.',
      heroImageKey: 'everest-hero',
      freeContentDeliveryMode: 'bundled',
      premiumContentDeliveryMode: 'download_pack',
      premiumContentPackId: 'everest-summit-pack-v1',
      paywallMilestoneId: 'namche-bazaar',
      paywallTriggerMeters: 19000,
      polylineRef: 'routes/everest-summit/polyline',
      bounds: { north: 28.0025, south: 27.68, east: 86.9528, west: 86.71 },
      milestoneIds: milestoneSlugs,
      returnTotalMeters: 19000,
      returnTotalStepsCanonical: 27941,
      returnMilestoneIds: returnMilestones.map((m) => m.slug),
      createdAt: now,
      updatedAt: now,
    });

    const batch = db.batch();
    const allMilestones = [...milestones, ...returnMilestones];

    for (const m of allMilestones) {
      const triggerSteps = m.index < 100
        ? Math.round((m.triggerMeters / TOTAL_METERS) * TOTAL_STEPS_CANONICAL)
        : Math.round((m.triggerMeters / 19000) * 27941);

      batch.set(
        db.collection(COLLECTIONS.routes).doc(ROUTE_ID).collection(COLLECTIONS.milestones).doc(m.slug),
        {
          routeId: ROUTE_ID,
          routeVersion: 1,
          index: m.index,
          nepaliTitle: m.nepaliTitle,
          englishTitle: m.englishTitle,
          titleSlug: m.slug,
          triggerMeters: m.triggerMeters,
          triggerSteps,
          tier: m.tier,
          assetBundleId: `everest-${m.slug}`,
          unlockOnce: true,
          badgeId: null,
          ceremonyType: m.ceremonyType,
          elevationMeters: m.elevationMeters,
          facts: m.facts,
          createdAt: now,
          updatedAt: now,
        },
      );
    }

    await batch.commit();
    console.log(`[ClientSeed] Seeded route + ${allMilestones.length} milestones`);
    return true;
  }

  static async ensureUserDoc(user: { uid: string; email?: string | null; displayName?: string | null }): Promise<void> {
    const db = firestore();
    const userRef = db.collection(COLLECTIONS.users).doc(user.uid);
    const snap = await userRef.get();

    const exists = typeof snap.exists === 'function' ? snap.exists() : snap.exists;
    if (exists) return;

    const now = new Date();
    await userRef.set({
      authUid: user.uid,
      email: user.email ?? undefined,
      displayName: user.displayName ?? undefined,
      timezone: null,
      countryCode: undefined,
      accessTier: 'standard_free',
      isNepalLocalEligible: false,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`[ClientSeed] Created UserDoc for ${user.uid}`);
  }
}
