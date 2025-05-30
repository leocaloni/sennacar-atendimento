import { View, StyleSheet } from "react-native";
import { Text, Button } from "react-native-paper";
import { useRouter } from "expo-router";
import { TelaComFundo } from "../../components/TelaComFundo";
import { estilosGlobais } from "../../styles/estilosGlobais";

import MechanicIcon from "../../assets/icons/mechanic-green.svg";
import CustomerIcon from "../../assets/icons/costumer-green.svg";
import CalendarIcon from "../../assets/icons/calendar-green.svg";
import ProductIcon from "../../assets/icons/product-green.svg";

// Tela de administração: permite acesso às áreas de gerenciamento
export default function AdminScreen() {
  const router = useRouter();

  return (
    <TelaComFundo>
      <View style={styles.container}>
        <Text style={estilosGlobais.tituloTela}>
          Gerenciamento {"\n"} do sistema
        </Text>

        <View style={styles.centralizar}>
          <Text style={estilosGlobais.subtituloTela}>
            Selecione uma opção para gerenciar:
          </Text>

          {/* Botões para telas de admin */}
          <View style={styles.grid}>
            {[
              {
                label: "Funcionários",
                Icon: MechanicIcon,
                onPress: () => router.push("/adminFuncionarios"),
              },
              {
                label: "Clientes",
                Icon: CustomerIcon,
                onPress: () => router.push("/adminClientes"),
              },
              {
                label: "Agendamentos",
                Icon: CalendarIcon,
                onPress: () => router.push("/adminAgendamentos"),
              },
              {
                label: "Produtos",
                Icon: ProductIcon,
                onPress: () => router.push("/adminProdutos"),
              },
            ].map(({ label, Icon, onPress }, idx) => (
              <View key={idx} style={styles.cardWrapperStyle}>
                <Button
                  mode="contained"
                  buttonColor="#017b36"
                  textColor="white"
                  onPress={onPress}
                  style={styles.botao}
                  contentStyle={styles.botaoContent}
                >
                  <View style={styles.conteudoBotao}>
                    <Icon width={48} height={48} />
                    <Text style={styles.textoBotao}>{label}</Text>
                  </View>
                </Button>
              </View>
            ))}
          </View>
        </View>
      </View>
    </TelaComFundo>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: 40,
  },
  centralizar: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  cardWrapperStyle: {
    width: 158,
    height: 158,
    marginHorizontal: 6,
    marginBottom: 16,
  },
  botao: {
    borderRadius: 20,
    flex: 1,
  },
  botaoContent: {
    flexDirection: "column",
    justifyContent: "center",
    height: "100%",
  },
  conteudoBotao: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  textoBotao: {
    color: "white",
    fontFamily: "Poppins_700Bold",
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
    flexWrap: "wrap",
    flexShrink: 1,
    width: "100%",
    lineHeight: 18,
  },
});
