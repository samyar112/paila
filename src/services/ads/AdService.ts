import { appStorage } from '../../shared/storage/app-storage';
import { STORAGE_KEYS } from '../../shared/storage/storage-keys';
import { isNepalLocal } from '../../utils/nepal-access';

export type AdPlacement = 'journey_home_banner';

// Test ad unit IDs from Google -- safe for development
const TEST_BANNER_ID_IOS = 'ca-app-pub-3940256099942544/2934735716';
const TEST_BANNER_ID_ANDROID = 'ca-app-pub-3940256099942544/6300978111';

export class AdService {
  private static initialized = false;

  static async initialize(): Promise<void> {
    if (this.initialized) return;
    // TODO: uncomment when native module is linked
    // await mobileAds().initialize();
    this.initialized = true;
  }

  static getBannerAdUnitId(): string {
    // TODO: replace with real ad unit IDs from AdMob console for production
    const { Platform } = require('react-native');
    return Platform.OS === 'ios' ? TEST_BANNER_ID_IOS : TEST_BANNER_ID_ANDROID;
  }

  static shouldShowAds(accessTier: string): boolean {
    if (isNepalLocal()) return false;
    return accessTier !== 'paid';
  }

  static hasShownConsentNotice(): boolean {
    return appStorage.getBoolean(STORAGE_KEYS.AD_CONSENT_SHOWN) === true;
  }

  static markConsentNoticeShown(): void {
    appStorage.set(STORAGE_KEYS.AD_CONSENT_SHOWN, true);
  }

  static _resetForTesting(): void {
    this.initialized = false;
  }
}
