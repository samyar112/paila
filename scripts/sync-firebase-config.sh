#!/bin/bash

set -euo pipefail

APP_ENV="${APP_ENV:-development}"

# Firebase config files live inside the repo under ios/Paila/dev and ios/Paila/prod.
# These folders are gitignored — the plists are never committed.
# See SECURITY.md §1 for the approved exception covering this layout.

if [ "$APP_ENV" = "production" ]; then
  IOS_SOURCE="ios/Paila/prod/GoogleService-Info.plist"
  ANDROID_SOURCE="ios/Paila/prod/google-services.json"
else
  IOS_SOURCE="ios/Paila/dev/GoogleService-Info.plist"
  ANDROID_SOURCE="ios/Paila/dev/google-services.json"
fi

# Two iOS destinations required:
#   ios/GoogleService-Info.plist       <- RNFB build scripts find it via SRCROOT
#   ios/Paila/GoogleService-Info.plist <- Xcode target bundle copy
IOS_DESTINATION_SRCROOT="ios/GoogleService-Info.plist"
IOS_DESTINATION_TARGET="ios/Paila/GoogleService-Info.plist"
ANDROID_DESTINATION="android/app/google-services.json"

if [ ! -f "$IOS_SOURCE" ]; then
  echo "Error: iOS config not found at: $IOS_SOURCE"
  echo "Restore GoogleService-Info.plist to ios/Paila/dev/ (or prod/) and try again."
  exit 1
fi

if [ ! -f "$ANDROID_SOURCE" ]; then
  echo "Error: Android config not found at: $ANDROID_SOURCE"
  echo "Restore google-services.json to ios/Paila/dev/ (or prod/) and try again."
  exit 1
fi

cp "$IOS_SOURCE" "$IOS_DESTINATION_SRCROOT"
cp "$IOS_SOURCE" "$IOS_DESTINATION_TARGET"
cp "$ANDROID_SOURCE" "$ANDROID_DESTINATION"

echo "Synced Firebase config for APP_ENV=$APP_ENV"
echo "  iOS (SRCROOT) -> $IOS_DESTINATION_SRCROOT"
echo "  iOS (target)  -> $IOS_DESTINATION_TARGET"
echo "  Android       -> $ANDROID_DESTINATION"
