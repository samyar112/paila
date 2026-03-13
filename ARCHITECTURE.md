# ARCHITECTURE.md — Paila (पाइला)

> Single source of truth for all technical architecture.
> If it contradicts another doc, this file wins.

---

## Principle

Adding a new trek should feel like adding a product to a store, not writing new software.
Your daily steps carry you along iconic trails worldwide. The flagship route is Everest.
Every trail from the Camino de Santiago to the Appalachian Trail should be addable with zero code changes.

- Every screen reads `RouteDoc`, `MilestoneDoc`, `AssetBundleDoc`, and `JourneyDoc`.
- `AssetBundleDoc` stores local-resolved asset references, never runtime CDN or Firebase URLs.
- No component branches on route slug.
- Pricing, paywall position, ceremony behavior, and theming come from Firestore config.
- Route theming (colors, region tag, hero imagery) is driven by `RouteDoc`.

If a route requires code changes, the architecture has failed.

---

## Flagship Route — Everest Summit & Return

The first route takes users from Kathmandu to the summit of Everest and back.
17 milestones. Real expedition camps. The full mountaineering experience in steps.

### Journey Intro — The Flight In

The journey begins with a cinematic airplane sequence: Kathmandu to Lukla.
This is one of the most dramatic flights in the world — threading through Himalayan valleys
with Everest visible ahead. The intro plays a real aerial/drone video of the flight path
showing the mountains rising around you. No interaction needed — just watch and feel it.

- Plays once when the user starts a new journey (after tapping "Begin Journey").
- Real drone/aerial footage sourced from Pexels/Pixabay (free, commercial use OK).
- Pemba's voice (text overlay): *"Welcome. The mountain has been waiting for you."*
- After the video, the user "lands" at Lukla — milestone 1 unlocks.
- Skippable after first view. Replayable from milestone detail.

### Milestone Structure

```
APPROACH (free):
  1.  Lukla (2,860m) — journey begins (after flight intro)
  2.  Phakding (2,610m)
  3.  Namche Bazaar (3,440m) — PAYWALL

TREK TO BASE CAMP (premium):
  4.  Tengboche Monastery (3,867m)
  5.  Dingboche (4,410m)
  6.  Lobuche (4,940m)
  7.  Gorak Shep (5,164m)
  8.  Everest Base Camp (5,364m) — major ceremony

SUMMIT PUSH (premium):
  9.  Camp 1 (5,943m) — Khumbu Icefall
  10. Camp 2 (6,400m) — Western Cwm
  11. Camp 3 (7,162m) — Lhotse Face
  12. Camp 4 / South Col (7,920m) — Death Zone
  13. THE SUMMIT (8,849m) — peak ceremony

RETURN (premium):
  14. Back to Base Camp (5,364m)
  15. Lukla (2,860m)
  16. Kathmandu (1,400m) — JOURNEY COMPLETE
```

- Paywall at Namche Bazaar (milestone 3) — user has tasted the trek, now commits.
- Rating prompt only at Kathmandu (journey completion).
- Completion ceremony includes fly-home animation based on user's `countryCode` (post-MVP).
- Route distance is fixed for all users — ends at Kathmandu.

### Supporting Character — Everest

Characters are data-driven, not hardcoded. Each route defines its own cast via `RouteCharacterDoc`.
New routes get new characters through content, not code changes.

**Pemba Dorje Sherpa — Your Guide**
Age 40s. Has summited Everest 8 times. Calm, philosophical, quietly funny.
The emotional anchor of the entire journey. He walks with you from Lukla to Kathmandu.
Shares mountaineering wisdom, Nepali culture, and personal stories at every milestone.
His voice is the voice of the mountain.

### Pemba's Roles

**Checkpoint Ceremonies:**
When the user arrives at a milestone, Pemba delivers a short story or reflection.
Each checkpoint has unique dialogue tied to the real location.
Examples:
- Namche Bazaar: "This is where most people decide if the mountain is for them."
- Base Camp: "We are guests here. The mountain decides who stays."
- Summit: "You carried yourself here. Every single step."

**Daily Motivation (Push Notifications):**
Pemba sends gentle nudges when the user hasn't opened the app. Not pushy — in character.
All notification copy is stored in `RouteCharacterDoc.notifications` — never hardcoded.
Examples:
- After 1 day idle: "The trail is quiet today. Your boots are waiting."
- After 3 days idle: "Even the yaks rest, but they always start walking again."
- After 7 days idle: "The mountain is patient. So am I. Open the app when you're ready."
- Morning nudge: "Good morning. The path ahead is clear today."
Notifications respect OS permissions and user opt-out. Max 1 per day.
No notifications during active walking days (user is already engaged).
No notifications that guilt-trip, use urgency tricks, or sound like a fitness app.

**Keep Walking Encouragement:**
When the user chooses "Keep walking today" at a checkpoint, Pemba gives a brief send-off.
Example: "Let's keep moving. The next tea house isn't far."

### Character Architecture Rules

- Characters are defined per route in `RouteCharacterDoc` — never hardcoded in UI.
- Character appearances are tied to milestones via `milestoneCharacters` in `MilestoneDoc`.
- Dialogue and story content lives in `AssetBundleDoc.storyLines` — not in code.
- A future Camino route would have its own guide character. Zero code changes.
- Characters never break the fourth wall. They live in the journey, not in the app UI.
- No character is a tutorial bot, a mascot, or a gamification device.

---

## Progression Model

Steps are foreground-only. The app claims progress when the user opens it.

- No background step processing or passive progression.
- A reached checkpoint pauses the journey immediately.
- While paused, no further steps count until the user returns and chooses.
- "Keep walking today" permits same-day foreground claims only.
- "Keep walking today" expires at midnight. Unclaimed steps are lost.

### Trek Rhythm

```
open app          → check in, claim steps
reach checkpoint  → arrive, paused
return and choose → rest here / keep walking today
```

---

## Journey State Machine

```
States:
  WALKING               → steps counting toward next checkpoint
  PAUSED_AT_CHECKPOINT  → arrived, ceremony fired, awaiting user choice
  RESTING               → user chose rest or day closed, waiting for tomorrow
  PAYWALL_FROZEN        → reached Namche, awaiting purchase
  COMPLETED             → reached Kathmandu

Transitions:
  WALKING → PAUSED_AT_CHECKPOINT    checkpoint ceiling reached
  WALKING → PAYWALL_FROZEN          Namche reached, no entitlement
  WALKING → RESTING                 midnight closes the day
  WALKING → COMPLETED               Kathmandu reached
  PAUSED_AT_CHECKPOINT → RESTING    user taps "Rest here"
  PAUSED_AT_CHECKPOINT → WALKING    user taps "Keep walking today"
  RESTING → WALKING                 new day, user opens app
  PAYWALL_FROZEN → WALKING          purchase confirmed
```

Invalid transitions must throw `InvalidStateTransitionError`. No silent state corruption.

---

## Step Counting Rules

```
Priority 1: HealthKit (iOS) / Health Connect (Android)
Priority 2: Phone pedometer (fallback)
```

- ONE source wins per day. Never add sources together.
- Never accept manual step entry.
- Never count steps from unverified sources.
- Never backfill frozen paywall days.
- Never count steps in the background.
- Never move past a checkpoint without explicit user re-engagement.

---

## Step Sync Architecture (3-Layer Model)

```
Layer 1 — HealthKit / Health Connect (free, local, unlimited)
  Read step count directly. No cost, no network, instant.
  User can refresh as many times as they want.

Layer 2 — MMKV (local cache, persistent)
  Every HealthKit read writes to MMKV. UI always reads from MMKV.
  Keyed by date: steps:2026-03-11 → { count, lastReadAt }
  Entries older than today cleared on app open.

Layer 3 — Firestore (permanent record, event-driven only)
  Written ONLY on: checkpoint reached, rest/keep walking choice,
  end of day, app backgrounds after step gain.
  Target: 2-5 writes per user per day.
```

- HealthKit reads → unlimited, always fresh, no rate limit
- MMKV writes → on every HealthKit read, keyed by date
- UI reads → from MMKV, never HealthKit directly
- Firestore writes → only on journey events listed above
- All writes → foreground only, never background

---

## Paywall Rules

- Hard freeze at Namche Bazaar.
- Steps stop completely at paywall. No progress accumulates while frozen.
- After purchase: fresh start from Namche. No catch-up, no instant Summit.
- Acclimatization day counter runs while frozen.
- All IAP through RevenueCat + Apple/Google. Never bypass store IAP.

---

## Template Architecture Rules

- No component may reference a route by slug.
- No hardcoded milestone counts or pricing strings.
- No route-specific if/else in UI code.
- No asset URLs — use asset keys only.
- All route behavior driven by `RouteDoc`.
- All ceremony behavior driven by `ceremonyType`.
- New paid route = zero code changes, zero app update.
- New free route = zero code changes, app update for bundled assets only.

---

## Asset & Content Delivery

### Real Photography First

Every milestone should use real photographs of the actual location.
The immersion depends on the user feeling like they are THERE — not looking at stock images or illustrations.

**Image sourcing strategy:**
- Primary: commission or license real photos of each checkpoint location (Lukla, Namche, Base Camp, camps, summit).
- Secondary: high-quality Creative Commons / public domain photos from Wikimedia, Unsplash, or mountaineering archives.
- Fallback only: AI-generated or illustrated imagery — only if no real photo exists for a location.
- Every milestone ceremony should show the real place the user just "arrived at."
- Pemba's dialogue pairs with the image — the photo is the location, his words are the experience.

**Image requirements per milestone:**
- Hero image: real photo of the location (required).
- Ceremony background: real photo, can be same as hero or a different angle (required).
- Share card background: real photo (post-MVP).

**Video / ambient audio (premium, post-MVP):**
- Short ambient video clips of each location (wind at Base Camp, prayer flags at Tengboche, sunrise at summit).
- Ambient audio: wind, bells, birdsong, crampons on ice — real field recordings where possible.

### Delivery Rules

- Free content (approach milestones 1-3): bundled in app binary.
- Premium content (milestones 4-16): one-time download via `ContentPackService`.
- After download: serve from local filesystem only.
- Never stream owned premium content from remote URL.
- Never auto-delete purchased content.
- Checksum verify after every download.
- Re-download only if version changes or integrity fails.

---

## Data Model Rules

- `StepSource` = `'healthkit' | 'health_connect' | 'phone_pedometer'`. `'manual'` is NOT valid — ever.
- `AssetBundleDoc` uses asset keys, not URLs.
- Ledger is append-only — never delete entries.
- Rebuild journey from ledger, not from delta math.
- Store dates in user's LOCAL timezone.
- Unclaimed same-day progress expires at midnight.

---

## Zero-Cost Infrastructure

All infrastructure costs $0 at MVP scale (up to ~5,000 active users).

```
Firebase (Spark/Blaze free tier)     → $0
Elevation Profile + Illustrated Map  → $0  (custom views, no map SDK)
Open-Meteo weather API               → $0  (no API key required)
RevenueCat                           → $0  (free under $2,500 MRR)
HealthKit / Health Connect           → $0
MMKV local cache                     → $0
EAS Builds (free tier + local)       → $0
```

### Cost Protection

- Max 4 weather calls per user per day.
- Cache map tiles after first load.
- Cache weather 6 hours per location.
- Cache route/milestone content after first read.
- Never expire a one-time purchase.
- Target: 1,000 active users < $5/month infrastructure.

---

## Route-Agnostic UI Boundaries

- `RouteCatalogScreen` — queries published routes, renders cards from `RouteDoc`.
- `JourneyHomeScreen` — reads active `JourneyDoc` + `RouteDoc`, all copy parameterized.
- `MilestoneCeremonyScreen` — branches only on `ceremonyType`.
- `CheckpointDecisionSheet` — presents Rest here / Keep walking today.
- `PurchaseInvitationScreen` — uses `route.priceUSD`, milestone titles.
- `CompletionScreen` — uses route fields, hero media, fly-home animation (post-MVP).
- `PremiumContentPackDownloadScreen` — uses `RouteDoc` + `ContentPackDoc` metadata.

---

## Journey Visualization (No Map SDK)

No Google Maps. No Mapbox. No MapLibre. The journey is visualized with two custom views
that feel like an expedition, not a navigation app.

### Primary: Elevation Profile

The signature visual of the app. A side-view cross-section of the entire route.
Lukla (2,860m) on the left, the Summit spike (8,849m) at center, back down to Kathmandu (1,400m) on the right.

- User's current position is an animated dot climbing the altitude curve.
- Milestone markers along the profile at each checkpoint's real altitude.
- The dramatic vertical scale tells the story: the Khumbu Icefall wall, the Death Zone, the descent.
- Rendered with React Native SVG or Canvas — no map SDK needed.
- Static altitude data bundled per route in `RouteDoc.elevationProfile` (array of {meters, altitude} points).
- Works offline. $0 cost. Instant render.
- This is what makes Paila's App Store screenshots stand out.

### Hero: Satellite Trail Map

The main visual of JourneyHomeScreen. A real satellite photograph of the Khumbu-Everest
region with the trek path overlaid as a red trail line.

- Background: Real satellite/aerial image of the Everest region (NASA Visible Earth / USGS — free, public domain).
- Trail path: SVG polyline from real GPS waypoints (OpenStreetMap relation 1189003).
  Solid red up to user's current position, faded dashed gray for remaining route.
- Progress marker: Glowing animated dot at user's current position.
- Milestone bubbles: Circular photo thumbnails at each checkpoint — real photos for unlocked, dimmed for locked.
- Coordinate projection: Simple linear lat/lon → pixel mapping. No map SDK.
- GPS waypoints stored in `src/shared/everest-trail-coordinates.ts`.
- Scrollable/pannable. Fully offline. All assets bundled.
- Reference inspiration: hiking trail apps with aerial photo + dotted path overlays.

### Detail: Elevation Profile

Sits below the satellite trail map as a compact card. The side-view altitude cross-section.
Lukla on the left, Summit spike at center, Kathmandu on the right.

### Why No Map SDK

- Google Maps / Mapbox cost money at scale. Violates $0 target.
- MapLibre + free tiles is $0 but looks like every other app.
- A satellite photo with a trail overlay serves the emotional journey better than an interactive map.
- The elevation profile communicates altitude, danger, and progress far better than a top-down view.
- Zero dependencies. Zero API keys. Zero network calls for rendering.

---

## Weather (Open-Meteo — Zero Cost)

```
Provider:    Open-Meteo (open-meteo.com)
Cost:        $0 (no API key required)
Rate limit:  10,000 calls/day (server-side cache means ~10-50 actual calls/day)
Delivery:    Server-side weatherProxy Cloud Function with 6-hour TTL per location
```

- All weather requests go through `weatherProxy` Cloud Function.
- Max 4 calls per user per local day. Cache shared across users on same location.
- Never call Open-Meteo directly from the client.

---

## Client Caching

- Firestore offline persistence enabled for all collections.
- Mirror static docs into MMKV with versioned keys.
- Prefetch only active route's map region — do not bulk-download all tiles.
- Persistent weather cache keyed by normalized location.
- Downloaded content packs indexed in MMKV with checksums.

---

## Privacy

- Firestore stores `userId` (Firebase UID) only — never name or email.
- Name and email stay in Firebase Auth only.
- No PII in Firestore, Crashlytics, Analytics, or logs.
- UID is a random string — meaningless without Firebase Auth.

---

## Data Loss on App Delete

- MMKV cleared → expected, only today's cache.
- On reinstall + sign in → journey restored from Firestore.
- Delete Account flow (mandatory before launch): wipe all Firestore data, delete Firebase Auth account, clear MMKV, confirm to user.
