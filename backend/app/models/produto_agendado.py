from sqlalchemy import Column, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class ProdutoAgendado(Base):
    __tablename__ = "produtos_agendados"

    id = Column(Integer, primary_key=True, index=True)
    agendamento_id = Column(Integer, ForeignKey("agendamentos.id"), nullable=False)
    produto_id = Column(Integer, ForeignKey("produtos.id"), nullable=False)
    quantidade = Column(Integer, default=1)
    preco_unitario = Column(Float)
    preco_mao_obra = Column(Float)
    
    agendamento = relationship("Agendamento", back_populates="produtos_agendados")
    produto = relationship("Produto")