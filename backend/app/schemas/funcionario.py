from pydantic import BaseModel, EmailStr, Field
from typing import Optional


# Modelo base para funcionário.
# Inclui: nome, email e flag de admin.
class FuncionarioBase(BaseModel):
    nome: str
    email: EmailStr
    is_admin: bool = False


# Modelo para criação de funcionário.
# Herda de FuncionarioBase e adiciona o campo de senha.
class FuncionarioCreate(FuncionarioBase):
    senha: str


# Modelo para atualização parcial de funcionário.
# Todos os campos são opcionais.
class FuncionarioUpdate(BaseModel):
    nome: Optional[str] = None
    email: Optional[EmailStr] = None
    senha: Optional[str] = None
    is_admin: Optional[bool] = None


# Modelo de resposta para funcionário.
# 'id': Mapeado a partir do '_id' do MongoDB.
# 'orm_mode': Suporte a ORMs e objetos.
# 'from_mongo': Converte '_id' para string e instancia o modelo.
class FuncionarioResponse(FuncionarioBase):
    id: str = Field(alias="_id")

    class Config:
        orm_mode = True

    @classmethod
    def from_mongo(cls, data):
        if "_id" in data:
            data["_id"] = str(data["_id"])
        return cls(**data)
