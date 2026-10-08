import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Button } from '../Button';
import { MascoteQuestionario, HUMORES } from '../mascote/MascoteQuestionario';
import { BalaoPergunta } from './BalaoPergunta';
import { colors, radius, spacing, typography } from '../../theme';
import { CATEGORIAS_DO_QUESTIONARIO, QUANTIDADE_PERGUNTAS } from '../../constants/questionario';

export function IntroducaoQuestionario({ onComecar, larguraMascote, reduzirMovimento }) {
  const entrada = (atraso) => (reduzirMovimento ? undefined : FadeInDown.delay(atraso).duration(300));

  return (
    <View style={styles.container}>
      <Animated.View entering={reduzirMovimento ? undefined : FadeInUp.duration(320)}>
        <MascoteQuestionario humor={HUMORES.NORMAL} largura={larguraMascote} reduzirMovimento={reduzirMovimento} />
      </Animated.View>

      <BalaoPergunta reduzirMovimento={reduzirMovimento} style={styles.balao}>
        <Text style={styles.titulo}>Topa um desafio?</Text>
        <Text style={styles.texto}>
          Vou fazer {QUANTIDADE_PERGUNTAS} perguntas. Cada acerto vale pontos!
        </Text>
      </BalaoPergunta>

      <Animated.View entering={entrada(350)} style={styles.categorias}>
        {CATEGORIAS_DO_QUESTIONARIO.map((categoria) => (
          <View key={categoria.chave} style={styles.categoria}>
            <Text style={styles.categoriaTexto}>
              {categoria.emoji} {categoria.nome}
            </Text>
          </View>
        ))}
      </Animated.View>

      <Animated.View entering={entrada(500)} style={styles.botao}>
        <Button title="COMEÇAR DESAFIO" onPress={onComecar} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: spacing.lg, width: '100%' },
  balao: { alignSelf: 'stretch' },
  titulo: { ...typography.title, color: colors.text, textAlign: 'center' },
  texto: { ...typography.body, color: colors.text, textAlign: 'center' },
  categorias: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm },
  categoria: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  categoriaTexto: { ...typography.caption, color: colors.text, fontWeight: '600' },
  botao: { alignSelf: 'stretch' },
});
