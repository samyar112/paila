import type { ExpoConfig } from '@expo/config-types';

type AppEnvironment = 'development' | 'production';

const appEnv = (process.env.APP_ENV ?? 'development') as AppEnvironment;
const isProduction = appEnv === 'production';

const bundleIdentifier = isProduction
  ? 'com.tpservices.paila'
  : 'com.tpservices.paila.dev';
const firebaseProjectId = isProduction ? 'paila-prod' : 'paila-dev';

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
  ios: {
    supportsTablet: true,
    bundleIdentifier,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
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
    eas: {
      projectId: '51f03376-73aa-4f61-997e-63ba6c2363b2',
    },
  },
};

export default config;
