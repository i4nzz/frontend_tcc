import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { useTema } from '../store/preferenciasStore';

export function LoadingView() {
  const tema = useTema();
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={tema.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
});
