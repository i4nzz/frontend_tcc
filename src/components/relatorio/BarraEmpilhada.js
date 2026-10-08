import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

const ESPACO_ENTRE_SEGMENTOS = 2;

// Uma barra horizontal dividida em partes (ex.: tarefas por status), com a
// legenda sempre visível e com os números — a cor nunca é a única pista.
export function BarraEmpilhada({ itens, rotuloAcessivel }) {
  const total = itens.reduce((soma, item) => soma + item.valor, 0);
  const visiveis = itens.filter((item) => item.valor > 0);

  return (
    <View style={styles.container}>
      <View style={styles.barra} accessible accessibilityLabel={rotuloAcessivel}>
        {total === 0 ? (
          <View style={styles.vazia} />
        ) : (
          visiveis.map((item, i) => (
            <View
              key={item.chave}
              style={[
                styles.segmento,
                {
                  flex: item.valor,
                  backgroundColor: item.cor,
                  marginLeft: i === 0 ? 0 : ESPACO_ENTRE_SEGMENTOS,
                },
                i === 0 && styles.inicio,
                i === visiveis.length - 1 && styles.fim,
              ]}
            />
          ))
        )}
      </View>

      <View style={styles.legenda}>
        {itens.map((item) => (
          <View key={item.chave} style={styles.itemLegenda}>
            <View style={[styles.marcador, { backgroundColor: item.cor }]} />
            <Text style={styles.textoLegenda}>
              {item.rotulo} <Text style={styles.valorLegenda}>{item.valor}</Text>
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  barra: { flexDirection: 'row', height: 14 },
  vazia: { flex: 1, borderRadius: radius.pill, backgroundColor: colors.border },
  segmento: { height: '100%' },
  inicio: { borderTopLeftRadius: 4, borderBottomLeftRadius: 4 },
  fim: { borderTopRightRadius: 4, borderBottomRightRadius: 4 },
  legenda: { flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.md, rowGap: spacing.xs },
  itemLegenda: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  marcador: { width: 10, height: 10, borderRadius: 3 },
  textoLegenda: { ...typography.caption, color: colors.textMuted },
  valorLegenda: { fontWeight: '700', color: colors.text },
});
