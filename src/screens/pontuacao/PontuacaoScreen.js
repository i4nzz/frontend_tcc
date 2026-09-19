import { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View, StyleSheet } from 'react-native';
import { EmptyState } from '../../components/EmptyState';
import { LoadingView } from '../../components/LoadingView';
import { PointsPill } from '../../components/PointsPill';
import { TextField } from '../../components/TextField';
import { usePontuacaoPorFilho, useSaldoTotal } from '../../hooks/usePontuacao';
import { colors, radius, spacing, typography } from '../../theme';

function formatarData(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const PERIODOS = [
  { label: 'Tudo', dias: null },
  { label: '7 dias', dias: 7 },
  { label: '30 dias', dias: 30 },
  { label: '90 dias', dias: 90 },
];

export function PontuacaoScreen({ route }) {
  const { filhoId } = route.params;
  const {
    data: saldo = 0,
    isLoading: loadingSaldo,
    refetch: refetchSaldo,
    isRefetching: refetchingSaldo,
  } = useSaldoTotal(filhoId);
  const {
    data: historico = [],
    isLoading: loadingHistorico,
    refetch: refetchHistorico,
    isRefetching: refetchingHistorico,
  } = usePontuacaoPorFilho(filhoId);

  const [busca, setBusca] = useState('');
  const [periodoDias, setPeriodoDias] = useState(null);

  const historicoFiltrado = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const limite = periodoDias ? Date.now() - periodoDias * 24 * 60 * 60 * 1000 : null;

    return historico.filter((item) => {
      const combinaTermo = !termo || item.tituloTarefa?.toLowerCase().includes(termo);
      const combinaPeriodo = !limite || new Date(item.dataRegistro).getTime() >= limite;
      return combinaTermo && combinaPeriodo;
    });
  }, [historico, busca, periodoDias]);

  if (loadingSaldo || loadingHistorico) return <LoadingView />;

  function handleRefresh() {
    refetchSaldo();
    refetchHistorico();
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerLabel}>Saldo atual</Text>
        <PointsPill points={saldo} style={styles.pill} />
      </View>

      {historico.length > 0 ? (
        <View style={styles.filtros}>
          <TextField
            value={busca}
            onChangeText={setBusca}
            placeholder="Buscar por tarefa..."
            style={styles.buscaField}
          />
          <View style={styles.chipRow}>
            {PERIODOS.map((periodo) => (
              <Pressable
                key={periodo.label}
                onPress={() => setPeriodoDias(periodo.dias)}
                style={[styles.chip, periodoDias === periodo.dias && styles.chipSelected]}
              >
                <Text style={[styles.chipText, periodoDias === periodo.dias && styles.chipTextSelected]}>
                  {periodo.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      <FlatList
        data={historicoFiltrado}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl refreshing={refetchingSaldo || refetchingHistorico} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          historico.length === 0 ? (
            <EmptyState
              icon="star-outline"
              title="Nenhum ponto ganho ainda"
              subtitle="Complete tarefas para começar a pontuar."
            />
          ) : (
            <EmptyState icon="search-outline" title="Nenhum resultado para o filtro aplicado" />
          )
        }
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle} numberOfLines={1}>
                {item.tituloTarefa}
              </Text>
              <Text style={styles.itemDate}>{formatarData(item.dataRegistro)}</Text>
            </View>
            <Text style={styles.itemPontos}>+{item.pontos} pts</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg, alignItems: 'center', gap: spacing.sm },
  headerLabel: { ...typography.body, color: colors.textMuted },
  pill: { alignSelf: 'center' },
  filtros: { paddingHorizontal: spacing.lg },
  buscaField: { marginBottom: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  chip: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
  },
  chipSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
  chipText: { ...typography.body, color: colors.text },
  chipTextSelected: { color: colors.onPrimary, fontWeight: '700' },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, flexGrow: 1 },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  itemInfo: { flexShrink: 1, marginRight: spacing.sm },
  itemTitle: { ...typography.bodyBold, color: colors.text },
  itemDate: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  itemPontos: { ...typography.bodyBold, color: colors.success },
});
