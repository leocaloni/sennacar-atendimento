from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ClienteBase(BaseModel):
    nome: str
    email: Optional[str]
    telefone: str

class ClienteCreate(ClienteBase):
    pass

class ClienteOut(ClienteBase):
    id: int
    data_cadastro: datetime

    class Config:
        from_attributes = True