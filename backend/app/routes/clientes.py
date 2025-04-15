from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.cliente import ClienteCreate, ClienteOut
from app.crud import cliente as crud_cliente
from app.dependencies import get_db

router = APIRouter()

@router.post("/", response_model=ClienteOut)
def criar_cliente(cliente: ClienteCreate, db: Session = Depends(get_db)):
    return crud_cliente.criar_cliente(db, cliente)

@router.get("/", response_model=list[ClienteOut])
def listar_clientes(db: Session = Depends(get_db)):
    return crud_cliente.listar_clientes(db)
