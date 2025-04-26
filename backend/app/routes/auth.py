from fastapi import APIRouter, Depends, HTTPException, status
from app.models.funcionario import Funcionario
from app.auth.auth_utils import criar_token_acesso
from app.schemas.auth import AuthLogin, AuthToken

router = APIRouter(tags=["Autenticação"])

@router.post("/login", response_model=AuthToken)
async def login(login_data: AuthLogin):
    funcionario = Funcionario.buscar_por_email(login_data.email)
    
    if not funcionario:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    
    if not Funcionario.verificar_senha(funcionario["senha"], login_data.senha):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    
    token = criar_token_acesso(str(funcionario["_id"]))
    return AuthToken(access_token=token) 
