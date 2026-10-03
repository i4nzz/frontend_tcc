import { useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { TextField } from '../../components/TextField';
import { Button } from '../../components/Button';
import { FormError } from '../../components/FormError';
import { MascoteLogin, useMascote } from '../../components/mascote';
import { useAuthStore } from '../../store/authStore';
import { colors, spacing, typography } from '../../theme';
import { useTema } from '../../store/preferenciasStore';

export function LoginScreen({ navigation }) {
  const tema = useTema();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [senhaFocada, setSenhaFocada] = useState(false);

  // Camada visual: só observa foco e toques, não interfere no formulário.
  const mascote = useMascote({ senhaFocada });

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
      {/* onStartShouldSetResponderCapture devolve false: o mascote lê onde foi o
          toque sem nunca virar responder, então campos e botões seguem normais. */}
      <View style={styles.area} {...mascote.observadorDeToques}>
        <Text style={[styles.brand, { color: tema.primary }]}>Caveat</Text>
        <Text style={styles.subtitle}>Entre para continuar</Text>

        <View style={styles.mascote}>
          <MascoteLogin controlador={mascote} />
        </View>

        <FormError message={error} />

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
          placeholder="Sua senha"
          onFocus={() => setSenhaFocada(true)}
          onBlur={() => setSenhaFocada(false)}
        />

        <Button title="Entrar" onPress={handleLogin} loading={loading} style={styles.loginButton} />

        <View style={styles.links}>
          <Text style={[styles.linkText, { color: tema.primary }]} onPress={() => navigation.navigate('EsqueciSenha')}>
            Esqueci minha senha
          </Text>
          <Text style={[styles.linkText, { color: tema.primary }]} onPress={() => navigation.navigate('Cadastro')}>
            Criar conta
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'center' },
  // flexGrow em vez de flex: dentro do contentContainer do ScrollView, flex: 1
  // pode colapsar quando a altura do conteúdo não é definida.
  area: { flexGrow: 1, justifyContent: 'center' },
  brand: { ...typography.brand, textAlign: 'center', marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.md },
  mascote: { alignItems: 'center', marginBottom: spacing.md },
  loginButton: { marginTop: spacing.sm },
  links: { marginTop: spacing.lg, gap: spacing.md, alignItems: 'center' },
  linkText: { ...typography.bodyBold },
});
