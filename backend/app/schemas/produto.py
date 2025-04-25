from pydantic import BaseModel
from typing import Optional

class ProdutoBase(BaseModel):
    nome: str
    descricao: Optional[str] = None
    preco_base: float
    preco_mao_obra: Optional[float] = None
    tipo: Optional[str] = None
    imagem_url: Optional[str] = None

class ProdutoCreate(ProdutoBase):
    categoria_id: int
    marca_id: int

class ProdutoUpdate(ProdutoBase):
    pass

class ProdutoOut(ProdutoBase):
    id: int
    categoria_id: int
    marca_id: int

    class Config:
        orm_mode = True
