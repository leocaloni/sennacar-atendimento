import {
  View,
  StyleSheet,
  TextInput as RNTextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { RadioButton, Button, Text } from "react-native-paper";
import { TelaComFundo } from "../../components/TelaComFundo";
import { api } from "../services/api";
import UserIcon from "../../assets/icons/user-grey.svg";
import EmailIcon from "../../assets/icons/email.svg";
import PhoneIcon from "../../assets/icons/phone.svg";
import SearchIcon from "../../assets/icons/search-white.svg";

export default function BuscaScreen() {
  const [metodo, setMetodo] = useState("nome");
  const [valor, setValor] = useState("");
  const [cliente, setCliente] = useState<{
    nome: string;
    email: string;
    telefone: string;
    _id: string;
  } | null>(null);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const icone =
    metodo === "nome" ? (
      <UserIcon width={22} height={22} />
    ) : metodo === "email" ? (
      <EmailIcon width={22} height={22} />
    ) : (
      <PhoneIcon width={22} height={22} />
    );

  const placeholder =
    metodo === "nome" ? "Nome" : metodo === "email" ? "Email" : "Telefone";

  const buscarCliente = async () => {
    setErro("");
    setCliente(null);
    setLoading(true);

    try {
      const endpoint =
        metodo === "telefone"
          ? `/clientes/telefone/${valor}`
          : `/clientes/?${metodo}=${valor}`;

      const response = await api.get(endpoint);
      setCliente(response.data);
    } catch (err) {
      setErro("Cliente não encontrado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TelaComFundo>
      <View style={styles.container}>
        <Text style={styles.titulo}>Consultar clientes</Text>

        <RadioButton.Group
          onValueChange={(value) => setMetodo(value)}
          value={metodo}
        >
          <View style={styles.radioRow}>
            {["nome", "email", "telefone"].map((item) => (
              <View key={item} style={styles.radioOption}>
                <RadioButton
                  color="#01913F"
                  uncheckedColor="white"
                  value={item}
                />
                <Text style={styles.radioLabel}>{item}</Text>
              </View>
            ))}
          </View>
        </RadioButton.Group>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 30,
          }}
        >
          <View style={[styles.inputWrapper, { flex: 1 }]}>
            <View style={styles.icon}>{icone}</View>
            <RNTextInput
              style={styles.input}
              placeholder={placeholder}
              value={valor}
              onChangeText={setValor}
              placeholderTextColor="#A0A0A0"
            />
          </View>

          <TouchableOpacity
            style={[styles.botaoBusca, { marginLeft: 10 }]}
            onPress={buscarCliente}
          >
            <SearchIcon width={24} height={24} style={{ marginTop: 1 }} />
          </TouchableOpacity>
        </View>

        {loading && <ActivityIndicator style={{ marginTop: 20 }} />}

        {cliente && (
          <View style={styles.card}>
            <Text style={styles.label}>Nome</Text>
            <Text style={styles.valor}>{cliente.nome}</Text>

            <Text style={styles.label}>ID</Text>
            <Text style={styles.valor}>{cliente._id}</Text>

            <Text style={styles.label}>Email</Text>
            <Text style={styles.valor}>{cliente.email}</Text>

            <Text style={styles.label}>Telefone</Text>
            <Text style={styles.valor}>{cliente.telefone}</Text>
          </View>
        )}

        {erro ? <Text style={styles.erro}>{erro}</Text> : null}

        <Text style={styles.pergunta}>Não encontrou o cliente?</Text>

        <Button
          mode="contained"
          buttonColor="#017b36"
          textColor="white"
          style={styles.botaoCadastrar}
          onPress={() => {
            // router.push("/clientes/cadastrar") ← futuro
          }}
        >
          Cadastrar cliente
        </Button>
      </View>
    </TelaComFundo>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titulo: {
    fontSize: 26,
    color: "white",
    marginBottom: 30,
    fontFamily: "Poppins_700Bold",
  },
  radioRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioLabel: {
    color: "white",
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    paddingHorizontal: 12,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    fontFamily: "Poppins_400Regular",
    color: "#000",
  },
  botaoBusca: {
    backgroundColor: "#017b36",
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },

  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    marginHorizontal: 10,
    borderWidth: 2,
    borderColor: "#017b36",
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginTop: 10,
    fontFamily: "Poppins_400Regular",
  },
  valor: {
    fontSize: 16,
    color: "#000",
    fontFamily: "Poppins_700Bold",
  },
  erro: {
    color: "white",
    marginBottom: 20,
    textAlign: "center",
    fontFamily: "Poppins_400Regular",
  },
  pergunta: {
    color: "white",
    textAlign: "center",
    marginBottom: 8,
    fontFamily: "Poppins_400Regular",
  },
  botaoCadastrar: {
    alignSelf: "center",
    borderRadius: 30,
    paddingVertical: 6,
    width: 200,
    marginBottom: 30,
  },
});
