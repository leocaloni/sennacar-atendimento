from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.schemas.auth import LoginInput, TokenOut
from app.models import Funcionario
from app.dependencies import get_db
from app.auth.auth_utils import criar_token_acesso
from passlib.context import CryptContext

router = APIRouter(prefix="/auth", tags=["Autenticação"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/login", response_model=TokenOut)
def login(data: LoginInput, db: Session = Depends(get_db)):
    funcionario = db.query(Funcionario).filter(Funcionario.email == data.email).first()
    if not funcionario or not pwd_context.verify(data.senha, funcionario.senha_hash):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")

    token_data = {"sub": str(funcionario.id)}
    token = criar_token_acesso(token_data)
    return {"access_token": token, "token_type": "bearer"}
