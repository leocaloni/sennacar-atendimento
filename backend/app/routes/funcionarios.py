from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.auth_utils import get_current_user, verificar_admin
from app.models import Funcionario
from app.dependencies import get_db
from app.schemas.funcionario import FuncionarioCreate, FuncionarioOut
from app.crud import funcionario as crud

router = APIRouter(prefix="/funcionarios", tags=["Funcionários"])

@router.get("/me")
def get_me(usuario: Funcionario = Depends(get_current_user)):
    return {"id": usuario.id, "nome": usuario.nome, "cargo": usuario.cargo}

@router.get("/admin")
def rota_admin(admin: Funcionario = Depends(verificar_admin)):
    return {"mensagem": "Bem-vindo admin"}

@router.post("/", response_model=FuncionarioOut)
def criar_funcionario(
    func: FuncionarioCreate,
    db: Session = Depends(get_db),
    admin: Funcionario = Depends(verificar_admin)
):
    return crud.criar_funcionario(db, func)
