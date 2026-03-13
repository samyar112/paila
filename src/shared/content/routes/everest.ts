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
        title: 'Every Step Counts',
        subtitle: 'Your daily walking steps carry you along real trails around the world.',
        imageKey: 'the-summit',
      },
      {
        title: `Meet ${GUIDE_NAME}`,
        subtitle: `Walk at your pace. Rest when you need. ${GUIDE_NAME}, your guide, walks with you every step.`,
        imageKey: 'namche-bazaar',
      },
      {
        title: 'Your Journey Begins',
        subtitle: 'From the dramatic flight into Lukla to the summit of Everest and back to Kathmandu. 340 kilometers. Every step is yours.',
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
    guideWelcome: '"Welcome. The mountain has been waiting for you."',
  },

  paywall: {
    location: 'NAMCHE BAZAAR',
    altitude: '3,440m',
    guideQuote: '"This is where most people decide if the mountain is for them. Beyond Namche, the trail belongs to those who commit."',
    unlockTitle: 'Unlock the Full Trek',
    unlockItems: [
      '13 more milestones to the summit',
      'Real expedition camp ceremonies',
      `${GUIDE_NAME}'s guidance through the Death Zone`,
      'The summit of Everest at 8,849m',
      'Return journey to Kathmandu',
    ],
  },

  quiz: [
    {
      pembaQuestion: '"Before we begin, I need to know something about you. How far do you walk on a typical day?"',
      options: ['Under 3,000 steps', '3,000–7,000', '7,000–12,000', 'Over 12,000'],
      storageKey: 'quiz:walking_habit',
      storageValues: ['under_3k', '3k_7k', '7k_12k', 'over_12k'],
      pembaResponse: '"Good. On the trail to Everest, trekkers walk about 10–15 km a day. But the altitude makes every step feel like three."',
      fact: 'The air at Base Camp has only half the oxygen you are breathing right now.',
    },
    {
      pembaQuestion: '"The mountain doesn\'t care about speed. Only consistency. What keeps you walking?"',
      options: ['Staying healthy', 'Clearing my mind', 'Exploring new places', 'Challenge myself'],
      storageKey: 'quiz:motivation',
      storageValues: ['health', 'mental_clarity', 'exploration', 'challenge'],
      pembaResponse: '"That\'s what the Sherpas believe too. We have a saying: bistarai, bistarai — slowly, slowly."',
      fact: 'The Sherpa people have lived in the Himalayas for over 500 years, originally migrating from Tibet across the Nangpa La pass.',
    },
    {
      pembaQuestion: '"I\'ve taken hundreds of trekkers to Base Camp. The ones who make it all share one thing. When the trail gets hard, what do you do?"',
      options: ['Push through', 'Take a break, then continue', 'Ask for help', 'One step at a time'],
      storageKey: 'quiz:resilience',
      storageValues: ['push_through', 'rest_continue', 'ask_help', 'one_step'],
      pembaResponse: '"There is no wrong answer. On Everest, all of those work on different days."',
      fact: 'In 1953, Tenzing Norgay and Edmund Hillary became the first to reach the summit. Tenzing left chocolates on top as an offering to the gods.',
    },
    {
      pembaQuestion: '"Every answer is the right answer. The mountain accepts all. Why Everest?"',
      options: ["It's the ultimate challenge", 'I want to see if I can', "I've always dreamed of it", 'Why not?'],
      storageKey: 'quiz:why_everest',
      storageValues: ['challenge', 'test_myself', 'dream', 'why_not'],
      pembaResponse: '"You remind me of someone I guided to the summit in 2018. I think you\'ll do well. Let\'s walk."',
      fact: 'Over 6,000 people have summited Everest, but the real journey is the 340 km trek through villages, monasteries, and glaciers to get there.',
    },
  ],

  checkpoint: {
    guideRestQuote: '"Rest well. The mountain will be here tomorrow."',
  },

  returnPath: {
    guideQuote: '"The mountain will always be here. Let us walk home together."',
    description: 'Walk the free return path from Namche Bazaar back to Kathmandu. 19 kilometers, 4 milestones.',
  },
};
