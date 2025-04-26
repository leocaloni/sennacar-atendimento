from pydantic import BaseModel, EmailStr

class AuthLogin(BaseModel):
    email: EmailStr
    senha: str

class AuthToken(BaseModel):
    access_token: str
    token_type: str = "bearer"
