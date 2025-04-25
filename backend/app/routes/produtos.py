from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.crud import produto as crud
from app.schemas.produto import ProdutoCreate, ProdutoUpdate, ProdutoOut
from app.dependencies import get_db
from app.auth.auth_utils import get_current_user, verificar_admin
from app.models import Funcionario

router = APIRouter(prefix="/produtos", tags=["Produtos"])

@router.post("/", response_model=ProdutoOut)
def criar_produto(
    produto: ProdutoCreate,
    db: Session = Depends(get_db),
    admin: Funcionario = Depends(verificar_admin)
):
    return crud.criar_produto(db=db, produto=produto)

@router.get("/", response_model=list[ProdutoOut])
def listar_produtos(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return crud.listar_produtos(db=db, skip=skip, limit=limit)

@router.get("/{produto_id}", response_model=ProdutoOut)
def buscar_produto(
    produto_id: int,
    db: Session = Depends(get_db)
):
    produto = crud.buscar_produto(db=db, produto_id=produto_id)
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return produto

@router.put("/{produto_id}", response_model=ProdutoOut)
def atualizar_produto(
    produto_id: int,
    produto: ProdutoUpdate,
    db: Session = Depends(get_db),
    admin: Funcionario = Depends(verificar_admin)
):
    produto_atualizado = crud.atualizar_produto(db=db, produto_id=produto_id, produto=produto)
    if not produto_atualizado:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return produto_atualizado

@router.delete("/{produto_id}")
def deletar_produto(
    produto_id: int,
    db: Session = Depends(get_db),
    admin: Funcionario = Depends(verificar_admin)
):
    sucesso = crud.deletar_produto(db=db, produto_id=produto_id)
    if not sucesso:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return {"mensagem": "Produto deletado com sucesso"}
