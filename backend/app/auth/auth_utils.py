from bson import ObjectId
from jose import jwt
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from app.models.funcionario import Funcionario
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY") or "fallback_key_123"
ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def criar_token_acesso(user_id: str) -> str:
    if isinstance(user_id, ObjectId):
        user_id = str(user_id)
    return jwt.encode({"sub": user_id}, SECRET_KEY, algorithm=ALGORITHM)

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

async def verificar_admin(user: dict = Depends(get_current_user)):
    if not user.get("isAdmin", False):
        raise HTTPException(status_code=403, detail="Acesso não autorizado")
    return user