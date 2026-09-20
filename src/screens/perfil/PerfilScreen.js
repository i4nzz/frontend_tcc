import { useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { FormError } from '../../components/FormError';
import { LoadingView } from '../../components/LoadingView';
import { EmptyState } from '../../components/EmptyState';
import { useMeuPerfil, useAtualizarUsuario } from '../../hooks/useUsuario';
import { useAuthStore } from '../../store/authStore';
import { PerfilUsuario, PerfilUsuarioLabel } from '../../constants/enums';
import { colors, radius, spacing, typography } from '../../theme';

export function PerfilScreen() {
  const { data: perfil, isLoading, isError } = useMeuPerfil();
  const logout = useAuthStore((state) => state.logout);
  const atualizarUsuario = useAtualizarUsuario();
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [error, setError] = useState(null);

  if (isLoading) return <LoadingView />;

  if (isError || !perfil) {
    return (
      <ScreenContainer>
        <EmptyState icon="alert-circle-outline" title="Não foi possível carregar seu perfil" />
      </ScreenContainer>
    );
  }

  // Somente o Pai pode editar suas próprias informações por aqui — o Filho tem
  // seus dados editados pelo Pai, não por esta tela (ver EditarFilhoScreen).
  const podeEditar = perfil.perfil === PerfilUsuario.PAI;

  function iniciarEdicao() {
    setNome(perfil.nome);
    setEmail(perfil.email);
    setNovaSenha('');
    setError(null);
    setEditando(true);
  }

  function cancelarEdicao() {
    setEditando(false);
    setError(null);
  }

  async function salvar() {
    setError(null);
    if (nome.trim().length < 3) {
      setError('Nome deve ter pelo menos 3 caracteres.');
      return;
    }
    if (novaSenha && novaSenha.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres.');
      return;
    }
    try {
      await atualizarUsuario.mutateAsync({
        id: perfil.id,
        nome: nome.trim(),
        email: email.trim(),
        novaSenha: novaSenha || undefined,
      });
      setEditando(false);
    } catch (err) {
      setError(err.message);
    }
  }

  if (editando) {
    return (
      <ScreenContainer>
        <FormError message={error} />
        <TextField label="Nome" value={nome} onChangeText={setNome} placeholder="Seu nome" />
        <TextField
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="voce@exemplo.com"
        />
        <TextField
          label="Nova senha (opcional)"
          value={novaSenha}
          onChangeText={setNovaSenha}
          secureTextEntry
          placeholder="Deixe em branco para manter a atual"
        />
        <Button title="Salvar" onPress={salvar} loading={atualizarUsuario.isPending} style={styles.saveButton} />
        <Button title="Cancelar" variant="secondary" onPress={cancelarEdicao} disabled={atualizarUsuario.isPending} />
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

      {podeEditar ? (
        <Button title="Editar perfil" variant="secondary" onPress={iniciarEdicao} style={styles.editButton} />
      ) : null}

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
  editButton: { marginTop: spacing.lg },
  saveButton: { marginBottom: spacing.sm },
  logoutButton: { marginTop: spacing.sm },
});
