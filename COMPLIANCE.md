# COMPLIANCE.md — Paila (पाइला)

> Data collection, privacy, and store compliance documentation.
> Updated for Sprint 4 — native SDK integration.

---

## 1. Data Collection Inventory

| Data Type | What We Collect | Why | Storage Location | Retention | Linked to Identity |
|-----------|----------------|-----|-----------------|-----------|-------------------|
| **Step Count** | Daily step count from HealthKit (iOS) / Health Connect (Android) | Core app functionality — advance journey along trail | MMKV (cache, today only), Firestore (permanent ledger) | MMKV: cleared daily. Firestore: until account deletion | Yes (via Firebase UID) |
| **Firebase UID** | Random anonymous user identifier | Authentication, journey persistence | Firestore `users/{uid}` | Until account deletion | Yes |
| **Email** | User email from sign-in provider | Authentication only | Firebase Auth only (NOT in Firestore) | Until account deletion | Yes |
| **Display Name** | User display name from sign-in provider | Profile display only | Firebase Auth only (NOT in Firestore) | Until account deletion | Yes |
| **Country Code** | 2-letter country code (e.g., "NP") | Nepal local free access detection | Firestore `users/{uid}.countryCode`, MMKV cache | Until account deletion | Yes |
| **Purchase History** | In-app purchase status | Unlock premium trek content | RevenueCat (server), Firestore `entitlements` subcollection | Until account deletion | Yes |
| **Journey Progress** | Meters walked, milestones reached, streak days | Core app functionality | Firestore `journeys/{id}` | Until account deletion | Yes |
| **Device Advertising ID** | IDFA (iOS) / GAID (Android) | Ad serving via AdMob (free users only) | Google AdMob (third-party) | Per Google's retention policy | No |
| **Crash Data** | Stack traces, device info | App stability monitoring | Firebase Crashlytics | 90 days (Firebase default) | No |
| **Analytics Events** | Screen views, journey events | Usage analytics | Firebase Analytics | 14 months (Firebase default) | No |

---

## 2. Third-Party SDK Data Sharing

### Google AdMob (`react-native-google-mobile-ads`)

- **Data shared:** Device advertising identifier, IP address, general location (for ad targeting)
- **Purpose:** Display banner ads to free-tier users
- **When:** Only when ads are shown (never during ceremonies, checkpoint decisions, or airplane intro)
- **Who sees ads:** Free-tier users only. Paid users and Nepal-local users NEVER see ads.
- **User control:** Ads removed permanently upon purchase. Non-personalized ads requested by default.
- **AdMob Privacy Policy:** https://policies.google.com/privacy

### RevenueCat (`react-native-purchases`)

- **Data shared:** Firebase UID (as customer ID), purchase receipts, product identifiers
- **Purpose:** Manage in-app purchases, subscription entitlements, receipt validation
- **When:** On app launch (configure), on purchase, on restore
- **RevenueCat Privacy Policy:** https://www.revenuecat.com/privacy

### Firebase (Auth, Firestore, Crashlytics, Analytics)

- **Data shared:** Firebase UID, crash logs, basic analytics events
- **Purpose:** Authentication, data persistence, stability monitoring, usage analytics
- **When:** Throughout app lifecycle
- **Firebase Privacy Policy:** https://firebase.google.com/support/privacy

---

## 3. HealthKit / Health Connect Data Usage Declaration

### HealthKit (iOS)

- **Data read:** `HKQuantityTypeIdentifierStepCount` (daily step count only)
- **Data written:** None — Paila is read-only for HealthKit
- **Purpose:** Advance the user's walking journey along the trail
- **Permission string:** "Paila reads your daily step count to advance your journey along the trail."
- **NEVER used for:**
  - Advertising or ad targeting
  - Sharing with third parties (including AdMob, RevenueCat, or Firebase Analytics)
  - Selling to data brokers
  - Any purpose other than journey progression
- **Compliance:** Apple HealthKit guidelines require that health data is never used for advertising. Paila enforces this at the code level — `AdService` and analytics events have zero access to step data.

### Health Connect (Android)

- **Data read:** `Steps` record type (daily step count only)
- **Data written:** None — Paila is read-only for Health Connect
- **Purpose:** Advance the user's walking journey along the trail
- **Permission:** `android.permission.health.READ_STEPS`, `android.permission.ACTIVITY_RECOGNITION`
- **NEVER used for:** Same restrictions as HealthKit above
- **Compliance:** Google Health Connect data policy requires clear disclosure of data usage. Step data flows only to journey progression logic, never to ad or analytics services.

---

## 4. Android Data Safety Section Mapping

For Google Play Console Data Safety form:

| Category | Data Type | Collected | Shared | Purpose |
|----------|-----------|-----------|--------|---------|
| Health & fitness | Step count | ✅ | ❌ | App functionality |
| Personal info | Email address | ✅ | ❌ | Account management |
| Personal info | Name | ✅ | ❌ | Account management |
| App activity | In-app purchase history | ✅ | ✅ (RevenueCat) | App functionality |
| App info & performance | Crash logs | ✅ | ✅ (Firebase) | Analytics |
| Device or other IDs | Device ID | ✅ | ✅ (AdMob) | Advertising |

**Data deletion:** Users can delete their account and all associated data via Settings → Delete Account. Server-side `deleteUserAccount` Cloud Function wipes all Firestore data and Firebase Auth record.

**Data encryption:** All data in transit encrypted via HTTPS/TLS. Firestore data encrypted at rest by Google.

---

## 5. Apple Privacy Nutrition Label Mapping

For App Store Connect privacy questions:

### Data Used to Track You
- **Identifiers → Device ID:** Used by AdMob for ad serving (free users only)

### Data Linked to You
- **Identifiers → User ID:** Firebase UID for account and journey persistence
- **Purchases → Purchase History:** In-app purchase status via RevenueCat
- **Health & Fitness → Health:** Daily step count for journey progression

### Data Not Linked to You
- **Diagnostics → Crash Data:** Firebase Crashlytics crash reports
- **Diagnostics → Performance Data:** Firebase performance metrics
- **Usage Data → Product Interaction:** Firebase Analytics screen views and events

---

## 6. Privacy Policy & Terms of Service

### Privacy Policy

**URL (placeholder):** `https://paila.app/privacy`

The Privacy Policy must cover:
- What data is collected (see Section 1)
- How health data is used and protected (see Section 3)
- Third-party SDKs and data sharing (see Section 2)
- User rights: access, deletion, data portability
- Data retention periods
- Contact information for privacy inquiries
- Children's privacy (COPPA compliance — Paila does not target children under 13)

### Terms of Service

**URL (placeholder):** `https://paila.app/terms`

The Terms of Service must cover:
- In-app purchase terms (one-time, non-consumable, non-refundable through app)
- Acceptable use policy
- Intellectual property (photography, content licensing)
- Limitation of liability
- Dispute resolution

> **Action required before store submission:** Create actual Privacy Policy and Terms pages at the above URLs. These are placeholders.

---

## 7. Delete Account Flow

### User-Facing Flow

1. User navigates to Settings → Delete Account
2. Warning displayed: "This will permanently delete your account, journey progress, and all data. This cannot be undone."
3. User types "DELETE" to confirm
4. App calls `deleteUserAccount` Cloud Function
5. Cloud Function deletes:
   - All Firestore documents: `users/{uid}`, `journeys/*`, `step_snapshots/*`, `journey_ledger/*`, `entitlements/*`, `badges/*`, `events/*`
   - Firebase Auth account
6. Client clears MMKV local storage
7. User is signed out and returned to sign-in screen

### For Store Reviewers

- **Delete Account button location:** Settings screen (accessible from Journey Home → gear icon)
- **Confirmation required:** User must type "DELETE" — prevents accidental deletion
- **Server-side deletion:** `deleteUserAccount` Cloud Function (idempotent, safe to retry)
- **Data deleted:** All user data in Firestore + Firebase Auth record
- **Timeline:** Immediate (synchronous Cloud Function execution)
- **RevenueCat:** User's RevenueCat profile is NOT deleted (required for subscription management). Purchase history retained per Apple/Google requirements.
- **No data retention after deletion** except:
  - RevenueCat purchase records (required by Apple/Google)
  - Firebase Analytics aggregated data (anonymized, non-identifiable)
  - Firebase Crashlytics logs (contain no PII, auto-expire after 90 days)

---

## 8. Store Submission Checklist

### Apple App Store

- [ ] Apple Sign In implemented (required since we offer Google Sign In)
- [ ] All IAP through StoreKit via RevenueCat
- [ ] Privacy nutrition labels filled accurately (Section 5)
- [ ] HealthKit usage description in Info.plist
- [ ] HealthKit entitlement in Paila.entitlements
- [ ] PrivacyInfo.xcprivacy manifest complete (Section 9 of Sprint 4)
- [ ] NSUserTrackingUsageDescription for AdMob
- [ ] "Delete My Account" flow functional
- [ ] No private API usage
- [ ] Privacy Policy URL in App Store Connect
- [ ] Terms of Service URL in App Store Connect

### Google Play Store

- [ ] All IAP through Google Play Billing via RevenueCat
- [ ] Health Connect permissions declared in AndroidManifest.xml
- [ ] Health Connect Data Safety form completed (Section 4)
- [ ] `android.permission.ACTIVITY_RECOGNITION` declared
- [ ] Privacy Policy URL in Play Console
- [ ] Data Safety section matches actual data collection
- [ ] Target SDK meets current Play Store minimum
- [ ] "Delete My Account" flow functional
- [ ] Ad ID permission declared (`com.google.android.gms.permission.AD_ID`)

---

*Last updated: Sprint 4 — Native SDK integration*
*Review before every store submission.*
