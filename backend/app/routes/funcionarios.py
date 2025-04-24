from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.auth.auth_utils import get_current_user, verificar_admin
from app.models import Funcionario
from app.dependencies import get_db
from app.schemas.funcionario import FuncionarioCreate, FuncionarioOut, FuncionarioUpdate
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
    funcionario_data: FuncionarioCreate,
    db: Session = Depends(get_db),
    admin: Funcionario = Depends(verificar_admin)
):
    return crud.criar_funcionario(db, funcionario_data)

@router.get("/{funcionario_id}", response_model=FuncionarioOut)
def buscar_funcionario(funcionario_id: int, db: Session = Depends(get_db)):
    db_funcionario = crud.buscar_funcionario_por_id(db, funcionario_id)
    if not db_funcionario:
        raise HTTPException(status_code=404, detail="Funcionário não encontrado")
    return db_funcionario

@router.get("/", response_model=list[FuncionarioOut])
def listar_funcionarios(nome: str = None, cargo: str = None, db: Session = Depends(get_db)):
    db_funcionarios = crud.listar_funcionarios(db, nome=nome, cargo=cargo)
    return db_funcionarios

@router.put("/{funcionario_id}", response_model=FuncionarioOut)
def atualizar_funcionario(
    funcionario_id: int,
    funcionario: FuncionarioUpdate,
    db: Session = Depends(get_db),
    admin: Funcionario = Depends(verificar_admin)
):
    db_funcionario = crud.atualizar_funcionario(db, funcionario_id, funcionario)
    if not db_funcionario:
        raise HTTPException(status_code=404, detail="Funcionário não encontrado")
    return db_funcionario

@router.delete("/{funcionario_id}")
def deletar_funcionario(funcionario_id: int, db: Session = Depends(get_db), admin: Funcionario = Depends(verificar_admin)):
    result = crud.deletar_funcionario(db, funcionario_id)
    if not result:
        raise HTTPException(status_code=404, detail="Funcionário não encontrado")
    return {"message": "Funcionário deletado com sucesso"}
