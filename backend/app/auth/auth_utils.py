from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.models import Funcionario
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def criar_token_acesso(data: dict):
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Funcionario:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não autorizado",
        headers={"WWW-Authenticate": "Bearer"}
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        funcionario_id: int = payload.get("sub")
        if funcionario_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    funcionario = db.query(Funcionario).filter(Funcionario.id == funcionario_id).first()
    if funcionario is None:
        raise credentials_exception
    return funcionario

def verificar_admin(funcionario: Funcionario = Depends(get_current_user)):
    if funcionario.cargo != "admin":
        raise HTTPException(status_code=403, detail="Apenas administradores")
    return funcionario