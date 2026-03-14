#!/bin/bash
set -e

echo "=== Paila iOS Cache Cleaner ==="
echo ""

freed=0

# Xcode DerivedData
dd_path="$HOME/Library/Developer/Xcode/DerivedData"
if [ -d "$dd_path" ]; then
  size=$(du -sm "$dd_path" 2>/dev/null | awk '{print $1}')
  rm -rf "$dd_path"/*
  freed=$((freed + size))
  echo "[x] Cleared Xcode DerivedData (~${size} MB)"
else
  echo "[ ] No DerivedData found"
fi

# Project ios build artifacts (keep ios/Pods and CocoaPods cache to avoid slow re-downloads)
project_dir="$(cd "$(dirname "$0")/.." && pwd)"
for dir in "$project_dir/ios/build"; do
  if [ -d "$dir" ]; then
    size=$(du -sm "$dir" 2>/dev/null | awk '{print $1}')
    rm -rf "$dir"
    freed=$((freed + size))
    echo "[x] Cleared $(basename "$dir") (~${size} MB)"
  fi
done



# Unused simulators
pruned=$(xcrun simctl delete unavailable 2>&1 || true)
echo "[x] Pruned unavailable simulators"

echo ""
echo "Freed ~$((freed / 1024)) GB total"
echo ""
df -h / | tail -1 | awk '{print "Disk: " $4 " free (" $5 " used)"}'
echo ""
echo "Run 'npx expo prebuild --clean --platform ios' to regenerate ios/"
