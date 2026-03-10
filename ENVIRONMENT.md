# ENVIRONMENT.md — Paila

## Current environments

- `development` -> Firebase project `paila-dev`
- `production` -> Firebase project `paila-prod`

`APP_ENV` is a build-time variable. Switching environments requires a rebuild.

## Local native config files

Firebase config files stay outside the repo.

Expected local source files:

- iOS dev plist
- Android dev json
- iOS prod plist
- Android prod json

## Sync script

Use the sync script before `expo run:ios` or `expo run:android`.

Development:

```bash
APP_ENV=development \
FIREBASE_IOS_CONFIG_PATH="/absolute/path/to/dev/GoogleService-Info.plist" \
FIREBASE_ANDROID_CONFIG_PATH="/absolute/path/to/dev/google-services.json" \
bash ./scripts/sync-firebase-config.sh
```

Production:

```bash
APP_ENV=production \
FIREBASE_IOS_CONFIG_PATH="/absolute/path/to/prod/GoogleService-Info.plist" \
FIREBASE_ANDROID_CONFIG_PATH="/absolute/path/to/prod/google-services.json" \
bash ./scripts/sync-firebase-config.sh
```

Output targets:

- iOS -> `ios/Paila/GoogleService-Info.plist`
- Android -> `android/app/google-services.json`

## EAS

`eas.json` sets:

- `development` -> `APP_ENV=development`
- `production` -> `APP_ENV=production`

Later, when Firebase is wired fully, the same file-copy pattern should be handled in the EAS build environment via secrets or secure file injection, not by committing config files.
