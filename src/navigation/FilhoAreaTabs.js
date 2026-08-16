import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ListaTarefasScreen } from '../screens/tarefas/ListaTarefasScreen';
import { PontuacaoScreen } from '../screens/pontuacao/PontuacaoScreen';
import { RecompensasScreen } from '../screens/recompensas/RecompensasScreen';
import { FinanceiroScreen } from '../screens/financeiro/FinanceiroScreen';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();

const ICONS = {
  Tarefas: 'checkbox-outline',
  Pontuacao: 'star-outline',
  Recompensas: 'gift-outline',
  Financeiro: 'wallet-outline',
};

// Tela única usada tanto pelo Pai (com filhoId escolhido na Home) quanto pelo
// próprio Filho (com o filhoId derivado do JWT) — ver FilhoNavigator/PaiNavigator.
export function FilhoAreaTabs({ route }) {
  const { filhoId, nomeFilho } = route.params;

  return (
    <Tab.Navigator
      screenOptions={({ route: tabRoute }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
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
    </Tab.Navigator>
  );
}
