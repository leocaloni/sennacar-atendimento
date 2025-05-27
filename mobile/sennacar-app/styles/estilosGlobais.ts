import { StyleSheet } from "react-native";
import { cores } from "./cores";
import { fontes } from "./fontes";

export const estilosGlobais = StyleSheet.create({
  tituloTela: {
    fontSize: 26,
    color: cores.branco,
    fontFamily: fontes.bold,
    marginBottom: 30,
  },

  subtituloTela: {
    fontSize: 16,
    color: cores.branco,
    fontFamily: fontes.regular,
    textAlign: "center",
    marginVertical: 20,
  },

  cardPadrao: {
    backgroundColor: cores.branco,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: cores.verdePrincipal,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  textoLabel: {
    fontSize: 14,
    color: cores.cinza,
    fontFamily: fontes.regular,
    marginTop: 10,
  },

  textoValor: {
    fontSize: 16,
    color: cores.preto,
    fontFamily: fontes.bold,
  },

  erroTexto: {
    color: cores.branco,
    textAlign: "center",
    fontFamily: fontes.regular,
    marginBottom: 20,
  },

  botaoPadrao: {
    alignSelf: "center",
    borderRadius: 30,
    paddingVertical: 8,
    width: 200,
    backgroundColor: cores.verdePrincipal,
  },

  botaoSecundario: {
    backgroundColor: cores.vermelho,
    alignSelf: "center",
    borderRadius: 30,
    paddingVertical: 8,
    width: 200,
  },

  botaoBusca: {
    backgroundColor: cores.verdePrincipal,
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  botaoDia: {
    backgroundColor: cores.branco,
    width: 85,
    height: 90,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 6,
    justifyContent: "center",
    alignItems: "center",
  },

  listaSugestoes: {
    backgroundColor: cores.branco,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: "#A0A0A0",
    maxHeight: 250,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  sugestaoItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  sugestaoTexto: {
    fontSize: 15,
    fontFamily: fontes.regular,
    color: "#333",
  },

  textoBotaoPequeno: {
    color: cores.branco,
    fontFamily: fontes.bold,
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
});
export const sugestaoItem = {
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderBottomWidth: 1,
  borderBottomColor: "#eee",
};

export const sugestaoTexto = {
  fontSize: 15,
  fontFamily: fontes.regular,
  color: "#333",
};
