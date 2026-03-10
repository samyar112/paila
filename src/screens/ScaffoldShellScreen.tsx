import { StyleSheet, Text, View } from 'react-native';

import { getAppEnvironment, getFirebaseProjectId } from '../shared/config/app-env';
import { placeholderTheme } from '../shared/theme/placeholder-theme';

export function ScaffoldShellScreen() {
  const appEnv = getAppEnvironment();
  const firebaseProjectId = getFirebaseProjectId();

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
});

