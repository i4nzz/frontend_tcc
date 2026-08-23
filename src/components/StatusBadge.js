import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import { StatusValidacaoTarefaLabel, StatusTarefaLabel } from '../constants/enums';

const COMPROVACAO_STYLE = {
  1: { bg: colors.warningBg, fg: colors.warning },
  2: { bg: colors.successBg, fg: colors.success },
  3: { bg: colors.dangerBg, fg: colors.danger },
};

const TAREFA_STYLE = {
  1: { bg: colors.border, fg: colors.textMuted },
  2: { bg: colors.warningBg, fg: colors.warning },
  3: { bg: colors.successBg, fg: colors.success },
  4: { bg: colors.dangerBg, fg: colors.danger },
};

export function StatusBadge({ status, type = 'comprovacao' }) {
  const isTarefa = type === 'tarefa';
  const styleMap = isTarefa ? TAREFA_STYLE : COMPROVACAO_STYLE;
  const labelMap = isTarefa ? StatusTarefaLabel : StatusValidacaoTarefaLabel;
  const style = styleMap[status] ?? styleMap[1];

  return (
    <View style={[styles.badge, { backgroundColor: style.bg }]}>
      <Text style={[styles.text, { color: style.fg }]}>{labelMap[status] ?? 'Pendente'}</Text>
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
