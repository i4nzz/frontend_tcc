import { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { TextField } from '../../components/TextField';
import { Button } from '../../components/Button';
import { FormError } from '../../components/FormError';
import { redefinirSenha } from '../../api/usuario';
import { colors, spacing, typography } from '../../theme';

export function RedefinirSenhaScreen({ route, navigation }) {
  const token = route.params?.token;
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [error, setError] = useState(token ? null : 'Link inválido: token não encontrado.');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit() {
    setError(null);
    if (!token) {
      setError('Link inválido: token não encontrado.');
      return;
    }
    if (novaSenha.length < 8) {
      setError('A nova senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setError('As senhas não coincidem.');
      return;
    }
    setLoading(true);
    try {
      await redefinirSenha({ token, novaSenha });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <ScreenContainer style={styles.centered}>
        <Text style={styles.title}>Senha redefinida!</Text>
        <Text style={styles.body}>Você já pode entrar com a nova senha.</Text>
        <Button title="Ir para o login" onPress={() => navigation.replace('Login')} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Text style={styles.subtitle}>Escolha uma nova senha.</Text>
      <FormError message={error} />
      <TextField
        label="Nova senha"
        value={novaSenha}
        onChangeText={setNovaSenha}
        secureTextEntry
        placeholder="Mínimo 8 caracteres"
      />
      <TextField
        label="Confirmar nova senha"
        value={confirmarSenha}
        onChangeText={setConfirmarSenha}
        secureTextEntry
        placeholder="Repita a senha"
      />
      <Button title="Salvar nova senha" onPress={handleSubmit} loading={loading} disabled={!token} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  subtitle: { ...typography.body, color: colors.textMuted, marginBottom: spacing.lg },
  centered: { justifyContent: 'center', alignItems: 'center' },
  title: { ...typography.title, color: colors.text, marginBottom: spacing.sm, textAlign: 'center' },
  body: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.xl },
});
