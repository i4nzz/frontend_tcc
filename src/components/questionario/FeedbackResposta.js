import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { colors, radius, spacing, typography } from '../../theme';
import { FALAS_ACERTO, FALAS_ERRO, falaDaVez } from '../../constants/questionario';

// Conteúdo do balão depois da resposta: reação, explicação e pontos.
export function FeedbackResposta({ resultado, indice, reduzirMovimento }) {
  const { correta, explicacao, textoRespostaCorreta, pontosGanhos } = resultado;
  const titulo = falaDaVez(correta ? FALAS_ACERTO : FALAS_ERRO, indice);

  return (
    <Animated.View
      entering={reduzirMovimento ? undefined : FadeIn.duration(220)}
      style={styles.container}
      accessibilityLiveRegion="polite"
    >
      <Text style={styles.titulo}>{titulo}</Text>
      {!!explicacao && <Text style={styles.explicacao}>{explicacao}</Text>}

      {!correta && (
        <View style={styles.respostaCerta}>
          <Text style={styles.respostaCertaRotulo}>Resposta certa:</Text>
          <Text style={styles.respostaCertaTexto}>{textoRespostaCorreta}</Text>
        </View>
      )}

      <Animated.View
        entering={reduzirMovimento ? undefined : ZoomIn.delay(180).duration(260)}
        style={[styles.pontos, { backgroundColor: correta ? colors.success : colors.surface }]}
      >
        <Text style={[styles.pontosTexto, { color: correta ? colors.onPrimary : colors.textMuted }]}>
          +{pontosGanhos} pontos
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  titulo: { ...typography.title, color: colors.text },
  explicacao: { ...typography.body, color: colors.text, lineHeight: 23 },
  respostaCerta: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.sm + 2,
    gap: 2,
  },
  respostaCertaRotulo: { ...typography.caption, color: colors.textMuted },
  respostaCertaTexto: { ...typography.bodyBold, color: colors.success },
  pontos: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  pontosTexto: { ...typography.button },
});
