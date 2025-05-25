import React from "react";
import {
  View,
  Image,
  ImageBackground,
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
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <ImageBackground
        source={require("../assets/images/loja-camera.jpg")}
        resizeMode="cover"
        style={localStyles.imagemFixa}
      >
        <View style={localStyles.mascara} />
        <View style={localStyles.logoWrapper}>
          <Image
            source={require("../assets/images/logo-completa.png")}
            style={localStyles.logo}
          />
        </View>
      </ImageBackground>

      <View style={localStyles.backgroundWrapper}>{children}</View>
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  imagemFixa: {
    width: width,
    height: 200,
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: -1,
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
    marginTop: ALTURA_IMAGEM - 80,
    backgroundColor: "#000679",
    borderTopRightRadius: 100,
    borderTopLeftRadius: 0,
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
});
