import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  StyleSheet,
} from "react-native";
import { useState, useRef } from "react";
import { RadioButton, Button, Text, TextInput } from "react-native-paper";
import { TelaComFundo } from "../../components/TelaComFundo";
import { api } from "../services/api";
import {
  textInputPropsComLista,
  textInputPropsComListaAtiva,
} from "../../styles/styles";
import { estilosGlobais } from "../../styles/estilosGlobais";

import CostumerIcon from "../../assets/icons/costumer-grey.svg";
import EmailIcon from "../../assets/icons/email.svg";
import PhoneIcon from "../../assets/icons/phone.svg";
import SearchIcon from "../../assets/icons/search-white.svg";
import { router } from "expo-router";

type Cliente = {
  _id: string;
  nome: string;
  email: string;
  telefone: string;
};

//delay na busca de sugestões
const useDebounce = (cb: (...a: any[]) => void, delay = 100) => {
  const timer = useRef<NodeJS.Timeout | null>(null);
  return (...args: any[]) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => cb(...args), delay);
  };
};

// Tela de busca de clientes por nome, email ou telefone, com sugestões e cadastro
export default function BuscaScreen() {
  const [metodo, setMetodo] = useState<"nome" | "email" | "telefone">("nome");
  const [valor, setValor] = useState("");
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [sugestoes, setSugestoes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [verIdCompleto, setVerIdCompleto] = useState(false);

  //busca para a lista de sugestões
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
        <Text style={estilosGlobais.tituloTela}>Consultar clientes</Text>

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

        {/* TextInput de acordo com a seleção da busca */}
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

            {/* Lista de sugestões de busca */}
            {sugestoes.length > 0 && (
              <FlatList
                style={estilosGlobais.listaSugestoes}
                data={sugestoes}
                keyExtractor={(c) => c._id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={estilosGlobais.sugestaoItem}
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
                    <Text style={estilosGlobais.sugestaoTexto}>
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

          <TouchableOpacity
            style={[
              estilosGlobais.botaoBusca,
              { marginLeft: 10, marginTop: 4 },
            ]}
            onPress={buscarCliente}
          >
            <SearchIcon width={24} height={24} />
          </TouchableOpacity>
        </View>

        {loading && <ActivityIndicator style={{ marginTop: 20 }} />}

        {/* Card de informações do cliente */}
        {cliente && (
          <View style={estilosGlobais.cardPadrao}>
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
          style={estilosGlobais.botaoPadrao}
          onPress={() => router.push("/cadastroCliente")}
          textColor="white"
        >
          Cadastrar cliente
        </Button>
      </View>
    </TelaComFundo>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 0, paddingTop: 40 },
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
});
