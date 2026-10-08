import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ListaTarefasScreen } from '../screens/tarefas/ListaTarefasScreen';
import { PontuacaoScreen } from '../screens/pontuacao/PontuacaoScreen';
import { RecompensasScreen } from '../screens/recompensas/RecompensasScreen';
import { FinanceiroScreen } from '../screens/financeiro/FinanceiroScreen';
import { JogosScreen } from '../screens/jogos/JogosScreen';
import { AcompanhamentoScreen } from '../screens/relatorio/AcompanhamentoScreen';
import { colors } from '../theme';
import { useTema } from '../store/preferenciasStore';
import { useAuthStore } from '../store/authStore';

const Tab = createBottomTabNavigator();

const ICONS = {
  Tarefas: 'checkbox-outline',
  Pontuacao: 'star-outline',
  Recompensas: 'gift-outline',
  Financeiro: 'wallet-outline',
  Jogos: 'game-controller-outline',
  Acompanhamento: 'stats-chart-outline',
};

// Tela única usada tanto pelo Pai (com filhoId escolhido na Home) quanto pelo
// próprio Filho (com o filhoId derivado do JWT) — ver FilhoNavigator/PaiNavigator.
export function FilhoAreaTabs({ route }) {
  const { filhoId, nomeFilho } = route.params;
  const tema = useTema();
  // Relatórios e gráficos são do responsável; o filho não vê esta aba.
  const isPai = useAuthStore((state) => state.user?.perfil) === 'Pai';

  return (
    <Tab.Navigator
      screenOptions={({ route: tabRoute }) => ({
        headerShown: false,
        tabBarActiveTintColor: tema.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarIcon: ({ color, size }) => <Ionicons name={ICONS[tabRoute.name]} size={size} color={color} />,
      })}
    >
      <Tab.Screen name="Tarefas" component={ListaTarefasScreen} initialParams={{ filhoId, nomeFilho }} />
      <Tab.Screen
        name="Pontuacao"
        component={PontuacaoScreen}
        initialParams={{ filhoId, nomeFilho }}
        options={{ title: 'Pontos' }}
      />
      <Tab.Screen name="Recompensas" component={RecompensasScreen} initialParams={{ filhoId, nomeFilho }} />
      <Tab.Screen name="Financeiro" component={FinanceiroScreen} initialParams={{ filhoId, nomeFilho }} />
      {isPai && (
        <Tab.Screen
          name="Acompanhamento"
          component={AcompanhamentoScreen}
          initialParams={{ filhoId, nomeFilho }}
          options={{ title: 'Relatório' }}
        />
      )}
      <Tab.Screen name="Jogos" component={JogosScreen} />
    </Tab.Navigator>
  );
}
