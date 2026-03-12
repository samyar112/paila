import { Pressable, StyleSheet, Text, View } from 'react-native';

import { signOut } from '../services/auth/AuthService';
import { getAppEnvironment, getFirebaseProjectId } from '../shared/config/app-env';
import { placeholderTheme } from '../shared/theme/placeholder-theme';

export function ScaffoldShellScreen({
  firestoreCheck,
}: {
  firestoreCheck: 'pending' | 'ok' | 'error' | 'skipped';
}) {
  const appEnv = getAppEnvironment();
  const firebaseProjectId = getFirebaseProjectId();
  const firestoreLabel = (() => {
    switch (firestoreCheck) {
      case 'ok':
        return 'Firestore: OK';
      case 'error':
        return 'Firestore: ERROR';
      case 'skipped':
        return 'Firestore: SKIPPED';
      default:
        return 'Firestore: CHECKING';
    }
  })();
  const firestoreStyle =
    firestoreCheck === 'error'
      ? styles.firebaseError
      : firestoreCheck === 'ok'
        ? styles.firebaseOk
        : styles.firebasePending;

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Paila Scaffold</Text>
      <Text style={styles.subtitle}>
        Navigation, MMKV, and environment wiring are in place. Sprint 1 can
        build from this shell.
      </Text>
      <Text style={styles.environment}>
        {appEnv === 'production' ? 'Production' : 'Development'} ·{' '}
        {firebaseProjectId}
      </Text>
      <Text style={[styles.firebaseStatus, firestoreStyle]}>{firestoreLabel}</Text>
      <Pressable
        accessibilityRole="button"
        style={styles.signOutButton}
        onPress={() => void signOut()}
      >
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: placeholderTheme.background,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: placeholderTheme.primary,
  },
  subtitle: {
    marginTop: 12,
    maxWidth: 320,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    color: placeholderTheme.mutedText,
  },
  environment: {
    marginTop: 16,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
    color: placeholderTheme.primary,
    textTransform: 'uppercase',
  },
  firebaseStatus: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  firebaseOk: {
    color: '#1f7a4f',
  },
  firebaseError: {
    color: '#b42318',
  },
  firebasePending: {
    color: placeholderTheme.mutedText,
  },
  signOutButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: placeholderTheme.border,
  },
  signOutText: {
    fontSize: 13,
    fontWeight: '600',
    color: placeholderTheme.text,
  },
});
