# ENGINEERING.md — Paila (पाइला)

> Coding standards and patterns. Read alongside AGENTS.md and SECURITY.md.
> Architecture lives in ARCHITECTURE.md — this file covers how to write code.

---

## Design Principles

SOLID throughout. Key applications:

- **SRP**: Every class/function does one thing. `StepSyncService` reads steps. `JourneyProgressionService` applies them. Separate concerns.
- **OCP**: New routes and ceremony types via configuration, not code changes. Use `CeremonyHandlerRegistry`, not if/else on route slug.
- **LSP**: Step providers are interchangeable. `HealthKitStepProvider`, `HealthConnectStepProvider`, `PedometerStepProvider` all implement `StepProvider`.
- **DIP**: Services depend on repository interfaces, not Firestore directly.

---

## Patterns

### Repository (Data Access)

All Firestore reads/writes through repository classes. No screen or service imports Firestore.

```
Screens / Hooks → Services → Repositories → Firestore / MMKV / Filesystem
```

### Service Layer

All business logic in service classes. Nothing complex in screens or hooks.

### Factory (Step Providers)

`StepProviderFactory` selects provider by platform. Callers don't decide.

### Strategy (Ceremonies)

Each `ceremonyType` implements `CeremonyStrategy` interface. Registry maps type to handler.

### State Machine (Journey)

`JourneyStateMachine` validates all transitions. Invalid transitions throw. States and transitions defined in ARCHITECTURE.md.

### Observer/Event (Journey Events)

State changes emit typed events. Screens subscribe via Zustand.

```typescript
type JourneyEvent =
  | { type: 'CHECKPOINT_ARRIVED'; milestone: MilestoneDoc }
  | { type: 'PAYWALL_REACHED'; milestone: MilestoneDoc }
  | { type: 'JOURNEY_COMPLETED' }
  | { type: 'BADGE_UNLOCKED'; badge: BadgeDoc };
```

---

## TypeScript

- Strict mode always on: `strict`, `noImplicitAny`, `strictNullChecks`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`.
- No `any` — use `unknown` + Zod for external data.
- Explicit return types on all public functions.
- Discriminated union Result types:

```typescript
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };
```

- Prefer `readonly` and `const`. Validate with Zod before using any external data.

---

## React Native

- One component per file. Preferred size under ~200 lines.
- Smart components (screens) connect to Zustand, call services.
- Dumb components (presentational) accept only props — no state access, no service calls.
- Extract complex logic into custom hooks (`useJourneyProgression`, `useStepSync`).
- No business logic in screens — delegate to services.
- Error boundary on every screen.

### Component Structure

```
1. Imports
2. Types / interfaces
3. Component function
4. Styles (StyleSheet.create at bottom)
5. Export
```

---

## Zustand

One store per domain:

```
useJourneyStore   → active journey, progression state
useAuthStore      → auth state, user doc
useRouteStore     → active route, milestones
useContentStore   → downloaded content pack state
useCeremonyStore  → ceremony queue and display state
```

- Stores call services only — never Firestore directly.
- Export selectors for derived state — don't store computed values.

---

## Cloud Functions

- One function, one responsibility. Orchestrator calls focused processors.
- Never trust client data — validate and recompute server-side.
- All functions must be idempotent (safe to run twice with same input).
- Input validation with Zod schemas on every function.
- Never return stack traces to client. Log and fail gracefully.

---

## Testing

```
Unit tests:        All services, state machines, utilities
Component tests:   All presentational components
Integration tests: Repositories against Firestore emulator
E2E tests:         Core journeys via Maestro
```

AAA pattern (Arrange, Act, Assert). Test behavior, not implementation.
Firestore rules must be tested with `@firebase/rules-unit-testing`.

---

## Code Quality

### Naming

- Files: `kebab-case`. Classes: `PascalCase`. Functions: `camelCase`. Constants: `SCREAMING_SNAKE`.
- Meaningful names, no abbreviations.
- Booleans answer yes/no: `isPaywallFrozen`, not `paywall`.

### Standards

- Preferred function length: under ~40 lines.
- Comments explain WHY, not WHAT.
- No magic numbers — use named constants.
- Fail fast: validate preconditions at function entry.

---

## Folder Structure

```
src/
  shared/
    schemas.ts, paths.ts, config/, theme/, storage/
  services/
    step-sync/        → StepSyncService, StepProviderFactory, providers
    journey/          → JourneyProgressionService, JourneyStateMachine
    ceremony/         → CeremonyOrchestrator, strategies
    content/          → ContentPackService, AssetResolver, StaticContentRepository
    entitlement/      → EntitlementService, PaywallService
    weather/          → WeatherService
    badge/            → BadgeService
    auth/             → AuthService
  repositories/
    FirestoreJourneyRepository, FirestoreRouteRepository, MMKVCacheRepository
  screens/
    journey/          → JourneyHomeScreen, MilestoneCeremonyScreen, CheckpointDecisionSheet
    purchase/         → PurchaseInvitationScreen
    auth/             → SignInScreen
    completion/       → CompletionScreen
  components/
    journey/          → MilestoneCard, ProgressMap, StepCounter
    ui/               → Button, Card, LoadingOverlay
  stores/
    useJourneyStore, useAuthStore, useRouteStore
  hooks/
    useJourneyProgression, useStepSync
  navigation/
    RootNavigator, JourneyNavigator
  utils/
    dates, meters, errors

functions/src/
  index.ts
  processors/         → StepClaimProcessor, JourneyRebuilder, PaywallEvaluator
```

---

## Git

### Branch Naming

```
codex/feature-s1-03-firebase
codex/fix-midnight-expiry
claude/feature-s2-01-content-repo
```

### Commit Messages (Conventional Commits)

```
feat(auth): add Apple Sign In via Firebase Auth
fix(steps): cap progressMeters at paywallTriggerMeters
refactor(ledger): extract JourneyRebuilder from index.ts
test(rules): add Firestore rules tests for ledger protection
```

### PR Checklist

```
- [ ] No secrets hardcoded
- [ ] No PII in logs
- [ ] Input validated with Zod
- [ ] Unit tests added/updated
- [ ] Tested on iOS simulator + Android emulator
- [ ] Claude reviewed and approved
```
