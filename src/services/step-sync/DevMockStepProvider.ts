import { appStorage } from '../../shared/storage/app-storage';
import { STORAGE_KEYS } from '../../shared/storage/storage-keys';
import { getLocalDateString } from '../../utils/dates';
import type { StepProvider, StepReading } from './StepProvider';

function isDevMode(): boolean {
  return typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';
}

export class DevMockStepProvider implements StepProvider {
  async isAvailable(): Promise<boolean> {
    return isDevMode();
  }

  async requestPermission(): Promise<boolean> {
    return isDevMode();
  }

  async getTodaySteps(): Promise<StepReading | null> {
    if (!isDevMode()) return null;

    const key = `${STORAGE_KEYS.STEP_MOCK_SOURCE_PREFIX}${getLocalDateString()}`;
    const steps = appStorage.getNumber(key) ?? 0;
    if (steps <= 0) return null;

    return {
      steps,
      source: 'phone_pedometer',
      fetchedAt: new Date(),
    };
  }
}
