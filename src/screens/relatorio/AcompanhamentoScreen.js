import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { LoadingView } from '../../components/LoadingView';
import { BarraEmpilhada } from '../../components/relatorio/BarraEmpilhada';
import { GraficoSemanal } from '../../components/relatorio/GraficoSemanal';
import { useRelatorioFilho } from '../../hooks/useRelatorio';
import { useResumoFinanceiro } from '../../hooks/useFinanceiro';
import { categoriaDoQuestionario } from '../../constants/questionario';
import { colors, radius, spacing, typography } from '../../theme';
import { useTema } from '../../store/preferenciasStore';

const PERIODOS = [
  { label: '7 dias', dias: 7 },
  { label: '30 dias', dias: 30 },
  { label: 'Tudo', dias: null },
];

// Cores por status, na ordem validada para daltonismo (verde, âmbar, azul,
// vermelho). Acerto/erro usam verde e âmbar: verde x vermelho se confundem.
const COR_CONCLUIDA = colors.success;
const COR_AGUARDANDO = colors.warning;
const COR_PENDENTE = colors.sky;
const COR_EXPIRADA = colors.danger;
const COR_ACERTO = colors.success;
const COR_ERRO = colors.warning;

// Categoria com poucas respostas ainda não diz muito; abaixo disso não é marcada.
const MINIMO_PARA_REFORCO = 3;
const LIMITE_REFORCO = 60;

function formatarValor(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarDataHora(iso) {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function quandoFoi(iso) {
  if (!iso) return 'Ainda não jogou';
  const minutos = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutos < 1) return 'Jogou agora mesmo';
  if (minutos < 60) return `Jogou há ${minutos} min`;
  const horas = Math.round(minutos / 60);
  if (horas < 24) return `Jogou há ${horas} h`;
  const dias = Math.round(horas / 24);
  return `Jogou há ${dias} ${dias === 1 ? 'dia' : 'dias'}`;
}

function Indicador({ valor, rotulo, destaque }) {
  return (
    <View style={styles.indicador}>
      <Text style={[styles.indicadorValor, destaque && { color: destaque }]}>{valor}</Text>
      <Text style={styles.indicadorRotulo}>{rotulo}</Text>
    </View>
  );
}

// Acompanhamento do filho, só para o responsável: tarefas, questionário e mesada.
export function AcompanhamentoScreen({ route, navigation }) {
  const tema = useTema();
  const { filhoId } = route.params;
  const [dias, setDias] = useState(30);
  const telaVisivel = useIsFocused();

  const { data: relatorio, isLoading, isError, refetch, isRefetching, dataUpdatedAt } = useRelatorioFilho(
    filhoId,
    dias,
    { telaVisivel }
  );
  const { data: resumoFinanceiro, refetch: refetchFinanceiro } = useResumoFinanceiro(filhoId);

  // Ao voltar para a aba, busca de novo: o filho pode ter jogado nesse meio tempo.
  useFocusEffect(
    useCallback(() => {
      refetch();
      refetchFinanceiro();
    }, [refetch, refetchFinanceiro])
  );

  if (isLoading) return <LoadingView />;

  if (isError || !relatorio) {
    return (
      <View style={[styles.container, styles.content]}>
        <EmptyState icon="cloud-offline-outline" title="Não foi possível carregar o acompanhamento" />
        <Button title="Tentar de novo" variant="secondary" onPress={() => refetch()} />
      </View>
    );
  }

  const { tarefas, questionario } = relatorio;
  const jogouNaSemana = questionario.ultimosSeteDias.some((d) => d.acertos + d.erros > 0);
  const maiorGasto = resumoFinanceiro?.gastosPorCategoria?.length
    ? [...resumoFinanceiro.gastosPorCategoria].sort((a, b) => b.total - a.total)[0]
    : null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={() => {
            refetch();
            refetchFinanceiro();
          }}
        />
      }
    >
      <View style={styles.periodos}>
        {PERIODOS.map((periodo) => {
          const ativo = periodo.dias === dias;
          return (
            <Pressable
              key={periodo.label}
              onPress={() => setDias(periodo.dias)}
              accessibilityRole="button"
              accessibilityState={{ selected: ativo }}
              style={[styles.chip, ativo && { borderColor: tema.primary, backgroundColor: tema.primary }]}
            >
              <Text style={[styles.chipTexto, ativo && styles.chipTextoAtivo]}>{periodo.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.atualizado}>
        <Ionicons name="sync-outline" size={12} color={colors.textMuted} /> Atualiza sozinho · última atualização às{' '}
        {new Date(dataUpdatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
      </Text>

      {/* ------------------------------------------------------------ tarefas */}
      <Card style={styles.secao}>
        <View style={styles.cabecalho}>
          <Ionicons name="checkbox-outline" size={20} color={tema.primary} />
          <Text style={styles.titulo}>Tarefas</Text>
        </View>

        {tarefas.total === 0 ? (
          <Text style={styles.vazio}>Nenhuma tarefa com prazo neste período.</Text>
        ) : (
          <>
            <Text style={styles.destaque}>
              <Text style={styles.destaqueNumero}>{tarefas.percentualConcluidas}%</Text> concluídas ({tarefas.concluidas} de{' '}
              {tarefas.total})
            </Text>
            <BarraEmpilhada
              rotuloAcessivel={`${tarefas.concluidas} concluídas, ${tarefas.aguardandoValidacao} aguardando validação, ${tarefas.pendentes} pendentes, ${tarefas.expiradas} expiradas`}
              itens={[
                { chave: 'concluidas', rotulo: 'Concluídas', valor: tarefas.concluidas, cor: COR_CONCLUIDA },
                { chave: 'aguardando', rotulo: 'Aguardando você', valor: tarefas.aguardandoValidacao, cor: COR_AGUARDANDO },
                { chave: 'pendentes', rotulo: 'Pendentes', valor: tarefas.pendentes, cor: COR_PENDENTE },
                { chave: 'expiradas', rotulo: 'Expiradas', valor: tarefas.expiradas, cor: COR_EXPIRADA },
              ]}
            />
          </>
        )}

        <View style={styles.indicadores}>
          <Indicador valor={tarefas.comprovacoesAprovadas} rotulo="Fotos aprovadas" />
          <Indicador valor={tarefas.comprovacoesReprovadas} rotulo="Fotos reprovadas" />
          <Indicador valor={tarefas.pontosGanhos} rotulo="Pontos ganhos" />
        </View>

        {tarefas.aguardandoValidacao > 0 && (
          <View style={styles.aviso}>
            <Ionicons name="time-outline" size={16} color={colors.text} />
            <Text style={styles.avisoTexto}>
              {tarefas.aguardandoValidacao === 1
                ? '1 tarefa espera a sua validação.'
                : `${tarefas.aguardandoValidacao} tarefas esperam a sua validação.`}
            </Text>
          </View>
        )}
      </Card>

      {/* ------------------------------------------------------- questionário */}
      <Card style={styles.secao}>
        <View style={styles.cabecalho}>
          <Ionicons name="game-controller-outline" size={20} color={tema.primary} />
          <Text style={styles.titulo}>Questionário</Text>
          <Text style={styles.cabecalhoExtra}>{quandoFoi(questionario.ultimaAtividade)}</Text>
        </View>

        {questionario.totalRespostas === 0 && !jogouNaSemana ? (
          <Text style={styles.vazio}>Ainda não há respostas neste período. Quando seu filho jogar, aparece aqui.</Text>
        ) : (
          <>
            <View style={styles.indicadores}>
              <Indicador valor={`${questionario.percentualAcerto}%`} rotulo="de acertos" destaque={tema.primary} />
              <Indicador valor={questionario.totalRespostas} rotulo="respostas" />
              <Indicador valor={questionario.diasJogados} rotulo={questionario.diasJogados === 1 ? 'dia jogado' : 'dias jogados'} />
            </View>

            <Text style={styles.subtitulo}>Últimos 7 dias</Text>
            <View style={styles.legendaLinha}>
              <View style={[styles.marcador, { backgroundColor: COR_ACERTO }]} />
              <Text style={styles.legendaTexto}>Acertos</Text>
              <View style={[styles.marcador, { backgroundColor: COR_ERRO }]} />
              <Text style={styles.legendaTexto}>Erros</Text>
            </View>
            <GraficoSemanal dias={questionario.ultimosSeteDias} corAcerto={COR_ACERTO} corErro={COR_ERRO} />

            {questionario.porCategoria.length > 0 && (
              <>
                <Text style={styles.subtitulo}>Por assunto</Text>
                {questionario.porCategoria.map((categoria) => {
                  const { emoji, nome } = categoriaDoQuestionario(categoria.categoria);
                  const reforcar =
                    categoria.total >= MINIMO_PARA_REFORCO && categoria.percentualAcerto < LIMITE_REFORCO;
                  return (
                    <View key={categoria.categoria} style={styles.categoria}>
                      <View style={styles.categoriaLinha}>
                        <Text style={styles.categoriaNome}>
                          {emoji} {nome}
                        </Text>
                        <Text style={styles.categoriaValor}>
                          {categoria.acertos}/{categoria.total} · {categoria.percentualAcerto}%
                        </Text>
                      </View>
                      <View style={styles.trilho}>
                        <View
                          style={[styles.preenchido, { width: `${categoria.percentualAcerto}%`, backgroundColor: COR_ACERTO }]}
                        />
                      </View>
                      {reforcar && (
                        <View style={styles.reforco}>
                          <Ionicons name="bulb-outline" size={14} color={colors.text} />
                          <Text style={styles.reforcoTexto}>Bom assunto para conversar em casa</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </>
            )}

            {questionario.ultimasRespostas.length > 0 && (
              <>
                <Text style={styles.subtitulo}>Últimas respostas</Text>
                {questionario.ultimasRespostas.map((resposta, i) => (
                  <View key={`${resposta.dataResposta}-${i}`} style={styles.resposta}>
                    <View style={[styles.respostaIcone, { backgroundColor: resposta.correta ? COR_ACERTO : COR_ERRO }]}>
                      <Ionicons name={resposta.correta ? 'checkmark' : 'close'} size={14} color={colors.onPrimary} />
                    </View>
                    <View style={styles.respostaInfo}>
                      <Text style={styles.respostaPergunta}>{resposta.pergunta}</Text>
                      <Text style={styles.respostaDetalhe}>
                        {resposta.correta ? 'Acertou: ' : 'Respondeu: '}
                        <Text style={styles.respostaForte}>{resposta.respostaEscolhida}</Text>
                      </Text>
                      {!resposta.correta && (
                        <Text style={styles.respostaDetalhe}>
                          Certa: <Text style={styles.respostaForte}>{resposta.respostaCorreta}</Text>
                        </Text>
                      )}
                      <Text style={styles.respostaData}>
                        {categoriaDoQuestionario(resposta.categoria).nome} · {formatarDataHora(resposta.dataResposta)}
                      </Text>
                    </View>
                  </View>
                ))}
              </>
            )}
          </>
        )}
      </Card>

      {/* -------------------------------------------------------------- mesada */}
      {resumoFinanceiro && (resumoFinanceiro.totalMesadas > 0 || resumoFinanceiro.totalGasto > 0) && (
        <Card style={styles.secao}>
          <View style={styles.cabecalho}>
            <Ionicons name="wallet-outline" size={20} color={tema.primary} />
            <Text style={styles.titulo}>Mesada</Text>
          </View>
          <View style={styles.indicadores}>
            <Indicador valor={formatarValor(resumoFinanceiro.totalGasto)} rotulo="gasto" />
            <Indicador valor={formatarValor(resumoFinanceiro.saldoDisponivel)} rotulo="saldo" />
          </View>
          {maiorGasto && (
            <Text style={styles.vazio}>
              Maior gasto: <Text style={styles.respostaForte}>{maiorGasto.nomeCategoria}</Text> (
              {maiorGasto.percentual.toFixed(0)}% do total)
            </Text>
          )}
          <Pressable onPress={() => navigation.navigate('Financeiro')} style={styles.link} accessibilityRole="link">
            <Text style={[styles.linkTexto, { color: tema.primary }]}>Ver gastos por categoria</Text>
            <Ionicons name="chevron-forward" size={16} color={tema.primary} />
          </Pressable>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md },
  periodos: { flexDirection: 'row', gap: spacing.sm },
  chip: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
  },
  chipTexto: { ...typography.body, color: colors.text },
  chipTextoAtivo: { color: colors.onPrimary, fontWeight: '700' },
  atualizado: { ...typography.caption, color: colors.textMuted, marginTop: -spacing.xs },
  secao: { gap: spacing.md },
  cabecalho: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  titulo: { ...typography.subtitle, color: colors.text },
  cabecalhoExtra: { ...typography.caption, color: colors.textMuted, marginLeft: 'auto' },
  subtitulo: { ...typography.bodyBold, color: colors.text, marginTop: spacing.xs },
  vazio: { ...typography.body, color: colors.textMuted },
  destaque: { ...typography.body, color: colors.textMuted },
  destaqueNumero: { ...typography.title, color: colors.text },
  indicadores: { flexDirection: 'row', gap: spacing.sm },
  indicador: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  indicadorValor: { ...typography.subtitle, color: colors.text },
  indicadorRotulo: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },
  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.warningBg,
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  avisoTexto: { ...typography.caption, color: colors.text, fontWeight: '600', flex: 1 },
  legendaLinha: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: -spacing.sm },
  marcador: { width: 10, height: 10, borderRadius: 3 },
  legendaTexto: { ...typography.caption, color: colors.textMuted, marginRight: spacing.sm },
  categoria: { gap: 4 },
  categoriaLinha: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  categoriaNome: { ...typography.body, color: colors.text, flexShrink: 1 },
  categoriaValor: { ...typography.caption, color: colors.textMuted, fontWeight: '600' },
  trilho: { height: 8, borderRadius: radius.pill, backgroundColor: colors.border, overflow: 'hidden' },
  preenchido: { height: '100%', borderRadius: 4 },
  reforco: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  reforcoTexto: { ...typography.caption, color: colors.text },
  resposta: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  respostaIcone: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  respostaInfo: { flex: 1, gap: 2 },
  respostaPergunta: { ...typography.bodyBold, color: colors.text },
  respostaDetalhe: { ...typography.caption, color: colors.textMuted },
  respostaForte: { fontWeight: '700', color: colors.text },
  respostaData: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  link: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' },
  linkTexto: { ...typography.bodyBold },
});
