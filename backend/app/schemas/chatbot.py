from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class ChatbotMessage(BaseModel):
    message: str


class ChatbotResponse(BaseModel):
    response: str
    options: Optional[List[str]] = None
    form: Optional[bool] = False  # ← novo
    calendar: Optional[bool] = False  # ← novo
    calendar_data: Optional[Dict[str, Any]] = None  # ← novo

    class Config:
        extra = "allow"  # ← assim qualquer campo futuro não é descartado


class ResetResponse(BaseModel):
    status: str
