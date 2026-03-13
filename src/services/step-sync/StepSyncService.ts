import { appStorage } from '../../shared/storage/app-storage';
import { getLocalDateString } from '../../utils/dates';
import { StepProviderFactory } from './StepProviderFactory';
import type { StepReading } from './StepProvider';

const STEP_CACHE_PREFIX = 'steps:';

interface CachedStepData {
  count: number;
  source: StepReading['source'];
  lastReadAt: string;
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
    const key = `${STEP_CACHE_PREFIX}${localDate}`;
    const raw = appStorage.getString(key);
    if (!raw) return 0;
    try {
      const data = JSON.parse(raw) as CachedStepData;
      return data.count;
    } catch {
      return 0;
    }
  }

  private static writeToCache(reading: StepReading): void {
    const localDate = getLocalDateString();
    const key = `${STEP_CACHE_PREFIX}${localDate}`;
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
      if (key.startsWith(STEP_CACHE_PREFIX) && !key.endsWith(today)) {
        appStorage.remove(key);
      }
    }
  }
}
