import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import {
  getAuth,
  onAuthStateChanged,
  type FirebaseAuthTypes,
} from '@react-native-firebase/auth';

import { RootNavigator } from './src/navigation/RootNavigator';
import { AuthScreen } from './src/screens/AuthScreen';
import { NamasteScreen } from './src/screens/NamasteScreen';
import { configureGoogleSignIn } from './src/services/auth/AuthService';
import { ClientSeedService } from './src/services/seed/ClientSeedService';
import { getAppEnvironment } from './src/shared/config/app-env';
import { initializeFirebase, runStartupFirestoreRead } from './src/shared/firebase/firebase';
import { appStorage, verifyAppStorage } from './src/shared/storage/app-storage';
import { STORAGE_KEYS } from './src/shared/storage/storage-keys';
import { colors } from './src/shared/theme/placeholder-theme';

// DEV-ONLY: set to true to skip Firebase auth and use a mock user
// Set to true to skip Firebase auth and use mock user (dev only)
const DEV_BYPASS_AUTH = false;

export default function App() {
  const [isStorageReady, setIsStorageReady] = useState<boolean | null>(null);
  const [isFirebaseReady, setIsFirebaseReady] = useState<boolean | null>(null);
  const [firestoreCheck, setFirestoreCheck] = useState<
    'pending' | 'ok' | 'error' | 'skipped'
  >('pending');
  const [authReady, setAuthReady] = useState(DEV_BYPASS_AUTH);
  const [currentUser, setCurrentUser] = useState<FirebaseAuthTypes.User | null>(
    DEV_BYPASS_AUTH ? ({ uid: 'dev-user-local' } as FirebaseAuthTypes.User) : null,
  );
  const [seedReady, setSeedReady] = useState(DEV_BYPASS_AUTH);
  const [namasteShown, setNamasteShown] = useState(
    () => appStorage.getBoolean(STORAGE_KEYS.NAMASTE_SEEN) === true,
  );
  const appEnv = getAppEnvironment();

  useEffect(() => {
    setIsStorageReady(verifyAppStorage());

    if (DEV_BYPASS_AUTH) {
      setIsFirebaseReady(true);
      setFirestoreCheck('skipped');
      return;
    }

    const firebaseOk = initializeFirebase();
    setIsFirebaseReady(firebaseOk);
    configureGoogleSignIn();
    if (!firebaseOk) {
      setFirestoreCheck('error');
      return;
    }

    if (appEnv !== 'production') {
      void runStartupFirestoreRead().then((ok) => {
        setFirestoreCheck(ok ? 'ok' : 'error');
      });
    } else {
      setFirestoreCheck('skipped');
    }
  }, []);

  useEffect(() => {
    if (DEV_BYPASS_AUTH) return;

    const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
      setCurrentUser(user);
      setAuthReady(true);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!currentUser || DEV_BYPASS_AUTH) return;
    let mounted = true;
    (async () => {
      try {
        await ClientSeedService.ensureUserDoc({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
        });
        await ClientSeedService.seedRouteIfNeeded();
      } catch (e) {
        console.warn('[App] Seed/UserDoc error:', e);
      }
      if (mounted) setSeedReady(true);
    })();
    return () => { mounted = false; };
  }, [currentUser]);

  if (isStorageReady !== true || isFirebaseReady !== true || !authReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingTitle}>Paila</Text>
        <Text style={styles.loadingSubtitle}>
          {isStorageReady === false
            ? 'Local storage bootstrap failed.'
            : isFirebaseReady === false
              ? 'Firebase bootstrap failed.'
              : 'Preparing scaffold foundation.'}
        </Text>
        <Text style={styles.environmentBadge}>
          {appEnv === 'production' ? 'Production build' : 'Development build'}
        </Text>
        <StatusBar style="dark" />
      </View>
    );
  }

  if (!namasteShown) {
    return (
      <>
        <NamasteScreen
          onComplete={() => {
            appStorage.set(STORAGE_KEYS.NAMASTE_SEEN, true);
            setNamasteShown(true);
          }}
        />
        <StatusBar style="light" />
      </>
    );
  }

  if (!currentUser) {
    return <AuthScreen />;
  }

  if (!seedReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingTitle}>Paila</Text>
        <Text style={styles.loadingSubtitle}>Setting up your journey...</Text>
        <StatusBar style="dark" />
      </View>
    );
  }

  return (
    <>
      <RootNavigator firestoreCheck={firestoreCheck} userId={currentUser.uid} />
      <StatusBar style="dark" />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 24,
  },
  loadingTitle: {
    marginTop: 16,
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
  },
  loadingSubtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: colors.mutedText,
  },
  environmentBadge: {
    marginTop: 14,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: colors.primary,
  },
});
