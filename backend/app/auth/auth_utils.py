from bson import ObjectId
from jose import jwt
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from app.models.funcionario import Funcionario
import os
from dotenv import load_dotenv

load_dotenv()

# Chave secreta usada para assinar e verificar o token JWT
SECRET_KEY = os.getenv("SECRET_KEY") or "fallback_key_123"
# Algoritmo usado na assinatura do token
ALGORITHM = "HS256"

# Esquema de autenticação OAuth2 com fluxo de senha
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


# Função para criar um token JWT com os dados fornecidos
def criar_token_acesso(data: dict) -> str:
    to_encode = data.copy()
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# Função para obter o usuário atual a partir do token JWT
async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")

        if not user_id or not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=401, detail="Token inválido")

        user = Funcionario.buscar_por_id(ObjectId(user_id))
        if not user:
            raise HTTPException(status_code=401, detail="Usuário não encontrado")

        return user
    except Exception as e:
        raise HTTPException(status_code=401, detail="Falha na autenticação")


# Função para verificar se o usuário atual é administrador
async def verificar_admin(user: dict = Depends(get_current_user)):
    if not user.get("isAdmin", False):
        raise HTTPException(status_code=403, detail="Acesso não autorizado")
    return user
