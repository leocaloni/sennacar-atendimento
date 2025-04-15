from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.funcionario import FuncionarioLogin
from app.crud.funcionario import autenticar_funcionario
from app.dependencies import get_db

router = APIRouter(prefix="/auth", tags=["Autenticação"])

@router.post("/login")
def login(form: FuncionarioLogin, db: Session = Depends(get_db)):
    funcionario = autenticar_funcionario(db, form.email, form.senha)
    if not funcionario:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    return {"msg": "Login bem-sucedido", "funcionario_id": funcionario.id}