# models/orcamento.py
from sqlalchemy import Column, Integer, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Orcamento(Base):
    __tablename__ = "orcamentos"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id"))
    data = Column(DateTime, default=datetime.now)
    valor_total = Column(Float)
    observacoes = Column(Text)
    
    cliente = relationship("Cliente", back_populates="orcamentos")
    itens = relationship("ItemOrcamento", back_populates="orcamento")

class ItemOrcamento(Base):
    __tablename__ = "itens_orcamento"

    id = Column(Integer, primary_key=True, index=True)
    orcamento_id = Column(Integer, ForeignKey("orcamentos.id"))
    produto_id = Column(Integer, ForeignKey("produtos.id"))
    quantidade = Column(Integer, default=1)
    preco_unitario = Column(Float)
    preco_mao_obra = Column(Float)
    
    orcamento = relationship("Orcamento", back_populates="itens")
    produto = relationship("Produto")    