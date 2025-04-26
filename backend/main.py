from fastapi import FastAPI
from fastapi.security import OAuth2PasswordBearer
from app.routes import funcionarios, auth, produto, clientes, agendamentos
from fastapi.openapi.utils import get_openapi

app = FastAPI(
    title="Sennacar API",
    version="1.0.0",
    description="API do sistema de agendamentos e atendimento da Sennacar",
    openapi_tags=[
        {"name": "Autenticação", "description": "Login e geração de token"},
        {"name": "Funcionários", "description": "Operações com funcionários"},
        {"name": "Clientes", "description": "Operações com clientes"},
        {"name": "Agendamentos", "description": "Gestão de agendamentos"},
        {"name": "Produtos", "description": "Catálogo de produtos"}
    ]
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

app.include_router(funcionarios.router, prefix="/funcionarios", tags=["Funcionários"])
app.include_router(auth.router, prefix="/auth", tags=["Autenticação"])
app.include_router(produto.router, prefix="/produtos", tags=["Produtos"])
app.include_router(clientes.router, prefix="/clientes", tags=["Clientes"])
app.include_router(agendamentos.router, prefix="/agendamentos", tags=["Agendamentos"])


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="Sennacar API",
        version="1.0.0",
        description="API do sistema de agendamentos e atendimento da Sennacar",
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }
    for path in openapi_schema["paths"].values():
        for method in path.values():
            method.setdefault("security", []).append({"BearerAuth": []})
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi
