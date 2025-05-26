// app/admin/index.tsx
import { View, StyleSheet } from "react-native";
import { Text, Button } from "react-native-paper";
import { useRouter } from "expo-router";
import { TelaComFundo } from "../../components/TelaComFundo";

export default function AdminScreen() {
  const router = useRouter();

  return (
    <TelaComFundo>
      <View style={styles.container}>
        <Text style={styles.titulo}>Gerenciamento do sistema</Text>

        <View style={styles.conteudoCentralizado}>
          <Text style={styles.subtitulo}>
            Selecione uma opção para gerenciar:
          </Text>

          <Button
            mode="contained"
            buttonColor="#017b36"
            textColor="white"
            style={styles.botao}
            onPress={() => router.push("/adminFuncionarios")}
          >
            Funcionários
          </Button>

          <Button
            mode="contained"
            buttonColor="#017b36"
            textColor="white"
            style={styles.botao}
            onPress={() => router.push("/adminClientes")}
          >
            Clientes
          </Button>

          <Button
            mode="contained"
            buttonColor="#017b36"
            textColor="white"
            style={styles.botao}
            onPress={() => router.push("/adminAgendamentos")}
          >
            Agendamentos
          </Button>

          <Button
            mode="contained"
            buttonColor="#017b36"
            textColor="white"
            style={styles.botao}
            onPress={() => router.push("/adminProdutos")}
          >
            Produtos
          </Button>
        </View>
      </View>
    </TelaComFundo>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  conteudoCentralizado: {
    alignItems: "center",
    marginTop: 30,
  },
  titulo: {
    fontSize: 26,
    color: "white",
    fontFamily: "Poppins_700Bold",
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 16,
    color: "white",
    fontFamily: "Poppins_400Regular",
    marginBottom: 30,
    textAlign: "center",
  },
  botao: {
    width: 240,
    marginVertical: 8,
    borderRadius: 30,
    paddingVertical: 6,
  },
});
