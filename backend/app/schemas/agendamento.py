from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional


# Modelo base para agendamento contendo os campos principais.
# Utilizado como herança para criação, atualização e resposta.
class AgendamentoBase(BaseModel):
    cliente_id: str
    data_agendada: datetime
    produtos: List[str] = []
    status: Optional[str] = "pendente"
    observacoes: Optional[str] = ""
    valor_total: Optional[float] = 0.0


# Modelo para criação de agendamento.
# Herda todos os campos de AgendamentoBase.
class AgendamentoCreate(AgendamentoBase):
    pass


# Modelo para atualização de agendamento.
# Todos os campos são opcionais para permitir atualizações parciais.
class AgendamentoUpdate(BaseModel):
    data_agendada: Optional[datetime] = None
    produtos: Optional[List[str]] = None
    status: Optional[str] = None
    observacoes: Optional[str] = None


# Modelo de resposta para agendamento.
# Inclui o campo 'id' mapeado a partir de '_id' do MongoDB.
# Pode conter o ID do evento no Google Calendar.
class AgendamentoResponse(AgendamentoBase):
    id: str = Field(alias="_id")
    google_event_id: Optional[str] = None

    class Config:
        orm_mode = True

    # Método auxiliar para converter documentos MongoDB em instância de AgendamentoResponse.
    # Converte '_id' para string para compatibilidade com o modelo.
    @classmethod
    def from_mongo(cls, data):
        if "_id" in data:
            data["_id"] = str(data["_id"])
        return cls(**data)
