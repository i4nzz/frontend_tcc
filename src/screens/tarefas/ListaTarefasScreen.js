import { FlatList, Pressable, Text, View, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { StatusBadge } from '../../components/StatusBadge';
import { EmptyState } from '../../components/EmptyState';
import { LoadingView } from '../../components/LoadingView';
import { useTarefas, useTarefasPorFilho } from '../../hooks/useTarefas';
import { useAuthStore } from '../../store/authStore';
import { colors, radius, spacing, typography } from '../../theme';

function formatarPrazo(prazoIso) {
  return new Date(prazoIso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function ListaTarefasScreen({ route, navigation }) {
  const { filhoId, nomeFilho } = route.params;
  const perfil = useAuthStore((state) => state.user?.perfil);
  const isPai = perfil === 'Pai';

  const porFilhoQuery = useTarefasPorFilho(isPai ? filhoId : undefined);
  const todasQuery = useTarefas({ enabled: !isPai });
  const { data: tarefas = [], isLoading, refetch, isRefetching } = isPai ? porFilhoQuery : todasQuery;

  if (isLoading) return <LoadingView />;

  return (
    <View style={styles.container}>
      <FlatList
        data={tarefas}
        keyExtractor={(item) => String(item.tarefaId)}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="checkbox-outline"
            title="Nenhuma tarefa ainda"
            subtitle={
              isPai
                ? 'Toque em "Nova tarefa" para criar a primeira.'
                : 'Quando seu responsável criar uma tarefa, ela aparece aqui.'
            }
          />
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
