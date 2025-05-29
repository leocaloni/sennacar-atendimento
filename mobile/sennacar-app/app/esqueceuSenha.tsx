// esqueceuSenha.tsx

import { useState } from "react";
import {
  View,
  KeyboardAvoidingView,
  Image,
  Text,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { styles, textInputProps } from "../styles/styles";
import { TextInput, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { api } from "./services/api";
import EmailIcon from "../assets/icons/email.svg";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function EsqueceuSenha() {
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const router = useRouter();

  const handleEnviar = async () => {
    setMensagem("");
    setErro("");

    if (!email || !email.includes("@")) {
      setErro("Informe um email válido.");
      return;
    }

    try {
      await api.post("/auth/forgot-password", { email });
      setMensagem("Instruções enviadas para seu email.");
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Erro ao tentar enviar email.";
      setErro(msg);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <StatusBar style="light" />

          <View style={styles.topoFundo}>
            <ImageBackground
              source={require("../assets/images/loja-camera.jpg")}
              resizeMode="cover"
              style={styles.fundoCompleto}
            >
              <View style={styles.mascara} />
            </ImageBackground>
          </View>

          <KeyboardAwareScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            enableOnAndroid
            extraScrollHeight={20}
          >
            <View style={styles.containerLogo}>
              <Image
                style={styles.image}
                source={require("../assets/images/logo-completa.png")}
              />
            </View>

            <View style={styles.background}>
              <View style={styles.container}>
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={[localStyles.botaoVoltar, { left: 2, top: 30 }]}
                >
                  <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.textoSenha}>Recuperar Senha</Text>
                <TextInput
                  style={[styles.input, { marginBottom: 60 }]}
                  {...textInputProps}
                  placeholder="Email"
                  textColor="black"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={(text) => setEmail(text)}
                  left={
                    <TextInput.Icon
                      icon={() => <EmailIcon width={20} height={20} />}
                    />
                  }
                />
                {mensagem ? (
                  <Text style={{ color: "green", marginBottom: 10 }}>
                    {mensagem}
                  </Text>
                ) : null}
                {erro ? (
                  <Text style={{ color: "red", marginBottom: 10 }}>{erro}</Text>
                ) : null}
                <Button
                  style={styles.botao}
                  mode="contained"
                  textColor="white"
                  onPress={handleEnviar}
                >
                  Enviar
                </Button>
              </View>
            </View>
          </KeyboardAwareScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const localStyles = StyleSheet.create({
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
