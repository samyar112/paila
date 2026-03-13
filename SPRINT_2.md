# Sprint 2 — Paila (पाइला)
# Journey Layer + Step Sync

> Owner: Codex (implementation) + Claude (review)
> Goal: Core journey loop working end to end — start journey, walk, reach checkpoint, decide.
> Architecture details: see ARCHITECTURE.md. This file covers sprint scope and acceptance criteria only.

---

## Sprint Goal

```
✅ User can start a journey from the route catalog
✅ Steps sync from HealthKit (iOS) / Health Connect (Android) via MMKV → Firestore
✅ Progress updates in real time on pull-to-refresh (MMKV layer, no Firestore hit)
✅ Map placeholder in JourneyHomeScreen (full map UX deferred)
✅ Checkpoint detection fires correctly
✅ Journey state machine transitions work
✅ Checkpoint decision sheet appears (Rest here / Keep walking today)
✅ Midnight expiry of Keep walking today works correctly
✅ JourneyHomeScreen renders from JourneyDoc + RouteDoc — no hardcoded content
✅ StaticContentRepository caches route + milestone data locally
✅ No compliance risks introduced
```

---

## User Stories

### S2-01 — Static Content Repository

**As a developer,** I want a StaticContentRepository that serves RouteDoc and MilestoneDoc from local MMKV cache so the app never makes redundant Firestore reads.

**Acceptance criteria:**
- `StaticContentRepository` at `src/repositories/StaticContentRepository.ts`
- Reads RouteDoc from Firestore on first load, writes to MMKV with version key
- On subsequent reads: returns MMKV cache if `updatedAt` and `version` unchanged
- Reads all MilestoneDoc for a route in one batch, caches same way
- Reads AssetBundleDoc per milestone, caches same way
- Falls back to Firestore if cache is empty or stale
- Unit tested with mock Firestore + mock MMKV

---

### S2-02 — Journey Creation

**As a user,** I want to start a journey on a route so that my steps begin counting toward the summit.

**Acceptance criteria:**
- `JourneyService.startJourney(userId, routeId)` creates a JourneyDoc in Firestore
- Initial state: `journeyState: 'WALKING'`, `progressMeters: 0`, `pausedAtCheckpoint: false`, `keepWalkingToday: false`, `purchaseState: 'free'`, `frozenAtPaywall: false`
- `users/{userId}.activeJourneyId` updated to new journeyId
- Only one active journey per user — enforced
- Unit tested

---

### S2-03 — Step Sync Service (HealthKit / Health Connect)

**As a user,** I want my steps to sync from my phone so that my walking progress is captured.

**Acceptance criteria:**
- `StepSyncService` at `src/services/step-sync/StepSyncService.ts`
- `StepProviderFactory` selects HealthKit (iOS), Health Connect (Android), pedometer as fallback
- On app foreground / pull-to-refresh: read today's steps → write to MMKV → UI updates immediately
- Firestore write triggered ONLY on: checkpoint reached, rest/keep walking choice, app backgrounds after step gain, midnight boundary
- MMKV entries older than today cleared on app open
- HealthKit permission request handled gracefully
- Unit tested with mock step providers

---

### S2-04 — Journey Progression Engine

**As the system,** I want a JourneyProgressionService that applies steps to the journey correctly.

**Acceptance criteria:**
- `JourneyProgressionService` at `src/services/journey/JourneyProgressionService.ts`
- `applySteps(journey, route, milestones, steps)` returns updated JourneyDoc + optional JourneyEvent
- Computes `progressMeters` from steps x metersPerStep
- Caps `progressMeters` at `route.totalMeters`
- Detects checkpoint arrival: `progressMeters >= milestone.triggerMeters`
- On arrival: sets `journeyState: 'PAUSED_AT_CHECKPOINT'`, emits `CHECKPOINT_ARRIVED`
- Never mutates Firestore directly — returns updated doc, caller writes
- Unit tested with full state machine coverage

---

### S2-05 — Journey State Machine

**As the system,** I want a JourneyStateMachine that validates all state transitions.

**Acceptance criteria:**
- `JourneyStateMachine` at `src/services/journey/JourneyStateMachine.ts`
- All transitions from ARCHITECTURE.md implemented
- Invalid transitions throw `InvalidStateTransitionError`
- Unit tested — every valid + every invalid transition

---

### S2-06 — Midnight Boundary Handler

**As the system,** I want the app to detect new days so Keep walking today expires correctly.

**Acceptance criteria:**
- On app foreground, compare current local date to `lastStepDate`
- If new day: transition to RESTING, clear keepWalkingToday flags, clear MMKV step cache, write to Firestore
- `keepWalkingExpiresAt` checked on every foreground open
- Unit tested with mocked dates

---

### S2-07 — Elevation Profile View

**As a user,** I want to see my position on the mountain so I can visualize my climb.

**Acceptance criteria:**
- `ElevationProfile` component at `src/components/journey/ElevationProfile.tsx`
- Renders a side-view altitude cross-section of the route from `RouteDoc.elevationProfile`
- User's current position shown as an animated dot on the curve
- Milestone markers at each checkpoint's altitude
- Rendered with `react-native-svg` — no map SDK
- Altitude data bundled in RouteDoc, works fully offline
- Generic component — route-agnostic, reads from RouteDoc only

---

### S2-08 — Journey Home Screen

**As a user,** I want a home screen that shows my journey progress.

**Acceptance criteria:**
- `JourneyHomeScreen` at `src/screens/journey/JourneyHomeScreen.tsx`
- Reads from `useJourneyStore` — no direct Firestore access
- Displays: elevation profile with current position, steps today (from MMKV), progress meters + percent, current/next checkpoint, streak, journey state
- Pull-to-refresh triggers HealthKit read → MMKV update → UI update (no Firestore hit)
- All copy parameterized from RouteDoc + MilestoneDoc
- Error boundary wrapping the screen
- No business logic in the screen

---

### S2-09 — Checkpoint Decision Sheet

**As a user,** I want to choose Rest here or Keep walking today when I reach a checkpoint.

**Acceptance criteria:**
- `CheckpointDecisionSheet` at `src/screens/journey/CheckpointDecisionSheet.tsx`
- Appears when `journeyState === 'PAUSED_AT_CHECKPOINT'`
- Displays: checkpoint name, steps today, distance reached
- Rest here: transitions to RESTING, writes ledger + JourneyDoc to Firestore
- Keep walking today: transitions to WALKING, sets keepWalkingExpiresAt to local midnight
- Cannot be dismissed without making a choice
- Unit tested for both choices

---

### S2-10 — Journey Zustand Store

**As a developer,** I want a Zustand store for journey state so all screens share a single source of truth.

**Acceptance criteria:**
- `useJourneyStore` at `src/stores/useJourneyStore.ts`
- Holds: journey, route, milestones, isLoading, error
- Actions: `loadJourney`, `applyForegroundSteps`, `chooseRest`, `chooseKeepWalking`
- Store never imports Firestore directly
- Selectors: `isAtCheckpoint`, `isPaywallFrozen`, `isCompleted`, `todaySteps`
- Unit tested

---

## Out of Scope

```
❌ Milestone ceremony visuals (Sprint 3)
❌ Paywall screen / RevenueCat (Sprint 3)
❌ Real photos / videos / audio (Sprint 3+)
❌ Onboarding flow (Sprint 3)
❌ Delete Account screen (Sprint 3)
❌ Supporting character dialogue (Sprint 3+)
❌ Nepal local detection (post-MVP)
❌ Badges (Sprint 4)
❌ Notifications (post-MVP)
❌ Weather integration (Sprint 3)
```

---

## Definition of Done

- [ ] All 10 user stories accepted by Claude
- [ ] User can start a journey end-to-end on iOS
- [ ] Steps sync from HealthKit and display live on JourneyHomeScreen
- [ ] Map placeholder renders in JourneyHomeScreen
- [ ] Checkpoint detection fires correctly
- [ ] Rest here and Keep walking today both work
- [ ] Midnight expiry works correctly
- [ ] All unit tests passing
- [ ] Zero compliance risks flagged
- [ ] Claude has reviewed and approved all code before merge

---

## Build Order

```
S2-01 (StaticContentRepository) → S2-05 (State Machine) → S2-04 (Progression Engine)
→ S2-10 (Zustand Store) → S2-02 (Journey Creation) → S2-03 (Step Sync)
→ S2-06 (Midnight Handler) → S2-08 (JourneyHomeScreen) → S2-09 (CheckpointDecisionSheet)
```

Do NOT build screens before services and stores are in place.
