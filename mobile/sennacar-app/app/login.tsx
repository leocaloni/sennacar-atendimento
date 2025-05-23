import { useEffect, useState } from "react";
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
      const response = await fetch("http://192.168.15.2:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoginErro(data.detail || "Erro ao fazer login.");
        return;
      }

      await login(data.access_token);
      router.replace("/(tabs)/agendamentos");
    } catch (err) {
      setLoginErro("Erro de conexão com o servidor.");
      console.error("Erro ao conectar com o servidor:", err);
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
                />
                <TextInput
                  style={styles.input}
                  {...textInputProps}
                  placeholder="Senha"
                  secureTextEntry={!showSenha}
                  value={senha}
                  onChangeText={(text) => setSenha(text)}
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
