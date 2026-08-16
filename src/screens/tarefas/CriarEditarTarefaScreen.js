import { useEffect, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { TextField } from '../../components/TextField';
import { Button } from '../../components/Button';
import { FormError } from '../../components/FormError';
import { LoadingView } from '../../components/LoadingView';
import { useTarefa, useCriarTarefa, useAtualizarTarefa } from '../../hooks/useTarefas';
import { colors, spacing, typography } from '../../theme';

function toDateParts(iso) {
  if (!iso) return { dia: '', mes: '', ano: '' };
  const data = new Date(iso);
  return {
    dia: String(data.getDate()).padStart(2, '0'),
    mes: String(data.getMonth() + 1).padStart(2, '0'),
    ano: String(data.getFullYear()),
  };
}

export function CriarEditarTarefaScreen({ route, navigation }) {
  const { tarefaId, filhoId } = route.params;
  const isEditing = !!tarefaId;

  const { data: tarefaExistente, isLoading } = useTarefa(isEditing ? tarefaId : undefined);
  const criarTarefa = useCriarTarefa();
  const atualizarTarefa = useAtualizarTarefa();

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [pontos, setPontos] = useState('');
  const [dia, setDia] = useState('');
  const [mes, setMes] = useState('');
  const [ano, setAno] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (tarefaExistente) {
      setTitulo(tarefaExistente.titulo);
      setDescricao(tarefaExistente.descricao ?? '');
      setPontos(String(tarefaExistente.pontos));
      const partes = toDateParts(tarefaExistente.prazo);
      setDia(partes.dia);
      setMes(partes.mes);
      setAno(partes.ano);
    }
  }, [tarefaExistente]);

  if (isEditing && isLoading) return <LoadingView />;

  async function handleSalvar() {
    setError(null);

    if (!titulo.trim()) {
      setError('Informe um título para a tarefa.');
      return;
    }
    const pontosNumero = Number(pontos);
    if (!Number.isFinite(pontosNumero) || pontosNumero <= 0) {
      setError('Pontos deve ser um número maior que zero.');
      return;
    }
    if (!dia || !mes || !ano) {
      setError('Informe o prazo completo (dia, mês e ano).');
      return;
    }

    const prazoIso = `${ano.padStart(4, '0')}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}T23:59:00`;
    const prazoData = new Date(prazoIso);
    if (Number.isNaN(prazoData.getTime()) || prazoData <= new Date()) {
      setError('O prazo precisa ser uma data futura válida.');
      return;
    }

    const payload = {
      filhoId,
      titulo: titulo.trim(),
      descricao: descricao.trim() || undefined,
      pontos: pontosNumero,
      prazo: prazoIso,
    };

    try {
      if (isEditing) {
        await atualizarTarefa.mutateAsync({ tarefaId, payload });
      } else {
        await criarTarefa.mutateAsync(payload);
      }
      navigation.goBack();
    } catch (err) {
      setError(err.message);
    }
  }

  const saving = criarTarefa.isPending || atualizarTarefa.isPending;

  return (
    <ScreenContainer>
      <FormError message={error} />

      <TextField label="Título" value={titulo} onChangeText={setTitulo} placeholder="Ex.: Arrumar o quarto" />
      <TextField
        label="Descrição (opcional)"
        value={descricao}
        onChangeText={setDescricao}
        placeholder="Detalhes da tarefa"
        multiline
      />
      <TextField
        label="Pontos"
        value={pontos}
        onChangeText={setPontos}
        keyboardType="number-pad"
        placeholder="Ex.: 10"
      />

      <Text style={styles.label}>Prazo</Text>
      <View style={styles.dateRow}>
        <TextField
          value={dia}
          onChangeText={setDia}
          keyboardType="number-pad"
          placeholder="DD"
          maxLength={2}
          style={styles.dateField}
        />
        <TextField
          value={mes}
          onChangeText={setMes}
          keyboardType="number-pad"
          placeholder="MM"
          maxLength={2}
          style={styles.dateField}
        />
        <TextField
          value={ano}
          onChangeText={setAno}
          keyboardType="number-pad"
          placeholder="AAAA"
          maxLength={4}
          style={styles.dateFieldYear}
        />
      </View>

      <Button title={isEditing ? 'Salvar alterações' : 'Criar tarefa'} onPress={handleSalvar} loading={saving} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  label: { ...typography.bodyBold, color: colors.text, marginBottom: spacing.xs },
  dateRow: { flexDirection: 'row', gap: spacing.sm },
  dateField: { flex: 1 },
  dateFieldYear: { flex: 1.4 },
});
