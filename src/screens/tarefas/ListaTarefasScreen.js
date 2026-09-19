import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { StatusBadge } from '../../components/StatusBadge';
import { EmptyState } from '../../components/EmptyState';
import { LoadingView } from '../../components/LoadingView';
import { TextField } from '../../components/TextField';
import { useTarefas, useTarefasPorFilho } from '../../hooks/useTarefas';
import { useAuthStore } from '../../store/authStore';
import { StatusTarefa, StatusValidacaoTarefa } from '../../constants/enums';
import { colors, radius, spacing, typography } from '../../theme';

function formatarPrazo(prazoIso) {
  return new Date(prazoIso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const PERIODOS = [
  { label: 'Tudo', dias: null },
  { label: '7 dias', dias: 7 },
  { label: '30 dias', dias: 30 },
  { label: '90 dias', dias: 90 },
];

const STATUS_FILTROS = [
  { label: 'Todas', valor: null },
  { label: 'Pendentes', valor: 'pendente' },
  { label: 'Aprovadas', valor: 'aprovada' },
  { label: 'Reprovadas', valor: 'reprovada' },
];

export function ListaTarefasScreen({ route, navigation }) {
  const { filhoId, nomeFilho } = route.params;
  const perfil = useAuthStore((state) => state.user?.perfil);
  const isPai = perfil === 'Pai';

  const porFilhoQuery = useTarefasPorFilho(isPai ? filhoId : undefined);
  const todasQuery = useTarefas({ enabled: !isPai });
  const { data: tarefas = [], isLoading, refetch, isRefetching } = isPai ? porFilhoQuery : todasQuery;

  const [busca, setBusca] = useState('');
  const [periodoDias, setPeriodoDias] = useState(null);
  const [statusFiltro, setStatusFiltro] = useState(null);

  const tarefasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const limite = periodoDias ? Date.now() - periodoDias * 24 * 60 * 60 * 1000 : null;

    return tarefas.filter((item) => {
      const combinaTermo = !termo || item.titulo?.toLowerCase().includes(termo);
      const combinaPeriodo = !limite || new Date(item.dataCriacao).getTime() >= limite;

      let combinaStatus = true;
      if (statusFiltro === 'aprovada') {
        combinaStatus = item.status === StatusTarefa.CONCLUIDA;
      } else if (statusFiltro === 'reprovada') {
        combinaStatus = item.ultimaComprovacaoStatus === StatusValidacaoTarefa.REPROVADA;
      } else if (statusFiltro === 'pendente') {
        combinaStatus = item.status === StatusTarefa.PENDENTE && item.ultimaComprovacaoStatus !== StatusValidacaoTarefa.REPROVADA;
      }

      return combinaTermo && combinaPeriodo && combinaStatus;
    });
  }, [tarefas, busca, periodoDias, statusFiltro]);

  if (isLoading) return <LoadingView />;

  return (
    <View style={styles.container}>
      {tarefas.length > 0 ? (
        <View style={styles.filtros}>
          <TextField value={busca} onChangeText={setBusca} placeholder="Buscar por tarefa..." style={styles.buscaField} />
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
          <View style={styles.chipRow}>
            {STATUS_FILTROS.map((status) => (
              <Pressable
                key={status.label}
                onPress={() => setStatusFiltro(status.valor)}
                style={[styles.chip, statusFiltro === status.valor && styles.chipSelected]}
              >
                <Text style={[styles.chipText, statusFiltro === status.valor && styles.chipTextSelected]}>
                  {status.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      <FlatList
        data={tarefasFiltradas}
        keyExtractor={(item) => String(item.tarefaId)}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          tarefas.length === 0 ? (
            <EmptyState
              icon="checkbox-outline"
              title="Nenhuma tarefa ainda"
              subtitle={
                isPai
                  ? 'Toque em "Nova tarefa" para criar a primeira.'
                  : 'Quando seu responsável criar uma tarefa, ela aparece aqui.'
              }
            />
          ) : (
            <EmptyState icon="search-outline" title="Nenhum resultado para o filtro aplicado" />
          )
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('DetalheTarefa', { tarefaId: item.tarefaId })}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.titulo}
              </Text>
              <StatusBadge status={item.status} type="tarefa" />
            </View>
            {item.descricao ? (
              <Text style={styles.cardDescricao} numberOfLines={2}>
                {item.descricao}
              </Text>
            ) : null}
            <View style={styles.cardFooter}>
              <View style={styles.pointsRow}>
                <Ionicons name="star" size={16} color={colors.star} />
                <Text style={styles.pointsText}>{item.pontos} pts</Text>
              </View>
              <Text style={styles.prazoText}>até {formatarPrazo(item.prazo)}</Text>
            </View>
          </Pressable>
        )}
      />
      {isPai ? (
        <View style={styles.footer}>
          <Button
            title="Nova tarefa"
            onPress={() => navigation.navigate('CriarEditarTarefa', { filhoId, nomeFilho })}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  filtros: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  buscaField: { marginBottom: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
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
  list: { padding: spacing.lg, flexGrow: 1 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardPressed: { opacity: 0.85 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  cardTitle: { ...typography.subtitle, color: colors.text, flexShrink: 1 },
  cardDescricao: { ...typography.body, color: colors.textMuted, marginTop: spacing.xs },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  pointsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  pointsText: { ...typography.bodyBold, color: colors.text },
  prazoText: { ...typography.caption, color: colors.textMuted },
  footer: { padding: spacing.lg, backgroundColor: colors.background },
});
