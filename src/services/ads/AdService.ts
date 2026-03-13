import { Platform } from 'react-native';
import mobileAds from 'react-native-google-mobile-ads';
import { appStorage } from '../../shared/storage/app-storage';
import { STORAGE_KEYS } from '../../shared/storage/storage-keys';
import { isNepalLocal } from '../../utils/nepal-access';
import { getAppEnvironment } from '../../shared/config/app-env';

export type AdPlacement = 'journey_home_banner';

// Google-provided test ad unit IDs — safe for development builds
const TEST_BANNER_ID_IOS = 'ca-app-pub-3940256099942544/2934735716';
const TEST_BANNER_ID_ANDROID = 'ca-app-pub-3940256099942544/6300978111';

/**
 * Screens / contexts where ads must NEVER appear.
 * Checked by shouldShowAds() and the AdBanner component.
 */
export type AdBlockedContext =
  | 'ceremony'
  | 'checkpoint_decision'
  | 'airplane_intro'
  | 'purchase';

export class AdService {
  private static initialized = false;

  /** Initialize the Google Mobile Ads SDK. Call once at app launch. */
  static async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await mobileAds().initialize();
    } catch {
      // AdMob may fail in simulator / dev builds — non-fatal
    }

    this.initialized = true;
  }

  /**
   * Returns the correct banner ad unit ID for the current platform.
   * Uses test IDs in development; real IDs from env vars in production.
   */
  static getBannerAdUnitId(): string {
    const isProduction = getAppEnvironment() === 'production';

    if (isProduction) {
      // Production ad unit IDs come from environment (EAS Secrets).
      // They are injected via app.config.ts → extra.admobBannerIos / admobBannerAndroid.
      // Fall back to test IDs if env vars are missing (safety net).
      const Constants = require('expo-constants') as typeof import('expo-constants');
      const extra = Constants.default.expoConfig?.extra as
        | { admobBannerIos?: string; admobBannerAndroid?: string }
        | undefined;

      if (Platform.OS === 'ios') {
        return extra?.admobBannerIos ?? TEST_BANNER_ID_IOS;
      }
      return extra?.admobBannerAndroid ?? TEST_BANNER_ID_ANDROID;
    }

    // Development — always use Google test ad units
    return Platform.OS === 'ios' ? TEST_BANNER_ID_IOS : TEST_BANNER_ID_ANDROID;
  }

  /**
   * Whether ads should be shown to the current user.
   * Ads never shown to: paid users, Nepal-local users, or in blocked contexts.
   */
  static shouldShowAds(
    accessTier: string,
    blockedContext?: AdBlockedContext,
  ): boolean {
    if (blockedContext) return false;
    if (isNepalLocal()) return false;
    return accessTier !== 'paid';
  }

  /** Whether the one-time ad consent notice has been shown. */
  static hasShownConsentNotice(): boolean {
    return appStorage.getBoolean(STORAGE_KEYS.AD_CONSENT_SHOWN) === true;
  }

  /** Mark the ad consent notice as shown (first ad impression). */
  static markConsentNoticeShown(): void {
    appStorage.set(STORAGE_KEYS.AD_CONSENT_SHOWN, true);
  }

  /** Whether the SDK has been initialized. */
  static getIsInitialized(): boolean {
    return this.initialized;
  }

  /** Reset internal state — test-only helper. */
  static _resetForTesting(): void {
    this.initialized = false;
  }
}
