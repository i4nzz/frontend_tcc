import { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { TextField } from '../../components/TextField';
import { Button } from '../../components/Button';
import { FormError } from '../../components/FormError';
import { esqueciSenha } from '../../api/usuario';
import { colors, spacing, typography } from '../../theme';

export function EsqueciSenhaScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    setError(null);
    if (!email.trim()) {
      setError('Informe seu e-mail.');
      return;
    }
    setLoading(true);
    try {
      await esqueciSenha(email.trim());
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <ScreenContainer style={styles.centered}>
        <Text style={styles.title}>Verifique seu e-mail</Text>
        <Text style={styles.body}>
          Se esse e-mail estiver cadastrado, você vai receber um link para redefinir sua senha.
        </Text>
        <Button title="Voltar para o login" onPress={() => navigation.replace('Login')} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Text style={styles.subtitle}>Enviaremos um link de redefinição para o seu e-mail.</Text>
      <FormError message={error} />
      <TextField
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="seuemail@exemplo.com"
      />
      <Button title="Enviar link" onPress={handleSubmit} loading={loading} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  subtitle: { ...typography.body, color: colors.textMuted, marginBottom: spacing.lg },
  centered: { justifyContent: 'center', alignItems: 'center' },
  title: { ...typography.title, color: colors.text, marginBottom: spacing.sm, textAlign: 'center' },
  body: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.xl },
});
