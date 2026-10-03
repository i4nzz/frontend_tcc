import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';
import { TONALIDADES } from '../theme/palettes';
import { usePreferenciasStore, useTema } from '../store/preferenciasStore';

export function SeletorTonalidade() {
  const tonalidadeId = usePreferenciasStore((state) => state.tonalidadeId);
  const definirTonalidade = usePreferenciasStore((state) => state.definirTonalidade);
  const tema = useTema();

  return (
    <View style={styles.linha} accessibilityRole="radiogroup">
      {Object.values(TONALIDADES).map((opcao) => {
        const selecionada = opcao.id === tonalidadeId;
        return (
          <Pressable
            key={opcao.id}
            onPress={() => definirTonalidade(opcao.id)}
            accessibilityRole="radio"
            accessibilityLabel={`Tonalidade ${opcao.nome}`}
            accessibilityState={{ selected: selecionada }}
            style={({ pressed }) => [styles.item, { opacity: pressed ? 0.7 : 1 }]}
          >
            <View
              style={[
                styles.bolinha,
                { backgroundColor: opcao.primary },
                selecionada && styles.bolinhaSelecionada,
              ]}
            >
              {selecionada ? <Ionicons name="checkmark" size={22} color={colors.onPrimary} /> : null}
            </View>
            <Text style={[styles.nome, selecionada && { color: tema.primary, fontWeight: '700' }]}>{opcao.nome}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  item: { alignItems: 'center', width: 72, gap: spacing.xs },
  bolinha: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  // Anel escuro em volta da bolinha escolhida: a marcação não depende só da cor.
  bolinhaSelecionada: { borderColor: colors.text, borderWidth: 3 },
  nome: { ...typography.caption, color: colors.textMuted },
});
