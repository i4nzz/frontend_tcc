import { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ListaTarefasScreen } from '../screens/tarefas/ListaTarefasScreen';
import { PontuacaoScreen } from '../screens/pontuacao/PontuacaoScreen';
import { RecompensasScreen } from '../screens/recompensas/RecompensasScreen';
import { FinanceiroScreen } from '../screens/financeiro/FinanceiroScreen';
import { JogosScreen } from '../screens/jogos/JogosScreen';
import { ModalEmDesenvolvimento } from '../screens/jogos/ModalEmDesenvolvimento';
import { colors } from '../theme';
import { useTema } from '../store/preferenciasStore';

const Tab = createBottomTabNavigator();

const ICONS = {
  Tarefas: 'checkbox-outline',
  Pontuacao: 'star-outline',
  Recompensas: 'gift-outline',
  Financeiro: 'wallet-outline',
  Jogos: 'game-controller-outline',
};

// Tela única usada tanto pelo Pai (com filhoId escolhido na Home) quanto pelo
// próprio Filho (com o filhoId derivado do JWT) — ver FilhoNavigator/PaiNavigator.
export function FilhoAreaTabs({ route, navigation }) {
  const { filhoId, nomeFilho } = route.params;
  const tema = useTema();
  const [jogosAberto, setJogosAberto] = useState(false);

  function fecharJogos() {
    setJogosAberto(false);
  }

  // Volta à raiz da pilha (Início): "Meus filhos" para o Pai, e para o Filho
  // a própria área de tarefas, que já é o início dele. O popToTop só é tratado
  // quando há telas acima da raiz; na raiz ele dispara um aviso do React Navigation.
  function voltarParaInicio() {
    setJogosAberto(false);
    if (navigation.getState().index > 0) {
      navigation.popToTop();
    }
  }

  return (
    <>
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
        {/* Jogos: o toque abre o modal em vez de trocar de aba. */}
        <Tab.Screen
          name="Jogos"
          component={JogosScreen}
          listeners={{
            tabPress: (evento) => {
              evento.preventDefault();
              setJogosAberto(true);
            },
          }}
        />
      </Tab.Navigator>

      <ModalEmDesenvolvimento visivel={jogosAberto} onFechar={fecharJogos} onVoltarInicio={voltarParaInicio} />
    </>
  );
}
