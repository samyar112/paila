import { Pressable, StyleSheet, Text, View } from 'react-native';

import { signOut } from '../services/auth/AuthService';
import { getAppEnvironment, getFirebaseProjectId } from '../shared/config/app-env';
import { colors, radii } from '../shared/theme/placeholder-theme';
import { useJourneyStore } from '../stores/useJourneyStore';
import { makeDemoJourney, DEMO_ROUTE, DEMO_MILESTONES, DEMO_JOURNEY_ID } from '../shared/dev/demo-journey';

export function ScaffoldShellScreen({
  firestoreCheck,
  userId,
}: {
  firestoreCheck: 'pending' | 'ok' | 'error' | 'skipped';
  userId: string;
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

  const loadDemoJourney = (): void => {
    useJourneyStore.setState({
      journey: makeDemoJourney(userId),
      journeyId: DEMO_JOURNEY_ID,
      route: DEMO_ROUTE,
      milestones: DEMO_MILESTONES,
      isLoading: false,
      error: null,
    });
  };

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

      {__DEV__ && (
        <Pressable
          accessibilityRole="button"
          style={styles.demoButton}
          onPress={loadDemoJourney}
        >
          <Text style={styles.demoButtonText}>Start Demo Journey</Text>
        </Pressable>
      )}

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
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.primary,
  },
  subtitle: {
    marginTop: 12,
    maxWidth: 320,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    color: colors.mutedText,
  },
  environment: {
    marginTop: 16,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
    color: colors.primary,
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
    color: colors.accentDeep,
  },
  firebaseError: {
    color: colors.error,
  },
  firebasePending: {
    color: colors.mutedText,
  },
  demoButton: {
    marginTop: 24,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
  },
  demoButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.background,
  },
  signOutButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  signOutText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
});
