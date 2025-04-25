from sqlalchemy import Column, Integer, ForeignKey, DateTime, Enum, Text
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class StatusAgendamento(str, enum.Enum):
    pendente = "pendente"
    confirmado = "confirmado"
    concluido = "concluido"
    cancelado = "cancelado"

class Agendamento(Base):
    __tablename__ = "agendamentos"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id"), nullable=False)
    funcionario_id = Column(Integer, ForeignKey("funcionarios.id"), nullable=False)
    data_agendada = Column(DateTime, nullable=False)
    status = Column(Enum(StatusAgendamento), default=StatusAgendamento.pendente)
    observacoes = Column(Text)

    cliente = relationship("Cliente", back_populates="agendamentos")
    funcionario = relationship('Funcionario', back_populates='agendamentos')