from sqlalchemy import Column, Integer, String, DateTime
from app.database import Base
from datetime import datetime, timezone
import pytz

def get_brasilia_time():
    return datetime.now(pytz.timezone("America/Sao_Paulo"))

class Cliente(Base):
    __tablename__ = "clientes"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    email = Column(String(100))
    telefone = Column(String(20), nullable=False)
    data_cadastro = Column(DateTime, default=get_brasilia_time)