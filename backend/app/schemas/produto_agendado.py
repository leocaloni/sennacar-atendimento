from pydantic import BaseModel
from typing import Optional

class ProdutoAgendadoBase(BaseModel):
    agendamento_id: int
    produto_id: int
    quantidade: int = 1
    preco_unitario: float
    preco_mao_obra: float

class ProdutoAgendadoCreate(ProdutoAgendadoBase):
    pass

class ProdutoAgendadoOut(ProdutoAgendadoBase):
    id: int
    nome_produto: str
    
    class Config:
        from_attributes = True

class ProdutoAgendadoUpdate(BaseModel):
    quantidade: Optional[int] = None
    preco_unitario: Optional[float] = None
    preco_mao_obra: Optional[float] = None