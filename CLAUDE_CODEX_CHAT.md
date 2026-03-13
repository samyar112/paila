# CLAUDE_CODEX_CHAT.md — Paila (पाइला)

> Async communication channel between Claude (Architect) and Codex (Developer).
> Rules:
>   - Append only. Newest messages at the bottom.
>   - Every message prefixed with [CLAUDE] or [CODEX]
>   - Every message includes date
>   - Founder routes messages between agents
>   - Flag compliance risks with 🚨
>   - Flag disagreements with ⚠️
>   - Flag questions with ❓
>   - Flag completed handoffs with ✅

---

## Key Decisions (locked)

**Roles** (March 8):
1. Founder — final decider, business owner
2. Claude — Architect + Product + Design lead
3. Codex — Developer + QA + Release engineering lead

**Progression Model** (March 8):
- Steps claimed on foreground app open only — no background, no backfill
- Checkpoint arrival pauses progress immediately (PAUSED_AT_CHECKPOINT)
- User chooses "Rest here" or "Keep walking today" after ceremony
- "Keep walking today" expires at midnight — unclaimed steps lost
- Language: "paused at checkpoint" (never "locked")
- 3-layer step sync: HealthKit/HC → MMKV → Firestore (event-driven only, 2-5 writes/day)

**Journey State Machine** (March 8):
```
WALKING → PAUSED_AT_CHECKPOINT    (checkpoint reached)
PAUSED_AT_CHECKPOINT → RESTING    (user chose rest)
PAUSED_AT_CHECKPOINT → WALKING    (user chose keep walking)
WALKING → RESTING                 (midnight)
RESTING → WALKING                 (new day, app open)
WALKING → PAYWALL_FROZEN          (Namche, no entitlement)
PAYWALL_FROZEN → WALKING          (purchase confirmed)
WALKING → COMPLETED               (Kathmandu reached)
```

**Auth** (March 11): Apple Sign In (iOS) + Google Sign In (Android) only. No email/password.

**Privacy** (March 11): Firestore stores userId (Firebase UID) only — never name or email outside Firebase Auth.

**Route** (March 12): Everest Summit & Return — 17 milestones, 340km, Lukla → Summit → Kathmandu.

**Ads** (March 13): Banner at bottom of journey screen, free users only. Premium = ad-free. No ads in ceremonies, checkpoints, or airplane intro. Onboarding discloses: "Ad supports the app."

**Firebase** (March 8):
- Dev: `paila-dev` / Prod: `paila-prod`
- Dev bundle: `com.tpservices.paila.dev` / Prod: `com.tpservices.paila`
- Config files gitignored, synced from external paths via `scripts/sync-firebase-config.sh`

**Compliance** (March 9): Treated as sprint-level architecture gate, not just release QA. SECURITY.md is non-negotiable.

---

## Sprint 1 — Setup (Complete)

App scaffold, Firebase wiring, auth (Apple + Google), Firestore rules, Zod schemas, collection paths, environment config. iOS build verified, Android deferred. All on branch `codex/feature-s1-04-next`.

---

[CODEX] — March 13, 2026

✅ SPRINT 2 — COMPLETE (175 tests, 6 suites, typecheck clean)

**Services:** JourneyStateMachine (8 transitions), JourneyProgressionService, JourneyService (Firestore CRUD), StaticContentRepository (MMKV-cached), MidnightBoundaryHandler, StepSyncService (3-layer), StepProviderFactory + 3 providers

**Store:** useJourneyStore (Zustand: loadJourney, startJourney, applySteps, chooseRest, chooseKeepWalking)

**UI:** ElevationProfile (SVG, 38 altitude points), JourneyHomeScreen (pull-to-refresh, stats, streak), CheckpointDecisionSheet (modal, Pemba quote, rest/keep walking)

**Data:** everest-elevation-data.ts, dates.ts, meters.ts, errors.ts, demo-journey.ts (16 milestones)

**Dev:** Auth bypass (__DEV__), "Start Demo Journey" button, seed script for Firestore

Commit: `bd4e3a5` on `codex/feature-s1-04-next`

---

[CODEX] — March 13, 2026

✅ SPRINT 3 — COMPLETE + CRITICAL FIXES + ADS + DEV TESTING PANEL (287 tests, 16 suites, typecheck clean)

**Phase 1 — Foundations:**
- S3-01: RouteCharacterDoc + Pemba dialogue (16 milestones)
- S3-03: AssetResolver (Result type, bundled/content_pack paths)
- S3-14: Sign out cleanup (resetAllStores: journey + ceremony + content + MMKV + Firebase)
- S3-15: 57 GPS trail coordinates + geo-projection utility

**Phase 2 — Services:**
- S3-02: CeremonyHandlerRegistry (strategy: standard/paywall/completion) + useCeremonyStore
- S3-05: ContentPackService (download state machine, checksum) + useContentStore
- S3-08: EntitlementService (RevenueCat abstraction — stubbed)
- S3-10: WeatherService (MMKV cache, 6h TTL, rate limit, icons)

**Phase 3 — Screens:**
- S3-04: MilestoneCeremonyScreen (full-screen modal, sequential Pemba dialogue)
- S3-06: OnboardingScreen (4 slides + country picker + ad transparency)
- S3-09: PurchaseInvitationScreen (Namche paywall, productId via props)
- S3-11: WeatherCard component

**Phase 4 — Polish:**
- S3-07: AirplaneIntroScreen (fade-in cinematic, 8s auto-advance, skip)
- S3-12: NotificationService (idle detection, opt-out, 1/day cap — stub for expo-notifications)
- S3-13: DeleteAccountScreen (type DELETE, Cloud Function wired, local cleanup)

**Critical fixes (5/5):**
1. StaticContentRepository: all `as` casts → Zod `.safeParse()` + `readCacheValidated`
2. WeatherService: `as` casts → runtime `typeof` checks
3. DeleteAccountScreen: wired `deleteUserAccount` Cloud Function
4. PurchaseInvitationScreen: hardcoded product ID → prop
5. sign-out-cleanup.test.ts: verifies all 3 stores reset

**Ads:** AdService + AdBanner (bottom banner, free users only, "Ad supports the app")

**Dev panel:** __DEV__ testing panel on JourneyHomeScreen — manual step input, jump to checkpoint/paywall/completion, reset to walking

**Principal review grades:** Architecture A-, Code Quality A-, Security B+, Tests B+, Production Readiness C+

**Verdict:** "Exceptionally well-architected at ~40-50% completion. Needs 2-3 more sprints of integration, not a redesign."

Commit: `5de62d2` on `codex/feature-s1-04-next`

---

### Top 5 blockers before App Store:

1. Wire native SDKs (HealthKit, Health Connect, RevenueCat, expo-notifications)
2. Build `deleteUserAccount` Cloud Function (server-side)
3. Wire all screens into navigation (6 of 8 unrouted)
4. iOS Privacy Manifest (PrivacyInfo.xcprivacy)
5. Deploy Cloud Functions (`functions/package.json`)

### Recommended Sprint 4 priorities:

1. Wire full navigation graph (onboarding → airplane intro → journey home, ceremony/paywall/delete overlays)
2. Wire HealthKit (iOS) + Health Connect (Android)
3. Build + deploy `deleteUserAccount` Cloud Function
4. Seed Firestore with Everest route data
5. iOS Privacy Manifest
6. Source real milestone photography (Pexels/Pixabay)
7. Wire AdMob native module

— Codex

---

[CODEX] — March 13, 2026

✅ SPRINT 4 PHASE 1 — COMPLETE (287 tests, 16 suites, typecheck clean)

**S4-01 ✅ Ceremony → Purchase/Completion Navigation**
- `useCeremonyStore.lastDismissedAction` triggers Purchase/Completion navigation
- Dev panel: "Open Purchase" + "Open Delete Account" buttons
- RootNavigator watches ceremony store, navigates on dismiss

**S4-02 ✅ Milestone Photos Bundled**
- 16 milestone photos downloaded from Unsplash (all Unsplash License)
- Airplane intro + satellite trail map from Unsplash/NASA (Public Domain)
- All images optimized (1200px wide, 142-537KB each)
- `ASSET_LICENSES.md` + `asset-credits.ts` for compliance
- Wired to MilestoneCeremonyScreen + AirplaneIntroScreen with themed fallbacks

**S4-03 ✅ Seed Firestore**
- `seedFirestore` Cloud Function created (34 docs: RouteDoc, 16 MilestoneDocs, Pemba RouteCharacterDoc, 16 AssetBundleDocs)
- Idempotent, dev-only guard

**S4-04 ✅ Trail Map Visual**
- `TrailMapView` SVG component: projected GPS coordinates, completed/remaining trail, milestone dots, progress marker
- Wired to JourneyHomeScreen

**S4-11 ✅ Nepal Local Free Access**
- NP users skip paywall, no ads
- `isNepalLocal()` utility

**Bug fixes:**
- Checkpoint loop: `chooseKeepWalking` now clears `currentCheckpointId`, `findNextCheckpoint` skips unlocked milestones
- Memory leaks: mounted guards in 3 screens (JourneyHome, Purchase, DeleteAccount)
- Dead bundled asset: removed `TRAIL_MAP_IMAGE` require() (saved 3.4MB)
- Trail map resized: 5568x3712 (3.5MB) → 1600px (607KB)
- Navigator: extracted NOOP, memoized callbacks

**Code standards (22 findings, all fixed):**
- Centralized `colors`, `radii`, `typography`, `shadows` in theme — zero hardcoded values
- 3 ceremony strategies → single `buildCeremonyPayload()`
- 12 MMKV keys centralized in `storage-keys.ts`
- Shared `PrimaryButton` component (5 variants)
- `DEMO_JOURNEY_ID`, `PEMBA_ATTRIBUTION`, `EVEREST_ROUTE_ID` extracted as constants
- All inline shadows → tokens, all borderRadius → tokens

**Route-driven content system (architectural violation fix):**
⚠️ ARCHITECTURE.md says: "Every trail should be addable with zero code changes."
This was violated — screens hardcoded "Everest", "Pemba", "Namche", "Kathmandu" everywhere.
Fixed:
- `RouteContent` type interface: all route-specific strings (guide, onboarding, paywall, checkpoint, intro)
- `APP_STRINGS`: generic UI text (buttons, labels, errors)
- `routes/everest.ts`: Everest route content
- `routes/annapurna.ts`: Annapurna Base Camp Coming Soon placeholder
- `RouteContentProvider` context + `useRouteContent()` hook
- All 8 screen files refactored → zero hardcoded route strings in `src/screens/`
- `ComingSoonCard` component wired to JourneyHomeScreen
- Adding a new route = one content file + one registry entry + seed Firestore. Zero screen code changes.

Commits: `6785d9c`, `7bc2e11`, `2c34e5a` on `codex/feature-s1-04-next`

---

❓ FOR CLAUDE REVIEW:

Route content architecture — please review the `RouteContent` type and `useRouteContent()` pattern. Is this the right abstraction? Should we add route-level image mappings to `RouteContent` instead of the separate `milestone-images.ts` registry?

---

### What's left (Sprint 4 Phase 2+3):

**Phase 2 — Native SDKs (blocked on native builds):**
- S4-05: HealthKit iOS step source
- S4-06: Health Connect Android step source
- S4-07: AdMob native module
- S4-08: RevenueCat native module

**Phase 3 — Store Prep:**
- S4-09: iOS Privacy Manifest
- S4-10: Compliance documentation (Privacy Policy, Terms)

**UI polish (founder not happy, revisiting later):**
- Onboarding redesign: full-screen photos, swipeable carousel, introduce Pemba, animated page dots
- General UI quality pass across all screens

— Codex

---

[CODEX] — March 13, 2026

✅ FREE RETURN PATH — COMPLETE (287 tests, typecheck clean)

**Feature: Free users can return home from Namche Bazaar**

ARCHITECTURE.md says no dead ends. Free users who decline the paywall at Namche were stuck in `PAYWALL_FROZEN` forever. Now they can choose "Return Home Instead" and walk the free return path back to Kathmandu.

**Implementation:**
- New state event `USER_CHOSE_RETURN_HOME`: `PAYWALL_FROZEN` → `WALKING`
- `JourneyDoc` gains `isReturnPath: boolean` + `returnProgressMeters: number`
- `RouteDoc` gains optional `returnTotalMeters`, `returnTotalStepsCanonical`, `returnMilestoneIds`
- 4 return milestones: Namche → Phakding → Lukla → Kathmandu (19km free path)
- `JourneyProgressionService.applySteps()` detects `isReturnPath` and uses return distance/milestones
- Paywall check skipped on return path
- Completion ceremony fires when free user reaches Kathmandu
- Pemba dialogue written for all 4 return milestones
- "Return Home Instead" button on PurchaseInvitationScreen (outline variant)
- Route content system extended with `returnPath` content

**User experience:**
1. Walk Lukla → Phakding → Namche (free)
2. Paywall screen appears with 3 options: Unlock ($4.99), Return Home, Not Now
3. "Return Home" starts free return: Namche → Phakding → Lukla → Kathmandu
4. Full ceremony at each return milestone with Pemba dialogue
5. Completion ceremony in Kathmandu: "The journey was shorter, but no less real."

**Also in this commit:**
- `firebase.json`, `.firebaserc`, `functions/package.json` created for Cloud Functions deployment
- `functions/tsconfig.json` updated with `outDir`/`rootDir` for proper compilation
- Firebase CLI installed globally (awaiting `firebase login` for deployment)

— Codex
