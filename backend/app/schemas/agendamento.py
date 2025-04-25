from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Literal

class AgendamentoBase(BaseModel):
    cliente_id: int
    funcionario_id: int
    data_agendada: datetime
    status: Optional[Literal["pendente", "confirmado", "concluido", "cancelado"]] = "pendente"
    observacoes: Optional[str] = None

class AgendamentoCreate(AgendamentoBase):
    pass

class AgendamentoUpdate(BaseModel):
    cliente_id: Optional[int] = None
    funcionario_id: Optional[int] = None
    data_agendada: Optional[datetime] = None
    status: Optional[Literal["pendente", "confirmado", "concluido", "cancelado"]] = None
    observacoes: Optional[str] = None

class AgendamentoOut(AgendamentoBase):
    id: int

    class Config:
        from_attributes = True
