import { View, Text, StyleSheet } from "react-native";

export default function AgendamentosScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.texto}>Tela de Agendamentos</Text>
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
