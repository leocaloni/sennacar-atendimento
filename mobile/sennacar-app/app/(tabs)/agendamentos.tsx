import { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Text } from "react-native-paper";
import { TelaComFundo } from "../../components/TelaComFundo";
import DisponivelIcon from "../../assets/icons/disponivel.svg";
import CheioIcon from "../../assets/icons/cheio.svg";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../services/api";
import {
  format,
  startOfWeek,
  addDays,
  subWeeks,
  addWeeks,
  isSameDay,
} from "date-fns";
import { useRouter } from "expo-router";

type DiaSemana = {
  data: Date;
  nome: string;
  disponivel: boolean | null;
};

const SIGLAS = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

export default function AgendamentosScreen() {
  const router = useRouter();

  const [segunda, setSegunda] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [dias, setDias] = useState<DiaSemana[]>([]);

  const fetchDisponibilidades = async () => {
    const inicio = format(segunda, "yyyy-MM-dd");
    const fim = format(addDays(segunda, 5), "yyyy-MM-dd");

    setDias(
      Array.from({ length: 6 }).map((_, i) => ({
        data: addDays(segunda, i),
        nome: SIGLAS[i],
        disponivel: null,
      }))
    );

    try {
      const response = await api.get("/agendamentos/agendamentos/periodo", {
        params: {
          data_inicio: inicio,
          data_fim: fim,
        },
      });

      const agendamentos: any[] = response.data;

      const diasAtualizados: DiaSemana[] = [];

      for (let i = 0; i < 6; i++) {
        const dataAtual = addDays(segunda, i);
        const diaAgendamentos = agendamentos.filter((a) =>
          isSameDay(new Date(a.data_agendada), dataAtual)
        );

        const horariosPossiveis = getTotalSlots(dataAtual);
        const disponivel = diaAgendamentos.length < horariosPossiveis;

        diasAtualizados.push({
          data: dataAtual,
          nome: SIGLAS[i],
          disponivel,
        });
      }

      setDias(diasAtualizados);
    } catch (err) {
      console.error("Erro ao buscar agendamentos", err);
    }
  };

  const getTotalSlots = (data: Date) => {
    const isSabado = data.getDay() === 6;
    return isSabado ? 9 : 20;
  };

  useEffect(() => {
    fetchDisponibilidades();
  }, [segunda]);

  const alterarSemana = (direcao: "anterior" | "proxima") => {
    setSegunda((prev) =>
      direcao === "anterior" ? subWeeks(prev, 1) : addWeeks(prev, 1)
    );
  };

  return (
    <TelaComFundo>
      <View style={styles.container}>
        <Text style={styles.titulo}>Gerenciar Agendamentos</Text>
        <Text style={styles.subtitulo}>Agendamentos da semana</Text>

        <View style={styles.diasContainer}>
          {dias.map((dia, index) => (
            <TouchableOpacity
              key={index}
              style={styles.botaoDia}
              onPress={() =>
                router.push({
                  pathname: "/detalheDia",
                  params: { data: dia.data.toISOString() },
                })
              }
            >
              {dia.disponivel === null ? (
                <ActivityIndicator
                  size="small"
                  color="#01913F"
                  style={{ marginBottom: 4 }}
                />
              ) : dia.disponivel ? (
                <DisponivelIcon
                  width={28}
                  height={28}
                  style={{ marginBottom: 4 }}
                />
              ) : (
                <CheioIcon width={28} height={28} style={{ marginBottom: 4 }} />
              )}
              <Text style={styles.nomeDia}>{dia.nome}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.semanaContainer}>
          <TouchableOpacity onPress={() => alterarSemana("anterior")}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>

          <Text style={styles.semanaTexto}>
            Semana do dia {format(segunda, "dd/MM/yyyy")}
          </Text>

          <TouchableOpacity onPress={() => alterarSemana("proxima")}>
            <Ionicons name="chevron-forward" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.legenda}>
          <View style={styles.legendaItem}>
            <DisponivelIcon width={24} height={24} />
            <Text style={styles.legendaTexto}>Disponível</Text>
          </View>
          <View style={styles.legendaItem}>
            <CheioIcon width={24} height={24} />
            <Text style={styles.legendaTexto}>Cheio</Text>
          </View>
        </View>
      </View>
    </TelaComFundo>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  titulo: {
    fontSize: 26,
    color: "white",
    marginBottom: 4,
    fontFamily: "Poppins_700Bold",
  },
  subtitulo: {
    fontSize: 16,
    color: "white",
    marginBottom: 30,
    fontFamily: "Poppins_400Regular",
    marginTop: 30,
  },
  diasContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
    rowGap: 16,
    marginBottom: 30,
  },
  botaoDia: {
    backgroundColor: "white",
    width: 85,
    height: 90,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  nomeDia: {
    fontFamily: "Poppins_700Bold",
    fontSize: 14,
    color: "#000",
  },
  semanaContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 30,
  },
  semanaTexto: {
    color: "white",
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
  },
  legenda: {
    flexDirection: "row",
    gap: 20,
    alignItems: "center",
  },
  legendaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendaTexto: {
    color: "white",
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
  },
});
