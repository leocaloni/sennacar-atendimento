import { useRef, useState, useEffect } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  FlatList,
  Keyboard,
} from "react-native";
import { Button, Text, TextInput, Dialog, Portal } from "react-native-paper";
import { TelaComFundo } from "../components/TelaComFundo";
import { api } from "./services/api";
import { router } from "expo-router";
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

export default function CadastroProduto() {
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [maoObra, setMaoObra] = useState("");
  const [categoria, setCategoria] = useState("");

  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [mostrarSucesso, setMostrarSucesso] = useState(false);
  const [sugestoesCategoria, setSugestoesCategoria] = useState<string[]>([]);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const formatarMoeda = (valor: string) => {
    const limpo = valor.replace(/\D/g, "");
    const inteiro = limpo.replace(/^0+/, "") || "0";
    const decimal = inteiro.padStart(3, "0");
    return `R$ ${decimal.slice(0, -2)},${decimal.slice(-2)}`;
  };

  const limparMoeda = (valor: string) => {
    return Number(valor.replace(/\D/g, "")) / 100;
  };

  const normalizarCategoria = (cat: string) => {
    return cat
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-");
  };

  const buscarCategorias = (texto: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      if (!texto.trim()) {
        setSugestoesCategoria([]);
        return;
      }
      try {
        const { data } = await api.get(
          "/produtos/produtos/categorias/sugestoes",
          { params: { descricao: texto } }
        );
        setSugestoesCategoria(data);
      } catch {
        setSugestoesCategoria([]);
      }
    }, 300);
  };

  const handleCadastrar = async () => {
    setErro("");

    if (!nome || !preco || !categoria) {
      setErro("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setLoading(true);

      const params: Record<string, any> = {
        nome,
        preco: limparMoeda(preco),
        categoria: normalizarCategoria(categoria),
        descricao: categoria,
      };

      if (maoObra.trim()) {
        params.preco_mao_obra = limparMoeda(maoObra);
      }

      await api.post("/produtos/produtos", null, { params });

      setMostrarSucesso(true);
    } catch (err) {
      console.error(err);
      setErro("Erro ao cadastrar produto.");
    } finally {
      setLoading(false);
    }
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
            <Text style={styles.titulo}>Cadastro de Produto</Text>

            <TextInput
              {...textInputProps}
              style={styles.input}
              placeholder="Nome"
              textColor="black"
              value={nome}
              onChangeText={setNome}
              left={
                <TextInput.Icon
                  icon={() => <ProductIcon width={20} height={20} />}
                />
              }
            />

            <TextInput
              {...textInputProps}
              style={styles.input}
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
            />

            <TextInput
              {...textInputProps}
              style={styles.input}
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
                style={[
                  styles.input,
                  sugestoesCategoria.length > 0 && { marginBottom: 0 },
                ]}
              />

              {sugestoesCategoria.length > 0 && (
                <FlatList
                  data={sugestoesCategoria}
                  keyExtractor={(item) => item}
                  keyboardShouldPersistTaps="handled"
                  style={styles.listaSugestoes}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.sugestaoItem}
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
              style={styles.botaoCadastrar}
              loading={loading}
              onPress={handleCadastrar}
            >
              Cadastrar
            </Button>
          </View>
        )}
      />

      <Portal>
        <Dialog
          visible={mostrarSucesso}
          onDismiss={() => {
            setMostrarSucesso(false);
            router.back();
          }}
          style={{ backgroundColor: "white", borderRadius: 16 }}
        >
          <Dialog.Title
            style={{ fontFamily: "Poppins_700Bold", color: "#000" }}
          >
            Sucesso!
          </Dialog.Title>
          <Dialog.Content>
            <Text style={{ fontFamily: "Poppins_400Regular", color: "#333" }}>
              Produto cadastrado com sucesso.
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
    alignContent: "center",
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
    marginBottom: 20,
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
  botaoCadastrar: {
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
