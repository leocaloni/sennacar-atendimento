import { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { TelaComFundo } from "../components/TelaComFundo";
import { api } from "./services/api";
import CostumerIcon from "../assets/icons/costumer-grey.svg";
import ProductIcon from "../assets/icons/product-grey.svg";
import { Ionicons } from "@expo/vector-icons";
import {
  textInputPropsComLista,
  textInputPropsComListaAtiva,
} from "../styles/styles";
import { estilosGlobais } from "../styles/estilosGlobais";

type Cliente = { _id: string; nome: string; email?: string; telefone?: string };
type Produto = {
  _id: string;
  nome: string;
  preco?: number;
  preco_mao_obra?: number;
};

const useDebounce = (cb: (...a: any[]) => void, delay = 100) => {
  const timer = useRef<NodeJS.Timeout | null>(null);
  return (...args: any[]) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => cb(...args), delay);
  };
};

export default function NovoAgendamento() {
  const { horario } = useLocalSearchParams();
  const horarioISO = Array.isArray(horario) ? horario[0] : horario;
  const dataSelecionada = new Date(horarioISO as string);
  const router = useRouter();

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

  const [keyboardOffset, setKeyboardOffset] = useState(0);

  const debouncedBuscaClientes = useDebounce(async (texto: string) => {
    if (!texto) return setClientes([]);
    try {
      const { data } = await api.get<Cliente[]>("/clientes/clientes/busca", {
        params: { nome: texto },
      });
      setClientes(data);
    } catch {
      setClientes([]);
    }
  });

  const debouncedBuscaProdutos = useDebounce(async (texto: string) => {
    if (!texto) return setSugestoesProdutos([]);
    try {
      const { data } = await api.get<Produto[]>("/produtos/produtos/filtrar", {
        params: { nome: texto },
      });
      setSugestoesProdutos(data);
    } catch {
      setSugestoesProdutos([]);
    }
  });

  const confirmarAgendamento = async () => {
    if (!clienteSelecionado || produtosSelecionados.length === 0) return;
    await api.post("/agendamentos/agendamentos", null, {
      params: {
        cliente_id: clienteSelecionado._id,
        data_agendada: horarioISO,
        produtos: produtosSelecionados.map((p) => p._id).join(","),
      },
    });
    router.back();
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
    const total = produtosSelecionados.reduce((acc, p) => {
      const preco = parseFloat(String(p.preco)) || 0;
      const maoDeObra = parseFloat(String(p.preco_mao_obra)) || 0;
      return acc + preco + maoDeObra;
    }, 0);
    setValorTotal(total);
  }, [produtosSelecionados]);

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
        renderItem={() => (
          <View style={[styles.container, { paddingBottom: keyboardOffset }]}>
            <Text style={styles.titulo}>
              Agendar em{" "}
              {dataSelecionada.toLocaleDateString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>

            {/* CLIENTE */}
            <View style={{ marginBottom: 16 }}>
              <TextInput
                {...(clientes.length > 0
                  ? textInputPropsComListaAtiva
                  : textInputPropsComLista)}
                placeholder="Buscar cliente"
                value={clienteInput}
                textColor="black"
                onChangeText={(t) => {
                  setClienteInput(t);
                  debouncedBuscaClientes(t);
                }}
                left={
                  <TextInput.Icon
                    icon={() => <CostumerIcon width={20} height={20} />}
                  />
                }
              />

              {clientes.length > 0 && (
                <FlatList
                  style={estilosGlobais.listaSugestoes}
                  data={clientes}
                  keyExtractor={(i) => i._id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => {
                        setClienteSelecionado(item);
                        setClienteInput(item.nome);
                        setClientes([]);
                      }}
                      style={estilosGlobais.sugestaoItem}
                    >
                      <Text style={estilosGlobais.sugestaoTexto}>
                        {item.nome}
                      </Text>
                    </TouchableOpacity>
                  )}
                  keyboardShouldPersistTaps="handled"
                />
              )}
            </View>

            {/* PRODUTO */}
            <View style={{ marginBottom: 16 }}>
              <TextInput
                {...(sugestoesProdutos.length > 0
                  ? textInputPropsComListaAtiva
                  : textInputPropsComLista)}
                placeholder="Buscar produto"
                textColor="black"
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
              />

              {sugestoesProdutos.length > 0 && (
                <FlatList
                  style={estilosGlobais.listaSugestoes}
                  data={sugestoesProdutos}
                  keyExtractor={(i) => i._id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => {
                        requestAnimationFrame(() => {
                          if (
                            !produtosSelecionados.some(
                              (p) => p._id === item._id
                            )
                          ) {
                            setProdutosSelecionados((prev) => [...prev, item]);
                          }
                          setProdutoInput("");
                          setSugestoesProdutos([]);
                          Keyboard.dismiss();
                        });
                      }}
                      style={estilosGlobais.sugestaoItem}
                    >
                      <Text style={estilosGlobais.sugestaoTexto}>
                        {item.nome}
                      </Text>
                    </TouchableOpacity>
                  )}
                  keyboardShouldPersistTaps="handled"
                />
              )}
            </View>

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
                  Total: R$ {Number(valorTotal).toFixed(2)}
                </Text>
              </View>
            )}

            <Button
              mode="contained"
              buttonColor="#017b36"
              textColor="white"
              style={styles.botaoConfirmar}
              onPress={confirmarAgendamento}
            >
              Confirmar agendamento
            </Button>

            <Text style={styles.pergunta}>Cliente sem cadastro?</Text>
            <Button
              mode="contained"
              buttonColor="#017b36"
              textColor="white"
              style={styles.botaoCadastrar}
              onPress={() => router.push("/cadastroCliente")}
            >
              Cadastrar cliente
            </Button>
          </View>
        )}
        keyExtractor={(_, index) => index.toString()}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={<View style={{ height: 40 }} />}
      />
    </TelaComFundo>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignContent: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  titulo: {
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
    color: "#fff",
    marginBottom: 20,
    marginTop: 40,
  },
  resultadoSelecionado: {
    padding: 10,
    fontFamily: "Poppins_400Regular",
    color: "white",
  },
  subtitulo: {
    fontFamily: "Poppins_600SemiBold",
    color: "white",
    marginBottom: 4,
  },
  produtosSelecionados: {
    marginTop: 8,
  },
  pergunta: {
    textAlign: "center",
    color: "#fff",
    marginTop: 20,
  },
  botaoCadastrar: {
    alignSelf: "center",
    borderRadius: 30,
    width: 200,
    marginTop: 6,
  },
  botaoConfirmar: {
    alignSelf: "center",
    borderRadius: 30,
    width: 220,
    marginTop: 16,
    marginBottom: 20,
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
  produtoLinha: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  totalValor: {
    fontFamily: "Poppins_600SemiBold",
    color: "white",
    marginTop: 8,
    fontSize: 16,
  },
});
