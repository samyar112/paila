import { Platform } from 'react-native';
import type { StepProvider } from './StepProvider';
import { HealthKitStepProvider } from './HealthKitStepProvider';
import { HealthConnectStepProvider } from './HealthConnectStepProvider';
import { PedometerStepProvider } from './PedometerStepProvider';

export class StepProviderFactory {
  static create(): StepProvider[] {
    if (Platform.OS === 'ios') {
      return [new HealthKitStepProvider(), new PedometerStepProvider()];
    }
    return [new HealthConnectStepProvider(), new PedometerStepProvider()];
  }
}
