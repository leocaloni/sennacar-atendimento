import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useState, useRef } from "react";
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
import MechanicIcon from "../assets/icons/mechanic-grey.svg";
import EmailIcon from "../assets/icons/email.svg";
import SearchIcon from "../assets/icons/search-white.svg";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  textInputPropsComLista,
  textInputPropsComListaAtiva,
} from "../styles/styles";
import { fontes } from "../styles/fontes";
import { cores } from "../styles/cores";

export default function AdminFuncionariosScreen() {
  const [metodo, setMetodo] = useState<"nome" | "email">("nome");
  const [valor, setValor] = useState("");
  const [funcionario, setFuncionario] = useState<any>(null);
  const [sugestoes, setSugestoes] = useState<any[]>([]);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [feedbackExclusao, setFeedbackExclusao] = useState(false);
  const [verIdCompleto, setVerIdCompleto] = useState(false);

  const useDebounce = (cb: (...a: any[]) => void, delay = 100) => {
    const timer = useRef<NodeJS.Timeout | null>(null);
    return (...args: any[]) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => cb(...args), delay);
    };
  };

  const debouncedBuscaParcial = useDebounce(async (texto: string) => {
    if (!texto) return setSugestoes([]);
    try {
      const { data } = await api.get("/funcionarios/funcionarios/busca", {
        params: { [metodo]: texto },
      });
      setSugestoes(data);
    } catch {
      setSugestoes([]);
    }
  });

  const buscarFuncionario = async () => {
    setErro("");
    setFuncionario(null);
    setSugestoes([]);
    setLoading(true);
    try {
      const { data } = await api.get("/funcionarios/funcionarios/", {
        params: { [metodo]: valor },
      });

      const encontrado = Array.isArray(data)
        ? data.find((f: any) =>
            metodo === "email"
              ? f.email === valor
              : f.nome.toLowerCase().includes(valor.toLowerCase())
          )
        : null;

      if (encontrado) setFuncionario(encontrado);
      else setErro("Funcionário não encontrado.");
    } catch {
      setErro("Erro ao buscar funcionário.");
    } finally {
      setLoading(false);
    }
  };

  const excluirFuncionario = async () => {
    try {
      await api.delete(`/funcionarios/funcionarios/${funcionario._id}`);
      setFuncionario(null);
      setFeedbackExclusao(true);
    } catch (e) {
      console.error("Erro ao excluir funcionário", e);
    } finally {
      setConfirmarExclusao(false);
    }
  };

  const IconComponent =
    metodo === "nome"
      ? () => <MechanicIcon width={20} height={20} />
      : () => <EmailIcon width={20} height={20} />;

  const placeholder = metodo === "nome" ? "Nome" : "Email";

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
            <Text style={styles.titulo}>Funcionários</Text>

            <RadioButton.Group
              onValueChange={(value) => {
                setMetodo(value as "email" | "nome");
                setValor("");
                setSugestoes([]);
                setFuncionario(null);
                setErro("");
              }}
              value={metodo}
            >
              <View style={styles.radioRow}>
                {["nome", "email"].map((item) => (
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
                    metodo === "email" ? "email-address" : "default"
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
                          setFuncionario(item);
                          setValor(metodo === "nome" ? item.nome : item.email);
                          setSugestoes([]);
                        }}
                      >
                        <Text style={styles.sugestaoTexto}>
                          {metodo === "nome" ? item.nome : item.email}
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
                onPress={buscarFuncionario}
              >
                <SearchIcon width={24} height={24} />
              </TouchableOpacity>
            </View>

            {loading && <ActivityIndicator style={{ marginTop: 20 }} />}
          </>
        }
        ListFooterComponent={
          <>
            {funcionario && (
              <View style={styles.card}>
                <Text style={styles.label}>ID</Text>
                <TouchableOpacity
                  onPress={() => setVerIdCompleto(!verIdCompleto)}
                >
                  <Text style={styles.valor}>
                    {verIdCompleto
                      ? funcionario._id
                      : funcionario._id.slice(0, 8) + "... (toque para ver)"}
                  </Text>
                </TouchableOpacity>

                <Text style={styles.label}>Nome</Text>
                <Text style={styles.valor}>{funcionario.nome}</Text>

                <Text style={styles.label}>Email</Text>
                <Text style={styles.valor}>{funcionario.email}</Text>

                <Text style={styles.label}>Administrador</Text>
                <Text style={styles.valor}>
                  {funcionario.is_admin ? "Sim" : "Não"}
                </Text>

                <View style={styles.acoes}>
                  <Button
                    mode="contained"
                    style={[styles.botaoCard, { backgroundColor: "#000679" }]}
                    textColor="white"
                    onPress={() =>
                      router.push({
                        pathname: "/editarFuncionario",
                        params: { id: funcionario._id },
                      })
                    }
                  >
                    Editar
                  </Button>
                  <Button
                    mode="contained"
                    buttonColor="#C62828"
                    textColor="white"
                    style={styles.botaoCard}
                    onPress={() => setConfirmarExclusao(true)}
                  >
                    Excluir
                  </Button>
                </View>
              </View>
            )}

            {erro !== "" && <Text style={styles.erro}>{erro}</Text>}

            <Button
              mode="contained"
              buttonColor={cores.verdePrincipal}
              textColor="white"
              style={styles.botao}
              onPress={() => router.push("/cadastroFuncionario")}
            >
              Cadastrar novo
            </Button>

            <Button
              mode="contained"
              buttonColor={cores.verdePrincipal}
              textColor="white"
              style={styles.botao}
              onPress={() => router.push("/listaFuncionarios")}
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
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitulo}>
            Confirmar exclusão
          </Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogTexto}>
              Tem certeza que deseja excluir este funcionário?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setConfirmarExclusao(false)}
              textColor={cores.verdePrincipal}
            >
              Cancelar
            </Button>
            <Button onPress={excluirFuncionario} textColor="#C62828">
              Excluir
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={feedbackExclusao}
          onDismiss={() => setFeedbackExclusao(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitulo}>Sucesso!</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogTexto}>
              O funcionário foi excluído com sucesso.
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
  dialog: {
    backgroundColor: "white",
    borderRadius: 16,
  },
  dialogTitulo: {
    fontFamily: fontes.bold,
    color: "#000",
  },
  dialogTexto: {
    fontFamily: fontes.regular,
    color: "#333",
  },
});
