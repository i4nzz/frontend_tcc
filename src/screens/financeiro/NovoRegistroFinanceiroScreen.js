import { useState } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { TextField } from '../../components/TextField';
import { Button } from '../../components/Button';
import { FormError } from '../../components/FormError';
import { LoadingView } from '../../components/LoadingView';
import { useMesadasPorFilho, useCategorias, useCriarCategoria, useCriarRegistroFinanceiro } from '../../hooks/useFinanceiro';
import { useAuthStore } from '../../store/authStore';
import { MESES_LABEL } from '../../constants/enums';
import { colors, radius, spacing, typography } from '../../theme';

export function NovoRegistroFinanceiroScreen({ route, navigation }) {
  const { filhoId } = route.params;
  const perfil = useAuthStore((state) => state.user?.perfil);
  const isPai = perfil === 'Pai';

  const { data: mesadas = [], isLoading: loadingMesadas } = useMesadasPorFilho(filhoId);
  const { data: categorias = [], isLoading: loadingCategorias } = useCategorias();
  const criarCategoria = useCriarCategoria();
  const criarRegistro = useCriarRegistroFinanceiro(filhoId);

  const [mesadaId, setMesadaId] = useState(null);
  const [categoriaId, setCategoriaId] = useState(null);
  const [novaCategoria, setNovaCategoria] = useState('');
  const [mostrarNovaCategoria, setMostrarNovaCategoria] = useState(false);
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [error, setError] = useState(null);

  if (loadingMesadas || loadingCategorias) return <LoadingView />;

  async function handleCriarCategoria() {
    setError(null);
    if (!novaCategoria.trim()) {
      setError('Informe o nome da categoria.');
      return;
    }
    try {
      const { data } = await criarCategoria.mutateAsync({ nome: novaCategoria.trim() });
      setCategoriaId(data?.categoriaFinanceiraId ?? null);
      setNovaCategoria('');
      setMostrarNovaCategoria(false);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSalvar() {
    setError(null);
    if (!mesadaId) {
      setError('Selecione a mesada.');
      return;
    }
    if (!categoriaId) {
      setError('Selecione a categoria.');
      return;
    }
    if (!descricao.trim()) {
      setError('Informe uma descrição para o gasto.');
      return;
    }
    const valorNumero = Number(valor.replace(',', '.'));
    if (!Number.isFinite(valorNumero) || valorNumero <= 0) {
      setError('Informe um valor maior que zero.');
      return;
    }

    try {
      await criarRegistro.mutateAsync({
        filhoId,
        categoriaId,
        mesadaId,
        descricao: descricao.trim(),
        valor: valorNumero,
      });
      navigation.goBack();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <ScreenContainer>
      <FormError message={error} />

      <Text style={styles.label}>Mesada</Text>
      <View style={styles.chipRow}>
        {mesadas.map((mesada) => (
          <Pressable
            key={mesada.mesadaId}
            onPress={() => setMesadaId(mesada.mesadaId)}
            style={[styles.chip, mesadaId === mesada.mesadaId && styles.chipSelected]}
          >
            <Text style={[styles.chipText, mesadaId === mesada.mesadaId && styles.chipTextSelected]}>
              {MESES_LABEL[mesada.mes - 1]}/{mesada.ano}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Categoria</Text>
      <View style={styles.chipRow}>
        {categorias.map((categoria) => (
          <Pressable
            key={categoria.categoriaFinanceiraId}
            onPress={() => setCategoriaId(categoria.categoriaFinanceiraId)}
            style={[styles.chip, categoriaId === categoria.categoriaFinanceiraId && styles.chipSelected]}
          >
            <Text style={[styles.chipText, categoriaId === categoria.categoriaFinanceiraId && styles.chipTextSelected]}>
              {categoria.nome}
            </Text>
          </Pressable>
        ))}
      </View>

      {isPai ? (
        mostrarNovaCategoria ? (
          <View style={styles.novaCategoriaRow}>
            <TextField
              value={novaCategoria}
              onChangeText={setNovaCategoria}
              placeholder="Nome da categoria"
              style={styles.novaCategoriaField}
            />
            <Button title="Adicionar" onPress={handleCriarCategoria} loading={criarCategoria.isPending} />
          </View>
        ) : (
          <Text style={styles.linkText} onPress={() => setMostrarNovaCategoria(true)}>
            + Criar nova categoria
          </Text>
        )
      ) : null}

      <TextField
        label="Descrição"
        value={descricao}
        onChangeText={setDescricao}
        placeholder="Ex.: Lanche na escola"
        style={styles.marginTop}
      />
      <TextField label="Valor" value={valor} onChangeText={setValor} keyboardType="decimal-pad" placeholder="Ex.: 15,50" />

      <Button title="Salvar gasto" onPress={handleSalvar} loading={criarRegistro.isPending} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  label: { ...typography.bodyBold, color: colors.text, marginBottom: spacing.xs },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  chip: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
  },
  chipSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
  chipText: { ...typography.body, color: colors.text },
  chipTextSelected: { color: colors.onPrimary, fontWeight: '700' },
  novaCategoriaRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', marginBottom: spacing.md },
  novaCategoriaField: { flex: 1, marginBottom: 0 },
  linkText: { ...typography.bodyBold, color: colors.primary, marginBottom: spacing.md },
  marginTop: { marginTop: spacing.sm },
});
