import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  topoFundo: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%", // cobre o topo até metade da tela (ajuste se quiser)
    zIndex: -1, // fica atrás de tudo
  },

  fundoCompleto: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  containerLogo: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    maxHeight: 300,
    position: "relative",
  },

  mascara: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  image: {
    width: 200,
    height: 60,
  },

  background: {
    flex: 5,
    borderTopRightRadius: 100,
    backgroundColor: "#000679",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  container: {
    flex: 1,
    justifyContent: "center",
  },

  textoLogin: {
    padding: 0,
    textAlign: "center",
    fontSize: 50,
    color: "white",
    fontFamily: "Poppins_700Bold",
    marginBottom: 35,
  },

  input: {
    marginTop: 20,
    fontFamily: "Poppins_400Regular",
  },

  esqueceuSenha: {
    padding: 7,
    marginBottom: 15,
    color: "white",
    textDecorationLine: "underline",
    fontFamily: "Poppins_400Regular",
  },

  botao: {
    backgroundColor: "#017b36",
    fontFamily: "Poppins_700Bold",
    alignSelf: "center",
    padding: 2,
    paddingLeft: 10,
    paddingRight: 10,

    borderRadius: 30,
  },
});

export const textInputProps = {
  mode: "outlined" as const,
  outlineStyle: {
    borderRadius: 15,
    borderWidth: 1,
  },
  activeOutlineColor: "#017b36",
  outlineColor: "#000679",
  textColor: "black",
  placeholderTextColor: "#A0A0A0",
};
