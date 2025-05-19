from datetime import datetime, timedelta, time
from app.models.agendamento import Agendamento
from app.models.cliente import Cliente
from app.google.calendario import GoogleCalendarService


def get_horarios_disponiveis(data):
    """Retorna horários disponíveis para uma data específica"""
    # Verifica se é domingo (não abre)
    if data.weekday() == 6:
        return []

    # Define horários de funcionamento
    if data.weekday() == 5:  # Sábado
        inicio = time(8, 0)
        fim = time(12, 30)
    else:  # Segunda a Sexta
        inicio = time(8, 0)
        fim = time(17, 30)

    # Gera slots de 30 minutos
    horarios = []
    current_time = inicio
    while current_time <= fim:
        horarios.append(current_time.strftime("%H:%M"))
        current_time = (
            datetime.combine(datetime.today(), current_time) + timedelta(minutes=30)
        ).time()

    # Remove horários já agendados
    agendamentos = Agendamento.buscar_por_periodo(
        datetime.combine(data, time(0, 0)), datetime.combine(data, time(23, 59))
    )

    horarios_ocupados = [
        agendamento["data_agendada"].time().strftime("%H:%M")
        for agendamento in agendamentos
    ]

    return [h for h in horarios if h not in horarios_ocupados]


# No arquivo agendamentos.py, modifique a função iniciar_agendamento:


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
            "options": ["Cancelar"],
        }

    # Retorna a mensagem e ativa o calendário no frontend
    return {
        "response": "Selecione a data e horário para o agendamento:",
        "calendar": True,  # Esta flag ativa o componente de calendário no front
        "options": ["Cancelar"],
        "calendar_data": {  # Adiciona dados adicionais se necessário
            "default_date": datetime.now().strftime("%Y-%m-%d")
        },
    }


def confirmar_agendamento(chatbot_assistant, input_message):
    if input_message.lower() == "cancelar":
        chatbot_assistant.awaiting_scheduling = False
        chatbot_assistant.temp_agendamento_data = None
        return {
            "response": "Agendamento cancelado. Como posso ajudar?",
            "options": ["Agendar", "Ver serviços", "Tirar dúvida"],
        }

    try:
        # Processa confirmação do agendamento
        if chatbot_assistant.awaiting_scheduling_confirmation:
            if input_message.lower() in ["sim", "confirmar"]:
                if not chatbot_assistant.temp_agendamento_data:
                    return "❌ Dados do agendamento perdidos. Por favor, recomece."

                agendamento_data = chatbot_assistant.temp_agendamento_data
                produtos_nomes = [
                    p["nome"] for p in chatbot_assistant.selected_products
                ]

                # Cria no MongoDB
                agendamento = Agendamento(
                    cliente_id=agendamento_data["cliente_id"],
                    data_agendada=agendamento_data["data"],
                    produtos=agendamento_data["produtos"],
                    status="confirmado",
                )

                agendamento_id = agendamento.criar_agendamento()

                if not agendamento_id:
                    return "❌ Não foi possível confirmar o agendamento."

                # Sincroniza com Google Calendar
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

                # Limpa os estados
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
                    "options": ["Cancelar"],
                }

            else:
                chatbot_assistant.awaiting_scheduling_confirmation = False
                chatbot_assistant.temp_agendamento_data = None
                return {
                    "response": "Agendamento não confirmado. Como posso ajudar?",
                    "options": ["Agendar", "Ver serviços", "Tirar dúvida"],
                }

        # Processa seleção de data/horário
        if "calendar" in input_message:
            try:
                _, data_str, hora_str = input_message.split("|")
                data_agendada = datetime.strptime(
                    f"{data_str} {hora_str}", "%Y-%m-%d %H:%M"
                )

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

                # Prepara resposta de confirmação
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
                    "options": ["Confirmar", "Alterar data", "Cancelar"],
                }

            except Exception as e:
                print(f"Erro ao processar data: {e}")
                return {
                    "response": "❌ Formato inválido. Por favor, selecione um horário válido.",
                    "options": ["Cancelar"],
                    "form": None,
                    "calendar": None,
                }

        # Se chegou aqui, é uma mensagem não reconhecida
        return "Por favor, selecione uma opção válida."

    except Exception as e:
        print(f"Erro no agendamento: {e}")
        return "❌ Ocorreu um erro ao processar seu agendamento. Por favor, tente novamente."
