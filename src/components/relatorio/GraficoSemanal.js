import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

const ALTURA_GRAFICO = 96;
const DIAS_DA_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// "2026-10-07" vira uma data local sem passar por fuso (o backend já agrupou no horário de Brasília).
function paraData(texto) {
  const [ano, mes, dia] = texto.split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}

function plural(n, singular, plural_) {
  return `${n} ${n === 1 ? singular : plural_}`;
}

// Colunas empilhadas de acertos e erros por dia. Tocar numa coluna mostra os
// números daquele dia logo abaixo do gráfico.
export function GraficoSemanal({ dias, corAcerto, corErro }) {
  const [selecionado, setSelecionado] = useState(dias.length - 1);
  const maximo = Math.max(1, ...dias.map((d) => d.acertos + d.erros));
  const dia = dias[selecionado] ?? dias[dias.length - 1];
  const dataDia = dia ? paraData(dia.data) : null;

  return (
    <View style={styles.container}>
      <View style={styles.grafico}>
        {dias.map((d, i) => {
          const total = d.acertos + d.erros;
          const ativo = i === selecionado;
          const data = paraData(d.data);
          return (
            <Pressable
              key={d.data}
              onPress={() => setSelecionado(i)}
              style={styles.coluna}
              accessibilityRole="button"
              accessibilityLabel={`${DIAS_DA_SEMANA[data.getDay()]}: ${plural(d.acertos, 'acerto', 'acertos')}, ${plural(d.erros, 'erro', 'erros')}`}
              accessibilityState={{ selected: ativo }}
            >
              <Text style={[styles.total, !total && styles.totalVazio]}>{total || ''}</Text>
              <View style={[styles.trilho, ativo && styles.trilhoAtivo]}>
                {total > 0 && (
                  <View style={{ height: (total / maximo) * ALTURA_GRAFICO, width: '100%' }}>
                    {d.erros > 0 && <View style={[styles.parte, styles.topo, { flex: d.erros, backgroundColor: corErro }]} />}
                    {d.erros > 0 && d.acertos > 0 && <View style={styles.espaco} />}
                    {d.acertos > 0 && (
                      <View
                        style={[styles.parte, d.erros === 0 && styles.topo, { flex: d.acertos, backgroundColor: corAcerto }]}
                      />
                    )}
                  </View>
                )}
              </View>
              <Text style={[styles.rotulo, ativo && styles.rotuloAtivo]}>{DIAS_DA_SEMANA[data.getDay()]}</Text>
            </Pressable>
          );
        })}
      </View>

      {dia && (
        <Text style={styles.detalhe}>
          {dataDia.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })}:{' '}
          <Text style={styles.detalheForte}>{plural(dia.acertos, 'acerto', 'acertos')}</Text> e{' '}
          <Text style={styles.detalheForte}>{plural(dia.erros, 'erro', 'erros')}</Text>
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  grafico: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.xs },
  coluna: { flex: 1, alignItems: 'center', gap: 4, paddingTop: spacing.xs },
  total: { ...typography.caption, color: colors.text, fontWeight: '700', minHeight: 17 },
  totalVazio: { color: colors.textMuted },
  trilho: {
    height: ALTURA_GRAFICO,
    width: '62%',
    maxWidth: 28,
    justifyContent: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  trilhoAtivo: { backgroundColor: `${colors.border}66`, borderRadius: 4 },
  parte: { width: '100%' },
  topo: { borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  espaco: { height: 2 },
  rotulo: { ...typography.caption, color: colors.textMuted },
  rotuloAtivo: { color: colors.text, fontWeight: '700' },
  detalhe: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },
  detalheForte: { color: colors.text, fontWeight: '700' },
});
