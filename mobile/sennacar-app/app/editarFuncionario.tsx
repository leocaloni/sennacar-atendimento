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
import UserIcon from "../assets/icons/user-grey.svg";
import EmailIcon from "../assets/icons/email.svg";
import { textInputProps } from "../styles/styles";
import { cores } from "../styles/cores";
import { fontes } from "../styles/fontes";

export default function EditarFuncionarioScreen() {
  const { id } = useLocalSearchParams();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [confirmarEdicao, setConfirmarEdicao] = useState(false);
  const [feedbackEdicao, setFeedbackEdicao] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const carregarFuncionario = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/funcionarios/funcionarios/${id}`);
        setNome(data.nome);
        setEmail(data.email);
      } catch (err) {
        setErro("Erro ao carregar dados do funcionário.");
        console.error("Erro ao carregar dados do funcionário:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      carregarFuncionario();
    }
  }, [id]);

  const confirmarAtualizacao = async () => {
    const dadosAtualizados: { nome?: string; email?: string } = {};
    if (nome) dadosAtualizados.nome = nome;
    if (email) dadosAtualizados.email = email;

    if (Object.keys(dadosAtualizados).length === 0) {
      setErro("Por favor, forneça pelo menos um campo para atualização.");
      setConfirmarEdicao(false);
      return;
    }

    setLoading(true);
    try {
      await api.put(`/funcionarios/funcionarios/${id}`, dadosAtualizados);
      setFeedbackEdicao(true);
    } catch (err) {
      setErro("Erro ao atualizar funcionário.");
      console.error("Erro ao atualizar funcionário:", err);
    } finally {
      setLoading(false);
      setConfirmarEdicao(false);
    }
  };

  return (
    <TelaComFundo>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.container}
        enableOnAndroid
        showsVerticalScrollIndicator={false}
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
          <ActivityIndicator
            style={{ marginTop: 20 }}
            color={cores.verdePrincipal}
          />
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
            onPress={() => setConfirmarEdicao(true)}
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
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitulo}>Erro</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogTexto}>{erro}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              textColor={cores.verdePrincipal}
              onPress={() => setErro("")}
            >
              OK
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={confirmarEdicao}
          onDismiss={() => setConfirmarEdicao(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitulo}>
            Confirmar edição
          </Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogTexto}>
              Tem certeza que deseja atualizar os dados deste funcionário?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setConfirmarEdicao(false)}
              textColor={cores.verdePrincipal}
            >
              Cancelar
            </Button>
            <Button onPress={confirmarAtualizacao} textColor="#000679">
              Atualizar
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={feedbackEdicao}
          onDismiss={() => {
            setFeedbackEdicao(false);
            router.back();
          }}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitulo}>Sucesso!</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogTexto}>
              Os dados foram atualizados com sucesso.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setFeedbackEdicao(false);
                router.back();
              }}
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
    backgroundColor: cores.verdePrincipal,
    borderRadius: 12,
    padding: 5,
  },
  titulo: {
    fontSize: 26,
    color: "white",
    fontFamily: fontes.bold,
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
    fontFamily: fontes.regular,
  },
  erro: {
    color: "white",
    marginBottom: 12,
    textAlign: "center",
    fontFamily: fontes.regular,
  },
  botao: {
    alignSelf: "center",
    borderRadius: 30,
    paddingVertical: 6,
    width: 200,
    marginTop: 20,
    backgroundColor: cores.verdePrincipal,
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
