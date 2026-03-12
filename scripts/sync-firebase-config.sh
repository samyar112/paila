#!/bin/bash

set -euo pipefail

APP_ENV="${APP_ENV:-development}"

# Source — Firebase config files stored outside the repo (never committed)
IOS_SOURCE="/Users/SamirPandey/Desktop/untitled folder/Documents/Apps Data/Paila/dev/GoogleService-Info.plist"
ANDROID_SOURCE="/Users/SamirPandey/Desktop/untitled folder/Documents/Apps Data/Paila/dev/google-services.json"

# Destinations — where Expo/native build expects them
IOS_DESTINATION="ios/GoogleService-Info.plist"
ANDROID_DESTINATION="android/app/google-services.json"

if [ ! -f "$IOS_SOURCE" ]; then
  echo "Error: iOS config not found at: $IOS_SOURCE"
  exit 1
fi

if [ ! -f "$ANDROID_SOURCE" ]; then
  echo "Error: Android config not found at: $ANDROID_SOURCE"
  exit 1
fi

cp "$IOS_SOURCE" "$IOS_DESTINATION"
cp "$ANDROID_SOURCE" "$ANDROID_DESTINATION"

echo "Synced Firebase config for APP_ENV=$APP_ENV"
echo "  iOS     -> $IOS_DESTINATION"
echo "  Android -> $ANDROID_DESTINATION"
