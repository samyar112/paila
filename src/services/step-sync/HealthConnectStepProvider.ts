import { Platform } from 'react-native';
import type { StepProvider, StepReading } from './StepProvider';

// Health Connect native module will be integrated when
// react-native-health-connect is added. This provider is a placeholder.

export class HealthConnectStepProvider implements StepProvider {
  async isAvailable(): Promise<boolean> {
    return Platform.OS === 'android';
  }

  async requestPermission(): Promise<boolean> {
    // TODO: Wire react-native-health-connect
    return false;
  }

  async getTodaySteps(): Promise<StepReading | null> {
    // TODO: Wire Health Connect native read
    return null;
  }
}
