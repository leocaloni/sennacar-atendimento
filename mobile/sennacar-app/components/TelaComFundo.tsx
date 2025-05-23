import React from "react";
import {
  View,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

interface TelaComFundoProps {
  children: React.ReactNode;
}

const { width } = Dimensions.get("window");
const ALTURA_IMAGEM = 140;

export const TelaComFundo = ({ children }: TelaComFundoProps) => {
  const dismissKeyboard = () => Keyboard.dismiss();

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <StatusBar style="light" />

          {/* 🔵 IMAGEM COMPLETA FIXA NO TOPO */}
          <ImageBackground
            source={require("../assets/images/loja-camera.jpg")}
            resizeMode="cover"
            style={localStyles.imagemFixa}
          >
            <View style={localStyles.mascara} />
            {/* LOGO DENTRO DA IMAGEM */}
            <View style={localStyles.logoWrapper}>
              <Image
                source={require("../assets/images/logo-completa.png")}
                style={localStyles.logo}
              />
            </View>
          </ImageBackground>

          {/* 🟦 ÁREA AZUL SOBRE A IMAGEM COM BORDA */}
          <View style={localStyles.backgroundWrapper}>
            <View style={localStyles.container}>{children}</View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const localStyles = StyleSheet.create({
  imagemFixa: {
    width: width,
    height: 200, // a imagem cobre até onde quiser (pode ser maior que ALTURA_VISÍVEL)
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: -1, // FICA NO FUNDO!
  },
  mascara: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  logoWrapper: {
    paddingTop: 40,
    paddingHorizontal: 10,
    height: 60,
    justifyContent: "center",
  },
  logo: {
    width: 150,
    height: 52,
    resizeMode: "contain",
  },
  backgroundWrapper: {
    flex: 1,
    marginTop: ALTURA_IMAGEM - 40, // sobe pra SOBREPOR A IMAGEM!
    backgroundColor: "#000679",
    borderTopRightRadius: 100,
    borderTopLeftRadius: 0,
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    justifyContent: "center",
  },
});
