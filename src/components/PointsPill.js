import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../theme';

export function PointsPill({ points, style }) {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name="star" size={18} color={colors.star} />
      <Text style={styles.text}>{points} pts</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.warningBg,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  text: { ...typography.bodyBold, color: colors.text },
});
