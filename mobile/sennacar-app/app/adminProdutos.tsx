import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useRef, useState } from "react";
import { Button, Text, TextInput, Portal, Dialog } from "react-native-paper";
import { TelaComFundo } from "../components/TelaComFundo";
import { api } from "./services/api";
import { router } from "expo-router";
import {
  textInputPropsComLista,
  textInputPropsComListaAtiva,
} from "../styles/styles";
import ProductIcon from "../assets/icons/product-grey.svg";
import SearchIcon from "../assets/icons/search-white.svg";
import { Ionicons } from "@expo/vector-icons";

export default function AdminProdutosScreen() {
  const [valor, setValor] = useState("");
  const [produto, setProduto] = useState<any>(null);
  const [sugestoes, setSugestoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
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
      const { data } = await api.get("/produtos/produtos/filtrar", {
        params: { nome: texto },
      });
      setSugestoes(data);
    } catch {
      setSugestoes([]);
    }
  });

  const buscarProduto = async () => {
    setErro("");
    setProduto(null);
    setSugestoes([]);
    setLoading(true);
    try {
      const { data } = await api.get("/produtos", {
        params: { nome: valor },
      });
      setProduto(data);
    } catch {
      setErro("Produto não encontrado.");
    } finally {
      setLoading(false);
    }
  };

  const excluirProduto = async () => {
    try {
      await api.delete(`/produtos/${produto._id}`);
      setProduto(null);
      setFeedbackExclusao(true);
    } catch (e) {
      console.error("Erro ao excluir produto", e);
    } finally {
      setConfirmarExclusao(false);
    }
  };

  const placeholder = "Produto";

  const IconComponent = () => <ProductIcon width={20} height={20} />;

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
            <Text style={styles.titulo}>Produtos</Text>

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
                  keyboardType="default"
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
                          setProduto(item);
                          setValor(item.nome);
                          setSugestoes([]);
                        }}
                      >
                        <Text style={styles.sugestaoTexto}>{item.nome}</Text>
                      </TouchableOpacity>
                    )}
                    style={styles.listaSugestoes}
                    scrollEnabled={false}
                  />
                )}
              </View>

              <TouchableOpacity
                style={styles.botaoBusca}
                onPress={buscarProduto}
              >
                <SearchIcon width={24} height={24} />
              </TouchableOpacity>
            </View>

            {loading && <ActivityIndicator style={{ marginTop: 20 }} />}
          </>
        }
        ListFooterComponent={
          <>
            {produto && (
              <View style={styles.card}>
                <Text style={styles.label}>ID</Text>
                <TouchableOpacity
                  onPress={() => setVerIdCompleto(!verIdCompleto)}
                >
                  <Text style={styles.valor}>
                    {verIdCompleto
                      ? produto._id
                      : produto._id.slice(0, 8) + "... (toque para ver)"}
                  </Text>
                </TouchableOpacity>

                <Text style={styles.label}>Nome</Text>
                <Text style={styles.valor}>{produto.nome}</Text>

                <Text style={styles.label}>Categoria</Text>
                <Text style={styles.valor}>{produto.categoria}</Text>

                <Text style={styles.label}>Preço</Text>
                <Text style={styles.valor}>R$ {produto.preco}</Text>

                <Text style={styles.label}>Mão de obra</Text>
                <Text style={styles.valor}>R$ {produto.preco_mao_obra}</Text>

                <View style={styles.acoes}>
                  <Button
                    mode="contained"
                    style={[styles.botaoCard, { backgroundColor: "#000679" }]}
                    textColor="white"
                    onPress={() =>
                      router.push({
                        pathname: "/editarProduto",
                        params: { id: produto._id },
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

            {erro && <Text style={styles.erro}>{erro}</Text>}

            <Button
              mode="contained"
              buttonColor="#017b36"
              textColor="white"
              style={styles.botao}
              onPress={() => router.push("/cadastroProduto")}
            >
              Cadastrar novo
            </Button>

            <Button
              mode="contained"
              buttonColor="#017b36"
              textColor="white"
              style={styles.botao}
              onPress={() => router.push("/listaProdutos")}
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
              Tem certeza que deseja excluir este produto?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setConfirmarExclusao(false)}
              textColor="#017b36"
            >
              Cancelar
            </Button>
            <Button onPress={excluirProduto} textColor="#C62828">
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
              O produto foi excluído com sucesso.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setFeedbackExclusao(false)}
              textColor="#017b36"
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
    backgroundColor: "#017b36",
    borderRadius: 12,
    padding: 5,
  },
  titulo: {
    fontSize: 26,
    color: "white",
    fontFamily: "Poppins_700Bold",
    marginBottom: 30,
    marginTop: 40,
    textAlign: "center",
  },
  botaoBusca: {
    backgroundColor: "#017b36",
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
    fontFamily: "Poppins_400Regular",
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
    fontFamily: "Poppins_400Regular",
    fontSize: 15,
    color: "#333",
  },
});
