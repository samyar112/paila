import { Platform } from 'react-native';
import type { StepProvider } from './StepProvider';
import { HealthKitProvider } from './providers/HealthKitProvider';
import { HealthConnectProvider } from './providers/HealthConnectProvider';
import { PedometerStepProvider } from './PedometerStepProvider';

export class StepProviderFactory {
  /**
   * Returns an ordered list of step providers for the current platform.
   * Priority 1: HealthKit (iOS) / Health Connect (Android) — native SDK
   * Priority 2: Phone pedometer (expo-sensors fallback)
   * ONE source wins per day. Never add sources together.
   */
  static create(): StepProvider[] {
    if (Platform.OS === 'ios') {
      return [new HealthKitProvider(), new PedometerStepProvider()];
    }
    return [new HealthConnectProvider(), new PedometerStepProvider()];
  }
}
