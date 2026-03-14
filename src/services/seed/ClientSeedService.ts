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
  { index: 0, slug: 'lukla', nepaliTitle: 'लुक्ला', englishTitle: 'Lukla', triggerMeters: 0, altitude: 2860, tier: 'free', ceremonyType: 'standard', elevationMeters: 2860, facts: ['Edmund Hillary built this airport in 1964, buying land from local Sherpas — he paid for it with a school for their children.', '460m runway at 12% gradient, ending at a mountain wall on one side and a 600m cliff drop on the other.', 'Renamed Tenzing-Hillary Airport in January 2008, the same month Hillary died at age 88.', 'Most porters loading supplies here are Rai, Tamang, and Magar — not Sherpa. They carry 30-60kg using a namlo headstrap.'] },
  { index: 1, slug: 'phakding', nepaliTitle: 'फक्दिङ', englishTitle: 'Phakding', triggerMeters: 8000, altitude: 2610, tier: 'free', ceremonyType: 'standard', elevationMeters: 2610, facts: ["Dudh Koshi means 'milk river' — glacial meltwater from the Khumbu Glacier turns it white with sediment.", 'The name Phakding derives from a legend about Lama Sangwa Dorje who meditated and flew to this spot.', 'The lower Khumbu valley is Rai territory. The Rai practice Mundhum — an oral scripture tradition older than written text in this region.', 'Teahouse lodges are often run by women while husbands work as guides or porters at higher elevations.'] },
  { index: 2, slug: 'namche-bazaar', nepaliTitle: 'नाम्चे बजार', englishTitle: 'Namche Bazaar', triggerMeters: 19000, altitude: 3440, tier: 'free', ceremonyType: 'paywall', elevationMeters: 3440, facts: ['The Saturday haat has operated for centuries — Tibetan salt came south over the Nangpa La pass, Nepali rice went north.', 'Nangpa La was also the migration route of the Sherpa people 500+ years ago, crossing from Kham in eastern Tibet.', 'You hear Hindi, Nepali, Tibetan, and English on market day. Nepal has 126 ethnic groups — many meet in Namche.', "Nepal's highest police station is here, along with the Sagarmatha National Park headquarters and museum."] },
  { index: 3, slug: 'tengboche', nepaliTitle: 'टेङबोचे', englishTitle: 'Tengboche Monastery', triggerMeters: 29000, altitude: 3867, tier: 'premium', ceremonyType: 'standard', elevationMeters: 3867, facts: ['Founded in 1916 by Lama Gulu. Destroyed by earthquake in 1934, fire in 1989 — rebuilt both times by the community, not the government.', 'Mani Rimdu festival: monks in painted masks dance for three days, depicting the triumph of Buddhism over the ancient Bon religion.', 'Above Tengboche, trees disappear. This is the ecological boundary — the landscape becomes rock, ice, and sky.', 'Many experienced trekkers say the emotional peak of the entire journey is Tengboche, not Base Camp.'] },
  { index: 4, slug: 'dingboche', nepaliTitle: 'डिङबोचे', englishTitle: 'Dingboche', triggerMeters: 44000, altitude: 4410, tier: 'premium', ceremonyType: 'standard', elevationMeters: 4410, facts: ['The highest permanent agricultural settlement in the Khumbu. Potatoes and buckwheat grow behind stone walls built to block the wind.', 'Yaks cannot survive below 3,000m — they overheat. Lowland cattle cannot survive above 4,000m. The crossbreed dzo works in between.', 'At this altitude, water boils at roughly 85°C. Cooking rice takes twice as long.', 'The acclimatization hike to Nagarjun Hill offers views of Lhotse, Ama Dablam, and Island Peak.'] },
  { index: 5, slug: 'lobuche', nepaliTitle: 'लोबुचे', englishTitle: 'Lobuche', triggerMeters: 55000, altitude: 4940, tier: 'premium', ceremonyType: 'standard', elevationMeters: 4940, facts: ['Thukla Pass memorials — stone cairns honor climbers and Sherpas who died on Everest and surrounding peaks.', 'Over 300 people have died on Everest since 1922. The majority are Nepali.', 'Oxygen levels here are roughly 55% of sea level. No one lives here permanently.', 'Scott Fischer (1996) and Babu Chiri Sherpa (10 summits, died 2001) are both memorialized at Thukla.'] },
  { index: 6, slug: 'gorak-shep', nepaliTitle: 'गोरक शेप', englishTitle: 'Gorak Shep', triggerMeters: 62000, altitude: 5164, tier: 'premium', ceremonyType: 'standard', elevationMeters: 5164, facts: ["The name means 'dead crow' in Sherpa — even birds struggle at this altitude.", 'A frozen lakebed covered in sand. The 1952 Swiss expedition used this as their base camp.', "Kala Patthar nearby offers the best view of Everest's summit. Base Camp itself cannot see the peak."] },
  { index: 7, slug: 'everest-base-camp', nepaliTitle: 'एभरेष्ट बेस क्याम्प', englishTitle: 'Everest Base Camp', triggerMeters: 68000, altitude: 5364, tier: 'premium', ceremonyType: 'standard', elevationMeters: 5364, facts: ['Before every expedition, a Puja ceremony is held — a lama builds a stone altar, juniper branches are burned, and offerings are made to Chomolungma.', 'Sherpas call it Chomolungma — Mother Goddess of the World. The government calls it Sagarmatha — Forehead of the Sky. Three names, three cultures.', 'During climbing season, a tent city of 1,000+ people forms here at the foot of the Khumbu Icefall.', 'In 1953, Tenzing Norgay left chocolates on the summit as an offering. Hillary left a crucifix. Both left something sacred.'] },
  { index: 8, slug: 'camp-1', nepaliTitle: 'क्याम्प १', englishTitle: 'Camp 1 - Khumbu Icefall', triggerMeters: 74000, altitude: 5943, tier: 'premium', ceremonyType: 'standard', elevationMeters: 5943, facts: ['The Khumbu Icefall shifts roughly 1 meter per day. Crevasses open and close without warning.', 'Icefall Doctors — an elite Sherpa team — fix the route each season with aluminum ladders and ropes. First on the glacier, last off.', 'Most Everest deaths since 2000 have occurred in or near the Icefall. Climbers cross before dawn when ice is most stable.'] },
  { index: 9, slug: 'camp-2', nepaliTitle: 'क्याम्प २', englishTitle: 'Camp 2 - Western Cwm', triggerMeters: 81000, altitude: 6400, tier: 'premium', ceremonyType: 'standard', elevationMeters: 6400, facts: ["'Cwm' is Welsh for valley, named by George Mallory in 1921. Also called the Valley of Silence.", 'Temperature swings of 50°C in a single day — minus 20 before dawn, plus 35 in the afternoon from reflected radiation.', 'From Camp 2, climbers see the upper slopes of Everest for the first time since Base Camp.'] },
  { index: 10, slug: 'camp-3', nepaliTitle: 'क्याम्प ३', englishTitle: 'Camp 3 - Lhotse Face', triggerMeters: 87000, altitude: 7162, tier: 'premium', ceremonyType: 'standard', elevationMeters: 7162, facts: ['Tents pitched on the Lhotse Face — a 50-degree ice wall anchored by ice screws.', 'The Yellow Band here contains fossilized sea creatures from the Tethys Sea, 450 million years old. The summit is made of ocean floor.', 'One of the most exposed camps on any mountain on Earth.'] },
  { index: 11, slug: 'camp-4-south-col', nepaliTitle: 'क्याम्प ४', englishTitle: 'Camp 4 - South Col', triggerMeters: 93000, altitude: 7920, tier: 'premium', ceremonyType: 'standard', elevationMeters: 7920, facts: ['The Death Zone. Above 8,000m, cells deteriorate faster than they regenerate. The brain loses function.', 'Winds can exceed 160 km/h. Summit bids start at 9-11 PM — climbers ascend through the night.', 'Every breath delivers roughly one-third the oxygen of sea level.'] },
  { index: 12, slug: 'the-summit', nepaliTitle: 'शिखर', englishTitle: 'The Summit', triggerMeters: 98000, altitude: 8849, tier: 'premium', ceremonyType: 'standard', elevationMeters: 8849, facts: ['The summit is roughly the size of two ping-pong tables. Room for maybe five or six people.', 'Kami Rita Sherpa holds the record — 30 summits as of 2024. He has spent more time above 8,000m than almost anyone alive.', 'Most climbers spend 15-20 minutes on top. Longer risks death. The descent is more dangerous than the ascent.', 'Tenzing Norgay and Edmund Hillary reached the top on May 29, 1953. Neither claimed to be first — they said they reached it together.'] },
  { index: 13, slug: 'base-camp-return', nepaliTitle: 'बेस क्याम्प फिर्ता', englishTitle: 'Back to Base Camp', triggerMeters: 128000, altitude: 5364, tier: 'premium', ceremonyType: 'standard', elevationMeters: 5364, facts: ['The descent typically takes 2-3 days. Most accidents happen going down — exhaustion and complacency are the biggest dangers.', 'Climbers describe a strange emptiness after the summit. The goal is behind you. The mountain is done with you.'] },
  { index: 14, slug: 'lukla-return', nepaliTitle: 'लुक्ला फिर्ता', englishTitle: 'Lukla', triggerMeters: 190000, altitude: 2860, tier: 'premium', ceremonyType: 'standard', elevationMeters: 2860, facts: ['After weeks above 5,000m, the thick lowland air feels intoxicating. Colors are brighter. Smells are stronger.', 'The flight to Kathmandu depends entirely on weather. Delays of days are common. Ke garne — what to do.'] },
  { index: 15, slug: 'kathmandu', nepaliTitle: 'काठमाडौं', englishTitle: 'Kathmandu', triggerMeters: 340000, altitude: 1400, tier: 'premium', ceremonyType: 'completion', elevationMeters: 1400, facts: ['The valley was a lake until roughly 10,000 years ago. The bodhisattva Manjushri cut Chobar Gorge with his sword to drain it. Geologists confirm the paleolake.', 'Seven UNESCO World Heritage Sites in one valley. Newar civilization built Durbar Square over 1,500 years ago.', 'Boudhanath Stupa — one of the largest in the world. Tibetan refugees rebuilt their community around it after 1959.', "Dashain, Nepal's biggest festival, empties the cities. Millions travel home to receive tika from elders."] },
];

const returnMilestones: MilestoneSeed[] = [
  { index: 100, slug: 'namche-return', nepaliTitle: 'नाम्चे फिर्ता', englishTitle: 'Namche Bazaar (Return)', triggerMeters: 5000, altitude: 3440, tier: 'free', ceremonyType: 'standard', elevationMeters: 3440, facts: ['Leaving the trading capital. The steep descent back toward the river begins.', 'You hear the Dudh Koshi before you see it.'] },
  { index: 101, slug: 'phakding-return', nepaliTitle: 'फक्दिङ फिर्ता', englishTitle: 'Phakding (Return)', triggerMeters: 12000, altitude: 2610, tier: 'free', ceremonyType: 'standard', elevationMeters: 2610, facts: ['The river valley feels warmer, greener. After the high altitude, the thick air fills your lungs like a gift.'] },
  { index: 102, slug: 'lukla-return-free', nepaliTitle: 'लुक्ला फिर्ता', englishTitle: 'Lukla (Return)', triggerMeters: 16000, altitude: 2860, tier: 'free', ceremonyType: 'standard', elevationMeters: 2860, facts: ['The circle is nearly complete. The runway that terrified you on arrival now feels like an old friend.', 'One more flight home.'] },
  { index: 103, slug: 'kathmandu-return', nepaliTitle: 'काठमाडौं फिर्ता', englishTitle: 'Kathmandu (Return)', triggerMeters: 19000, altitude: 1400, tier: 'free', ceremonyType: 'completion', elevationMeters: 1400, facts: ['Home. The valley that was once a lake. The city of 126 languages.', 'The journey was shorter, but no less real.'] },
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
