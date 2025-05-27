import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useState, useRef } from "react";
import { RadioButton, Button, Text, TextInput } from "react-native-paper";
import { TelaComFundo } from "../../components/TelaComFundo";
import { api } from "../services/api";
import {
  textInputPropsComLista,
  textInputPropsComListaAtiva,
} from "../../styles/styles";
import CostumerIcon from "../../assets/icons/costumer-grey.svg";
import EmailIcon from "../../assets/icons/email.svg";
import PhoneIcon from "../../assets/icons/phone.svg";
import SearchIcon from "../../assets/icons/search-white.svg";
import { router } from "expo-router";

// -------- tipo cliente --------
type Cliente = {
  _id: string;
  nome: string;
  email: string;
  telefone: string;
};

// -------- debounce util --------
const useDebounce = (cb: (...a: any[]) => void, delay = 100) => {
  const timer = useRef<NodeJS.Timeout | null>(null);
  return (...args: any[]) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => cb(...args), delay);
  };
};

export default function BuscaScreen() {
  const [metodo, setMetodo] = useState<"nome" | "email" | "telefone">("nome");
  const [valor, setValor] = useState("");
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [sugestoes, setSugestoes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [verIdCompleto, setVerIdCompleto] = useState(false);

  // ------------- busca parcial -------------
  const debouncedBuscaParcial = useDebounce(async (texto: string) => {
    if (!texto) return setSugestoes([]);
    try {
      const { data } = await api.get<Cliente[]>("/clientes/clientes/busca", {
        params: { [metodo]: texto },
      });
      setSugestoes(data);
    } catch {
      setSugestoes([]);
    }
  });

  // ------------- busca exata -------------
  const buscarCliente = async () => {
    setErro("");
    setCliente(null);
    setSugestoes([]);
    setLoading(true);

    try {
      const { data } = await api.get<Cliente>("/clientes/clientes/", {
        params: { [metodo]: valor },
      });
      setCliente(data);
      setVerIdCompleto(false);
    } catch {
      setErro("Cliente não encontrado.");
    } finally {
      setLoading(false);
    }
  };

  // ------------- ícones & placeholder -------------
  const placeholder =
    metodo === "nome" ? "Nome" : metodo === "email" ? "Email" : "Telefone";

  const IconComponent =
    metodo === "nome"
      ? () => <CostumerIcon width={20} height={20} />
      : metodo === "email"
      ? () => <EmailIcon width={20} height={20} />
      : () => <PhoneIcon width={20} height={20} />;

  return (
    <TelaComFundo>
      <View style={styles.container}>
        <Text style={styles.titulo}>Consultar clientes</Text>

        {/* ----- selecção de método ----- */}
        <RadioButton.Group
          onValueChange={(val) => {
            setMetodo(val as any);
            setValor("");
            setSugestoes([]);
            setCliente(null);
            setErro("");
          }}
          value={metodo}
        >
          <View style={styles.radioRow}>
            {["nome", "email", "telefone"].map((item) => (
              <View key={item} style={styles.radioOption}>
                <RadioButton
                  color="#01913F"
                  uncheckedColor="white"
                  value={item}
                />
                <Text style={styles.radioLabel}>{item}</Text>
              </View>
            ))}
          </View>
        </RadioButton.Group>

        {/* ----- campo de busca + botão ----- */}
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          {/* CAMPO + LISTA DENTRO DE UM BLOCO SÓ */}
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
                debouncedBuscaParcial(t);
              }}
              keyboardType={
                metodo === "email"
                  ? "email-address"
                  : metodo === "telefone"
                  ? "phone-pad"
                  : "default"
              }
              left={<TextInput.Icon icon={IconComponent} />}
            />

            {/* LISTA FICA EMPILHADA EMBAIXO DO TEXTINPUT */}
            {sugestoes.length > 0 && (
              <FlatList
                style={styles.lista}
                data={sugestoes}
                keyExtractor={(c) => c._id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.sugestaoItem}
                    onPress={() => {
                      setCliente(item);
                      setValor(
                        metodo === "nome"
                          ? item.nome
                          : metodo === "email"
                          ? item.email
                          : item.telefone
                      );
                      setSugestoes([]);
                      setVerIdCompleto(false);
                    }}
                  >
                    <Text style={styles.sugestaoTexto}>
                      {metodo === "nome"
                        ? item.nome
                        : metodo === "email"
                        ? item.email
                        : item.telefone}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>

          {/* BOTÃO FIXO DO LADO, FORA DO BLOCÃO */}
          <TouchableOpacity
            style={[styles.botaoBusca, { marginLeft: 10, marginTop: 4 }]}
            onPress={buscarCliente}
          >
            <SearchIcon width={24} height={24} />
          </TouchableOpacity>
        </View>

        {loading && <ActivityIndicator style={{ marginTop: 20 }} />}

        {/* ----- cartão resultado ----- */}
        {cliente && (
          <View style={styles.card}>
            <Text style={styles.label}>Nome</Text>
            <Text style={styles.valor}>{cliente.nome}</Text>

            <Text style={styles.label}>ID</Text>
            <TouchableOpacity onPress={() => setVerIdCompleto(!verIdCompleto)}>
              <Text style={styles.valor}>
                {verIdCompleto
                  ? cliente._id
                  : `${cliente._id.substring(0, 8)}... (toque para ver)`}
              </Text>
            </TouchableOpacity>

            <Text style={styles.label}>Email</Text>
            <Text style={styles.valor}>{cliente.email}</Text>

            <Text style={styles.label}>Telefone</Text>
            <Text style={styles.valor}>{cliente.telefone}</Text>
          </View>
        )}

        {erro && <Text style={styles.erro}>{erro}</Text>}

        <Text style={styles.pergunta}>Não encontrou o cliente?</Text>
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

/* ---------- estilos ---------- */
const styles = StyleSheet.create({
  container: { flex: 1 },
  titulo: {
    fontSize: 26,
    color: "white",
    marginBottom: 30,
    fontFamily: "Poppins_700Bold",
  },
  radioRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  radioOption: { flexDirection: "row", alignItems: "center" },
  radioLabel: {
    color: "white",
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    marginLeft: 4,
  },
  botaoBusca: {
    backgroundColor: "#017b36",
    padding: 10,
    borderRadius: 12,
    marginLeft: 10,
  },
  /* ----- lista drop‑down ----- */
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
  /* ----- cartão resultado ----- */
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 10,
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
  erro: {
    color: "white",
    marginBottom: 20,
    textAlign: "center",
    fontFamily: "Poppins_400Regular",
  },
  pergunta: {
    color: "white",
    textAlign: "center",
    marginBottom: 8,
    fontFamily: "Poppins_400Regular",
    marginTop: 20,
  },
  botaoCadastrar: {
    alignSelf: "center",
    borderRadius: 30,
    paddingVertical: 6,
    width: 200,
    marginBottom: 30,
  },
});
