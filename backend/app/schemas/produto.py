from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal


# Modelo base para produto.
# Inclui: nome, preço, preço da mão de obra, categoria e descrição (opcional).
class ProdutoBase(BaseModel):
    nome: str
    preco: Decimal
    preco_mao_obra: Decimal = 0.0
    categoria: Optional[str] = None
    descricao: Optional[str] = None


# Modelo para criação de produto.
# Atualmente vazio, mas pode ser expandido no futuro.
class ProdutoCreate(BaseModel):
    pass


# Modelo para atualização parcial de produto.
# Todos os campos são opcionais.
class ProdutoUpdate(BaseModel):
    nome: Optional[str] = None
    preco: Optional[Decimal] = None
    preco_mao_obra: Optional[Decimal] = None
    categoria: Optional[str] = None
    descricao: Optional[str] = None


# Modelo de resposta para produto.
# 'id': Mapeado a partir do '_id' do MongoDB.
# 'orm_mode': Suporte a ORMs e objetos.
# 'from_mongo': Converte '_id' para string e instancia o modelo.
class ProdutoResponse(ProdutoBase):
    id: str = Field(alias="_id")

    class Config:
        orm_mode = True

    @classmethod
    def from_mongo(cls, data):
        if "_id" in data:
            data["_id"] = str(data["_id"])
        return cls(**data)
