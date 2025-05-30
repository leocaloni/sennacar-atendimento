import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useRef, useState } from "react";
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
import EmailIcon from "../assets/icons/email.svg";
import PhoneIcon from "../assets/icons/phone.svg";
import SearchIcon from "../assets/icons/search-white.svg";
import { Ionicons } from "@expo/vector-icons";
import { cores } from "../styles/cores";
import { fontes } from "../styles/fontes";

// Tela de administração de clientes: busca, edição, exclusão e cadastro
export default function AdminClientesScreen() {
  const [metodo, setMetodo] = useState<"nome" | "email" | "telefone">("nome");
  const [valor, setValor] = useState("");
  const [cliente, setCliente] = useState<any>(null);
  const [sugestoes, setSugestoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [feedbackExclusao, setFeedbackExclusao] = useState(false);
  const [verIdCompleto, setVerIdCompleto] = useState(false);

  //delay na busca de sugestões
  const useDebounce = (cb: (...a: any[]) => void, delay = 100) => {
    const timer = useRef<NodeJS.Timeout | null>(null);
    return (...args: any[]) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => cb(...args), delay);
    };
  };

  //busca de sugestões
  const debouncedBuscaParcial = useDebounce(async (texto: string) => {
    if (!texto) return setSugestoes([]);
    try {
      const { data } = await api.get("/clientes/clientes/busca", {
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
      const { data } = await api.get("/clientes/clientes/", {
        params: { [metodo]: valor },
      });
      setCliente(data);
    } catch {
      setErro("Cliente não encontrado.");
    } finally {
      setLoading(false);
    }
  };

  const excluirCliente = async () => {
    try {
      await api.delete(`/clientes/clientes/${cliente._id}`);
      setCliente(null);
      setFeedbackExclusao(true);
    } catch (e) {
      console.error("Erro ao excluir cliente", e);
    } finally {
      setConfirmarExclusao(false);
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
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.botaoVoltar}
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      <FlatList
        style={{ flex: 1 }}
        ListHeaderComponent={
          <>
            <Text style={styles.titulo}>Clientes</Text>

            <RadioButton.Group
              onValueChange={(value) => {
                setMetodo(value as any);
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
                      color={cores.verdePrincipal}
                      uncheckedColor="white"
                      value={item}
                    />
                    <Text style={styles.radioLabel}>{item}</Text>
                  </View>
                ))}
              </View>
            </RadioButton.Group>

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

                {sugestoes.length > 0 && (
                  <FlatList
                    data={sugestoes}
                    keyExtractor={(i) => i._id}
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
                    style={styles.listaSugestoes}
                    scrollEnabled={false}
                  />
                )}
              </View>

              <TouchableOpacity
                style={styles.botaoBusca}
                onPress={buscarCliente}
              >
                <SearchIcon width={24} height={24} />
              </TouchableOpacity>
            </View>

            {loading && <ActivityIndicator style={{ marginTop: 20 }} />}
          </>
        }
        ListFooterComponent={
          <>
            {cliente && (
              <View style={styles.card}>
                <Text style={styles.label}>ID</Text>
                <TouchableOpacity
                  onPress={() => setVerIdCompleto(!verIdCompleto)}
                >
                  <Text style={styles.valor}>
                    {verIdCompleto
                      ? cliente._id
                      : cliente._id.slice(0, 8) + "... (toque para ver)"}
                  </Text>
                </TouchableOpacity>

                <Text style={styles.label}>Nome</Text>
                <Text style={styles.valor}>{cliente.nome}</Text>

                <Text style={styles.label}>Email</Text>
                <Text style={styles.valor}>{cliente.email}</Text>

                <Text style={styles.label}>Telefone</Text>
                <Text style={styles.valor}>{cliente.telefone}</Text>

                <View style={styles.acoes}>
                  <Button
                    mode="contained"
                    style={[styles.botaoCard, { backgroundColor: "#000679" }]}
                    textColor="white"
                    onPress={() =>
                      router.push({
                        pathname: "/editarCliente",
                        params: { id: cliente._id },
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
                    onPress={() => setConfirmarExclusao(true)}
                  >
                    Excluir
                  </Button>
                </View>
              </View>
            )}

            {erro && <Text style={styles.erro}>{erro}</Text>}

            <Button
              mode="contained"
              buttonColor={cores.verdePrincipal}
              textColor="white"
              style={styles.botao}
              onPress={() => router.push("/cadastroCliente")}
            >
              Cadastrar novo
            </Button>

            <Button
              mode="contained"
              buttonColor={cores.verdePrincipal}
              textColor="white"
              style={styles.botao}
              onPress={() => router.push("/listaClientes")}
            >
              Exibir todos
            </Button>
          </>
        }
        contentContainerStyle={styles.container}
        data={[]}
        renderItem={null}
        showsVerticalScrollIndicator={false}
      />

      <Portal>
        <Dialog
          visible={confirmarExclusao}
          onDismiss={() => setConfirmarExclusao(false)}
          style={{ backgroundColor: "white", borderRadius: 16 }}
        >
          <Dialog.Title
            style={{ fontFamily: "Poppins_700Bold", color: "#000" }}
          >
            Confirmar exclusão
          </Dialog.Title>
          <Dialog.Content>
            <Text style={{ fontFamily: "Poppins_400Regular", color: "#333" }}>
              Tem certeza que deseja excluir este cliente?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setConfirmarExclusao(false)}
              textColor={cores.verdePrincipal}
            >
              Cancelar
            </Button>
            <Button onPress={excluirCliente} textColor={cores.vermelho}>
              Excluir
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={feedbackExclusao}
          onDismiss={() => setFeedbackExclusao(false)}
          style={{ backgroundColor: "white", borderRadius: 16 }}
        >
          <Dialog.Title
            style={{ fontFamily: "Poppins_700Bold", color: "#000" }}
          >
            Sucesso!
          </Dialog.Title>
          <Dialog.Content>
            <Text style={{ fontFamily: "Poppins_400Regular", color: "#333" }}>
              O cliente foi excluído com sucesso.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setFeedbackExclusao(false)}
              textColor={cores.verdePrincipal}
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
  container: { flexGrow: 1 },
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
    textAlign: "center",
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
  botao: {
    alignSelf: "center",
    borderRadius: 30,
    paddingVertical: 6,
    width: 200,
    marginBottom: 20,
  },
  listaSugestoes: {
    backgroundColor: "white",
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: "#A0A0A0",
    maxHeight: 250,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
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
});
