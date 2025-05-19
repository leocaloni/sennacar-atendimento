from datetime import datetime
import json
from fastapi import APIRouter, HTTPException, Depends, Response
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer
from app.chatbot.chatbot import ChatbotAssistant
from app.chatbot.handlers import *
import os
from app.schemas.chatbot import ChatbotMessage, ChatbotResponse, ResetResponse
from app.chatbot.handlers.agendamentos import (
    get_horarios_disponiveis as horarios_service,
    confirmar_agendamento,
)
from app.chatbot.handlers.produtos import (
    selecionar_produto,
    ver_produtos_selecionados,
)

router = APIRouter(prefix="", tags=["Chatbot"])


intents_path = os.path.join(os.path.dirname(__file__), "../chatbot/intents.json")
function_mappings = {
    "listar_produtos": listar_produtos_por_categoria,
    "selecionar_produto": selecionar_produto,
    "ver_produtos_selecionados": ver_produtos_selecionados,
    "cadastrar_cliente": cadastrar_cliente,
    "iniciar_agendamento": iniciar_agendamento,
}

# Inicializa o chatbot
chatbot = ChatbotAssistant(intents_path, function_mappings)
chatbot.parse_intents()
chatbot.load_model("app/chatbot/chatbot_model.pth", "app/chatbot/dimensions.json")


@router.post("/message", response_model=ChatbotResponse)
async def process_message(message_data: ChatbotMessage):
    user_message = message_data.message

    if not user_message:
        raise HTTPException(status_code=400, detail="Message is required")

    if user_message.startswith("calendar|") or user_message.lower() in [
        "confirmar",
        "alterar data",
        "cancelar",
    ]:
        try:
            return confirmar_agendamento(chatbot, user_message)
        except Exception as e:
            print("Erro ao processar calendar/agendamento:", str(e))
            return JSONResponse(
                content={
                    "response": "Erro ao processar agendamento. Tente novamente.",
                    "options": ["Cancelar"],
                },
                status_code=500,
            )

    chatbot.current_message = user_message
    chatbot.last_user_choice = user_message

    # Verifica se é um JSON com dados do formulário
    if user_message.startswith("{") and user_message.endswith("}"):
        try:
            form_data = json.loads(user_message)
            nome = form_data.get("nome", "").strip()
            email = form_data.get("email", "").strip()
            telefone = form_data.get("telefone", "").strip()

            if not all([nome, email, telefone]):
                return {
                    "response": "Por favor, preencha todos os campos corretamente.",
                    "options": None,
                }

            chatbot.client_data_temp = {
                "nome": nome,
                "email": email,
                "telefone": telefone,
            }

            return {
                "response": (
                    "Por favor, confirme seus dados:\n"
                    f"Nome: {nome}\n"
                    f"Email: {email}\n"
                    f"Telefone: {telefone}"
                ),
                "options": ["Dados corretos", "Dados incorretos"],
            }

        except json.JSONDecodeError:
            return {
                "response": "Ocorreu um erro ao processar seus dados. Por favor, tente novamente.",
                "options": None,
            }

    if user_message.lower() == "confirmar agendamento":
        try:
            cliente = chatbot.client_data
            produtos = chatbot.selected_products or []
            data = chatbot.agendamento_data
            hora = chatbot.agendamento_hora

            if not all([cliente, produtos, data, hora]):
                return {
                    "response": "Informações insuficientes para confirmar o agendamento.",
                    "options": ["Cancelar"],
                }

            # 🔄 Aqui você pode salvar no banco ou Google Agenda
            # exemplo fictício:
            print(f"Agendamento confirmado para {cliente['nome']} em {data} às {hora}")
            # → substitua por chamada real: salvar_agendamento(cliente, produtos, data, hora)

            return {
                "response": f"✅ Agendamento confirmado para {data} às {hora}. Agradecemos pela preferência!",
                "options": ["Agendar novamente", "Ver serviços"],
            }

        except Exception as e:
            return {
                "response": "Erro ao confirmar o agendamento. Por favor, tente novamente.",
                "options": ["Cancelar"],
            }

    # Processa confirmação dos dados
    if hasattr(chatbot, "client_data_temp") and chatbot.client_data_temp:
        if user_message.lower() == "dados corretos":
            chatbot.client_data = {
                "nome": chatbot.client_data_temp["nome"],
                "email": chatbot.client_data_temp["email"],
                "telefone": chatbot.client_data_temp["telefone"],
            }

            # Cadastra o cliente (mas não mostra mensagem de confirmação)
            resultado = cadastrar_cliente(chatbot)
            chatbot.awaiting_confirmation = False
            chatbot.client_data_temp = None

            # Chama diretamente a função de agendamento
            return iniciar_agendamento(chatbot)

    response = chatbot.process_message(user_message)

    if isinstance(response, dict):
        return response

    options = None
    if chatbot.last_user_choice.lower() == "cancelar":
        chatbot.awaiting_product_selection = False
        chatbot.produtos_temp = None
        chatbot.current_category = None
        chatbot.selected_products = []
        chatbot.client_data_temp = None
        chatbot.awaiting_confirmation = False
        response = "Operação cancelada. Como posso ajudar?"
        options = ["Agendar", "Ver serviços", "Tirar dúvida"]
    elif "como posso te ajudar" in response.lower():
        options = ["Agendar", "Ver serviços", "Tirar dúvida"]
    elif any(
        phrase in response.lower() for phrase in ["catálogo", "categorias disponíveis"]
    ):
        options = ["Insulfim", "Multimídia", "Caixas de Som", "PPF"]

    return {"response": response, "options": options}


@router.get("/api/horarios")
async def get_horarios(data: str):
    try:
        data_obj = datetime.strptime(data, "%Y-%m-%d").date()
        horarios = horarios_service(data_obj)
        return {"horarios": horarios}
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de data inválido")
