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
