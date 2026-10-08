import { useEffect, useRef } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { MascoteQuestionario, HUMORES } from '../../components/mascote/MascoteQuestionario';
import { BalaoPergunta } from '../../components/questionario/BalaoPergunta';
import { IntroducaoQuestionario } from '../../components/questionario/IntroducaoQuestionario';
import { QuestionarioJogo } from '../../components/questionario/QuestionarioJogo';
import { ResultadoQuestionario } from '../../components/questionario/ResultadoQuestionario';
import { FASES, useQuestionario } from '../../hooks/useQuestionario';
import { useReduzirMovimento } from '../../hooks/useReduzirMovimento';
import { colors, spacing, typography } from '../../theme';
import { useTema } from '../../store/preferenciasStore';

const LARGURA_MAXIMA = 640;
const LARGURA_TELA_LARGA = 600;

// Módulo de jogos: questionário gamificado em que o mascote faz as perguntas,
// reage à resposta e explica o porquê. As perguntas vêm da API (bancoQuestionario).
export function JogosScreen() {
  const tema = useTema();
  const reduzirMovimento = useReduzirMovimento();
  const jogo = useQuestionario({ reduzirMovimento });
  const { fase, indice } = jogo;
  const scroll = useRef(null);

  const { width } = useWindowDimensions();
  const largo = width >= LARGURA_TELA_LARGA;
  // No celular o mascote fica acima do balão e não pode roubar muito espaço.
  const mascoteJogo = largo ? 190 : Math.round(Math.min(140, width * 0.36));
  const mascoteDestaque = largo ? 220 : Math.round(Math.min(190, width * 0.5));

  // Nova pergunta, feedback ou resultado: volta ao topo, onde o mascote fala.
  useEffect(() => {
    if ([FASES.PERGUNTA, FASES.FEEDBACK, FASES.RESULTADO, FASES.CARREGANDO].includes(fase)) {
      scroll.current?.scrollTo({ y: 0, animated: !reduzirMovimento });
    }
  }, [fase, indice, reduzirMovimento]);

  function conteudo() {
    switch (fase) {
      case FASES.INTRO:
        return (
          <IntroducaoQuestionario
            onComecar={jogo.iniciar}
            larguraMascote={mascoteDestaque}
            reduzirMovimento={reduzirMovimento}
          />
        );
      case FASES.CARREGANDO:
        return (
          <View style={styles.centro}>
            <MascoteQuestionario humor={HUMORES.CURIOSO} largura={mascoteDestaque} reduzirMovimento={reduzirMovimento} />
            <BalaoPergunta reduzirMovimento={reduzirMovimento} style={styles.balao}>
              <Text style={styles.mensagem}>Preparando seu desafio...</Text>
              <ActivityIndicator color={tema.primary} />
            </BalaoPergunta>
          </View>
        );
      case FASES.FALHA_CARREGAMENTO:
        return (
          <View style={styles.centro}>
            <MascoteQuestionario
              humor={HUMORES.ENCORAJANDO}
              largura={mascoteDestaque}
              reduzirMovimento={reduzirMovimento}
            />
            <BalaoPergunta tom="erro" reduzirMovimento={reduzirMovimento} style={styles.balao}>
              <Text style={styles.mensagem}>Ops! Não consegui buscar as perguntas agora.</Text>
              <Text style={styles.detalhe}>Confira a internet e tente de novo.</Text>
            </BalaoPergunta>
            <View style={styles.botoes}>
              <Button title="TENTAR DE NOVO" onPress={jogo.iniciar} />
              <Button title="VOLTAR" variant="secondary" onPress={jogo.voltar} />
            </View>
          </View>
        );
      case FASES.RESULTADO:
        return (
          <ResultadoQuestionario
            pontos={jogo.pontos}
            respostas={jogo.respostas}
            onJogarNovamente={jogo.iniciar}
            onVoltar={jogo.voltar}
            larguraMascote={mascoteDestaque}
            reduzirMovimento={reduzirMovimento}
          />
        );
      default:
        return (
          <QuestionarioJogo
            jogo={jogo}
            largo={largo}
            larguraMascote={mascoteJogo}
            reduzirMovimento={reduzirMovimento}
          />
        );
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <ScrollView ref={scroll} contentContainerStyle={styles.scroll}>
        <View style={styles.conteudo}>{conteudo()}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, padding: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.xl },
  conteudo: { width: '100%', maxWidth: LARGURA_MAXIMA, alignSelf: 'center', flexGrow: 1 },
  centro: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  balao: { alignSelf: 'stretch', alignItems: 'center' },
  mensagem: { ...typography.subtitle, color: colors.text, textAlign: 'center' },
  detalhe: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
  botoes: { alignSelf: 'stretch', gap: spacing.sm },
});
