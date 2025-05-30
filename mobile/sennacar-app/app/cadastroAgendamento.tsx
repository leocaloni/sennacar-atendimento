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
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useRouter } from "expo-router";
import { TelaComFundo } from "../components/TelaComFundo";
import { api } from "./services/api";
import CostumerIcon from "../assets/icons/costumer-grey.svg";
import ProductIcon from "../assets/icons/product-grey.svg";
import CalendarIcon from "../assets/icons/calendar-grey.svg";
import { Ionicons } from "@expo/vector-icons";
import {
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

// Tela de cadastro de agendamento: seleção de cliente, produtos, data, horário e envio
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

  //busca horários disponíveis
  const buscarHorariosDisponiveis = async (dataStr: string) => {
    try {
      const { data } = await api.get("/agendamentos/agendamentos/horarios", {
        params: { data: dataStr },
      });
      setHorariosDisponiveis(data.horarios);
    } catch (error) {
      console.error("Erro ao buscar horários:", error);
      setHorariosDisponiveis([]);
    }
  };

  useEffect(() => {
    const total = produtosSelecionados.reduce((acc, p) => {
      const preco = parseFloat(String(p.preco)) || 0;
      const mao = parseFloat(String(p.preco_mao_obra)) || 0;
      return acc + preco + mao;
    }, 0);
    setValorTotal(total);
  }, [produtosSelecionados]);

  const handleCadastrar = async () => {
    if (
      !dataTexto ||
      !horario ||
      !clienteSelecionado ||
      produtosSelecionados.length === 0
    )
      return;

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
          {horariosDisponiveis.length === 0 && dataSelecionada && (
            <Text
              style={{
                color: "white",
                fontFamily: "Poppins_400Regular",
                marginBottom: 20,
              }}
            >
              Nenhum horário disponível para esta data.
            </Text>
          )}

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
            style={[estilosGlobais.botaoPadrao, { marginTop: 40 }]}
            onPress={handleCadastrar}
          >
            Agendar
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>

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
        <Dialog
          visible={mostrarSucesso}
          onDismiss={() => setMostrarSucesso(false)}
          style={{ backgroundColor: "white", borderRadius: 16 }}
        >
          <Dialog.Title
            style={{
              fontFamily: "Poppins_700Bold",
              color: "#000",
              textAlign: "center",
            }}
          >
            Agendado!
          </Dialog.Title>
          <Dialog.Content>
            <Text
              style={{
                fontFamily: "Poppins_400Regular",
                color: "#333",
                textAlign: "center",
              }}
            >
              Agendamento criado com sucesso!
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setMostrarSucesso(false);
                router.replace("/adminAgendamentos");
              }}
              textColor="#017b36"
              labelStyle={{ fontFamily: "Poppins_500Medium" }}
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
