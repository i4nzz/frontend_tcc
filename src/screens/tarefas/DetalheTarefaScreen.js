import { useState } from 'react';
import { Alert, Image, Text, View, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { StatusBadge } from '../../components/StatusBadge';
import { FormError } from '../../components/FormError';
import { LoadingView } from '../../components/LoadingView';
import { useTarefa, useRemoverTarefa } from '../../hooks/useTarefas';
import {
  useComprovacoesPorTarefa,
  useEnviarComprovacao,
  useValidarComprovacao,
  useFotoComprovacao,
} from '../../hooks/useComprovacoes';
import { useAuthStore } from '../../store/authStore';
import { colors, radius, spacing, typography } from '../../theme';

function formatarData(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function DetalheTarefaScreen({ route, navigation }) {
  const { tarefaId } = route.params;
  const perfil = useAuthStore((state) => state.user?.perfil);
  const isPai = perfil === 'Pai';

  const { data: tarefa, isLoading: loadingTarefa } = useTarefa(tarefaId);
  const { data: comprovacoes = [], isLoading: loadingComprovacoes } = useComprovacoesPorTarefa(tarefaId);
  const enviarComprovacao = useEnviarComprovacao(tarefaId);
  const validarComprovacao = useValidarComprovacao(tarefaId);
  const removerTarefa = useRemoverTarefa();

  const [error, setError] = useState(null);

  const ultimaComprovacao = comprovacoes[comprovacoes.length - 1];
  const { data: fotoUri, isLoading: loadingFoto } = useFotoComprovacao(ultimaComprovacao?.id);

  if (loadingTarefa || loadingComprovacoes) return <LoadingView />;
  if (!tarefa) {
    return (
      <ScreenContainer style={styles.centered}>
        <Text style={styles.body}>Tarefa não encontrada.</Text>
      </ScreenContainer>
    );
  }

  const podeEnviarComprovacao = ultimaComprovacao?.status !== 2;
  const aguardandoValidacao = ultimaComprovacao?.status === 1;

  async function escolherFoto(fromCamera) {
    setError(null);
    const permissao = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissao.granted) {
      setError('Precisamos de permissão para acessar a câmera/galeria.');
      return;
    }

    const resultado = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.7, mediaTypes: ['images'] });

    if (resultado.canceled) return;

    const asset = resultado.assets[0];
    const nomeArquivo = asset.fileName || asset.uri.split('/').pop() || 'foto.jpg';
    const extensao = nomeArquivo.split('.').pop()?.toLowerCase();
    const tipo = asset.mimeType || (extensao === 'png' ? 'image/png' : 'image/jpeg');

    try {
      await enviarComprovacao.mutateAsync({
        tarefaId,
        foto: { uri: asset.uri, name: nomeArquivo, type: tipo },
      });
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleValidar(aprovar) {
    setError(null);
    try {
      await validarComprovacao.mutateAsync({ id: ultimaComprovacao.id, aprovar });
    } catch (err) {
      setError(err.message);
    }
  }

  function handleRemover() {
    Alert.alert('Remover tarefa', `Tem certeza que deseja remover "${tarefa.titulo}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            await removerTarefa.mutateAsync(tarefaId);
            navigation.goBack();
          } catch (err) {
            setError(err.message);
          }
        },
      },
    ]);
  }

  return (
    <ScreenContainer>
      <FormError message={error} />

      <Card style={styles.card}>
        <View style={styles.tituloRow}>
          <Text style={styles.title}>{tarefa.titulo}</Text>
          <StatusBadge status={tarefa.status} type="tarefa" />
        </View>
        {tarefa.descricao ? <Text style={styles.descricao}>{tarefa.descricao}</Text> : null}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Pontos</Text>
          <Text style={styles.infoValue}>{tarefa.pontos} pts</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Prazo</Text>
          <Text style={styles.infoValue}>{formatarData(tarefa.prazo)}</Text>
        </View>
      </Card>

      {isPai ? (
        <View style={styles.paiActions}>
          <Button
            title="Editar tarefa"
            variant="secondary"
            onPress={() => navigation.navigate('CriarEditarTarefa', { tarefaId, filhoId: tarefa.filhoId })}
            style={styles.actionButton}
          />
          <Button title="Remover tarefa" variant="danger" onPress={handleRemover} style={styles.actionButton} />
        </View>
      ) : null}

      <Card style={styles.card}>
        <View style={styles.comprovacaoHeader}>
          <Text style={styles.subtitle}>Comprovação</Text>
          {ultimaComprovacao ? <StatusBadge status={ultimaComprovacao.status} /> : null}
        </View>

        {ultimaComprovacao ? (
          loadingFoto || !fotoUri ? (
            <View style={styles.fotoPlaceholder}>
              <LoadingView />
            </View>
          ) : (
            <Image source={{ uri: fotoUri }} style={styles.foto} resizeMode="cover" />
          )
        ) : (
          <Text style={styles.body}>Nenhuma foto enviada ainda.</Text>
        )}

        {podeEnviarComprovacao ? (
          <View style={styles.fotoButtons}>
            <Button
              title="Tirar foto"
              variant="secondary"
              onPress={() => escolherFoto(true)}
              loading={enviarComprovacao.isPending}
              style={styles.actionButton}
            />
            <Button
              title="Escolher da galeria"
              variant="secondary"
              onPress={() => escolherFoto(false)}
              loading={enviarComprovacao.isPending}
              style={styles.actionButton}
            />
          </View>
        ) : null}

        {isPai && aguardandoValidacao ? (
          <View style={styles.fotoButtons}>
            <Button
              title="Aprovar"
              onPress={() => handleValidar(true)}
              loading={validarComprovacao.isPending}
              style={styles.actionButton}
            />
            <Button
              title="Reprovar"
              variant="danger"
              onPress={() => handleValidar(false)}
              loading={validarComprovacao.isPending}
              style={styles.actionButton}
            />
          </View>
        ) : null}
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centered: { justifyContent: 'center', alignItems: 'center' },
  card: { marginBottom: spacing.md },
  tituloRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  title: { ...typography.title, color: colors.text, marginBottom: spacing.xs, flexShrink: 1 },
  descricao: { ...typography.body, color: colors.textMuted, marginBottom: spacing.sm },
  subtitle: { ...typography.subtitle, color: colors.text },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  infoLabel: { ...typography.body, color: colors.textMuted },
  infoValue: { ...typography.bodyBold, color: colors.text },
  paiActions: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  actionButton: { flex: 1 },
  comprovacaoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  foto: { width: '100%', height: 220, borderRadius: radius.md, marginBottom: spacing.md, backgroundColor: colors.border },
  fotoPlaceholder: { width: '100%', height: 220, borderRadius: radius.md, marginBottom: spacing.md, backgroundColor: colors.border },
  fotoButtons: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  body: { ...typography.body, color: colors.textMuted },
});
