from sqlalchemy.orm import Session
from app.models.funcionario import Funcionario
from app.schemas.funcionario import FuncionarioCreate
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

def autenticar_funcionario(db: Session, email: str, senha: str):
    func = db.query(Funcionario).filter(Funcionario.email == email).first()
    if not func:
        return None
    if not pwd_context.verify(senha, func.senha_hash):
        return None
    return func