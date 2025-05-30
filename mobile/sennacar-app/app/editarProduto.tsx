import { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Keyboard,
  FlatList,
} from "react-native";
import { Text, TextInput, Button, Dialog, Portal } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { api } from "./services/api";
import { TelaComFundo } from "../components/TelaComFundo";
import { Ionicons } from "@expo/vector-icons";
import {
  textInputProps,
  textInputPropsComLista,
  textInputPropsComListaAtiva,
} from "../styles/styles";
import ProductIcon from "../assets/icons/product-grey.svg";
import DinheiroIcon from "../assets/icons/dinheiro-grey.svg";
import MechanicIcon from "../assets/icons/mechanic-grey.svg";
import CategoriaIcon from "../assets/icons/categoria.svg";

// Tela de edição de produto: permite alterar nome, preço, mão de obra e categoria de um produto existente.
export default function EditarProduto() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [maoObra, setMaoObra] = useState("");
  const [categoria, setCategoria] = useState("");
  const [sugestoesCategoria, setSugestoesCategoria] = useState<string[]>([]);
  const [erro, setErro] = useState("");
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [mostrarSucesso, setMostrarSucesso] = useState(false);

  const formatarMoeda = (valor: string) => {
    const limpo = valor.replace(/\D/g, "");
    const inteiro = limpo.replace(/^0+/, "") || "0";
    const decimal = inteiro.padStart(3, "0");
    return `R$ ${decimal.slice(0, -2)},${decimal.slice(-2)}`;
  };

  const limparMoeda = (valor: string) => {
    return Number(valor.replace(/\D/g, "")) / 100;
  };

  const buscarProduto = async () => {
    try {
      const { data } = await api.get(`/produtos/produtos/${id}`);
      setNome(data.nome);
      setPreco(formatarMoeda(String(data.preco)));
      setMaoObra(formatarMoeda(String(data.preco_mao_obra || 0)));
      setCategoria(data.descricao || "");
    } catch (e) {
      setErro("Erro ao carregar produto.");
    }
  };

  const buscarCategorias = async (texto: string) => {
    if (!texto.trim()) return setSugestoesCategoria([]);
    try {
      const { data } = await api.get(
        "/produtos/produtos/categorias/sugestoes",
        {
          params: { descricao: texto },
        }
      );
      setSugestoesCategoria(data);
    } catch {
      setSugestoesCategoria([]);
    }
  };

  const handleAtualizar = async () => {
    setErro("");
    if (!nome || !preco || !categoria) {
      setErro("Preencha todos os campos obrigatórios.");
      setMostrarConfirmacao(false);
      return;
    }
    try {
      await api.put(`/produtos/${id}`, null, {
        params: {
          nome,
          preco: limparMoeda(preco),
          preco_mao_obra: limparMoeda(maoObra),
          categoria: categoria.toLowerCase().replace(/\s+/g, "-"),
          descricao: categoria,
        },
      });
      setMostrarConfirmacao(false);
      setMostrarSucesso(true);
    } catch (e) {
      console.error(e);
      setErro("Erro ao atualizar produto.");
      setMostrarConfirmacao(false);
    }
  };

  useEffect(() => {
    if (id) buscarProduto();
  }, [id]);

  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardOffset(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardOffset(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

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
        keyExtractor={(_, index) => index.toString()}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={<View style={{ height: 40 }} />}
        renderItem={() => (
          <View
            style={[
              styles.container,
              { paddingBottom: keyboardOffset, marginTop: 20 },
            ]}
          >
            <Text style={styles.titulo}>Editar Produto</Text>

            {/* INPUTS */}
            <TextInput
              {...textInputProps}
              placeholder="Nome"
              textColor="black"
              value={nome}
              onChangeText={setNome}
              left={
                <TextInput.Icon
                  icon={() => <ProductIcon width={20} height={20} />}
                />
              }
              style={styles.input}
            />

            <TextInput
              {...textInputProps}
              placeholder="Preço"
              textColor="black"
              value={preco}
              keyboardType="numeric"
              onChangeText={(v) => setPreco(formatarMoeda(v))}
              left={
                <TextInput.Icon
                  icon={() => <DinheiroIcon width={20} height={20} />}
                />
              }
              style={styles.input}
            />

            <TextInput
              {...textInputProps}
              placeholder="Mão de obra (se tiver)"
              textColor="black"
              value={maoObra}
              keyboardType="numeric"
              onChangeText={(v) => setMaoObra(formatarMoeda(v))}
              left={
                <TextInput.Icon
                  icon={() => <MechanicIcon width={20} height={20} />}
                />
              }
              style={styles.input}
            />

            <View style={{ zIndex: 10 }}>
              <TextInput
                {...(sugestoesCategoria.length > 0
                  ? textInputPropsComListaAtiva
                  : textInputPropsComLista)}
                placeholder="Categoria"
                textColor="black"
                value={categoria}
                onChangeText={(texto) => {
                  setCategoria(texto);
                  buscarCategorias(texto);
                }}
                left={
                  <TextInput.Icon
                    icon={() => <CategoriaIcon width={20} height={20} />}
                  />
                }
                style={styles.input}
              />

              {sugestoesCategoria.length > 0 && (
                <FlatList
                  data={sugestoesCategoria}
                  keyExtractor={(item) => item}
                  keyboardShouldPersistTaps="handled"
                  style={styles.listaSugestoes}
                  renderItem={({ item, index }) => (
                    <TouchableOpacity
                      style={[
                        styles.sugestaoItem,
                        {
                          borderBottomWidth:
                            index === sugestoesCategoria.length - 1 ? 0 : 1,
                          borderBottomColor: "#eee",
                        },
                      ]}
                      onPress={() => {
                        setCategoria(item);
                        setSugestoesCategoria([]);
                      }}
                    >
                      <Text style={styles.sugestaoTexto}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>

            {erro !== "" && <Text style={styles.erro}>{erro}</Text>}

            <Button
              mode="contained"
              buttonColor="#017b36"
              textColor="white"
              style={styles.botaoAtualizar}
              onPress={() => setMostrarConfirmacao(true)}
            >
              Atualizar
            </Button>
          </View>
        )}
      />

      <Portal>
        <Dialog
          visible={mostrarConfirmacao}
          onDismiss={() => setMostrarConfirmacao(false)}
          style={{ backgroundColor: "white", borderRadius: 16 }}
        >
          <Dialog.Title style={{ fontWeight: "bold", color: "#000" }}>
            Confirmar edição
          </Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: "#333" }}>
              Tem certeza que deseja atualizar este produto?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              textColor="#017b36"
              onPress={() => setMostrarConfirmacao(false)}
            >
              Cancelar
            </Button>
            <Button textColor="#000679" onPress={handleAtualizar}>
              Atualizar
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={mostrarSucesso}
          onDismiss={() => {
            setMostrarSucesso(false);
            router.back();
          }}
          style={{ backgroundColor: "white", borderRadius: 16 }}
        >
          <Dialog.Title style={{ fontWeight: "bold", color: "#000" }}>
            Sucesso!
          </Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: "#333" }}>
              Produto atualizado com sucesso.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              textColor="#017b36"
              onPress={() => {
                setMostrarSucesso(false);
                router.back();
              }}
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
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  botaoVoltar: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 99,
    backgroundColor: "#017b36",
    borderRadius: 12,
    padding: 5,
  },
  titulo: {
    fontSize: 26,
    color: "white",
    fontFamily: "Poppins_700Bold",
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    marginTop: 20,
    backgroundColor: "white",
    borderRadius: 16,
    fontFamily: "Poppins_400Regular",
  },
  erro: {
    color: "white",
    textAlign: "center",
    fontFamily: "Poppins_400Regular",
    marginTop: 16,
  },
  botaoAtualizar: {
    alignSelf: "center",
    marginTop: 30,
    width: 200,
    borderRadius: 30,
  },
  listaSugestoes: {
    backgroundColor: "white",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderColor: "#ccc",
    borderWidth: 1,
    maxHeight: 200,
    marginBottom: 20,
  },

  sugestaoItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  sugestaoTexto: {
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    color: "#333",
  },
});
