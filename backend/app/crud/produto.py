from sqlalchemy.orm import Session
from app.models.produto import Produto
from app.schemas.produto import ProdutoCreate, ProdutoUpdate

def criar_produto(db: Session, produto: ProdutoCreate):
    db_produto = Produto(
        nome=produto.nome,
        descricao=produto.descricao,
        preco_base=produto.preco_base,
        preco_mao_obra=produto.preco_mao_obra,
        tipo=produto.tipo,
        imagem_url=produto.imagem_url,
        categoria_id=produto.categoria_id,
        marca_id=produto.marca_id
    )
    db.add(db_produto)
    db.commit()
    db.refresh(db_produto)
    return db_produto

def listar_produtos(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Produto).offset(skip).limit(limit).all()

def buscar_produto(db: Session, produto_id: int):
    return db.query(Produto).filter(Produto.id == produto_id).first()

def atualizar_produto(db: Session, produto_id: int, produto: ProdutoUpdate):
    db_produto = db.query(Produto).filter(Produto.id == produto_id).first()
    if db_produto:
        db_produto.nome = produto.nome
        db_produto.descricao = produto.descricao
        db_produto.preco_base = produto.preco_base
        db_produto.preco_mao_obra = produto.preco_mao_obra
        db_produto.tipo = produto.tipo
        db_produto.imagem_url = produto.imagem_url
        db.commit()
        db.refresh(db_produto)
        return db_produto
    return None

def deletar_produto(db: Session, produto_id: int):
    db_produto = db.query(Produto).filter(Produto.id == produto_id).first()
    if db_produto:
        db.delete(db_produto)
        db.commit()
        return True
    return False
