import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomePaiScreen } from '../screens/pai/HomePaiScreen';
import { CadastrarFilhoScreen } from '../screens/pai/CadastrarFilhoScreen';
import { FilhoAreaTabs } from './FilhoAreaTabs';
import { DetalheTarefaScreen } from '../screens/tarefas/DetalheTarefaScreen';
import { CriarEditarTarefaScreen } from '../screens/tarefas/CriarEditarTarefaScreen';
import { CriarEditarRecompensaScreen } from '../screens/recompensas/CriarEditarRecompensaScreen';
import { NovoRegistroFinanceiroScreen } from '../screens/financeiro/NovoRegistroFinanceiroScreen';
import { LogoutButton } from '../components/LogoutButton';
import { MenuButton } from '../components/MenuButton';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

export function PaiStackNavigator({ navigation: drawerNavigation }) {
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
        name="HomePai"
        component={HomePaiScreen}
        options={{
          title: 'Meus filhos',
          headerLeft: () => <MenuButton onPress={() => drawerNavigation.toggleDrawer()} />,
          headerRight: () => <LogoutButton />,
        }}
      />
      <Stack.Screen name="CadastrarFilho" component={CadastrarFilhoScreen} options={{ title: 'Cadastrar filho' }} />
      <Stack.Screen
        name="FilhoArea"
        component={FilhoAreaTabs}
        options={({ route }) => ({ title: route.params?.nomeFilho ?? 'Filho' })}
      />
      <Stack.Screen name="DetalheTarefa" component={DetalheTarefaScreen} options={{ title: 'Tarefa' }} />
      <Stack.Screen
        name="CriarEditarTarefa"
        component={CriarEditarTarefaScreen}
        options={({ route }) => ({ title: route.params?.tarefaId ? 'Editar tarefa' : 'Nova tarefa' })}
      />
      <Stack.Screen
        name="CriarEditarRecompensa"
        component={CriarEditarRecompensaScreen}
        options={({ route }) => ({ title: route.params?.recompensaId ? 'Editar recompensa' : 'Nova recompensa' })}
      />
      <Stack.Screen
        name="NovoRegistroFinanceiro"
        component={NovoRegistroFinanceiroScreen}
        options={{ title: 'Novo gasto' }}
      />
    </Stack.Navigator>
  );
}
