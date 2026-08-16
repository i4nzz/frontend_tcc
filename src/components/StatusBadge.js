import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import { StatusValidacaoTarefaLabel } from '../constants/enums';

const STATUS_STYLE = {
  1: { bg: colors.warningBg, fg: colors.warning },
  2: { bg: colors.successBg, fg: colors.success },
  3: { bg: colors.dangerBg, fg: colors.danger },
};

export function StatusBadge({ status }) {
  const style = STATUS_STYLE[status] ?? STATUS_STYLE[1];
  return (
    <View style={[styles.badge, { backgroundColor: style.bg }]}>
      <Text style={[styles.text, { color: style.fg }]}>
        {StatusValidacaoTarefaLabel[status] ?? 'Pendente'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  text: { ...typography.caption, fontWeight: '700' },
});
