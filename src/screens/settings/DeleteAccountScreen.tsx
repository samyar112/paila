import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import functions from '@react-native-firebase/functions';
import { colors } from '../../shared/theme/placeholder-theme';
import { PrimaryButton } from '../../components/shared/PrimaryButton';

interface DeleteAccountScreenProps {
  onDeleteComplete: () => void;
  onCancel: () => void;
}

export function DeleteAccountScreen({
  onDeleteComplete,
  onCancel,
}: DeleteAccountScreenProps): React.JSX.Element {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = confirmText.trim().toUpperCase() === 'DELETE';

  const handleDelete = async (): Promise<void> => {
    if (!canDelete) return;
    setIsDeleting(true);
    setError(null);

    try {
      // Server-side: delete all Firestore docs + Firebase Auth account
      await functions().httpsCallable('deleteUserAccount')({});

      // Client-side: clear all local state
      const { resetAllStores } = await import('../../stores/resetAllStores');
      const { clearAppStorage } = await import('../../shared/storage/app-storage');
      resetAllStores();
      clearAppStorage();

      onDeleteComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
      setIsDeleting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Delete Account</Text>

      <View style={styles.warningBox}>
        <Text style={styles.warningText}>
          This will permanently delete your account, journey progress, and all data.
          This cannot be undone.
        </Text>
      </View>

      <Text style={styles.instruction}>
        Type DELETE to confirm
      </Text>

      <TextInput
        style={styles.input}
        value={confirmText}
        onChangeText={setConfirmText}
        placeholder="Type DELETE"
        placeholderTextColor={colors.sage}
        autoCapitalize="characters"
        autoCorrect={false}
      />

      {error && <Text style={styles.errorText}>{error}</Text>}

      <PrimaryButton
        label="Delete My Account"
        onPress={() => void handleDelete()}
        variant="danger"
        disabled={!canDelete}
        loading={isDeleting}
        style={styles.deleteButton}
      />

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={onCancel}
        activeOpacity={0.8}
      >
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 24,
  },
  warningBox: {
    backgroundColor: colors.errorBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.error,
    marginBottom: 24,
  },
  warningText: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.error,
  },
  instruction: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  input: {
    borderWidth: 2,
    borderColor: colors.error,
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 4,
    marginBottom: 24,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  deleteButton: {
    marginBottom: 16,
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.mutedText,
  },
});
