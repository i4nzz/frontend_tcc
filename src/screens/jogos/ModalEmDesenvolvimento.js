import { Modal, Text, View, StyleSheet } from 'react-native';
import { Button } from '../../components/Button';
import { MascoteTriste } from '../../components/mascote/MascoteTriste';
import { colors, radius, spacing, typography } from '../../theme';

export function ModalEmDesenvolvimento({ visivel, onFechar, onVoltarInicio }) {
  return (
    <Modal visible={visivel} transparent animationType="fade" statusBarTranslucent onRequestClose={onFechar}>
      <View style={styles.fundo}>
        <View style={styles.caixa} accessibilityViewIsModal>
          <MascoteTriste largura={170} />
          <Text style={styles.titulo}>Desculpe...</Text>
          <Text style={styles.texto}>Esse módulo ainda está em desenvolvimento.</Text>
          <Button title="Voltar para o início" onPress={onVoltarInicio} style={styles.botao} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  caixa: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  titulo: { ...typography.subtitle, color: colors.text, textAlign: 'center' },
  texto: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.sm },
  botao: { alignSelf: 'stretch' },
});
