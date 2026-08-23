import { Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { LoadingView } from '../../components/LoadingView';
import { EmptyState } from '../../components/EmptyState';
import { useMeuPerfil } from '../../hooks/useUsuario';
import { useAuthStore } from '../../store/authStore';
import { PerfilUsuarioLabel } from '../../constants/enums';
import { colors, radius, spacing, typography } from '../../theme';

export function PerfilScreen() {
  const { data: perfil, isLoading, isError } = useMeuPerfil();
  const logout = useAuthStore((state) => state.logout);

  if (isLoading) return <LoadingView />;

  if (isError || !perfil) {
    return (
      <ScreenContainer>
        <EmptyState icon="alert-circle-outline" title="Não foi possível carregar seu perfil" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.avatar}>
        <Ionicons name="person" size={36} color={colors.primary} />
      </View>

      <Card style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Nome</Text>
          <Text style={styles.value}>{perfil.nome}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>E-mail</Text>
          <Text style={styles.value}>{perfil.email}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>Perfil</Text>
          <Text style={styles.value}>{PerfilUsuarioLabel[perfil.perfil] ?? '—'}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>Conta</Text>
          <Text style={styles.value}>{perfil.ativo ? 'Ativa' : 'Inativa'}</Text>
        </View>
      </Card>

      <Button title="Sair" variant="secondary" onPress={() => logout()} style={styles.logoutButton} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    backgroundColor: colors.warningBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  card: { gap: spacing.sm },
  row: { paddingVertical: spacing.xs },
  label: { ...typography.caption, color: colors.textMuted },
  value: { ...typography.bodyBold, color: colors.text, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.border },
  logoutButton: { marginTop: spacing.lg },
});
