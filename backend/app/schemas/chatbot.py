from typing import Any, Dict, List, Optional
from pydantic import BaseModel


# Modelo para representar a mensagem recebida pelo chatbot.
# Contém apenas o campo 'message' como texto enviado pelo usuário.
class ChatbotMessage(BaseModel):
    message: str


# Modelo para a resposta do chatbot.
# 'response': Texto da resposta.
# 'options': Lista opcional de opções sugeridas ao usuário.
# 'form': Indica se a resposta inclui um formulário.
# 'calendar': Indica se deve ativar um componente de calendário.
# 'calendar_data': Dados adicionais para o calendário.
# 'extra = "allow"': Permite campos adicionais sem gerar erro.
class ChatbotResponse(BaseModel):
    response: str
    options: Optional[List[str]] = None
    form: Optional[bool] = False
    calendar: Optional[bool] = False
    calendar_data: Optional[Dict[str, Any]] = None

    class Config:
        extra = "allow"


# Modelo para indicar o status de um reset do chatbot.
class ResetResponse(BaseModel):
    status: str
