from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class FuncionarioBase(BaseModel):
    nome: str
    email: EmailStr
    is_admin: bool = False

class FuncionarioCreate(FuncionarioBase):
    senha: str

class FuncionarioUpdate(BaseModel):
    nome: Optional[str] = None
    email: Optional[EmailStr] = None
    senha: Optional[str] = None
    is_admin: Optional[bool] = None

class FuncionarioResponse(FuncionarioBase):
    id: str = Field(alias="_id")

    class Config:
        populate_by_name = True
        orm_mode = True
