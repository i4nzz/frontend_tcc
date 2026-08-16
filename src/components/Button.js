import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

const VARIANT_STYLES = {
  primary: { backgroundColor: colors.primary, borderColor: colors.primary, textColor: colors.onPrimary },
  secondary: { backgroundColor: colors.surface, borderColor: colors.primary, textColor: colors.primary },
  danger: { backgroundColor: colors.danger, borderColor: colors.danger, textColor: colors.onPrimary },
};

export function Button({ title, onPress, variant = 'primary', loading = false, disabled = false, style }) {
  const variantStyle = VARIANT_STYLES[variant] ?? VARIANT_STYLES.primary;
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: variantStyle.backgroundColor, borderColor: variantStyle.borderColor },
        { opacity: isDisabled ? 0.6 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyle.textColor} />
      ) : (
        <Text style={[styles.text, { color: variantStyle.textColor }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 2,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { ...typography.button },
});
