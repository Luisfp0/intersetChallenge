import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import NovoClienteScreen from "../screens/NewClientScreen";
import NovaVistoriaScreen from "../screens/NewInspectionScreen";
import DetalhesVistoriaScreen from "../screens/ScreenInspectionDetails";
import SharedListScreen from "../screens/SharedListScreen";
import LoginScreen from "../screens/LoginScreen";

export type RootStackParamList = {
  Login: undefined;
  ClientList: undefined;
  Vistorias: undefined;
  NovaVistoria: undefined;
  NovoCliente: undefined;
  DetalhesVistoria: { vistoriaId: number };
  SharedList: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="SharedList"
          component={SharedListScreen}
          options={{ title: "Clientes e Vistorias" }}
        />
        <Stack.Screen
          name="NovoCliente"
          component={NovoClienteScreen}
          options={{
            title: "Novo Cliente",
          }}
        />
        <Stack.Screen
          name="NovaVistoria"
          component={NovaVistoriaScreen}
          options={{
            title: "Nova Vistoria",
          }}
        />
        <Stack.Screen
          name="DetalhesVistoria"
          component={DetalhesVistoriaScreen}
          options={{
            title: "Detalhes da Vistoria",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
