import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type ViewStyle,
} from 'react-native';
import { colors, radii } from '../../shared/theme/placeholder-theme';

type ButtonVariant = 'primary' | 'accent' | 'outline' | 'danger' | 'inverse';

interface PrimaryButtonProps {
  label: string;
  subtitle?: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

const BG: Record<ButtonVariant, string> = {
  primary: colors.primary,
  accent: colors.accentDeep,
  outline: colors.card,
  danger: colors.error,
  inverse: colors.background,
};

const TEXT_COLOR: Record<ButtonVariant, string> = {
  primary: colors.background,
  accent: colors.background,
  outline: colors.text,
  danger: colors.background,
  inverse: colors.text,
};

export function PrimaryButton({
  label,
  subtitle,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: PrimaryButtonProps): React.JSX.Element {
  const isOutline = variant === 'outline';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: BG[variant] },
        isOutline && styles.outline,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={TEXT_COLOR[variant]} />
      ) : (
        <>
          <Text style={[styles.label, { color: TEXT_COLOR[variant] }]}>
            {label}
          </Text>
          {subtitle && (
            <Text
              style={[
                styles.subtitle,
                { color: isOutline ? colors.mutedText : colors.sage },
              ]}
            >
              {subtitle}
            </Text>
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radii.button,
    padding: 18,
    alignItems: 'center',
  },
  outline: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },
});
