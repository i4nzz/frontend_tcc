import { Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { colors, spacing, typography } from '../../theme';

export function VerifiqueEmailScreen({ route, navigation }) {
  const email = route.params?.email;

  return (
    <ScreenContainer style={styles.content}>
      <Ionicons name="mail-outline" size={48} color={colors.primary} style={styles.icon} />
      <Text style={styles.title}>Confira seu e-mail</Text>
      <Text style={styles.body}>
        Enviamos um link de confirmação{email ? ` para ${email}` : ''}. Abra o e-mail e toque no link para
        ativar sua conta antes de entrar.
      </Text>
      <Button title="Voltar para o login" onPress={() => navigation.replace('Login')} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'center', alignItems: 'center' },
  icon: { marginBottom: spacing.md },
  title: { ...typography.title, color: colors.text, marginBottom: spacing.sm, textAlign: 'center' },
  body: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.xl },
});
