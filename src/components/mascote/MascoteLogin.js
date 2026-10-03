import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Extrapolation, interpolate, useAnimatedProps, useAnimatedStyle } from 'react-native-reanimated';
import Svg, { Defs, G } from 'react-native-svg';
import {
  Bochechas,
  Boca,
  Cabeca,
  CiliosDireito,
  CiliosEsquerdo,
  EscleraDireita,
  EscleraEsquerda,
  OlhoDireitoFechado,
  OlhoEsquerdoFechado,
  OmbroTentaculo1,
  OmbroTentaculo7,
  PupilaDireita,
  PupilaEsquerda,
  RecortesDasEscleras,
  Sobrancelhas,
  Tentaculo1,
  Tentaculo7,
  TentaculosFundo,
  VIEW_BOX,
} from './MascotePolvoSvg';

const AnimatedG = Animated.createAnimatedComponent(G);

const [, , RIG_LARGURA, RIG_ALTURA] = VIEW_BOX.split(' ').map(Number);
const RIG_CENTRO_X = RIG_LARGURA / 2;
const RIG_CENTRO_Y = RIG_ALTURA / 2;

// Alcance das pupilas dentro da esclera, em unidades da viewBox (ver LEIA-ME do rig).
const ALCANCE_PUPILA_ESQUERDA = 9;
const ALCANCE_PUPILA_DIREITA = 8;

// Pose de "não vou olhar sua senha": os dois braços da frente sobem na frente
// dos olhos. Ângulos e deslocamento conferidos renderizando o rig original — os
// tocos (OmbroTentaculo*) cobrem a emenda na base, que apareceria num giro
// desse tamanho.
const BRACO_DIREITO = { pivo: [351, 346], rotacao: -94 };
const BRACO_ESQUERDO = { pivo: [148, 349], rotacao: 125 };
const SUBIDA_DOS_BRACOS = -34;

// Os olhos só fecham perto do fim do percurso: assim a sobreposição entre
// olhos abertos e fechados já acontece atrás dos braços.
const JANELA_DOS_OLHOS = [0.55, 0.9];

// Flutuação: pequena o bastante pra não competir com os campos de login.
const AMPLITUDE_FLUTUACAO = 7;
const AMPLITUDE_INCLINACAO = 1.2;

function Mascote({ controlador, largura = 164 }) {
  const { valores, wrapperRef, medir } = controlador;
  const { olharX, olharY, cobertura, flutuacao, inclinacao } = valores;

  const altura = (largura * RIG_ALTURA) / RIG_LARGURA;
  const escala = largura / RIG_LARGURA;

  const estiloFlutuacao = useAnimatedStyle(() => ({
    transform: [
      { translateY: flutuacao.value * -AMPLITUDE_FLUTUACAO },
      { rotate: `${inclinacao.value * AMPLITUDE_INCLINACAO}deg` },
    ],
  }));

  // As pupilas param de seguir o cursor enquanto os olhos estão cobertos.
  const propsPupilaEsquerda = useAnimatedProps(() => {
    const alcance = ALCANCE_PUPILA_ESQUERDA * (1 - cobertura.value);
    return { matrix: [1, 0, 0, 1, olharX.value * alcance, olharY.value * alcance] };
  });

  const propsPupilaDireita = useAnimatedProps(() => {
    const alcance = ALCANCE_PUPILA_DIREITA * (1 - cobertura.value);
    return { matrix: [1, 0, 0, 1, olharX.value * alcance, olharY.value * alcance] };
  });

  // Troca olhos abertos por olhos fechados enquanto os braços chegam.
  const estiloOlhosAbertos = useAnimatedStyle(() => ({
    opacity: interpolate(cobertura.value, JANELA_DOS_OLHOS, [1, 0], Extrapolation.CLAMP),
  }));
  const estiloOlhosFechados = useAnimatedStyle(() => ({
    opacity: interpolate(cobertura.value, JANELA_DOS_OLHOS, [0, 1], Extrapolation.CLAMP),
  }));

  // Gira o braço em torno do pivô do rig: translada até o pivô, gira e volta.
  // O primeiro translateY é a subida que leva o braço até a altura dos olhos.
  const pivoDireitoX = (BRACO_DIREITO.pivo[0] - RIG_CENTRO_X) * escala;
  const pivoDireitoY = (BRACO_DIREITO.pivo[1] - RIG_CENTRO_Y) * escala;
  const estiloBracoDireito = useAnimatedStyle(() => {
    const progresso = cobertura.value;
    return {
      transform: [
        { translateY: progresso * SUBIDA_DOS_BRACOS * escala },
        { translateX: pivoDireitoX },
        { translateY: pivoDireitoY },
        { rotate: `${progresso * BRACO_DIREITO.rotacao}deg` },
        { translateX: -pivoDireitoX },
        { translateY: -pivoDireitoY },
      ],
    };
  });

  const pivoEsquerdoX = (BRACO_ESQUERDO.pivo[0] - RIG_CENTRO_X) * escala;
  const pivoEsquerdoY = (BRACO_ESQUERDO.pivo[1] - RIG_CENTRO_Y) * escala;
  const estiloBracoEsquerdo = useAnimatedStyle(() => {
    const progresso = cobertura.value;
    return {
      transform: [
        { translateY: progresso * SUBIDA_DOS_BRACOS * escala },
        { translateX: pivoEsquerdoX },
        { translateY: pivoEsquerdoY },
        { rotate: `${progresso * BRACO_ESQUERDO.rotacao}deg` },
        { translateX: -pivoEsquerdoX },
        { translateY: -pivoEsquerdoY },
      ],
    };
  });

  const camada = [StyleSheet.absoluteFill, { width: largura, height: altura }];
  const svg = { width: largura, height: altura, viewBox: VIEW_BOX };

  return (
    <View
      ref={wrapperRef}
      onLayout={medir}
      style={{ width: largura, height: altura }}
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      <Animated.View style={[{ width: largura, height: altura }, estiloFlutuacao]}>
        {/* Corpo, tentáculos de trás, tocos dos braços, bochechas, sobrancelhas e boca. */}
        <Svg {...svg}>
          <Cabeca />
          <TentaculosFundo />
          <OmbroTentaculo1 />
          <OmbroTentaculo7 />
          <Bochechas />
          <Sobrancelhas />
          <Boca />
        </Svg>

        {/* Olhos abertos: esclera, pupila recortada pela esclera e cílios. */}
        <Animated.View style={[camada, estiloOlhosAbertos]}>
          <Svg {...svg}>
            <Defs>
              <RecortesDasEscleras />
            </Defs>
            <EscleraEsquerda />
            <G clipPath="url(#recorte-esclera-esquerdo)">
              <AnimatedG animatedProps={propsPupilaEsquerda}>
                <PupilaEsquerda />
              </AnimatedG>
            </G>
            <EscleraDireita />
            <G clipPath="url(#recorte-esclera-direito)">
              <AnimatedG animatedProps={propsPupilaDireita}>
                <PupilaDireita />
              </AnimatedG>
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

        {/* Braços da frente: desenhados por cima do rosto, então cobrem os olhos. */}
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
    </View>
  );
}

// Memoizado: a tela de login re-renderiza a cada tecla digitada e o mascote
// nao depende de nada disso (o controlador tem identidade estavel).
export const MascoteLogin = memo(Mascote);
