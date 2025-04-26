from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class ClienteBase(BaseModel):
    nome: str
    email: EmailStr
    telefone: str

class ClienteCreate(ClienteBase):
    pass

class ClienteUpdate(BaseModel):
    nome: Optional[str] = None
    email: Optional[EmailStr] = None
    telefone: Optional[str] = None

class ClienteResponse(ClienteBase):
    id: str = Field(alias="_id")

    class Config:
        orm_mode = True

    @classmethod
    def from_mongo(cls, data):
        if '_id' in data:
            data['_id'] = str(data['_id'])
        return cls(**data)
