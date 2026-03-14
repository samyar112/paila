import { StepSyncService } from '../src/services/step-sync/StepSyncService';
import { StepProviderFactory } from '../src/services/step-sync/StepProviderFactory';
import { appStorage } from '../src/shared/storage/app-storage';
import type { StepProvider, StepReading } from '../src/services/step-sync/StepProvider';
import { getLocalDateString } from '../src/utils/dates';

function makeProvider(overrides: Partial<StepProvider> = {}): StepProvider {
  return {
    isAvailable: jest.fn().mockResolvedValue(true),
    requestPermission: jest.fn().mockResolvedValue(true),
    getTodaySteps: jest.fn().mockResolvedValue({
      steps: 5000,
      source: 'healthkit' as const,
      fetchedAt: new Date(),
    }),
    ...overrides,
  };
}

jest.spyOn(StepProviderFactory, 'create');

beforeEach(() => {
  appStorage.clearAll();
  jest.restoreAllMocks();
});

describe('StepSyncService', () => {
  describe('claimForegroundSteps', () => {
    it('returns a reading from the first available provider', async () => {
      const provider = makeProvider();
      jest.spyOn(StepProviderFactory, 'create').mockReturnValue([provider]);

      const result = await StepSyncService.claimForegroundSteps();

      expect(result).not.toBeNull();
      expect(result!.steps).toBe(5000);
      expect(result!.source).toBe('healthkit');
    });

    it('skips unavailable providers and uses the next one', async () => {
      const unavailable = makeProvider({
        isAvailable: jest.fn().mockResolvedValue(false),
      });
      const available = makeProvider({
        getTodaySteps: jest.fn().mockResolvedValue({
          steps: 3000,
          source: 'phone_pedometer' as const,
          fetchedAt: new Date(),
        }),
      });
      jest.spyOn(StepProviderFactory, 'create').mockReturnValue([unavailable, available]);

      const result = await StepSyncService.claimForegroundSteps();

      expect(result!.steps).toBe(3000);
      expect(result!.source).toBe('phone_pedometer');
      expect(unavailable.getTodaySteps).not.toHaveBeenCalled();
    });

    it('returns null when no providers are available', async () => {
      const unavailable = makeProvider({
        isAvailable: jest.fn().mockResolvedValue(false),
      });
      jest.spyOn(StepProviderFactory, 'create').mockReturnValue([unavailable]);

      const result = await StepSyncService.claimForegroundSteps();
      expect(result).toBeNull();
    });

    it('returns null when provider returns zero steps', async () => {
      const provider = makeProvider({
        getTodaySteps: jest.fn().mockResolvedValue({
          steps: 0,
          source: 'healthkit' as const,
          fetchedAt: new Date(),
        }),
      });
      jest.spyOn(StepProviderFactory, 'create').mockReturnValue([provider]);

      const result = await StepSyncService.claimForegroundSteps();
      expect(result).toBeNull();
    });

    it('returns null when provider returns null', async () => {
      const provider = makeProvider({
        getTodaySteps: jest.fn().mockResolvedValue(null),
      });
      jest.spyOn(StepProviderFactory, 'create').mockReturnValue([provider]);

      const result = await StepSyncService.claimForegroundSteps();
      expect(result).toBeNull();
    });

    it('catches provider errors and continues to next provider', async () => {
      const failing = makeProvider({
        getTodaySteps: jest.fn().mockRejectedValue(new Error('HealthKit crashed')),
      });
      const fallback = makeProvider({
        getTodaySteps: jest.fn().mockResolvedValue({
          steps: 2000,
          source: 'phone_pedometer' as const,
          fetchedAt: new Date(),
        }),
      });
      jest.spyOn(StepProviderFactory, 'create').mockReturnValue([failing, fallback]);

      const result = await StepSyncService.claimForegroundSteps();
      expect(result!.steps).toBe(2000);
    });

    it('caches the result after a successful read', async () => {
      const provider = makeProvider();
      jest.spyOn(StepProviderFactory, 'create').mockReturnValue([provider]);

      await StepSyncService.claimForegroundSteps();
      const cached = StepSyncService.getTodayStepsFromCache();
      expect(cached).toBe(5000);
    });
  });

  describe('getTodayStepsFromCache', () => {
    it('returns 0 when cache is empty', () => {
      expect(StepSyncService.getTodayStepsFromCache()).toBe(0);
    });

    it('returns cached count for today', async () => {
      const provider = makeProvider({
        getTodaySteps: jest.fn().mockResolvedValue({
          steps: 7500,
          source: 'healthkit' as const,
          fetchedAt: new Date(),
        }),
      });
      jest.spyOn(StepProviderFactory, 'create').mockReturnValue([provider]);

      await StepSyncService.claimForegroundSteps();
      expect(StepSyncService.getTodayStepsFromCache()).toBe(7500);
    });

    it('returns 0 for corrupted cache data', () => {
      const today = getLocalDateString();
      appStorage.set(`steps:${today}`, 'not-json{{{');
      expect(StepSyncService.getTodayStepsFromCache()).toBe(0);
    });

    it('supports dev mock source step storage', () => {
      StepSyncService.setDevMockSourceSteps(4321);
      expect(StepSyncService.getDevMockSourceSteps()).toBe(4321);
    });
  });

  describe('requestPermissions', () => {
    it('returns true if first provider grants permission', async () => {
      const provider = makeProvider();
      jest.spyOn(StepProviderFactory, 'create').mockReturnValue([provider]);

      const result = await StepSyncService.requestPermissions();
      expect(result).toBe(true);
    });

    it('returns false when no providers are available', async () => {
      const unavailable = makeProvider({
        isAvailable: jest.fn().mockResolvedValue(false),
      });
      jest.spyOn(StepProviderFactory, 'create').mockReturnValue([unavailable]);

      const result = await StepSyncService.requestPermissions();
      expect(result).toBe(false);
    });

    it('falls back to next provider when first denies permission', async () => {
      const denied = makeProvider({
        requestPermission: jest.fn().mockResolvedValue(false),
      });
      const granted = makeProvider({
        requestPermission: jest.fn().mockResolvedValue(true),
      });
      jest.spyOn(StepProviderFactory, 'create').mockReturnValue([denied, granted]);

      const result = await StepSyncService.requestPermissions();
      expect(result).toBe(true);
    });
  });

  describe('stale cache cleanup', () => {
    it('clears cache entries from previous days on claimForegroundSteps', async () => {
      const yesterday = 'steps:2025-01-01';
      appStorage.set(yesterday, JSON.stringify({ count: 100, source: 'healthkit', lastReadAt: '' }));

      const provider = makeProvider();
      jest.spyOn(StepProviderFactory, 'create').mockReturnValue([provider]);

      await StepSyncService.claimForegroundSteps();

      expect(appStorage.getString(yesterday)).toBeUndefined();
    });

    it('preserves today cache entry during cleanup', async () => {
      const today = getLocalDateString();
      const todayKey = `steps:${today}`;
      appStorage.set(todayKey, JSON.stringify({ count: 100, source: 'healthkit', lastReadAt: '' }));

      const provider = makeProvider();
      jest.spyOn(StepProviderFactory, 'create').mockReturnValue([provider]);

      await StepSyncService.claimForegroundSteps();

      // Today's key gets overwritten by the new reading, not deleted
      expect(appStorage.getString(todayKey)).toBeDefined();
    });

    it('clears stale mock source step entries from previous days', async () => {
      appStorage.set('steps_mock:2025-01-01', 1000);

      const provider = makeProvider();
      jest.spyOn(StepProviderFactory, 'create').mockReturnValue([provider]);

      await StepSyncService.claimForegroundSteps();

      expect(appStorage.getNumber('steps_mock:2025-01-01')).toBeUndefined();
    });
  });
});
