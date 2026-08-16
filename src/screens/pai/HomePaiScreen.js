import { FlatList, Pressable, RefreshControl, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState } from '../../components/EmptyState';
import { LoadingView } from '../../components/LoadingView';
import { Button } from '../../components/Button';
import { useMeusFilhos } from '../../hooks/useFilhos';
import { colors, radius, spacing, typography } from '../../theme';

export function HomePaiScreen({ navigation }) {
  const { data: filhos = [], isLoading, refetch, isRefetching } = useMeusFilhos();

  if (isLoading) return <LoadingView />;

  return (
    <View style={styles.container}>
      <FlatList
        data={filhos}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="people-outline"
            title="Nenhum filho cadastrado"
            subtitle='Toque em "Cadastrar filho" para começar.'
          />
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('FilhoArea', { filhoId: item.id, nomeFilho: item.nome })}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          >
            <View style={styles.avatar}>
              <Ionicons name="person" size={24} color={colors.primary} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{item.nome}</Text>
              <Text style={styles.cardHint}>Ver tarefas, pontos e recompensas</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </Pressable>
        )}
      />
      <View style={styles.footer}>
        <Button title="Cadastrar filho" onPress={() => navigation.navigate('CadastrarFilho')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg, flexGrow: 1 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  cardPressed: { opacity: 0.85 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.warningBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { flex: 1 },
  cardName: { ...typography.subtitle, color: colors.text },
  cardHint: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  footer: { padding: spacing.lg },
});
