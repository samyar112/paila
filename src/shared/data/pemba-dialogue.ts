import type { RouteCharacterDoc } from '../schemas';
import { EVEREST_ROUTE_ID } from '../dev/demo-journey';
import { EVEREST_CONTENT } from '../content/routes/everest';

export const PEMBA_ATTRIBUTION = EVEREST_CONTENT.guide.attribution;

export const PEMBA_CHARACTER: RouteCharacterDoc = {
  routeId: EVEREST_ROUTE_ID,
  characterId: EVEREST_CONTENT.guide.characterId,
  name: EVEREST_CONTENT.guide.name,
  role: EVEREST_CONTENT.guide.role,
  description: 'Your guide through the Himalayas. Born in Namche Bazaar, summited Chomolungma three times. Knows every stone, every story, every people of Nepal.',
  milestoneDialogue: {
    'lukla': [
      'Welcome to Lukla — Tenzing-Hillary Airport. Hillary bought this land from Sherpas in 1964. He paid with a school. That is the kind of man he was.',
      'You see those porters loading baskets? Most are Rai, Tamang, Magar — not Sherpa. They carry 30, sometimes 60 kilos using a namlo, the headstrap. Nepal has 126 ethnic groups, and many of them walk this trail.',
      'Flights only come in clear mornings. By noon, the clouds swallow the valley. Like Nepal herself — you must catch her in the right moment.',
      'Bistarai, bistarai. Slowly, slowly. The mountain has waited millions of years. It can wait for you.',
    ],
    'phakding': [
      'Phakding — "the place where a holy lama flew here." The name is not a metaphor. The Rai people of lower Khumbu believe their Bijuwa shamans can speak to the spirits of these rivers and forests.',
      'That white water below us? Dudh Koshi — the Milk River. Glacial meltwater turns it white as fresh dudh. It has flowed from Chomolungma since before humans walked here.',
      'This is Rai territory. Their Mundhum — oral scriptures — are older than Buddhism in these mountains. Before the monasteries, there were the river spirits.',
      'See that lodge? A woman runs it. Her husband is guiding above Namche. Teahouse culture is women\'s culture. They feed the entire trail.',
    ],
    'namche-bazaar': [
      'Namche Bazaar. The Saturday haat has run for centuries — Tibetan salt came south over Nangpa La, Nepali rice went north. That same pass, 5,716 meters, is how my Sherpa ancestors migrated from Kham in eastern Tibet over 500 years ago.',
      'Listen — you hear Hindi, Nepali, Tibetan, English, all in one marketplace. Nepal\'s highest police station is here too. Even the law must acclimatize.',
      'My family has traded in this bazaar for generations. When the internet arrived around 2000, my uncle sent the first email from Khumbu. He wrote to his brother in Kathmandu: "The yaks are fine."',
      'Take a day here. Dal bhat power, 24 hour — that is not just a joke, it is survival. The mountain rewards patience, not speed.',
    ],
    'tengboche': [
      'Tengboche Monastery, founded 1916 by Lama Gulu. Destroyed by earthquake in 1934. Destroyed by fire in 1989. Both times, the community rebuilt it — no government, no foreign aid. Just the people.',
      'During Mani Rimdu, monks wear painted masks and dance for three days. It celebrates the triumph of Buddhism over the older Bon spirits. But between us — both still live in these mountains.',
      'Look behind you. That is your first full view of Chomolungma — what the world calls Everest. Many trekkers say this is the emotional peak of the journey. Not Base Camp. Here.',
      'Above this monastery, the trees disappear. This is the ecological boundary. Below — rhododendron forests. Above — only rock, ice, and sky.',
    ],
    'dingboche': [
      'Dingboche — the highest permanent farming settlement in Khumbu. Potatoes and buckwheat behind stone walls, four thousand four hundred meters up. My people have grown food here for centuries.',
      'You know yaks? They cannot survive below 3,000 meters — they overheat. Lowland cattle cannot survive above 4,000. So we crossbreed them — dzo and dzopkyo. Nepal always finds a way.',
      'Water boils at 85 degrees here. Your tea is not as hot as you think. Your lungs are not as full as you wish. Bistarai, bistarai.',
      'Your body is changing — more red blood cells, deeper breathing. Trust the process. The Tamang porters who pass through here have been acclimatizing their whole lives.',
    ],
    'lobuche': [
      'Lobuche. No permanent residents. Just stone, ice, and the memorials at Thukla Pass for those who died on Chomolungma.',
      'Scott Fischer, 1996. Babu Chiri Sherpa — ten summits, died in 2001. Over 300 dead since 1922. Most of them were Nepali. The mountain takes from those who give the most.',
      'The air here is 55 percent oxygen. Your thoughts may slow. Your words may come harder. This is normal. The mountain is not punishing you — it is teaching you to be still.',
      'We climb not to conquer. There is no conquering Chomolungma. We climb to understand how small we are, and how large that makes the world.',
    ],
    'gorak-shep': [
      'Gorak Shep — "dead crow." Even birds struggle at this altitude. The name is honest. Nepal does not sugarcoat her mountains.',
      'This frozen lakebed was the 1952 Swiss expedition\'s base camp. They came so close to the summit. A year later, Tenzing and Hillary finished what the Swiss started.',
      'If you climb Kala Patthar nearby, you will see the best view of Chomolungma. Base Camp itself cannot see the summit — the goddess hides her face from those at her feet.',
      'Tonight the stars will be closer than you have ever seen them. At 5,164 meters, there is less air between you and the universe. Tashi delek — may it be auspicious.',
    ],
    'everest-base-camp': [
      'Base Camp, 5,364 meters. Before any expedition climbs, there is Puja. A lama from Pangboche builds a stone altar. Climbing gear is placed on it. Juniper burns. Rice, beer, sweets, butter lamps — all offered to Chomolungma. No Sherpa climbs without Puja.',
      'Three names for this mountain. Sherpas call her Chomolungma — Mother Goddess of the World. The government says Sagarmatha — सगरमाथा — forehead of the sky. The British named her Everest. Three names, three cultures, one Nepal.',
      'When Tenzing reached the summit in 1953, he left chocolates as an offering. Hillary left a crucifix. Both men left something sacred. Both understood that you do not take from this mountain — you give.',
      'You have walked to where expeditions begin. From here, every step is earned twice — once in will, once in oxygen.',
    ],
    'camp-1': [
      'Camp 1, 5,943 meters. The Khumbu Icefall is behind you — the most dangerous stretch on Chomolungma.',
      'The Icefall Doctors — an elite Sherpa team — fix the route each season with ladders and ropes across the crevasses. They are the first on the glacier and the last off. Most deaths since 2000 have been near the Icefall.',
      'You crossed it. That took courage. Ke garne — what to do? We carry on.',
      'The Western Cwm opens ahead. Named by Mallory in 1921. "Cwm" is Welsh for valley. Even here, languages from across the world meet.',
    ],
    'camp-2': [
      'Camp 2, 6,400 meters. The Valley of Silence. Mallory named this cwm in 1921 — he never returned from his 1924 attempt. The mountain remembers everyone who tried.',
      'Temperature swings here are brutal. Minus 20 before dawn, plus 35 by afternoon — the reflected radiation off the ice and snow creates an oven. Drink water. Then drink more.',
      'This silence is not empty. It is full. Full of the footsteps of every person who has walked here. Sherpa, Rai, Tamang, climbers from sixty countries. All quiet before the Lhotse Face.',
      'Rest, eat, breathe. The Lhotse Face is next — and it does not forgive the unprepared.',
    ],
    'camp-3': [
      'Camp 3, 7,162 meters. The Lhotse Face — a 50-degree ice wall. You are higher than almost every mountain on Earth.',
      'Look at the rock around you. See the Yellow Band? Those are fossilized sea creatures from the Tethys Sea, 450 million years old. The summit of Chomolungma is made of ocean floor. The highest point on Earth was once the bottom of the sea.',
      'Your courage brought you here. Not your lungs, not your legs — your courage. Keep it close.',
      'In Sherpa tradition, we believe the mountain spirits test you hardest just before they accept you. This is that test.',
    ],
    'camp-4-south-col': [
      'The South Col. Camp 4. 7,920 meters. The Death Zone. Above 8,000 meters, your cells die faster than they regenerate. Your brain function degrades. Time becomes strange.',
      'Summit bids start between 9 and 11 at night. You climb through absolute darkness, headlamp on, one step every three breaths. The stars and the headlamps of other climbers are the only lights in the universe.',
      'Kami Rita Sherpa has summited 30 times. Thirty. He does this not for glory. For his family, his community, his people. That is the Nepali way.',
      'Tonight we rest. Tomorrow — if the mountain allows — the summit. Tashi delek.',
    ],
    'the-summit': [
      'You are standing on the summit of Chomolungma. 8,849 meters. The highest point on Earth — and it is made of seashells from an ancient ocean.',
      'The summit is the size of two ping-pong tables. Most climbers spend 15 to 20 minutes. Longer means death. It is the most precious quarter-hour a human being can experience.',
      'Tenzing left chocolates. Hillary left a crucifix. You — you left your footsteps on a trail of 340 kilometers. Every single one of them led here.',
      'The mountain welcomed you. You did not conquer her. She allowed you. Dhanyabad, Chomolungma. Dhanyabad.',
    ],
    'base-camp-return': [
      'Back at Base Camp. The descent is its own journey. Coming down, the world gets louder, thicker, more alive.',
      'You may feel the "Everest hangover" — you have changed, but the world below has not. This is normal. Ke garne.',
      'The thick air at lower elevations will feel intoxicating. Your first deep breath below 5,000 meters — you will never forget it.',
      'You carry the summit in your heart now. No one can take that from you.',
    ],
    'lukla-return': [
      'Lukla again. Full circle. The same runway, the same porters, the same morning clouds. But you are not the same.',
      'You left as a trekker. You return as someone who has touched the sky and come back to tell the story.',
      'The Rai women in the teahouses will serve you dal bhat one last time. Eat slowly. Taste everything. You have earned it.',
      'One more flight through the clouds. Then Kathmandu. Then home. But part of you stays here forever.',
    ],
    'kathmandu': [
      'Kathmandu. The valley was a lake once. The bodhisattva Manjushri cut Chobar Gorge with his sword to drain it, and civilization poured in. Seven UNESCO World Heritage sites. Hindu temples touch Buddhist stupas. 126 languages spoken in one small country.',
      'From Lukla to the summit of Chomolungma and back. 340 kilometers. Every step was yours.',
      'During Dashain, this city empties — everyone goes home to their village. Perhaps you understand that now. The journey always ends where the heart is.',
      'The mountain thanks you. Nepal thanks you. And so do I. Namaste. 🙏',
    ],
    'namche-return': [
      'The mountain will always be here, friend. She is patient. More patient than any of us.',
      'Chomolungma does not judge those who turn back. She judges those who do not listen to their own hearts. You listened.',
      'Let us walk home together. The Dudh Koshi will guide us down. Bistarai, bistarai.',
      'You carry Namche in your heart now — the Saturday market, the sound of four languages at once, the smell of juniper.',
    ],
    'phakding-return': [
      'Phakding again. The Milk River remembers you. Can you hear it? Louder now, fuller — or maybe your ears are just more open.',
      'The trail downhill is faster, but no less beautiful. The Rai elders say the return journey teaches more than the going.',
      'You walked higher than most humans ever will. The Bijuwa shamans would say the mountain spirits walked with you.',
      'Dal bhat tonight, friend. Hot tea. A warm lodge. These are not small things — they are everything.',
    ],
    'lukla-return-free': [
      'Lukla. The circle is nearly complete. You hear the Twin Otters warming up for the morning flights.',
      'You came, you walked, you saw the mountains — and the mountains saw you. That is the exchange.',
      'The trail beyond Namche still waits. Chomolungma is patient. She has waited millions of years. She can wait for you.',
      'One more flight home. Ke garne. You can always return.',
    ],
    'kathmandu-return': [
      'Kathmandu. You are home. The thick valley air wraps around you like a blanket.',
      'The journey was shorter, but no less real. Every step on Nepali soil counts. The porters and the summiteers walk the same earth.',
      'Manjushri drained the lake, and the valley filled with temples and people and 126 languages. You have added your footsteps to that story.',
      'The mountain will wait for you. Come back when you are ready. Namaste. 🙏',
    ],
  },
  keepWalkingLines: [
    'Bistarai, bistarai — slowly, slowly. But keep going. The trail rewards those who persist.',
    'Dal bhat power, 24 hour! You have fuel in your legs. Use it.',
    'Good. The mountain respects those who keep moving. One step, one breath, one step.',
    'A little further, friend. The next checkpoint is waiting — and so is a story.',
  ],
  restLines: [
    'Rest well. The Sherpas say: the mountain will be here tomorrow, but your strength must be also.',
    'A wise trekker knows when to pause. Even the porters rest at chautara — the stone benches under pipal trees.',
    'Sleep deeply. The stars over Khumbu are watching over you tonight. Tashi delek.',
    'Ke garne — what to do? Rest. Tomorrow we walk again. The trail is patient.',
  ],
  notifications: [
    { trigger: 'idle_1day', copy: 'The trail misses your footsteps, friend. Even a short walk counts — the porters say every step carries weight.' },
    { trigger: 'idle_3days', copy: 'Three days off the trail. Bistarai, bistarai — but do not stop completely. Chomolungma is patient, but the path grows cold.' },
    { trigger: 'idle_7days', copy: 'One week. Pemba is waiting at your last checkpoint, brewing tea. Ke garne? Shall we continue together?' },
    { trigger: 'streak_milestone', copy: 'You have walked every day this week. In Nepal we say: dal bhat power, 24 hour. The mountain notices your dedication. 🏔️' },
    { trigger: 'morning_nudge', copy: 'Namaste. The Himalayas are bathed in morning light. Open Paila and take your steps — Pemba is waiting on the trail.' },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
};
