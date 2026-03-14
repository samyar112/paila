import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { signOut } from '../services/auth/AuthService';
import { getAppEnvironment, getFirebaseProjectId } from '../shared/config/app-env';
import { colors, radii } from '../shared/theme/placeholder-theme';
import { useJourneyStore } from '../stores/useJourneyStore';
import { makeDemoJourney, DEMO_ROUTE, DEMO_MILESTONES, DEMO_JOURNEY_ID, EVEREST_ROUTE_ID } from '../shared/dev/demo-journey';

export function ScaffoldShellScreen({
  firestoreCheck,
  userId,
}: {
  firestoreCheck: 'pending' | 'ok' | 'error' | 'skipped';
  userId: string;
}) {
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
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

  const startRealJourney = async (): Promise<void> => {
    setStarting(true);
    setStartError(null);
    try {
      const store = useJourneyStore.getState();
      await store.startJourney(userId, EVEREST_ROUTE_ID, 1);

      const state = useJourneyStore.getState();
      if (!state.journey) {
        setStartError(state.error ?? 'Failed to start journey');
      }
    } catch (e) {
      setStartError(e instanceof Error ? e.message : 'Failed to start journey');
    } finally {
      setStarting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Paila</Text>
      <Text style={styles.subtitle}>
        Your journey awaits. Choose how to begin.
      </Text>
      <Text style={styles.environment}>
        {appEnv === 'production' ? 'Production' : 'Development'} ·{' '}
        {firebaseProjectId}
      </Text>
      <Text style={[styles.firebaseStatus, firestoreStyle]}>{firestoreLabel}</Text>

      <Pressable
        accessibilityRole="button"
        style={styles.demoButton}
        onPress={startRealJourney}
        disabled={starting}
      >
        {starting ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text style={styles.demoButtonText}>Begin Everest Journey</Text>
        )}
      </Pressable>

      {startError && <Text style={styles.error}>{startError}</Text>}

      {__DEV__ && (
        <Pressable
          accessibilityRole="button"
          style={styles.secondaryButton}
          onPress={loadDemoJourney}
        >
          <Text style={styles.secondaryButtonText}>Load Demo (offline)</Text>
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
  error: {
    marginTop: 12,
    color: colors.error,
    textAlign: 'center',
    fontSize: 13,
  },
  secondaryButton: {
    marginTop: 12,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
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
