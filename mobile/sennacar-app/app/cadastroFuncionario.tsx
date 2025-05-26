import { useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Button, Text, TextInput, Dialog, Portal } from "react-native-paper";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { TelaComFundo } from "../components/TelaComFundo";
import { api } from "./services/api";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { textInputProps } from "../styles/styles";

import UserIcon from "../assets/icons/user-grey.svg";
import EmailIcon from "../assets/icons/email.svg";
import SenhaIcon from "../assets/icons/senha.svg";

export default function CadastroFuncionario() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [erro, setErro] = useState("");
  const [mostrarSucesso, setMostrarSucesso] = useState(false);

  const handleCadastrar = async () => {
    setErro("");

    if (!nome || !email || !senha || !confirmarSenha) {
      setErro("Preencha todos os campos.");
      return;
    }

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/funcionarios/funcionarios", null, {
        params: { nome, email, senha },
      });

      setMostrarSucesso(true);
    } catch (err) {
      console.error(err);
      setErro("Erro ao cadastrar funcionário.");
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

      <KeyboardAwareScrollView
        contentContainerStyle={styles.container}
        enableOnAndroid
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.titulo}>Cadastro de Funcionário</Text>

        <TextInput
          {...textInputProps}
          style={styles.input}
          placeholder="Nome"
          textColor="black"
          value={nome}
          onChangeText={setNome}
          left={
            <TextInput.Icon icon={() => <UserIcon width={20} height={20} />} />
          }
        />

        <TextInput
          {...textInputProps}
          style={styles.input}
          placeholder="Email"
          textColor="black"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          left={
            <TextInput.Icon icon={() => <EmailIcon width={20} height={20} />} />
          }
        />

        <TextInput
          {...textInputProps}
          style={styles.input}
          placeholder="Senha"
          textColor="black"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry={!showSenha}
          left={
            <TextInput.Icon icon={() => <SenhaIcon width={20} height={20} />} />
          }
          right={
            <TextInput.Icon
              icon={showSenha ? "eye-off" : "eye"}
              onPress={() => setShowSenha(!showSenha)}
            />
          }
        />

        <TextInput
          {...textInputProps}
          style={styles.input}
          placeholder="Confirmar senha"
          textColor="black"
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
          secureTextEntry={!showConfirmar}
          left={
            <TextInput.Icon icon={() => <SenhaIcon width={20} height={20} />} />
          }
          right={
            <TextInput.Icon
              icon={showConfirmar ? "eye-off" : "eye"}
              onPress={() => setShowConfirmar(!showConfirmar)}
            />
          }
        />

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
      </KeyboardAwareScrollView>

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
              O funcionário foi cadastrado com sucesso.
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
    paddingBottom: 80,
    paddingTop: 60,
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
    marginBottom: 30,
    fontFamily: "Poppins_700Bold",
    alignSelf: "center",
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
    fontFamily: "Poppins_400Regular",
  },
  botaoCadastrar: {
    alignSelf: "center",
    borderRadius: 30,
    paddingVertical: 6,
    width: 200,
    marginTop: 20,
  },
});
