#!/bin/bash

set -euo pipefail

APP_ENV="${APP_ENV:-development}"
IOS_SOURCE_PATH="${FIREBASE_IOS_CONFIG_PATH:-}"
ANDROID_SOURCE_PATH="${FIREBASE_ANDROID_CONFIG_PATH:-}"

if [ -z "$IOS_SOURCE_PATH" ] || [ -z "$ANDROID_SOURCE_PATH" ]; then
  echo "Error: FIREBASE_IOS_CONFIG_PATH and FIREBASE_ANDROID_CONFIG_PATH are required."
  exit 1
fi

if [ ! -f "$IOS_SOURCE_PATH" ]; then
  echo "Error: iOS config file not found at $IOS_SOURCE_PATH"
  exit 1
fi

if [ ! -f "$ANDROID_SOURCE_PATH" ]; then
  echo "Error: Android config file not found at $ANDROID_SOURCE_PATH"
  exit 1
fi

IOS_DESTINATION="ios/Paila/GoogleService-Info.plist"
ANDROID_DESTINATION="android/app/google-services.json"

mkdir -p "$(dirname "$IOS_DESTINATION")" "$(dirname "$ANDROID_DESTINATION")"
cp "$IOS_SOURCE_PATH" "$IOS_DESTINATION"
cp "$ANDROID_SOURCE_PATH" "$ANDROID_DESTINATION"

echo "Synced Firebase config for APP_ENV=$APP_ENV"
echo "  iOS     -> $IOS_DESTINATION"
echo "  Android -> $ANDROID_DESTINATION"
