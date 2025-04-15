from fastapi import FastAPI
from app.routes import clientes, funcionarios, auth

app = FastAPI()

app.include_router(clientes.router, prefix="/clientes", tags=["Clientes"])
app.include_router(funcionarios.router, prefix="/funcionarios", tags=["Funcionários"])
app.include_router(auth.router, prefix="/auth", tags=["Autenticação"])
