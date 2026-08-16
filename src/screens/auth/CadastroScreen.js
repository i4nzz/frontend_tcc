import { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { TextField } from '../../components/TextField';
import { Button } from '../../components/Button';
import { FormError } from '../../components/FormError';
import { cadastrarPai } from '../../api/usuario';
import { colors, spacing, typography } from '../../theme';

export function CadastroScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleCadastro() {
    setError(null);
    if (nome.trim().length < 3) {
      setError('Nome deve ter pelo menos 3 caracteres.');
      return;
    }
    if (senha.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      await cadastrarPai({ nome: nome.trim(), email: email.trim(), senha });
      navigation.replace('VerifiqueEmail', { email: email.trim() });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer>
      <Text style={styles.subtitle}>Crie sua conta de responsável</Text>
      <FormError message={error} />
      <TextField label="Nome" value={nome} onChangeText={setNome} placeholder="Seu nome" />
      <TextField
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="seuemail@exemplo.com"
      />
      <TextField
        label="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        placeholder="Mínimo 6 caracteres"
      />
      <Button title="Criar conta" onPress={handleCadastro} loading={loading} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  subtitle: { ...typography.body, color: colors.textMuted, marginBottom: spacing.lg },
});
