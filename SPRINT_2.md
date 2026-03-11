# Sprint 2 — Paila (पाइला)
# Journey Layer + Step Sync + Maps

> Sprint duration: 2 weeks (target: this weekend + following week)
> Owner: Codex (implementation) + Claude (review)
> Goal: A user can sign in, start a journey, walk, see their progress on a map,
>       reach a checkpoint, and make a rest/keep walking decision.
>       No ceremony visuals yet. No paywall yet. Just the core journey loop working end to end.

---

## Sprint Goal

By end of Sprint 2, the following must be true:

```
✅ User can start a journey from the route catalog
✅ Steps sync from HealthKit (iOS) / Health Connect (Android) via MMKV → Firestore
✅ Progress updates in real time on pull-to-refresh (MMKV layer, no Firestore hit)
✅ Map shows route polyline + current position marker
✅ Checkpoint detection fires correctly
✅ Journey state machine transitions work (WALKING → PAUSED_AT_CHECKPOINT → RESTING/WALKING)
✅ Checkpoint decision sheet appears (Rest here / Keep walking today)
✅ Midnight expiry of Keep walking today works correctly
✅ JourneyHomeScreen renders from JourneyDoc + RouteDoc — no hardcoded content
✅ StaticContentRepository caches route + milestone data locally
✅ No compliance risks introduced
```

---

## User Stories

---

### S2-01 — Static Content Repository

**As a developer,**
I want a StaticContentRepository that serves RouteDoc and MilestoneDoc from local MMKV cache
so that the app never makes redundant Firestore reads for content that rarely changes.

**Acceptance criteria:**
- `StaticContentRepository` class implemented at `src/repositories/StaticContentRepository.ts`
- Reads `RouteDoc` from Firestore on first load, writes to MMKV with version key
- On subsequent reads: returns MMKV cache if `updatedAt` and `version` unchanged
- Reads all `MilestoneDoc` for a route in one batch, caches same way
- Reads `AssetBundleDoc` per milestone, caches same way
- Cache invalidated only when remote `updatedAt` or `version` changes
- Falls back to Firestore if MMKV cache is empty or stale
- Unit tested with mock Firestore + mock MMKV

**Notes:**
- This is the foundation for every screen in Sprint 2 and beyond
- Must follow Repository pattern from ENGINEERING.md
- No screen or service imports Firestore directly

---

### S2-02 — Journey Creation

**As a user,**
I want to start a journey on a route
so that my steps begin counting toward Base Camp.

**Acceptance criteria:**
- `JourneyService.startJourney(userId, routeId)` creates a new `JourneyDoc` in Firestore
- Initial state:
  - `journeyState: 'WALKING'`
  - `progressMeters: 0`
  - `currentMilestoneIndex: 0`
  - `pausedAtCheckpoint: false`
  - `keepWalkingToday: false`
  - `keepWalkingExpiresAt: null`
  - `purchaseState: 'free'`
  - `frozenAtPaywall: false`
- Journey creation is a client write (user owns their journey doc)
- `users/{userId}.activeJourneyId` updated to new journeyId
- Only one active journey per user at a time — enforced
- Unit tested

---

### S2-03 — Step Sync Service (HealthKit / Health Connect)

**As a user,**
I want my steps to sync from my Apple Watch or phone
so that my walking progress is captured accurately.

**Acceptance criteria:**
- `StepSyncService` implemented at `src/services/step-sync/StepSyncService.ts`
- `StepProviderFactory` selects HealthKit on iOS, Health Connect on Android, pedometer as fallback
- On app foreground / pull-to-refresh:
  1. Read today's step total from HealthKit/HC (unlimited, no rate limit)
  2. Write to MMKV: `steps:{localDate}` → `{ count, lastReadAt }`
  3. UI updates immediately from MMKV
- Firestore write triggered ONLY on:
  - Checkpoint reached
  - User chooses Rest here or Keep walking today
  - App backgrounds after step gain > 0
  - Midnight boundary (end of day)
- MMKV entries older than today cleared on app open
- HealthKit permission request handled gracefully (denied state shown clearly)
- Unit tested with mock step providers

**Step source priority:**
```
1. HealthKit (iOS) / Health Connect (Android)
2. Phone pedometer (fallback)
Never: manual entry
```

---

### S2-04 — Journey Progression Engine

**As the system,**
I want a JourneyProgressionService that applies steps to the journey
so that progress is computed correctly and consistently.

**Acceptance criteria:**
- `JourneyProgressionService` implemented at `src/services/journey/JourneyProgressionService.ts`
- `applySteps(journey, route, milestones, steps)` returns updated `JourneyDoc` + optional `JourneyEvent`
- Computes `progressMeters` from steps × metersPerStep
- Caps `progressMeters` at `route.totalMeters`
- Detects checkpoint arrival: `progressMeters >= milestone.triggerMeters`
- On checkpoint arrival:
  - Sets `journeyState: 'PAUSED_AT_CHECKPOINT'`
  - Sets `pausedAtCheckpoint: true`
  - Sets `currentCheckpointId` to arrived milestone ID
  - Emits `CHECKPOINT_ARRIVED` event
- Updates streak + lastStepDate
- Never mutates Firestore directly — returns updated doc, caller writes
- Unit tested with full state machine coverage

---

### S2-05 — Journey State Machine

**As the system,**
I want a JourneyStateMachine class that validates all state transitions
so that invalid transitions are caught and logged rather than silently corrupting state.

**Acceptance criteria:**
- `JourneyStateMachine` implemented at `src/services/journey/JourneyStateMachine.ts`
- All transitions from ARCHITECTURE.md implemented:
  ```
  WALKING → PAUSED_AT_CHECKPOINT   (checkpoint reached)
  WALKING → PAYWALL_FROZEN          (paywall reached)
  WALKING → RESTING                 (midnight)
  WALKING → COMPLETED               (Base Camp)
  PAUSED_AT_CHECKPOINT → RESTING    (Rest here)
  PAUSED_AT_CHECKPOINT → WALKING    (Keep walking today)
  RESTING → WALKING                 (new day, app opened)
  PAYWALL_FROZEN → WALKING          (purchase confirmed)
  ```
- Invalid transitions throw `InvalidStateTransitionError`
- Unit tested — every valid transition + every invalid transition tested

---

### S2-06 — Midnight Boundary Handler

**As the system,**
I want the app to detect when a new day has started
so that Keep walking today expires correctly and tomorrow starts fresh.

**Acceptance criteria:**
- On app foreground, compare current local date to `lastStepDate` in JourneyDoc
- If new day detected:
  - If `journeyState` was `WALKING` or `PAUSED_AT_CHECKPOINT` → transition to `RESTING`
  - Clear `keepWalkingToday`, `keepWalkingExpiresAt`
  - Clear today's MMKV step cache
  - Write updated JourneyDoc to Firestore
- `keepWalkingExpiresAt` is local midnight ISO string — checked on every foreground open
- If expired → treat as `RESTING`, clear flag
- Unit tested with mocked dates

---

### S2-07 — Mapbox Integration

**As a user,**
I want to see my route on a map with my current position
so that I can visualize how far I've walked.

**Acceptance criteria:**
- Mapbox SDK installed and initialized
- Route polyline rendered from `RouteDoc.polylineRef`
- Map bounds fit to `RouteDoc.bounds` on load
- Milestone markers placed at `milestone.triggerMeters` position along polyline
- Current progress marker moves as `progressMeters` updates
- Map tiles prefetched for active route region on first load
- Map renders offline after first load (cached tiles)
- Mapbox token stored in EAS Secrets — never hardcoded
- Generic map component: `<RouteMap route={route} journey={journey} milestones={milestones} />`
- No route-specific logic inside the map component

**Notes:**
- Use `@rnmapbox/maps`
- Map is a component, not a screen — embedded in JourneyHomeScreen

---

### S2-08 — Journey Home Screen

**As a user,**
I want a home screen that shows my journey progress
so that I can see how far I've walked and what's ahead.

**Acceptance criteria:**
- `JourneyHomeScreen` implemented at `src/screens/journey/JourneyHomeScreen.tsx`
- Reads from `useJourneyStore` — no direct Firestore access
- Displays:
  - Route map with progress marker
  - Steps today (from MMKV — live, pull-to-refresh)
  - Progress meters + percent
  - Current checkpoint name
  - Next checkpoint name + distance remaining
  - Streak days
  - Journey state indicator (WALKING / PAUSED / RESTING)
- Pull-to-refresh triggers HealthKit read → MMKV update → UI update (no Firestore hit)
- All copy parameterized from `RouteDoc` + `MilestoneDoc` — nothing hardcoded
- Error boundary wrapping the screen
- Loading state while data loads
- No business logic in the screen — delegates to `useJourneyProgression` hook

---

### S2-09 — Checkpoint Decision Sheet

**As a user,**
I want a sheet that appears when I reach a checkpoint
so that I can choose to rest here or keep walking today.

**Acceptance criteria:**
- `CheckpointDecisionSheet` implemented at `src/screens/journey/CheckpointDecisionSheet.tsx`
- Appears automatically when `journeyState === 'PAUSED_AT_CHECKPOINT'`
- Displays:
  - Checkpoint name (from MilestoneDoc)
  - Steps walked today
  - Distance reached
  - Two choices: `Rest here` and `Keep walking today`
- `Rest here`:
  - Transitions `journeyState → RESTING`
  - Writes ledger entry + updated JourneyDoc to Firestore
  - Sheet dismisses
- `Keep walking today`:
  - Transitions `journeyState → WALKING`
  - Sets `keepWalkingToday: true`
  - Sets `keepWalkingExpiresAt` to local midnight ISO string
  - Writes updated JourneyDoc to Firestore
  - Sheet dismisses
- Cannot be dismissed without making a choice
- Unit tested for both choices

---

### S2-10 — Journey Zustand Store

**As a developer,**
I want a Zustand store for journey state
so that all screens share a single source of truth without direct Firestore access.

**Acceptance criteria:**
- `useJourneyStore` implemented at `src/stores/useJourneyStore.ts`
- Holds: `journey`, `route`, `milestones`, `isLoading`, `error`
- `loadJourney(userId)` → calls `JourneyService`, populates store
- `applyForegroundSteps()` → calls `StepSyncService`, updates store
- `chooseRest()` → calls `JourneyProgressionService`, writes to Firestore, updates store
- `chooseKeepWalking()` → same pattern
- Store never imports Firestore directly
- Selectors exported for derived state:
  - `isAtCheckpoint`
  - `isPaywallFrozen`
  - `isCompleted`
  - `todaySteps` (reads from MMKV)
- Unit tested

---

## What is explicitly OUT OF SCOPE for Sprint 2

```
❌ Milestone ceremony visuals (Sprint 3)
❌ Paywall screen (Sprint 3)
❌ RevenueCat / purchase flow (Sprint 3)
❌ Real photos / videos / audio (Sprint 3+)
❌ Onboarding flow (Sprint 3)
❌ Delete Account screen (Sprint 3)
❌ Nepal local detection (post-MVP)
❌ Badges (Sprint 4)
❌ Notifications (post-MVP)
❌ Share card (post-MVP)
❌ Weather integration (Sprint 3)
```

---

## Sprint 2 — Definition of Done

Sprint 2 is complete when:

- [ ] All 10 user stories accepted by Claude
- [ ] User can start a journey end-to-end on iOS
- [ ] Steps sync from HealthKit and display live on JourneyHomeScreen
- [ ] Map renders route with progress marker
- [ ] Checkpoint detection fires correctly
- [ ] Rest here and Keep walking today both work and write to Firestore
- [ ] Midnight expiry works correctly
- [ ] All unit tests passing
- [ ] CI pipeline green on PR
- [ ] Zero compliance risks flagged
- [ ] Claude has reviewed and approved all code before merge

---

## Handoff Note to Codex

Read the new **Step Sync Architecture** section in `ARCHITECTURE.md` before writing a single line of S2-03.
The old 10/day rate limit model is replaced. Follow the three-layer model exactly.

Start with **S2-01** (StaticContentRepository) — everything else depends on it.
Then **S2-05** (State Machine) — progression depends on this.
Then **S2-04** (Progression Engine) — store and screens depend on this.
Then **S2-10** (Zustand Store) — screens depend on this.
Then **S2-02, S2-03, S2-06, S2-07, S2-08, S2-09** in parallel where possible.

The order matters. Don't build screens before the services and stores are in place.

Flag any technical concerns in `CLAUDE_CODEX_CHAT.md` before implementing — not after.

— Claude
