import { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState } from '../../components/EmptyState';
import { LoadingView } from '../../components/LoadingView';
import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { useMeusFilhos } from '../../hooks/useFilhos';
import { colors, radius, spacing, typography } from '../../theme';

export function HomePaiScreen({ navigation }) {
  const { data: filhos = [], isLoading, refetch, isRefetching } = useMeusFilhos();
  const [busca, setBusca] = useState('');

  const filhosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return filhos;
    return filhos.filter((item) => item.nome?.toLowerCase().includes(termo));
  }, [filhos, busca]);

  if (isLoading) return <LoadingView />;

  return (
    <View style={styles.container}>
      {filhos.length > 0 ? (
        <View style={styles.filtros}>
          <TextField value={busca} onChangeText={setBusca} placeholder="Buscar filho..." style={styles.buscaField} />
        </View>
      ) : null}

      <FlatList
        data={filhosFiltrados}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          filhos.length === 0 ? (
            <EmptyState
              icon="people-outline"
              title="Nenhum filho cadastrado"
              subtitle='Toque em "Cadastrar filho" para começar.'
            />
          ) : (
            <EmptyState icon="search-outline" title="Nenhum resultado para o filtro aplicado" />
          )
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
              <View style={styles.cardNameRow}>
                <Text style={styles.cardName}>{item.nome}</Text>
                <View style={[styles.statusBadge, item.ativo ? styles.statusBadgeAtivo : styles.statusBadgeInativo]}>
                  <Text style={[styles.statusText, item.ativo ? styles.statusTextAtivo : styles.statusTextInativo]}>
                    {item.ativo ? 'Ativo' : 'Inativo'}
                  </Text>
                </View>
              </View>
              <Text style={styles.cardHint}>Ver tarefas, pontos e recompensas</Text>
            </View>
            <Pressable
              onPress={() =>
                navigation.navigate('EditarFilho', {
                  filhoId: item.id,
                  nome: item.nome,
                  email: item.email,
                  ativo: item.ativo,
                })
              }
              hitSlop={8}
              style={styles.editIcon}
            >
              <Ionicons name="create-outline" size={20} color={colors.primary} />
            </Pressable>
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
  filtros: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  buscaField: { marginBottom: 0 },
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
  editIcon: { padding: spacing.xs },
  cardNameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardName: { ...typography.subtitle, color: colors.text },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.pill },
  statusBadgeAtivo: { backgroundColor: colors.successBg },
  statusBadgeInativo: { backgroundColor: colors.dangerBg },
  statusText: { ...typography.caption, fontWeight: '700' },
  statusTextAtivo: { color: colors.success },
  statusTextInativo: { color: colors.danger },
  cardHint: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  footer: { padding: spacing.lg },
});
