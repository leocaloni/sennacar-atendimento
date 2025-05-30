from pydantic import BaseModel, EmailStr, Field
from typing import Optional


# Modelo base para cliente.
# Inclui: nome, email e telefone.
class ClienteBase(BaseModel):
    nome: str
    email: EmailStr
    telefone: str


# Modelo para criação de cliente.
# Herda todos os campos de ClienteBase.
class ClienteCreate(ClienteBase):
    pass


# Modelo para atualização parcial de cliente.
# Todos os campos são opcionais.
class ClienteUpdate(BaseModel):
    nome: Optional[str] = None
    email: Optional[EmailStr] = None
    telefone: Optional[str] = None


# Modelo de resposta para cliente.
# 'id': Campo mapeado do '_id' do MongoDB.
# 'orm_mode': Permite compatibilidade com ORMs.
# 'from_mongo': Converte '_id' para string e instancia o modelo.
class ClienteResponse(ClienteBase):
    id: str = Field(alias="_id")

    class Config:
        orm_mode = True

    @classmethod
    def from_mongo(cls, data):
        if "_id" in data:
            data["_id"] = str(data["_id"])
        return cls(**data)
