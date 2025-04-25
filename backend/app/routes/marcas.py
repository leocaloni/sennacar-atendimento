from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.crud import marca as crud
from app.schemas.marca import MarcaCreate, MarcaUpdate, MarcaOut
from app.auth.auth_utils import get_current_user, verificar_admin
from app.models import Funcionario

router = APIRouter(prefix="/marcas", tags=["Marcas"])

@router.post("/", response_model=MarcaOut)
def criar_marca(
    marca_data: MarcaCreate,
    db: Session = Depends(get_db),
    admin: Funcionario = Depends(verificar_admin)
):
    return crud.criar_marca(db, marca_data)

@router.get("/", response_model=list[MarcaOut])
def listar_marcas(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    return crud.listar_marcas(db, skip, limit)

@router.get("/{marca_id}", response_model=MarcaOut)
def buscar_marca(
    marca_id: int,
    db: Session = Depends(get_db),
):
    marca = crud.buscar_marca_por_id(db, marca_id)
    if not marca:
        raise HTTPException(status_code=404, detail="Marca não encontrada")
    return marca

@router.put("/{marca_id}", response_model=MarcaOut)
def atualizar_marca(
    marca_id: int,
    marca_data: MarcaUpdate,
    db: Session = Depends(get_db),
    admin: Funcionario = Depends(verificar_admin)
):
    marca = crud.atualizar_marca(db, marca_id, marca_data)
    if not marca:
        raise HTTPException(status_code=404, detail="Marca não encontrada")
    return marca

@router.delete("/{marca_id}")
def deletar_marca(
    marca_id: int,
    db: Session = Depends(get_db),
    admin: Funcionario = Depends(verificar_admin)
):
    sucesso = crud.deletar_marca(db, marca_id)
    if not sucesso:
        raise HTTPException(status_code=404, detail="Marca não encontrada")
    return {"mensagem": "Marca deletada com sucesso"}
