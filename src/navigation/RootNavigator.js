import { NavigationContainer } from '@react-navigation/native';
import { linking } from './linking';
import { useAuthStore } from '../store/authStore';
import { LoadingView } from '../components/LoadingView';
import { AuthStack } from './AuthStack';
import { PaiNavigator } from './PaiNavigator';
import { FilhoNavigator } from './FilhoNavigator';

export function RootNavigator() {
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const user = useAuthStore((state) => state.user);

  if (!isHydrated) {
    return <LoadingView />;
  }

  return (
    <NavigationContainer linking={linking} fallback={<LoadingView />}>
      {!user ? <AuthStack /> : user.perfil === 'Pai' ? <PaiNavigator /> : <FilhoNavigator />}
    </NavigationContainer>
  );
}
