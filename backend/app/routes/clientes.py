from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.models.cliente import Cliente
from app.schemas.cliente import ClienteResponse
from typing import List, Optional
from app.auth.auth_utils import get_current_user

router = APIRouter(prefix="/clientes", tags=["Clientes"])


@router.post("/", status_code=status.HTTP_201_CREATED)
async def criar_cliente(
    nome: str, email: str, telefone: str, user: dict = Depends(get_current_user)
):
    novo_cliente = Cliente(nome, email, telefone)
    cliente_id = novo_cliente.cadastrar_cliente()

    if not cliente_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email ou telefone já cadastrados ou dados inválidos",
        )

    return {"id": cliente_id}


@router.get("/debug", response_model=List[ClienteResponse])
async def debug_busca_geral():
    clientes = Cliente.listar_todos()
    return [ClienteResponse.from_mongo(c) for c in clientes]


@router.get("/", response_model=ClienteResponse)
async def buscar_clientes(
    nome: Optional[str] = Query(None),
    email: Optional[str] = Query(None),
    telefone: Optional[str] = Query(None),
    user: dict = Depends(get_current_user),
):
    print(f"Recebida busca - nome: {nome}, email: {email}, telefone: {telefone}")

    # Adicione validação de parâmetros
    if not any([nome, email, telefone]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Informe pelo menos um critério de busca (nome, email ou telefone)",
        )

    cliente = None
    if nome:
        cliente = Cliente.buscar_por_nome(nome)
    elif email:
        cliente = Cliente.buscar_por_email(email)
    elif telefone:
        cliente = Cliente.buscar_por_telefone(telefone)

    if not cliente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Cliente não encontrado"
        )

    return ClienteResponse.from_mongo(cliente)


@router.put("/{cliente_id}")
async def atualizar_cliente(
    cliente_id: str,
    nome: Optional[str] = None,
    email: Optional[str] = None,
    telefone: Optional[str] = None,
    user: dict = Depends(get_current_user),
):
    dados_atualizacao = {}
    if nome:
        dados_atualizacao["nome"] = nome
    if email:
        dados_atualizacao["email"] = email
    if telefone:
        dados_atualizacao["telefone"] = telefone

    if not dados_atualizacao:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nenhum dado fornecido para atualização",
        )

    sucesso = Cliente.atualizar_cliente(cliente_id, dados_atualizacao)
    if not sucesso:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente não encontrado",
        )
    return {"message": "Cliente atualizado"}


@router.delete("/{cliente_id}")
async def deletar_cliente(cliente_id: str, user: dict = Depends(get_current_user)):
    sucesso = Cliente.deletar_cliente(cliente_id)
    if not sucesso:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente não encontrado",
        )

    return {"message": "Cliente removido"}
