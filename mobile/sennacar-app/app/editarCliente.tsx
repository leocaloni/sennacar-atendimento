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
import CostumerIcon from "../assets/icons/costumer-grey.svg";
import EmailIcon from "../assets/icons/email.svg";
import PhoneIcon from "../assets/icons/phone.svg";
import { textInputProps } from "../styles/styles";

export default function EditarClienteScreen() {
  const { id } = useLocalSearchParams();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [confirmarEdicao, setConfirmarEdicao] = useState(false);
  const [feedbackEdicao, setFeedbackEdicao] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const carregarCliente = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/clientes/clientes/${id}`);
        setNome(data.nome);
        setEmail(data.email);
        setTelefone(data.telefone);
      } catch (err) {
        setErro("Erro ao carregar dados do cliente.");
        console.error("Erro ao carregar dados do cliente:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      carregarCliente();
    }
  }, [id]);

  interface AtualizacaoCliente {
    nome?: string;
    email?: string;
    telefone?: string;
  }

  const confirmarAtualizacao = async () => {
    const dadosAtualizados: AtualizacaoCliente = {};
    if (nome) dadosAtualizados.nome = nome;
    if (email) dadosAtualizados.email = email;
    if (telefone) dadosAtualizados.telefone = telefone;

    if (Object.keys(dadosAtualizados).length === 0) {
      setErro("Por favor, forneça pelo menos um campo para atualização.");
      setConfirmarEdicao(false);
      return;
    }

    setLoading(true);
    try {
      await api.put(`/clientes/clientes/${id}`, dadosAtualizados);
      setFeedbackEdicao(true);
    } catch (err) {
      setErro("Erro ao atualizar cliente.");
      console.error("Erro ao atualizar cliente:", err);
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

        <Text style={styles.titulo}>Editar Cliente</Text>

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
                icon={() => <CostumerIcon width={20} height={20} />}
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

          <TextInput
            {...textInputProps}
            style={styles.input}
            placeholder="Telefone"
            value={telefone}
            onChangeText={setTelefone}
            keyboardType="phone-pad"
            left={
              <TextInput.Icon
                icon={() => <PhoneIcon width={20} height={20} />}
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
        {/* Modal de erro */}
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

        {/* Modal de confirmação */}
        <Dialog
          visible={confirmarEdicao}
          onDismiss={() => setConfirmarEdicao(false)}
          style={{ backgroundColor: "white", borderRadius: 16 }}
        >
          <Dialog.Title
            style={{ fontFamily: "Poppins_700Bold", color: "#000" }}
          >
            Confirmar edição
          </Dialog.Title>
          <Dialog.Content>
            <Text style={{ fontFamily: "Poppins_400Regular", color: "#333" }}>
              Tem certeza que deseja atualizar os dados deste cliente?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setConfirmarEdicao(false)}
              textColor="#017b36"
            >
              Cancelar
            </Button>
            <Button onPress={confirmarAtualizacao} textColor="#000679">
              Atualizar
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Modal de feedback */}
        <Dialog
          visible={feedbackEdicao}
          onDismiss={() => {
            setFeedbackEdicao(false);
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
              Os dados foram atualizados com sucesso.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setFeedbackEdicao(false);
                router.back();
              }}
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
