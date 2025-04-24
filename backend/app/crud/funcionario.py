from sqlalchemy.orm import Session
from app.models.funcionario import Funcionario
from app.schemas.funcionario import FuncionarioCreate, FuncionarioUpdate
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def criar_funcionario(db: Session, funcionario: FuncionarioCreate):
    hashed_password = pwd_context.hash(funcionario.senha)
    db_func = Funcionario(
        nome=funcionario.nome,
        email=funcionario.email,
        senha_hash=hashed_password,
        cargo=funcionario.cargo
    )
    db.add(db_func)
    db.commit()
    db.refresh(db_func)
    return db_func

def buscar_funcionario_por_id(db: Session, funcionario_id: int):
    return db.query(Funcionario).filter(Funcionario.id == funcionario_id).first()

def listar_funcionarios(db: Session, nome: str = None, cargo: str = None):
    query = db.query(Funcionario)
    if nome:
        query = query.filter(Funcionario.nome.ilike(f"%{nome}%"))
    if cargo:
        query = query.filter(Funcionario.cargo.ilike(f"%{cargo}%"))
    return query.all()

def atualizar_funcionario(db: Session, funcionario_id: int, dados_update: FuncionarioUpdate):
    funcionario = db.query(Funcionario).filter(Funcionario.id == funcionario_id).first()
    if not funcionario:
        return None

    for campo, valor in dados_update.model_dump(exclude_unset=True).items():
        if valor is not None:
            setattr(funcionario, campo, valor)

    db.commit()
    db.refresh(funcionario)
    return funcionario



def deletar_funcionario(db: Session, funcionario_id: int):
    db_funcionario = db.query(Funcionario).filter(Funcionario.id == funcionario_id).first()
    if db_funcionario:
        db.delete(db_funcionario)
        db.commit()
        return True
    return False
