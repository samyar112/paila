import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { RootNavigator } from './src/navigation/RootNavigator';
import { getAppEnvironment } from './src/shared/config/app-env';
import { initializeFirebase, runStartupFirestoreRead } from './src/shared/firebase/firebase';
import { verifyAppStorage } from './src/shared/storage/app-storage';
import { placeholderTheme } from './src/shared/theme/placeholder-theme';

export default function App() {
  const [isStorageReady, setIsStorageReady] = useState<boolean | null>(null);
  const [isFirebaseReady, setIsFirebaseReady] = useState<boolean | null>(null);
  const [firestoreCheck, setFirestoreCheck] = useState<
    'pending' | 'ok' | 'error' | 'skipped'
  >('pending');
  const appEnv = getAppEnvironment();

  useEffect(() => {
    setIsStorageReady(verifyAppStorage());
    const firebaseOk = initializeFirebase();
    setIsFirebaseReady(firebaseOk);
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

  if (isStorageReady !== true || isFirebaseReady !== true) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={placeholderTheme.primary} size="large" />
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

  return (
    <>
      <RootNavigator firestoreCheck={firestoreCheck} />
      <StatusBar style="dark" />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: placeholderTheme.background,
    paddingHorizontal: 24,
  },
  loadingTitle: {
    marginTop: 16,
    fontSize: 28,
    fontWeight: '700',
    color: placeholderTheme.primary,
  },
  loadingSubtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: placeholderTheme.mutedText,
  },
  environmentBadge: {
    marginTop: 14,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: placeholderTheme.primary,
  },
});
