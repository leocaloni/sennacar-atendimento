from fastapi import APIRouter, Depends, HTTPException, status
from app.models.funcionario import Funcionario
from app.auth.auth_utils import get_current_user, verificar_admin
from typing import List, Optional
from app.schemas.funcionario import FuncionarioResponse, FuncionarioUpdate

router = APIRouter(prefix="/funcionarios", tags=["Funcionários"])


# Cria um novo funcionário com os dados fornecidos.
# Apenas administradores podem realizar essa operação.
# Retorna erro se o email já estiver cadastrado.
@router.post("/", status_code=status.HTTP_201_CREATED)
async def criar_funcionario(
    nome: str,
    email: str,
    senha: str,
    is_admin: bool = False,
    admin: dict = Depends(verificar_admin),
):
    novo_funcionario = Funcionario(nome, email, senha, is_admin)
    funcionario_id = novo_funcionario.cadastrar_funcionario()

    if not funcionario_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já cadastrado ou dados inválidos",
        )

    return {"id": funcionario_id}


# Lista todos os funcionários não administradores cadastrados.
# Requer autenticação.
# Retorna erro se nenhum funcionário for encontrado.
@router.get("/", response_model=List[FuncionarioResponse])
async def listar_funcionarios(user: dict = Depends(get_current_user)):
    funcionarios = Funcionario.listar_todos()
    if not funcionarios:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nenhum funcionário encontrado",
        )
    return [FuncionarioResponse.from_mongo(funcionario) for funcionario in funcionarios]


# Busca funcionários com correspondência parcial por nome ou email.
# Prioriza nome; se não houver, busca por email.
# Retorna erro se nenhum critério for fornecido.
@router.get("/busca", response_model=List[FuncionarioResponse])
async def buscar_funcionarios_parcial(
    nome: Optional[str] = None,
    email: Optional[str] = None,
    user: dict = Depends(get_current_user),
):
    if nome:
        funcionarios = Funcionario.listar_por_nome_regex(nome)
    elif email:
        funcionarios = Funcionario.listar_por_email_regex(email)
    else:
        raise HTTPException(status_code=400, detail="Informe nome ou email para busca")
    return [FuncionarioResponse.from_mongo(f) for f in funcionarios]


# Obtém um funcionário específico pelo ID.
# Requer autenticação.
# Retorna erro se o funcionário não for encontrado.
@router.get("/{funcionario_id}", response_model=FuncionarioResponse)
async def obter_funcionario(
    funcionario_id: str, user: dict = Depends(get_current_user)
):
    funcionario = Funcionario.obter_funcionario_por_id(funcionario_id)
    if not funcionario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Funcionário não encontrado",
        )
    return FuncionarioResponse.from_mongo(funcionario)


# Retorna os dados do funcionário atualmente autenticado.
# Útil para consultas de perfil próprio.
@router.get("/me", response_model=FuncionarioResponse)
async def meu_perfil(user: dict = Depends(get_current_user)):
    return FuncionarioResponse.from_mongo(user)


# Atualiza os dados de um funcionário específico.
# Apenas administradores podem realizar essa operação.
# Garante que pelo menos um dado seja fornecido para atualização.
# Retorna erro se o funcionário não for encontrado.
@router.put("/{funcionario_id}")
async def atualizar_funcionario(
    funcionario_id: str,
    dados_atualizacao: FuncionarioUpdate,
    admin: dict = Depends(verificar_admin),
):
    dados_atualizacao_dict = dados_atualizacao.dict(exclude_unset=True)

    if not dados_atualizacao_dict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nenhum dado fornecido para atualização",
        )

    sucesso = Funcionario.atualizar_funcionario(funcionario_id, dados_atualizacao_dict)
    if not sucesso:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Funcionário não encontrado",
        )

    return {"message": "Funcionário atualizado"}


# Remove um funcionário do sistema pelo ID.
# Apenas administradores podem realizar essa operação.
# Retorna erro se o funcionário não for encontrado.
@router.delete("/{funcionario_id}")
async def deletar_funcionario(
    funcionario_id: str, admin: dict = Depends(verificar_admin)
):
    sucesso = Funcionario.deletar_funcionario(funcionario_id)
    if not sucesso:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Funcionário não encontrado",
        )

    return {"message": "Funcionário removido"}
