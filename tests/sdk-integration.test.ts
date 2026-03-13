/**
 * SDK Integration Tests
 *
 * Verifies all native SDK integrations work correctly through their
 * service abstractions. Tests use mocked native modules.
 *
 * SDKs covered:
 * - HealthKit (iOS step source)
 * - Health Connect (Android step source)
 * - AdMob (ad service + banner)
 * - RevenueCat (entitlement + purchase)
 */

import { Platform } from 'react-native';
import AppleHealthKit from 'react-native-health';
import * as HealthConnect from 'react-native-health-connect';
import Purchases from 'react-native-purchases';
import { AdService } from '../src/services/ads/AdService';
import { EntitlementService } from '../src/services/entitlement/EntitlementService';
import { HealthKitProvider } from '../src/services/step-sync/providers/HealthKitProvider';
import { HealthConnectProvider } from '../src/services/step-sync/providers/HealthConnectProvider';
import { StepProviderFactory } from '../src/services/step-sync/StepProviderFactory';

// ─────────────────────────────────────────────
// HealthKit Provider
// ─────────────────────────────────────────────

describe('HealthKitProvider', () => {
  let provider: HealthKitProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    provider = new HealthKitProvider();
  });

  it('returns false on non-iOS platforms', async () => {
    (Platform as any).OS = 'android';
    const result = await provider.isAvailable();
    expect(result).toBe(false);
  });

  it('checks HealthKit availability on iOS', async () => {
    (Platform as any).OS = 'ios';
    (AppleHealthKit.isAvailable as jest.Mock).mockImplementation(
      (cb: (err: string | undefined, available: boolean) => void) => cb(undefined, true),
    );
    const result = await provider.isAvailable();
    expect(result).toBe(true);
  });

  it('returns false when HealthKit is not available', async () => {
    (Platform as any).OS = 'ios';
    (AppleHealthKit.isAvailable as jest.Mock).mockImplementation(
      (cb: (err: string | undefined, available: boolean) => void) => cb('Not available', false),
    );
    const result = await provider.isAvailable();
    expect(result).toBe(false);
  });

  it('requests permission via initHealthKit', async () => {
    (Platform as any).OS = 'ios';
    (AppleHealthKit.isAvailable as jest.Mock).mockImplementation(
      (cb: (err: string | undefined, available: boolean) => void) => cb(undefined, true),
    );
    (AppleHealthKit.initHealthKit as jest.Mock).mockImplementation(
      (_perms: unknown, cb: (err: string) => void) => cb(''),
    );
    const granted = await provider.requestPermission();
    expect(granted).toBe(true);
  });

  it('returns false when permission denied', async () => {
    (Platform as any).OS = 'ios';
    (AppleHealthKit.isAvailable as jest.Mock).mockImplementation(
      (cb: (err: string | undefined, available: boolean) => void) => cb(undefined, true),
    );
    (AppleHealthKit.initHealthKit as jest.Mock).mockImplementation(
      (_perms: unknown, cb: (err: string) => void) => cb('Permission denied'),
    );
    const granted = await provider.requestPermission();
    expect(granted).toBe(false);
  });

  it('reads today step count', async () => {
    (Platform as any).OS = 'ios';
    (AppleHealthKit.isAvailable as jest.Mock).mockImplementation(
      (cb: (err: string | undefined, available: boolean) => void) => cb(undefined, true),
    );
    (AppleHealthKit.initHealthKit as jest.Mock).mockImplementation(
      (_perms: unknown, cb: (err: string) => void) => cb(''),
    );
    (AppleHealthKit.getStepCount as jest.Mock).mockImplementation(
      (_opts: unknown, cb: (err: string | undefined, results: { value: number }) => void) =>
        cb(undefined, { value: 8432 }),
    );

    const reading = await provider.getTodaySteps();
    expect(reading).not.toBeNull();
    expect(reading!.steps).toBe(8432);
    expect(reading!.source).toBe('healthkit');
  });

  it('returns null when step read fails', async () => {
    (Platform as any).OS = 'ios';
    (AppleHealthKit.isAvailable as jest.Mock).mockImplementation(
      (cb: (err: string | undefined, available: boolean) => void) => cb(undefined, true),
    );
    (AppleHealthKit.initHealthKit as jest.Mock).mockImplementation(
      (_perms: unknown, cb: (err: string) => void) => cb(''),
    );
    (AppleHealthKit.getStepCount as jest.Mock).mockImplementation(
      (_opts: unknown, cb: (err: string | undefined, results: { value: number }) => void) =>
        cb('Read error', { value: 0 }),
    );

    const reading = await provider.getTodaySteps();
    expect(reading).toBeNull();
  });
});

// ─────────────────────────────────────────────
// Health Connect Provider
// ─────────────────────────────────────────────

describe('HealthConnectProvider', () => {
  let provider: HealthConnectProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    provider = new HealthConnectProvider();
  });

  it('returns false on non-Android platforms', async () => {
    (Platform as any).OS = 'ios';
    const result = await provider.isAvailable();
    expect(result).toBe(false);
  });

  it('checks Health Connect availability on Android', async () => {
    (Platform as any).OS = 'android';
    (HealthConnect.initialize as jest.Mock).mockResolvedValue(true);
    const result = await provider.isAvailable();
    expect(result).toBe(true);
  });

  it('returns false when Health Connect unavailable', async () => {
    (Platform as any).OS = 'android';
    (HealthConnect.initialize as jest.Mock).mockResolvedValue(false);
    const result = await provider.isAvailable();
    expect(result).toBe(false);
  });

  it('requests step read permission', async () => {
    (Platform as any).OS = 'android';
    (HealthConnect.initialize as jest.Mock).mockResolvedValue(true);
    (HealthConnect.requestPermission as jest.Mock).mockResolvedValue([
      { accessType: 'read', recordType: 'Steps' },
    ]);
    const granted = await provider.requestPermission();
    expect(granted).toBe(true);
  });

  it('returns false when permission denied', async () => {
    (Platform as any).OS = 'android';
    (HealthConnect.initialize as jest.Mock).mockResolvedValue(true);
    (HealthConnect.requestPermission as jest.Mock).mockResolvedValue([]);
    const granted = await provider.requestPermission();
    expect(granted).toBe(false);
  });

  it('reads today step count by summing records', async () => {
    (Platform as any).OS = 'android';
    (HealthConnect.initialize as jest.Mock).mockResolvedValue(true);
    (HealthConnect.requestPermission as jest.Mock).mockResolvedValue([
      { accessType: 'read', recordType: 'Steps' },
    ]);
    (HealthConnect.readRecords as jest.Mock).mockResolvedValue({
      records: [{ count: 3000 }, { count: 2500 }, { count: 1200 }],
    });

    const reading = await provider.getTodaySteps();
    expect(reading).not.toBeNull();
    expect(reading!.steps).toBe(6700);
    expect(reading!.source).toBe('health_connect');
  });

  it('returns null when read fails', async () => {
    (Platform as any).OS = 'android';
    (HealthConnect.initialize as jest.Mock).mockResolvedValue(true);
    (HealthConnect.requestPermission as jest.Mock).mockResolvedValue([
      { accessType: 'read', recordType: 'Steps' },
    ]);
    (HealthConnect.readRecords as jest.Mock).mockRejectedValue(new Error('Read failed'));

    const reading = await provider.getTodaySteps();
    expect(reading).toBeNull();
  });
});

// ─────────────────────────────────────────────
// StepProviderFactory
// ─────────────────────────────────────────────

describe('StepProviderFactory', () => {
  it('returns HealthKit + Pedometer on iOS', () => {
    (Platform as any).OS = 'ios';
    const providers = StepProviderFactory.create();
    expect(providers).toHaveLength(2);
    expect(providers[0]).toBeInstanceOf(HealthKitProvider);
  });

  it('returns HealthConnect + Pedometer on Android', () => {
    (Platform as any).OS = 'android';
    const providers = StepProviderFactory.create();
    expect(providers).toHaveLength(2);
    expect(providers[0]).toBeInstanceOf(HealthConnectProvider);
  });
});

// ─────────────────────────────────────────────
// AdMob / AdService
// ─────────────────────────────────────────────

describe('AdService', () => {
  beforeEach(() => {
    AdService._resetForTesting();
  });

  it('initializes the mobile ads SDK', async () => {
    await AdService.initialize();
    expect(AdService.getIsInitialized()).toBe(true);
  });

  it('does not re-initialize after first call', async () => {
    await AdService.initialize();
    await AdService.initialize();
    expect(AdService.getIsInitialized()).toBe(true);
  });

  it('returns test banner ID in development', () => {
    const unitId = AdService.getBannerAdUnitId();
    expect(unitId).toMatch(/^ca-app-pub-3940256099942544/);
  });

  it('shows ads for free tier users', () => {
    expect(AdService.shouldShowAds('standard_free')).toBe(true);
  });

  it('hides ads for paid users', () => {
    expect(AdService.shouldShowAds('paid')).toBe(false);
  });

  it('hides ads in blocked contexts', () => {
    expect(AdService.shouldShowAds('standard_free', 'ceremony')).toBe(false);
    expect(AdService.shouldShowAds('standard_free', 'checkpoint_decision')).toBe(false);
    expect(AdService.shouldShowAds('standard_free', 'airplane_intro')).toBe(false);
    expect(AdService.shouldShowAds('standard_free', 'purchase')).toBe(false);
  });

  it('tracks consent notice state', () => {
    expect(AdService.hasShownConsentNotice()).toBe(false);
    AdService.markConsentNoticeShown();
    expect(AdService.hasShownConsentNotice()).toBe(true);
  });
});

// ─────────────────────────────────────────────
// RevenueCat / EntitlementService
// ─────────────────────────────────────────────

describe('EntitlementService', () => {
  beforeEach(() => {
    EntitlementService._resetForTesting();
    jest.clearAllMocks();
  });

  it('configures RevenueCat with API key and user ID', async () => {
    await EntitlementService.configure('test_api_key', 'user_123');
    expect(Purchases.configure).toHaveBeenCalledWith({ apiKey: 'test_api_key' });
    expect(Purchases.logIn).toHaveBeenCalledWith('user_123');
    expect(EntitlementService.getIsConfigured()).toBe(true);
  });

  it('does not re-configure after first call', async () => {
    await EntitlementService.configure('key1', 'user_1');
    await EntitlementService.configure('key2', 'user_2');
    expect(Purchases.configure).toHaveBeenCalledTimes(1);
  });

  it('returns unknown entitlement when not configured', async () => {
    const result = await EntitlementService.checkEntitlement('everest-summit');
    expect(result.status).toBe('unknown');
  });

  it('checks entitlement status after configure', async () => {
    await EntitlementService.configure('key', 'user');
    const result = await EntitlementService.checkEntitlement('everest-summit');
    expect(result.status).toBe('inactive');
  });

  it('fetches current offering with price', async () => {
    await EntitlementService.configure('key', 'user');
    const offering = await EntitlementService.getCurrentOffering();
    expect(offering.priceLabel).toBe('$4.99');
    expect(offering.packageToPurchase).not.toBeNull();
  });

  it('returns empty offering when not configured', async () => {
    const offering = await EntitlementService.getCurrentOffering();
    expect(offering.priceLabel).toBe('');
    expect(offering.packageToPurchase).toBeNull();
  });

  it('completes purchase flow and returns active entitlement', async () => {
    await EntitlementService.configure('key', 'user');
    const result = await EntitlementService.purchase('com.paila.everest');
    expect(result.ok).toBe(true);
    expect(result.entitlement?.status).toBe('active');
    expect(result.entitlement?.productId).toBe('com.paila.everest');
    expect(Purchases.purchasePackage).toHaveBeenCalled();
  });

  it('returns error when purchase fails', async () => {
    await EntitlementService.configure('key', 'user');
    (Purchases.purchasePackage as jest.Mock).mockRejectedValueOnce(new Error('User cancelled'));
    const result = await EntitlementService.purchase('com.paila.everest');
    expect(result.ok).toBe(false);
    expect(result.error).toBe('User cancelled');
  });

  it('restores purchases', async () => {
    await EntitlementService.configure('key', 'user');
    const result = await EntitlementService.restorePurchases();
    expect(result.ok).toBe(true);
    expect(Purchases.restorePurchases).toHaveBeenCalled();
  });

  it('logs out and resets configured state', async () => {
    await EntitlementService.configure('key', 'user');
    expect(EntitlementService.getIsConfigured()).toBe(true);
    await EntitlementService.logOut();
    expect(EntitlementService.getIsConfigured()).toBe(false);
    expect(Purchases.logOut).toHaveBeenCalled();
  });
});
