import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { CadastroScreen } from '../screens/auth/CadastroScreen';
import { VerifiqueEmailScreen } from '../screens/auth/VerifiqueEmailScreen';
import { ConfirmarEmailScreen } from '../screens/auth/ConfirmarEmailScreen';
import { EsqueciSenhaScreen } from '../screens/auth/EsqueciSenhaScreen';
import { RedefinirSenhaScreen } from '../screens/auth/RedefinirSenhaScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

export function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Cadastro" component={CadastroScreen} options={{ title: 'Criar conta' }} />
      <Stack.Screen
        name="VerifiqueEmail"
        component={VerifiqueEmailScreen}
        options={{ title: 'Verifique seu e-mail', headerBackVisible: false }}
      />
      <Stack.Screen name="ConfirmarEmail" component={ConfirmarEmailScreen} options={{ title: 'Confirmação de e-mail' }} />
      <Stack.Screen name="EsqueciSenha" component={EsqueciSenhaScreen} options={{ title: 'Esqueci minha senha' }} />
      <Stack.Screen name="RedefinirSenha" component={RedefinirSenhaScreen} options={{ title: 'Nova senha' }} />
    </Stack.Navigator>
  );
}
