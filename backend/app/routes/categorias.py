from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.crud import categoria as crud
from app.schemas.categoria import CategoriaCreate, CategoriaUpdate, CategoriaOut
from app.dependencies import get_db
from app.auth.auth_utils import get_current_user, verificar_admin
from app.models import Funcionario

router = APIRouter(prefix="/categorias", tags=["Categorias"])

@router.post("/", response_model=CategoriaOut)
def criar_categoria(
    categoria: CategoriaCreate,
    db: Session = Depends(get_db),
    admin: Funcionario = Depends(verificar_admin)
):
    return crud.criar_categoria(db=db, categoria=categoria)

@router.get("/", response_model=list[CategoriaOut])
def listar_categorias(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return crud.listar_categorias(db=db, skip=skip, limit=limit)

@router.get("/{categoria_id}", response_model=CategoriaOut)
def buscar_categoria(
    categoria_id: int,
    db: Session = Depends(get_db)
):
    categoria = crud.buscar_categoria(db=db, categoria_id=categoria_id)
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
    return categoria

@router.put("/{categoria_id}", response_model=CategoriaOut)
def atualizar_categoria(
    categoria_id: int,
    categoria: CategoriaUpdate,
    db: Session = Depends(get_db),
    admin: Funcionario = Depends(verificar_admin)
):
    categoria_atualizada = crud.atualizar_categoria(db=db, categoria_id=categoria_id, categoria=categoria)
    if not categoria_atualizada:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
    return categoria_atualizada

@router.delete("/{categoria_id}")
def deletar_categoria(
    categoria_id: int,
    db: Session = Depends(get_db),
    admin: Funcionario = Depends(verificar_admin)
):
    sucesso = crud.deletar_categoria(db=db, categoria_id=categoria_id)
    if not sucesso:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
    return {"mensagem": "Categoria deletada com sucesso"}
