import { useState } from 'react';
import { Alert, Text, View, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { TextField } from '../../components/TextField';
import { Button } from '../../components/Button';
import { FormError } from '../../components/FormError';
import { useAtualizarUsuario, useAlterarStatusUsuario } from '../../hooks/useUsuario';
import { colors, spacing, typography } from '../../theme';

// Tela usada exclusivamente pelo Pai para editar os dados de um filho vinculado,
// e também para ativar/inativar a conta dele (o Filho não tem acesso a esta
// tela — ver PaiStackNavigator).
export function EditarFilhoScreen({ route, navigation }) {
  const { filhoId, nome: nomeInicial, email: emailInicial, ativo: ativoInicial } = route.params;
  const atualizarUsuario = useAtualizarUsuario();
  const alterarStatus = useAlterarStatusUsuario();
  const [nome, setNome] = useState(nomeInicial ?? '');
  const [email, setEmail] = useState(emailInicial ?? '');
  const [novaSenha, setNovaSenha] = useState('');
  const [ativo, setAtivo] = useState(ativoInicial ?? true);
  const [error, setError] = useState(null);

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
        id: filhoId,
        nome: nome.trim(),
        email: email.trim(),
        novaSenha: novaSenha || undefined,
      });
      navigation.goBack();
    } catch (err) {
      setError(err.message);
    }
  }

  function confirmarAlterarStatus() {
    const novoStatus = !ativo;
    Alert.alert(
      novoStatus ? 'Ativar conta' : 'Inativar conta',
      novoStatus
        ? `Deseja reativar a conta de ${nome}? Ele voltará a conseguir fazer login.`
        : `Deseja inativar a conta de ${nome}? Ele não conseguirá mais fazer login até ser reativado.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: novoStatus ? 'Ativar' : 'Inativar',
          style: novoStatus ? 'default' : 'destructive',
          onPress: async () => {
            setError(null);
            try {
              await alterarStatus.mutateAsync({ id: filhoId, ativo: novoStatus });
              setAtivo(novoStatus);
            } catch (err) {
              setError(err.message);
            }
          },
        },
      ],
    );
  }

  return (
    <ScreenContainer>
      <FormError message={error} />

      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Status da conta</Text>
        <Text style={[styles.statusValue, ativo ? styles.statusAtivo : styles.statusInativo]}>
          {ativo ? 'Ativo' : 'Inativo'}
        </Text>
      </View>
      <Button
        title={ativo ? 'Inativar conta' : 'Ativar conta'}
        variant={ativo ? 'danger' : 'secondary'}
        onPress={confirmarAlterarStatus}
        loading={alterarStatus.isPending}
        style={styles.statusButton}
      />

      <TextField label="Nome do filho" value={nome} onChangeText={setNome} placeholder="Nome completo" />
      <TextField
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="filho@exemplo.com"
      />
      <TextField
        label="Nova senha (opcional)"
        value={novaSenha}
        onChangeText={setNovaSenha}
        secureTextEntry
        placeholder="Deixe em branco para manter a atual"
      />
      <Button title="Salvar" onPress={salvar} loading={atualizarUsuario.isPending} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  statusLabel: { ...typography.bodyBold, color: colors.text },
  statusValue: { ...typography.bodyBold },
  statusAtivo: { color: colors.success },
  statusInativo: { color: colors.danger },
  statusButton: { marginBottom: spacing.lg },
});
