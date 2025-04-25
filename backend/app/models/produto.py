from sqlalchemy import Column, Integer, String, Text, Numeric, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.database import Base
from app.models import Categoria, Marca

class Produto(Base):
    __tablename__ = "produtos"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    descricao = Column(Text)
    preco_base = Column(Numeric(10, 2), nullable=False)
    preco_mao_obra = Column(Numeric(10, 2))
    categoria_id = Column(Integer, ForeignKey("categorias.id"))
    marca_id = Column(Integer, ForeignKey("marcas.id"))
    tipo = Column(String(100))
    imagem_url = Column(Text)

    categoria = relationship("Categoria", back_populates="produtos")
    marca = relationship("Marca", back_populates="produtos")