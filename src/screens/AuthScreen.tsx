import { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { signInWithApple, signInWithGoogle } from '../services/auth/AuthService';
import { colors, radii } from '../shared/theme/placeholder-theme';

export function AuthScreen() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignIn = async (provider: 'apple' | 'google') => {
    try {
      setStatus('loading');
      setErrorMessage(null);
      if (provider === 'apple') {
        await signInWithApple();
      } else {
        await signInWithGoogle();
      }
      setStatus('idle');
    } catch (error) {
      setStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Sign-in failed.',
      );
    }
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Paila</Text>
      <Text style={styles.subtitle}>
        Sign in to start your journey.
      </Text>

      {Platform.OS === 'ios' && (
        <Pressable
          accessibilityRole="button"
          style={[styles.button, styles.appleButton]}
          onPress={() => handleSignIn('apple')}
          disabled={status === 'loading'}
        >
          <Text style={styles.buttonText}>Continue with Apple</Text>
        </Pressable>
      )}

      {Platform.OS === 'android' && (
        <Pressable
          accessibilityRole="button"
          style={[styles.button, styles.googleButton]}
          onPress={() => handleSignIn('google')}
          disabled={status === 'loading'}
        >
          <Text style={styles.buttonText}>Continue with Google</Text>
        </Pressable>
      )}

      {status === 'loading' && (
        <ActivityIndicator style={styles.spinner} color={colors.primary} />
      )}

      {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
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
    fontSize: 36,
    fontWeight: '700',
    color: colors.primary,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    color: colors.mutedText,
  },
  button: {
    marginTop: 20,
    width: '100%',
    maxWidth: 320,
    paddingVertical: 14,
    borderRadius: radii.sm,
    alignItems: 'center',
  },
  appleButton: {
    backgroundColor: '#000000',
  },
  googleButton: {
    backgroundColor: '#0f172a',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  spinner: {
    marginTop: 16,
  },
  error: {
    marginTop: 12,
    color: colors.error,
    textAlign: 'center',
  },
});
