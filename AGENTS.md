# AGENTS.md — Paila (पाइला)

> Read this file before every task. No exceptions.
> Read SECURITY.md before every task that touches auth, storage, networking, payments, or health data.
> Read ENGINEERING.md before writing any new class, service, or Cloud Function.
> Last updated: March 2026
> Maintained by: Claude (Architect) + Codex (Developer)

---

## The North Star

> *"If a feature doesn't serve the emotional journey, it doesn't ship."*
> *"Every step brings you closer to home."*

Paila is not a step counter. It is a portal to Nepal.
Every technical and product decision must serve that mission.

---

## 🚨 HIGHEST PRIORITY — App Store & Play Store Compliance

**This app MUST be published on the Apple App Store and Google Play Store.**
**Compliance is non-negotiable. It overrides everything except user safety.**

### If you detect ANY of the following — STOP and alert immediately:

```
🚨 ALERT TRIGGERS (stop work, notify team):

IAP / Payments:
  → Any payment flow that bypasses Apple/Google IAP
  → Linking to external purchase pages from inside the app
  → Mentioning lower prices available outside the app
  → Offering digital goods without going through IAP
  → Using RevenueCat in a way that violates store rules

Content & Privacy:
  → Collecting health data without explicit permission prompt
  → Storing GPS/location data without disclosure
  → Any data collection not covered by Privacy Policy
  → User data shared with third parties not disclosed in Privacy Policy
  → Missing "Delete My Account" functionality
  → Missing required permission descriptions in Info.plist / AndroidManifest

Health & Step Data:
  → Using HealthKit data for advertising or third-party analytics
  → Sharing step/health data outside the app without explicit consent
  → Requesting health permissions not justified by core functionality

Children & Age Rating:
  → Any feature that would require a lower age rating adjustment
  → Content inappropriate for the app's declared age rating

Design Guidelines:
  → Custom UI elements that mimic native iOS/Android UI deceptively
  → Blocking system gestures or back navigation
  → Modifying system font sizes without respecting accessibility settings
  → Fullscreen ads or interstitials that block core functionality

Technical:
  → Private API usage (iOS)
  → Background processes not declared in entitlements
  → App binary exceeding App Store size limits without on-demand resources
  → Crash rate above acceptable threshold before submission

Nepal Local Detection:
  → Free access for Nepal locals must be implemented honestly
  → Cannot be gamed trivially (VPN exploit acceptable for MVP, harden in v1.1)
  → Must not be used as a mechanism to bypass IAP rules
```

### Store-Specific Rules to Always Follow

**Apple App Store:**
```
✅ Apple Sign In required (we offer third-party login)
✅ All IAP through StoreKit / RevenueCat
✅ Privacy nutrition label must be accurate and complete
✅ App must function without an account for non-personalized features
✅ No "rate us" prompts more than once (we prompt only at Base Camp)
✅ HealthKit usage must be declared with clear purpose strings
✅ No misleading screenshots or metadata
✅ In-app purchase prices must match App Store Connect pricing
```

**Google Play Store:**
```
✅ All IAP through Google Play Billing / RevenueCat
✅ Health Connect permissions declared in manifest + Play Console
✅ Privacy Policy URL required in Play Console
✅ Data safety section must match actual data collection
✅ Target SDK must meet current Play Store minimum
✅ No deceptive subscription flows
✅ APK/AAB must be signed with upload key
```

### How to Handle a Compliance Risk

```
1. STOP the current task
2. Add a comment in CLAUDE_CODEX_CHAT.md:
   "🚨 COMPLIANCE ALERT: [describe the issue]"
3. Do not implement the feature until resolved
4. Tag it for founder review
5. Propose a compliant alternative if possible
```

---

## Agent Roles

### Claude — Architect + Designer + Reviewer
```
Owns:
  → Product vision, narrative, UX philosophy
  → Architecture decisions + documentation
  → Design specs (Figma MCP)
  → Code review before every merge
  → Sprint planning + user stories
  → Notion docs (product side)
  → AGENTS.md updates

Does NOT own:
  → Implementation details (Codex owns)
  → Schema truth (Codex owns)
  → Technical feasibility calls (Codex owns)
```

### Codex — Developer + QA + Technical Truth Owner
```
Owns:
  → All feature implementation
  → Unit, component, and E2E tests
  → Architecture truth (schemas, rules, functions)
  → Implementation feasibility assessments
  → Drift detection (docs vs code)
  → Technical corrections to any doc
  → Notion docs (technical/architecture side)

Does NOT own:
  → Product narrative (Claude owns)
  → UX philosophy calls (Claude owns)
  → Final sprint prioritization (founder owns)
```

### Founder — Decision Maker
```
Owns:
  → All final product decisions
  → Budget and timeline
  → Go/no-go on features
  → Compliance escalations
  → Store submission approvals
```

---

## Check and Balance Rules

```
Rule 1 — No architecture page is "final" until:
  → Claude has reviewed: product + narrative side ✅
  → Codex has reviewed: implementation + schema side ✅

Rule 2 — No feature ships without:
  → Claude code review approved ✅
  → Tests passing ✅
  → Compliance check passed ✅

Rule 3 — If Claude and Codex disagree:
  → Document both positions in CLAUDE_CODEX_CHAT.md
  → Founder makes the call
  → Never silently override the other agent

Rule 4 — If Codex finds a doc that drifts from code:
  → Fix the doc, not the code (unless code is wrong)
  → Note the fix in CLAUDE_CODEX_CHAT.md

Rule 5 — If Claude makes a product decision with
          hidden technical cost:
  → Codex flags it immediately
  → Cost is documented before proceeding
  → Founder decides if worth it
```

---

## Communication Protocol

### CLAUDE_CODEX_CHAT.md
```
Location: /paila/CLAUDE_CODEX_CHAT.md
Purpose:  Async communication between Claude and Codex
Format:   Append only — newest messages at bottom
          [CLAUDE] or [CODEX] prefix on every message
          Date + timestamp on every message
Founder:  Reads and routes messages between agents
          "postman" role — does not need to interpret
```

### When to Write to CLAUDE_CODEX_CHAT.md
```
✅ Handing off a task to the other agent
✅ Flagging a concern or disagreement
✅ 🚨 Compliance alert
✅ Requesting a review
✅ Confirming a decision is implemented
✅ Asking a clarifying question
```

---

## Immersive-First Filter

Before implementing ANY feature, ask:

> *"Does this make Nepal feel closer?"*

```
If YES  → proceed ✅
If NO   → do not implement ❌
If MAYBE → flag for founder decision
```

### The Anti-Patterns (Never Build These)
```
❌ Cluttered dashboards
❌ Cheap gamification (XP bars, random confetti)
❌ Ads inside the journey
❌ Pushy notifications
❌ Rating prompts mid-journey
❌ Manual step entry
❌ Features that feel generic fitness-app
```

---

## Step Counting Rules (NON-NEGOTIABLE)

```
Priority 1: HealthKit (iOS) / Health Connect (Android)
Priority 2: Phone pedometer

NEVER:
  → Add sources together (double counting)
  → Accept manual step entry — ever
  → Count steps from unverified sources
  → Backfill frozen paywall days
  → Count steps passively in the background
  → Move past a checkpoint without explicit user re-engagement

ONE source wins per day. Period.
Steps must be EARNED. Integrity of the journey is sacred.
```

## Progression Rules (NON-NEGOTIABLE)

```
Foreground only:
  → Steps are claimed only when the user opens the app
  → No background sync
  → No passive progression

Checkpoint arrival:
  → When a checkpoint is reached, the journey pauses immediately
  → Milestone ceremony fires
  → No further steps count until the user returns and makes a choice

User choice:
  → Rest here
      day ends at this checkpoint
      tomorrow starts from here

  → Keep walking today
      progression resumes from that moment forward
      user must open the app again later that same day to claim more steps

Midnight:
  → "Keep walking today" expires at midnight
  → Unclaimed steps from later that day are lost
  → Next day requires a fresh intentional check-in
```

---

## Paywall Rules (NON-NEGOTIABLE)

```
→ Hard freeze at Namche Bazaar
→ Steps stop completely at paywall
→ No progress accumulates while frozen
→ After purchase: fresh start from Namche
→ No catch-up, no instant Base Camp
→ Acclimatization day counter runs while frozen
→ All IAP must go through RevenueCat + Apple/Google
→ Never bypass store IAP — instant rejection risk 🚨
```

---

## Template Architecture Rules (NON-NEGOTIABLE)

```
→ No component may reference EBC by slug
→ No hardcoded milestone counts
→ No hardcoded pricing strings
→ No route-specific if/else in UI code
→ No asset URLs — use asset keys only
→ All route behavior driven by RouteDoc
→ All ceremony behavior driven by ceremonyType
→ New paid route = zero code changes, zero app update
→ New free route = zero code changes, app update for bundled assets only
```

---

## Asset Rules

```
→ Free content: bundled in app binary
→ Premium content: one-time download via ContentPackService
→ After download: serve from local filesystem only
→ Never stream owned premium content from remote URL
→ Never auto-delete purchased content
→ Checksum verify after every download
→ Re-download only if version changes or integrity fails
```

---

## Data Model Rules

```
→ StepSource = 'healthkit' | 'health_connect' | 'phone_pedometer'
  'manual' is NOT a valid source — ever

→ AssetBundleDoc uses asset keys, not URLs
→ Step claiming starts on app foreground
→ Server logic validates and persists progression rules
→ Ledger is append-only — never delete entries
→ Rebuild journey from ledger, not from delta math
→ Always store dates in user's LOCAL timezone
→ Unclaimed same-day progress expires at midnight
```

---

## Cost Protection Rules

```
→ Max 10 foreground step claims per user per day
→ Max 4 weather calls per user per day
→ Cache map tiles after first load
→ Cache weather 6 hours per location
→ Cache route/milestone content after first read
→ Never expire a one-time purchase
→ Target: 1,000 active users < $5/month infrastructure
```

---

## Definition of Done

A task is DONE when ALL of these are true:

- [ ] Code written and compiles without errors
- [ ] Unit tests written and passing
- [ ] Claude code review approved
- [ ] Matches Figma spec (if UI)
- [ ] No console errors or warnings
- [ ] Tested on iOS simulator
- [ ] Tested on Android emulator
- [ ] Immersive-first filter passed
- [ ] **App Store compliance verified** 🍎
- [ ] **Play Store compliance verified** 🤖
- [ ] No new compliance risks introduced
- [ ] PR merged to main

---

## Repo Structure

```
paila/
  AGENTS.md                   ← you are here
  ARCHITECTURE.md             ← template architecture rules
  CLAUDE_CODEX_CHAT.md        ← agent communication
  firestore.rules             ← security rules
  functions/
    src/
      index.ts                ← Cloud Functions
  src/
    shared/
      schemas.ts              ← Zod schemas + TypeScript types
      paths.ts                ← Firestore collection paths
```

---

## Environments

```
dev     → Firebase dev project, EAS dev profile
staging → Firebase staging project, EAS preview profile
prod    → Firebase prod project, EAS production profile

Secrets: EAS Secrets + GitHub Actions
         NEVER committed to repo
         NEVER hardcoded in source
```

---

## GitHub Workflow

```
Branch naming:
  feature/short-description
  fix/short-description
  chore/short-description

Commit style:
  feat: add milestone ceremony screen
  fix: prevent double step counting
  chore: update AGENTS.md

PR rules:
  → All PRs reviewed by Claude before merge
  → No direct commits to main
  → CI must pass before merge
  → Compliance check in PR description
```

---

*This document is the contract between Claude, Codex, and the founder.*
*When in doubt — re-read the North Star.*
*"Every step brings you closer to home." 🏔️*
