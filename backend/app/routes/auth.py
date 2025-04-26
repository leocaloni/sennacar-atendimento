from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.models.funcionario import Funcionario
from app.auth.auth_utils import criar_token_acesso

router = APIRouter(tags=["Autenticação"])

class LoginRequest(BaseModel):
    email: str
    senha: str

@router.post("/login")
async def login(login_data: LoginRequest):
    funcionario = Funcionario.buscar_por_email(login_data.email)
    
    if not funcionario:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    
    if not Funcionario.verificar_senha(funcionario["senha"], login_data.senha):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    
    token = criar_token_acesso(str(funcionario["_id"]))
    return {"access_token": token, "token_type": "bearer"}