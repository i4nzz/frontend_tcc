import { StyleSheet, View } from 'react-native';
import Animated, { LinearTransition, ZoomIn } from 'react-native-reanimated';
import { colors, radius, spacing } from '../../theme';

const TONS = {
  neutro: { fundo: colors.surface, borda: colors.border },
  acerto: { fundo: colors.successBg, borda: colors.success },
  // Errar usa o tom âmbar de "dica", não o vermelho de erro.
  erro: { fundo: colors.warningBg, borda: colors.warning },
};

const TAMANHO_PONTA = 16;

// Balão de fala do mascote. A ponta aponta para ele: para cima quando o
// mascote está acima (celular) e para a esquerda quando está ao lado (tablet).
export function BalaoPergunta({ children, ponta = 'cima', tom = 'neutro', reduzirMovimento, style }) {
  const cores = TONS[tom] ?? TONS.neutro;
  const estiloPonta = ponta === 'esquerda' ? styles.pontaEsquerda : styles.pontaCima;

  return (
    <Animated.View
      entering={reduzirMovimento ? undefined : ZoomIn.delay(150).duration(250)}
      layout={reduzirMovimento ? undefined : LinearTransition.duration(220)}
      style={[styles.balao, { backgroundColor: cores.fundo, borderColor: cores.borda }, style]}
    >
      <View
        style={[styles.ponta, estiloPonta, { backgroundColor: cores.fundo, borderColor: cores.borda }]}
        pointerEvents="none"
      />
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  balao: {
    borderWidth: 2,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md + 2,
    gap: spacing.sm,
  },
  ponta: {
    position: 'absolute',
    width: TAMANHO_PONTA,
    height: TAMANHO_PONTA,
    borderLeftWidth: 2,
    borderTopWidth: 2,
    transform: [{ rotate: '45deg' }],
  },
  pontaCima: {
    top: -TAMANHO_PONTA / 2 - 1,
    alignSelf: 'center',
    left: '50%',
    marginLeft: -TAMANHO_PONTA / 2,
  },
  pontaEsquerda: {
    left: -TAMANHO_PONTA / 2 - 1,
    top: 36,
    transform: [{ rotate: '-45deg' }],
  },
});
