import { Stack } from "expo-router";
import { AuthProvider } from "../contexts/AuthContext";
import {
  useFonts,
  Poppins_700Bold,
  Poppins_400Regular,
} from "@expo-google-fonts/poppins";
import { View, ActivityIndicator } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider as PaperProvider } from "react-native-paper";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_700Bold,
    Poppins_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#000679" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider>
        <AuthProvider>
          <Stack>
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="cadastroCliente"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="detalheDia" options={{ headerShown: false }} />
            <Stack.Screen
              name="novoAgendamento"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="adminClientes"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="adminAgendamentos"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="adminProdutos"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="adminFuncionarios"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="cadastroFuncionario"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="listaFuncionarios"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="editarFuncionario"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="editarCliente"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="listaClientes"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="cadastroProduto"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="edtiarProduto"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="listaProdutos"
              options={{ headerShown: false }}
            />
          </Stack>
        </AuthProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
