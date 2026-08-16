import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { colors } from '../theme';

export function LogoutButton() {
  const logout = useAuthStore((state) => state.logout);
  return (
    <Pressable onPress={() => logout()} hitSlop={12} style={styles.button}>
      <Ionicons name="log-out-outline" size={22} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { paddingHorizontal: 8 },
});
