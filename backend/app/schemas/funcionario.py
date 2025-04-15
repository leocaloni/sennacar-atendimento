from pydantic import BaseModel, EmailStr
from datetime import datetime

class FuncionarioBase(BaseModel):
    nome: str
    email: EmailStr
    cargo: str 

class FuncionarioCreate(FuncionarioBase):
    senha: str

class FuncionarioOut(FuncionarioBase):
    id: int
    data_cadastro: datetime

    class config:
        from_attributes = True

class FuncionarioLogin(BaseModel):
    email: EmailStr
    senha: str