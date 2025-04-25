from pydantic import BaseModel

class MarcaBase(BaseModel):
    nome: str

class MarcaCreate(MarcaBase):
    pass

class MarcaUpdate(MarcaBase):
    pass

class MarcaOut(MarcaBase):
    id: int

    class Config:
        orm_mode = True
