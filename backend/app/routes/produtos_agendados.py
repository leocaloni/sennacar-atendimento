from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.schemas.produto_agendado import (
    ProdutoAgendadoCreate,
    ProdutoAgendadoOut,
    ProdutoAgendadoUpdate
)
from app.crud import produto_agendado as crud
from app.auth.auth_utils import get_current_funcionario

router = APIRouter(prefix="/produtos-agendados", tags=["Produtos Agendados"])

@router.post("/", response_model=ProdutoAgendadoOut)
def criar_produto_agendado(
    produto_agendado: ProdutoAgendadoCreate,
    db: Session = Depends(get_db),
    funcionario: dict = Depends(get_current_funcionario)
):
    try:
        return crud.criar_produto_agendado(db, produto_agendado)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{produto_agendado_id}", response_model=ProdutoAgendadoOut)
def buscar_produto_agendado(
    produto_agendado_id: int,
    db: Session = Depends(get_db)
):
    db_item = crud.buscar_produto_agendado(db, produto_agendado_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Produto agendado não encontrado")
    return db_item

@router.get("/agendamento/{agendamento_id}", response_model=list[ProdutoAgendadoOut])
def listar_produtos_agendados(
    agendamento_id: int,
    db: Session = Depends(get_db)
):
    return crud.listar_produtos_agendados(db, agendamento_id)

@router.put("/{produto_agendado_id}", response_model=ProdutoAgendadoOut)
def atualizar_produto_agendado(
    produto_agendado_id: int,
    produto_agendado: ProdutoAgendadoUpdate,
    db: Session = Depends(get_db)
):
    db_item = crud.atualizar_produto_agendado(db, produto_agendado_id, produto_agendado)
    if not db_item:
        raise HTTPException(status_code=404, detail="Produto agendado não encontrado")
    return db_item

@router.delete("/{produto_agendado_id}")
def deletar_produto_agendado(
    produto_agendado_id: int,
    db: Session = Depends(get_db)
):
    success = crud.deletar_produto_agendado(db, produto_agendado_id)
    if not success:
        raise HTTPException(status_code=404, detail="Produto agendado não encontrado")
    return {"message": "Produto agendado removido com sucesso"}