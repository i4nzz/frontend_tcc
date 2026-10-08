import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Button } from '../Button';
import { MascoteQuestionario, HUMORES } from '../mascote/MascoteQuestionario';
import { BalaoPergunta } from './BalaoPergunta';
import { AlternativaQuestionario, ESTADOS_ALTERNATIVA } from './AlternativaQuestionario';
import { FeedbackResposta } from './FeedbackResposta';
import { PontuacaoQuestionario } from './PontuacaoQuestionario';
import { FASES } from '../../hooks/useQuestionario';
import { colors, radius, spacing, typography } from '../../theme';
import { useTema } from '../../store/preferenciasStore';
import {
  FALAS_PERGUNTA,
  LETRAS_ALTERNATIVAS,
  categoriaDoQuestionario,
  falaDaVez,
} from '../../constants/questionario';

const FASES_COM_RESULTADO = [FASES.ACERTO, FASES.ERRO, FASES.FEEDBACK];

function humorDa(fase, resultado) {
  if (FASES_COM_RESULTADO.includes(fase) && resultado) {
    return resultado.correta ? HUMORES.FELIZ : HUMORES.ENCORAJANDO;
  }
  return HUMORES.CURIOSO;
}

function estadoDaAlternativa(i, fase, escolha, resultado) {
  if (fase === FASES.VERIFICANDO) {
    return i === escolha ? ESTADOS_ALTERNATIVA.ESCOLHIDA : ESTADOS_ALTERNATIVA.LIVRE;
  }
  if (FASES_COM_RESULTADO.includes(fase) && resultado) {
    if (i === resultado.respostaCorreta) return ESTADOS_ALTERNATIVA.CORRETA;
    if (i === escolha) return ESTADOS_ALTERNATIVA.INCORRETA;
    return ESTADOS_ALTERNATIVA.APAGADA;
  }
  return ESTADOS_ALTERNATIVA.LIVRE;
}

export function QuestionarioJogo({ jogo, largo, larguraMascote, reduzirMovimento }) {
  const tema = useTema();
  const { fase, perguntaAtual, indice, total, escolha, resultado, pontos, aviso, responder, proxima } = jogo;
  const { emoji, nome } = categoriaDoQuestionario(perguntaAtual.categoria);
  const mostrandoFeedback = fase === FASES.FEEDBACK && resultado;
  const ultima = indice + 1 >= total;

  return (
    <View style={styles.container}>
      <View style={styles.topo}>
        <View style={styles.progresso}>
          <Text style={styles.progressoTexto}>
            Pergunta {indice + 1} de {total}
          </Text>
          <View style={styles.barra}>
            <View
              style={[styles.barraCheia, { width: `${((indice + 1) / total) * 100}%`, backgroundColor: tema.primary }]}
            />
          </View>
        </View>
        <PontuacaoQuestionario pontos={pontos} reduzirMovimento={reduzirMovimento} />
      </View>

      <View style={[styles.cena, largo && styles.cenaLarga]}>
        <Animated.View entering={reduzirMovimento ? undefined : FadeInUp.duration(300)}>
          <MascoteQuestionario
            humor={humorDa(fase, resultado)}
            largura={larguraMascote}
            pulso={indice}
            reduzirMovimento={reduzirMovimento}
          />
        </Animated.View>

        <BalaoPergunta
          key={perguntaAtual.id}
          ponta={largo ? 'esquerda' : 'cima'}
          tom={mostrandoFeedback ? (resultado.correta ? 'acerto' : 'erro') : 'neutro'}
          reduzirMovimento={reduzirMovimento}
          style={largo ? styles.balaoLargo : styles.balao}
        >
          {mostrandoFeedback ? (
            <>
              <FeedbackResposta resultado={resultado} indice={indice} reduzirMovimento={reduzirMovimento} />
              <Animated.View entering={reduzirMovimento ? undefined : FadeInUp.delay(300).duration(260)}>
                <Button title={ultima ? 'VER RESULTADO →' : 'PRÓXIMA PERGUNTA →'} onPress={proxima} />
              </Animated.View>
            </>
          ) : (
            <Animated.View entering={reduzirMovimento ? undefined : FadeIn.delay(300).duration(250)} style={styles.fala}>
              <Text style={styles.falaMascote}>{falaDaVez(FALAS_PERGUNTA, indice)}</Text>
              <Text style={styles.pergunta}>{perguntaAtual.pergunta}</Text>
              <View style={styles.rodapeBalao}>
                <Text style={styles.categoria}>
                  {emoji} {nome}
                </Text>
                <Text style={styles.valor}>⭐ {perguntaAtual.pontos}</Text>
              </View>
            </Animated.View>
          )}
        </BalaoPergunta>
      </View>

      <View key={perguntaAtual.id} style={styles.alternativas}>
        {perguntaAtual.opcoes.map((opcao, i) => (
          <AlternativaQuestionario
            key={i}
            ordem={i}
            letra={LETRAS_ALTERNATIVAS[i] ?? String(i + 1)}
            texto={opcao}
            estado={estadoDaAlternativa(i, fase, escolha, resultado)}
            habilitada={fase === FASES.RESPONDENDO}
            onPress={() => responder(i)}
            reduzirMovimento={reduzirMovimento}
          />
        ))}
      </View>

      {!!aviso && <Text style={styles.aviso}>{aviso}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md, width: '100%' },
  topo: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  progresso: { flex: 1, gap: spacing.xs },
  progressoTexto: { ...typography.caption, color: colors.textMuted, fontWeight: '600' },
  barra: { height: 8, borderRadius: radius.pill, backgroundColor: colors.border, overflow: 'hidden' },
  barraCheia: { height: '100%', borderRadius: radius.pill },
  cena: { alignItems: 'center', gap: spacing.md },
  cenaLarga: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.lg },
  balao: { alignSelf: 'stretch' },
  balaoLargo: { flex: 1, marginTop: spacing.md },
  fala: { gap: spacing.sm },
  falaMascote: { ...typography.bodyBold, color: colors.textMuted },
  pergunta: { ...typography.subtitle, color: colors.text },
  rodapeBalao: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  categoria: { ...typography.caption, color: colors.textMuted, fontWeight: '600', flexShrink: 1 },
  valor: { ...typography.caption, color: colors.textMuted, fontWeight: '600' },
  alternativas: { gap: spacing.sm + 2 },
  aviso: { ...typography.body, color: colors.danger, textAlign: 'center' },
});
