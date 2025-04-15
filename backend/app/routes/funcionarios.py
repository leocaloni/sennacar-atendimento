from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.funcionario import FuncionarioCreate, FuncionarioOut
from app.crud import funcionario as crud
from app.dependencies import get_db

router = APIRouter(prefix="/funcionarios", tags=["Funcionários"])

@router.post("/", response_model=FuncionarioOut)
def criar_funcionario(funcionario: FuncionarioCreate, db: Session = Depends(get_db)):
    return crud.criar_funcionario(db, funcionario)