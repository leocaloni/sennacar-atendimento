// app/novoAgendamento.tsx
import { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  TextInput as RNTextInput,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Button, Text } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { TelaComFundo } from "../components/TelaComFundo";
import { api } from "./services/api";
import UserIcon from "../assets/icons/user-grey.svg";
import ToolsIcon from "../assets/icons/tools-grey.svg";
import { Ionicons } from "@expo/vector-icons";

// ----- tipos -----
type Cliente = { _id: string; nome: string; email?: string; telefone?: string };
type Produto = { _id: string; nome: string; preco?: number };

// ----- debounce util -----
// ----- debounce util -----
const useDebounce = (cb: (...a: any[]) => void, delay = 400) => {
  const timer = useRef<NodeJS.Timeout | null>(null); // ✅ Corrigido

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

  // --- estados -----
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

  // ----- buscas -----
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

  // ----- submit -----
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

  // ----- UI -----
  return (
    <TelaComFundo>
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          zIndex: 10,
          backgroundColor: "#017b36",
          borderRadius: 12,
          padding: 5,
        }}
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
        <View style={styles.inputWrapper}>
          <UserIcon width={20} height={20} style={{ marginRight: 8 }} />
          <RNTextInput
            style={styles.input}
            placeholder="Buscar cliente"
            placeholderTextColor="#A0A0A0"
            value={clienteInput}
            onChangeText={(t) => {
              setClienteInput(t);
              debouncedBuscaClientes(t);
            }}
          />
        </View>

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
              >
                <Text style={styles.resultado}>{item.nome}</Text>
              </TouchableOpacity>
            )}
          />
        )}

        {/* PRODUTO */}
        <View style={styles.inputWrapper}>
          <ToolsIcon width={20} height={20} style={{ marginRight: 8 }} />
          <RNTextInput
            style={styles.input}
            placeholder="Buscar produto"
            placeholderTextColor="#A0A0A0"
            value={produtoInput}
            onChangeText={(t) => {
              setProdutoInput(t);
              debouncedBuscaProdutos(t);
            }}
          />
        </View>

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
              >
                <Text style={styles.resultado}>{item.nome}</Text>
              </TouchableOpacity>
            )}
          />
        )}

        {produtosSelecionados.length > 0 && (
          <View style={{ marginTop: 8 }}>
            <Text style={styles.subtitulo}>Selecionados:</Text>
            {produtosSelecionados.map((p) => (
              <Text key={p._id} style={styles.resultado}>
                • {p.nome}
              </Text>
            ))}
          </View>
        )}

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

        <Button
          mode="contained"
          buttonColor="#01913F"
          textColor="white"
          style={styles.botaoConfirmar}
          onPress={confirmarAgendamento}
        >
          Confirmar agendamento
        </Button>
      </View>
    </TelaComFundo>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  titulo: {
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
    color: "#fff",
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    paddingHorizontal: 12,
    marginBottom: 8, // menor
  },
  input: {
    flex: 1,
    height: 50,
    fontFamily: "Poppins_400Regular",
    color: "#000",
  },
  lista: {
    backgroundColor: "white",
    borderRadius: 12,
    maxHeight: 150,
    marginBottom: 8,
    zIndex: 5,
  },
  resultado: {
    padding: 10,
    fontFamily: "Poppins_400Regular",
    color: "#333",
  },
  subtitulo: {
    fontFamily: "Poppins_600SemiBold",
    color: "#fff",
    marginBottom: 4,
  },
  pergunta: { textAlign: "center", color: "#fff", marginTop: 20 },
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
  },
});
