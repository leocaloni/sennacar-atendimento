from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from app.models.funcionario import Funcionario
from app.auth.auth_utils import criar_token_acesso
from app.schemas.auth import AuthLogin, AuthToken

router = APIRouter(tags=["Autenticação"])


class EmailRequest(BaseModel):
    email: EmailStr


# Realiza autenticação do funcionário
# - Valida email e senha
# - Gera e retorna token JWT se válido
@router.post("/login", response_model=AuthToken)
async def login(login_data: AuthLogin):
    if not login_data.email or not login_data.senha:
        raise HTTPException(
            status_code=400, detail="Todos os campos devem ser preenchidos"
        )

    if "@" not in login_data.email:
        raise HTTPException(status_code=400, detail="O email precisa conter '@'")

    funcionario = Funcionario.buscar_por_email(login_data.email)

    if not funcionario:
        raise HTTPException(status_code=401, detail="Email não encontrado")

    if not Funcionario.verificar_senha(funcionario["senha"], login_data.senha):
        raise HTTPException(status_code=401, detail="Senha incorreta")

    token = criar_token_acesso(
        {
            "sub": str(funcionario["_id"]),
            "isAdmin": funcionario.get("isAdmin", False),
            "email": funcionario.get("email"),
            "nome": funcionario.get("nome"),
        }
    )

    return AuthToken(access_token=token)


# Verifica se um email está cadastrado
# - Retorna nome e email se encontrado
# - Caso contrário, retorna erro 404
@router.post("/auth/verificar-email")
async def verificar_email(dados: EmailRequest):
    funcionario = Funcionario.buscar_por_email(dados.email)
    if not funcionario:
        raise HTTPException(status_code=404, detail="Funcionário não encontrado")
    return {"nome": funcionario["nome"], "email": funcionario["email"]}
