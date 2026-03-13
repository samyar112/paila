import { Platform } from 'react-native';
import type { StepProvider, StepReading } from './StepProvider';

// HealthKit native module will be integrated when react-native-health
// or expo-health is added. This provider is a placeholder that returns null
// until the native module is wired.

export class HealthKitStepProvider implements StepProvider {
  async isAvailable(): Promise<boolean> {
    return Platform.OS === 'ios';
  }

  async requestPermission(): Promise<boolean> {
    // TODO: Wire react-native-health or expo-health
    return false;
  }

  async getTodaySteps(): Promise<StepReading | null> {
    // TODO: Wire HealthKit native read
    return null;
  }
}
