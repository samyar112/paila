# Sprint 3 — Paila (पाइला)
# Ceremony, Paywall, Content & Onboarding

> Owner: Codex (implementation) + Claude (review)
> Goal: Make the journey feel real — milestones have ceremony, Pemba speaks, the mountain has weather, content is photographic, and the paywall earns its place at Namche.
> Architecture details: see ARCHITECTURE.md. This file covers sprint scope and acceptance criteria only.

---

## Sprint Goal

```
The user's arrival at every milestone is a moment — Pemba greets them, a real photograph
fills the screen, and the mountain feels alive with weather. New users onboard through
country selection and a cinematic flight into Lukla. At Namche, the paywall earns its
place through RevenueCat. Users can delete their account or sign out cleanly.
```

---

## User Stories

### S3-01 — Route Character Data Model

**As a developer,** I want a RouteCharacterDoc schema and Firestore structure for Pemba so that ceremony dialogue and notification copy are data-driven, not hardcoded.

**Acceptance criteria:**
- `RouteCharacterDoc` Zod schema added to `src/shared/schemas.ts`
- Fields: `routeId`, `characterId`, `name`, `description`, `milestoneDialogue` (map of milestoneId → dialogue lines), `keepWalkingLines`, `notifications` (array of `{ trigger, copy }`), `updatedAt`
- Firestore path: `routes/{routeId}/characters/{characterId}`
- `StaticContentRepository` extended to cache RouteCharacterDoc in MMKV
- Seed script adds Pemba's dialogue for all 16 Everest milestones
- Unit tested: schema validation, cache read/write

**Complexity:** small

---

### S3-02 — Ceremony Handler Registry

**As a developer,** I want a CeremonyHandlerRegistry that dispatches milestone arrivals to the correct ceremony strategy so that ceremony behavior is extensible without code changes.

**Acceptance criteria:**
- `CeremonyStrategy` interface at `src/services/ceremony/CeremonyStrategy.ts`
- `CeremonyHandlerRegistry` at `src/services/ceremony/CeremonyHandlerRegistry.ts`
- Three strategies registered: `standard`, `paywall`, `completion`
- Each strategy returns a `CeremonyPayload` (hero image key, dialogue lines, animation type, next action)
- `useCeremonyStore` Zustand store at `src/stores/useCeremonyStore.ts` — holds ceremony queue and active ceremony
- Registry maps `ceremonyType` from `MilestoneDoc` to the correct strategy
- No if/else on route slug or milestone name — purely data-driven
- Unit tested: registry dispatch, all three strategies, unknown type throws

**Complexity:** medium

---

### S3-03 — Asset Resolver Service

**As a developer,** I want an AssetResolver that maps asset keys from AssetBundleDoc to local file paths so that screens never deal with CDN URLs or file system paths directly.

**Acceptance criteria:**
- `AssetResolver` at `src/services/content/AssetResolver.ts`
- Resolves `assetRef.source === 'bundled'` to app bundle path
- Resolves `assetRef.source === 'content_pack'` to downloaded content directory
- Returns `Result<string, AssetNotFoundError>` — never throws
- Checks file existence before returning path
- `AssetImage` presentational component at `src/components/ui/AssetImage.tsx` — accepts an asset key, uses AssetResolver, renders image with blurhash placeholder
- Unit tested: bundled resolution, content pack resolution, missing file error

**Complexity:** medium

---

### S3-04 — Milestone Ceremony Screen

**As a user,** I want to see a beautiful arrival ceremony when I reach a milestone so that each checkpoint feels like a real moment on the mountain.

**Acceptance criteria:**
- `MilestoneCeremonyScreen` at `src/screens/journey/MilestoneCeremonyScreen.tsx`
- Triggered by `useCeremonyStore` when a ceremony is queued
- Displays: hero photograph (via `AssetImage`), milestone name (Nepali + English), altitude, Pemba's dialogue lines (typed out sequentially)
- Standard ceremony: hero image + dialogue + "Continue" button
- Paywall ceremony: hero image + dialogue + transitions to `PurchaseInvitationScreen`
- Completion ceremony: hero image + dialogue + completion animation + "Share" / "Done"
- Ceremony type driven by `MilestoneDoc.ceremonyType` — no hardcoded branches on milestone name
- Reads all content from `CeremonyPayload` — screen has zero business logic
- Error boundary wrapping the screen
- Component tests for all three ceremony types

**Complexity:** large

---

### S3-05 — Content Pack Download Service

**As a user,** I want premium content (photos, videos, audio) to download once and serve locally so that milestone ceremonies use real imagery without streaming.

**Acceptance criteria:**
- `ContentPackService` at `src/services/content/ContentPackService.ts`
- Downloads content pack ZIP from `ContentPackDoc.downloadUrl`
- Verifies SHA-256 checksum after download — rejects on mismatch
- Extracts to local filesystem, indexes assets in MMKV with checksums
- `useContentStore` Zustand store tracks download state: `idle`, `downloading`, `verifying`, `extracting`, `ready`, `error`
- Progress callback for download percentage
- Re-download only if version changes or integrity check fails
- Never auto-deletes purchased content
- Unit tested: checksum verification, state transitions, re-download logic

**Complexity:** large

---

### S3-06 — Onboarding Flow + Country Selection

**As a new user,** I want to select my country during onboarding so that the app can personalize my experience and detect Nepal-local free access.

**Acceptance criteria:**
- `OnboardingScreen` at `src/screens/onboarding/OnboardingScreen.tsx`
- Shows 2-3 onboarding slides introducing the journey concept (immersive, not tutorial)
- Country selection picker on final slide — stores `countryCode` (ISO 3166-1 alpha-2) on UserDoc
- Nepal detection: if `countryCode === 'NP'`, sets `isNepalLocalEligible: true` on UserDoc
- First-run detection via `useAuthStore` — only shows onboarding once per account
- Skippable on subsequent app opens (flag stored in MMKV)
- Navigation: after onboarding → route catalog or active journey
- Unit tested: country code storage, Nepal detection, first-run flag

**Complexity:** medium

---

### S3-07 — Airplane Intro Sequence

**As a user,** I want to see a cinematic flight from Kathmandu to Lukla when I start the Everest journey so that the trek begins with immersion, not a loading screen.

**Acceptance criteria:**
- `AirplaneIntroScreen` at `src/screens/journey/AirplaneIntroScreen.tsx`
- Plays real drone/aerial video (bundled asset, sourced from Pexels/Pixabay — free commercial use)
- Pemba text overlay: *"Welcome. The mountain has been waiting for you."*
- Plays once on journey start (after tapping "Begin Journey")
- Skippable via tap — "Skip" button in top-right corner
- After video ends: navigate to JourneyHomeScreen with Lukla (milestone 1) unlocked
- Replayable from milestone detail view (post-MVP, tracked but not built this sprint)
- Video player uses `expo-av` or `react-native-video` — whichever is already in dependencies
- Graceful fallback: if video fails to load, show still image + text overlay, proceed normally
- Component test: renders, skip works, fallback renders

**Complexity:** medium

---

### S3-08 — RevenueCat SDK Integration

**As a developer,** I want RevenueCat initialized and connected to Firebase Auth so that entitlement checks work before building the paywall screen.

**Acceptance criteria:**
- RevenueCat SDK installed (`react-native-purchases`)
- `EntitlementService` at `src/services/entitlement/EntitlementService.ts`
- SDK configured on app launch with API key from environment config (never hardcoded)
- Customer identified with Firebase UID on sign-in
- `checkEntitlement(routeId): Promise<Result<EntitlementDoc>>` — checks if user has premium access
- `purchasePackage(packageId): Promise<Result<EntitlementDoc>>` — triggers native purchase flow
- `restorePurchases(): Promise<Result<EntitlementDoc[]>>` — restores on new device
- Entitlement status synced to Firestore `users/{userId}/entitlements/{routeId}` via webhook (Cloud Function)
- RevenueCat webhook Cloud Function at `functions/src/index.ts` — validates HMAC, updates Firestore
- Sandbox/production environment detection
- Unit tested: entitlement check, customer identification, webhook validation

**Complexity:** medium

---

### S3-09 — Purchase Invitation Screen (Namche Paywall)

**As a user,** I want to see a compelling purchase screen at Namche Bazaar so that I understand what I'm unlocking and can buy with one tap.

**Acceptance criteria:**
- `PurchaseInvitationScreen` at `src/screens/purchase/PurchaseInvitationScreen.tsx`
- Appears when `journeyState === 'PAYWALL_FROZEN'`
- Displays: Namche hero photograph, route name, price from `RouteDoc.priceUSD`, what's included (milestone count, content description)
- Pemba's paywall dialogue: *"This is where most people decide if the mountain is for them."*
- "Unlock Full Trek" button triggers `EntitlementService.purchasePackage()`
- "Restore Purchase" link triggers `EntitlementService.restorePurchases()`
- On successful purchase: transitions journey from `PAYWALL_FROZEN` → `WALKING`, navigates back to JourneyHomeScreen
- Loading and error states handled gracefully
- All IAP through RevenueCat — no custom payment processing
- No mention of lower prices outside the app
- Component tests: purchase flow, restore flow, error state

**Complexity:** medium

---

### S3-10 — Weather Proxy Cloud Function

**As a developer,** I want a `weatherProxy` Cloud Function that calls Open-Meteo with server-side caching so that weather data is free and rate-limited.

**Acceptance criteria:**
- `weatherProxy` callable Cloud Function at `functions/src/index.ts`
- Accepts: `{ lat, lon }` (milestone coordinates from MilestoneDoc)
- Calls Open-Meteo API: current temperature, conditions, wind speed
- Server-side cache: 6-hour TTL per location key (Firestore `weatherCache` collection)
- Rate limit: max 4 calls per user per local day (reads `usageCounters` doc)
- Returns cached data if fresh, fetches new if stale
- Validates App Check + Auth token
- Input validated with Zod
- No API key required (Open-Meteo is free)
- Unit tested: caching logic, rate limiting, response parsing

**Complexity:** medium

---

### S3-11 — Weather Service + UI Card

**As a user,** I want to see current weather at my milestone location so that the mountain feels alive and real.

**Acceptance criteria:**
- `WeatherService` at `src/services/weather/WeatherService.ts`
- Calls `weatherProxy` Cloud Function, caches result in MMKV (6-hour local TTL)
- Returns `WeatherData`: temperature (°C), condition label, wind speed, icon key
- `WeatherCard` presentational component at `src/components/journey/WeatherCard.tsx`
- Displays: temperature, condition icon, wind, location name — styled to match journey aesthetic
- Renders on JourneyHomeScreen below the elevation profile
- Graceful degradation: shows "Weather unavailable" if offline or rate-limited
- Max 4 calls per user per day enforced client-side (pre-check before calling function)
- Unit tested: caching, rate limit pre-check, WeatherCard rendering

**Complexity:** small

---

### S3-12 — Push Notification Service (Pemba Nudges)

**As a user,** I want gentle daily nudges from Pemba when I haven't walked so that I'm encouraged to continue without feeling pressured.

**Acceptance criteria:**
- `NotificationService` at `src/services/notification/NotificationService.ts`
- Uses `expo-notifications` for local scheduling + push token registration
- Permission request on first app open after onboarding — not during onboarding
- Notification content sourced from `RouteCharacterDoc.notifications` — never hardcoded
- Scheduling logic: 1 idle day → gentle nudge, 3 days → medium, 7 days → long absence message
- Max 1 notification per day — enforced by service
- No notifications on days the user opened the app (active walking day)
- No guilt-trip, urgency, or fitness-app language
- Cloud Function `scheduleNotifications` evaluates all active users daily (cron trigger)
- User can opt out via app settings (stores preference in MMKV + UserDoc)
- Unit tested: scheduling logic, frequency cap, opt-out, content selection

**Complexity:** medium

---

### S3-13 — Delete Account Flow

**As a user,** I want to permanently delete my account and all data so that I have full control over my information (App Store / Play Store requirement).

**Acceptance criteria:**
- `DeleteAccountScreen` at `src/screens/settings/DeleteAccountScreen.tsx`
- Accessible from app settings / profile screen
- Shows clear warning: "This will permanently delete your account, journey progress, and all data. This cannot be undone."
- Requires confirmation: user types "DELETE" to enable the delete button
- `deleteUserAccount` callable Cloud Function at `functions/src/index.ts`
- Cloud Function deletes: all Firestore docs (journey, ledger, snapshots, entitlements, events, usage counters), Firebase Auth account, RevenueCat customer (via API)
- Client-side: clears MMKV, clears Firestore offline cache, clears secure store, resets all Zustand stores
- After deletion: navigates to sign-in screen with confirmation message
- Idempotent — safe to retry if partially failed
- Unit tested: Cloud Function deletion logic, client cleanup, confirmation gate

**Complexity:** medium

---

### S3-15 — Satellite Trail Map (Journey Hero Visual)

**As a user,** I want to see my trek progress on a real satellite photograph of the Everest region with a red trail line and milestone photo bubbles so that the journey feels like I'm actually on the mountain.

**Acceptance criteria:**
- `TrailMapView` component at `src/components/journey/TrailMapView.tsx`
- Full-width hero visual at the top of JourneyHomeScreen (above the elevation profile card)
- **Background**: Real satellite/aerial image of the Khumbu-Everest region (NASA Visible Earth or USGS — free, public domain)
- **Trail path**: SVG polyline rendered over the background image using real GPS waypoints from OpenStreetMap (relation 1189003). Path is dashed red/solid red up to user's current position, then faded/dashed gray for remaining trail
- **Progress marker**: Glowing animated dot at user's current position on the trail
- **Milestone bubbles**: Circular photo thumbnails at each checkpoint location, labeled with milestone name. Unlocked milestones show real photos; locked milestones show grayscale or dimmed placeholder
- GPS waypoints stored in `src/shared/everest-trail-coordinates.ts` — array of `{ lat, lon }` projected to pixel coordinates relative to the background image
- Coordinate projection: simple linear mapping from lat/lon bounds to image pixel space (no map SDK)
- Component is scrollable/pannable if the image exceeds screen width (pinch-to-zoom is post-MVP)
- Fully offline — all assets bundled, no network dependency
- Performance: image and SVG overlay must render at 60fps on mid-range devices
- Source the satellite image: NASA Blue Marble, USGS EarthExplorer, or Pexels/Pixabay aerial Everest — all free, commercial-use OK
- Source milestone thumbnail photos: Pexels/Pixabay for each of the 16 checkpoints
- Unit tested: coordinate projection, progress calculation, milestone bubble state (locked vs unlocked)

**Complexity:** large

---

### S3-14 — Sign Out State Cleanup

**As a user,** I want signing out to fully clear my local data so that no personal information remains on a shared or sold device.

**Acceptance criteria:**
- `AuthService.signOut()` at `src/services/auth/AuthService.ts` (extend existing)
- Clears: all MMKV data, Firestore offline cache (`clearPersistence`), expo-secure-store entries, all Zustand stores reset to initial state
- RevenueCat customer logged out (`Purchases.logOut()`)
- Navigation reset to sign-in screen (full stack clear, no back button)
- Works even if network is unavailable (local cleanup must succeed regardless)
- No user data discoverable after sign-out
- Unit tested: all stores reset, all caches cleared, navigation state

**Complexity:** small

---

## Build Order

```
Phase 1 — Foundations (no screen dependencies):
  S3-01 (Route Character Data Model)
  S3-03 (Asset Resolver Service)
  S3-14 (Sign Out State Cleanup)
  S3-15 (Satellite Trail Map)             ← independent, assets + coordinate data

Phase 2 — Core Services:
  S3-02 (Ceremony Handler Registry)       ← depends on S3-01
  S3-05 (Content Pack Download Service)   ← depends on S3-03
  S3-08 (RevenueCat SDK Integration)      ← independent
  S3-10 (Weather Proxy Cloud Function)    ← independent

Phase 3 — Screens:
  S3-04 (Milestone Ceremony Screen)       ← depends on S3-02, S3-03
  S3-06 (Onboarding Flow)                 ← depends on S3-01
  S3-09 (Purchase Invitation Screen)      ← depends on S3-08, S3-02
  S3-11 (Weather Service + UI Card)       ← depends on S3-10

Phase 4 — Experience Polish:
  S3-07 (Airplane Intro Sequence)         ← depends on S3-06
  S3-12 (Push Notification Service)       ← depends on S3-01, S3-08
  S3-13 (Delete Account Flow)             ← depends on S3-14, S3-08
```

```
Dependency graph:

S3-01 ──→ S3-02 ──→ S3-04
  │                    ↑
  │         S3-03 ────┘
  │           │
  │         S3-05
  │
  ├──→ S3-06 ──→ S3-07
  │
  └──→ S3-12

S3-08 ──→ S3-09
  │
  ├──→ S3-12
  └──→ S3-13

S3-10 ──→ S3-11

S3-14 ──→ S3-13

S3-15 (independent — wire into JourneyHomeScreen after completion)
```

Do NOT build screens before their service dependencies are in place.
Do NOT build paywall screen before RevenueCat integration is tested.

---

## Out of Scope

```
❌ Nepal local free access detection logic (Sprint 4 — countryCode captured but free tier not enforced)
❌ Badges / badge unlock system (Sprint 4)
❌ Completion fly-home animation based on countryCode (Sprint 4)
❌ Ambient audio at milestones (Sprint 4 — schema supports it, content not sourced)
❌ Share card generation from milestone ceremonies (Sprint 4)
❌ Replay airplane intro from milestone detail (Sprint 4)
❌ Illustrated trail map commissioned artwork (Sprint 4 — placeholder only)
❌ Premium content pack download screen with progress UI (Sprint 4 — service built, screen deferred)
❌ Multiple route support / Route Catalog improvements (Sprint 4+)
❌ Rating prompt at Kathmandu journey completion (Sprint 4)
❌ Auto sign-out after 30 days inactivity (Sprint 4)
❌ Firebase App Check enforcement in production (Sprint 4)
❌ Apple Privacy Manifest (PrivacyInfo.xcprivacy) (Sprint 4 — required before App Store submission)
❌ Certificate pinning (post-MVP)
❌ Jailbreak / root detection (post-MVP)
❌ Biometric re-auth before purchase (post-MVP)
❌ GDPR data portability / export (post-MVP)
```

---

## Definition of Done

- [ ] All 15 user stories accepted by Claude
- [ ] Milestone ceremonies display with real photographs and Pemba dialogue
- [ ] Paywall at Namche works end-to-end with RevenueCat (sandbox tested)
- [ ] Onboarding captures country code and stores on UserDoc
- [ ] Airplane intro plays on journey start
- [ ] Weather card shows real conditions at current milestone location
- [ ] Push notifications scheduled with Pemba's voice (not fitness-app language)
- [ ] Delete Account wipes all user data from Firestore + Firebase Auth
- [ ] Sign out clears all local state — no data leakage
- [ ] Satellite trail map with red path + milestone bubbles renders on JourneyHomeScreen
- [ ] Content pack download + verification works for premium milestones
- [ ] All unit tests passing
- [ ] Zero compliance risks flagged
- [ ] All IAP through RevenueCat — no custom payment flows
- [ ] No PII in logs, no secrets in code
- [ ] Claude has reviewed and approved all code before merge
