from pydantic import BaseModel
from typing import Optional
from decimal import Decimal

class ProdutoBase(BaseModel):
    nome: str
    preco: Decimal
    preco_mao_obra: Decimal = 0.0
    categoria: Optional[str] = None
    descricao: Optional[str] = None

class ProdutoCreate(BaseModel):
    nome: str
    descricao: str
    preco: float
    estoque: int

class ProdutoUpdate(BaseModel):
    nome: Optional[str] = None
    preco: Optional[Decimal] = None
    preco_mao_obra: Optional[Decimal] = None
    categoria: Optional[str] = None
    descricao: Optional[str] = None

class ProdutoResponse(ProdutoBase):
    id: str

    class Config:
        orm_mode = True