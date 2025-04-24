from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class FuncionarioBase(BaseModel):
    nome: str
    email: EmailStr
    cargo: str 

class FuncionarioCreate(FuncionarioBase):
    senha: str

class FuncionarioOut(FuncionarioBase):
    id: int
    data_cadastro: datetime

    class Config:
        from_attributes = True

class FuncionarioLogin(BaseModel):
    email: EmailStr
    senha: str

class FuncionarioUpdate(BaseModel):
    nome: Optional[str] = None
    email: Optional[str] = None
    cargo: Optional[str] = None
    senha: Optional[str] = None