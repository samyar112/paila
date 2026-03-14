import { Platform } from 'react-native';
import type { StepProvider } from './StepProvider';
import { HealthKitProvider } from './providers/HealthKitProvider';
import { HealthConnectProvider } from './providers/HealthConnectProvider';
import { PedometerStepProvider } from './PedometerStepProvider';
import { DevMockStepProvider } from './DevMockStepProvider';

function isDevMode(): boolean {
  return typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';
}

export class StepProviderFactory {
  /**
   * Returns an ordered list of step providers for the current platform.
   * Priority 1: HealthKit (iOS) / Health Connect (Android) — native SDK
   * Priority 2: Phone pedometer (expo-sensors fallback)
   * ONE source wins per day. Never add sources together.
   */
  static create(): StepProvider[] {
    const mockProvider = isDevMode() ? [new DevMockStepProvider()] : [];

    if (Platform.OS === 'ios') {
      return [new HealthKitProvider(), new PedometerStepProvider(), ...mockProvider];
    }
    return [new HealthConnectProvider(), new PedometerStepProvider(), ...mockProvider];
  }
}
