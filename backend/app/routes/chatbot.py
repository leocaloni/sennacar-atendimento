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
    
    chatbot.current_message = user_message
    
    # Processa a mensagem normalmente primeiro
    response = chatbot.process_message(user_message)
    
    # Se a resposta for um dicionário (já formatado), retorna diretamente
    if isinstance(response, dict):
        return response
    
    # Verifica se é uma resposta de lista de produtos
    if "📋 LISTA DE PRODUTOS 📋" in response:
        return {
            "response": response,
            "options": ["Sim", "Não", "Ver outras categorias"]
        }
    
    # Se o usuário respondeu SIM à lista de produtos
    if user_message.lower() in ['sim', 's'] and chatbot.awaiting_product_selection:
        product_names = [produto['nome'] for produto in chatbot.produtos_temp]
        return {
            "response": "Selecione o produto desejado:",
            "options": product_names
        }
    
    # Outros casos
    options = None
    if "como posso te ajudar" in response.lower():
        options = ["Agendar", "Ver serviços", "Tirar dúvida"]
    elif any(phrase in response.lower() for phrase in ["catálogo", "categorias disponíveis"]):
        options = ["Insulfim", "Multimídia", "Caixas de Som", "PPF"]
    
    return {
        "response": response,
        "options": options
    }