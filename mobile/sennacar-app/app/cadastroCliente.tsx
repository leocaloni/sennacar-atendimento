import { useState } from "react";
import {
  StyleSheet,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Text, TextInput, Button, Portal, Dialog } from "react-native-paper";
import { TelaComFundo } from "../components/TelaComFundo";
import { api } from "./services/api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { textInputProps } from "../styles/styles";
import { estilosGlobais } from "../styles/estilosGlobais";

import CostumerIcon from "../assets/icons/costumer-grey.svg";
import EmailIcon from "../assets/icons/email.svg";
import PhoneIcon from "../assets/icons/phone.svg";

// Tela de cadastro de cliente: preenche nome, email, telefone e envia para a API
export default function CadastroClienteScreen() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [loading, setLoading] = useState(false);
  const [mostrarSucesso, setMostrarSucesso] = useState(false);
  const router = useRouter();

  const handleCadastrar = async () => {
    if (!nome || !email || !telefone) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/clientes/clientes", null, {
        params: { nome, email, telefone },
      });

      setMostrarSucesso(true);
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Erro ao cadastrar cliente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TelaComFundo>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.botaoVoltar}
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text
            style={[
              estilosGlobais.tituloTela,
              { textAlign: "center", marginTop: 100 },
            ]}
          >
            Cadastro de Cliente
          </Text>

          <TextInput
            {...textInputProps}
            placeholder="Nome"
            value={nome}
            onChangeText={setNome}
            left={
              <TextInput.Icon
                icon={() => <CostumerIcon width={20} height={20} />}
              />
            }
            textColor="black"
            style={styles.input}
          />

          <TextInput
            {...textInputProps}
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
            style={styles.input}
          />

          <TextInput
            {...textInputProps}
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
            style={styles.input}
          />

          <Button
            mode="contained"
            style={[estilosGlobais.botaoPadrao, { marginTop: 20 }]}
            textColor="white"
            onPress={handleCadastrar}
            loading={loading}
          >
            Cadastrar
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>

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
            style={[estilosGlobais.tituloTela, { fontSize: 20, color: "#000" }]}
          >
            Sucesso!
          </Dialog.Title>
          <Dialog.Content>
            <Text style={estilosGlobais.sugestaoTexto}>
              O cliente foi cadastrado com sucesso.
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
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 80,
  },
  input: {
    marginBottom: 20,
    backgroundColor: "white",
    borderRadius: 16,
    fontFamily: "Poppins_400Regular",
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
