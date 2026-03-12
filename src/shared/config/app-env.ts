import Constants from 'expo-constants';

export type AppEnvironment = 'development' | 'production';

type ExpoExtra = {
  appEnv?: AppEnvironment;
  firebaseProjectId?: string;
  googleWebClientId?: string;
};

function getExpoExtra(): ExpoExtra {
  const manifestExtra = Constants.expoConfig?.extra as ExpoExtra | undefined;
  return manifestExtra ?? {};
}

export function getAppEnvironment(): AppEnvironment {
  return getExpoExtra().appEnv ?? 'development';
}

export function getFirebaseProjectId(): string {
  return getExpoExtra().firebaseProjectId ?? 'paila-dev';
}

export function getGoogleWebClientId(): string {
  return getExpoExtra().googleWebClientId ?? '';
}
