import { useState } from 'react';
import { Alert, FlatList, RefreshControl, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { LoadingView } from '../../components/LoadingView';
import { FormError } from '../../components/FormError';
import { useRecompensasPorFilho, useRemoverRecompensa, useResgatarRecompensa } from '../../hooks/useRecompensas';
import { useSaldoTotal } from '../../hooks/usePontuacao';
import { useAuthStore } from '../../store/authStore';
import { colors, radius, spacing, typography } from '../../theme';

export function RecompensasScreen({ route, navigation }) {
  const { filhoId } = route.params;
  const perfil = useAuthStore((state) => state.user?.perfil);
  const isPai = perfil === 'Pai';

  const { data: recompensas = [], isLoading, refetch, isRefetching } = useRecompensasPorFilho(filhoId);
  const { data: saldo = 0 } = useSaldoTotal(filhoId);
  const removerRecompensa = useRemoverRecompensa(filhoId);
  const resgatarRecompensa = useResgatarRecompensa(filhoId);
  const [error, setError] = useState(null);

  if (isLoading) return <LoadingView />;

  function handleRemover(recompensa) {
    const mensagem = recompensa.ativa
      ? `Desativar a recompensa "${recompensa.descricao}"?`
      : `Remover definitivamente "${recompensa.descricao}"? Essa ação não pode ser desfeita.`;
    Alert.alert('Remover recompensa', mensagem, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: recompensa.ativa ? 'Desativar' : 'Remover',
        style: 'destructive',
        onPress: async () => {
          setError(null);
          try {
            await removerRecompensa.mutateAsync(recompensa.id);
          } catch (err) {
            setError(err.message);
          }
        },
      },
    ]);
  }

  function handleResgatar(recompensa) {
    Alert.alert('Resgatar recompensa', `Trocar ${recompensa.pontosNecessarios} pontos por "${recompensa.descricao}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Resgatar',
        onPress: async () => {
          setError(null);
          try {
            await resgatarRecompensa.mutateAsync({ recompensaId: recompensa.id });
          } catch (err) {
            setError(err.message);
          }
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <FormError message={error} />
      <FlatList
        data={recompensas}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="gift-outline"
            title="Nenhuma recompensa cadastrada"
            subtitle={
              isPai ? 'Toque em "Nova recompensa" para criar.' : 'Peça pro seu responsável cadastrar recompensas.'
            }
          />
        }
        renderItem={({ item }) => {
          const podeResgatar = !isPai && item.ativa && saldo >= item.pontosNecessarios;
          return (
            <View style={[styles.card, !item.ativa && styles.cardInativa]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {item.descricao || 'Recompensa'}
                </Text>
                <View style={styles.pointsBadge}>
                  <Ionicons name="star" size={14} color={colors.star} />
                  <Text style={styles.pointsText}>{item.pontosNecessarios}</Text>
                </View>
              </View>
              {!item.ativa ? <Text style={styles.inativaLabel}>Inativa</Text> : null}

              <View style={styles.cardActions}>
                {isPai ? (
                  <>
                    <Button
                      title="Editar"
                      variant="secondary"
                      onPress={() => navigation.navigate('CriarEditarRecompensa', { recompensaId: item.id, filhoId })}
                      style={styles.actionButton}
                    />
                    <Button
                      title={item.ativa ? 'Desativar' : 'Remover'}
                      variant="danger"
                      onPress={() => handleRemover(item)}
                      style={styles.actionButton}
                    />
                  </>
                ) : (
                  <Button
                    title="Resgatar"
                    onPress={() => handleResgatar(item)}
                    disabled={!podeResgatar}
                    loading={resgatarRecompensa.isPending}
                    style={styles.actionButton}
                  />
                )}
              </View>
            </View>
          );
        }}
      />
      {isPai ? (
        <View style={styles.footer}>
          <Button title="Nova recompensa" onPress={() => navigation.navigate('CriarEditarRecompensa', { filhoId })} />
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
  cardInativa: { opacity: 0.6 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  cardTitle: { ...typography.subtitle, color: colors.text, flex: 1 },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.warningBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  pointsText: { ...typography.bodyBold, color: colors.text },
  inativaLabel: { ...typography.caption, color: colors.danger, marginTop: spacing.xs },
  cardActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  actionButton: { flex: 1 },
  footer: { padding: spacing.lg, backgroundColor: colors.background },
});
