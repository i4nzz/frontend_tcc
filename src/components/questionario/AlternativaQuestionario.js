import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors, radius, spacing, typography } from '../../theme';
import { useTema } from '../../store/preferenciasStore';

export const ESTADOS_ALTERNATIVA = {
  LIVRE: 'livre',
  ESCOLHIDA: 'escolhida',
  CORRETA: 'correta',
  INCORRETA: 'incorreta',
  APAGADA: 'apagada',
};

const MOLA = { damping: 15, stiffness: 260 };

export function AlternativaQuestionario({
  letra,
  texto,
  estado = ESTADOS_ALTERNATIVA.LIVRE,
  habilitada,
  onPress,
  ordem,
  reduzirMovimento,
}) {
  const tema = useTema();
  const escala = useSharedValue(1);

  // A alternativa certa dá um "pulinho" quando é revelada.
  useEffect(() => {
    if (estado === ESTADOS_ALTERNATIVA.CORRETA && !reduzirMovimento) {
      escala.value = withSequence(withTiming(1.05, { duration: 140 }), withSpring(1, MOLA));
    } else if (estado !== ESTADOS_ALTERNATIVA.LIVRE) {
      escala.value = withSpring(1, MOLA);
    }
  }, [estado, reduzirMovimento, escala]);

  const estiloAnimado = useAnimatedStyle(() => ({
    transform: [{ scale: escala.value }],
  }));

  const cores = coresDo(estado, tema);
  const icone =
    estado === ESTADOS_ALTERNATIVA.CORRETA ? 'checkmark' : estado === ESTADOS_ALTERNATIVA.INCORRETA ? 'close' : null;

  function aoEntrar() {
    if (!habilitada || reduzirMovimento) return;
    escala.value = withSpring(1.02, MOLA);
  }

  function aoSair() {
    escala.value = withSpring(1, MOLA);
  }

  return (
    // Entrada e escala em views separadas: a animação de entrada também mexe no transform.
    <Animated.View entering={reduzirMovimento ? undefined : FadeInDown.delay(450 + ordem * 90).duration(260)}>
      <Animated.View style={[estiloAnimado, estado === ESTADOS_ALTERNATIVA.APAGADA && styles.apagada]}>
        <Pressable
          onPress={onPress}
          disabled={!habilitada}
          onHoverIn={aoEntrar}
          onHoverOut={aoSair}
          onPressIn={() => {
            if (habilitada && !reduzirMovimento) escala.value = withSpring(0.97, MOLA);
          }}
          onPressOut={aoSair}
          accessibilityRole="button"
          accessibilityLabel={`Alternativa ${letra}: ${texto}`}
          accessibilityState={{
            disabled: !habilitada,
            selected: estado === ESTADOS_ALTERNATIVA.ESCOLHIDA || estado === ESTADOS_ALTERNATIVA.INCORRETA,
          }}
          style={({ hovered }) => [
            styles.cartao,
            { backgroundColor: cores.fundo, borderColor: hovered && habilitada ? tema.primary : cores.borda },
          ]}
        >
          <View style={[styles.letra, { backgroundColor: cores.letraFundo }]}>
            {icone ? (
              <Ionicons name={icone} size={20} color={colors.onPrimary} />
            ) : (
              <Text style={styles.letraTexto}>{letra}</Text>
            )}
          </View>
          <Text style={[styles.texto, { color: cores.texto }]}>{texto}</Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

function coresDo(estado, tema) {
  switch (estado) {
    case ESTADOS_ALTERNATIVA.ESCOLHIDA:
      return { fundo: `${tema.primary}14`, borda: tema.primary, letraFundo: tema.primary, texto: colors.text };
    case ESTADOS_ALTERNATIVA.CORRETA:
      return { fundo: colors.successBg, borda: colors.success, letraFundo: colors.success, texto: colors.text };
    case ESTADOS_ALTERNATIVA.INCORRETA:
      return { fundo: colors.dangerBg, borda: colors.danger, letraFundo: colors.danger, texto: colors.text };
    default:
      return { fundo: colors.surface, borda: colors.border, letraFundo: tema.primary, texto: colors.text };
  }
}

const styles = StyleSheet.create({
  cartao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 60,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    borderWidth: 2,
    borderRadius: radius.md,
  },
  apagada: { opacity: 0.5 },
  letra: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letraTexto: { ...typography.button, color: colors.onPrimary },
  texto: { ...typography.bodyBold, flex: 1 },
});
