// ─────────────────────────────────────────────
// HealthKitProvider — iOS step source via react-native-health
// ─────────────────────────────────────────────
//
// Priority 1 source on iOS. Falls back gracefully if permission denied.
// Reads today's step count from Apple HealthKit.
// Permission purpose string: "Paila reads your daily step count to advance
// your journey along the trail."

import { Platform } from 'react-native';
import AppleHealthKit, {
  HealthKitPermissions,
  HealthInputOptions,
} from 'react-native-health';
import type { StepProvider, StepReading } from '../StepProvider';

const HEALTHKIT_PERMISSIONS: HealthKitPermissions = {
  permissions: {
    read: [AppleHealthKit.Constants.Permissions.StepCount],
    write: [],
  },
};

export class HealthKitProvider implements StepProvider {
  private permissionGranted = false;

  async isAvailable(): Promise<boolean> {
    if (Platform.OS !== 'ios') return false;

    return new Promise<boolean>((resolve) => {
      try {
        AppleHealthKit.isAvailable((err, available) => {
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

    return new Promise<boolean>((resolve) => {
      try {
        AppleHealthKit.initHealthKit(HEALTHKIT_PERMISSIONS, (err) => {
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

    // Ensure permissions are initialized before reading
    if (!this.permissionGranted) {
      const granted = await this.requestPermission();
      if (!granted) return null;
    }

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const options: HealthInputOptions = {
      date: now.toISOString(),
      includeManuallyAdded: false,
    };

    return new Promise<StepReading | null>((resolve) => {
      try {
        AppleHealthKit.getStepCount(
          options,
          (err, results) => {
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
