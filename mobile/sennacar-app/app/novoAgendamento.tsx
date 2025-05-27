import { useState, useRef } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity } from "react-native";
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

type Cliente = { _id: string; nome: string; email?: string; telefone?: string };
type Produto = { _id: string; nome: string; preco?: number };

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

  return (
    <TelaComFundo>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.botaoVoltar}
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      <View style={styles.container}>
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
              style={styles.lista}
              data={clientes}
              keyExtractor={(i) => i._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setClienteSelecionado(item);
                    setClienteInput(item.nome);
                    setClientes([]);
                  }}
                  style={styles.sugestaoItem}
                >
                  <Text style={styles.resultadoSugestao}>{item.nome}</Text>
                </TouchableOpacity>
              )}
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
              style={styles.lista}
              data={sugestoesProdutos}
              keyExtractor={(i) => i._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    if (!produtosSelecionados.some((p) => p._id === item._id))
                      setProdutosSelecionados((prev) => [...prev, item]);
                    setProdutoInput("");
                    setSugestoesProdutos([]);
                  }}
                  style={styles.sugestaoItem}
                >
                  <Text style={styles.resultadoSugestao}>{item.nome}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        {produtosSelecionados.length > 0 && (
          <View style={styles.produtosSelecionados}>
            <Text style={styles.subtitulo}>Selecionados:</Text>
            {produtosSelecionados.map((p) => (
              <Text key={p._id} style={styles.resultadoSelecionado}>
                • {p.nome}
              </Text>
            ))}
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
    </TelaComFundo>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  lista: {
    backgroundColor: "white",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    maxHeight: 200,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  sugestaoItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  resultadoSugestao: {
    fontFamily: "Poppins_400Regular",
    fontSize: 15,
    color: "#333",
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
});
