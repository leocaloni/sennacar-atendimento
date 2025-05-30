from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.models.cliente import Cliente
from app.schemas.cliente import ClienteResponse, ClienteUpdate
from typing import List, Optional
from app.auth.auth_utils import get_current_user

router = APIRouter(prefix="/clientes", tags=["Clientes"])


# Cria um novo cliente com nome, email e telefone fornecidos.
# Retorna erro se já houver cliente com o mesmo email ou telefone.
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


# Endpoint de debug para listar todos os clientes cadastrados.
# Não exige autenticação ou parâmetros de busca.
@router.get("/debug", response_model=List[ClienteResponse])
async def debug_busca_geral():
    clientes = Cliente.listar_todos()
    return [ClienteResponse.from_mongo(c) for c in clientes]


# Lista todos os clientes cadastrados no sistema.
# Protegido por autenticação.
@router.get("/todos", response_model=List[ClienteResponse])
async def listar_todos_clientes(user: dict = Depends(get_current_user)):
    clientes = Cliente.listar_todos()
    return [ClienteResponse.from_mongo(c) for c in clientes]


# Busca um cliente por nome, email ou telefone (busca exata).
# Requer pelo menos um parâmetro de busca.
# Retorna erro se nenhum critério for fornecido ou cliente não encontrado.
@router.get("/", response_model=ClienteResponse)
async def buscar_clientes(
    nome: Optional[str] = Query(None),
    email: Optional[str] = Query(None),
    telefone: Optional[str] = Query(None),
    user: dict = Depends(get_current_user),
):
    print(f"Recebida busca - nome: {nome}, email: {email}, telefone: {telefone}")

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


# Busca clientes com correspondência parcial via regex.
# Prioriza nome, depois email e telefone, seguindo essa ordem.
# Retorna erro se nenhum parâmetro de busca for fornecido.
@router.get("/busca", response_model=List[ClienteResponse])
async def buscar_clientes_parcial(
    nome: Optional[str] = Query(None, min_length=1),
    email: Optional[str] = Query(None, min_length=1),
    telefone: Optional[str] = Query(None, min_length=1),
    user: dict = Depends(get_current_user),
):
    if nome:
        clientes = Cliente.listar_por_nome_regex(nome)
    elif email:
        clientes = Cliente.listar_por_email_regex(email)
    elif telefone:
        clientes = Cliente.listar_por_telefone_regex(telefone)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Informe nome, email ou telefone para busca",
        )
    return [ClienteResponse.from_mongo(c) for c in clientes]


# Obtém um cliente específico pelo ID fornecido.
# Retorna erro se o cliente não for encontrado.
@router.get("/{cliente_id}", response_model=ClienteResponse)
async def obter_cliente_por_id(cliente_id: str, user: dict = Depends(get_current_user)):
    cliente = Cliente.buscar_por_id(cliente_id)
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return ClienteResponse.from_mongo(cliente)


# Atualiza dados de um cliente específico.
# Garante que ao menos um dado seja fornecido para atualização.
# Retorna erro se cliente não for encontrado.
@router.put("/{cliente_id}")
async def atualizar_cliente(
    cliente_id: str,
    dados: ClienteUpdate,
    user: dict = Depends(get_current_user),
):
    dados_atualizacao = dados.dict(exclude_unset=True)

    if not dados_atualizacao:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nenhum dado fornecido para atualização",
        )

    sucesso = Cliente.atualizar_cliente(cliente_id, dados_atualizacao)
    if not sucesso:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")

    return {"message": "Cliente atualizado"}


# Remove um cliente do sistema pelo ID.
# Retorna erro se cliente não for encontrado.
@router.delete("/{cliente_id}")
async def deletar_cliente(cliente_id: str, user: dict = Depends(get_current_user)):
    sucesso = Cliente.deletar_cliente(cliente_id)
    if not sucesso:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente não encontrado",
        )

    return {"message": "Cliente removido"}
