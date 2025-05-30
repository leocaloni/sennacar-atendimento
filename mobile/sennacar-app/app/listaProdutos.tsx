import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { Button, Text, Portal, Dialog } from "react-native-paper";
import { useRouter } from "expo-router";
import { TelaComFundo } from "../components/TelaComFundo";
import { api } from "./services/api";
import { Ionicons, Feather } from "@expo/vector-icons";

// Tela de listagem de produtos: permite visualizar, filtrar por categoria, editar e excluir produtos.
export default function ListaProdutosScreen() {
  const router = useRouter();
  const [produtos, setProdutos] = useState<any[]>([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todas");
  const [categorias, setCategorias] = useState<(string | [string, string])[]>(
    []
  );
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [feedbackExclusao, setFeedbackExclusao] = useState(false);
  const [idParaExcluir, setIdParaExcluir] = useState<string | null>(null);

  const carregarProdutos = async () => {
    setLoading(true);
    try {
      const rota =
        categoriaSelecionada === "Todas"
          ? "/produtos/produtos/"
          : `/produtos/produtos/categoria/${categoriaSelecionada}`;

      const { data } = await api.get(rota);
      setProdutos(data);

      if (categoriaSelecionada === "Todas") {
        const mapa = new Map<string, string>();
        data.forEach((p: any) => {
          if (p.categoria && p.descricao) {
            mapa.set(p.categoria, p.descricao);
          }
        });
        const listaCategorias: (string | [string, string])[] = [
          "Todas",
          ...Array.from(mapa.entries()),
        ];
        setCategorias(listaCategorias);
      }
    } catch (err) {
      console.error("Erro ao carregar produtos:", err);
    } finally {
      setLoading(false);
    }
  };

  const excluirProduto = async () => {
    if (!idParaExcluir) return;
    try {
      await api.delete(`/produtos/${idParaExcluir}`);
      setProdutos((prev) => prev.filter((p) => p._id !== idParaExcluir));
      setFeedbackExclusao(true);
    } catch (e) {
      console.error("Erro ao excluir produto", e);
    } finally {
      setConfirmarExclusao(false);
      setIdParaExcluir(null);
    }
  };

  useEffect(() => {
    carregarProdutos();
  }, [categoriaSelecionada]);

  const obterDescricaoSelecionada = () => {
    if (categoriaSelecionada === "Todas") return "Todas";
    const encontrada = categorias.find(
      (c) => Array.isArray(c) && c[0] === categoriaSelecionada
    );
    return encontrada ? encontrada[1] : categoriaSelecionada;
  };

  return (
    <TelaComFundo>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.botaoVoltar}
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      <Text style={styles.titulo}>Todos os Produtos</Text>

      {/* Dropdown de categorias */}
      <View style={{ zIndex: 2 }}>
        <TouchableOpacity
          style={[
            styles.dropdownBotao,
            dropdownAberto && styles.dropdownBotaoAberto,
            { marginBottom: dropdownAberto ? 0 : 20 },
          ]}
          onPress={() => setDropdownAberto(!dropdownAberto)}
        >
          <Text style={styles.dropdownTexto}>
            {obterDescricaoSelecionada()}
          </Text>
          <Feather name="chevron-down" size={20} color="#017b36" />
        </TouchableOpacity>

        {dropdownAberto && (
          <FlatList
            data={categorias}
            keyExtractor={(item) => (typeof item === "string" ? item : item[0])}
            style={styles.dropdownLista}
            renderItem={({ item }) => {
              const chave = typeof item === "string" ? item : item[0];
              const label = typeof item === "string" ? item : item[1];
              return (
                <TouchableOpacity
                  style={styles.sugestaoItem}
                  onPress={() => {
                    setCategoriaSelecionada(chave);
                    setDropdownAberto(false);
                  }}
                >
                  <Text style={styles.sugestaoTexto}>{label}</Text>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>

      {loading && (
        <ActivityIndicator style={{ marginTop: 20 }} color="#017b36" />
      )}

      <FlatList
        data={produtos}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.label}>Nome</Text>
            <Text style={styles.valor}>{item.nome}</Text>

            <Text style={styles.label}>Categoria</Text>
            <Text style={styles.valor}>{item.descricao || "Não definida"}</Text>

            <Text style={styles.label}>Preço</Text>
            <Text style={styles.valor}>R$ {item.preco}</Text>

            <Text style={styles.label}>Mão de obra</Text>
            <Text style={styles.valor}>
              {item.preco_mao_obra ? `R$ ${item.preco_mao_obra}` : "-"}
            </Text>

            <View style={styles.acoes}>
              <Button
                mode="contained"
                style={[styles.botaoCard, { backgroundColor: "#000679" }]}
                textColor="white"
                onPress={() =>
                  router.push({
                    pathname: "/editarProduto",
                    params: { id: item._id },
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
                onPress={() => {
                  setIdParaExcluir(item._id);
                  setConfirmarExclusao(true);
                }}
              >
                Excluir
              </Button>
            </View>
          </View>
        )}
      />

      <Portal>
        {/* Modal de confirmação */}
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

        {/* Modal de feedback */}
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
  titulo: {
    fontSize: 26,
    color: "white",
    fontFamily: "Poppins_700Bold",
    marginBottom: 20,
    marginTop: 40,
    textAlign: "center",
  },
  dropdownBotao: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 20,
    borderWidth: 1.5,
    borderColor: "#017b36",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dropdownBotaoAberto: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  dropdownTexto: {
    fontFamily: "Poppins_700Bold",
    fontSize: 15,
    color: "#017b36",
  },
  dropdownLista: {
    backgroundColor: "white",
    maxHeight: 250,
    marginHorizontal: 20,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: "#017b36",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginBottom: 20,
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
  lista: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
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
