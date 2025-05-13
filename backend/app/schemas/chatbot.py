from typing import List, Optional
from pydantic import BaseModel


class ChatbotMessage(BaseModel):
    message: str


class ChatbotResponse(BaseModel):
    response: str
    options: Optional[List[str]]
    form: Optional[bool] = False


class ResetResponse(BaseModel):
    status: str
