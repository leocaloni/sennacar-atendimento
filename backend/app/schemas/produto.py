from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal

class ProdutoBase(BaseModel):
    nome: str
    preco: Decimal
    preco_mao_obra: Decimal = 0.0
    categoria: Optional[str] = None
    descricao: Optional[str] = None

class ProdutoCreate(BaseModel):
    pass

class ProdutoUpdate(BaseModel):
    nome: Optional[str] = None
    preco: Optional[Decimal] = None
    preco_mao_obra: Optional[Decimal] = None
    categoria: Optional[str] = None
    descricao: Optional[str] = None

class ProdutoResponse(ProdutoBase):
    id: str = Field(alias="_id")

    class Config:
        orm_mode = True

    @classmethod
    def from_mongo(cls, data):
        if '_id' in data:
            data['_id'] = str(data['_id'])
        return cls(**data)