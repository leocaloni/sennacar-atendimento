import { useState } from "react";
import {
  View,
  KeyboardAvoidingView,
  Image,
  TouchableOpacity,
  Text,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  ImageBackground,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { styles, textInputProps } from "../styles/styles";
import { TextInput, Button } from "react-native-paper";
import { StackNavigationProp } from "@react-navigation/stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { router } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { api } from "./services/api";
import EmailIcon from "../assets/icons/email.svg";
import SenhaIcon from "../assets/icons/senha.svg";

type RootStackParamList = {
  Login: undefined;
  Cadastro: undefined;
  Camera: undefined;
  EsqueceuSenha: undefined;
};

type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Login"
>;

interface LoginProps {
  navigation: LoginScreenNavigationProp;
}

export default function Login({ navigation }: LoginProps) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [loginErro, setLoginErro] = useState("");
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !senha) {
      setLoginErro("Todos os campos devem ser preenchidos.");
      return;
    }

    if (!email.includes("@")) {
      setLoginErro("O email precisa conter '@'.");
      return;
    }

    try {
      const response = await api.post("/auth/login", { email, senha });
      await login(response.data.access_token);
      router.replace("/(tabs)/agendamentos");
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail || "Erro ao conectar com o servidor.";
      setLoginErro(msg);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const toggleShowSenha = () => {
    setShowSenha(!showSenha);
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
                <Text style={styles.textoLogin}>Bem-vindo!</Text>
                <TextInput
                  style={styles.input}
                  {...textInputProps}
                  placeholder="Email"
                  value={email}
                  onChangeText={(text) => setEmail(text)}
                  left={
                    <TextInput.Icon
                      icon={() => <EmailIcon width={20} height={20} />}
                    />
                  }
                />

                <TextInput
                  style={styles.input}
                  {...textInputProps}
                  placeholder="Senha"
                  secureTextEntry={!showSenha}
                  value={senha}
                  onChangeText={(text) => setSenha(text)}
                  left={
                    <TextInput.Icon
                      icon={() => <SenhaIcon width={20} height={20} />}
                    />
                  }
                  right={
                    <TextInput.Icon
                      icon={showSenha ? "eye-off" : "eye"}
                      onPress={toggleShowSenha}
                    />
                  }
                />

                <TouchableOpacity>
                  <Text
                    style={styles.esqueceuSenha}
                    onPress={() => navigation.navigate("EsqueceuSenha")}
                  >
                    Esqueceu sua senha?
                  </Text>
                </TouchableOpacity>
                {loginErro ? (
                  <Text style={{ color: "red", marginBottom: 10 }}>
                    {loginErro}
                  </Text>
                ) : null}
                <Button
                  style={styles.botao}
                  mode="contained"
                  onPress={handleLogin}
                >
                  Entrar
                </Button>
              </View>
            </View>
          </KeyboardAwareScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
