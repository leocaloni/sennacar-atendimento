import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useRef, useState, useEffect } from "react";
import {
  RadioButton,
  Button,
  Text,
  TextInput,
  Portal,
  Dialog,
} from "react-native-paper";
import { TelaComFundo } from "../components/TelaComFundo";
import { api } from "./services/api";
import { router } from "expo-router";
import {
  textInputPropsComLista,
  textInputPropsComListaAtiva,
} from "../styles/styles";
import CostumerIcon from "../assets/icons/costumer-grey.svg";
import ProductIcon from "../assets/icons/product-grey.svg";
import CalendarIcon from "../assets/icons/calendar-grey.svg";
import SearchIcon from "../assets/icons/search-white.svg";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import { fontes } from "../styles/fontes";
import { cores } from "../styles/cores";

export default function AdminAgendamentosScreen() {
  const [filtro, setFiltro] = useState<"cliente" | "produto" | "periodo">(
    "cliente"
  );
  const [valor, setValor] = useState("");
  const [itemSelecionado, setItemSelecionado] = useState<any>(null);
  const [dataInicio, setDataInicio] = useState<Date | null>(null);
  const [dataFim, setDataFim] = useState<Date | null>(null);
  const [showInicio, setShowInicio] = useState(false);
  const [showFim, setShowFim] = useState(false);
  const [sugestoes, setSugestoes] = useState<any[]>([]);
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [verIdCompleto, setVerIdCompleto] = useState<Record<string, boolean>>(
    {}
  );
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [feedbackExclusao, setFeedbackExclusao] = useState(false);
  const [idParaExcluir, setIdParaExcluir] = useState<string | null>(null);

  const useDebounce = (cb: (...a: any[]) => void, delay = 150) => {
    const timer = useRef<NodeJS.Timeout | null>(null);
    return (...args: any[]) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => cb(...args), delay);
    };
  };

  const debouncedBusca = useDebounce(async (texto: string) => {
    if (!texto) return setSugestoes([]);
    try {
      const endpoint =
        filtro === "cliente"
          ? "/clientes/clientes/busca"
          : "/produtos/produtos/filtrar";
      const { data } = await api.get(endpoint, {
        params: { nome: texto },
      });
      setSugestoes(data);
    } catch {
      setSugestoes([]);
    }
  });

  const buscarAgendamentos = async () => {
    setErro("");
    setAgendamentos([]);
    setLoading(true);
    try {
      if ((filtro === "cliente" || filtro === "produto") && itemSelecionado) {
        const rota =
          filtro === "cliente"
            ? `/agendamentos/agendamentos/cliente_id/${itemSelecionado._id}`
            : `/agendamentos/agendamentos/produto_id/${itemSelecionado._id}`;
        const { data } = await api.get(rota);
        setAgendamentos(await formatarAgendamentos(data));
      } else if (filtro === "periodo") {
        if (!dataInicio || !dataFim) {
          return;
        }

        const params = {
          data_inicio: format(dataInicio, "yyyy-MM-dd"),
          data_fim: format(dataFim, "yyyy-MM-dd"),
        };
        const { data } = await api.get("/agendamentos/agendamentos/periodo", {
          params,
        });
        setAgendamentos(await formatarAgendamentos(data));
      } else {
        setErro("Selecione uma opção válida.");
      }
    } catch (e) {
      console.error(e);
      setErro("Erro ao buscar agendamentos.");
    } finally {
      setLoading(false);
    }
  };

  const buscarAgendamentosCom = async (obj: any) => {
    setErro("");
    setAgendamentos([]);
    setLoading(true);
    try {
      const endpoint =
        filtro === "cliente"
          ? `/agendamentos/agendamentos/cliente_id/${obj._id}`
          : `/agendamentos/agendamentos/produto_id/${obj._id}`;
      const { data } = await api.get(endpoint);
      setAgendamentos(await formatarAgendamentos(data));
    } catch (e) {
      setErro("Erro ao buscar agendamentos.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filtro === "periodo" && dataInicio && dataFim) {
      buscarAgendamentos();
    }
  }, [dataInicio, dataFim]);

  const formatarAgendamentos = async (lista: any[]) => {
    return await Promise.all(
      lista.map(async (ag) => {
        let cliente = ag.cliente_id;
        let produtosNomes: string[] = [];
        try {
          const { data } = await api.get(`/clientes/clientes/${ag.cliente_id}`);
          cliente = data.nome;
        } catch {}
        try {
          produtosNomes = await Promise.all(
            ag.produtos.map(async (id: string) => {
              const { data } = await api.get(`/produtos/produtos/${id}`);
              return data.nome;
            })
          );
        } catch {}
        return {
          ...ag,
          cliente_nome: cliente,
          produtos_nomes: produtosNomes,
        };
      })
    );
  };

  const excluirAgendamento = async () => {
    if (!idParaExcluir) return;
    try {
      await api.delete(
        `/agendamentos/agendamentos/agendamento/${idParaExcluir}`
      );
      setAgendamentos((prev) => prev.filter((a) => a._id !== idParaExcluir));
      setFeedbackExclusao(true);
    } catch (e) {
      console.error("Erro ao excluir agendamento", e);
    } finally {
      setConfirmarExclusao(false);
      setIdParaExcluir(null);
    }
  };

  const IconComponent =
    filtro === "cliente"
      ? () => <CostumerIcon width={20} height={20} />
      : filtro === "produto"
      ? () => <ProductIcon width={20} height={20} />
      : () => <CalendarIcon width={20} height={20} />;

  const placeholder =
    filtro === "cliente"
      ? "Nome do cliente"
      : filtro === "produto"
      ? "Nome do produto"
      : "";

  return (
    <TelaComFundo>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.botaoVoltar}
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      <Text style={styles.titulo}>Agendamentos</Text>

      <RadioButton.Group
        onValueChange={(value) => {
          setFiltro(value as any);
          setValor("");
          setItemSelecionado(null);
          setAgendamentos([]);
          setSugestoes([]);
          setErro("");
        }}
        value={filtro}
      >
        <View style={styles.radioRow}>
          {["cliente", "produto", "periodo"].map((item) => (
            <View key={item} style={styles.radioOption}>
              <RadioButton
                color={cores.verdePrincipal}
                uncheckedColor="white"
                value={item}
              />
              <Text style={styles.radioLabel}>{item}</Text>
            </View>
          ))}
        </View>
      </RadioButton.Group>

      {filtro === "periodo" ? (
        <View style={{ gap: 12 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => setShowInicio(true)}
            >
              <TextInput
                {...textInputPropsComLista}
                placeholder="Início"
                value={dataInicio ? format(dataInicio, "dd/MM/yyyy") : ""}
                editable={false}
                pointerEvents="none"
                left={<TextInput.Icon icon={IconComponent} />}
                textColor="black"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => setShowFim(true)}
            >
              <TextInput
                {...textInputPropsComLista}
                placeholder="Fim"
                value={dataFim ? format(dataFim, "dd/MM/yyyy") : ""}
                editable={false}
                pointerEvents="none"
                left={<TextInput.Icon icon={IconComponent} />}
                textColor="black"
              />
            </TouchableOpacity>
          </View>

          {showInicio && (
            <DateTimePicker
              value={dataInicio || new Date()}
              mode="date"
              display="calendar"
              onChange={(_, date) => {
                setShowInicio(false);
                if (date) {
                  setDataInicio(date);
                  if (dataFim) {
                    setTimeout(() => buscarAgendamentos(), 0);
                  }
                }
              }}
            />
          )}
          {showFim && (
            <DateTimePicker
              value={dataFim || new Date()}
              mode="date"
              display="calendar"
              onChange={(_, date) => {
                setShowFim(false);
                if (date) {
                  setDataFim(date);
                  if (dataInicio) {
                    setTimeout(() => buscarAgendamentos(), 0);
                  }
                }
              }}
            />
          )}
        </View>
      ) : (
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <View style={{ flex: 1 }}>
            <TextInput
              {...(sugestoes.length > 0
                ? textInputPropsComListaAtiva
                : textInputPropsComLista)}
              placeholder={placeholder}
              value={valor}
              textColor="black"
              onChangeText={(t) => {
                setValor(t);
                setItemSelecionado(null);
                debouncedBusca(t);
              }}
              left={<TextInput.Icon icon={IconComponent} />}
            />

            {sugestoes.length > 0 && (
              <FlatList
                data={sugestoes}
                keyExtractor={(i) => i._id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.sugestaoItem}
                    onPress={() => {
                      setValor(item.nome);
                      setItemSelecionado(item);
                      setSugestoes([]);
                      buscarAgendamentosCom(item);
                    }}
                  >
                    <Text style={styles.sugestaoTexto}>{item.nome}</Text>
                  </TouchableOpacity>
                )}
                style={styles.listaSugestoes}
                scrollEnabled={false}
              />
            )}
          </View>

          <TouchableOpacity
            style={styles.botaoBusca}
            onPress={buscarAgendamentos}
          >
            <SearchIcon width={24} height={24} />
          </TouchableOpacity>
        </View>
      )}

      {erro ? <Text style={styles.erro}>{erro}</Text> : null}

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={agendamentos}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.label}>ID</Text>
              <TouchableOpacity
                onPress={() =>
                  setVerIdCompleto((prev) => ({
                    ...prev,
                    [item._id]: !prev[item._id],
                  }))
                }
              >
                <Text style={styles.valor}>
                  {verIdCompleto[item._id]
                    ? item._id
                    : item._id.slice(0, 8) + "... (toque para ver)"}
                </Text>
              </TouchableOpacity>

              <Text style={styles.label}>Data</Text>
              <Text style={styles.valor}>
                {format(new Date(item.data_agendada), "dd/MM/yyyy HH:mm")}
              </Text>

              <Text style={styles.label}>Cliente</Text>
              <Text style={styles.valor}>{item.cliente_nome}</Text>

              <Text style={styles.label}>Produtos</Text>
              <Text style={styles.valor}>{item.produtos_nomes.join(", ")}</Text>

              <Text style={styles.label}>Valor total</Text>
              <Text style={styles.valor}>R$ {item.valor_total.toFixed(2)}</Text>

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
                  buttonColor={cores.vermelho}
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
        />
      )}

      <View style={styles.botoesDuplos}>
        <Button
          mode="contained"
          buttonColor={cores.verdePrincipal}
          textColor="white"
          style={styles.botaoPequeno}
          onPress={() => router.push("/cadastroAgendamento")}
        >
          Novo
        </Button>
        <Button
          mode="contained"
          buttonColor={cores.verdePrincipal}
          textColor="white"
          style={styles.botaoPequeno}
          onPress={() => router.push("/listaAgendamentos")}
        >
          Exibir todos
        </Button>
      </View>

      <Portal>
        <Dialog
          visible={confirmarExclusao}
          onDismiss={() => setConfirmarExclusao(false)}
        >
          <Dialog.Title>Confirmar exclusão</Dialog.Title>
          <Dialog.Content>
            <Text>Deseja mesmo excluir este agendamento?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmarExclusao(false)}>
              Cancelar
            </Button>
            <Button onPress={excluirAgendamento} textColor={cores.vermelho}>
              Excluir
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={feedbackExclusao}
          onDismiss={() => setFeedbackExclusao(false)}
        >
          <Dialog.Title>Sucesso!</Dialog.Title>
          <Dialog.Content>
            <Text>Agendamento excluído com sucesso.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setFeedbackExclusao(false)}>Ok</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </TelaComFundo>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
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
    marginTop: 40,
    alignSelf: "center",
  },
  radioRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioLabel: {
    color: "white",
    fontSize: 16,
    fontFamily: fontes.regular,
    marginLeft: 4,
  },
  botaoBusca: {
    backgroundColor: cores.verdePrincipal,
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    marginTop: 4,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    marginHorizontal: 10,
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
  erro: {
    color: "white",
    marginBottom: 20,
    textAlign: "center",
    fontFamily: fontes.regular,
  },
  listaSugestoes: {
    backgroundColor: "white",
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: "#A0A0A0",
    maxHeight: 250,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sugestaoItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  sugestaoTexto: {
    fontFamily: fontes.regular,
    fontSize: 15,
    color: "#333",
  },
  botoesDuplos: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 20,
  },
  botaoPequeno: {
    width: 150,
    borderRadius: 30,
    marginTop: 5,
  },
});
