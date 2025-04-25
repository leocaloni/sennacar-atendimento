from sqlalchemy.orm import Session
from app.models.categoria import Categoria
from app.schemas.categoria import CategoriaCreate, CategoriaUpdate

def criar_categoria(db: Session, categoria: CategoriaCreate):
    db_categoria = Categoria(nome=categoria.nome)
    db.add(db_categoria)
    db.commit()
    db.refresh(db_categoria)
    return db_categoria

def listar_categorias(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Categoria).offset(skip).limit(limit).all()

def buscar_categoria(db: Session, categoria_id: int):
    return db.query(Categoria).filter(Categoria.id == categoria_id).first()

def atualizar_categoria(db: Session, categoria_id: int, categoria: CategoriaUpdate):
    db_categoria = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    if db_categoria:
        db_categoria.nome = categoria.nome
        db.commit()
        db.refresh(db_categoria)
        return db_categoria
    return None

def deletar_categoria(db: Session, categoria_id: int):
    db_categoria = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    if db_categoria:
        db.delete(db_categoria)
        db.commit()
        return True
    return False
