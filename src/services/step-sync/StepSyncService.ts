import { appStorage } from '../../shared/storage/app-storage';
import { STORAGE_KEYS } from '../../shared/storage/storage-keys';
import { getLocalDateString } from '../../utils/dates';
import { StepProviderFactory } from './StepProviderFactory';
import type { StepReading } from './StepProvider';

interface CachedStepData {
  count: number;
  source: StepReading['source'];
  lastReadAt: string;
}

function isDevMode(): boolean {
  return typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';
}

export class StepSyncService {
  static async claimForegroundSteps(): Promise<StepReading | null> {
    this.clearStaleCache();

    const providers = StepProviderFactory.create();

    for (const provider of providers) {
      try {
        const available = await provider.isAvailable();
        if (!available) continue;

        const reading = await provider.getTodaySteps();
        if (reading && reading.steps > 0) {
          this.writeToCache(reading);
          return reading;
        }
      } catch {
        continue;
      }
    }

    return null;
  }

  static async requestPermissions(): Promise<boolean> {
    const providers = StepProviderFactory.create();
    for (const provider of providers) {
      const available = await provider.isAvailable();
      if (!available) continue;
      const granted = await provider.requestPermission();
      if (granted) return true;
    }
    return false;
  }

  static getTodayStepsFromCache(): number {
    const localDate = getLocalDateString();
    const key = `${STORAGE_KEYS.STEP_CACHE_PREFIX}${localDate}`;
    const raw = appStorage.getString(key);
    if (!raw) return 0;
    try {
      const data = JSON.parse(raw) as CachedStepData;
      return data.count;
    } catch {
      return 0;
    }
  }

  static setDevMockSourceSteps(totalSourceSteps: number): void {
    if (!isDevMode()) return;
    const localDate = getLocalDateString();
    const key = `${STORAGE_KEYS.STEP_MOCK_SOURCE_PREFIX}${localDate}`;
    const sanitized = Math.max(0, Math.floor(totalSourceSteps));
    appStorage.set(key, sanitized);
  }

  static getDevMockSourceSteps(): number {
    if (!isDevMode()) return 0;
    const localDate = getLocalDateString();
    const key = `${STORAGE_KEYS.STEP_MOCK_SOURCE_PREFIX}${localDate}`;
    return appStorage.getNumber(key) ?? 0;
  }

  private static writeToCache(reading: StepReading): void {
    const localDate = getLocalDateString();
    const key = `${STORAGE_KEYS.STEP_CACHE_PREFIX}${localDate}`;
    const data: CachedStepData = {
      count: reading.steps,
      source: reading.source,
      lastReadAt: reading.fetchedAt.toISOString(),
    };
    appStorage.set(key, JSON.stringify(data));
  }

  private static clearStaleCache(): void {
    const today = getLocalDateString();
    const allKeys = appStorage.getAllKeys();
    for (const key of allKeys) {
      if (
        (key.startsWith(STORAGE_KEYS.STEP_CACHE_PREFIX)
          || key.startsWith(STORAGE_KEYS.STEP_MOCK_SOURCE_PREFIX))
        && !key.endsWith(today)
      ) {
        appStorage.remove(key);
      }
    }
  }
}
