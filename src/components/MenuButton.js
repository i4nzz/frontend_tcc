import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

export function MenuButton({ onPress }) {
  return (
    <Pressable onPress={onPress} hitSlop={12} style={styles.button}>
      <Ionicons name="menu-outline" size={26} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { paddingHorizontal: 8 },
});
