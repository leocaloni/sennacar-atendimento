import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState, useMemo } from "react";
import { Text, Button, Portal, Dialog } from "react-native-paper";
import { useRouter } from "expo-router";
import { TelaComFundo } from "../components/TelaComFundo";
import { api } from "./services/api";
import { Ionicons, Feather } from "@expo/vector-icons";
import { format } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";

const opcoesOrdenacao = [
  "Mais recente",
  "Mais antigo",
  "Preço mais caro",
  "Preço mais barato",
  "Cliente (A-Z)",
];

// Tela de listagem de agendamentos: permite visualizar, ordenar, editar e excluir agendamentos.
export default function ListaAgendamentosScreen() {
  const router = useRouter();
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [ordenacaoSelecionada, setOrdenacaoSelecionada] = useState(
    opcoesOrdenacao[0]
  );
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [loading, setLoading] = useState(false);

  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [feedbackExclusao, setFeedbackExclusao] = useState(false);
  const [idParaExcluir, setIdParaExcluir] = useState<string | null>(null);

  useEffect(() => {
    carregarAgendamentos();
  }, []);

  const carregarAgendamentos = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/agendamentos/agendamentos");
      const agsComDetalhes = await Promise.all(
        data.map(async (ag: any) => {
          let clienteNome = ag.cliente_id;
          try {
            const { data } = await api.get(
              `/clientes/clientes/${ag.cliente_id}`
            );
            clienteNome = data.nome;
          } catch {}

          let nomesProdutos: string[] = [];
          try {
            nomesProdutos = await Promise.all(
              ag.produtos.map(async (id: string) => {
                const { data } = await api.get(`/produtos/produtos/${id}`);
                return data.nome;
              })
            );
          } catch {}

          return {
            ...ag,
            cliente_nome: clienteNome,
            produtos_nomes: nomesProdutos,
          };
        })
      );
      setAgendamentos(agsComDetalhes);
    } catch (err) {
      console.error("Erro ao carregar agendamentos:", err);
    } finally {
      setLoading(false);
    }
  };

  const excluirAgendamento = async () => {
    if (!idParaExcluir) return;
    try {
      await api.delete(
        `/agendamentos/agendamentos/agendamento/${idParaExcluir}`
      );
      setAgendamentos((prev) => prev.filter((ag) => ag._id !== idParaExcluir));
      setFeedbackExclusao(true);
    } catch (e) {
      console.error("Erro ao excluir agendamento", e);
    } finally {
      setConfirmarExclusao(false);
      setIdParaExcluir(null);
    }
  };

  const agendamentosOrdenados = useMemo(() => {
    const copia = [...agendamentos];
    switch (ordenacaoSelecionada) {
      case "Mais recente":
        return copia.sort(
          (a, b) =>
            new Date(b.data_agendada).getTime() -
            new Date(a.data_agendada).getTime()
        );
      case "Mais antigo":
        return copia.sort(
          (a, b) =>
            new Date(a.data_agendada).getTime() -
            new Date(b.data_agendada).getTime()
        );
      case "Preço mais caro":
        return copia.sort((a, b) => b.valor_total - a.valor_total);
      case "Preço mais barato":
        return copia.sort((a, b) => a.valor_total - b.valor_total);
      case "Cliente (A-Z)":
        return copia.sort((a, b) =>
          a.cliente_nome.localeCompare(b.cliente_nome)
        );
      default:
        return copia;
    }
  }, [agendamentos, ordenacaoSelecionada]);

  return (
    <TelaComFundo>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.botaoVoltar}
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      <Text style={styles.titulo}>Todos os Agendamentos</Text>

      {/* Dropdown de ordenação */}
      <View style={{ zIndex: 2 }}>
        <TouchableOpacity
          style={[
            styles.dropdownBotao,
            dropdownAberto && styles.dropdownBotaoAberto,
            { marginBottom: dropdownAberto ? 0 : 20 },
          ]}
          onPress={() => setDropdownAberto(!dropdownAberto)}
        >
          <Text style={styles.dropdownTexto}>{ordenacaoSelecionada}</Text>
          <Feather name="chevron-down" size={20} color="#017b36" />
        </TouchableOpacity>

        {dropdownAberto && (
          <FlatList
            data={opcoesOrdenacao}
            keyExtractor={(item) => item}
            style={styles.dropdownLista}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.sugestaoItem}
                onPress={() => {
                  setOrdenacaoSelecionada(item);
                  setDropdownAberto(false);
                }}
              >
                <Text style={styles.sugestaoTexto}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} color="#017b36" />
      ) : (
        <FlatList
          data={agendamentosOrdenados}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const dataHoraUTC = new Date(item.data_agendada);
            const dataHoraLocal = new Date(
              dataHoraUTC.getTime() - dataHoraUTC.getTimezoneOffset() * 60000
            );
            return (
              <View style={styles.card}>
                <Text style={styles.label}>Cliente</Text>
                <Text style={styles.valor}>{item.cliente_nome}</Text>

                <Text style={styles.label}>Data</Text>
                <Text style={styles.valor}>
                  {format(dataHoraLocal, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </Text>

                <Text style={styles.label}>Produtos</Text>
                <Text style={styles.valor}>
                  {item.produtos_nomes.join(", ")}
                </Text>

                <Text style={styles.label}>Valor total</Text>
                <Text style={styles.valor}>
                  R$ {item.valor_total.toFixed(2)}
                </Text>
                <View style={styles.acoes}>
                  <Button
                    mode="contained"
                    style={[styles.botaoCard, { backgroundColor: "#000679" }]}
                    textColor="white"
                    onPress={() =>
                      router.push({
                        pathname: "/editarAgendamento",
                        params: { id: item._id },
                      })
                    }
                  >
                    Editar
                  </Button>

                  <Button
                    mode="contained"
                    buttonColor="#b00020"
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
            );
          }}
        />
      )}
      <Portal>
        <Dialog
          visible={confirmarExclusao}
          onDismiss={() => setConfirmarExclusao(false)}
          style={{ backgroundColor: "white", borderRadius: 16 }}
        >
          <Dialog.Title style={{ fontWeight: "bold", color: "#000" }}>
            Confirmar exclusão
          </Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: "#333" }}>
              Deseja mesmo excluir este agendamento?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              textColor="#017b36"
              onPress={() => setConfirmarExclusao(false)}
            >
              Cancelar
            </Button>
            <Button textColor="#b00020" onPress={excluirAgendamento}>
              Excluir
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={feedbackExclusao}
          onDismiss={() => setFeedbackExclusao(false)}
          style={{ backgroundColor: "white", borderRadius: 16 }}
        >
          <Dialog.Title style={{ fontWeight: "bold", color: "#000" }}>
            Sucesso!
          </Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: "#333" }}>
              Agendamento excluído com sucesso.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              textColor="#017b36"
              onPress={() => setFeedbackExclusao(false)}
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
  titulo: {
    fontSize: 26,
    color: "white",
    fontFamily: "Poppins_700Bold",
    marginBottom: 20,
    marginTop: 40,
    textAlign: "center",
  },
  dropdownBotao: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 20,
    borderWidth: 1.5,
    borderColor: "#017b36",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dropdownBotaoAberto: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  dropdownTexto: {
    fontFamily: "Poppins_700Bold",
    fontSize: 15,
    color: "#017b36",
  },
  dropdownLista: {
    backgroundColor: "white",
    maxHeight: 250,
    marginHorizontal: 20,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: "#017b36",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginBottom: 20,
  },
  sugestaoItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  sugestaoTexto: {
    fontFamily: "Poppins_400Regular",
    fontSize: 15,
    color: "#333",
  },
  lista: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
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
  botaoVoltar: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 10,
    backgroundColor: "#017b36",
    borderRadius: 12,
    padding: 5,
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
