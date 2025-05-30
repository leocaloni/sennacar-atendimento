import { useState, useMemo, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Text, Portal, Dialog, Button } from "react-native-paper";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
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

// Tela de detalhamento dos agendamentos do dia: exibe horários, status e permite cancelar ou criar agendamentos.
export default function DetalheDiaScreen() {
  const router = useRouter();
  const { data } = useLocalSearchParams();
  const dataSelecionada = useMemo(() => new Date(data as string), [data]);

  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [popupVisivel, setPopupVisivel] = useState(false);
  const [idParaCancelar, setIdParaCancelar] = useState<string | null>(null);

  const abrirConfirmacaoCancelamento = (id: string) => {
    setIdParaCancelar(id);
    setPopupVisivel(true);
  };

  const fetchAgendamentos = useCallback(async () => {
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
  }, [dataSelecionada]);

  useFocusEffect(
    useCallback(() => {
      fetchAgendamentos();
    }, [fetchAgendamentos])
  );

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
    return agendamentos.find((a) => {
      const agDataUTC = new Date(a.data_agendada);
      const agDataLocal = new Date(
        agDataUTC.getTime() - agDataUTC.getTimezoneOffset() * 60000
      );

      return (
        agDataLocal.getHours() === hora.getHours() &&
        agDataLocal.getMinutes() === hora.getMinutes()
      );
    });
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
        <View style={styles.cardScrollContainer}>
          <FlatList
            data={gerarHorarios()}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item: horaInicio }) => {
              const horaFim = addMinutes(horaInicio, 30);
              const agendamento = obterAgendamento(horaInicio);

              return (
                <View style={styles.card}>
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
                      <Text style={styles.valor}>
                        {agendamento.cliente_nome}
                      </Text>

                      <Text style={styles.label}>Valor total</Text>
                      <Text style={styles.valor}>
                        R$ {agendamento.valor_total.toFixed(2)}
                      </Text>

                      <TouchableOpacity
                        onPress={() =>
                          abrirConfirmacaoCancelamento(agendamento._id)
                        }
                        style={styles.botaoCancelar}
                      >
                        <Text style={styles.textoBotaoCancelar}>
                          Cancelar Agendamento
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.disponivel}>
                        ⏳ Horário disponível
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          router.push({
                            pathname: "/novoAgendamento",
                            params: {
                              horario: horaInicio.toISOString(),
                            },
                          })
                        }
                        style={styles.botaoAgendar}
                      >
                        <Text style={styles.textoBotaoAgendar}>Agendar</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              );
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
          />
        </View>
      )}

      <Portal>
        <Dialog
          visible={popupVisivel}
          onDismiss={() => setPopupVisivel(false)}
          style={{ backgroundColor: "white", borderRadius: 16 }}
        >
          <Dialog.Title
            style={{ fontFamily: "Poppins_700Bold", color: "#000" }}
          >
            Cancelar agendamento
          </Dialog.Title>
          <Dialog.Content>
            <Text style={{ fontFamily: "Poppins_400Regular", color: "#333" }}>
              Tem certeza que deseja cancelar este agendamento?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setPopupVisivel(false)}
              textColor="#017b36"
              style={{ borderRadius: 10 }}
            >
              Não
            </Button>
            <Button
              textColor="#C62828"
              style={{ borderRadius: 10 }}
              onPress={async () => {
                if (!idParaCancelar) return;
                try {
                  await api.delete(
                    `/agendamentos/agendamentos/agendamento/${idParaCancelar}`
                  );
                  setAgendamentos((prev) =>
                    prev.filter((a) => a._id !== idParaCancelar)
                  );
                } catch (e) {
                  console.error("Erro ao cancelar agendamento", e);
                } finally {
                  setPopupVisivel(false);
                  setIdParaCancelar(null);
                }
              }}
            >
              Sim
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </TelaComFundo>
  );
}

const styles = StyleSheet.create({
  botaoVoltar: {
    position: "absolute",
    top: 20,
    left: 20,
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
  cardScrollContainer: {
    flex: 1,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
    marginHorizontal: 10,
    borderColor: "#017b36",
    borderWidth: 2,
  },
  horario: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#000",
    fontFamily: "Poppins_700Bold",
  },
  label: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins_400Regular",
    marginTop: 10,
  },
  valor: {
    fontSize: 16,
    color: "#000",
    fontFamily: "Poppins_700Bold",
  },
  disponivel: {
    fontStyle: "italic",
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  botaoCancelar: {
    marginTop: 12,
    backgroundColor: "#C62828",
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: "center",
  },
  textoBotaoCancelar: {
    color: "#fff",
    fontFamily: "Poppins_700Bold",
    fontSize: 14,
  },
  botaoAgendar: {
    marginTop: 10,
    backgroundColor: "#017b36",
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: "center",
  },
  textoBotaoAgendar: {
    color: "white",
    fontFamily: "Poppins_700Bold",
    fontSize: 14,
  },
});
