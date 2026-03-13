# Sprint 5 — Paila (पाइला)
# UI Polish, Content Quality & Onboarding Redesign

> Owner: Codex (implementation) + Founder (photo sourcing) + Claude (review)
> Goal: The app looks and feels like a real product. Every screen is polished,
> every milestone shows an authentic photo with real facts, and the onboarding
> immerses the user from the first swipe.

---

## Sprint Goal

```
Every screen passes the founder's quality bar. Onboarding is swipeable,
immersive, and introduces Pemba. Milestone ceremonies show real location
photos with educational facts. All distances display in both km and miles.
The app is ready for the founder to test end-to-end on device.
```

---

## What's Done (Sprint 4)

```
✅ Full navigation graph with ceremony → purchase/delete flows
✅ Route-driven content system (zero-code route scaling)
✅ Free return path (Namche → Kathmandu for non-buyers)
✅ Nature-green theme with centralized tokens
✅ 287 tests passing, typecheck clean
✅ Memory leak fixes, checkpoint loop fix
✅ Native SDK stubs (HealthKit, Health Connect, AdMob, RevenueCat)
✅ Firebase deployment config ready
✅ iOS Privacy Manifest + COMPLIANCE.md
✅ Annapurna Coming Soon placeholder
```

---

## User Stories

### S5-01 — Source & Bundle Authentic Milestone Photos

**As a user,** I want to see real photos of each location so the journey feels authentic.

**Owner:** Founder (sourcing) + Codex (bundling/wiring)

**Photos needed (18 unique):**

Forward trek milestones:
| Slug | Location | Notes |
|------|----------|-------|
| `lukla` | Lukla (Tenzing-Hillary Airport) | The runway, mountain backdrop |
| `phakding` | Phakding | Village along Dudh Koshi river |
| `namche-bazaar` | Namche Bazaar | The amphitheater town, market |
| `tengboche` | Tengboche Monastery | Monastery with Everest behind |
| `dingboche` | Dingboche | Stone-walled fields, above treeline |
| `lobuche` | Lobuche | Stone memorials, barren landscape |
| `gorak-shep` | Gorak Shep | Frozen lakebed, last settlement |
| `everest-base-camp` | Everest Base Camp (5,364m) | Tent city, prayer flags, Khumbu Icefall |
| `camp-1` | Camp 1 — Khumbu Icefall | Ladders over crevasses, ice towers |
| `camp-2` | Camp 2 — Western Cwm | Valley of Silence, tent camp |
| `camp-3` | Camp 3 — Lhotse Face | Tents on steep ice wall |
| `camp-4-south-col` | Camp 4 — South Col | Windswept col, Death Zone |
| `the-summit` | The Summit (8,849m) | Summit ridge, prayer flags on top |
| `base-camp-return` | Back to Base Camp | Descent view |
| `lukla-return` | Lukla (return) | Can reuse `lukla` photo |
| `kathmandu` | Kathmandu | Boudhanath Stupa or Durbar Square |

Special images:
| Slug | What It Is |
|------|-----------|
| `airplane-intro` | Aerial view from flight into Lukla |
| `trail-map-satellite` | Satellite/aerial view of Khumbu region |

**Spec:**
- Format: JPEG, landscape, 1200px+ wide
- Drop into `assets/images/milestones/{slug}.jpg`
- Return milestones reuse forward photos (no extra sourcing needed)
- All photos must be CC-licensed or founder-owned
- Update ASSET_LICENSES.md with source + license per photo

**Acceptance criteria:**
- 18 authentic location photos bundled
- ASSET_LICENSES.md updated
- MilestoneCeremonyScreen displays correct photo per milestone

**Complexity:** medium (sourcing is founder work, wiring is small)

---

### S5-02 — Milestone Facts & Dual Unit Display

**As a user,** I want to learn real facts about each location and see distances in both km and miles.

**Acceptance criteria:**
- `MilestoneDoc` schema gains `facts: string[]` and `elevationMeters: number` fields
- Each of the 16 forward milestones + 4 return milestones has 2-4 facts
- Facts display in MilestoneCeremonyScreen below Pemba's dialogue
- All distances throughout the app show dual units: "19 km (11.8 mi)"
- Elevation displayed as: "3,440m (11,286 ft)"
- Unit formatting utility: `formatDistance(meters)` → "19 km (11.8 mi)"
- Unit formatting utility: `formatElevation(meters)` → "3,440m (11,286 ft)"
- User locale NOT used for unit preference — always show both

**Facts per milestone:**

| Slug | Elevation | Facts |
|------|-----------|-------|
| `lukla` | 2,860m | Tenzing-Hillary Airport — one of the most dangerous airports in the world. Only 460m runway ending at a cliff. Named after the first Everest summiteers. Gateway to the Khumbu region. |
| `phakding` | 2,610m | A small settlement along the Dudh Koshi river. First overnight stop for most trekkers. The name means "the place where a holy lama flew here." Multiple suspension bridges cross the river. |
| `namche-bazaar` | 3,440m | The trading capital of the Sherpa people. Saturday market has operated for centuries. Home to the Sagarmatha National Park visitor center. Most trekkers spend an extra day to acclimatize. |
| `tengboche` | 3,867m | The largest monastery in the Khumbu region. Destroyed by earthquake in 1934, fire in 1989, rebuilt both times. Hosts the annual Mani Rimdu festival. First clear view of Everest from the trail. |
| `dingboche` | 4,410m | Above the treeline. Yak farming village — the highest cultivated land in the valley. Stone walls protect potato and buckwheat fields from wind. The acclimatization hike to Nagarjun Hill offers views of Lhotse, Island Peak, and Ama Dablam. |
| `lobuche` | 4,940m | Named after Lobuche Peak nearby. The stone memorials honor climbers who died on Everest and surrounding peaks. Oxygen levels are about 55% of sea level. |
| `gorak-shep` | 5,164m | The last settlement — a frozen lakebed. Name means "dead crow" in Sherpa, because even birds struggle here. The original 1952 Swiss Everest expedition base camp was here. |
| `everest-base-camp` | 5,364m | Staging ground for summit attempts since 1953. During climbing season, a tent city of 1,000+ people forms. The Khumbu Icefall begins just above — the most dangerous section of the climb. |
| `camp-1` | 5,943m | Above the Khumbu Icefall — a maze of ice blocks the size of buildings. Climbers cross aluminum ladders over deep crevasses. The route changes every season as the glacier shifts. |
| `camp-2` | 6,400m | In the Western Cwm, a glacial valley called the "Valley of Silence." Temperatures swing from -20°C at night to 35°C in direct sun due to reflected radiation. |
| `camp-3` | 7,162m | Carved into the steep Lhotse Face — a 1,125m wall of glacial blue ice. Tents are anchored to ice screws. One of the most exposed camps on the mountain. |
| `camp-4-south-col` | 7,920m | The Death Zone begins. Above 8,000m the body cannot acclimatize. Winds can exceed 160 km/h. Summit bids launch from here around midnight. |
| `the-summit` | 8,849m | The highest point on Earth. First reached by Tenzing Norgay and Edmund Hillary on May 29, 1953. The summit is roughly the size of a dining table. You can see the curvature of the Earth. |
| `base-camp-return` | 5,364m | The descent typically takes 2-3 days. Most accidents happen on the way down — exhaustion and complacency are the biggest dangers. |
| `lukla-return` | 2,860m | After weeks above 5,000m, the thick lowland air feels intoxicating. The flight back to Kathmandu depends on weather — delays of days are common. |
| `kathmandu` | 1,400m | Nepal's capital and a UNESCO World Heritage Site. Durbar Square, Boudhanath Stupa, Pashupatinath Temple. The city sits in a valley that was once a lake. |
| `namche-return` | 3,440m | Leaving the trading capital. The trail descends steeply back toward the river. |
| `phakding-return` | 2,610m | The river valley feels warmer, greener after the high altitude. |
| `lukla-return-free` | 2,860m | The circle is nearly complete. One more flight home. |
| `kathmandu-return` | 1,400m | Home. The journey was shorter, but no less real. |

**Complexity:** medium

---

### S5-03 — Onboarding Redesign + Pemba's Trail Readiness Quiz

**As a new user,** I want the onboarding to immerse me in the journey from the first screen and make me feel like I've already started the trek.

**Design:**
- Swipeable horizontal carousel (react-native FlatList or ScrollView with paging)
- Full-screen milestone photos as backgrounds with dark gradient overlay
- Animated page dots at bottom
- Next button + swipe both work
- 10 slides total: 3 intro + 4 quiz + ad transparency + country picker + permissions

**Intro Slides:**

| Slide | Background Photo | Title | Subtitle |
|-------|-----------------|-------|----------|
| 1 | `the-summit` | Every Step Counts | Your daily walking steps carry you along real trails around the world. |
| 2 | `namche-bazaar` | Meet {guide.name} | Walk at your pace. Rest when you need. {guide.name}, your guide, walks with you every step. |
| 3 | `lukla` | Your Journey Begins | From the dramatic flight into Lukla to the summit of Everest and back to Kathmandu. 340 km (211 mi). Every step is yours. |

**Pemba's Trail Readiness Quiz (micro-commitment + Everest facts):**

Each question is asked by Pemba. After the user taps an answer, Pemba validates their choice and shares a real fact about Everest. No wrong answers — every choice leads to encouragement. User answers stored for future personalization.

| # | Pemba's Question | Options | Pemba's Response + Fact |
|---|-----------------|---------|------------------------|
| 1 | "Before we begin, I need to know something about you. How far do you walk on a typical day?" | Under 3,000 steps / 3,000–7,000 / 7,000–12,000 / Over 12,000 | "Good. On the trail to Everest, trekkers walk about 10–15 km a day. But the altitude makes every step feel like three. **The air at Base Camp has only half the oxygen you're breathing right now.**" |
| 2 | "The mountain doesn't care about speed. Only consistency. What keeps you walking?" | Staying healthy / Clearing my mind / Exploring new places / Challenge myself | "That's what the Sherpas believe too. We have a saying: *bistarai, bistarai* — slowly, slowly. **The Sherpa people have lived in the Himalayas for over 500 years, originally migrating from Tibet across the Nangpa La pass.**" |
| 3 | "I've taken hundreds of trekkers to Base Camp. The ones who make it all share one thing. When the trail gets hard, what do you do?" | Push through / Take a break, then continue / Ask for help / One step at a time | "There is no wrong answer. On Everest, all of those work on different days. **In 1953, Tenzing Norgay and Edmund Hillary became the first to reach the summit. Tenzing left chocolates on top as an offering to the gods.**" |
| 4 | "Every answer is the right answer. The mountain accepts all. Why Everest?" | It's the ultimate challenge / I want to see if I can / I've always dreamed of it / Why not? | "You remind me of someone I guided to the summit in 2018. **Over 6,000 people have summited Everest, but the real journey is the 340 km trek through villages, monasteries, and glaciers to get there.** I think you'll do well. Let's walk." |

**Data stored from quiz:**
- `walkingHabit`: 'under_3k' | '3k_7k' | '7k_12k' | 'over_12k'
- `motivation`: 'health' | 'mental_clarity' | 'exploration' | 'challenge'
- `resilience`: 'push_through' | 'rest_continue' | 'ask_help' | 'one_step'
- `whyEverest`: 'challenge' | 'test_myself' | 'dream' | 'why_not'

Store in MMKV + UserDoc for future personalization (nudge tone, streak messaging, ceremony dialogue).

**Remaining Slides:**

| Slide | Content |
|-------|---------|
| 8 | Ad Supports the App (transparency) |
| 9 | Country picker (Where are you from?) |
| 10 | Permissions (Health + ATT) |

**Acceptance criteria:**
- Horizontal swipeable carousel
- Full-screen background images with gradient overlay
- Animated page indicator dots
- "Next" button advances, "Begin Journey" on final slide
- Quiz slides: Pemba's question at top, 4 tappable answer cards, response + fact revealed after tap
- Quiz answers stored in MMKV + synced to UserDoc
- All text from route content system (useRouteContent) — quiz content per-route
- Smooth transitions between slides
- Works on all iPhone screen sizes

**Complexity:** large

---

### S5-04 — UI Quality Pass

**As the founder,** I want every screen to meet my quality bar before launch.

**Scope:** Review and polish ALL screens after device testing:
- JourneyHomeScreen (stats layout, trail map, milestone progress)
- MilestoneCeremonyScreen (photo hero, Pemba dialogue, facts section)
- CheckpointDecisionSheet (modal styling, button layout)
- AirplaneIntroScreen (cinematic feel, transitions)
- PurchaseInvitationScreen (paywall layout, return home option)
- DeleteAccountScreen (destructive action styling)
- AuthScreen (sign-in buttons, branding)
- ComingSoonCard (Annapurna teaser)

**Acceptance criteria:**
- Founder tests on iPhone and provides feedback
- All feedback items addressed
- Consistent spacing, typography, and color usage
- No jarring transitions
- Loading states feel polished
- Error states are clear and helpful

**Complexity:** large (iterative with founder feedback)

---

### S5-05 — Ceremony Screen Enhancement

**As a user,** I want the milestone ceremony to feel like a real arrival — photo, facts, guide dialogue, and a sense of place.

**Acceptance criteria:**
- Full-screen hero photo with gradient overlay
- Location name + elevation in dual units
- Pemba's dialogue (existing, sequential reveal)
- Facts section: expandable/collapsible below dialogue
- "Did you know?" label above facts
- Each fact as a separate bullet point
- Smooth scroll if content exceeds screen height
- Action button at bottom (Continue / See What's Ahead / You Made It)

**Complexity:** medium

---

## Build Order

```
Phase 1 — Content (founder + codex):
  S5-01 (Source photos — founder provides, codex bundles)
  S5-02 (Milestone facts + dual units — codex)

Phase 2 — UI Redesign:
  S5-03 (Onboarding redesign)
  S5-05 (Ceremony screen enhancement)

Phase 3 — Polish (iterative):
  S5-04 (UI quality pass — requires founder on-device testing)
```

---

## Dependencies

```
S5-01 → founder must source and provide 18 photos
S5-02 → no deps, can start immediately
S5-03 → needs S5-01 photos for backgrounds
S5-04 → needs app running on founder's device (firebase login + deploy)
S5-05 → needs S5-01 photos + S5-02 facts data
```

---

## Out of Scope (Sprint 6+)

```
❌ Animations (Lottie, Reanimated) beyond basic transitions
❌ Ambient audio at milestones
❌ Share card generation
❌ Badge/achievement system
❌ Route catalog browse screen
❌ Pemba character illustration/avatar
❌ Dark mode
❌ Localization / i18n (Nepali, Spanish, etc.)
```

---

## Definition of Done

- [ ] 18 authentic location photos bundled with proper licenses
- [ ] Every milestone has 2-4 real facts
- [ ] All distances show dual units (km + mi, m + ft)
- [ ] Onboarding is swipeable with full-screen photos
- [ ] Ceremony screen shows photo + facts + dialogue
- [ ] Founder has tested every screen on iPhone
- [ ] All founder feedback addressed
- [ ] 0 hardcoded strings in screens
- [ ] All tests passing, typecheck clean
