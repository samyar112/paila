#!/bin/bash

# =============================================================================
# Paila — GitHub Project + Sprint 1 Issues Setup
# Run this once after repo is on GitHub.
# Requires: GitHub CLI (gh) installed and authenticated
# Install:  brew install gh
# Auth:     gh auth login
# =============================================================================

set -e

REPO="$(gh repo view --json nameWithOwner -q .nameWithOwner)"
echo "Setting up GitHub Project for: $REPO"

# =============================================================================
# 1. Create Labels
# =============================================================================
echo "Creating labels..."

gh label create "sprint-1" --color "0075ca" --description "Sprint 1 stories" --force
gh label create "scaffold" --color "e4e669" --description "App scaffold and setup" --force
gh label create "firebase" --color "f9a825" --description "Firebase related" --force
gh label create "auth" --color "d93f0b" --description "Authentication" --force
gh label create "data-layer" --color "0e8a16" --description "Schemas, paths, data model" --force
gh label create "ci-cd" --color "5319e7" --description "CI/CD and build pipeline" --force
gh label create "compliance" --color "b60205" --description "App Store / Play Store compliance" --force
gh label create "needs-review" --color "fbca04" --description "Waiting for Claude review" --force

echo "Labels created."

# =============================================================================
# 2. Create Milestone
# =============================================================================
echo "Creating Sprint 1 milestone..."

gh api repos/$REPO/milestones \
  --method POST \
  --field title="Sprint 1 — App Scaffold + Firebase + Auth" \
  --field description="Working app shell that boots, authenticates, connects to Firebase, and has the full data layer. No journey screens yet." \
  --field due_on="$(date -v+14d +%Y-%m-%dT00:00:00Z 2>/dev/null || date -d '+14 days' +%Y-%m-%dT00:00:00Z)"

MILESTONE_NUMBER=$(gh api repos/$REPO/milestones --jq '.[] | select(.title | startswith("Sprint 1")) | .number')
echo "Milestone created: #$MILESTONE_NUMBER"

# =============================================================================
# 3. Create Sprint 1 Issues
# =============================================================================
echo "Creating Sprint 1 issues..."

# S1-01
gh issue create \
  --title "S1-01 — App Scaffold" \
  --body "## Goal
Working Expo Prebuild project with correct native config.

## Acceptance Criteria
- [ ] Expo project initialized with \`expo prebuild\`
- [ ] TypeScript configured and strict
- [ ] Hermes engine enabled
- [ ] New Architecture (Fabric + JSI) enabled
- [ ] React Navigation installed with shell navigator (no screens yet)
- [ ] \`react-native-mmkv\` installed and verified
- [ ] App boots on iOS simulator without errors
- [ ] App boots on Android emulator without errors
- [ ] No console warnings on clean boot

## Out of Scope
Any screens, any UI, any Firebase connection.

## Notes
Start here. Everything else depends on this." \
  --label "sprint-1,scaffold" \
  --milestone "$MILESTONE_NUMBER"

# S1-02
gh issue create \
  --title "S1-02 — Environment Configuration" \
  --body "## Goal
Clean dev/prod environment separation so we never touch production data during development.

## Acceptance Criteria
- [ ] \`dev\` environment points to \`paila-dev\` Firebase project
- [ ] \`prod\` environment points to \`paila-prod\` Firebase project
- [ ] Firebase config files loaded via environment at build time (NOT committed to repo)
- [ ] EAS build profiles configured: \`development\`, \`production\`
- [ ] \`APP_ENV\` variable drives which Firebase config is loaded
- [ ] Switching environments requires a rebuild — no runtime toggle
- [ ] \`.gitignore\` explicitly excludes all Firebase config files

## Notes
Firebase config files live in founder's Documents folder (outside repo).
Document exactly where EAS expects them for local builds." \
  --label "sprint-1,scaffold,firebase" \
  --milestone "$MILESTONE_NUMBER"

# S1-03
gh issue create \
  --title "S1-03 — Firebase Connection" \
  --body "## Goal
Firebase initialized and verified in the app.

## Acceptance Criteria
- [ ] Firebase SDK initialized on app start
- [ ] Firestore offline persistence enabled
- [ ] Firebase App Check configured (dev: debug token, prod: DeviceCheck/Play Integrity)
- [ ] Firebase Crashlytics initialized
- [ ] Test Firestore read succeeds against \`paila-dev\` on boot (dev only — remove before prod)
- [ ] No Firebase errors on clean boot" \
  --label "sprint-1,firebase" \
  --milestone "$MILESTONE_NUMBER"

# S1-04
gh issue create \
  --title "S1-04 — Apple Sign In" \
  --body "## Goal
Users on iOS can sign in with Apple.

## Acceptance Criteria
- [ ] Apple Sign In implemented via Firebase Auth
- [ ] First sign in creates user document at \`users/{userId}\` (via Cloud Function)
- [ ] Subsequent sign ins restore existing session
- [ ] Auth state persists across app restarts
- [ ] Sign out clears local state cleanly
- [ ] \`Info.plist\` has correct Sign In with Apple entitlement
- [ ] Tested on iOS simulator

## Compliance
🚨 Apple Sign In is REQUIRED by App Store — must be the primary option on iOS" \
  --label "sprint-1,auth,compliance" \
  --milestone "$MILESTONE_NUMBER"

# S1-05
gh issue create \
  --title "S1-05 — Google Sign In" \
  --body "## Goal
Users on Android can sign in with Google.

## Acceptance Criteria
- [ ] Google Sign In implemented via Firebase Auth
- [ ] Same user document creation flow as Apple Sign In
- [ ] Auth state persists across app restarts
- [ ] Sign out clears local state cleanly
- [ ] Tested on Android emulator" \
  --label "sprint-1,auth" \
  --milestone "$MILESTONE_NUMBER"

# S1-06
gh issue create \
  --title "S1-06 — User Document Creation (Cloud Function)" \
  --body "## Goal
Cloud Function creates user document on first sign in. Client never writes to users collection directly.

## Acceptance Criteria
- [ ] \`onUserCreated()\` Cloud Function triggers on Firebase Auth \`onCreate\`
- [ ] Creates \`users/{userId}\` with: uid, createdAt, displayName, email, timezone (null), accessTier: 'standard_free', isNepalLocal: false
- [ ] Does NOT create journey (Sprint 2)
- [ ] Unit tested
- [ ] Deployed to \`paila-dev\`" \
  --label "sprint-1,auth,firebase" \
  --milestone "$MILESTONE_NUMBER"

# S1-07
gh issue create \
  --title "S1-07 — Firestore Security Rules" \
  --body "## Goal
Security rules that protect all collections from unauthorized reads and writes.

## Acceptance Criteria
- [ ] Rules deployed to \`paila-dev\`
- [ ] \`users/{userId}\` — authenticated user reads/writes own doc only
- [ ] \`journeys/{journeyId}\` — user reads own, no client writes (Cloud Functions only)
- [ ] \`ledger/{date}\` — no client writes ever
- [ ] \`routes/{routeId}\` — any authenticated user reads if \`isPublished: true\`
- [ ] \`milestones\`, \`assetBundles\`, \`contentPacks\`, \`badges\` — authenticated read
- [ ] \`weatherCache\` — no client reads or writes
- [ ] All rules covered by \`@firebase/rules-unit-testing\` tests" \
  --label "sprint-1,firebase,compliance" \
  --milestone "$MILESTONE_NUMBER"

# S1-08
gh issue create \
  --title "S1-08 — Core Schemas (Zod + TypeScript)" \
  --body "## Goal
All Zod schemas and TypeScript types finalized in \`src/shared/schemas.ts\`.

## Acceptance Criteria
- [ ] \`StepSource\` = \`'healthkit' | 'health_connect' | 'phone_pedometer'\` — no 'manual'
- [ ] \`JourneyState\` type: \`'WALKING' | 'PAUSED_AT_CHECKPOINT' | 'RESTING' | 'PAYWALL_FROZEN' | 'COMPLETED'\`
- [ ] \`JourneyDoc\` includes: \`journeyState\`, \`pausedAtCheckpoint\`, \`keepWalkingToday\`, \`keepWalkingExpiresAt\`, \`lastClaimedSourceStepsToday\`, \`currentCheckpointId\`
- [ ] \`JourneyStepLedger\` supports multiple checkpoint arrivals per day
- [ ] All schemas tested with valid + invalid inputs
- [ ] Shared between \`src/\` and \`functions/src/\` — single source of truth
- [ ] Reviewed and approved by Claude before closing" \
  --label "sprint-1,data-layer,needs-review" \
  --milestone "$MILESTONE_NUMBER"

# S1-09
gh issue create \
  --title "S1-09 — Firestore Collection Paths" \
  --body "## Goal
All Firestore paths defined in \`src/shared/paths.ts\`. No raw path strings anywhere else.

## Acceptance Criteria
- [ ] All collection paths verified correct
- [ ] Every path in Cloud Functions and app code references \`paths.ts\`
- [ ] No raw string paths hardcoded anywhere in codebase
- [ ] Reviewed and approved by Claude before closing" \
  --label "sprint-1,data-layer,needs-review" \
  --milestone "$MILESTONE_NUMBER"

# S1-10
gh issue create \
  --title "S1-10 — EAS Build + CI Pipeline" \
  --body "## Goal
EAS build configured and GitHub Actions CI running on every PR.

## Acceptance Criteria
- [ ] \`eas.json\` configured with \`development\` and \`production\` profiles
- [ ] GitHub Actions runs on every PR: TypeScript check, Jest, Firestore rules tests, ESLint
- [ ] CI must pass before any PR can merge
- [ ] EAS dev build verified on local machine" \
  --label "sprint-1,ci-cd" \
  --milestone "$MILESTONE_NUMBER"

echo ""
echo "All Sprint 1 issues created."

# =============================================================================
# 4. Create GitHub Project Board
# =============================================================================
echo "Creating GitHub Project board..."

PROJECT_ID=$(gh project create \
  --owner "@me" \
  --title "Paila — Sprint Board" \
  --format json 2>/dev/null | jq -r '.id' 2>/dev/null || echo "")

if [ -n "$PROJECT_ID" ]; then
  echo "Project created. Adding issues..."
  for issue_num in $(gh issue list --milestone "Sprint 1 — App Scaffold + Firebase + Auth" --json number -q '.[].number'); do
    gh project item-add $PROJECT_ID --owner "@me" --url "https://github.com/$REPO/issues/$issue_num" 2>/dev/null || true
  done
  echo "Issues added to project board."
  echo ""
  echo "View your board: gh project view $PROJECT_ID --owner @me --web"
else
  echo ""
  echo "Note: Run 'gh project create --owner @me --title \"Paila Sprint Board\"' manually if above failed."
  echo "Then add Sprint 1 milestone issues to it."
fi

echo ""
echo "Done. Sprint 1 is live on GitHub."
echo "View issues: gh issue list --milestone 'Sprint 1 — App Scaffold + Firebase + Auth'"
