import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Text, TextInput, Button, Dialog, Portal } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { api } from "./services/api";
import { Ionicons } from "@expo/vector-icons";
import { TelaComFundo } from "../components/TelaComFundo";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import UserIcon from "../assets/icons/user-grey.svg"; // Ícone de nome
import EmailIcon from "../assets/icons/email.svg"; // Ícone de email
import { textInputProps } from "../styles/styles"; // Usando os mesmos textInputProps

export default function EditarFuncionarioScreen() {
  const { id } = useLocalSearchParams();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const router = useRouter();

  // Carregar os dados do funcionário
  useEffect(() => {
    const carregarFuncionario = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/funcionarios/funcionarios/${id}`);
        setNome(data.nome);
        setEmail(data.email);
      } catch (err) {
        setErro("Erro ao carregar dados do funcionário.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      carregarFuncionario();
    }
  }, [id]);

  interface AtualizacaoFuncionario {
    nome?: string;
    email?: string;
  }

  // Função para atualizar os dados do funcionário
  const atualizarFuncionario = async () => {
    const dadosAtualizados: AtualizacaoFuncionario = {};
    if (nome) dadosAtualizados.nome = nome;
    if (email) dadosAtualizados.email = email;

    if (Object.keys(dadosAtualizados).length === 0) {
      setErro("Por favor, forneça pelo menos um campo para atualização.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.put(
        `/funcionarios/funcionarios/${id}`,
        dadosAtualizados
      );
      router.back(); // Redireciona de volta após a atualização
    } catch (err) {
      setErro("Erro ao atualizar funcionário.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TelaComFundo>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.container}
        enableOnAndroid
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.botaoVoltar}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <Text style={styles.titulo}>Editar Funcionário</Text>

        {loading && (
          <ActivityIndicator style={{ marginTop: 20 }} color="#017b36" />
        )}

        <View style={styles.formContainer}>
          {erro !== "" && <Text style={styles.erro}>{erro}</Text>}

          <TextInput
            {...textInputProps}
            style={styles.input}
            placeholder="Nome"
            value={nome}
            onChangeText={setNome}
            left={
              <TextInput.Icon
                icon={() => <UserIcon width={20} height={20} />}
              />
            }
            textColor="black"
          />

          <TextInput
            {...textInputProps}
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            left={
              <TextInput.Icon
                icon={() => <EmailIcon width={20} height={20} />}
              />
            }
            textColor="black"
          />

          <Button
            mode="contained"
            style={styles.botao}
            textColor="white"
            onPress={atualizarFuncionario}
            loading={loading}
          >
            Atualizar
          </Button>
        </View>
      </KeyboardAwareScrollView>

      <Portal>
        <Dialog
          visible={!!erro}
          onDismiss={() => setErro("")}
          style={{ backgroundColor: "white", borderRadius: 16 }}
        >
          <Dialog.Title
            style={{ fontFamily: "Poppins_700Bold", color: "#000" }}
          >
            Erro
          </Dialog.Title>
          <Dialog.Content>
            <Text style={{ fontFamily: "Poppins_400Regular", color: "#333" }}>
              {erro}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button textColor="#017b36" onPress={() => setErro("")}>
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
    paddingBottom: 80,
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
  titulo: {
    fontSize: 26,
    color: "white",
    fontFamily: "Poppins_700Bold",
    marginBottom: 30,
    textAlign: "center",
  },
  formContainer: {
    paddingVertical: 20,
  },
  input: {
    marginBottom: 20,
    backgroundColor: "white",
    borderRadius: 16,
    fontFamily: "Poppins_400Regular",
  },
  erro: {
    color: "white",
    marginBottom: 12,
    textAlign: "center",
  },
  botao: {
    alignSelf: "center",
    borderRadius: 30,
    paddingVertical: 6,
    width: 200,
    marginTop: 20,
    backgroundColor: "#017b36",
  },
});
