import { useEffect, useState } from 'react';
import { ScreenContainer } from '../../components/ScreenContainer';
import { TextField } from '../../components/TextField';
import { Button } from '../../components/Button';
import { FormError } from '../../components/FormError';
import { LoadingView } from '../../components/LoadingView';
import { useRecompensa, useCriarRecompensa, useAtualizarRecompensa } from '../../hooks/useRecompensas';

export function CriarEditarRecompensaScreen({ route, navigation }) {
  const { recompensaId, filhoId } = route.params;
  const isEditing = !!recompensaId;

  const { data: recompensaExistente, isLoading } = useRecompensa(isEditing ? recompensaId : undefined);
  const criarRecompensa = useCriarRecompensa(filhoId);
  const atualizarRecompensa = useAtualizarRecompensa(filhoId);

  const [descricao, setDescricao] = useState('');
  const [pontosNecessarios, setPontosNecessarios] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (recompensaExistente) {
      setDescricao(recompensaExistente.descricao ?? '');
      setPontosNecessarios(String(recompensaExistente.pontosNecessarios));
    }
  }, [recompensaExistente]);

  if (isEditing && isLoading) return <LoadingView />;

  async function handleSalvar() {
    setError(null);
    const pontosNumero = Number(pontosNecessarios);
    if (!Number.isFinite(pontosNumero) || pontosNumero <= 0) {
      setError('Pontos necessários deve ser um número maior que zero.');
      return;
    }

    const payload = { filhoId, descricao: descricao.trim() || undefined, pontosNecessarios: pontosNumero };

    try {
      if (isEditing) {
        await atualizarRecompensa.mutateAsync({ id: recompensaId, payload });
      } else {
        await criarRecompensa.mutateAsync(payload);
      }
      navigation.goBack();
    } catch (err) {
      setError(err.message);
    }
  }

  const saving = criarRecompensa.isPending || atualizarRecompensa.isPending;

  return (
    <ScreenContainer>
      <FormError message={error} />
      <TextField
        label="Descrição"
        value={descricao}
        onChangeText={setDescricao}
        placeholder="Ex.: Uma hora extra de videogame"
      />
      <TextField
        label="Pontos necessários"
        value={pontosNecessarios}
        onChangeText={setPontosNecessarios}
        keyboardType="number-pad"
        placeholder="Ex.: 50"
      />
      <Button title={isEditing ? 'Salvar alterações' : 'Criar recompensa'} onPress={handleSalvar} loading={saving} />
    </ScreenContainer>
  );
}
