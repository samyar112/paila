import type { RouteCharacterDoc } from '../schemas';
import { EVEREST_ROUTE_ID } from '../dev/demo-journey';

export const PEMBA_ATTRIBUTION = '— Pemba Dorje Sherpa';

export const PEMBA_CHARACTER: RouteCharacterDoc = {
  routeId: EVEREST_ROUTE_ID,
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
  createdAt: new Date(),
  updatedAt: new Date(),
};
