import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import { FilhoAreaTabs } from './FilhoAreaTabs';
import { DetalheTarefaScreen } from '../screens/tarefas/DetalheTarefaScreen';
import { NovoRegistroFinanceiroScreen } from '../screens/financeiro/NovoRegistroFinanceiroScreen';
import { LogoutButton } from '../components/LogoutButton';
import { MenuButton } from '../components/MenuButton';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

export function FilhoStackNavigator({ navigation: drawerNavigation }) {
  const filhoId = useAuthStore((state) => state.userId);
  const nomeFilho = useAuthStore((state) => state.user?.nome);

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="FilhoArea"
        component={FilhoAreaTabs}
        initialParams={{ filhoId, nomeFilho }}
        options={{
          title: nomeFilho ?? 'Task Kids',
          headerLeft: () => <MenuButton onPress={() => drawerNavigation.toggleDrawer()} />,
          headerRight: () => <LogoutButton />,
        }}
      />
      <Stack.Screen name="DetalheTarefa" component={DetalheTarefaScreen} options={{ title: 'Tarefa' }} />
      <Stack.Screen
        name="NovoRegistroFinanceiro"
        component={NovoRegistroFinanceiroScreen}
        options={{ title: 'Novo gasto' }}
      />
    </Stack.Navigator>
  );
}
