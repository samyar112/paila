// ─────────────────────────────────────────────
// HealthKitProvider — iOS step source via react-native-health
// ─────────────────────────────────────────────
//
// Priority 1 source on iOS. Falls back gracefully if permission denied.
// Reads today's step count from Apple HealthKit.
// Permission purpose string: "Paila reads your daily step count to advance
// your journey along the trail."

import { Platform } from 'react-native';
import type { StepProvider, StepReading } from '../StepProvider';

// Lazy-load react-native-health to avoid crash on simulator where the native module is unavailable
function getAppleHealthKit() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('react-native-health');
    return mod.default ?? mod;
  } catch {
    return null;
  }
}

function getHealthKitPermissions() {
  const AHK = getAppleHealthKit();
  if (!AHK) return null;
  return {
    permissions: {
      read: [AHK.Constants.Permissions.StepCount],
      write: [],
    },
  };
}

export class HealthKitProvider implements StepProvider {
  private permissionGranted = false;

  async isAvailable(): Promise<boolean> {
    if (Platform.OS !== 'ios') return false;
    const AHK = getAppleHealthKit();
    if (!AHK) return false;

    return new Promise<boolean>((resolve) => {
      try {
        AHK.isAvailable((err: unknown, available: boolean) => {
          if (err) {
            resolve(false);
            return;
          }
          resolve(available);
        });
      } catch {
        resolve(false);
      }
    });
  }

  async requestPermission(): Promise<boolean> {
    const available = await this.isAvailable();
    if (!available) return false;

    const AHK = getAppleHealthKit();
    const perms = getHealthKitPermissions();
    if (!AHK || !perms) return false;

    return new Promise<boolean>((resolve) => {
      try {
        AHK.initHealthKit(perms, (err: unknown) => {
          if (err) {
            this.permissionGranted = false;
            resolve(false);
            return;
          }
          this.permissionGranted = true;
          resolve(true);
        });
      } catch {
        this.permissionGranted = false;
        resolve(false);
      }
    });
  }

  async getTodaySteps(): Promise<StepReading | null> {
    const available = await this.isAvailable();
    if (!available) return null;

    if (!this.permissionGranted) {
      const granted = await this.requestPermission();
      if (!granted) return null;
    }

    const AHK = getAppleHealthKit();
    if (!AHK) return null;

    const now = new Date();

    const options = {
      date: now.toISOString(),
      includeManuallyAdded: false,
    };

    return new Promise<StepReading | null>((resolve) => {
      try {
        AHK.getStepCount(
          options,
          (err: unknown, results: { value: number } | null) => {
            if (err || !results) {
              resolve(null);
              return;
            }

            resolve({
              steps: Math.floor(results.value),
              source: 'healthkit',
              fetchedAt: now,
            });
          },
        );
      } catch {
        resolve(null);
      }
    });
  }
}
