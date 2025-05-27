import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useState, useCallback } from "react";
import { Text, Button, Portal, Dialog } from "react-native-paper";
import { TelaComFundo } from "../components/TelaComFundo";
import { api } from "./services/api";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";

export default function ListaClientesScreen() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [verIdCompleto, setVerIdCompleto] = useState<string | null>(null);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [feedbackExclusao, setFeedbackExclusao] = useState(false);
  const [idParaExcluir, setIdParaExcluir] = useState<string | null>(null);

  const carregarClientes = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/clientes/clientes/todos");
      setClientes(data);
    } catch (err) {
      console.error("Erro ao buscar clientes", err);
    } finally {
      setLoading(false);
    }
  };

  const excluirCliente = async () => {
    if (!idParaExcluir) return;
    try {
      await api.delete(`/clientes/clientes/${idParaExcluir}`);
      setClientes((prev) => prev.filter((func) => func._id !== idParaExcluir));
      setFeedbackExclusao(true);
    } catch (e) {
      console.error("Erro ao excluir", e);
    } finally {
      setConfirmarExclusao(false);
      setIdParaExcluir(null);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarClientes();
    }, [])
  );

  return (
    <TelaComFundo>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.botaoVoltar}
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      <Text style={styles.titulo}>Todos os Clientes</Text>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#fff" />
      ) : (
        <FlatList
          data={clientes}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.label}>ID</Text>
              <TouchableOpacity
                onPress={() =>
                  setVerIdCompleto((v) => (v === item._id ? null : item._id))
                }
              >
                <Text style={styles.valor}>
                  {verIdCompleto === item._id
                    ? item._id
                    : item._id.slice(0, 8) + "... (toque para ver)"}
                </Text>
              </TouchableOpacity>

              <Text style={styles.label}>Nome</Text>
              <Text style={styles.valor}>{item.nome}</Text>

              <Text style={styles.label}>Email</Text>
              <Text style={styles.valor}>{item.email}</Text>

              <Text style={styles.label}>Telefone</Text>
              <Text style={styles.valor}>{item.telefone}</Text>

              <View style={styles.acoes}>
                <Button
                  mode="contained"
                  style={[styles.botaoCard, { backgroundColor: "#000679" }]}
                  textColor="white"
                  onPress={() =>
                    router.push({
                      pathname: "/editarCliente",
                      params: { id: item._id },
                    })
                  }
                >
                  Editar
                </Button>
                <Button
                  mode="contained"
                  buttonColor="#C62828"
                  textColor="white"
                  style={styles.botaoCard}
                  onPress={() => {
                    setIdParaExcluir(item._id);
                    setConfirmarExclusao(true);
                  }}
                >
                  Excluir
                </Button>
              </View>
            </View>
          )}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        />
      )}

      <Portal>
        <Dialog
          visible={confirmarExclusao}
          onDismiss={() => setConfirmarExclusao(false)}
          style={{ backgroundColor: "white", borderRadius: 16 }}
        >
          <Dialog.Title
            style={{ fontFamily: "Poppins_700Bold", color: "#000" }}
          >
            Confirmar exclusão
          </Dialog.Title>
          <Dialog.Content>
            <Text style={{ fontFamily: "Poppins_400Regular", color: "#333" }}>
              Tem certeza que deseja excluir este funcionário?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setConfirmarExclusao(false)}
              textColor="#017b36"
            >
              Cancelar
            </Button>
            <Button onPress={excluirCliente} textColor="#C62828">
              Excluir
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={feedbackExclusao}
          onDismiss={() => setFeedbackExclusao(false)}
          style={{ backgroundColor: "white", borderRadius: 16 }}
        >
          <Dialog.Title
            style={{ fontFamily: "Poppins_700Bold", color: "#000" }}
          >
            Sucesso!
          </Dialog.Title>
          <Dialog.Content>
            <Text style={{ fontFamily: "Poppins_400Regular", color: "#333" }}>
              O funcionário foi excluído com sucesso.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setFeedbackExclusao(false)}
              textColor="#017b36"
            >
              Ok
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </TelaComFundo>
  );
}

const styles = StyleSheet.create({
  botaoVoltar: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 10,
    backgroundColor: "#017b36",
    borderRadius: 12,
    padding: 5,
  },
  titulo: {
    fontSize: 26,
    color: "white",
    fontFamily: "Poppins_700Bold",
    marginBottom: 30,
    marginTop: 60,
    alignSelf: "center",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: "#017b36",
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginTop: 10,
    fontFamily: "Poppins_400Regular",
  },
  valor: {
    fontSize: 16,
    color: "#000",
    fontFamily: "Poppins_700Bold",
  },
  acoes: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  botaoCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 30,
  },
});
