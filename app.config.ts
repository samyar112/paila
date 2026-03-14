import type { ExpoConfig } from '@expo/config-types';

type AppEnvironment = 'development' | 'production';

const appEnv = (process.env.APP_ENV ?? 'development') as AppEnvironment;
const isProduction = appEnv === 'production';

const bundleIdentifier = isProduction
  ? 'com.tpservices.paila'
  : 'com.tpservices.paila.dev';
const firebaseProjectId = isProduction ? 'paila-prod' : 'paila-dev';
const googleWebClientId = process.env.GOOGLE_WEB_CLIENT_ID
  ?? (isProduction ? '' : '271900438947-ed7gseapeki6tfp1t9aj5cff5eqjlsjs.apps.googleusercontent.com');

// ─────────────────────────────────────────────
// RevenueCat — API keys from EAS Secrets, NEVER hardcoded
// ─────────────────────────────────────────────
const revenueCatApiKeyIos = process.env.REVENUECAT_API_KEY_IOS ?? '';
const revenueCatApiKeyAndroid = process.env.REVENUECAT_API_KEY_ANDROID ?? '';

// ─────────────────────────────────────────────
// AdMob — App IDs and banner unit IDs
// Test IDs for dev, real IDs from EAS Secrets for prod
// ─────────────────────────────────────────────
const admobAppIdIos = isProduction
  ? (process.env.ADMOB_APP_ID_IOS ?? 'ca-app-pub-3940256099942544~1458002511')
  : 'ca-app-pub-3940256099942544~1458002511';
const admobAppIdAndroid = isProduction
  ? (process.env.ADMOB_APP_ID_ANDROID ?? 'ca-app-pub-3940256099942544~3347511713')
  : 'ca-app-pub-3940256099942544~3347511713';
const admobBannerIos = process.env.ADMOB_BANNER_ID_IOS ?? '';
const admobBannerAndroid = process.env.ADMOB_BANNER_ID_ANDROID ?? '';

const config: ExpoConfig = {
  name: 'Paila',
  slug: 'paila',
  version: '1.0.0',
  scheme: isProduction ? 'paila' : 'paila-dev',
  jsEngine: 'hermes',
  newArchEnabled: true,
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  plugins: [
    // react-native-google-mobile-ads requires app IDs in native config
    [
      'react-native-google-mobile-ads',
      {
        androidAppId: admobAppIdAndroid,
        iosAppId: admobAppIdIos,
      },
    ],
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier,
    googleServicesFile: isProduction
      ? './ios/Paila/prod/GoogleService-Info.plist'
      : './ios/Paila/dev/GoogleService-Info.plist',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSFaceIDUsageDescription:
        'Use Face ID to securely authenticate your Paila account.',
      NSHealthShareUsageDescription:
        'Paila reads your daily step count to advance your journey along the trail.',
      NSMotionUsageDescription:
        'Paila uses motion data to count your steps when Health data is not available.',
      NSUserTrackingUsageDescription:
        'Paila uses this to show relevant ads. Your health data is never used for advertising.',
    },
    entitlements: {
      'com.apple.developer.applesignin': ['Default'],
      'com.apple.developer.healthkit': true,
      'com.apple.developer.healthkit.access': ['health-records'],
      'com.apple.developer.healthkit.background-delivery': false,
    },
  },
  android: {
    package: bundleIdentifier,
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
    permissions: [
      // Health Connect permissions for step reading
      'android.permission.health.READ_STEPS',
      'android.permission.ACTIVITY_RECOGNITION',
      // AdMob
      'com.google.android.gms.permission.AD_ID',
    ],
  },
  web: {
    favicon: './assets/favicon.png',
  },
  extra: {
    appEnv,
    firebaseProjectId,
    googleWebClientId,
    // RevenueCat API keys — read at runtime by EntitlementService
    revenueCatApiKeyIos,
    revenueCatApiKeyAndroid,
    // AdMob banner unit IDs — read at runtime by AdService (production only)
    admobBannerIos,
    admobBannerAndroid,
    eas: {
      projectId: '51f03376-73aa-4f61-997e-63ba6c2363b2',
    },
  },
};

export default config;
