from sqlalchemy.orm import Session
from app.models.agendamento import Agendamento
from app.schemas.agendamento import AgendamentoCreate, AgendamentoUpdate

def criar_agendamento(db: Session, agendamento: AgendamentoCreate):
    novo_agendamento = Agendamento(**agendamento.model_dump())
    db.add(novo_agendamento)
    db.commit()
    db.refresh(novo_agendamento)
    return novo_agendamento

def listar_agendamentos(db: Session, cliente_id: int = None, funcionario_id: int = None):
    query = db.query(Agendamento)
    if cliente_id:
        query = query.filter(Agendamento.cliente_id == cliente_id)
    if funcionario_id:
        query = query.filter(Agendamento.funcionario_id == funcionario_id)
    return query.all()

def buscar_agendamento_por_id(db: Session, agendamento_id: int):
    return db.query(Agendamento).filter(Agendamento.id == agendamento_id).first()

def atualizar_agendamento(db: Session, agendamento_id: int, dados: AgendamentoUpdate):
    agendamento = db.query(Agendamento).filter(Agendamento.id == agendamento_id).first()
    if not agendamento:
        return None
    for campo, valor in dados.model_dump(exclude_unset=True).items():
        setattr(agendamento, campo, valor)
    db.commit()
    db.refresh(agendamento)
    return agendamento

def deletar_agendamento(db: Session, agendamento_id: int):
    agendamento = db.query(Agendamento).filter(Agendamento.id == agendamento_id).first()
    if not agendamento:
        return False
    db.delete(agendamento)
    db.commit()
    return True
