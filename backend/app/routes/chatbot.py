from fastapi import APIRouter, HTTPException, Depends, Response
from fastapi.security import OAuth2PasswordBearer
from app.chatbot.chatbot import ChatbotAssistant
from app.chatbot.handlers import *
import os
from app.schemas.chatbot import ChatbotMessage, ChatbotResponse, ResetResponse


router = APIRouter(
    prefix="",
    tags=["Chatbot"]
)


intents_path = os.path.join(os.path.dirname(__file__), '../chatbot/intents.json')
function_mappings = {
    "cadastrar_cliente": cadastrar_cliente,
    "listar_produtos": listar_produtos_por_categoria,
    "listar_todos_produtos": listar_todos_produtos,
    "iniciar_agendamento": iniciar_agendamento
}

# Inicializa o chatbot
chatbot = ChatbotAssistant(intents_path, function_mappings)
chatbot.parse_intents()
chatbot.load_model('app/chatbot/chatbot_model.pth', 'app/chatbot/dimensions.json')


@router.options("/message", include_in_schema=False)
async def handle_options():
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "http://localhost:5173",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Credentials": "true"
        }
    )

@router.post("/message", response_model=ChatbotResponse)
async def process_message(message_data: ChatbotMessage):
    user_message = message_data.message
    
    if not user_message:
        raise HTTPException(status_code=400, detail="Message is required")
    
    # Processa a mensagem
    response = chatbot.process_message(user_message)
    
    # Verifica se há opções para mostrar
    options = None
    if "como posso te ajudar" in response.lower():
        options = ["Agendar", "Ver serviços", "Tirar dúvida"]
    
    return {
        "response": response,
        "options": options
    }

@router.post("/reset", response_model=ResetResponse)
async def reset_chatbot():
    # Reseta o estado do chatbot para uma nova conversa
    chatbot.selected_date = []
    chatbot.client_data = {"nome": None, "email": None, "telefone": None}
    chatbot.selected_products = []
    chatbot.awaiting_more_products = False
    chatbot.produtos_temp = None
    chatbot.awaiting_product_selection = False
    chatbot.current_category = None
    chatbot.selected_product = None
    chatbot.awaiting_confirmation = False
    chatbot.client_data_temp = None
    chatbot.awaiting_scheduling = False
    chatbot.awaiting_scheduling_confirmation = False
    chatbot.awaiting_category_selection = False
    chatbot.temp_agendamento_data = None
    
    return {"status": "Chatbot resetado com sucesso"}