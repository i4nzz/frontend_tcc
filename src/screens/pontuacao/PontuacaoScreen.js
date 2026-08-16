import { FlatList, RefreshControl, Text, View, StyleSheet } from 'react-native';
import { EmptyState } from '../../components/EmptyState';
import { LoadingView } from '../../components/LoadingView';
import { PointsPill } from '../../components/PointsPill';
import { usePontuacaoPorFilho, useSaldoTotal } from '../../hooks/usePontuacao';
import { colors, radius, spacing, typography } from '../../theme';

function formatarData(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

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

      <FlatList
        data={historico}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl refreshing={refetchingSaldo || refetchingHistorico} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="star-outline"
            title="Nenhum ponto ganho ainda"
            subtitle="Complete tarefas para começar a pontuar."
          />
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
