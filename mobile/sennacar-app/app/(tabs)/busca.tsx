import { View, Text, StyleSheet } from "react-native";

export default function BuscaScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.texto}>Tela de Busca de Clientes</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  texto: {
    fontSize: 22,
    color: "#000",
  },
});
