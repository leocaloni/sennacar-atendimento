from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.auth.auth_utils import get_current_user
from app.models import Funcionario
from app.schemas.agendamento import (
    AgendamentoCreate,
    AgendamentoUpdate,
    AgendamentoOut,
)
from app.crud import agendamento as crud

router = APIRouter(prefix="/agendamentos", tags=["Agendamentos"])

@router.post("/", response_model=AgendamentoOut)
def criar_agendamento(
    agendamento_data: AgendamentoCreate,
    db: Session = Depends(get_db),
    funcionario: Funcionario = Depends(get_current_user),
):
    return crud.criar_agendamento(db, agendamento_data)

@router.get("/", response_model=list[AgendamentoOut])
def listar_agendamentos(
    db: Session = Depends(get_db),
    funcionario: Funcionario = Depends(get_current_user),
):
    return crud.listar_agendamentos(db)

@router.get("/{agendamento_id}", response_model=AgendamentoOut)
def buscar_agendamento(
    agendamento_id: int,
    db: Session = Depends(get_db),
    funcionario: Funcionario = Depends(get_current_user),
):
    agendamento = crud.buscar_agendamento_por_id(db, agendamento_id)
    if not agendamento:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado")
    return agendamento

@router.put("/{agendamento_id}", response_model=AgendamentoOut)
def atualizar_agendamento(
    agendamento_id: int,
    dados_update: AgendamentoUpdate,
    db: Session = Depends(get_db),
    funcionario: Funcionario = Depends(get_current_user),
):
    agendamento = crud.atualizar_agendamento(db, agendamento_id, dados_update)
    if not agendamento:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado")
    return agendamento

@router.delete("/{agendamento_id}")
def deletar_agendamento(
    agendamento_id: int,
    db: Session = Depends(get_db),
    funcionario: Funcionario = Depends(get_current_user),
):
    sucesso = crud.deletar_agendamento(db, agendamento_id)
    if not sucesso:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado")
    return {"mensagem": "Agendamento deletado com sucesso"}
