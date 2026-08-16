import { Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';

export function FormError({ message }) {
  if (!message) return null;
  return <Text style={styles.text}>{message}</Text>;
}

const styles = StyleSheet.create({
  text: { ...typography.body, color: colors.danger, marginBottom: spacing.md },
});
