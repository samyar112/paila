# Bug Tracker

## Open Bugs

- _(none)_

## Fixed Bugs

1. iOS build failed with `unknown type name RCT_EXTERN` in RNFirebase Firestore modules.
   - Fix: Added `expo-build-properties` + `forceStaticLinking` for RNFB pods.

2. Firebase config path broke after `prebuild --clean`.
   - Fix: Updated `googleServicesFile` paths to root `dev/` and `prod/` files.

3. AdMob crash (`GADInvalidInitializationException`) due to missing App ID.
   - Fix: Added `react-native-google-mobile-ads` Expo plugin with test app IDs.

4. Firebase runtime crash (`No Firebase App '[DEFAULT]' has been created`).
   - Fix: Added RNFirebase Expo plugins so `FirebaseApp.configure()` is injected reliably.

5. React hook order crash in `App.tsx`.
   - Fix: Moved all hooks above early returns.

6. Firestore write error: `Unsupported field value: undefined`.
   - Fix: Switched nullable fields from `undefined` to `null` in `ClientSeedService`.

7. HealthKit crash (`initHealthKit` undefined) on simulator/unavailable module.
   - Fix: Added guarded/lazy health module access in `HealthKitProvider` and `PermissionsScreen`.

8. Firestore permission denied during client-side seeding.
   - Fix: Updated and deployed `firestore.rules` to allow required client writes in `paila-dev`.

9. Google sign-in error: `google web client id is not configured`.
   - Fix: Added dev fallback `googleWebClientId` in `app.config.ts`.

10. Xcode build failed writing index temp files (disk pressure).
    - Fix: Cleared DerivedData/ModuleCache and added `scripts/clear-ios-cache.sh`.

11. iOS ATT crash: missing `NSUserTrackingUsageDescription` in Info.plist.
    - Fix: Added `NSUserTrackingUsageDescription` to `app.config.ts` iOS `infoPlist`.

12. Firestore seeding read denied when route doc did not yet exist.
    - Fix: Updated `firestore.rules` route read rule to allow signed-in reads during client-side seeding.

13. RNFirebase v22 deprecation warnings (namespaced API usage across auth/firestore/app-check/crashlytics).
    - Fix: Migrated app code to modular APIs (`getAuth`, `onAuthStateChanged`, `signInWithCredential`, `getFirestore`, `collection/doc/query/getDoc/getDocs/writeBatch/updateDoc`, `initializeAppCheck`, `getCrashlytics`).

14. Simulator/dev step counting could not be validated because native step providers were unavailable.
    - Fix: Added a dev-only mock step provider + JourneyHome dev controls to simulate source steps through `StepSyncService` and verify real progression mechanics.

15. "Begin Everest Journey" button appeared non-functional when journey start failed.
    - Fix: Added explicit post-start error surfacing in `ScaffoldShellScreen` by reading Zustand `journey/error` state after `startJourney`.
