# SECURITY.md — Paila (पाइला)

> Read this file before every task that touches auth, storage, networking, or user data.
> These are non-negotiables. Not guidelines. Not suggestions.
> Every item here must be satisfied before any feature ships to production.
> Last updated: March 2026
> Maintained by: Claude (Architect) + Codex (Developer)

---

## The Security North Star

> *"The user trusts us with their health data, their identity, and their money.
>  We treat that trust as sacred — the same way we treat the mountain."*

A security failure is not just a technical failure.
For a diaspora app built on cultural trust, it is a betrayal.

---

## 🚨 IMMEDIATE STOP CONDITIONS

If you encounter ANY of the following — stop all work immediately and post to CLAUDE_CODEX_CHAT.md:

```
🚨 Any secret, key, or token hardcoded in source code
🚨 Any Firebase config file committed to the repo
🚨 Any PII written to console logs
🚨 Any health data sent to a third party
🚨 Any auth token stored in AsyncStorage (unencrypted)
🚨 Any payment flow that bypasses Apple/Google IAP
🚨 Any HTTP (non-HTTPS) network call
🚨 Any client-side write to the ledger or journey progression
🚨 Any private API usage on iOS
```

---

## 1. Secrets & Configuration

### Non-Negotiables
```
❌ NEVER commit Firebase config files to the repo
❌ NEVER hardcode API keys, tokens, or secrets in source code
❌ NEVER store secrets in .env files committed to git
❌ NEVER log secrets, tokens, or keys anywhere

✅ Firebase config files → stored inside repo under ios/Paila/dev/ and ios/Paila/prod/
     (gitignored — never committed; in-repo location required because xcodebuild
      cannot read from paths outside the project directory during build phases)
     OVERRIDE: original rule required storage outside repo, but Xcode build
     constraints make that unworkable. Mitigation: both folders are in .gitignore,
     verified by CI secret scan, and files are never committed.
✅ All secrets → EAS Secrets for build-time injection
✅ All backend secrets → Firebase environment config or Secret Manager
✅ Service account JSON keys should not be created unless absolutely necessary
✅ If a service account key must exist temporarily, it lives outside repo and shared workspace and is deleted after setup
✅ .gitignore must explicitly exclude:
     google-services.json
     GoogleService-Info.plist
     .env
     .env.local
     .env.production
     firebase/
```

### Shared Docs & Communication Hygiene
```
✅ Never paste secrets, tokens, config file contents, webhook payloads, or private keys into:
   - CLAUDE_CODEX_CHAT.md
   - Notion docs
   - GitHub issues / PR comments
   - screenshots shared in chat
✅ When discussing secret-backed systems, describe paths and handling rules — not secret values
```

### Secret Rotation
```
✅ If any secret is ever accidentally committed:
   1. Invalidate it immediately (rotate the key)
   2. Force-push to remove from git history (or use BFG Repo Cleaner)
   3. Audit who may have had access
   4. Post incident report in CLAUDE_CODEX_CHAT.md
```

---

## 2. Authentication & Session Security

### Non-Negotiables
```
✅ Apple Sign In — required as primary option on iOS (App Store rule)
✅ Google Sign In — required on Android
✅ Firebase Auth manages all tokens and refresh cycles
✅ Auth state persistence via Firebase's built-in secure storage

❌ NEVER store auth tokens in AsyncStorage
❌ NEVER store auth tokens in MMKV unencrypted
❌ NEVER store auth tokens in plain files
❌ NEVER log auth tokens or user credentials
```

### Token Storage
```
iOS:   Firebase Auth uses Keychain automatically ✅
Android: Firebase Auth uses EncryptedSharedPreferences automatically ✅

For any additional tokens Claude or Codex stores:
✅ iOS → Keychain via expo-secure-store
✅ Android → EncryptedSharedPreferences via expo-secure-store
❌ Never AsyncStorage for anything sensitive
```

### Least-Privilege Access
```
✅ Founder retains billing owner access for Firebase, Apple, Google Play, and GitHub
✅ Day-to-day development uses the narrowest role that still allows the work
✅ Production admin access granted only to people actively operating the system
✅ Remove access immediately when no longer needed
```

### Session Rules
```
✅ Auto sign-out after 30 days of inactivity (configurable)
✅ Sign out clears ALL local state — MMKV, cache, Firestore offline data
✅ No session data survives a sign out
✅ Re-authentication required before purchase flow
```

---

## 3. Data Storage — On Device

### What Goes Where
```
Keychain / expo-secure-store:
  ✅ Auth refresh tokens (handled by Firebase Auth)
  ✅ Any future sensitive user preferences

MMKV (non-sensitive only):
  ✅ Route/milestone cache (public content)
  ✅ Weather cache
  ✅ UI preferences
  ✅ Journey state (non-financial)
  ❌ Never auth tokens
  ❌ Never payment info
  ❌ Never raw health data

Firestore offline cache:
  ✅ Journey progress
  ✅ Ledger (read-only on device)
  ❌ Never payment info

Local filesystem (content packs only):
  ✅ Downloaded premium media (videos, images)
  ✅ Verified by checksum before use
  ❌ Never user PII
  ❌ Never auth data
```

### Crash Reporting & Analytics Boundaries
```
✅ Crashlytics / analytics must never include:
   - raw step totals tied to identity unless strictly necessary
   - auth tokens
   - purchase receipts or full webhook payloads
   - email address in custom keys
✅ If a user identifier is needed for debugging, use Firebase UID only and only when necessary
❌ Never attach health data to crash reports
```

### Health Data Rules
```
✅ HealthKit / Health Connect data read on device only
✅ Only today's step total sent to our backend (one integer)
✅ Raw motion sensor data never stored anywhere
✅ Heart rate, sleep, and other health metrics never read or stored
✅ Health data never sent to any third party
✅ Health data never used for advertising or analytics
✅ HealthKit purpose strings must be honest and specific in Info.plist
❌ NEVER request health permissions not justified by core step functionality
```

---

## 4. Data in Transit

### Non-Negotiables
```
✅ TLS 1.2 minimum on all connections (Firebase enforces this)
✅ TLS 1.3 preferred
✅ All Firebase SDK calls use HTTPS automatically ✅
✅ All Cloud Function calls use HTTPS
✅ OpenWeatherMap proxy calls use HTTPS

❌ NEVER make HTTP (non-HTTPS) calls — ever
❌ NEVER disable SSL validation in any environment including dev
❌ NEVER log request/response bodies that contain user data
```

### Certificate Pinning
```
Priority: Implement before v1.1 launch (post-MVP hardening)
MVP: Firebase SDK handles certificate validation natively ✅
Post-MVP: Add certificate pinning for our own Cloud Function endpoints
          via react-native-ssl-pinning or equivalent
```

---

## 5. Backend & API Security

### Firebase App Check (NON-NEGOTIABLE)
```
✅ App Check enabled on ALL Firebase services:
   - Firestore
   - Cloud Functions
   - Firebase Storage
   - Firebase Auth

✅ Dev environment: App Check debug token
✅ Prod environment: DeviceCheck (iOS) + Play Integrity (Android)

❌ App Check must NEVER be disabled in production
❌ Requests without valid App Check token must be rejected by backend
```

### Firestore Security Rules (NON-NEGOTIABLE)
```
✅ No collection is publicly readable or writable
✅ Users can only read/write their own documents
✅ Journey progression written by Cloud Functions only — never client
✅ Ledger is append-only, Cloud Functions only — never client
✅ Route/milestone/asset content — authenticated read only
✅ Weather cache — no client access at all
✅ All rules covered by automated tests
✅ Rules reviewed by Claude before every deploy

❌ NEVER use allow read, write: if true anywhere
❌ NEVER deploy rules without running the full test suite first
```

### Cloud Function Security
```
✅ All functions validate Firebase App Check token
✅ All functions validate Firebase Auth token
✅ Input validation on every function (Zod schemas)
✅ Rate limiting enforced server-side (not just client-side)
✅ Functions follow principle of least privilege
✅ No function exposes more data than the caller needs

❌ NEVER trust client-supplied progression data
❌ NEVER skip input validation because "the client already validated"
❌ NEVER return stack traces or internal errors to the client
```

### Rate Limiting (NON-NEGOTIABLE)
```
✅ Max 10 foreground step claims per user per day
✅ Max 4 weather proxy calls per user per day
✅ RevenueCat webhook validated by signature before processing
✅ RevenueCat webhook replay protection / idempotency enforced server-side
✅ Duplicate webhook events must be safe to reprocess
✅ Abuse detection: flag users with anomalous request patterns
```

---

## 6. Code & Binary Security

### Build Security
```
✅ Hermes engine enabled (bytecode — not plain JS) ✅
✅ ProGuard / R8 enabled for Android production builds
✅ Code obfuscation enabled for production builds
✅ Dead code elimination enabled
✅ Source maps generated but NOT shipped in production binary
✅ Source maps stored securely (EAS or private storage only)

❌ NEVER ship source maps in the production app binary
❌ NEVER disable obfuscation for production builds
```

### Dependency Security
```
✅ Run npm audit before every sprint
✅ Pin dependency versions (no ^ or ~ in package.json for critical deps)
✅ Review all new dependencies before adding:
   - Who maintains it?
   - When was it last updated?
   - Does it request unusual permissions?
   - Does it collect any data?
✅ Dependabot or equivalent enabled on GitHub repo
✅ No abandoned packages (last commit > 2 years ago) without justification

❌ NEVER add a dependency that collects user data without disclosure
❌ NEVER add analytics SDKs without founder approval
```

### Static Analysis
```
✅ ESLint with security rules enabled (eslint-plugin-security)
✅ TypeScript strict mode — no any types in security-critical paths
✅ No TODO: fix security in production code
✅ Secrets scanner (e.g. git-secrets or trufflehog) in CI pipeline
```

---

## 7. Privacy & Compliance

### Data Minimization (NON-NEGOTIABLE)
```
We collect ONLY what we absolutely need:

✅ Collect:
   - User ID (Firebase Auth UID)
   - Display name + email (from auth provider)
   - IANA timezone string
   - Daily step total (one integer per day)
   - Journey progress (milestone index, meters walked)
   - Purchase entitlement (boolean)
   - App locale / region (for Nepal detection)

❌ Never collect:
   - Raw motion sensor data
   - GPS coordinates or precise location
   - Heart rate or other health metrics beyond steps
   - Device identifiers beyond what Firebase requires
   - Contacts, camera, microphone
   - Browsing history or cross-app behavior
   - Exact home address
   - Financial details (RevenueCat handles this)
```

### Apple Privacy Manifest (REQUIRED — iOS 17+)
```
✅ PrivacyInfo.xcprivacy file must be present in the iOS project
✅ Must declare all:
   - APIs that access required reason APIs
   - Data types collected
   - Third-party SDKs and their privacy manifests
✅ Must be accurate — Apple rejects apps with inaccurate manifests
✅ Must be reviewed before every App Store submission
```

### GDPR / CCPA Compliance
```
✅ Privacy Policy live at a public URL before launch (Termly.io)
✅ Terms of Service live at a public URL before launch
✅ "Delete My Account" feature implemented before launch
   - Deletes all Firestore user data
   - Deletes Firebase Auth account
   - Confirmed with email to user
✅ Data portability: user can request their data (post-MVP)
✅ No data sold or shared with third parties for advertising
✅ Firebase GDPR Data Processing Agreement accepted
✅ RevenueCat GDPR compliance confirmed
```

### Third-Party SDK Audit
```
Every SDK in the app must be declared here with its data collection:

Firebase Auth         → collects: UID, email, display name ✅ disclosed
Firebase Firestore    → collects: app usage data ✅ disclosed
Firebase Crashlytics  → collects: crash reports, device info ✅ disclosed
Firebase Analytics    → collects: anonymous usage events ✅ disclosed
RevenueCat            → collects: purchase events, subscription status ✅ disclosed
Mapbox                → collects: map tile requests (anonymized) ✅ disclosed
HealthKit/HC          → reads: step count only, stays on device ✅ disclosed

Before adding ANY new SDK:
✅ Read its privacy policy
✅ Confirm what data it collects
✅ Add it to this list
✅ Update Privacy Policy
✅ Update Apple Privacy Manifest
✅ Update Google Play Data Safety section
❌ NEVER add an SDK that sells user data to advertisers
```

---

## 8. Mobile-Specific Security

### Screen Security
```
✅ Obscure sensitive screens when app goes to background
   (show blur or splash screen — not the actual content)
   Applies to: payment screen, user profile
✅ Prevent screenshots on payment/purchase screens
   iOS: set UIScreen.isCaptured check
   Android: FLAG_SECURE on payment activity
✅ Clear clipboard after any sensitive copy operation
```

### Deep Link Security
```
✅ Validate ALL incoming deep links before processing
✅ Universal Links (iOS) + App Links (Android) — not custom URL schemes
✅ Never process deep link parameters without sanitization
✅ RevenueCat webhook URL validated by signature
❌ NEVER trust deep link parameters without server-side validation
```

### Jailbreak / Root Detection
```
MVP:     Detect and log — do not block
         (blocking causes false positives and App Store friction)
Post-MVP: Consider blocking purchase flow on jailbroken devices
          to reduce IAP fraud risk
Library:  react-native-device-info provides basic detection
```

### Biometric Authentication
```
Post-MVP feature — not Sprint 1
When implemented:
✅ Use expo-local-authentication
✅ Fallback to PIN/password if biometrics unavailable
✅ Never store biometric data — use system APIs only
✅ Re-authenticate before any purchase
```

---

## 9. Payment Security

### Non-Negotiables (NON-NEGOTIABLE)
```
✅ ALL payments through RevenueCat + Apple StoreKit / Google Play Billing
✅ RevenueCat webhook signature validated server-side before processing
✅ Entitlement state always verified server-side — never trust client
✅ Purchase receipt validated by RevenueCat before unlocking content
✅ No payment card data ever touches our servers — ever

❌ NEVER implement custom payment processing
❌ NEVER accept payments outside Apple/Google IAP from inside the app
❌ NEVER store payment card numbers, CVVs, or bank details
❌ NEVER link to external payment pages from inside the app
❌ NEVER mention lower prices available outside the app
```

---

## 10. Infrastructure Security

### Local Device Security
```
✅ Any machine with repo, Firebase access, or release tooling must have:
   - full-disk encryption enabled
   - screen lock enabled
   - OS updates reasonably current
✅ Do not store release credentials on shared or unmanaged machines
```

### Firebase Project Security
```
✅ paila-dev and paila-prod are completely separate Firebase projects
✅ Production credentials never used in development
✅ Firebase project access restricted to founder + Codex only
✅ Service account keys never committed to repo
✅ Firebase Admin SDK used only in Cloud Functions — never in client app
✅ Cloud Function environment variables set via Firebase config — not hardcoded
✅ Firebase Storage rules: no public read/write
```

### CI/CD Security
```
✅ GitHub Actions secrets used for all sensitive values
✅ No secrets in GitHub Actions logs (use ::add-mask::)
✅ PRs from forks cannot access repo secrets
✅ Branch protection on main — no direct pushes
✅ Require PR reviews before merge
✅ CI must pass before merge
✅ Dependency vulnerability scan in CI pipeline
```

### Backup & Recovery
```
✅ Founder maintains recovery access to Firebase, GitHub, Apple, and Google Play
✅ Critical admin credentials are recoverable without relying on a single device
✅ Secret rotation procedure tested at least once before launch
```

### Monitoring & Incident Response
```
✅ Firebase Crashlytics enabled for crash monitoring
✅ Firebase Analytics for anomaly detection
✅ Unusual auth patterns → alert founder
✅ Spike in Cloud Function errors → alert founder

Incident response steps:
1. Identify and contain the issue
2. Post in CLAUDE_CODEX_CHAT.md immediately
3. Assess data exposure
4. Notify affected users if PII was exposed (GDPR requires within 72 hours)
5. Fix, test, deploy
6. Post-mortem documented
```

---

## 11. Security Checklist — Definition of Done

A feature is NOT done until ALL of these pass:

### Every Feature
- [ ] No secrets hardcoded
- [ ] No PII in logs
- [ ] Input validated (Zod schemas)
- [ ] Error messages don't expose internals
- [ ] New dependencies audited and added to SDK list above

### Auth-Touching Features
- [ ] Tokens stored in Keychain/Keystore only
- [ ] No tokens in AsyncStorage or plain MMKV
- [ ] Session cleanup on sign out verified

### Data-Touching Features
- [ ] Firestore rules updated and tested
- [ ] Only minimum required data collected
- [ ] Health data stays on device (never sent to third parties)
- [ ] Privacy Policy still accurate after this change

### Network-Touching Features
- [ ] All calls use HTTPS
- [ ] App Check token included
- [ ] Auth token included
- [ ] Rate limiting respected

### Payment-Touching Features
- [ ] All IAP through RevenueCat + Apple/Google
- [ ] Entitlement verified server-side
- [ ] Screenshot prevention enabled
- [ ] No financial data stored

### Build & Release
- [ ] npm audit clean (no high/critical vulnerabilities)
- [ ] ProGuard/obfuscation enabled for production
- [ ] Source maps not included in binary
- [ ] Apple Privacy Manifest updated
- [ ] Google Play Data Safety section accurate
- [ ] App Check enforced in production
- [ ] Production build points to `paila-prod` only
- [ ] Debug tokens and debug providers disabled in production
- [ ] No secrets or config files present in repo/workspace

---

## 12. Security Standards We Follow

These are the industry standards Paila is built against:

```
OWASP Mobile Top 10        → primary mobile security reference
OWASP MASVS (L1)           → Mobile Application Security Verification Standard
Apple App Store Guidelines  → Section 5 (privacy) + Section 3 (payments)
Google Play Policy          → Data safety + payments policy
GDPR                        → EU data protection
CCPA                        → California Consumer Privacy Act
HIPAA-adjacent              → we handle health data (steps) — treat with equivalent care
PCI-DSS                     → not applicable (RevenueCat handles payments)
```

---

## 13. What Codex Must Do Before Writing Any Feature

```
1. Read AGENTS.md
2. Read SECURITY.md (this file)
3. Ask: does this feature touch auth, storage, network, payments, or health data?
4. If yes → apply the relevant section above
5. If unsure → post question in CLAUDE_CODEX_CHAT.md before implementing
6. After implementation → run through security checklist above
7. Flag any security concern immediately — never ship around it
```

---

*Security is not a sprint. It is the foundation every sprint is built on.*
*"The mountain is unforgiving. So is a security breach." 🏔️*
