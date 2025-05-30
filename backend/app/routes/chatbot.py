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

chatbot = ChatbotAssistant(intents_path, function_mappings)
chatbot.parse_intents()
chatbot.load_model("app/chatbot/chatbot_model.pth", "app/chatbot/dimensions.json")


# Reseta o estado do chatbot para valores iniciais, limpando seleções temporárias
def reset_chatbot_state(chatbot):
    chatbot.awaiting_product_selection = False
    chatbot.produtos_temp = None
    chatbot.current_category = None
    chatbot.selected_products = []
    chatbot.client_data_temp = None
    chatbot.awaiting_confirmation = False


# Processa a mensagem enviada pelo usuário e determina a resposta apropriada.
# Define fluxo de tratamento conforme o tipo de mensagem: agendamento, formulário ou texto normal.
# Valida se a mensagem não está vazia para evitar erros no processamento.
# Trata comandos específicos de agendamento: "calendar|", "confirmar" ou "alterar data".
# Chama diretamente a função de confirmação de agendamento.
# Se a mensagem for um JSON, trata como dados de formulário enviados pelo usuário.
# Extrai nome, email e telefone; valida se todos estão preenchidos.
# Confirmação manual de agendamento para fluxos mais antigos.
# Garante que cliente, produtos, data e hora estejam presentes.
# Processa confirmação de dados temporários de cliente.
# Se confirmado, cadastra cliente e inicia o fluxo de agendamento.
# Se cancelado, reseta o estado do chatbot.
# Processa a mensagem normalmente via modelo de intents do chatbot.
# Define opções padrão conforme o conteúdo da resposta ou se houve cancelamento.
@router.post("/message", response_model=ChatbotResponse)
async def process_message(message_data: ChatbotMessage):
    user_message = message_data.message

    if not user_message:
        raise HTTPException(status_code=400, detail="Message is required")

    if user_message.startswith("calendar|") or user_message.lower() in [
        "confirmar",
        "alterar data",
    ]:
        try:
            return confirmar_agendamento(chatbot, user_message)
        except Exception as e:
            print("Erro ao processar calendar/agendamento:", str(e))
            return JSONResponse(
                content={
                    "response": "Erro ao processar agendamento. Tente novamente.",
                    "options": ["Cancelar tudo"],
                },
                status_code=500,
            )

    chatbot.current_message = user_message
    chatbot.last_user_choice = user_message

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
                    "options": ["Cancelar tudo"],
                }

            print(f"Agendamento confirmado para {cliente['nome']} em {data} às {hora}")

            return {
                "response": f"✅ Agendamento confirmado para {data} às {hora}. Agradecemos pela preferência!",
                "options": ["Agendar novamente", "Ver serviços"],
            }

        except Exception as e:
            return {
                "response": "Erro ao confirmar o agendamento. Por favor, tente novamente.",
                "options": ["Cancelar tudo"],
            }

    if hasattr(chatbot, "client_data_temp") and chatbot.client_data_temp:
        if user_message.lower() == "dados corretos":
            chatbot.client_data = chatbot.client_data_temp.copy()
            resultado = cadastrar_cliente(chatbot)
            chatbot.awaiting_confirmation = False
            chatbot.client_data_temp = None
            return iniciar_agendamento(chatbot)

        if user_message.lower() in ["cancelar", "cancelar tudo"]:
            reset_chatbot_state(chatbot)
            return {
                "response": "Operação cancelada. Como posso ajudar?",
                "options": ["Agendar", "Ver serviços", "Tirar dúvida"],
            }

    response = chatbot.process_message(user_message)

    if isinstance(response, dict):
        return response

    options = None
    if chatbot.last_user_choice.lower() in ["cancelar", "cancelar tudo"]:
        reset_chatbot_state(chatbot)
        response = "Operação cancelada. Como posso ajudar?"
        options = ["Agendar", "Ver serviços", "Tirar dúvida"]
    elif "como posso te ajudar" in response.lower():
        options = ["Agendar", "Ver serviços", "Tirar dúvida"]
    elif any(
        phrase in response.lower()
        for phrase in [
            "catálogo",
            "categorias disponíveis",
            "serviço/produto",
            "produto/serviço",
        ]
    ):
        options = ["Insulfim", "Multimídia", "Caixas de Som", "PPF"]


# Obtém horários disponíveis para a data fornecida.
# Valida o formato da data e trata erro de parsing.
@router.get("/api/horarios")
async def get_horarios(data: str):
    try:
        data_obj = datetime.strptime(data, "%Y-%m-%d").date()
        horarios = horarios_service(data_obj)
        return {"horarios": horarios}
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de data inválido")
