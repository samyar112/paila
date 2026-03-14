import type { ExpoConfig } from '@expo/config-types';

type AppEnvironment = 'development' | 'production';

const appEnv = (process.env.APP_ENV ?? 'development') as AppEnvironment;
const isProduction = appEnv === 'production';

const bundleIdentifier = isProduction
  ? 'com.tpservices.paila'
  : 'com.tpservices.paila.dev';
const firebaseProjectId = isProduction ? 'paila-prod' : 'paila-dev';
const googleWebClientId = process.env.GOOGLE_WEB_CLIENT_ID
  ?? (isProduction
    ? '' // Production web client ID set via EAS Secrets
    : '271900438947-ed7gseapeki6tfp1t9aj5cff5eqjlsjs.apps.googleusercontent.com');

const config: ExpoConfig = {
  name: 'Paila',
  slug: 'paila',
  version: '1.0.0',
  scheme: isProduction ? 'paila' : 'paila-dev',
  jsEngine: 'hermes',
  newArchEnabled: true,
  plugins: [
    [
      'expo-build-properties',
      {
        ios: {
          useFrameworks: 'static',
          forceStaticLinking: [
            'RNFBApp',
            'RNFBAuth',
            'RNFBFirestore',
            'RNFBFunctions',
            'RNFBCrashlytics',
            'RNFBAppCheck',
          ],
        },
      },
    ],
    '@react-native-firebase/app',
    '@react-native-firebase/crashlytics',
    [
      'react-native-google-mobile-ads',
      {
        iosAppId: 'ca-app-pub-3940256099942544~1458002511',
        androidAppId: 'ca-app-pub-3940256099942544~3347511713',
      },
    ],
  ],
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier,
    googleServicesFile: isProduction
      ? './prod/GoogleService-Info.plist'
      : './dev/GoogleService-Info.plist',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSFaceIDUsageDescription: 'Use Face ID to securely authenticate your Paila account.',
      NSUserTrackingUsageDescription: 'Paila uses tracking permission to request relevant ads and support the free experience.',
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
  },
  web: {
    favicon: './assets/favicon.png',
  },
  extra: {
    appEnv,
    firebaseProjectId,
    googleWebClientId,
    eas: {
      projectId: '51f03376-73aa-4f61-997e-63ba6c2363b2',
    },
  },
};

export default config;
