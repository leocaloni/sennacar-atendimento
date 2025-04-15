from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.database import Base
import pytz

def get_brasilia_time():
    return datetime.now(pytz.timezone("America/Sao_Paulo"))

class Funcionario(Base):
    __tablename__ = "funcionarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String (100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    senha_hash = Column(String(255), nullable=False)
    cargo = Column(String(50))
    data_cadastro = Column(DateTime, default=get_brasilia_time)