import { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { Text, TextInput, Button, Dialog, Portal } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { TelaComFundo } from "../components/TelaComFundo";
import { api } from "./services/api";
import CostumerIcon from "../assets/icons/costumer-grey.svg";
import ProductIcon from "../assets/icons/product-grey.svg";
import CalendarIcon from "../assets/icons/calendar-grey.svg";
import { Ionicons } from "@expo/vector-icons";
import {
  textInputProps,
  textInputPropsComLista,
  textInputPropsComListaAtiva,
} from "../styles/styles";
import { estilosGlobais } from "../styles/estilosGlobais";

type Cliente = { _id: string; nome: string };
type Produto = {
  _id: string;
  nome: string;
  preco?: number;
  preco_mao_obra?: number;
};

const useDebounce = (cb: (...a: any[]) => void, delay = 300) => {
  const timer = useRef<NodeJS.Timeout | null>(null);
  return (...args: any[]) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => cb(...args), delay);
  };
};

export default function CadastroAgendamento() {
  const router = useRouter();

  const [mostrarSucesso, setMostrarSucesso] = useState(false);
  const [mostrarDatePicker, setMostrarDatePicker] = useState(false);

  const [dataSelecionada, setDataSelecionada] = useState<Date | null>(null);
  const [dataTexto, setDataTexto] = useState("");
  const [horario, setHorario] = useState("");
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);

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
  const [valorTotal, setValorTotal] = useState<number>(0);

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

  useEffect(() => {
    const total = produtosSelecionados.reduce((acc, p) => {
      const preco = parseFloat(String(p.preco)) || 0;
      const mao = parseFloat(String(p.preco_mao_obra)) || 0;
      return acc + preco + mao;
    }, 0);
    setValorTotal(total);
  }, [produtosSelecionados]);

  const gerarHorarios = (dataStr: string) => {
    const dataObj = new Date(dataStr);
    const diaSemana = dataObj.getDay();
    const horarios: string[] = [];

    const addHorario = (h: number, m: number) => {
      const hh = h.toString().padStart(2, "0");
      const mm = m.toString().padStart(2, "0");
      horarios.push(`${hh}:${mm}`);
    };

    const inicio = 8;
    const fim = diaSemana === 6 ? 13 : 18;
    const max = diaSemana === 6 ? 12.5 : 17.5;

    for (let hora = inicio; hora <= max; hora += 0.5) {
      const h = Math.floor(hora);
      const m = hora % 1 === 0 ? 0 : 30;
      addHorario(h, m);
    }

    setHorariosDisponiveis(horarios);
  };

  const handleCadastrar = async () => {
    if (
      !dataTexto ||
      !horario ||
      !clienteSelecionado ||
      produtosSelecionados.length === 0
    )
      return;

    const dataAgendada = `${dataTexto}T${horario}:00`;

    await api.post("/agendamentos/agendamentos", null, {
      params: {
        cliente_id: clienteSelecionado._id,
        data_agendada: dataAgendada,
        produtos: produtosSelecionados.map((p) => p._id).join(","),
        valor_total: valorTotal.toFixed(2),
      },
    });

    setMostrarSucesso(true);
  };

  return (
    <TelaComFundo>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.botaoVoltar}
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text
            style={[
              estilosGlobais.tituloTela,
              { textAlign: "center", marginTop: 80 },
            ]}
          >
            Novo Agendamento
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
              <Text
                style={{
                  color: dataSelecionada ? "#000" : "#aaa",
                  fontFamily: "Poppins_400Regular",
                }}
              >
                {dataSelecionada
                  ? dataSelecionada.toLocaleDateString("pt-BR")
                  : "Selecionar data"}
              </Text>
            </View>
          </TouchableOpacity>

          {/* HORÁRIO */}
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
                    onPress={() => {
                      const novos = produtosSelecionados.filter(
                        (x) => x._id !== p._id
                      );
                      setProdutosSelecionados(novos);
                    }}
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
            style={estilosGlobais.botaoPadrao}
            onPress={handleCadastrar}
          >
            Agendar
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>

      {mostrarDatePicker && (
        <DateTimePicker
          mode="date"
          display="spinner"
          value={dataSelecionada ?? new Date()}
          onChange={(_, selectedDate) => {
            setMostrarDatePicker(false);
            if (selectedDate) {
              setDataSelecionada(selectedDate);
              const dataStr = selectedDate.toISOString().split("T")[0];
              setDataTexto(dataStr);
              gerarHorarios(dataStr);
            }
          }}
          locale="pt-BR"
        />
      )}

      <Portal>
        <Dialog
          visible={mostrarSucesso}
          onDismiss={() => setMostrarSucesso(false)}
        >
          <Dialog.Title style={{ textAlign: "center" }}>Agendado!</Dialog.Title>
          <Dialog.Content>
            <Text>Agendamento criado com sucesso!</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setMostrarSucesso(false);
                router.replace("/adminAgendamentos");
              }}
            >
              OK
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
    marginBottom: 20,
    backgroundColor: "white",
    borderRadius: 16,
    fontFamily: "Poppins_400Regular",
  },
  inputTouchable: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
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
    marginBottom: 20,
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
