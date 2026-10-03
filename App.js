import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts, DynaPuff_600SemiBold, DynaPuff_700Bold } from '@expo-google-fonts/dynapuff';
import { queryClient } from './src/api/queryClient';
import { useAuthStore } from './src/store/authStore';
import { usePreferenciasStore } from './src/store/preferenciasStore';
import { RootNavigator } from './src/navigation/RootNavigator';
import { LoadingView } from './src/components/LoadingView';

export default function App() {
  // Só os pesos realmente usados pelo tema (marca/títulos e subtítulos).
  const [fontesCarregadas, erroDasFontes] = useFonts({ DynaPuff_600SemiBold, DynaPuff_700Bold });

  // A tonalidade é lida antes da primeira tela: sem isso o app abriria no azul
  // padrão e trocaria para a cor salva logo depois.
  const preferenciasCarregadas = usePreferenciasStore((state) => state.isHydrated);

  useEffect(() => {
    useAuthStore.getState().hydrate();
    usePreferenciasStore.getState().hydrate();
  }, []);

  // Se as fontes falharem, o app abre mesmo assim na fonte do sistema —
  // melhor que travar no spinner.
  const pronto = (fontesCarregadas || Boolean(erroDasFontes)) && preferenciasCarregadas;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          {pronto ? <RootNavigator /> : <LoadingView />}
          <StatusBar style="dark" />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
