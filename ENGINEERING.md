# ENGINEERING.md — Paila (पाइला)

> Software design standards and engineering practices.
> Read this alongside AGENTS.md and SECURITY.md before every task.
> Architectural boundaries in this file are non-negotiable. Style heuristics are strong defaults and can be bent with clear justification.
> Last updated: March 2026
> Maintained by: Claude (Architect) + Codex (Developer)

---

## The Engineering North Star

> *"Code that is simple, honest, and maintainable is code that serves the journey.
>  Clever code that nobody can read is a liability disguised as a feature."*

Paila is built to last. Not just for MVP — for the next 10 routes, the next 100,000 users, and the next developer who reads this code. Every engineering decision must serve that goal.

---

## 1. Core Design Principles

### Single Responsibility Principle (SRP)
Every class, module, and function does ONE thing and does it well.

```typescript
// ❌ WRONG — one function doing too much
async function handleAppOpen(userId: string) {
  // reads steps
  // updates journey
  // checks paywall
  // fires ceremony
  // updates UI
}

// ✅ RIGHT — each concern separated
const steps = await StepSyncService.claimTodaySteps(userId);
const journey = await JourneyProgressionService.applySteps(journeyId, steps);
const event = JourneyEventDetector.detect(journey);
if (event) await CeremonyOrchestrator.fire(event);
```

### Open/Closed Principle (OCP)
Open for extension, closed for modification.
New routes, new ceremony types, new badge rules — all via configuration, not code changes.

```typescript
// ❌ WRONG — adding a new route requires code changes
if (route.slug === 'ebc') { ... }
if (route.slug === 'abc') { ... }

// ✅ RIGHT — route behavior driven by RouteDoc config
const handler = CeremonyHandlerRegistry.get(milestone.ceremonyType);
handler.execute(milestone, journey, route);
```

### Liskov Substitution Principle (LSP)
Any service implementation can be swapped for another without breaking callers.

```typescript
// ✅ RIGHT — callers depend on the interface, not the implementation
interface StepProvider {
  getTodaySteps(userId: string, date: string): Promise<StepReading>;
}

class HealthKitStepProvider implements StepProvider { ... }
class HealthConnectStepProvider implements StepProvider { ... }
class PedometerStepProvider implements StepProvider { ... }
```

### Interface Segregation Principle (ISP)
Don't force a class to implement interfaces it doesn't need. Keep interfaces small and focused.

### Dependency Inversion Principle (DIP)
Depend on abstractions, not concretions. High-level modules don't import low-level modules directly.

```typescript
// ❌ WRONG — JourneyService directly imports Firestore
import { getFirestore } from 'firebase/firestore';

// ✅ RIGHT — JourneyService depends on a repository interface
class JourneyService {
  constructor(private readonly repo: JourneyRepository) {}
}
```

---

## 2. Architecture Patterns

### Repository Pattern (Data Access Layer)
All Firestore reads and writes go through repository classes. No screen or service imports Firestore directly.

```
Screens / Hooks
    ↓
Services (business logic)
    ↓
Repositories (data access)
    ↓
Firestore / MMKV / Filesystem
```

```typescript
// Repository interface
interface JourneyRepository {
  getActiveJourney(userId: string): Promise<JourneyDoc | null>;
  updateJourney(userId: string, journeyId: string, data: Partial<JourneyDoc>): Promise<void>;
  appendLedgerEntry(userId: string, journeyId: string, entry: JourneyLedgerDoc): Promise<void>;
}

// Concrete implementation
class FirestoreJourneyRepository implements JourneyRepository { ... }

// Test/mock implementation
class InMemoryJourneyRepository implements JourneyRepository { ... }
```

### Service Layer (Business Logic)
All business logic lives in service classes. Nothing complex in screens or hooks.

```
Services we need:
  StepSyncService          → reads HealthKit/HC, computes claimable delta
  JourneyProgressionService → applies steps, detects checkpoint arrival
  CeremonyOrchestrator     → fires milestone ceremonies
  PaywallService           → manages paywall freeze/unfreeze
  EntitlementService       → validates purchases via RevenueCat
  ContentPackService       → downloads and verifies premium packs
  WeatherService           → cache-first weather reads
  StaticContentRepository  → caches route/milestone docs locally
  AssetResolver            → resolves asset keys to local paths
  BadgeService             → evaluates and awards badges
```

### Observer / Event Pattern (Journey Events)
Journey state changes emit events. Screens and services react to events — they don't poll state.

```typescript
type JourneyEvent =
  | { type: 'CHECKPOINT_ARRIVED'; milestone: MilestoneDoc }
  | { type: 'PAYWALL_REACHED'; milestone: MilestoneDoc }
  | { type: 'JOURNEY_COMPLETED' }
  | { type: 'BADGE_UNLOCKED'; badge: BadgeDoc };

// JourneyProgressionService emits events
// Screens subscribe to events via Zustand or React context
```

### Factory Pattern (Step Providers)
Step provider selection is encapsulated in a factory — callers don't decide which provider to use.

```typescript
class StepProviderFactory {
  static create(platform: 'ios' | 'android'): StepProvider {
    if (platform === 'ios') return new HealthKitStepProvider();
    return new HealthConnectStepProvider();
  }

  static createWithFallback(platform: 'ios' | 'android'): StepProvider {
    return new FallbackStepProvider([
      StepProviderFactory.create(platform),
      new PedometerStepProvider(),
    ]);
  }
}
```

### Strategy Pattern (Ceremony Types)
Ceremony behavior is a strategy — each ceremony type implements the same interface.

```typescript
interface CeremonyStrategy {
  execute(context: CeremonyContext): Promise<CeremonyResult>;
}

class StandardCeremonyStrategy implements CeremonyStrategy { ... }
class PaywallCeremonyStrategy implements CeremonyStrategy { ... }
class CompletionCeremonyStrategy implements CeremonyStrategy { ... }

const registry: Record<CeremonyType, CeremonyStrategy> = {
  standard: new StandardCeremonyStrategy(),
  paywall: new PaywallCeremonyStrategy(),
  completion: new CompletionCeremonyStrategy(),
};
```

### State Machine (Journey Progression)
Journey state transitions are explicit and validated — no ad hoc state mutation.

```typescript
// From ARCHITECTURE.md — implemented as a real state machine
type JourneyState =
  | 'WALKING'
  | 'PAUSED_AT_CHECKPOINT'
  | 'RESTING'
  | 'PAYWALL_FROZEN'
  | 'COMPLETED';

class JourneyStateMachine {
  static transition(
    current: JourneyState,
    event: JourneyStateEvent,
  ): JourneyState {
    const transitions: Record<JourneyState, Partial<Record<JourneyStateEvent, JourneyState>>> = {
      WALKING: {
        CHECKPOINT_REACHED: 'PAUSED_AT_CHECKPOINT',
        PAYWALL_REACHED: 'PAYWALL_FROZEN',
        MIDNIGHT: 'RESTING',
        BASE_CAMP_REACHED: 'COMPLETED',
      },
      PAUSED_AT_CHECKPOINT: {
        USER_CHOSE_REST: 'RESTING',
        USER_CHOSE_KEEP_WALKING: 'WALKING',
      },
      RESTING: {
        NEW_DAY_OPENED: 'WALKING',
      },
      PAYWALL_FROZEN: {
        PURCHASE_CONFIRMED: 'WALKING',
      },
      COMPLETED: {},
    };

    const next = transitions[current]?.[event];
    if (!next) {
      throw new InvalidStateTransitionError(current, event);
    }
    return next;
  }
}
```

---

## 3. TypeScript Standards

### Strict Mode — Always On
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### No `any` — Ever
```typescript
// ❌ WRONG
const data: any = await fetchSomething();

// ✅ RIGHT — use unknown + Zod to parse external data
const result = journeySchema.safeParse(data);
if (!result.success) throw new ValidationError(result.error);
const journey: JourneyDoc = result.data;
```

### Zod as the Single Validation Layer
All external data (Firestore, API responses, deep links) validated through Zod schemas before use.
Schemas live in `src/shared/schemas.ts` — shared between app and Cloud Functions.

```typescript
// ✅ Always parse before using external data
const snapshot = stepSnapshotSchema.parse(firestoreData);
```

### Explicit Return Types on All Public Functions
```typescript
// ❌ WRONG — inferred return type is fragile
async function getJourney(userId: string) { ... }

// ✅ RIGHT — explicit return type is a contract
async function getJourney(userId: string): Promise<JourneyDoc | null> { ... }
```

### Discriminated Unions for Results
```typescript
// ✅ Use Result types instead of throwing everywhere
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

async function claimSteps(userId: string): Promise<Result<StepClaim>> { ... }
```

### Immutability
```typescript
// ✅ Prefer readonly and const
const journey = Object.freeze({ ...journeyData });
type ReadonlyJourney = Readonly<JourneyDoc>;
```

---

## 4. React Native / Component Standards

### Component Structure
```
Every component follows this structure:
  1. Imports
  2. Types / interfaces
  3. Component function
  4. Styles (StyleSheet.create at bottom)
  5. Export

Preferred component size: under ~200 lines.
If it grows past that, split it unless keeping it together is clearly easier to understand.
```

### Smart vs Dumb Components
```
Smart (container) components:
  → Connect to state (Zustand)
  → Call services
  → Handle side effects
  → Named: JourneyHomeScreen, MilestoneCeremonyScreen

Dumb (presentational) components:
  → Accept only props
  → No direct state access
  → No service calls
  → Easily testable in isolation
  → Named: MilestoneCard, StreakBadge, StepCounter
```

### Hooks for Logic Reuse
```typescript
// ✅ Extract complex logic into custom hooks
function useJourneyProgression(journeyId: string) {
  // all progression state and logic here
  return { journey, isLoading, applySteps, chooseRest, chooseKeepWalking };
}

// Screen just uses the hook
function JourneyHomeScreen() {
  const { journey, applySteps } = useJourneyProgression(activeJourneyId);
  ...
}
```

### No Business Logic in Screens
```typescript
// ❌ WRONG — business logic in a screen
function JourneyHomeScreen() {
  const handleOpen = async () => {
    const steps = await HealthKit.getStepCount();
    const delta = steps - lastClaimed;
    if (delta > 0) {
      await firestore.collection('journeys').doc(id).update({ ... });
    }
  };
}

// ✅ RIGHT — screen delegates to service
function JourneyHomeScreen() {
  const handleOpen = async () => {
    await StepSyncService.claimForegroundSteps(userId);
  };
}
```

### Error Boundaries on Every Screen
```typescript
// ✅ Wrap every screen in an error boundary
<ErrorBoundary fallback={<ErrorScreen />}>
  <JourneyHomeScreen />
</ErrorBoundary>
```

---

## 5. State Management (Zustand)

### Store Structure
```
One store per domain — not one global store:

  useJourneyStore     → active journey, progression state
  useAuthStore        → auth state, user doc
  useRouteStore       → active route, milestones
  useContentStore     → downloaded content pack state
  useCeremonyStore    → ceremony queue and display state
```

### No Direct Firestore Access from Stores
```typescript
// ❌ WRONG — store imports Firestore
const useJourneyStore = create(() => ({
  loadJourney: async (id) => {
    const snap = await getFirestore().collection('journeys').doc(id).get();
    ...
  }
}));

// ✅ RIGHT — store calls a service
const useJourneyStore = create(() => ({
  loadJourney: async (id) => {
    const journey = await JourneyService.getJourney(id);
    set({ journey });
  }
}));
```

### Selectors for Derived State
```typescript
// ✅ Derive state with selectors — don't store computed values
const isAtCheckpoint = useJourneyStore(
  (s) => s.journey?.journeyState === 'PAUSED_AT_CHECKPOINT'
);
```

---

## 6. Cloud Functions Standards

### One Function — One Responsibility
```typescript
// ❌ WRONG — one function doing too many things
export const stepSnapshotUpdated = onDocumentWritten(..., async (event) => {
  // chooses source
  // checks rate limits
  // writes ledger
  // rebuilds journey
  // checks paywall
  // fires badge awards
  // sends notification
});

// ✅ RIGHT — orchestrator calls focused helpers
export const stepSnapshotUpdated = onDocumentWritten(..., async (event) => {
  const context = await buildContext(event);
  if (!context) return;

  const claim = await StepClaimProcessor.process(context);
  if (!claim) return;

  const updated = await JourneyRebuilder.rebuild(context, claim);
  await PaywallEvaluator.evaluate(context, updated);
  await BadgeEvaluator.evaluate(context, updated);
});
```

### Never Trust Client Data
```typescript
// ✅ Always validate and recompute server-side
// The client sends a snapshot — the server decides what it means
// Never accept client-supplied progressMeters or stepsApplied
```

### Idempotency
All Cloud Functions must be safe to run twice with the same input.

```typescript
// ✅ Use merge:true and versioned fields
await ledgerRef.set({
  ...ledgerData,
  recomputeVersion: (existing?.recomputeVersion ?? 0) + 1,
}, { merge: true });
```

### Error Handling in Functions
```typescript
// ✅ Never let a function throw uncaught
try {
  await processStepSnapshot(event);
} catch (error) {
  logger.error('stepSnapshotUpdated failed', { error, userId, localDate });
  // don't rethrow — log and fail gracefully
  // Crashlytics will capture it
}
```

---

## 7. Testing Standards

### Test Coverage Requirements
```
Unit tests:        All service classes, state machines, utility functions
Component tests:   All presentational components
Integration tests: Repository implementations (against Firestore emulator)
E2E tests (Maestro): Core user journeys — onboarding, step claim, checkpoint, purchase
```

### Test Structure (AAA Pattern)
```typescript
describe('JourneyStateMachine', () => {
  describe('transition', () => {
    it('transitions from WALKING to PAUSED_AT_CHECKPOINT on CHECKPOINT_REACHED', () => {
      // Arrange
      const current: JourneyState = 'WALKING';
      const event: JourneyStateEvent = 'CHECKPOINT_REACHED';

      // Act
      const next = JourneyStateMachine.transition(current, event);

      // Assert
      expect(next).toBe('PAUSED_AT_CHECKPOINT');
    });

    it('throws on invalid transition', () => {
      expect(() =>
        JourneyStateMachine.transition('COMPLETED', 'CHECKPOINT_REACHED')
      ).toThrow(InvalidStateTransitionError);
    });
  });
});
```

### Test the Behavior, Not the Implementation
```typescript
// ❌ WRONG — testing implementation details
expect(journeyService._internalCache).toHaveBeenCalledWith(...)

// ✅ RIGHT — testing observable behavior
const journey = await journeyService.getActiveJourney(userId);
expect(journey?.journeyState).toBe('WALKING');
```

### Firestore Rules Must Be Tested
```typescript
// ✅ Use @firebase/rules-unit-testing for every rule
it('prevents client from writing to ledger directly', async () => {
  const db = getTestFirestore({ uid: 'user-1' });
  await assertFails(
    db.collection('users/user-1/journeys/j1/ledger').doc('2026-03-09').set({})
  );
});
```

---

## 8. Code Quality Standards

### Naming Conventions
```typescript
// Files
kebab-case for files:     journey-progression-service.ts
PascalCase for classes:   JourneyProgressionService
camelCase for functions:  applyStepsToJourney()
SCREAMING_SNAKE for constants: MAX_STEP_SYNCS_PER_DAY
PascalCase for types/interfaces: JourneyDoc, StepProvider

// Meaningful names — no abbreviations
❌ const j = await getJ(uid);
✅ const journey = await journeyRepo.getActiveJourney(userId);

// Boolean names answer a yes/no question
❌ const paywall = journey.frozenAtPaywall;
✅ const isPaywallFrozen = journey.frozenAtPaywall;
```

### Function Size
```
Preferred function length: under ~40 lines
If longer → extract helper functions unless the split would make the logic harder to follow
```

### Comments — Why, Not What
```typescript
// ❌ WRONG — comment describes what the code does (redundant)
// increment the step count by delta
totalSteps += delta;

// ✅ RIGHT — comment explains WHY
// We cap at paywallTriggerMeters even if the user walked further.
// This preserves the hard freeze behavior regardless of HealthKit
// reporting extra steps after the threshold was reached.
progressMeters = Math.min(progressMeters, route.paywallTriggerMeters);
```

### No Magic Numbers
```typescript
// ❌ WRONG
if (usage.stepSyncCount >= 10) return;

// ✅ RIGHT
const MAX_STEP_SYNCS_PER_DAY = 10;
if (usage.stepSyncCount >= MAX_STEP_SYNCS_PER_DAY) return;
```

### Fail Fast, Fail Loudly
```typescript
// ✅ Validate preconditions at function entry
function applySteps(journey: JourneyDoc, steps: number): JourneyDoc {
  if (steps < 0) throw new InvalidArgumentError('steps must be non-negative');
  if (journey.journeyState !== 'WALKING') {
    throw new InvalidStateError('Cannot apply steps when not WALKING');
  }
  ...
}
```

---

## 9. Folder Structure

```
paila/
  src/
    shared/
      schemas.ts           ← Zod schemas + TypeScript types (shared with functions)
      paths.ts             ← Firestore paths (shared with functions)

    services/
      step-sync/
        StepSyncService.ts
        StepProviderFactory.ts
        HealthKitStepProvider.ts
        HealthConnectStepProvider.ts
        PedometerStepProvider.ts
      journey/
        JourneyProgressionService.ts
        JourneyStateMachine.ts
        JourneyEventDetector.ts
      ceremony/
        CeremonyOrchestrator.ts
        StandardCeremonyStrategy.ts
        PaywallCeremonyStrategy.ts
        CompletionCeremonyStrategy.ts
      content/
        ContentPackService.ts
        AssetResolver.ts
        StaticContentRepository.ts
      entitlement/
        EntitlementService.ts
        PaywallService.ts
      weather/
        WeatherService.ts
      badge/
        BadgeService.ts

    repositories/
      FirestoreJourneyRepository.ts
      FirestoreRouteRepository.ts
      FirestoreUserRepository.ts
      MMKVCacheRepository.ts

    screens/
      journey/
        JourneyHomeScreen.tsx
        MilestoneCeremonyScreen.tsx
        CheckpointDecisionSheet.tsx
      purchase/
        PurchaseInvitationScreen.tsx
        PremiumContentPackDownloadScreen.tsx
      auth/
        SignInScreen.tsx
      completion/
        CompletionScreen.tsx

    components/
      journey/
        MilestoneCard.tsx
        ProgressMap.tsx
        StepCounter.tsx
        StreakBadge.tsx
      ui/
        Button.tsx
        Card.tsx
        LoadingOverlay.tsx

    stores/
      useJourneyStore.ts
      useAuthStore.ts
      useRouteStore.ts
      useCeremonyStore.ts
      useContentStore.ts

    hooks/
      useJourneyProgression.ts
      useStepSync.ts
      useCeremony.ts

    navigation/
      RootNavigator.tsx
      JourneyNavigator.tsx

    utils/
      dates.ts
      meters.ts
      errors.ts

  functions/
    src/
      index.ts             ← Cloud Function exports
      processors/
        StepClaimProcessor.ts
        JourneyRebuilder.ts
        PaywallEvaluator.ts
        BadgeEvaluator.ts
      shared/              ← symlink or copy of src/shared
```

---

## 10. Git & PR Standards

### Branch Naming
```
codex/feature-s1-01-app-scaffold
codex/feature-s1-04-apple-sign-in
codex/fix-journey-state-midnight-expiry
codex/chore-update-security-md
```

### Commit Messages (Conventional Commits)
```
feat(auth): add Apple Sign In via Firebase Auth
feat(journey): implement checkpoint pause state machine
fix(steps): cap progressMeters at paywallTriggerMeters
refactor(ledger): extract JourneyRebuilder from index.ts
test(rules): add Firestore rules tests for ledger write protection
chore(deps): upgrade firebase-admin to 12.x
docs(security): add SECURITY.md non-negotiables
```

### PR Checklist (must be in every PR description)
```
## Changes
[describe what changed and why]

## Security Checklist
- [ ] No secrets hardcoded
- [ ] No PII in logs
- [ ] Input validated with Zod
- [ ] Firestore rules updated and tested (if applicable)

## Testing
- [ ] Unit tests added/updated
- [ ] Tested on iOS simulator
- [ ] Tested on Android emulator
- [ ] No console errors

## Claude Review
- [ ] Claude has reviewed and approved this PR
```

---

## 11. What Needs Refactoring in the Current Codebase

Codex — based on the current `functions/src/index.ts`, here are the immediate refactoring priorities before Sprint 1 closes:

```
🔴 HIGH PRIORITY (before any new feature):

1. Remove 'manual' from StepSource and SOURCE_PRIORITY
   → Already agreed. Do this first.

2. Extract processors from index.ts
   → StepClaimProcessor, JourneyRebuilder, PaywallEvaluator
   → index.ts should be thin orchestration only

3. Replace inline type definitions in index.ts
   → Import from src/shared/schemas.ts
   → No duplicate type definitions

4. Add JourneyState to journeySchema
   → 'WALKING' | 'PAUSED_AT_CHECKPOINT' | 'RESTING' | 'PAYWALL_FROZEN' | 'COMPLETED'
   → Required for progression model

5. Update JourneyDoc to include new progression fields
   → pausedAtCheckpoint, keepWalkingToday, keepWalkingExpiresAt
   → lastClaimedSourceStepsToday, currentCheckpointId

6. Update JourneyLedgerDoc to support multiple checkpoints per day
   → checkpointsReachedToday, restDecision, discardedSurplusSteps

🟡 MEDIUM PRIORITY (before Sprint 2):

7. Replace direct Firestore calls with Repository pattern
8. Extract StepProviderFactory for client side
9. Implement JourneyStateMachine class
10. Add Result types for service return values
```

---

*Clean code is not a luxury. It is the foundation the mountain is built on.*
*"Every step brings you closer to home — and every clean commit brings us closer to launch." 🏔️*
