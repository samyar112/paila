# AGENTS.md — Paila (पाइला)

> Read this file before every task. No exceptions.
> Read SECURITY.md before tasks touching auth, storage, networking, payments, or health data.
> Read ENGINEERING.md before writing any new class, service, or Cloud Function.
> All technical architecture lives in ARCHITECTURE.md — this file covers roles, process, and product guardrails.

---

## The North Star

> *"Every step you take carries you somewhere real."*

Paila is a walking journey app. Your daily steps carry you along iconic trails worldwide.
The flagship route takes you from Lukla to the summit of Everest and back to Kathmandu.
Future routes include the Camino de Santiago, Inca Trail, Appalachian Trail, and more.

Nepal-first, world-ready. The cultural specificity is a feature, not a limitation.

---

## Store Compliance (Non-Negotiable)

This app MUST be published on the Apple App Store and Google Play Store.
Compliance overrides everything except user safety.

### Alert Triggers — Stop work and post to CLAUDE_CODEX_CHAT.md if you detect:

- Any payment flow that bypasses Apple/Google IAP
- Linking to external purchase pages from inside the app
- Collecting health data without explicit permission prompt
- Storing GPS/location data without disclosure
- Using HealthKit data for advertising or third-party analytics
- Missing "Delete My Account" functionality
- Private API usage (iOS)
- Background processes not declared in entitlements
- Any data collection not covered by Privacy Policy

### Apple App Store

- Apple Sign In required (we offer third-party login)
- All IAP through StoreKit / RevenueCat
- Privacy nutrition label must be accurate and complete
- HealthKit usage declared with clear purpose strings
- No misleading screenshots or metadata

### Google Play Store

- All IAP through Google Play Billing / RevenueCat
- Health Connect permissions declared in manifest + Play Console
- Privacy Policy URL required in Play Console
- Data safety section must match actual data collection
- Target SDK must meet current Play Store minimum

---

## Agent Roles

### Claude — Architect + Product + Design
Owns: product vision, UX philosophy, architecture decisions, design specs, code review, sprint planning.
Does NOT own: implementation details, schema truth, technical feasibility calls.

### Codex — Developer + QA + Release Engineering
Owns: implementation, tests, schema truth, technical feasibility, drift detection, compliance flagging.
Does NOT own: product narrative, UX philosophy, final sprint prioritization.

### Founder — Decision Maker
Owns: final product decisions, budget, go/no-go, compliance escalations, store submissions.

---

## Rules

1. No architecture doc is final until Claude (product) and Codex (implementation) both review.
2. No feature ships without Claude code review + tests passing + compliance check.
3. If Claude and Codex disagree, document both positions in CLAUDE_CODEX_CHAT.md. Founder decides.
4. If Codex finds doc drift from code, fix the doc (unless code is wrong). Note in CLAUDE_CODEX_CHAT.md.
5. All work on feature branches. No direct commits to main. PRs reviewed by Claude before merge.

---

## Communication

**CLAUDE_CODEX_CHAT.md** — append-only async channel between Claude and Codex.
Prefix every message with `[CLAUDE]` or `[CODEX]` + date.
Use for: handoffs, concerns, compliance alerts, review requests, decision confirmations.
Founder routes messages between agents.

---

## Environment & Secrets

Two environments only: `dev` (paila-dev) and `prod` (paila-prod). No staging.

```bash
# Dev
APP_ENV=development \
FIREBASE_IOS_CONFIG_PATH="/path/to/dev/GoogleService-Info.plist" \
FIREBASE_ANDROID_CONFIG_PATH="/path/to/dev/google-services.json" \
bash ./scripts/sync-firebase-config.sh

# Prod
APP_ENV=production \
FIREBASE_IOS_CONFIG_PATH="/path/to/prod/GoogleService-Info.plist" \
FIREBASE_ANDROID_CONFIG_PATH="/path/to/prod/google-services.json" \
bash ./scripts/sync-firebase-config.sh
```

Firebase config files must NEVER be committed to the repo. All secrets via EAS Secrets.

---

## Onboarding

During sign-up, ask the user which country they are from (`countryCode`).
Used for: Nepal local free access detection, personalized completion ceremony (post-MVP).

---

## Immersive-First Filter

Before implementing any feature, ask: *"Does this make the journey feel real?"*

- YES → proceed
- NO → do not implement
- MAYBE → flag for founder

### Never Build

- Cluttered dashboards
- Cheap gamification (XP bars, random confetti)
- Ads inside the journey
- Pushy notifications
- Rating prompts mid-journey (only at completion in Kathmandu)
- Manual step entry
- Generic fitness-app features

---

## Definition of Done

- [ ] Code compiles without errors
- [ ] Unit tests passing
- [ ] Claude code review approved
- [ ] Matches Figma spec (if UI)
- [ ] No console errors or warnings
- [ ] Tested on iOS simulator
- [ ] Tested on Android emulator
- [ ] Immersive-first filter passed
- [ ] App Store + Play Store compliance verified
- [ ] PR merged to main

---

## Repo Structure

```
paila/
  AGENTS.md              ← roles, process, product guardrails (you are here)
  ARCHITECTURE.md        ← technical architecture (single source of truth)
  ENGINEERING.md         ← coding standards and patterns
  SECURITY.md            ← security requirements
  CLAUDE_CODEX_CHAT.md   ← agent communication log
  SPRINT_*.md            ← sprint plans
  firestore.rules
  functions/src/         ← Cloud Functions
  src/shared/schemas.ts  ← Zod schemas + TypeScript types
  src/shared/paths.ts    ← Firestore collection paths
```

---

## GitHub Workflow

```
Branch naming:
  codex/feature-s1-03-firebase
  claude/fix-progression-fields

Commit style:
  feat: add milestone ceremony screen
  fix: prevent double step counting
  chore: update AGENTS.md

PR rules:
  All work on branches. No direct commits to main.
  PRs reviewed by Claude before merge. CI must pass.
```

---

*This is the contract between Claude, Codex, and the founder.*
*"Every step brings you closer to home."*
