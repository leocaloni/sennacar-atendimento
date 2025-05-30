from pydantic import BaseModel, EmailStr


# Modelo para entrada de dados no login.
# Requer email no formato válido e senha.
class AuthLogin(BaseModel):
    email: EmailStr
    senha: str


# Modelo para resposta de autenticação.
# Contém o token de acesso e define o tipo de token como 'bearer' por padrão.
class AuthToken(BaseModel):
    access_token: str
    token_type: str = "bearer"
