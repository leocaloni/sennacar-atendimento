from sqlalchemy.orm import Session
from app.models import Orcamento, ItemOrcamento, Produto
from app.schemas import OrcamentoCreate, OrcamentoUpdate

def criar_orcamento(db: Session, orcamento: OrcamentoCreate):
    valor_total = 0
    itens_detalhes = []
    
    for item in orcamento.itens:
        produto = db.query(Produto).filter(Produto.id == item.produto_id).first()
        if not produto:
            raise ValueError(f"Produto {item.produto_id} não encontrado")
        
        preco_final = item.preco_unitario or produto.preco_base
        mao_obra = item.preco_mao_obra or produto.preco_mao_obra or 0
        valor_total += (preco_final + mao_obra) * item.quantidade
        
        itens_detalhes.append({
            "produto_id": item.produto_id,
            "quantidade": item.quantidade,
            "preco_unitario": preco_final,
            "preco_mao_obra": mao_obra
        })
    
    db_orcamento = Orcamento(
        cliente_id=orcamento.cliente_id,
        valor_total=valor_total,
        observacoes=orcamento.observacoes
    )
    db.add(db_orcamento)
    db.commit()
    db.refresh(db_orcamento)
    
    for item in itens_detalhes:
        db_item = ItemOrcamento(
            orcamento_id=db_orcamento.id,
            **item
        )
        db.add(db_item)
    
    db.commit()
    return db_orcamento

def buscar_orcamento(db: Session, orcamento_id: int):
    return db.query(Orcamento).filter(Orcamento.id == orcamento_id).first()

def listar_orcamentos(db: Session, cliente_id: int = None):
    query = db.query(Orcamento)
    if cliente_id:
        query = query.filter(Orcamento.cliente_id == cliente_id)
    return query.all()

def atualizar_orcamento(db: Session, orcamento_id: int, orcamento: OrcamentoUpdate):
    db_orcamento = buscar_orcamento(db, orcamento_id)
    if not db_orcamento:
        return None
    
    for key, value in orcamento.model_dump(exclude_unset=True).items():
        setattr(db_orcamento, key, value)
    
    db.commit()
    db.refresh(db_orcamento)
    return db_orcamento

def deletar_orcamento(db: Session, orcamento_id: int):
    db_orcamento = buscar_orcamento(db, orcamento_id)
    if db_orcamento:
        db.delete(db_orcamento)
        db.commit()
        return True
    return False