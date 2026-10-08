import { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  ZoomIn,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, G } from 'react-native-svg';
import {
  Bochechas,
  Boca,
  BocaAberta,
  BocaCuriosa,
  Brilhos,
  Cabeca,
  CiliosDireito,
  CiliosEsquerdo,
  Confete,
  EscleraDireita,
  EscleraEsquerda,
  Interrogacao,
  OlhoDireitoFechado,
  OlhoEsquerdoFechado,
  OmbroTentaculo1,
  OmbroTentaculo7,
  PupilaDireita,
  PupilaEsquerda,
  RecortesDasEscleras,
  Sobrancelhas,
  SobrancelhasCurioso,
  SobrancelhasFeliz,
  Tentaculo1,
  Tentaculo7,
  TentaculosFundo,
  VIEW_BOX,
} from './MascotePolvoSvg';

export const HUMORES = {
  NORMAL: 'normal',
  CURIOSO: 'curioso',
  FELIZ: 'feliz',
  // Resposta errada: rosto amigável e um balanço de "quase!", nunca triste.
  ENCORAJANDO: 'encorajando',
  COMEMORANDO: 'comemorando',
};

const [, , RIG_LARGURA, RIG_ALTURA] = VIEW_BOX.split(' ').map(Number);
const RIG_CENTRO_X = RIG_LARGURA / 2;
const RIG_CENTRO_Y = RIG_ALTURA / 2;

// Pivôs dos braços da frente (LEIA-ME do rig) e os ângulos do estado
// "comemorando" do próprio rig.
const PIVO_BRACO_DIREITO = [351, 346];
const PIVO_BRACO_ESQUERDO = [148, 349];
const BRACO_DIREITO_COMEMORANDO = -30;
const BRACO_ESQUERDO_COMEMORANDO = 26;

// Desvio das pupilas no estado "curioso" do rig (unidades da viewBox).
const OLHAR_CURIOSO = 'translate(7 -10)';

const AMPLITUDE_FLUTUACAO = 5;
const MOLA_SALTO = { damping: 9, stiffness: 220, mass: 0.6 };

function useBraco(pivo, escala, angulo) {
  const pivoX = (pivo[0] - RIG_CENTRO_X) * escala;
  const pivoY = (pivo[1] - RIG_CENTRO_Y) * escala;
  return useAnimatedStyle(() => ({
    transform: [
      { translateX: pivoX },
      { translateY: pivoY },
      { rotate: `${angulo.value}deg` },
      { translateX: -pivoX },
      { translateY: -pivoY },
    ],
  }));
}

function Mascote({ humor = HUMORES.NORMAL, largura = 150, pulso = 0, reduzirMovimento = false }) {
  const altura = (largura * RIG_ALTURA) / RIG_LARGURA;
  const escala = largura / RIG_LARGURA;

  const flutuacao = useSharedValue(0);
  const salto = useSharedValue(0);
  const giro = useSharedValue(0);
  const piscar = useSharedValue(0);
  const bracoDireito = useSharedValue(0);
  const bracoEsquerdo = useSharedValue(0);

  // Flutuação e piscadas: o "respirar" do mascote enquanto espera.
  useEffect(() => {
    if (reduzirMovimento) {
      flutuacao.value = 0;
      piscar.value = 0;
      return undefined;
    }
    flutuacao.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 1600, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
    piscar.value = withRepeat(
      withSequence(
        withDelay(3200, withTiming(1, { duration: 70 })),
        withDelay(90, withTiming(0, { duration: 110 }))
      ),
      -1,
      false
    );
    return () => {
      cancelAnimation(flutuacao);
      cancelAnimation(piscar);
    };
  }, [reduzirMovimento, flutuacao, piscar]);

  // Reação a cada troca de humor (e a cada nova pergunta, via `pulso`).
  useEffect(() => {
    cancelAnimation(salto);
    cancelAnimation(giro);
    cancelAnimation(bracoDireito);
    cancelAnimation(bracoEsquerdo);

    const comemorando = humor === HUMORES.COMEMORANDO;
    const alvoDireito = comemorando ? BRACO_DIREITO_COMEMORANDO : 0;
    const alvoEsquerdo = comemorando ? BRACO_ESQUERDO_COMEMORANDO : 0;

    if (reduzirMovimento) {
      salto.value = 0;
      giro.value = humor === HUMORES.CURIOSO ? 3 : 0;
      bracoDireito.value = alvoDireito;
      bracoEsquerdo.value = alvoEsquerdo;
      return;
    }

    switch (humor) {
      case HUMORES.FELIZ:
        salto.value = withSequence(
          withTiming(-22, { duration: 160, easing: Easing.out(Easing.quad) }),
          withSpring(0, MOLA_SALTO)
        );
        giro.value = withSpring(0, MOLA_SALTO);
        bracoDireito.value = withSequence(
          withTiming(-24, { duration: 180 }),
          withTiming(-8, { duration: 180 }),
          withTiming(-20, { duration: 180 }),
          withTiming(0, { duration: 260 })
        );
        bracoEsquerdo.value = withTiming(0, { duration: 200 });
        break;
      case HUMORES.ENCORAJANDO:
        salto.value = withSpring(0, MOLA_SALTO);
        giro.value = withSequence(
          withTiming(-7, { duration: 150 }),
          withTiming(6, { duration: 190 }),
          withTiming(-3, { duration: 170 }),
          withTiming(0, { duration: 170 })
        );
        bracoDireito.value = withTiming(0, { duration: 200 });
        bracoEsquerdo.value = withTiming(0, { duration: 200 });
        break;
      case HUMORES.COMEMORANDO:
        salto.value = withRepeat(
          withSequence(
            withTiming(-16, { duration: 220, easing: Easing.out(Easing.quad) }),
            withTiming(0, { duration: 260, easing: Easing.in(Easing.quad) }),
            withTiming(0, { duration: 500 })
          ),
          -1,
          false
        );
        giro.value = withTiming(0, { duration: 200 });
        bracoDireito.value = withRepeat(
          withSequence(
            withTiming(alvoDireito, { duration: 260 }),
            withTiming(alvoDireito + 12, { duration: 260 })
          ),
          -1,
          true
        );
        bracoEsquerdo.value = withRepeat(
          withSequence(
            withTiming(alvoEsquerdo, { duration: 260 }),
            withTiming(alvoEsquerdo - 12, { duration: 260 })
          ),
          -1,
          true
        );
        break;
      case HUMORES.CURIOSO:
        // Pulinho de "lá vem pergunta" e a cabeça inclinada, como quem pergunta.
        salto.value = withSequence(withTiming(-10, { duration: 140 }), withSpring(0, MOLA_SALTO));
        giro.value = withSpring(3, { damping: 14, stiffness: 120 });
        bracoDireito.value = withTiming(0, { duration: 200 });
        bracoEsquerdo.value = withTiming(0, { duration: 200 });
        break;
      default:
        salto.value = withSpring(0, MOLA_SALTO);
        giro.value = withSpring(0, MOLA_SALTO);
        // Aceno de "oi!" com o braço levantado.
        bracoDireito.value = withSequence(
          withDelay(300, withTiming(-18, { duration: 220 })),
          withTiming(-4, { duration: 220 }),
          withTiming(-18, { duration: 220 }),
          withTiming(0, { duration: 260 })
        );
        bracoEsquerdo.value = withTiming(0, { duration: 200 });
    }
  }, [humor, pulso, reduzirMovimento, salto, giro, bracoDireito, bracoEsquerdo]);

  const estiloCorpo = useAnimatedStyle(() => ({
    transform: [
      { translateY: salto.value - flutuacao.value * AMPLITUDE_FLUTUACAO },
      { rotate: `${giro.value}deg` },
    ],
  }));
  const estiloOlhosAbertos = useAnimatedStyle(() => ({ opacity: 1 - piscar.value }));
  const estiloOlhosFechados = useAnimatedStyle(() => ({ opacity: piscar.value }));
  const estiloBracoDireito = useBraco(PIVO_BRACO_DIREITO, escala, bracoDireito);
  const estiloBracoEsquerdo = useBraco(PIVO_BRACO_ESQUERDO, escala, bracoEsquerdo);

  const feliz = humor === HUMORES.FELIZ || humor === HUMORES.COMEMORANDO;
  const curioso = humor === HUMORES.CURIOSO;
  const olhar = curioso ? OLHAR_CURIOSO : undefined;

  const camada = [StyleSheet.absoluteFill, { width: largura, height: altura }];
  const svg = { width: largura, height: altura, viewBox: VIEW_BOX };

  return (
    <View
      style={{ width: largura, height: altura }}
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      <Animated.View style={[{ width: largura, height: altura }, estiloCorpo]}>
        <Svg {...svg}>
          <Cabeca />
          <TentaculosFundo />
          <OmbroTentaculo1 />
          <OmbroTentaculo7 />
          <Bochechas />
          {feliz ? <SobrancelhasFeliz /> : curioso ? <SobrancelhasCurioso /> : <Sobrancelhas />}
          {feliz ? <BocaAberta /> : curioso ? <BocaCuriosa /> : <Boca />}
        </Svg>

        <Animated.View style={[camada, estiloOlhosAbertos]}>
          <Svg {...svg}>
            <Defs>
              <RecortesDasEscleras />
            </Defs>
            <EscleraEsquerda />
            <G clipPath="url(#recorte-esclera-esquerdo)">
              <G transform={olhar}>
                <PupilaEsquerda />
              </G>
            </G>
            <EscleraDireita />
            <G clipPath="url(#recorte-esclera-direito)">
              <G transform={olhar}>
                <PupilaDireita />
              </G>
            </G>
            <CiliosEsquerdo />
            <CiliosDireito />
          </Svg>
        </Animated.View>

        <Animated.View style={[camada, estiloOlhosFechados]}>
          <Svg {...svg}>
            <OlhoEsquerdoFechado />
            <OlhoDireitoFechado />
          </Svg>
        </Animated.View>

        <Animated.View style={[camada, estiloBracoDireito]}>
          <Svg {...svg}>
            <Tentaculo7 />
          </Svg>
        </Animated.View>
        <Animated.View style={[camada, estiloBracoEsquerdo]}>
          <Svg {...svg}>
            <Tentaculo1 />
          </Svg>
        </Animated.View>
      </Animated.View>

      {/* Decorações do rig: ficam fora do corpo para não pularem junto. */}
      {curioso && (
        <Animated.View key="interrogacao" entering={ZoomIn.duration(220)} style={camada}>
          <Svg {...svg}>
            <Interrogacao />
          </Svg>
        </Animated.View>
      )}
      {humor === HUMORES.FELIZ && (
        <Animated.View key="brilhos" entering={ZoomIn.duration(220)} style={camada}>
          <Svg {...svg}>
            <Brilhos />
          </Svg>
        </Animated.View>
      )}
      {humor === HUMORES.COMEMORANDO && (
        <Animated.View key="confete" entering={ZoomIn.duration(320)} style={camada}>
          <Svg {...svg}>
            <Confete />
          </Svg>
        </Animated.View>
      )}
    </View>
  );
}

export const MascoteQuestionario = memo(Mascote);
