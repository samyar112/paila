import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Platform, Linking } from 'react-native';
import { colors, radii, typography } from '../../shared/theme/placeholder-theme';
import { PrimaryButton } from '../../components/shared/PrimaryButton';
import { APP_STRINGS } from '../../shared/content/strings';
import { appStorage } from '../../shared/storage/app-storage';
import { STORAGE_KEYS } from '../../shared/storage/storage-keys';

type PermissionStep = 'health' | 'health_denied' | 'tracking' | 'done';

interface PermissionsScreenProps {
  onComplete: () => void;
}

async function requestHealthPermission(): Promise<boolean> {
  try {
    if (Platform.OS === 'ios') {
      const AppleHealthKit = require('react-native-health').default;
      return new Promise<boolean>((resolve) => {
        AppleHealthKit.initHealthKit(
          { permissions: { read: [AppleHealthKit.Constants.Permissions.StepCount], write: [] } },
          (err: string | undefined) => resolve(!err),
        );
      });
    }

    if (Platform.OS === 'android') {
      const { initialize, requestPermission } = require('react-native-health-connect');
      const available = await initialize();
      if (!available) return false;
      const granted = await requestPermission([{ accessType: 'read', recordType: 'Steps' }]);
      return granted.some(
        (p: { accessType: string; recordType: string }) =>
          p.recordType === 'Steps' && p.accessType === 'read',
      );
    }

    return false;
  } catch {
    return false;
  }
}

async function requestTrackingPermission(): Promise<void> {
  if (Platform.OS !== 'ios') return;
  try {
    const { requestTrackingPermissionsAsync } = require('expo-tracking-transparency');
    await requestTrackingPermissionsAsync();
  } catch {
    // ATT not available (simulator, older iOS) — non-fatal
  }
}

export function PermissionsScreen({ onComplete }: PermissionsScreenProps): React.JSX.Element {
  const [step, setStep] = useState<PermissionStep>('health');
  const [loading, setLoading] = useState(false);
  const S = APP_STRINGS.permissions;

  const handleHealthRequest = useCallback(async () => {
    setLoading(true);
    const granted = await requestHealthPermission();
    setLoading(false);

    appStorage.set(STORAGE_KEYS.HEALTH_PERMISSION_GRANTED, granted);

    if (granted) {
      setStep(Platform.OS === 'ios' ? 'tracking' : 'done');
    } else {
      setStep('health_denied');
    }
  }, []);

  const handleHealthRetry = useCallback(async () => {
    setLoading(true);
    const granted = await requestHealthPermission();
    setLoading(false);

    appStorage.set(STORAGE_KEYS.HEALTH_PERMISSION_GRANTED, granted);

    if (granted) {
      setStep(Platform.OS === 'ios' ? 'tracking' : 'done');
    }
    // If still denied, stay on health_denied screen
  }, []);

  const handleOpenSettings = useCallback(() => {
    void Linking.openSettings();
  }, []);

  const handleSkipHealth = useCallback(() => {
    appStorage.set(STORAGE_KEYS.HEALTH_PERMISSION_GRANTED, false);
    setStep(Platform.OS === 'ios' ? 'tracking' : 'done');
  }, []);

  const handleTrackingRequest = useCallback(async () => {
    setLoading(true);
    await requestTrackingPermission();
    appStorage.set(STORAGE_KEYS.ATT_PERMISSION_REQUESTED, true);
    setLoading(false);
    setStep('done');
  }, []);

  const handleDone = useCallback(() => {
    appStorage.set(STORAGE_KEYS.PERMISSIONS_COMPLETED, true);
    onComplete();
  }, [onComplete]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{S.title}</Text>

      {step === 'health' && (
        <View style={styles.card}>
          <Text style={styles.stepTitle}>{S.healthTitle}</Text>
          <Text style={styles.stepBody}>{S.healthBody}</Text>
          <PrimaryButton
            label={S.healthButton}
            onPress={() => void handleHealthRequest()}
            variant="accent"
            loading={loading}
            style={styles.button}
          />
        </View>
      )}

      {step === 'health_denied' && (
        <View style={styles.card}>
          <Text style={styles.stepTitle}>{S.healthDeniedTitle}</Text>
          <Text style={styles.stepBody}>{S.healthDeniedBody}</Text>
          <PrimaryButton
            label={S.healthRetry}
            onPress={() => void handleHealthRetry()}
            variant="accent"
            loading={loading}
            style={styles.button}
          />
          <PrimaryButton
            label={S.healthOpenSettings}
            onPress={handleOpenSettings}
            variant="outline"
            style={styles.button}
          />
          <PrimaryButton
            label={S.healthSkip}
            onPress={handleSkipHealth}
            variant="outline"
            style={styles.buttonSecondary}
          />
        </View>
      )}

      {step === 'tracking' && (
        <View style={styles.card}>
          <Text style={styles.stepTitle}>{S.trackingTitle}</Text>
          <Text style={styles.stepBody}>{S.trackingBody}</Text>
          <PrimaryButton
            label={S.trackingButton}
            onPress={() => void handleTrackingRequest()}
            variant="accent"
            loading={loading}
            style={styles.button}
          />
        </View>
      )}

      {step === 'done' && (
        <View style={styles.card}>
          <Text style={styles.stepTitle}>{S.allDone}</Text>
          <Text style={styles.stepBody}>{S.allDoneBody}</Text>
          <PrimaryButton
            label={S.startJourney}
            onPress={handleDone}
            variant="accent"
            style={styles.button}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  header: {
    ...typography.heading,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 32,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: 28,
  },
  stepTitle: {
    ...typography.heading,
    color: colors.text,
    marginBottom: 12,
  },
  stepBody: {
    ...typography.body,
    color: colors.mutedText,
    lineHeight: 24,
    marginBottom: 24,
  },
  button: {
    marginBottom: 12,
  },
  buttonSecondary: {
    marginTop: 4,
  },
});
