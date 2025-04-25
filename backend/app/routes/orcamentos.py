from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.schemas.orcamento import OrcamentoCreate, OrcamentoOut, OrcamentoUpdate
from app.crud import orcamento as crud_orcamento
from app.auth.auth_utils import get_current_funcionario

router = APIRouter(prefix="/orcamentos", tags=["Orçamentos"])

@router.post("/", response_model=OrcamentoOut)
def criar_orcamento(
    orcamento: OrcamentoCreate,
    db: Session = Depends(get_db),
    funcionario: dict = Depends(get_current_funcionario)
):
    try:
        return crud_orcamento.criar_orcamento(db, orcamento)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{orcamento_id}", response_model=OrcamentoOut)
def buscar_orcamento(orcamento_id: int, db: Session = Depends(get_db)):
    db_orcamento = crud_orcamento.buscar_orcamento(db, orcamento_id)
    if not db_orcamento:
        raise HTTPException(status_code=404, detail="Orçamento não encontrado")
    return db_orcamento

@router.get("/", response_model=list[OrcamentoOut])
def listar_orcamentos(cliente_id: int = None, db: Session = Depends(get_db)):
    return crud_orcamento.listar_orcamentos(db, cliente_id=cliente_id)

@router.put("/{orcamento_id}", response_model=OrcamentoOut)
def atualizar_orcamento(
    orcamento_id: int,
    orcamento: OrcamentoUpdate,
    db: Session = Depends(get_db)
):
    db_orcamento = crud_orcamento.atualizar_orcamento(db, orcamento_id, orcamento)
    if not db_orcamento:
        raise HTTPException(status_code=404, detail="Orçamento não encontrado")
    return db_orcamento

@router.delete("/{orcamento_id}")
def deletar_orcamento(orcamento_id: int, db: Session = Depends(get_db)):
    success = crud_orcamento.deletar_orcamento(db, orcamento_id)
    if not success:
        raise HTTPException(status_code=404, detail="Orçamento não encontrado")
    return {"message": "Orçamento deletado com sucesso"}