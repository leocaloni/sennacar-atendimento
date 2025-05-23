import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Button } from "react-native-paper";
import { TelaComFundo } from "../../components/TelaComFundo";
import { useAuth } from "../../contexts/AuthContext";
import { useState } from "react";

export default function PerfilScreen() {
  const { user, logout } = useAuth();
  const [verIdCompleto, setVerIdCompleto] = useState(false);

  return (
    <TelaComFundo>
      <View style={styles.container}>
        <Text style={styles.titulo}>Meu perfil</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Nome</Text>
          <Text style={styles.valor}>{user?.nome || "-"}</Text>

          <Text style={styles.label}>ID</Text>
          <TouchableOpacity onPress={() => setVerIdCompleto(!verIdCompleto)}>
            <Text style={styles.valor}>
              {verIdCompleto
                ? user?.id
                : user?.id?.substring(0, 8) + "... (toque para ver)"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>Email</Text>
          <Text style={styles.valor}>{user?.email || "-"}</Text>
        </View>

        <Button
          mode="contained"
          buttonColor="#C62828"
          textColor="white"
          style={styles.botaoSair}
          onPress={logout}
        >
          Sair
        </Button>
      </View>
    </TelaComFundo>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  titulo: {
    fontSize: 26,
    color: "white",
    fontFamily: "Poppins_700Bold",
    marginBottom: 30,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
    marginHorizontal: 10,
    borderColor: "#017b36",
    borderWidth: 2,
  },
  label: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins_400Regular",
    marginTop: 10,
  },
  valor: {
    fontSize: 16,
    color: "#000",
    fontFamily: "Poppins_700Bold",
  },
  botaoSair: {
    borderRadius: 30,
    paddingVertical: 6,
    alignSelf: "center",
    width: 160,
  },
});
