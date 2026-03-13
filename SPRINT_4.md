# Sprint 4 — Paila (पाइला)
# Content Pipeline, Navigation Polish, Native SDKs & Store Prep

> Owner: Codex (implementation) + Claude (review)
> Goal: Make the app visually complete with real photographs, wire remaining navigation gaps, connect native SDKs (health, ads, payments), and prepare for App Store / Play Store submission.

---

## Sprint Goal

```
The journey looks and feels real — every milestone ceremony shows a real photograph,
the trail map renders over a satellite image, and Pemba's dialogue plays naturally.
The navigation graph has zero dead ends. Native SDKs connect HealthKit, Health Connect,
AdMob, and RevenueCat. The app is compliance-ready for both stores.
```

---

## What's Done (Sprint 3 + cleanup)

```
✅ Full navigation graph: Onboarding → AirplaneIntro → JourneyHome + ceremony + purchase/delete modals
✅ Nature-green theme centralized in placeholder-theme.ts (colors, radii, typography, shadows)
✅ Ceremony strategies collapsed to single buildCeremonyPayload function
✅ MMKV storage keys centralized in storage-keys.ts
✅ Shared PrimaryButton component (4 variants: primary, accent, outline, danger)
✅ DEMO_JOURNEY_ID + PEMBA_ATTRIBUTION constants extracted
✅ Dev testing panel: input steps, jump to checkpoint/paywall/completion
✅ 287 tests passing, typecheck clean
✅ deleteUserAccount Cloud Function (server-side deletion)
✅ MILESTONE_PHOTOS.md content reference compiled (16 milestones + trail map + airplane intro)
```

---

## What's Not Done (carried from Sprint 3 out-of-scope)

```
⚠️  MilestoneCeremonyScreen: paywall → Purchase navigation not wired (TODO in code)
⚠️  MilestoneCeremonyScreen: completion → celebration not wired (TODO in code)
⚠️  Dev panel: no buttons to test Purchase or Delete modals
⚠️  Price "$4.99" hardcoded in RootNavigator — should come from RevenueCat at runtime
⚠️  Milestone photos not yet downloaded/bundled in assets/
⚠️  Trail map satellite image not yet bundled
⚠️  Firestore not seeded with Everest route data
⚠️  Native SDKs not linked (HealthKit, Health Connect, AdMob, RevenueCat)
⚠️  iOS Privacy Manifest missing
⚠️  No Privacy Policy / Terms URLs
```

---

## User Stories

### S4-01 — Wire Ceremony → Purchase/Completion Navigation

**As a user,** I want the paywall ceremony to lead me to the purchase screen, and the completion ceremony to show a celebration, so there are no dead ends in the journey.

**Acceptance criteria:**
- MilestoneCeremonyScreen: when `nextAction === 'paywall'`, dismiss ceremony and navigate to Purchase screen
- MilestoneCeremonyScreen: when `nextAction === 'complete'`, show completion state (confetti or celebratory text + "You Made It" confirmation)
- Navigation uses React Navigation (`navigation.navigate('Purchase')`) — requires passing navigation prop or using `useNavigation` hook
- Dev panel: add "Open Purchase Screen" and "Open Delete Account" buttons for testing modals
- All ceremony → screen transitions testable via dev panel

**Complexity:** small

---

### S4-02 — Download & Bundle Milestone Photos

**As a user,** I want real photographs at every milestone ceremony so the mountain feels alive.

**Acceptance criteria:**
- Download all 16 milestone photos from MILESTONE_PHOTOS.md sources (Unsplash, Pexels, Pixabay, Wikimedia)
- Optimize images: resize to max 1200px wide, compress JPEG to ~80% quality (~100-200KB each)
- Store in `assets/images/milestones/{slug}.jpg` (e.g., `assets/images/milestones/lukla.jpg`)
- Download NASA satellite trail map image, store as `assets/images/trail-map-satellite.jpg`
- Download airplane intro aerial image, store as `assets/images/airplane-intro.jpg`
- Wire AssetResolver to resolve bundled milestone images
- MilestoneCeremonyScreen: display milestone photo in hero area (replace solid color placeholder)
- AirplaneIntroScreen: display aerial photo as background (replace solid color placeholder)
- All images have proper attribution comments in MILESTONE_PHOTOS.md
- Total bundle size for all images < 5MB

**Complexity:** medium

---

### S4-03 — Seed Firestore with Everest Route Data

**As a developer,** I want a seed script that populates Firestore with the Everest route so that the app can load real data instead of demo data.

**Acceptance criteria:**
- Script at `scripts/seed-firestore.ts` (run via ts-node or as Cloud Function)
- Seeds: RouteDoc, 16 MilestoneDoc subcollections, Pemba RouteCharacterDoc, AssetBundleDoc entries
- Data sourced from `demo-journey.ts` + `pemba-dialogue.ts` (single source of truth)
- Idempotent — safe to run multiple times (uses set with merge)
- Seeds to `paila-dev` project only (env check prevents accidental prod seeding)
- After seeding, app loads real journey via `JourneyService.loadJourney()` instead of demo mode

**Complexity:** small

---

### S4-04 — Trail Map Visual (Satellite + SVG Overlay)

**As a user,** I want to see my progress on a real satellite image of the Everest region with a trail line and milestone markers.

**Acceptance criteria:**
- `TrailMapView` component at `src/components/journey/TrailMapView.tsx`
- Background: satellite image of Khumbu-Everest region (NASA, bundled in assets)
- Trail path: SVG polyline over the image using projected GPS coordinates from `everest-trail-coordinates.ts`
- Completed trail section: solid green (`colors.accent`)
- Remaining trail: dashed gray
- Progress marker: animated dot at current position
- Milestone dots: small circles at each milestone location, filled if unlocked
- Renders at top of JourneyHomeScreen (above or replacing current elevation container)
- Fully offline — all assets bundled
- Uses `react-native-svg` (already in dependencies from ElevationProfile)

**Complexity:** large

---

### S4-05 — Wire HealthKit (iOS Step Source)

**As an iOS user,** I want my Apple Health steps to count toward my journey so that my real walking carries me along the trail.

**Acceptance criteria:**
- `HealthKitStepProvider` at `src/services/step-sync/providers/HealthKitProvider.ts`
- Implements `StepProvider` interface
- Uses `react-native-health` or `expo-health` to read today's step count
- Permission request with clear purpose string: "Paila reads your daily step count to advance your journey along the Everest trail."
- Registered in `StepProviderFactory` as highest priority source
- HealthKit entitlement added to iOS project (`ios/paila/paila.entitlements`)
- `NSHealthShareUsageDescription` in Info.plist
- Graceful fallback: if permission denied, falls back to phone pedometer

**Complexity:** medium

---

### S4-06 — Wire Health Connect (Android Step Source)

**As an Android user,** I want my Health Connect steps to count toward my journey.

**Acceptance criteria:**
- `HealthConnectStepProvider` at `src/services/step-sync/providers/HealthConnectProvider.ts`
- Implements `StepProvider` interface
- Uses `react-native-health-connect` to read today's step count
- Permission request with activity recognition rationale
- Registered in `StepProviderFactory` as highest priority source on Android
- Health Connect permissions declared in AndroidManifest.xml
- Play Console Data Safety section prep notes added to COMPLIANCE.md

**Complexity:** medium

---

### S4-07 — Wire AdMob Native Module

**As a developer,** I want the AdBanner component connected to real AdMob so that free users see actual ads.

**Acceptance criteria:**
- Install `react-native-google-mobile-ads`
- Configure AdMob app IDs in `app.json` / `app.config.ts` (test IDs for dev, real IDs via EAS secrets for prod)
- `AdService.initialize()` calls `mobileAds().initialize()` on app launch
- `AdBanner` component renders real `BannerAd` from the native module
- Test ad units used in dev builds — real ad units only in production
- Ads never shown during ceremonies, checkpoint decisions, or airplane intro (enforced by placement check)
- Consent notice shown once on first ad impression

**Complexity:** small

---

### S4-08 — Wire RevenueCat Native Module

**As a developer,** I want RevenueCat connected to the native purchase flow so that the paywall at Namche actually works.

**Acceptance criteria:**
- Install `react-native-purchases` (if not already)
- Configure RevenueCat with API keys from EAS secrets (never hardcoded)
- `EntitlementService.initialize()` called on app launch
- Customer identified with Firebase UID on sign-in
- `PurchaseInvitationScreen` price label fetched from RevenueCat offerings (replace hardcoded `$4.99`)
- Purchase flow triggers native StoreKit (iOS) / Google Play Billing (Android)
- On successful purchase: `journeyState` transitions from `PAYWALL_FROZEN` → `WALKING`
- Restore purchases works on new device
- Sandbox testing on both platforms
- RevenueCat webhook Cloud Function validates HMAC and syncs entitlement to Firestore

**Complexity:** medium

---

### S4-09 — iOS Privacy Manifest

**As a developer,** I need the iOS Privacy Manifest (`PrivacyInfo.xcprivacy`) so that the app passes App Store review.

**Acceptance criteria:**
- `PrivacyInfo.xcprivacy` added to iOS project
- Declares: HealthKit usage, tracking (AdMob), user defaults access
- NSPrivacyAccessedAPITypes includes all accessed APIs
- NSPrivacyTrackingDomains lists AdMob domains
- Privacy nutrition labels match actual data collection
- Reviewed against Apple's latest requirements (2025+)

**Complexity:** small

---

### S4-10 — Compliance Documentation

**As a developer,** I need Privacy Policy and Terms of Service URLs before store submission.

**Acceptance criteria:**
- `COMPLIANCE.md` created with:
  - Data collection inventory (what we collect, why, retention)
  - Third-party SDK data sharing (AdMob, RevenueCat, Firebase Analytics)
  - HealthKit data usage declaration (never used for ads or shared with third parties)
  - Android Data Safety section mapping
  - Apple Privacy Nutrition Label mapping
- Placeholder Privacy Policy URL and Terms URL in app config
- Delete account flow documented for both store review teams

**Complexity:** small

---

### S4-11 — Nepal Local Free Access

**As a user from Nepal,** I want full access to the Everest trek for free so that the story of my own mountains is accessible to me.

**Acceptance criteria:**
- If `UserDoc.countryCode === 'NP'`, user gets `accessTier: 'paid'` equivalent without purchase
- Paywall at Namche is skipped — journey continues seamlessly
- No ads shown to Nepal-local users
- Entitlement created as `source: 'nepal_local'` — distinct from purchased entitlement
- Detectable on UserDoc, not stored client-side only
- Re-validated on app launch (in case countryCode was changed)

**Complexity:** small

---

## Build Order

```
Phase 1 — Content & Navigation Polish (no native SDK dependency):
  S4-01 (Wire ceremony → purchase/completion navigation)
  S4-02 (Download & bundle milestone photos)
  S4-03 (Seed Firestore with Everest route data)
  S4-04 (Trail map visual)
  S4-11 (Nepal local free access)

Phase 2 — Native SDKs:
  S4-05 (HealthKit iOS)
  S4-06 (Health Connect Android)
  S4-07 (AdMob native module)
  S4-08 (RevenueCat native module)

Phase 3 — Store Prep:
  S4-09 (iOS Privacy Manifest)
  S4-10 (Compliance documentation)
```

```
Dependency graph:

S4-01 (ceremony nav) ← no deps, do first
S4-02 (photos) ← no deps, parallel with S4-01
S4-03 (seed) ← no deps, parallel
S4-04 (trail map) ← depends on S4-02 (satellite image bundled)
S4-11 (Nepal access) ← no deps

S4-05 (HealthKit) ← independent
S4-06 (Health Connect) ← independent
S4-07 (AdMob) ← independent
S4-08 (RevenueCat) ← S4-01 should be done first (purchase navigation wired)

S4-09 (Privacy Manifest) ← after S4-05, S4-07
S4-10 (Compliance) ← after S4-07, S4-08
```

---

## Out of Scope (Sprint 5+)

```
❌ Badges / badge unlock system
❌ Completion fly-home animation based on countryCode
❌ Ambient audio at milestones
❌ Share card generation from milestone ceremonies
❌ Replay airplane intro from milestone detail
❌ Illustrated trail map (commissioned artwork — satellite placeholder for now)
❌ Premium content pack download progress UI (service built Sprint 3, screen deferred)
❌ Multiple route support / Route Catalog
❌ Rating prompt at Kathmandu completion
❌ Auto sign-out after 30 days inactivity
❌ Firebase App Check enforcement in production
❌ Certificate pinning
❌ Jailbreak / root detection
❌ Biometric re-auth before purchase
❌ GDPR data portability / export
```

---

## Definition of Done

- [ ] All 11 user stories accepted
- [ ] Milestone ceremonies show real photographs
- [ ] Trail map renders satellite image + SVG trail + progress marker
- [ ] Ceremony → Purchase and Ceremony → Completion navigation works end-to-end
- [ ] Dev panel can test Purchase + Delete modals
- [ ] Firestore seeded with Everest route data (dev environment)
- [ ] HealthKit reads steps on iOS simulator
- [ ] Health Connect reads steps on Android emulator
- [ ] AdMob renders real test ads
- [ ] RevenueCat purchase flow works in sandbox
- [ ] Nepal users get free access
- [ ] iOS Privacy Manifest in place
- [ ] COMPLIANCE.md documents all data collection
- [ ] All unit tests passing
- [ ] Zero compliance risks flagged
- [ ] Claude has reviewed and approved all code before merge
