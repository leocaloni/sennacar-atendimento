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
import { fontes } from "../styles/fontes";
import { cores } from "../styles/cores";

export default function ListaFuncionariosScreen() {
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [verIdCompleto, setVerIdCompleto] = useState<string | null>(null);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [feedbackExclusao, setFeedbackExclusao] = useState(false);
  const [idParaExcluir, setIdParaExcluir] = useState<string | null>(null);

  const carregarFuncionarios = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/funcionarios/funcionarios/");
      setFuncionarios(data);
    } catch (err) {
      console.error("Erro ao buscar funcionários", err);
    } finally {
      setLoading(false);
    }
  };

  const excluirFuncionario = async () => {
    if (!idParaExcluir) return;
    try {
      await api.delete(`/funcionarios/funcionarios/${idParaExcluir}`);
      setFuncionarios((prev) =>
        prev.filter((func) => func._id !== idParaExcluir)
      );
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
      carregarFuncionarios();
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

      <Text style={styles.titulo}>Todos os Funcionários</Text>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#fff" />
      ) : (
        <FlatList
          data={funcionarios}
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

              <Text style={styles.label}>Administrador</Text>
              <Text style={styles.valor}>{item.is_admin ? "Sim" : "Não"}</Text>

              <View style={styles.acoes}>
                <Button
                  mode="contained"
                  style={[styles.botaoCard, { backgroundColor: "#000679" }]}
                  textColor="white"
                  onPress={() =>
                    router.push({
                      pathname: "/editarFuncionario",
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
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitulo}>
            Confirmar exclusão
          </Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogTexto}>
              Tem certeza que deseja excluir este funcionário?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setConfirmarExclusao(false)}
              textColor={cores.verdePrincipal}
            >
              Cancelar
            </Button>
            <Button onPress={excluirFuncionario} textColor="#C62828">
              Excluir
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={feedbackExclusao}
          onDismiss={() => setFeedbackExclusao(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitulo}>Sucesso!</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogTexto}>
              O funcionário foi excluído com sucesso.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setFeedbackExclusao(false)}
              textColor={cores.verdePrincipal}
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
    backgroundColor: cores.verdePrincipal,
    borderRadius: 12,
    padding: 5,
  },
  titulo: {
    fontSize: 26,
    color: "white",
    fontFamily: fontes.bold,
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
    borderColor: cores.verdePrincipal,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginTop: 10,
    fontFamily: fontes.regular,
  },
  valor: {
    fontSize: 16,
    color: "#000",
    fontFamily: fontes.bold,
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
  dialog: {
    backgroundColor: "white",
    borderRadius: 16,
  },
  dialogTitulo: {
    fontFamily: fontes.bold,
    color: "#000",
  },
  dialogTexto: {
    fontFamily: fontes.regular,
    color: "#333",
  },
});
