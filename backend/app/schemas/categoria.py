from pydantic import BaseModel

class CategoriaBase(BaseModel):
    nome: str

class CategoriaCreate(CategoriaBase):
    pass

class CategoriaUpdate(CategoriaBase):
    pass

class CategoriaOut(CategoriaBase):
    id: int

    class Config:
        orm_mode = True
