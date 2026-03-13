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

  checkpoint: {
    guideRestQuote: '"Rest well. The mountain will be here tomorrow."',
  },

  returnPath: {
    guideQuote: '"The mountain will always be here. Let us walk home together."',
    description: 'Walk the free return path from Namche Bazaar back to Kathmandu. 19 kilometers, 4 milestones.',
  },
};
