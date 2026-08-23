import { useState } from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { EmptyState } from '../../components/EmptyState';
import { LoadingView } from '../../components/LoadingView';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { FormError } from '../../components/FormError';
import { useMesadasPorFilho, useCriarMesada, useRegistrosPorFilho, useResumoFinanceiro } from '../../hooks/useFinanceiro';
import { useAuthStore } from '../../store/authStore';
import { MESES_LABEL } from '../../constants/enums';
import { colors, radius, spacing, typography } from '../../theme';

const CORES_CATEGORIA = [colors.primary, colors.accent, colors.grass, colors.star, colors.sky];

function formatarValor(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function FinanceiroScreen({ route, navigation }) {
  const { filhoId } = route.params;
  const perfil = useAuthStore((state) => state.user?.perfil);
  const isPai = perfil === 'Pai';

  const { data: mesadas = [], isLoading: loadingMesadas } = useMesadasPorFilho(filhoId);
  const { data: registros = [], isLoading: loadingRegistros } = useRegistrosPorFilho(filhoId);
  const { data: resumo, isLoading: loadingResumo } = useResumoFinanceiro(filhoId);
  const criarMesada = useCriarMesada(filhoId);

  const [mostrarFormMesada, setMostrarFormMesada] = useState(false);
  const [valorMesada, setValorMesada] = useState('');
  const [mesMesada, setMesMesada] = useState('');
  const [anoMesada, setAnoMesada] = useState(String(new Date().getFullYear()));
  const [error, setError] = useState(null);

  if (loadingMesadas || loadingRegistros || loadingResumo) return <LoadingView />;

  async function handleCriarMesada() {
    setError(null);
    const valorNumero = Number(valorMesada.replace(',', '.'));
    const mesNumero = Number(mesMesada);
    const anoNumero = Number(anoMesada);

    if (!Number.isFinite(valorNumero) || valorNumero <= 0) {
      setError('Informe um valor de mesada maior que zero.');
      return;
    }
    if (!Number.isInteger(mesNumero) || mesNumero < 1 || mesNumero > 12) {
      setError('Mês deve ser um número entre 1 e 12.');
      return;
    }
    if (!Number.isInteger(anoNumero) || anoNumero < 2000) {
      setError('Informe um ano válido.');
      return;
    }

    try {
      await criarMesada.mutateAsync({ filhoId, valor: valorNumero, mes: mesNumero, ano: anoNumero });
      setValorMesada('');
      setMesMesada('');
      setMostrarFormMesada(false);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <FormError message={error} />

      {resumo && (resumo.totalMesadas > 0 || resumo.totalGasto > 0) ? (
        <Card style={styles.resumoCard}>
          <View style={styles.resumoTotais}>
            <View style={styles.resumoItem}>
              <Text style={styles.resumoLabel}>Mesadas</Text>
              <Text style={styles.resumoValor}>{formatarValor(resumo.totalMesadas)}</Text>
            </View>
            <View style={styles.resumoItem}>
              <Text style={styles.resumoLabel}>Gasto</Text>
              <Text style={[styles.resumoValor, { color: colors.danger }]}>{formatarValor(resumo.totalGasto)}</Text>
            </View>
            <View style={styles.resumoItem}>
              <Text style={styles.resumoLabel}>Saldo</Text>
              <Text style={[styles.resumoValor, { color: colors.success }]}>{formatarValor(resumo.saldoDisponivel)}</Text>
            </View>
          </View>

          {resumo.gastosPorCategoria.length > 0 ? (
            <View style={styles.categoriasList}>
              {resumo.gastosPorCategoria.map((categoria, index) => (
                <View key={categoria.categoriaId} style={styles.categoriaRow}>
                  <View style={styles.categoriaHeader}>
                    <Text style={styles.categoriaNome}>{categoria.nomeCategoria}</Text>
                    <Text style={styles.categoriaValor}>
                      {formatarValor(categoria.total)} · {categoria.percentual.toFixed(0)}%
                    </Text>
                  </View>
                  <View style={styles.barraFundo}>
                    <View
                      style={[
                        styles.barraPreenchida,
                        {
                          width: `${Math.min(categoria.percentual, 100)}%`,
                          backgroundColor: CORES_CATEGORIA[index % CORES_CATEGORIA.length],
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          ) : null}
        </Card>
      ) : null}

      <Text style={styles.sectionTitle}>Mesadas</Text>
      {mesadas.length === 0 ? (
        <EmptyState icon="wallet-outline" title="Nenhuma mesada cadastrada" />
      ) : (
        mesadas.map((mesada) => (
          <Card key={mesada.mesadaId} style={styles.mesadaCard}>
            <Text style={styles.mesadaValor}>{formatarValor(mesada.valor)}</Text>
            <Text style={styles.mesadaPeriodo}>
              {MESES_LABEL[mesada.mes - 1]} de {mesada.ano}
            </Text>
          </Card>
        ))
      )}

      {isPai ? (
        mostrarFormMesada ? (
          <Card style={styles.formCard}>
            <TextField
              label="Valor"
              value={valorMesada}
              onChangeText={setValorMesada}
              keyboardType="decimal-pad"
              placeholder="Ex.: 50"
            />
            <View style={styles.row}>
              <TextField
                label="Mês"
                value={mesMesada}
                onChangeText={setMesMesada}
                keyboardType="number-pad"
                placeholder="1-12"
                style={styles.rowField}
              />
              <TextField
                label="Ano"
                value={anoMesada}
                onChangeText={setAnoMesada}
                keyboardType="number-pad"
                placeholder="AAAA"
                style={styles.rowField}
              />
            </View>
            <View style={styles.row}>
              <Button
                title="Cancelar"
                variant="secondary"
                onPress={() => setMostrarFormMesada(false)}
                style={styles.rowField}
              />
              <Button title="Salvar" onPress={handleCriarMesada} loading={criarMesada.isPending} style={styles.rowField} />
            </View>
          </Card>
        ) : (
          <Button title="Nova mesada" variant="secondary" onPress={() => setMostrarFormMesada(true)} style={styles.sectionButton} />
        )
      ) : null}

      <Text style={[styles.sectionTitle, styles.sectionSpacing]}>Gastos</Text>
      {registros.length === 0 ? (
        <EmptyState icon="cart-outline" title="Nenhum gasto lançado ainda" />
      ) : (
        registros.map((registro) => (
          <View key={registro.registroId} style={styles.registroItem}>
            <View style={styles.registroInfo}>
              <Text style={styles.registroDescricao} numberOfLines={1}>
                {registro.descricao}
              </Text>
              <Text style={styles.registroMeta}>
                {registro.nomeCategoria} · {formatarData(registro.dataRegistro)}
              </Text>
            </View>
            <Text style={styles.registroValor}>{formatarValor(registro.valor)}</Text>
          </View>
        ))
      )}

      <Button
        title="Novo gasto"
        onPress={() => navigation.navigate('NovoRegistroFinanceiro', { filhoId })}
        disabled={mesadas.length === 0}
        style={styles.sectionButton}
      />
      {mesadas.length === 0 ? <Text style={styles.hint}>Cadastre uma mesada antes de lançar um gasto.</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  sectionTitle: { ...typography.subtitle, color: colors.text, marginBottom: spacing.sm },
  sectionSpacing: { marginTop: spacing.lg },
  resumoCard: { marginBottom: spacing.lg },
  resumoTotais: { flexDirection: 'row', justifyContent: 'space-between' },
  resumoItem: { alignItems: 'center', flex: 1 },
  resumoLabel: { ...typography.caption, color: colors.textMuted },
  resumoValor: { ...typography.bodyBold, color: colors.text, marginTop: 2 },
  categoriasList: { marginTop: spacing.md, gap: spacing.sm },
  categoriaRow: { marginBottom: spacing.xs },
  categoriaHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  categoriaNome: { ...typography.body, color: colors.text },
  categoriaValor: { ...typography.caption, color: colors.textMuted },
  barraFundo: { height: 8, borderRadius: radius.pill, backgroundColor: colors.border, overflow: 'hidden' },
  barraPreenchida: { height: '100%', borderRadius: radius.pill },
  sectionButton: { marginTop: spacing.sm },
  mesadaCard: { marginBottom: spacing.sm },
  mesadaValor: { ...typography.title, color: colors.primary },
  mesadaPeriodo: { ...typography.body, color: colors.textMuted },
  formCard: { marginBottom: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm },
  rowField: { flex: 1 },
  registroItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  registroInfo: { flexShrink: 1, marginRight: spacing.sm },
  registroDescricao: { ...typography.bodyBold, color: colors.text },
  registroMeta: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  registroValor: { ...typography.bodyBold, color: colors.danger },
  hint: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs, textAlign: 'center' },
});
