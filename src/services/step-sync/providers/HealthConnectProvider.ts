// ─────────────────────────────────────────────
// HealthConnectProvider — Android step source via react-native-health-connect
// ─────────────────────────────────────────────
//
// Priority 1 source on Android. Falls back gracefully if permission denied.
// Reads today's step count from Android Health Connect.

import { Platform } from 'react-native';
import {
  initialize,
  requestPermission,
  readRecords,
} from 'react-native-health-connect';
import type { StepProvider, StepReading } from '../StepProvider';

/** Health Connect permission for reading step count records. */
const STEP_READ_PERMISSION = {
  accessType: 'read' as const,
  recordType: 'Steps' as const,
};

export class HealthConnectProvider implements StepProvider {
  private isInitialized = false;
  private permissionGranted = false;

  async isAvailable(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;

    try {
      const available = await initialize();
      this.isInitialized = available;
      return available;
    } catch {
      return false;
    }
  }

  async requestPermission(): Promise<boolean> {
    const available = await this.isAvailable();
    if (!available) return false;

    try {
      const grantedPermissions = await requestPermission([STEP_READ_PERMISSION]);

      // Check if the step read permission was granted
      this.permissionGranted = grantedPermissions.some(
        (perm: { accessType: string; recordType: string }) =>
          perm.recordType === 'Steps' && perm.accessType === 'read',
      );

      return this.permissionGranted;
    } catch {
      this.permissionGranted = false;
      return false;
    }
  }

  async getTodaySteps(): Promise<StepReading | null> {
    const available = await this.isAvailable();
    if (!available) return null;

    // Ensure permissions before reading
    if (!this.permissionGranted) {
      const granted = await this.requestPermission();
      if (!granted) return null;
    }

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    try {
      const result = await readRecords('Steps', {
        timeRangeFilter: {
          operator: 'between',
          startTime: startOfDay.toISOString(),
          endTime: now.toISOString(),
        },
      });

      // Sum all step records for today
      let totalSteps = 0;
      for (const record of result.records) {
        if ('count' in record && typeof record.count === 'number') {
          totalSteps += record.count;
        }
      }

      return {
        steps: totalSteps,
        source: 'health_connect',
        fetchedAt: now,
      };
    } catch {
      return null;
    }
  }
}
