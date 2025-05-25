from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from app.models.agendamento import Agendamento
from app.schemas.agendamento import AgendamentoResponse
from typing import List, Optional
from app.auth.auth_utils import get_current_user
from app.google.calendario import GoogleCalendarService
from app.models.cliente import Cliente
from app.models.produto import Produto

router = APIRouter(prefix="/agendamentos", tags=["Agendamentos"])


@router.post("/", status_code=status.HTTP_201_CREATED)
async def criar_agendamento(
    cliente_id: str,
    data_agendada: datetime,
    produtos: str,
    status: Optional[str] = "pendente",
    observacoes: Optional[str] = "",
    valor_total: Optional[float] = 0.0,
):
    lista_produtos = list(set([produto.strip() for produto in produtos.split(",")]))
    novo_agendamento = Agendamento(
        cliente_id, data_agendada, lista_produtos, status, observacoes, valor_total
    )
    agendamento_id = novo_agendamento.criar_agendamento()

    if not agendamento_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Data já reservada ou dados inválidos",
        )

    # ⬇️ Adiciona o evento no Google Calendar com nome do cliente e produtos
    try:
        cliente = Cliente.buscar_por_id(cliente_id)
        nome_cliente = cliente["nome"] if cliente else "Cliente"

        nomes_produtos = []
        for pid in lista_produtos:
            p = Produto.buscar_por_id(pid)
            if p:
                nomes_produtos.append(p["nome"])

        GoogleCalendarService().create_event(
            {
                "summary": f"Agendamento - {nome_cliente}",
                "description": f"Produtos: {', '.join(nomes_produtos)}",
                "start_time": data_agendada,
                "end_time": data_agendada + timedelta(minutes=30),
            }
        )
    except Exception as e:
        print(f"Erro ao criar evento no Google Calendar: {e}")

    return {"id": agendamento_id}


@router.get("/", response_model=List[AgendamentoResponse])
async def listar_agendamentos(user: dict = Depends(get_current_user)):
    agendamentos = Agendamento.listar_todos()
    if not agendamentos:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nenhum agendamento encontrado",
        )
    return [AgendamentoResponse.from_mongo(agendamento) for agendamento in agendamentos]


@router.get("/cliente_id/{cliente_id}", response_model=List[AgendamentoResponse])
async def buscar_por_cliente_id(
    cliente_id: str, user: dict = Depends(get_current_user)
):
    agendamentos = Agendamento.buscar_por_cliente(cliente_id)

    if not agendamentos:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nenhum agendamento encontrado",
        )

    return [
        AgendamentoResponse(
            _id=str(agendamento["_id"]),
            cliente_id=agendamento["cliente_id"],
            data_agendada=agendamento["data_agendada"],
            produtos=agendamento["produtos"],
            status=agendamento["status"],
            observacoes=agendamento["observacoes"],
            valor_total=agendamento["valor_total"],
        )
        for agendamento in agendamentos
    ]


@router.get("/periodo", response_model=List[AgendamentoResponse])
async def buscar_por_periodo(
    data_inicio: str,
    data_fim: str,
    status: Optional[str] = None,
    user: dict = Depends(get_current_user),
):
    try:
        data_inicio = datetime.strptime(data_inicio, "%Y-%m-%d")
        data_fim = datetime.strptime(data_fim, "%Y-%m-%d")

        data_inicio = data_inicio.replace(hour=0, minute=0, second=0, microsecond=0)
        data_fim = data_fim.replace(hour=23, minute=59, second=59, microsecond=999999)

        agendamentos = Agendamento.buscar_por_periodo(data_inicio, data_fim, status)

        return [
            AgendamentoResponse(
                _id=str(agendamento["_id"]),
                cliente_id=agendamento["cliente_id"],
                data_agendada=agendamento["data_agendada"],
                produtos=agendamento["produtos"],
                status=agendamento["status"],
                observacoes=agendamento["observacoes"],
                valor_total=agendamento["valor_total"],
            )
            for agendamento in agendamentos
        ]

    except Exception as e:
        print(f"Erro ao buscar agendamentos: {str(e)}")
        return []


@router.put("/agendamento/{agendamento_id}/produtos")
async def atualizar_produtos(
    agendamento_id: str,
    novos_produtos: List[str],
    user: dict = Depends(get_current_user),
):
    sucesso = Agendamento.atualizar_produtos(agendamento_id, novos_produtos)
    if not sucesso:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agendamento não encontrado ou falha na atualização dos produtos",
        )
    return {"message": "Produtos atualizados com sucesso"}


@router.put("/agendamento/{agendamento_id}/status")
async def atualizar_status(
    agendamento_id: str, novo_status: str, user: dict = Depends(get_current_user)
):
    sucesso = Agendamento.atualizar_status(agendamento_id, novo_status)
    if not sucesso:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agendamento não encontrado ou falha na atualização do status",
        )
    return {"message": f"Status atualizado para '{novo_status}' com sucesso"}


@router.delete("/agendamento/{agendamento_id}")
async def deletar_agendamento(
    agendamento_id: str, user: dict = Depends(get_current_user)
):
    agendamento = Agendamento.buscar_por_id(agendamento_id)

    if not agendamento:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado")

    # Se tiver event_id, excluir do Google
    google_event_id = agendamento.get("google_event_id")
    if google_event_id:
        try:
            GoogleCalendarService().service.events().delete(
                calendarId="primary", eventId=google_event_id
            ).execute()
        except Exception as e:
            print(f"Erro ao excluir evento do Google: {e}")

    sucesso = Agendamento.deletar_agendamento(agendamento_id)
    if not sucesso:
        raise HTTPException(status_code=404, detail="Erro ao remover do MongoDB")

    return {"message": "Agendamento removido com sucesso"}
