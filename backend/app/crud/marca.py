from sqlalchemy.orm import Session
from app.models.marca import Marca
from app.schemas.marca import MarcaCreate, MarcaUpdate

def criar_marca(db: Session, marca_data: MarcaCreate):
    marca = Marca(nome=marca_data.nome)
    db.add(marca)
    db.commit()
    db.refresh(marca)
    return marca

def listar_marcas(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Marca).offset(skip).limit(limit).all()

def buscar_marca_por_id(db: Session, marca_id: int):
    return db.query(Marca).filter(Marca.id == marca_id).first()

def atualizar_marca(db: Session, marca_id: int, marca_data: MarcaUpdate):
    marca = db.query(Marca).filter(Marca.id == marca_id).first()
    if marca:
        marca.nome = marca_data.nome
        db.commit()
        db.refresh(marca)
    return marca

def deletar_marca(db: Session, marca_id: int):
    marca = db.query(Marca).filter(Marca.id == marca_id).first()
    if marca:
        db.delete(marca)
        db.commit()
        return True
    return False
