from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional

class AgendamentoBase(BaseModel):
    cliente_id: str
    data_agendada: datetime
    produtos: List[str] = []
    status: Optional[str] = "pendente"
    observacoes: Optional[str] = ""
    valor_total: Optional[float] = 0.0

class AgendamentoCreate(AgendamentoBase):
    pass

class AgendamentoUpdate(BaseModel):
    data_agendada: Optional[datetime] = None
    produtos: Optional[List[str]] = None
    status: Optional[str] = None
    observacoes: Optional[str] = None

class AgendamentoResponse(AgendamentoBase):
    id: str = Field(alias="_id")

    class Config:
        orm_mode = True

    @classmethod
    def from_mongo(cls, data):
        if '_id' in data:
            data['_id'] = str(data['_id'])
        return cls(**data)