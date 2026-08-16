import { useEffect, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { LoadingView } from '../../components/LoadingView';
import { confirmarEmail } from '../../api/auth';
import { colors, spacing, typography } from '../../theme';

export function ConfirmarEmailScreen({ route, navigation }) {
  const token = route.params?.token;
  const [status, setStatus] = useState(token ? 'loading' : 'missing-token');
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!token) return;
    let active = true;
    confirmarEmail(token)
      .then(() => {
        if (active) setStatus('success');
      })
      .catch((err) => {
        if (active) {
          setStatus('error');
          setMessage(err.message);
        }
      });
    return () => {
      active = false;
    };
  }, [token]);

  if (status === 'loading') return <LoadingView />;

  const isSuccess = status === 'success';

  return (
    <ScreenContainer style={styles.content}>
      <Ionicons
        name={isSuccess ? 'checkmark-circle-outline' : 'alert-circle-outline'}
        size={48}
        color={isSuccess ? colors.success : colors.danger}
        style={styles.icon}
      />
      <Text style={styles.title}>
        {isSuccess ? 'E-mail confirmado!' : status === 'missing-token' ? 'Link inválido' : 'Não foi possível confirmar'}
      </Text>
      <Text style={styles.body}>
        {isSuccess
          ? 'Sua conta já está ativa. Você já pode entrar.'
          : message || 'O link usado não é válido ou já expirou.'}
      </Text>
      <Button title="Ir para o login" onPress={() => navigation.replace('Login')} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'center', alignItems: 'center' },
  icon: { marginBottom: spacing.md },
  title: { ...typography.title, color: colors.text, marginBottom: spacing.sm, textAlign: 'center' },
  body: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.xl },
});
