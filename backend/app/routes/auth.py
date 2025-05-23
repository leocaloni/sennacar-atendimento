from fastapi import APIRouter, Depends, HTTPException, status
from app.models.funcionario import Funcionario
from app.auth.auth_utils import criar_token_acesso
from app.schemas.auth import AuthLogin, AuthToken

router = APIRouter(tags=["Autenticação"])


@router.post("/login", response_model=AuthToken)
async def login(login_data: AuthLogin):
    # Verificação manual de campos vazios
    if not login_data.email or not login_data.senha:
        raise HTTPException(
            status_code=400, detail="Todos os campos devem ser preenchidos"
        )

    # Validação básica de formato de email
    if "@" not in login_data.email:
        raise HTTPException(status_code=400, detail="O email precisa conter '@'")

    # Buscar funcionário
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
