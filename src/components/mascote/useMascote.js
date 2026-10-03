import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Dimensions, Platform } from 'react-native';
import {
  Easing,
  cancelAnimation,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

// Estados do mascote. Ficam num ref, não em useState: nenhum deles muda o que o
// React renderiza (a animação toda vive em shared values, na thread de UI), e
// guardá-los em estado re-renderizaria o formulário de login a cada toque.
// PASSWORD_BLURRED não é estável — ao sair da senha o mascote volta pra IDLE.
export const ESTADOS = {
  IDLE: 'IDLE',
  LOOKING: 'LOOKING',
  LOOKING_AT_CLICK: 'LOOKING_AT_CLICK',
  PASSWORD_FOCUSED: 'PASSWORD_FOCUSED',
  PASSWORD_BLURRED: 'PASSWORD_BLURRED',
};

// Quanto tempo o olhar fica na região tocada antes de voltar ao centro.
const RETORNO_AO_CENTRO_MS = 850;

// Mola do olhar: sem oscilação, só um atraso suave atrás do cursor/toque.
const MOLA_OLHAR = { damping: 18, stiffness: 90, mass: 0.6, overshootClamping: true };

// Flutuação: sobe, segura um instante no alto, desce. A inclinação tem um
// período diferente de propósito — em fase, o movimento parece mecânico.
const SUBIDA_MS = 1500;
const PAUSA_NO_ALTO_MS = 240;
const DESCIDA_MS = 1800;
const INCLINACAO_MS = 2900;

// Entrada e saída do tentáculo que cobre os olhos.
const COBRIR_MS = 560;
const DESCOBRIR_MS = 420;
// O olhar desce pro campo antes do tentáculo começar a subir.
const ATRASO_DO_TENTACULO_MS = 170;
// Com movimento reduzido a troca ainda acontece, mas quase sem percurso.
const TRANSICAO_REDUZIDA_MS = 120;

export function useMascote({ senhaFocada }) {
  const [reduzirMovimento, setReduzirMovimento] = useState(false);

  // Alvos escritos pela thread JS; os valores suavizados derivam deles na UI.
  const alvoOlharX = useSharedValue(0);
  const alvoOlharY = useSharedValue(0);
  const cobertura = useSharedValue(0);
  const flutuacao = useSharedValue(0);
  const inclinacao = useSharedValue(0);

  const olharX = useDerivedValue(() => withSpring(alvoOlharX.value, MOLA_OLHAR));
  const olharY = useDerivedValue(() => withSpring(alvoOlharY.value, MOLA_OLHAR));

  const estadoRef = useRef(ESTADOS.IDLE);
  const wrapperRef = useRef(null);
  // Centro do mascote em coordenadas da janela, preenchido no onLayout.
  const centro = useRef(null);
  const timerRetorno = useRef(null);

  const senhaFocadaRef = useRef(senhaFocada);
  senhaFocadaRef.current = senhaFocada;
  const reduzirRef = useRef(reduzirMovimento);
  reduzirRef.current = reduzirMovimento;

  // ---------------------------------------------------------------- acessibilidade

  useEffect(() => {
    let ativo = true;
    AccessibilityInfo.isReduceMotionEnabled().then((valor) => {
      if (ativo) setReduzirMovimento(valor);
    });
    const inscricao = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduzirMovimento);
    return () => {
      ativo = false;
      inscricao?.remove?.();
    };
  }, []);

  // ---------------------------------------------------------------- flutuação

  useEffect(() => {
    if (reduzirMovimento) {
      cancelAnimation(flutuacao);
      cancelAnimation(inclinacao);
      flutuacao.value = withTiming(0, { duration: 200 });
      inclinacao.value = withTiming(0, { duration: 200 });
      return undefined;
    }

    flutuacao.value = withRepeat(
      withSequence(
        withTiming(1, { duration: SUBIDA_MS, easing: Easing.inOut(Easing.quad) }),
        withDelay(PAUSA_NO_ALTO_MS, withTiming(0, { duration: DESCIDA_MS, easing: Easing.inOut(Easing.quad) }))
      ),
      -1,
      false
    );
    inclinacao.value = withRepeat(
      withSequence(
        withTiming(1, { duration: INCLINACAO_MS, easing: Easing.inOut(Easing.sin) }),
        withTiming(-1, { duration: INCLINACAO_MS, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );

    // Para o loop ao desmontar: nada de timer rodando fora da tela de login.
    return () => {
      cancelAnimation(flutuacao);
      cancelAnimation(inclinacao);
    };
  }, [reduzirMovimento, flutuacao, inclinacao]);

  // ---------------------------------------------------------------- olhar

  const limparRetorno = useCallback(() => {
    if (timerRetorno.current) {
      clearTimeout(timerRetorno.current);
      timerRetorno.current = null;
    }
  }, []);

  const olharParaCentro = useCallback(() => {
    limparRetorno();
    alvoOlharX.value = 0;
    alvoOlharY.value = 0;
  }, [alvoOlharX, alvoOlharY, limparRetorno]);

  // Converte um ponto da janela num alvo de olhar normalizado (-1..1).
  const apontarOlharPara = useCallback(
    (pageX, pageY) => {
      const c = centro.current;
      if (!c) return false;

      const dx = pageX - c.x;
      const dy = pageY - c.y;
      const distancia = Math.hypot(dx, dy);
      if (distancia < 1) return false;

      const { width, height } = Dimensions.get('window');
      // Satura antes da borda, senão o olhar quase nunca chega ao máximo.
      const alcance = Math.max(width, height) * 0.45;
      const forca = Math.min(1, distancia / alcance);

      alvoOlharX.value = (dx / distancia) * forca;
      alvoOlharY.value = (dy / distancia) * forca;
      return true;
    },
    [alvoOlharX, alvoOlharY]
  );

  // Toque: olha pra região tocada e volta sozinho ao centro (LOOKING_AT_CLICK).
  const registrarToque = useCallback(
    (pageX, pageY) => {
      if (senhaFocadaRef.current || reduzirRef.current) return;
      if (!apontarOlharPara(pageX, pageY)) return;

      limparRetorno();
      estadoRef.current = ESTADOS.LOOKING_AT_CLICK;
      timerRetorno.current = setTimeout(() => {
        timerRetorno.current = null;
        if (senhaFocadaRef.current) return;
        olharParaCentro();
        estadoRef.current = ESTADOS.IDLE;
      }, RETORNO_AO_CENTRO_MS);
    },
    [apontarOlharPara, limparRetorno, olharParaCentro]
  );

  // Cursor (web/desktop): as pupilas seguem continuamente, sem timer de retorno.
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return undefined;

    let aguardandoFrame = false;
    let ultimo = null;

    const aplicar = () => {
      aguardandoFrame = false;
      if (!ultimo || senhaFocadaRef.current || reduzirRef.current) return;
      if (apontarOlharPara(ultimo.x, ultimo.y)) estadoRef.current = ESTADOS.LOOKING;
    };

    // No máximo um alvo por frame: o pointermove dispara bem mais que isso.
    const aoMover = (evento) => {
      ultimo = { x: evento.clientX, y: evento.clientY };
      if (aguardandoFrame) return;
      aguardandoFrame = true;
      window.requestAnimationFrame(aplicar);
    };

    const aoSair = () => {
      if (senhaFocadaRef.current) return;
      olharParaCentro();
      estadoRef.current = ESTADOS.IDLE;
    };

    window.addEventListener('pointermove', aoMover, { passive: true });
    window.addEventListener('pointerleave', aoSair);
    return () => {
      window.removeEventListener('pointermove', aoMover);
      window.removeEventListener('pointerleave', aoSair);
    };
  }, [apontarOlharPara, olharParaCentro]);

  // ---------------------------------------------------------------- campo de senha

  useEffect(() => {
    if (senhaFocada) {
      limparRetorno();
      estadoRef.current = ESTADOS.PASSWORD_FOCUSED;
      // Primeiro o olhar desce pro campo; só então o tentáculo sobe.
      alvoOlharX.value = 0;
      alvoOlharY.value = 0.85;
      cobertura.value = reduzirMovimento
        ? withTiming(1, { duration: TRANSICAO_REDUZIDA_MS })
        : withDelay(
            ATRASO_DO_TENTACULO_MS,
            withTiming(1, { duration: COBRIR_MS, easing: Easing.inOut(Easing.cubic) })
          );
      return;
    }

    alvoOlharX.value = 0;
    alvoOlharY.value = 0;

    // Só é PASSWORD_BLURRED se o mascote estava mesmo cobrindo os olhos —
    // na primeira montagem este efeito roda com a senha já desfocada.
    if (estadoRef.current !== ESTADOS.PASSWORD_FOCUSED) {
      estadoRef.current = ESTADOS.IDLE;
      return;
    }

    const duracao = reduzirMovimento ? TRANSICAO_REDUZIDA_MS : DESCOBRIR_MS;
    estadoRef.current = ESTADOS.PASSWORD_BLURRED;
    cobertura.value = withTiming(0, { duration: duracao, easing: Easing.out(Easing.cubic) });

    // Volta a IDLE quando o tentáculo termina de descer.
    const voltaAoIdle = setTimeout(() => {
      if (estadoRef.current === ESTADOS.PASSWORD_BLURRED) estadoRef.current = ESTADOS.IDLE;
    }, duracao);
    return () => clearTimeout(voltaAoIdle);
  }, [senhaFocada, reduzirMovimento, alvoOlharX, alvoOlharY, cobertura, limparRetorno]);

  useEffect(() => () => limparRetorno(), [limparRetorno]);

  // ---------------------------------------------------------------- medição

  const medir = useCallback(() => {
    wrapperRef.current?.measureInWindow?.((x, y, width, height) => {
      if (!width && !height) return;
      centro.current = { x: x + width / 2, y: y + height / 2 };
    });
  }, []);

  // Observa o início de cada toque na subárvore sem nunca virar responder:
  // devolver false na fase de captura deixa o toque seguir pro campo/botão.
  const observadorDeToques = useMemo(
    () => ({
      onStartShouldSetResponderCapture: (evento) => {
        const { pageX, pageY } = evento.nativeEvent;
        registrarToque(pageX, pageY);
        return false;
      },
    }),
    [registrarToque]
  );

  // Identidade estável: MascoteLogin é memoizado e não deve re-renderizar a
  // cada tecla digitada no formulário.
  const valores = useMemo(
    () => ({ olharX, olharY, cobertura, flutuacao, inclinacao }),
    [olharX, olharY, cobertura, flutuacao, inclinacao]
  );

  return { estadoRef, reduzirMovimento, wrapperRef, medir, observadorDeToques, valores };
}
