import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import auth, { type FirebaseAuthTypes } from '@react-native-firebase/auth';

import { RootNavigator } from './src/navigation/RootNavigator';
import { AuthScreen } from './src/screens/AuthScreen';
import { configureGoogleSignIn } from './src/services/auth/AuthService';
import { getAppEnvironment } from './src/shared/config/app-env';
import { initializeFirebase, runStartupFirestoreRead } from './src/shared/firebase/firebase';
import { verifyAppStorage } from './src/shared/storage/app-storage';
import { colors } from './src/shared/theme/placeholder-theme';

// DEV-ONLY: set to true to skip Firebase auth and use a mock user
const DEV_BYPASS_AUTH = __DEV__;

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

    const unsubscribe = auth().onAuthStateChanged((user) => {
      setCurrentUser(user);
      setAuthReady(true);
    });

    return unsubscribe;
  }, []);

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

  if (!currentUser) {
    return <AuthScreen />;
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
