import { useState } from "react";
import { StyleSheet, Alert, TouchableOpacity } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { TelaComFundo } from "../components/TelaComFundo";
import { api } from "./services/api";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { textInputProps } from "../styles/styles";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import CostumerIcon from "../assets/icons/costumer-grey.svg";
import EmailIcon from "../assets/icons/email.svg";
import PhoneIcon from "../assets/icons/phone.svg";

export default function CadastroCliente() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [loading, setLoading] = useState(false);

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

      Alert.alert("Sucesso", "Cliente cadastrado com sucesso!");
      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Erro ao cadastrar cliente.");
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

        <Text style={styles.titulo}>Cadastro de Cliente</Text>

        <TextInput
          {...textInputProps}
          style={styles.input}
          placeholder="Nome"
          value={nome}
          textColor="black"
          onChangeText={setNome}
          left={
            <TextInput.Icon
              icon={() => <CostumerIcon width={20} height={20} />}
            />
          }
        />

        <TextInput
          {...textInputProps}
          style={styles.input}
          placeholder="Email"
          value={email}
          textColor="black"
          onChangeText={setEmail}
          keyboardType="email-address"
          left={
            <TextInput.Icon icon={() => <EmailIcon width={20} height={20} />} />
          }
        />

        <TextInput
          {...textInputProps}
          style={styles.input}
          placeholder="Telefone"
          value={telefone}
          textColor="black"
          onChangeText={setTelefone}
          keyboardType="phone-pad"
          left={
            <TextInput.Icon icon={() => <PhoneIcon width={20} height={20} />} />
          }
        />

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
    </TelaComFundo>
  );
}

export const options = {
  headerShown: false,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    alignContent: "center",
    justifyContent: "center",
  },
  botaoVoltar: {
    position: "absolute",
    top: 10,
    left: 10,
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
  botaoCadastrar: {
    alignSelf: "center",
    borderRadius: 30,
    paddingVertical: 6,
    width: 200,
    marginTop: 30,
  },
});
