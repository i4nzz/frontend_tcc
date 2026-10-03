import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { PaiStackNavigator } from './PaiStackNavigator';
import { PerfilScreen } from '../screens/perfil/PerfilScreen';
import { OpcoesScreen } from '../screens/opcoes/OpcoesScreen';
import { colors, headerTitle } from '../theme';
import { useTema } from '../store/preferenciasStore';

const Drawer = createDrawerNavigator();

export function PaiNavigator() {
  const tema = useTema();
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: tema.primary,
        drawerInactiveTintColor: colors.text,
        drawerActiveBackgroundColor: colors.warningBg,
      }}
    >
      <Drawer.Screen
        name="PaiInicio"
        component={PaiStackNavigator}
        options={{
          title: 'Início',
          drawerIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{
          headerShown: true,
          title: 'Perfil',
          headerStyle: { backgroundColor: colors.surface },
          headerTitleStyle: headerTitle,
          headerTintColor: colors.text,
          headerShadowVisible: false,
          drawerIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Opcoes"
        component={OpcoesScreen}
        options={{
          headerShown: true,
          title: 'Opções',
          headerStyle: { backgroundColor: colors.surface },
          headerTitleStyle: headerTitle,
          headerTintColor: colors.text,
          headerShadowVisible: false,
          drawerIcon: ({ color, size }) => <Ionicons name="options-outline" size={size} color={color} />,
        }}
      />
    </Drawer.Navigator>
  );
}
