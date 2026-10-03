import { Text, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { SeletorTonalidade } from '../../components/SeletorTonalidade';
import { colors, spacing, typography } from '../../theme';

export function OpcoesScreen() {
  return (
    <ScreenContainer>
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Personalização</Text>
        <Text style={styles.sectionHint}>Escolha a cor de destaque do app.</Text>
        <SeletorTonalidade />
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  sectionTitle: { ...typography.bodyBold, color: colors.text },
  sectionHint: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.xs },
});
