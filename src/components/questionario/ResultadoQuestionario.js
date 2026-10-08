import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { Button } from '../Button';
import { MascoteQuestionario, HUMORES } from '../mascote/MascoteQuestionario';
import { colors, radius, spacing, typography } from '../../theme';
import { categoriaDoQuestionario } from '../../constants/questionario';

function resumoPorCategoria(respostas) {
  const grupos = new Map();
  respostas.forEach(({ categoria, correta }) => {
    const grupo = grupos.get(categoria) ?? { categoria, acertos: 0, total: 0 };
    grupo.total += 1;
    if (correta) grupo.acertos += 1;
    grupos.set(categoria, grupo);
  });
  return [...grupos.values()];
}

function mensagemFinal(acertos, total) {
  const taxa = total ? acertos / total : 0;
  if (taxa === 1) return 'Perfeito! Você acertou tudo!';
  if (taxa >= 0.7) return 'Muito bem! Continue praticando!';
  if (taxa >= 0.4) return 'Bom trabalho! Cada desafio ensina algo novo.';
  return 'Você aprendeu coisas novas hoje! Vamos tentar de novo?';
}

export function ResultadoQuestionario({
  pontos,
  respostas,
  onJogarNovamente,
  onVoltar,
  larguraMascote,
  reduzirMovimento,
}) {
  const acertos = respostas.filter((r) => r.correta).length;
  const total = respostas.length;
  const categorias = resumoPorCategoria(respostas);
  const entrada = (atraso) => (reduzirMovimento ? undefined : FadeInDown.delay(atraso).duration(300));
  const humor = acertos * 2 >= total ? HUMORES.COMEMORANDO : HUMORES.FELIZ;

  return (
    <View style={styles.container}>
      <MascoteQuestionario humor={humor} largura={larguraMascote} reduzirMovimento={reduzirMovimento} />

      <Animated.Text entering={reduzirMovimento ? undefined : ZoomIn.duration(300)} style={styles.titulo}>
        🎉 Desafio concluído!
      </Animated.Text>

      <Animated.View entering={entrada(150)} style={styles.destaque}>
        <Text style={styles.pontos}>⭐ {pontos} pontos</Text>
        <Text style={styles.acertos}>
          Você acertou {acertos} de {total}!
        </Text>
      </Animated.View>

      <Animated.View entering={entrada(300)} style={styles.categorias}>
        {categorias.map(({ categoria, acertos: acertosCategoria, total: totalCategoria }) => {
          const { emoji, nome } = categoriaDoQuestionario(categoria);
          return (
            <View key={categoria} style={styles.categoria}>
              <View style={styles.categoriaLinha}>
                <Text style={styles.categoriaNome}>
                  {emoji} {nome}
                </Text>
                <Text style={styles.categoriaPlacar}>
                  {acertosCategoria}/{totalCategoria}
                </Text>
              </View>
              <View style={styles.barra}>
                <View style={[styles.barraCheia, { width: `${(acertosCategoria / totalCategoria) * 100}%` }]} />
              </View>
            </View>
          );
        })}
      </Animated.View>

      <Animated.Text entering={entrada(450)} style={styles.mensagem}>
        {mensagemFinal(acertos, total)}
      </Animated.Text>

      <Animated.View entering={entrada(550)} style={styles.botoes}>
        <Button title="JOGAR NOVAMENTE" onPress={onJogarNovamente} />
        <Button title="VOLTAR" variant="secondary" onPress={onVoltar} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: spacing.md, width: '100%' },
  titulo: { ...typography.title, color: colors.text, textAlign: 'center' },
  destaque: { alignItems: 'center', gap: spacing.xs },
  pontos: { ...typography.brand, color: colors.star },
  acertos: { ...typography.subtitle, color: colors.text },
  categorias: {
    alignSelf: 'stretch',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  categoria: { gap: spacing.xs },
  categoriaLinha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoriaNome: { ...typography.bodyBold, color: colors.text },
  categoriaPlacar: { ...typography.bodyBold, color: colors.textMuted },
  barra: { height: 8, borderRadius: radius.pill, backgroundColor: colors.border, overflow: 'hidden' },
  barraCheia: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.success },
  mensagem: { ...typography.subtitle, color: colors.text, textAlign: 'center' },
  botoes: { alignSelf: 'stretch', gap: spacing.sm },
});
