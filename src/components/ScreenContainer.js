import { SafeAreaView, ScrollView, View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { colors, spacing } from '../theme';

export function ScreenContainer({ children, scroll = true, style }) {
  const Wrapper = scroll ? ScrollView : View;
  const wrapperProps = scroll
    ? { contentContainerStyle: [styles.content, style], keyboardShouldPersistTaps: 'handled' }
    : { style: [styles.content, style] };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Wrapper {...wrapperProps}>{children}</Wrapper>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { flexGrow: 1, padding: spacing.lg },
});
