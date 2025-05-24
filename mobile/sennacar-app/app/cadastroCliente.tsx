import { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput as RNTextInput,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Button, Text } from "react-native-paper";
import { TelaComFundo } from "../components/TelaComFundo";
import { api } from "./services/api";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import UserIcon from "../assets/icons/user-grey.svg";
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
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.botaoVoltar}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <Text style={styles.titulo}>Cadastro de Cliente</Text>

        <View style={styles.inputWrapper}>
          <UserIcon width={20} height={20} style={{ marginRight: 8 }} />
          <RNTextInput
            style={styles.input}
            placeholder="Nome"
            value={nome}
            onChangeText={setNome}
            placeholderTextColor="#A0A0A0"
          />
        </View>

        <View style={styles.inputWrapper}>
          <EmailIcon width={20} height={20} style={{ marginRight: 8 }} />
          <RNTextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholderTextColor="#A0A0A0"
          />
        </View>

        <View style={styles.inputWrapper}>
          <PhoneIcon width={20} height={20} style={{ marginRight: 8 }} />
          <RNTextInput
            style={styles.input}
            placeholder="Telefone"
            value={telefone}
            onChangeText={setTelefone}
            keyboardType="phone-pad"
            placeholderTextColor="#A0A0A0"
          />
        </View>

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
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 50,
    fontFamily: "Poppins_400Regular",
    color: "#000",
  },
  botaoCadastrar: {
    alignSelf: "center",
    borderRadius: 30,
    paddingVertical: 6,
    width: 200,
    marginTop: 30,
  },
});
