from datetime import datetime, timedelta, time
from typing import List
from app.models.agendamento import Agendamento
from app.models.cliente import Cliente
from app.google.calendario import GoogleCalendarService
from pytz import timezone, utc


# Função que retorna a lista de horários disponíveis para agendamento em uma data específica
# Considera horários de funcionamento (segunda a sábado) e remove os horários já ocupados com base no banco
def get_horarios_disponiveis(data) -> List[str]:
    if data.weekday() == 6:
        return []

    if data.weekday() == 5:
        inicio = time(8, 0)
        fim = time(12, 30)
    else:
        inicio = time(8, 0)
        fim = time(17, 30)

    horarios = []
    current_time = inicio
    while current_time <= fim:
        horarios.append(current_time.strftime("%H:%M"))
        current_time = (
            datetime.combine(datetime.today(), current_time) + timedelta(minutes=30)
        ).time()

    tz = timezone("America/Sao_Paulo")
    inicio_dia = tz.localize(datetime.combine(data, time(0, 0))).astimezone(utc)
    fim_dia = tz.localize(datetime.combine(data, time(23, 59, 59))).astimezone(utc)
    agendamentos = Agendamento.buscar_por_periodo(inicio_dia, fim_dia)

    horarios_ocupados = []

    for a in agendamentos:
        dt = a["data_agendada"]

        if dt.tzinfo is None:
            dt = utc.localize(dt)

        local_dt = dt.astimezone(tz)
        hora = local_dt.strftime("%H:%M")
        horarios_ocupados.append(hora)

    return [h for h in horarios if h not in horarios_ocupados]


# Inicia o fluxo de agendamento no chatbot
# Valida se o cliente forneceu seus dados e selecionou produtos antes de abrir o calendário
def iniciar_agendamento(chatbot_assistant):
    if not chatbot_assistant.selected_products:
        return {
            "response": "Nenhum produto selecionado. Por favor, selecione um produto primeiro.",
            "options": ["Ver serviços", "Tirar dúvida"],
        }

    if not chatbot_assistant.client_data.get("nome"):
        return {
            "response": "Para agendar, preciso dos seus dados.",
            "form": True,
            "options": ["Cancelar tudo"],
        }

    return {
        "response": "Selecione a data e horário para o agendamento:",
        "calendar": True,
        "options": ["Cancelar tudo"],
        "calendar_data": {"default_date": datetime.now().strftime("%Y-%m-%d")},
    }


# Gerencia a confirmação de um agendamento feito pelo chatbot
# Lida com ações como confirmar, alterar ou cancelar agendamentos
# Se confirmado, cria o agendamento no banco e sincroniza com o Google Calendar
# Também processa a entrada do usuário vinda do calendário e prepara a mensagem final de confirmação
def confirmar_agendamento(chatbot_assistant, input_message):
    if input_message.lower() == "cancelar tudo":
        chatbot_assistant.awaiting_scheduling = False
        chatbot_assistant.temp_agendamento_data = None
        return {
            "response": "Agendamento cancelado. Como posso ajudar?",
            "options": ["Agendar", "Ver serviços", "Tirar dúvida"],
        }

    try:
        if chatbot_assistant.awaiting_scheduling_confirmation:
            if input_message.lower() in ["sim", "confirmar"]:
                if not chatbot_assistant.temp_agendamento_data:
                    return "❌ Dados do agendamento perdidos. Por favor, recomece."

                agendamento_data = chatbot_assistant.temp_agendamento_data
                produtos_nomes = [
                    p["nome"] for p in chatbot_assistant.selected_products
                ]

                agendamento = Agendamento(
                    cliente_id=agendamento_data["cliente_id"],
                    data_agendada=agendamento_data["data"],
                    produtos=agendamento_data["produtos"],
                    status="confirmado",
                )

                agendamento_id = agendamento.criar_agendamento()

                if not agendamento_id:
                    return "❌ Não foi possível confirmar o agendamento."

                try:
                    calendar = GoogleCalendarService()
                    event_data = {
                        "summary": f"Agendamento - {chatbot_assistant.client_data['nome']}",
                        "description": f"Produtos: {', '.join(produtos_nomes)}",
                        "start_time": agendamento_data["data"],
                        "end_time": agendamento_data["data"] + timedelta(hours=1),
                    }
                    google_event = calendar.create_event(event_data)

                    if google_event:
                        Agendamento.atualizar_agendamento(
                            agendamento_id, {"google_event_id": google_event["id"]}
                        )
                except Exception as e:
                    print(f"Erro Google Calendar (não crítico): {e}")

                chatbot_assistant.selected_products = []
                chatbot_assistant.awaiting_scheduling = False
                chatbot_assistant.awaiting_scheduling_confirmation = False
                chatbot_assistant.temp_agendamento_data = None

                return {
                    "response": (
                        f"✅ Agendamento confirmado!\n\n"
                        f"📅 Data: {agendamento_data['data'].strftime('%d/%m/%Y %H:%M')}\n"
                        f"🔧 Serviços: {', '.join(produtos_nomes)}\n"
                        f"📋 ID: {agendamento_id}\n\n"
                        "Obrigado por agendar conosco!"
                    ),
                    "options": ["Ver serviços", "Tirar dúvida"],
                }

            elif input_message.lower() == "alterar data":
                chatbot_assistant.awaiting_scheduling_confirmation = False
                return {
                    "response": "Por favor, selecione uma nova data:",
                    "calendar": True,
                    "options": ["Cancelar tudo"],
                }

            else:
                chatbot_assistant.awaiting_scheduling_confirmation = False
                chatbot_assistant.temp_agendamento_data = None
                return {
                    "response": "Agendamento não confirmado. Como posso ajudar?",
                    "options": ["Agendar", "Ver serviços", "Tirar dúvida"],
                }

        if "calendar" in input_message:
            try:
                _, data_str, hora_str = input_message.split("|")
                data_local = timezone("America/Sao_Paulo").localize(
                    datetime.strptime(f"{data_str} {hora_str}", "%Y-%m-%d %H:%M")
                )
                data_agendada = data_local.astimezone(utc)

                if not chatbot_assistant.selected_products:
                    return "❌ Nenhum produto selecionado. Por favor, recomece."

                cliente = Cliente(
                    chatbot_assistant.client_data["nome"],
                    chatbot_assistant.client_data["email"],
                    chatbot_assistant.client_data["telefone"],
                )
                cliente_db = cliente.buscar_por_telefone(cliente.telefone)

                if not cliente_db:
                    return "❌ Cliente não encontrado. Por favor, cadastre-se primeiro."

                chatbot_assistant.temp_agendamento_data = {
                    "cliente_id": str(cliente_db["_id"]),
                    "data": data_agendada,
                    "produtos": [
                        str(p["_id"]) for p in chatbot_assistant.selected_products
                    ],
                }

                resposta = "📋 Confirme o agendamento:\n\n"
                resposta += f"📅 Data: {data_agendada.strftime('%d/%m/%Y %H:%M')}\n"
                resposta += "🔧 Serviços:\n"
                for p in chatbot_assistant.selected_products:
                    resposta += f"- {p['nome']} ({p.get('categoria', '')})\n"

                total = sum(
                    p["preco"] + p.get("preco_mao_obra", 0)
                    for p in chatbot_assistant.selected_products
                )
                resposta += f"\n💳 Valor Total: R${total:.2f}\n\n"
                resposta += (
                    "Digite 'confirmar' para finalizar ou 'alterar data' para corrigir"
                )

                chatbot_assistant.awaiting_scheduling_confirmation = True
                return {
                    "response": resposta,
                    "options": ["Confirmar", "Alterar data", "Cancelar tudo"],
                }

            except Exception as e:
                print(f"Erro ao processar data: {e}")
                return {
                    "response": "❌ Formato inválido. Por favor, selecione um horário válido.",
                    "options": ["Cancelar tudo"],
                    "form": None,
                    "calendar": None,
                }

        return "Por favor, selecione uma opção válida."

    except Exception as e:
        print(f"Erro no agendamento: {e}")
        return "❌ Ocorreu um erro ao processar seu agendamento. Por favor, tente novamente."
