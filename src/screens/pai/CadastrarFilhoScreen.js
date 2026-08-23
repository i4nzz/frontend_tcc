import { useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { ScreenContainer } from '../../components/ScreenContainer';
import { TextField } from '../../components/TextField';
import { Button } from '../../components/Button';
import { FormError } from '../../components/FormError';
import { adicionarFilho } from '../../api/usuario';
import { colors, spacing, typography } from '../../theme';

export function CadastrarFilhoScreen({ navigation }) {
  const queryClient = useQueryClient();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [dia, setDia] = useState('');
  const [mes, setMes] = useState('');
  const [ano, setAno] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleCadastrar() {
    setError(null);
    if (nome.trim().length < 3) {
      setError('Nome deve ter pelo menos 3 caracteres.');
      return;
    }
    if (senha.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (!dia || !mes || !ano) {
      setError('Informe a data de nascimento completa.');
      return;
    }
    const dataNascimento = `${ano.padStart(4, '0')}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    if (Number.isNaN(new Date(dataNascimento).getTime())) {
      setError('Data de nascimento inválida.');
      return;
    }

    setLoading(true);
    try {
      await adicionarFilho({ nome: nome.trim(), email: email.trim(), senha, dataNascimento });
      await queryClient.invalidateQueries({ queryKey: ['meus-filhos'] });
      navigation.goBack();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer>
      <FormError message={error} />
      <TextField label="Nome do filho" value={nome} onChangeText={setNome} placeholder="Nome completo" />
      <TextField
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="filho@exemplo.com"
      />
      <TextField label="Senha" value={senha} onChangeText={setSenha} secureTextEntry placeholder="Mínimo 6 caracteres" />

      <Text style={styles.label}>Data de nascimento</Text>
      <View style={styles.dateRow}>
        <TextField value={dia} onChangeText={setDia} keyboardType="number-pad" placeholder="DD" maxLength={2} style={styles.dateField} />
        <TextField value={mes} onChangeText={setMes} keyboardType="number-pad" placeholder="MM" maxLength={2} style={styles.dateField} />
        <TextField
          value={ano}
          onChangeText={setAno}
          keyboardType="number-pad"
          placeholder="AAAA"
          maxLength={4}
          style={styles.dateFieldYear}
        />
      </View>

      <Button title="Cadastrar filho" onPress={handleCadastrar} loading={loading} />

    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  label: { ...typography.bodyBold, color: colors.text, marginBottom: spacing.xs },
  dateRow: { flexDirection: 'row', gap: spacing.sm },
  dateField: { flex: 1 },
  dateFieldYear: { flex: 1.4 },
  devNote: { ...typography.caption, color: colors.textMuted, marginTop: spacing.lg, textAlign: 'center' },
});
