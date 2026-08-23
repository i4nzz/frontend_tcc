import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { FilhoStackNavigator } from './FilhoStackNavigator';
import { PerfilScreen } from '../screens/perfil/PerfilScreen';
import { colors } from '../theme';

const Drawer = createDrawerNavigator();

export function FilhoNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.text,
        drawerActiveBackgroundColor: colors.warningBg,
      }}
    >
      <Drawer.Screen
        name="FilhoInicio"
        component={FilhoStackNavigator}
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
          headerTintColor: colors.text,
          headerShadowVisible: false,
          drawerIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Drawer.Navigator>
  );
}
