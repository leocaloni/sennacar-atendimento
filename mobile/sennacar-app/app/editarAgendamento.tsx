import { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Keyboard,
  FlatList,
} from "react-native";
import { Text, TextInput, Button, Portal, Dialog } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { api } from "./services/api";
import CostumerIcon from "../assets/icons/costumer-grey.svg";
import ProductIcon from "../assets/icons/product-grey.svg";
import CalendarIcon from "../assets/icons/calendar-grey.svg";
import { Ionicons } from "@expo/vector-icons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { TelaComFundo } from "../components/TelaComFundo";
import { estilosGlobais } from "../styles/estilosGlobais";
import {
  textInputPropsComLista,
  textInputPropsComListaAtiva,
} from "../styles/styles";

type Cliente = { _id: string; nome: string };
type Produto = {
  _id: string;
  nome: string;
  preco?: number;
  preco_mao_obra?: number;
};

const useDebounce = (cb: (...args: any[]) => void, delay = 300) => {
  const timer = useRef<NodeJS.Timeout | null>(null);
  return (...args: any[]) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => cb(...args), delay);
  };
};

export default function EditarAgendamento() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [carregado, setCarregado] = useState(false);

  const [clienteInput, setClienteInput] = useState("");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(
    null
  );

  const [produtoInput, setProdutoInput] = useState("");
  const [sugestoesProdutos, setSugestoesProdutos] = useState<Produto[]>([]);
  const [produtosSelecionados, setProdutosSelecionados] = useState<Produto[]>(
    []
  );

  const [dataSelecionada, setDataSelecionada] = useState<Date | null>(null);
  const [dataTexto, setDataTexto] = useState("");
  const [horario, setHorario] = useState("");
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);

  const [valorTotal, setValorTotal] = useState(0);
  const [mostrarDatePicker, setMostrarDatePicker] = useState(false);

  const [confirmarEdicao, setConfirmarEdicao] = useState(false);
  const [feedbackEdicao, setFeedbackEdicao] = useState(false);
  const [erro, setErro] = useState("");
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  const debouncedBuscaClientes = useDebounce(async (texto: string) => {
    if (!texto) return setClientes([]);
    const { data } = await api.get("/clientes/clientes/busca", {
      params: { nome: texto },
    });
    setClientes(data);
  });

  const debouncedBuscaProdutos = useDebounce(async (texto: string) => {
    if (!texto) return setSugestoesProdutos([]);
    const { data } = await api.get("/produtos/produtos/filtrar", {
      params: { nome: texto },
    });
    setSugestoesProdutos(data);
  });

  const buscarHorariosDisponiveis = async (dataStr: string) => {
    try {
      const { data } = await api.get("/agendamentos/agendamentos/horarios", {
        params: { data: dataStr },
      });
      setHorariosDisponiveis(data.horarios);
    } catch {
      setHorariosDisponiveis([]);
    }
  };

  useEffect(() => {
    const carregarAgendamento = async () => {
      const { data } = await api.get(
        `/agendamentos/agendamentos/agendamento/${id}`
      );
      const dataAgendada = new Date(data.data_agendada);

      const dataStr = dataAgendada.toLocaleDateString("en-CA");
      setDataTexto(dataStr);
      setDataSelecionada(dataAgendada);
      await buscarHorariosDisponiveis(dataStr);

      setHorariosDisponiveis((prevHorarios) => {
        const jaTem = prevHorarios.includes(hora);
        return jaTem ? prevHorarios : [hora, ...prevHorarios];
      });

      const dataLocal = new Date(
        dataAgendada.getTime() - dataAgendada.getTimezoneOffset() * 60000
      );
      const hora = dataLocal.toTimeString().slice(0, 5);
      setHorario(hora);

      const clienteRes = await api.get(`/clientes/clientes/${data.cliente_id}`);
      const cliente = clienteRes.data;
      setClienteSelecionado(cliente);
      setClienteInput(cliente.nome);

      const produtosDetalhados = await Promise.all(
        data.produtos.map(async (pid: string) => {
          const res = await api.get(`/produtos/produtos/${pid}`);
          return res.data;
        })
      );
      setProdutosSelecionados(produtosDetalhados);

      setCarregado(true);
    };

    if (id) carregarAgendamento();
  }, [id]);

  useEffect(() => {
    const total = produtosSelecionados.reduce((acc, p) => {
      const preco = parseFloat(String(p.preco)) || 0;
      const mao = parseFloat(String(p.preco_mao_obra)) || 0;
      return acc + preco + mao;
    }, 0);
    setValorTotal(total);
  }, [produtosSelecionados]);

  const confirmarAtualizacao = async () => {
    if (
      !dataTexto ||
      !horario ||
      !clienteSelecionado ||
      produtosSelecionados.length === 0
    ) {
      setErro("Preencha todos os campos obrigatórios.");
      setConfirmarEdicao(false);
      return;
    }

    const [ano, mes, dia] = dataTexto.split("-");
    const [hora, minuto] = horario.split(":");

    const dataLocal = new Date(
      Number(ano),
      Number(mes) - 1,
      Number(dia),
      Number(hora),
      Number(minuto)
    );

    const dataAgendada = dataLocal.toISOString();

    try {
      await api.put(`/agendamentos/agendamentos/agendamento/${id}`, {
        data_agendada: dataAgendada,
        valor_total: valorTotal.toFixed(2),
      });

      setFeedbackEdicao(true);
    } catch (e) {
      setErro("Erro ao atualizar agendamento.");
      console.error(e);
    } finally {
      setConfirmarEdicao(false);
    }
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (e) => {
        setKeyboardOffset(e.endCoordinates.height);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardOffset(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardOffset(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardOffset(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  if (!carregado) {
    return (
      <TelaComFundo>
        <Text
          style={[
            estilosGlobais.tituloTela,
            { marginTop: 100, textAlign: "center" },
          ]}
        >
          Carregando agendamento...
        </Text>
      </TelaComFundo>
    );
  }

  return (
    <TelaComFundo>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.botaoVoltar}
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      <FlatList
        data={[{}]}
        keyExtractor={(_, index) => index.toString()}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={<View style={{ height: 40 }} />}
        renderItem={() => (
          <View style={styles.container}>
            <Text
              style={[
                estilosGlobais.tituloTela,
                { textAlign: "center", marginTop: 80 },
              ]}
            >
              Editar Agendamento
            </Text>

            {/* DATA */}
            <TouchableOpacity
              onPress={() => setMostrarDatePicker(true)}
              style={styles.inputTouchable}
            >
              <View style={styles.inputComIcone}>
                <CalendarIcon
                  width={20}
                  height={20}
                  style={{ marginRight: 10 }}
                />
                <Text style={{ color: dataSelecionada ? "#000" : "#aaa" }}>
                  {dataSelecionada
                    ? dataSelecionada.toLocaleDateString("pt-BR")
                    : "Selecionar data"}
                </Text>
              </View>
            </TouchableOpacity>

            {/* HORÁRIOS */}
            {horariosDisponiveis.length > 0 && (
              <View style={styles.listaHorario}>
                {horariosDisponiveis.map((h) => (
                  <TouchableOpacity
                    key={h}
                    onPress={() => setHorario(h)}
                    style={[
                      styles.opcaoHorario,
                      horario === h && styles.opcaoHorarioSelecionada,
                    ]}
                  >
                    <Text style={styles.textoHorario}>{h}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* CLIENTE */}
            <TextInput
              {...(clientes.length > 0
                ? textInputPropsComListaAtiva
                : textInputPropsComLista)}
              placeholder="Buscar cliente"
              value={clienteInput}
              onChangeText={(t) => {
                setClienteInput(t);
                debouncedBuscaClientes(t);
              }}
              left={
                <TextInput.Icon
                  icon={() => <CostumerIcon width={20} height={20} />}
                />
              }
              style={styles.input}
              textColor="black"
            />
            {clientes.length > 0 && (
              <View style={estilosGlobais.listaSugestoes}>
                {clientes.map((c) => (
                  <TouchableOpacity
                    key={c._id}
                    onPress={() => {
                      setClienteSelecionado(c);
                      setClienteInput(c.nome);
                      setClientes([]);
                      Keyboard.dismiss();
                    }}
                    style={estilosGlobais.sugestaoItem}
                  >
                    <Text style={estilosGlobais.sugestaoTexto}>{c.nome}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* PRODUTOS */}
            <TextInput
              {...(sugestoesProdutos.length > 0
                ? textInputPropsComListaAtiva
                : textInputPropsComLista)}
              placeholder="Buscar produto"
              value={produtoInput}
              onChangeText={(t) => {
                setProdutoInput(t);
                debouncedBuscaProdutos(t);
              }}
              left={
                <TextInput.Icon
                  icon={() => <ProductIcon width={20} height={20} />}
                />
              }
              style={styles.input}
              textColor="black"
            />
            {sugestoesProdutos.length > 0 && (
              <View style={estilosGlobais.listaSugestoes}>
                {sugestoesProdutos.map((p) => (
                  <TouchableOpacity
                    key={p._id}
                    onPress={() => {
                      setProdutosSelecionados((prev) => [...prev, p]);
                      setProdutoInput("");
                      setSugestoesProdutos([]);
                      Keyboard.dismiss();
                    }}
                    style={estilosGlobais.sugestaoItem}
                  >
                    <Text style={estilosGlobais.sugestaoTexto}>{p.nome}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* PRODUTOS SELECIONADOS */}
            {produtosSelecionados.length > 0 && (
              <View style={styles.produtosSelecionados}>
                <Text style={styles.subtitulo}>Selecionados:</Text>
                {produtosSelecionados.map((p) => (
                  <View key={p._id} style={styles.produtoLinha}>
                    <Text style={styles.resultadoSelecionado}>• {p.nome}</Text>
                    <TouchableOpacity
                      onPress={() =>
                        setProdutosSelecionados((prev) =>
                          prev.filter((x) => x._id !== p._id)
                        )
                      }
                    >
                      <Ionicons name="close-circle" size={20} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}
                <Text style={styles.totalValor}>
                  Total: R$ {valorTotal.toFixed(2)}
                </Text>
              </View>
            )}

            <Button
              mode="contained"
              buttonColor="#017b36"
              textColor="white"
              style={[estilosGlobais.botaoPadrao, { marginTop: 40 }]}
              onPress={() => setConfirmarEdicao(true)}
            >
              Atualizar
            </Button>
          </View>
        )}
      />

      <DateTimePickerModal
        isVisible={mostrarDatePicker}
        mode="date"
        onConfirm={(selectedDate) => {
          setMostrarDatePicker(false);
          if (selectedDate) {
            setDataSelecionada(selectedDate);
            const dataStr = selectedDate.toLocaleDateString("en-CA");
            setDataTexto(dataStr);
            buscarHorariosDisponiveis(dataStr);
          }
        }}
        onCancel={() => setMostrarDatePicker(false)}
        themeVariant="light"
        locale="pt-BR"
      />

      <Portal>
        {/* Modal de erro */}
        <Dialog
          visible={!!erro}
          onDismiss={() => setErro("")}
          style={{ backgroundColor: "white", borderRadius: 16 }}
        >
          <Dialog.Title style={{ fontWeight: "bold", color: "#000" }}>
            Erro
          </Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: "#333" }}>{erro}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button textColor="#017b36" onPress={() => setErro("")}>
              OK
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Modal de confirmação */}
        <Dialog
          visible={confirmarEdicao}
          onDismiss={() => setConfirmarEdicao(false)}
          style={{ backgroundColor: "white", borderRadius: 16 }}
        >
          <Dialog.Title style={{ fontWeight: "bold", color: "#000" }}>
            Confirmar edição
          </Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: "#333" }}>
              Tem certeza que deseja atualizar este agendamento?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              textColor="#017b36"
              onPress={() => setConfirmarEdicao(false)}
            >
              Cancelar
            </Button>
            <Button textColor="#000679" onPress={confirmarAtualizacao}>
              Atualizar
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Modal de feedback */}
        <Dialog
          visible={feedbackEdicao}
          onDismiss={() => {
            setFeedbackEdicao(false);
            router.back();
          }}
          style={{ backgroundColor: "white", borderRadius: 16 }}
        >
          <Dialog.Title style={{ fontWeight: "bold", color: "#000" }}>
            Sucesso!
          </Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: "#333" }}>
              Agendamento atualizado com sucesso.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              textColor="#017b36"
              onPress={() => {
                setFeedbackEdicao(false);
                router.back();
              }}
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
  container: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 100,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 16,
    fontFamily: "Poppins_400Regular",
    marginTop: 20,
  },
  inputTouchable: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
  },
  inputComIcone: {
    flexDirection: "row",
    alignItems: "center",
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
  produtosSelecionados: {
    marginTop: 8,
    marginBottom: 12,
  },
  produtoLinha: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resultadoSelecionado: {
    color: "white",
    paddingVertical: 6,
    fontFamily: "Poppins_400Regular",
  },
  subtitulo: {
    fontFamily: "Poppins_600SemiBold",
    color: "white",
    marginBottom: 4,
  },
  totalValor: {
    fontFamily: "Poppins_600SemiBold",
    color: "white",
    marginTop: 8,
    fontSize: 16,
  },
  listaHorario: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 20,
  },
  opcaoHorario: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "white",
  },
  opcaoHorarioSelecionada: {
    backgroundColor: "#017b36",
  },
  textoHorario: {
    color: "black",
    fontFamily: "Poppins_400Regular",
  },
});
