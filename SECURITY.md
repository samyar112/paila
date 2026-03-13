# SECURITY.md — Paila (पाइला)

> Read before any task touching auth, storage, networking, payments, or health data.
> These are non-negotiables unless explicitly marked as post-MVP.

---

## Stop Conditions

Stop all work immediately and post to CLAUDE_CODEX_CHAT.md if you detect:

- Any secret, key, or token hardcoded in source code
- Any Firebase config file committed to the repo
- Any PII written to console logs
- Any health data sent to a third party
- Any auth token stored in AsyncStorage (unencrypted)
- Any payment flow that bypasses Apple/Google IAP
- Any HTTP (non-HTTPS) network call
- Any client-side write to the ledger or journey progression

---

## 1. Secrets & Configuration

- Firebase config files never committed. Stored in gitignored paths within the repo (required by Xcode build phases).
- All build-time secrets via EAS Secrets. All backend secrets via Firebase environment config.
- `.gitignore` must exclude: `google-services.json`, `GoogleService-Info.plist`, `.env`, `.env.*`, `firebase/`
- If a secret is accidentally committed: rotate immediately, force-push to remove from history, audit access, post incident in CLAUDE_CODEX_CHAT.md.
- Never paste secrets in docs, PRs, chat files, or screenshots.
- Service account keys should not be created unless absolutely necessary. If temporary, store outside repo and delete after use.

---

## 2. Authentication

- Apple Sign In (iOS) + Google Sign In (Android) via Firebase Auth.
- Firebase Auth manages all tokens and refresh cycles automatically.
- Token storage: Keychain (iOS), EncryptedSharedPreferences (Android) — handled by Firebase Auth.
- Additional sensitive data → `expo-secure-store`. Never AsyncStorage, never plain MMKV.
- Sign out clears ALL local state (MMKV, Firestore offline cache, secure store).
- Auto sign-out after 30 days of inactivity.
- Least-privilege access: founder retains billing owner, development uses narrowest required role.

---

## 3. On-Device Data Storage

```
Keychain / expo-secure-store:
  Auth tokens, sensitive preferences

MMKV (non-sensitive only):
  Route cache, weather cache, UI prefs, journey state
  NEVER: auth tokens, payment info, raw health data

Firestore offline cache:
  Journey progress, ledger (read-only on device)

Local filesystem:
  Downloaded premium content (checksum verified)
  NEVER: user PII, auth data
```

---

## 4. Health Data

- HealthKit / Health Connect read on device only.
- Only today's step total sent to backend (one integer).
- Heart rate, sleep, other health metrics never read or stored.
- Health data never sent to third parties or used for advertising.
- HealthKit/Health Connect purpose strings must be honest and specific.
- Never request health permissions not justified by core step functionality.

---

## 5. Data in Transit

- TLS 1.2 minimum on all connections (Firebase enforces this).
- All Firebase SDK calls and Cloud Function calls use HTTPS.
- Never make HTTP (non-HTTPS) calls.
- Never disable SSL validation in any environment.
- Never log request/response bodies containing user data.

---

## 6. Backend Security

### Firebase App Check (Non-Negotiable)

- Enabled on ALL Firebase services: Firestore, Functions, Storage, Auth.
- Dev: debug token. Prod: DeviceCheck (iOS) + Play Integrity (Android).
- Never disabled in production. Requests without valid App Check token must be rejected.

### Firestore Rules

- No collection publicly readable or writable.
- Users read/write own docs only.
- Journey progression and ledger: Cloud Functions only — never client writes.
- All rules covered by automated tests. Reviewed by Claude before every deploy.
- Never use `allow read, write: if true` anywhere.

### Cloud Functions

- Validate App Check + Auth token on every function.
- Input validation with Zod schemas.
- Rate limiting enforced server-side.
- Never trust client-supplied progression data.
- Never return stack traces or internal errors to client.

### Rate Limits

- Max 4 weather proxy calls per user per day.
- RevenueCat webhook validated by HMAC signature before processing.
- RevenueCat webhook replay protection / idempotency enforced server-side.

---

## 7. Code & Build Security

- Hermes engine enabled (bytecode, not plain JS).
- ProGuard / R8 enabled for Android production builds.
- Source maps generated but NEVER shipped in production binary.
- Run `npm audit` before every sprint. Pin critical dependency versions.
- Review all new dependencies: maintainer, last update, permissions, data collection.
- `eslint-plugin-security` enabled.
- Secrets scanner in CI pipeline.

---

## 8. Privacy & Compliance

### Data Minimization

We collect only what we need:

- Firebase UID, daily step total, journey progress, timezone, countryCode, app locale.
- Firestore stores UID only — never name or email (those stay in Firebase Auth).
- No GPS coordinates, no raw health data, no contacts, no device identifiers beyond Firebase defaults.

### Required Before Launch

- Privacy Policy at public URL.
- Terms of Service at public URL.
- "Delete My Account" feature (wipes Firestore + Firebase Auth + MMKV, confirmed to user).
- Apple Privacy Manifest (`PrivacyInfo.xcprivacy`) for iOS 17+.
- Google Play Data Safety section accurate.
- No data sold or shared with third parties for advertising.

### SDK Audit

```
Firebase Auth / Firestore / Crashlytics  → disclosed
RevenueCat                               → disclosed
HealthKit / Health Connect               → step count only, on-device
```

Before adding any SDK: read privacy policy, confirm data collection, update this list + Privacy Policy + store manifests.

---

## 9. Payment Security

- All payments through RevenueCat + Apple StoreKit / Google Play Billing.
- Entitlement always verified server-side — never trust client.
- No payment card data ever touches our servers.
- Never implement custom payment processing.
- Never link to external payment pages from inside the app.
- Never mention lower prices available outside the app.

---

## 10. Infrastructure

- `paila-dev` and `paila-prod` are separate Firebase projects.
- Production credentials never used in development.
- Firebase Admin SDK in Cloud Functions only — never in client app.
- GitHub Actions secrets for CI. Branch protection on main.
- Founder maintains recovery access to Firebase, GitHub, Apple, and Google Play.

---

## Security Checklist (Definition of Done)

**Every feature:**
- [ ] No secrets hardcoded
- [ ] No PII in logs
- [ ] Input validated (Zod)
- [ ] Error messages don't expose internals
- [ ] New dependencies audited

**Auth features:** tokens in Keychain only, session cleanup on sign out.
**Data features:** Firestore rules updated + tested, minimum data collected.
**Network features:** HTTPS only, App Check + Auth token included.
**Payment features:** IAP through RevenueCat only, entitlement verified server-side.
**Build:** npm audit clean, ProGuard on, source maps excluded, Privacy Manifest updated, App Check enforced in prod.

---

## Post-MVP Hardening

Tracked but deferred:

- Certificate pinning for Cloud Function endpoints (`react-native-ssl-pinning`).
- Jailbreak/root detection (detect and log, don't block).
- Biometric re-authentication before purchase (`expo-local-authentication`).
- Screenshot prevention on payment screens.
- GDPR data portability (user data export on request).
