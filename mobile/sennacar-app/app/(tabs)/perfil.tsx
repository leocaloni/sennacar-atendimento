import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Button } from "react-native-paper";
import { TelaComFundo } from "../../components/TelaComFundo";
import { useAuth } from "../../contexts/AuthContext";
import { useState } from "react";
import { estilosGlobais } from "../../styles/estilosGlobais";

// Tela de perfil do usuário autenticado com opção para logout
export default function PerfilScreen() {
  const { user, logout } = useAuth();
  const [verIdCompleto, setVerIdCompleto] = useState(false);

  return (
    <TelaComFundo>
      <View style={styles.container}>
        <Text style={estilosGlobais.tituloTela}>Meu perfil</Text>

        {/* Card de informações do funcionário */}
        <View style={estilosGlobais.cardPadrao}>
          <Text style={estilosGlobais.textoLabel}>Nome</Text>
          <Text style={estilosGlobais.textoValor}>{user?.nome || "-"}</Text>

          <Text style={estilosGlobais.textoLabel}>ID</Text>
          <TouchableOpacity onPress={() => setVerIdCompleto(!verIdCompleto)}>
            <Text style={estilosGlobais.textoValor}>
              {verIdCompleto
                ? user?.id
                : user?.id?.substring(0, 8) + "... (toque para ver)"}
            </Text>
          </TouchableOpacity>

          <Text style={estilosGlobais.textoLabel}>Email</Text>
          <Text style={estilosGlobais.textoValor}>{user?.email || "-"}</Text>
        </View>

        <Button
          mode="contained"
          textColor="white"
          style={[estilosGlobais.botaoSecundario, { width: 160 }]}
          onPress={logout}
        >
          Sair
        </Button>
      </View>
    </TelaComFundo>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
});
