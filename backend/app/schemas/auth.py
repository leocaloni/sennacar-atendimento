from pydantic import BaseModel

class LoginInput(BaseModel):
    email: str
    senha: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str
