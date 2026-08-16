import { useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { TextField } from '../../components/TextField';
import { Button } from '../../components/Button';
import { FormError } from '../../components/FormError';
import { useAuthStore } from '../../store/authStore';
import { colors, spacing, typography } from '../../theme';

export function LoginScreen({ navigation }) {
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError(null);
    if (!email.trim() || !senha) {
      setError('Preencha e-mail e senha.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), senha);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer style={styles.content}>
      <Text style={styles.title}>Task Kids</Text>
      <Text style={styles.subtitle}>Entre para continuar</Text>

      <FormError message={error} />

      <TextField
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="seuemail@exemplo.com"
      />
      <TextField label="Senha" value={senha} onChangeText={setSenha} secureTextEntry placeholder="Sua senha" />

      <Button title="Entrar" onPress={handleLogin} loading={loading} style={styles.loginButton} />

      <View style={styles.links}>
        <Text style={styles.linkText} onPress={() => navigation.navigate('EsqueciSenha')}>
          Esqueci minha senha
        </Text>
        <Text style={styles.linkText} onPress={() => navigation.navigate('Cadastro')}>
          Criar conta
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'center' },
  title: { ...typography.title, color: colors.primary, textAlign: 'center', marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.xl },
  loginButton: { marginTop: spacing.sm },
  links: { marginTop: spacing.lg, gap: spacing.md, alignItems: 'center' },
  linkText: { ...typography.bodyBold, color: colors.primary },
});
