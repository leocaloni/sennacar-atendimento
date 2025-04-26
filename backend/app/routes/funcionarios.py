from fastapi import APIRouter, Depends, HTTPException, status
from app.models.funcionario import Funcionario
from app.auth.auth_utils import get_current_user, verificar_admin
from typing import List, Optional
from app.schemas.funcionario import FuncionarioResponse

router = APIRouter(prefix="/funcionarios", tags=["Funcionários"])

@router.post("/", status_code=status.HTTP_201_CREATED)
async def criar_funcionario(
    nome: str,
    email: str,
    senha: str,
    is_admin: bool = False,
    admin: dict = Depends(verificar_admin)
):
    novo_funcionario = Funcionario(nome, email, senha, is_admin)
    funcionario_id = novo_funcionario.cadastrar_funcionario()
    
    if not funcionario_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já cadastrado ou dados inválidos",
        )
    
    return {"id": funcionario_id}

@router.get("/", response_model=List[FuncionarioResponse])
async def listar_funcionarios(
    user: dict = Depends(get_current_user)
):
    funcionarios = Funcionario.listar_todos()
    if not funcionarios:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nenhum funcionário encontrado"
        )
    return [FuncionarioResponse.from_mongo(funcionario) for funcionario in funcionarios]

@router.get("/me", response_model=FuncionarioResponse)
async def meu_perfil(
    user: dict = Depends(get_current_user)
):
    return FuncionarioResponse.from_mongo(user)

@router.put("/{funcionario_id}")
async def atualizar_funcionario(
    funcionario_id: str,
    nome: Optional[str] = None,
    email: Optional[str] = None,
    is_admin: Optional[bool] = None,
    admin: dict = Depends(verificar_admin)
):
    dados_atualizacao = {}
    if nome: dados_atualizacao["nome"] = nome
    if email: dados_atualizacao["email"] = email
    if is_admin is not None: dados_atualizacao["isAdmin"] = is_admin
    
    if not dados_atualizacao:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nenhum dado fornecido para atualização",
        )
    
    sucesso = Funcionario.atualizar_funcionario(funcionario_id, dados_atualizacao)
    if not sucesso:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Funcionário não encontrado",
        )
    
    return {"message": "Funcionário atualizado"}

@router.delete("/{funcionario_id}")
async def deletar_funcionario(
    funcionario_id: str,
    admin: dict = Depends(verificar_admin)
):
    sucesso = Funcionario.deletar_funcionario(funcionario_id)
    if not sucesso:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Funcionário não encontrado",
        )
    
    return {"message": "Funcionário removido"}
