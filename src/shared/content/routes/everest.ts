import type { RouteContent } from '../types';

const GUIDE_NAME = 'Pemba Dorje Sherpa';

export const EVEREST_CONTENT: RouteContent = {
  routeId: 'everest-summit',
  routeName: 'Everest Summit & Return',
  shortName: 'Everest',

  guide: {
    name: GUIDE_NAME,
    attribution: `— ${GUIDE_NAME}`,
    role: 'Guide',
    characterId: 'pemba-dorje-sherpa',
  },

  onboarding: {
    slides: [
      {
        title: 'Every Step Carries You Somewhere Real',
        subtitle: 'Your daily walking steps trace real trails across Nepal — through 126 ethnic groups, ancient monasteries, and living mountains.',
        imageKey: 'the-summit',
      },
      {
        title: `Meet ${GUIDE_NAME}`,
        subtitle: `Born in Namche Bazaar, raised on dal bhat and mountain air. Pemba walks with you every step — bistarai, bistarai. Slowly, slowly.`,
        imageKey: 'namche-bazaar',
      },
      {
        title: 'Lukla to Chomolungma and Home',
        subtitle: 'From the dramatic flight into Lukla to the summit the Sherpas call Chomolungma — Mother Goddess of the World — and back to Kathmandu. 340 kilometers. Every step is yours.',
        imageKey: 'lukla',
      },
    ],
    countryPicker: {
      title: 'Where are you from?',
      subtitle: 'This helps us personalize your journey.',
      placeholder: 'Search your country',
    },
  },

  intro: {
    routeLabel: 'KATHMANDU → LUKLA',
    guideWelcome: '"Namaste. The mountain has been waiting for you. Bistarai, bistarai — we go slowly, but we go together."',
  },

  paywall: {
    location: 'NAMCHE BAZAAR',
    altitude: '3,440m',
    guideQuote: '"For centuries, Tibetan salt came south over Nangpa La and Nepali rice went north — all through this bazaar. This is the crossroads. Beyond Namche, the trail belongs to those who commit. The mountain is watching."',
    unlockTitle: 'Unlock the Full Trek',
    unlockItems: [
      '13 more milestones to the summit of Chomolungma',
      'Real Puja ceremony at Base Camp',
      `${GUIDE_NAME}'s guidance through the Death Zone`,
      'The summit at 8,849m — made of ancient ocean floor',
      'Return journey home to Kathmandu',
    ],
  },

  quiz: [
    {
      pembaQuestion: '"Before we begin — I need to know you a little. How far do you walk on a typical day?"',
      options: ['Under 3,000 steps', '3,000–7,000', '7,000–12,000', 'Over 12,000'],
      storageKey: 'quiz:walking_habit',
      storageValues: ['under_3k', '3k_7k', '7k_12k', 'over_12k'],
      pembaResponse: '"Good. On the trail, trekkers walk 10–15 kilometers a day. But at altitude, every step feels like three. The Rai and Tamang porters carry 60 kilos on a namlo headstrap and still walk faster than us. Respect."',
      fact: 'At Base Camp (5,364m), the air has only 50% of the oxygen at sea level. Most porters on the trail are Rai, Tamang, and Magar — not Sherpa.',
    },
    {
      pembaQuestion: '"Chomolungma does not care about speed. Only consistency. What keeps you walking?"',
      options: ['Staying healthy', 'Clearing my mind', 'Exploring new places', 'Challenge myself'],
      storageKey: 'quiz:motivation',
      storageValues: ['health', 'mental_clarity', 'exploration', 'challenge'],
      pembaResponse: '"We have a saying — bistarai, bistarai. Slowly, slowly. My ancestors crossed the Nangpa La pass from Tibet over 500 years ago, one step at a time. That is how everything worth doing gets done."',
      fact: 'The Sherpa people migrated from Kham (eastern Tibet) across the Nangpa La pass (5,716m) over 500 years ago. Nepal has 126 recognized ethnic groups.',
    },
    {
      pembaQuestion: '"I have guided hundreds of trekkers to Base Camp. The ones who make it share one thing. When the trail gets hard, what do you do?"',
      options: ['Push through', 'Take a break, then continue', 'Ask for help', 'One step at a time'],
      storageKey: 'quiz:resilience',
      storageValues: ['push_through', 'rest_continue', 'ask_help', 'one_step'],
      pembaResponse: '"There is no wrong answer. On Chomolungma, all of those work on different days. Ke garne — what to do? You adapt. The Magar soldiers, the Newar traders, the Sherpa climbers — all survived by adapting."',
      fact: 'In 1953, Tenzing Norgay left chocolates on the summit as an offering to the mountain gods. Hillary left a crucifix. Both left something sacred.',
    },
    {
      pembaQuestion: '"Every answer is the right answer. The mountain accepts all who come with respect. Why Chomolungma?"',
      options: ["It's the ultimate challenge", 'I want to see if I can', "I've always dreamed of it", 'Why not?'],
      storageKey: 'quiz:why_everest',
      storageValues: ['challenge', 'test_myself', 'dream', 'why_not'],
      pembaResponse: '"You remind me of someone I guided in 2018. She cried at Tengboche Monastery — not from exhaustion, but from beauty. I think you will understand when we get there. Let us walk."',
      fact: 'Over 6,000 people have summited, but the real journey is 340 km through Rai villages, Sherpa monasteries, Tamang teahouses, and glaciers older than civilization.',
    },
  ],

  checkpoint: {
    guideRestQuote: '"Rest well, friend. The Sherpas say: the mountain will be here tomorrow — but your strength must be also."',
  },

  returnPath: {
    guideQuote: '"Chomolungma does not judge those who turn back. She judges those who do not listen to their own hearts. Let us walk home together. Bistarai, bistarai."',
    description: 'Walk the free return path from Namche Bazaar back to Kathmandu. 19 kilometers, 4 milestones.',
  },
};
