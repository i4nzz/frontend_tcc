import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  FadeOutUp,
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { PointsPill } from '../PointsPill';
import { colors, typography } from '../../theme';

const TEMPO_DO_GANHO_MS = 900;

// Pontos da partida. Quando aumentam, o selo dá um pulinho e um "+N" sobe.
export function PontuacaoQuestionario({ pontos, reduzirMovimento }) {
  const escala = useSharedValue(1);
  const anterior = useRef(pontos);
  const [ganho, setGanho] = useState(null);

  useEffect(() => {
    const diferenca = pontos - anterior.current;
    anterior.current = pontos;
    if (diferenca <= 0) return undefined;

    if (!reduzirMovimento) {
      escala.value = withSequence(withTiming(1.18, { duration: 140 }), withSpring(1, { damping: 10, stiffness: 240 }));
    }
    setGanho({ valor: diferenca, id: Date.now() });
    const t = setTimeout(() => setGanho(null), TEMPO_DO_GANHO_MS);
    return () => clearTimeout(t);
  }, [pontos, reduzirMovimento, escala]);

  const estilo = useAnimatedStyle(() => ({ transform: [{ scale: escala.value }] }));

  return (
    <View accessibilityRole="text" accessibilityLabel={`${pontos} pontos`}>
      <Animated.View style={estilo}>
        <PointsPill points={pontos} />
      </Animated.View>
      {ganho && (
        <Animated.Text
          key={ganho.id}
          entering={reduzirMovimento ? undefined : SlideInDown.duration(200)}
          exiting={reduzirMovimento ? undefined : FadeOutUp.duration(300)}
          style={styles.ganho}
        >
          +{ganho.valor}
        </Animated.Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ganho: {
    ...typography.bodyBold,
    position: 'absolute',
    right: 4,
    top: -22,
    color: colors.success,
  },
});
