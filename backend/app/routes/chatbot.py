from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from bson import ObjectId
from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.produto import ProdutoResponse
from app.models.produto import Produto
from app.database import get_produtos_collection, get_agendamentos_collection, get_clientes_collection, get_funcionario_collection
from app.models.cliente import Cliente
from app.models.agendamento import Agendamento
from app.models.funcionario import Funcionario
from app.schemas.funcionario import FuncionarioResponse
from backend.app.schemas.agendamento import AgendamentoResponse

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])

@router.get("/categoria/{categoria}", response_model=list[ProdutoResponse])
async def listar_produtos_por_categoria(categoria: str):
    produtos = Produto.listar_por_categoria(categoria)
    return [
        ProdutoResponse(
            _id=str(produto['_id']),
            nome=produto['nome'],
            preco=produto['preco'],
            preco_mao_obra=produto.get('preco_mao_obra', 0.0),
            categoria=produto.get('categoria'),
            descricao=produto.get('descricao')
        )
        for produto in produtos
    ]

@router.post("/clientes", status_code=status.HTTP_201_CREATED)
async def criar_cliente_via_chatbot(
    nome: str,
    email: str,
    telefone: str,
):
    novo_cliente = Cliente(nome, email, telefone)
    cliente_id = novo_cliente.cadastrar_cliente()

    if not cliente_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email ou telefone já cadastrados ou dados inválidos"
        )
    
    return {"id": cliente_id}


@router.post("/", status_code=status.HTTP_201_CREATED)
async def criar_agendamento(
    cliente_id: str,
    data_agendada: datetime,
    produtos: str,
    status: Optional[str] = "pendente",
    observacoes: Optional[str] = "",
    valor_total: Optional[float] = 0.0
):
    lista_produtos = list(set([produto.strip() for produto in produtos.split(",")]))
    novo_agendamento = Agendamento(cliente_id, data_agendada, lista_produtos, status, observacoes, valor_total)
    agendamento_id = novo_agendamento.criar_agendamento()

    if not agendamento_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Data já reservada ou dados inválidos"
        )
    
    return {"id": agendamento_id}


@router.get("/", response_model=List[AgendamentoResponse])
async def listar_agendamentos():
    agendamentos = Agendamento.listar_todos()
    if not agendamentos:
         raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nenhum agendamento encontrado"
        )
    return [AgendamentoResponse.from_mongo(agendamento) for agendamento in agendamentos]


@router.get("/", response_model=List[FuncionarioResponse])
async def listar_funcionarios():
    funcionarios = Funcionario.listar_todos()
    if not funcionarios:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nenhum funcionário encontrado"
        )
    return [FuncionarioResponse.from_mongo(funcionario) for funcionario in funcionarios]
