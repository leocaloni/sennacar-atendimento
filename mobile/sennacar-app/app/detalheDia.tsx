import { useEffect, useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Text } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { api } from "./services/api";
import { TelaComFundo } from "../components/TelaComFundo";
import { Ionicons } from "@expo/vector-icons";
import {
  format,
  getDay,
  addMinutes,
  isSameMinute,
  setHours,
  setMinutes,
} from "date-fns";
import ptBR from "date-fns/locale/pt-BR";

export default function DetalheDiaScreen() {
  const router = useRouter();
  const { data } = useLocalSearchParams();
  const dataSelecionada = useMemo(() => new Date(data as string), [data]);

  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgendamentosComDetalhes = async () => {
      setLoading(true);
      try {
        const dataStr = format(dataSelecionada, "yyyy-MM-dd");

        const { data: ags } = await api.get(
          "/agendamentos/agendamentos/periodo",
          {
            params: { data_inicio: dataStr, data_fim: dataStr },
          }
        );

        const agsComDetalhes = await Promise.all(
          ags.map(async (ag: any) => {
            let clienteNome = ag.cliente_id;
            try {
              const { data } = await api.get(
                `/clientes/clientes/${ag.cliente_id}`
              );
              clienteNome = data.nome;
            } catch {}

            let nomesProdutos: string[] = [];
            try {
              nomesProdutos = await Promise.all(
                ag.produtos.map(async (id: string) => {
                  const { data } = await api.get(`/produtos/produtos/${id}`);
                  return data.nome;
                })
              );
            } catch {}

            return {
              ...ag,
              cliente_nome: clienteNome,
              produtos_nomes: nomesProdutos,
            };
          })
        );

        setAgendamentos(agsComDetalhes);
      } catch (err) {
        console.error("Erro ao buscar agendamentos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgendamentosComDetalhes();
  }, [dataSelecionada]);

  const gerarHorarios = () => {
    const horarios = [];
    const isSabado = getDay(dataSelecionada) === 6;
    const inicio = setMinutes(setHours(dataSelecionada, 8), 0);
    const fim = isSabado
      ? setMinutes(setHours(dataSelecionada, 12), 30)
      : setMinutes(setHours(dataSelecionada, 17), 30);

    let atual = inicio;
    while (atual <= fim) {
      horarios.push(atual);
      atual = addMinutes(atual, 30);
    }

    return horarios;
  };

  const statusDia =
    agendamentos.length >= gerarHorarios().length ? "CHEIO" : "DISPONÍVEL";
  const corStatus = statusDia === "CHEIO" ? "#C62828" : "#017b36";

  const obterAgendamento = (hora: Date) => {
    return agendamentos.find((a) =>
      isSameMinute(new Date(a.data_agendada), hora)
    );
  };

  return (
    <TelaComFundo>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.botaoVoltar}
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      <Text style={styles.titulo}>Agendamentos do dia</Text>

      <View style={styles.statusContainer}>
        <Text style={styles.statusDia}>
          {format(dataSelecionada, "EEEE", { locale: ptBR }).toUpperCase()}
          {": "}
        </Text>
        <Text
          style={[styles.statusDia, { color: corStatus, fontWeight: "bold" }]}
        >
          {statusDia}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : (
        gerarHorarios().map((horaInicio, index) => {
          const horaFim = addMinutes(horaInicio, 30);
          const agendamento = obterAgendamento(horaInicio);

          return (
            <View key={index} style={styles.card}>
              <Text style={styles.horario}>
                {format(horaInicio, "HH:mm")} - {format(horaFim, "HH:mm")}
              </Text>

              {agendamento ? (
                <View>
                  <Text style={styles.label}>Produtos</Text>
                  <Text style={styles.valor}>
                    {agendamento.produtos_nomes.join(", ")}
                  </Text>

                  <Text style={styles.label}>Cliente</Text>
                  <Text style={styles.valor}>{agendamento.cliente_nome}</Text>

                  <Text style={styles.label}>Valor total</Text>
                  <Text style={styles.valor}>
                    R$ {agendamento.valor_total.toFixed(2)}
                  </Text>
                </View>
              ) : (
                <Text style={styles.disponivel}>⏳ Horário disponível</Text>
              )}
            </View>
          );
        })
      )}
    </TelaComFundo>
  );
}

const styles = StyleSheet.create({
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
    marginTop: 60,
    marginBottom: 10,
    fontFamily: "Poppins_700Bold",
    alignSelf: "center",
  },
  statusContainer: {
    flexDirection: "row",
    alignSelf: "center",
    marginBottom: 20,
  },
  statusDia: {
    fontSize: 16,
    color: "white",
    fontFamily: "Poppins_500Medium",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#017b36",
    marginHorizontal: 4,
  },
  horario: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#000",
    fontFamily: "Poppins_700Bold",
  },
  label: {
    fontSize: 13,
    color: "#555",
    fontFamily: "Poppins_400Regular",
    marginTop: 4,
  },
  valor: {
    fontSize: 15,
    color: "#000",
    fontFamily: "Poppins_500Medium",
  },
  disponivel: {
    fontStyle: "italic",
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
});
