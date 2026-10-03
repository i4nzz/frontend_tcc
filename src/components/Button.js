import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import { useTema } from '../store/preferenciasStore';

function variantesDo(tema) {
  return {
    primary: { backgroundColor: tema.primary, borderColor: tema.primary, textColor: colors.onPrimary },
    secondary: { backgroundColor: colors.surface, borderColor: tema.primary, textColor: tema.primary },
    danger: { backgroundColor: colors.danger, borderColor: colors.danger, textColor: colors.onPrimary },
  };
}

export function Button({ title, onPress, variant = 'primary', loading = false, disabled = false, style }) {
  const tema = useTema();
  const variantes = variantesDo(tema);
  const variantStyle = variantes[variant] ?? variantes.primary;
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
