from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class ItemOrcamentoBase(BaseModel):
    produto_id: int
    quantidade: int = 1
    preco_unitario: float
    preco_mao_obra: float

class ItemOrcamentoCreate(ItemOrcamentoBase):
    pass

class ItemOrcamentoOut(ItemOrcamentoBase):
    id: int
    orcamento_id: int
    nome_produto: str
    
    class Config:
        from_attributes = True

class OrcamentoBase(BaseModel):
    cliente_id: int
    observacoes: Optional[str] = None
    itens: List[ItemOrcamentoCreate]

class OrcamentoCreate(OrcamentoBase):
    pass

class OrcamentoOut(OrcamentoBase):
    id: int
    data: datetime
    valor_total: float
    itens: List[ItemOrcamentoOut] = []
    
    class Config:
        from_attributes = True

class OrcamentoUpdate(BaseModel):
    observacoes: Optional[str] = None