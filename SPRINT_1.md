# Sprint 1 — Paila (पाइला)
# App Scaffold + Firebase + Auth + Core Data Layer

> Sprint duration: 2 weeks
> Owner: Codex (implementation) + Claude (review)
> Goal: A working app shell that boots, authenticates a user, connects to Firebase, and has the full data layer in place. No journey screens yet. No steps yet. Just the unbreakable foundation.

---

## Sprint Goal

By end of Sprint 1, the following must be true:

```
✅ App boots on iOS simulator and Android emulator
✅ User can sign in with Apple (iOS) and Google (Android)
✅ Firebase dev project connected and verified
✅ Firestore security rules deployed and tested
✅ Full schema types in place (Zod + TypeScript)
✅ Firestore collection paths locked
✅ Environment switching works (dev vs prod)
✅ EAS build profiles configured
✅ CI pipeline runs on every PR
✅ No compliance risks introduced
```

---

## User Stories

---

### S1-01 — App Scaffold

**As a developer,**
I want a working Expo Prebuild project with the correct native config
so that we have a stable foundation to build on.

**Acceptance criteria:**
- Expo project initialized with `expo prebuild`
- TypeScript configured and strict
- Hermes engine enabled
- New Architecture (Fabric + JSI) enabled
- React Navigation installed and shell navigator in place (no screens yet — just the navigator)
- `react-native-mmkv` installed and verified working
- App boots on iOS simulator without errors
- App boots on Android emulator without errors
- No console warnings on clean boot

**Out of scope:** Any screens, any UI, any Firebase connection.

---

### S1-02 — Environment Configuration

**As a developer,**
I want clean dev/prod environment separation
so that we never accidentally touch production data during development.

**Acceptance criteria:**
- `dev` environment points to `paila-dev` Firebase project
- `prod` environment points to `paila-prod` Firebase project
- Firebase config files loaded via environment at build time (NOT committed to repo)
- EAS build profiles configured: `development`, `production`
- `APP_ENV` variable drives which Firebase config is loaded
- Switching environments requires a rebuild — no runtime toggle
- `.gitignore` explicitly excludes all Firebase config files

**Notes:**
- Firebase config files live in founder's Documents folder (outside repo)
- Codex to document exactly where EAS expects them for local builds

---

### S1-03 — Firebase Connection

**As a developer,**
I want Firebase initialized and verified in the app
so that all subsequent features can read and write Firestore.

**Acceptance criteria:**
- Firebase SDK initialized on app start
- Firestore offline persistence enabled
- Firebase App Check configured (dev: debug token, prod: DeviceCheck/Play Integrity)
- Firebase Crashlytics initialized
- A test Firestore read succeeds against `paila-dev` on app boot (dev only — remove before prod)
- No Firebase errors on clean boot

---

### S1-04 — Authentication — Apple Sign In

**As a user on iOS,**
I want to sign in with Apple
so that I can securely access my journey without creating a new account.

**Acceptance criteria:**
- Apple Sign In implemented via Firebase Auth
- First sign in creates a user document at `users/{userId}`
- Subsequent sign ins restore existing session
- Auth state persists across app restarts
- Sign out clears local state cleanly
- `Info.plist` has correct `NSFaceIDUsageDescription` and Sign In with Apple entitlement
- Tested on iOS simulator

**Compliance:**
- 🚨 Apple Sign In is REQUIRED by App Store — must be the primary option on iOS
- User document created server-side via Cloud Function, not client write

---

### S1-05 — Authentication — Google Sign In

**As a user on Android,**
I want to sign in with Google
so that I can securely access my journey.

**Acceptance criteria:**
- Google Sign In implemented via Firebase Auth
- Same user document creation flow as Apple Sign In
- Auth state persists across app restarts
- Sign out clears local state cleanly
- Tested on Android emulator

---

### S1-06 — User Document Creation (Cloud Function)

**As the system,**
I want a Cloud Function that creates the user document on first sign in
so that client code never writes directly to the users collection.

**Acceptance criteria:**
- `onUserCreated()` Cloud Function triggers on Firebase Auth `onCreate`
- Creates `users/{userId}` document with:
  - `uid`
  - `createdAt`
  - `displayName` (from auth provider)
  - `email`
  - `timezone` (left null — set on first app open)
  - `accessTier: 'standard_free'`
  - `isNepalLocal: false` (default)
- Does NOT create journey — that's Sprint 2
- Unit tested
- Deployed to `paila-dev`

---

### S1-07 — Firestore Security Rules

**As the system,**
I want Firestore security rules that protect all collections
so that no client can read or write data it shouldn't.

**Acceptance criteria:**
- Rules deployed to `paila-dev`
- `users/{userId}` — authenticated user can read/write own doc only
- `users/{userId}/journeys/{journeyId}` — authenticated user can read own journey, cannot write directly (Cloud Functions only)
- `users/{userId}/journeys/{journeyId}/ledger/{date}` — no client writes ever
- `routes/{routeId}` — any authenticated user can read if `isPublished: true`
- `routes/{routeId}/milestones/{milestoneId}` — same as routes
- `assetBundles/{id}` — any authenticated user can read
- `contentPacks/{id}` — any authenticated user can read
- `badges/{id}` — any authenticated user can read
- `weatherCache/{id}` — no client reads or writes (Cloud Function only)
- All rules covered by Firestore rules unit tests (`@firebase/rules-unit-testing`)

---

### S1-08 — Core Schemas (Zod + TypeScript)

**As a developer,**
I want all Zod schemas and TypeScript types finalized and exported from `src/shared/schemas.ts`
so that every layer of the app shares the same type contracts.

**Acceptance criteria:**
- All schemas from the current `schemas.ts` reviewed and confirmed correct
- `StepSource` = `'healthkit' | 'health_connect' | 'phone_pedometer'` — no `'manual'`
- `JourneyState` type added: `'WALKING' | 'PAUSED_AT_CHECKPOINT' | 'RESTING' | 'PAYWALL_FROZEN' | 'COMPLETED'`
- `JourneyDoc` includes new progression fields:
  - `journeyState: JourneyState`
  - `pausedAtCheckpoint: boolean`
  - `keepWalkingToday: boolean`
  - `keepWalkingExpiresAt: string | null` (ISO local midnight)
  - `lastClaimedSourceStepsToday: number`
  - `currentCheckpointId: string | null`
- `JourneyStepLedger` updated to support multiple checkpoint arrivals per day
- All schemas have `.parse()` and `.safeParse()` tested with valid + invalid inputs
- Shared between `src/` (app) and `functions/src/` (Cloud Functions) — single source of truth

---

### S1-09 — Firestore Collection Paths

**As a developer,**
I want all Firestore collection and document paths defined in `src/shared/paths.ts`
so that no path string is ever hardcoded outside this file.

**Acceptance criteria:**
- All collection paths from current `paths.ts` verified correct
- Every path used in Cloud Functions and app code references `paths.ts`
- No raw string paths anywhere in the codebase
- Reviewed and signed off by Claude before Sprint 1 closes

---

### S1-10 — EAS Build + CI Pipeline

**As a developer,**
I want EAS build configured and a GitHub Actions CI pipeline running
so that every PR is automatically validated.

**Acceptance criteria:**
- `eas.json` configured with `development` and `production` profiles
- GitHub Actions workflow runs on every PR:
  - TypeScript type check (`tsc --noEmit`)
  - Unit tests (`jest`)
  - Firestore rules tests
  - Lint (`eslint`)
- CI must pass before any PR can merge
- EAS dev build runs successfully on local machine (founder + Codex verified)

---

## What is explicitly OUT OF SCOPE for Sprint 1

```
❌ Any journey screens (Sprint 2)
❌ Step sync / HealthKit (Sprint 2)
❌ JourneyHomeScreen (Sprint 2)
❌ Milestone ceremony (Sprint 3)
❌ Paywall / RevenueCat (Sprint 3)
❌ Maps / Mapbox (Sprint 2)
❌ Any content or assets (Sprint 3+)
❌ Notifications (post-MVP)
❌ Nepal local detection (post-MVP)
❌ Badges (Sprint 4)
```

---

## Sprint 1 — Definition of Done

Sprint 1 is complete when:

- [ ] All 10 user stories accepted by Claude
- [ ] App boots clean on iOS simulator + Android emulator
- [ ] Apple Sign In working end-to-end on iOS
- [ ] Google Sign In working end-to-end on Android
- [ ] Firestore security rules deployed + all tests passing
- [ ] Schemas finalized + reviewed by Claude
- [ ] CI pipeline green on a clean PR
- [ ] Zero compliance risks flagged
- [ ] Claude has reviewed and approved all code before merge

---

## Handoff Note to Codex

Read `AGENTS.md` before starting. Read `ARCHITECTURE.md` before touching any schema or data model.

Start with **S1-01** (scaffold) then **S1-02** (environments) before touching Firebase. Getting the scaffold and environments right first means every subsequent story builds on a clean base.

Flag any technical concerns in `CLAUDE_CODEX_CHAT.md` before implementing — not after.

— Claude

---
