from decimal import Decimal
from typing import List, Optional
from bson import ObjectId
from fastapi import APIRouter, HTTPException, Query, status, Depends
from app.schemas.produto import ProdutoResponse
from app.models.produto import Produto
from app.auth.auth_utils import verificar_admin, get_current_user
from app.database import get_produtos_collection

router = APIRouter(prefix="/produtos", tags=["Produtos"])


@router.post("/", status_code=201)
async def criar_produto(
    nome: str,
    preco: Decimal,
    preco_mao_obra: Decimal = 0.0,
    categoria: Optional[str] = None,
    descricao: Optional[str] = None,
    admin: dict = Depends(verificar_admin),
):
    novo_produto = Produto(nome, preco, preco_mao_obra, categoria, descricao)
    produto_id = novo_produto.cadastrar_produto()

    if not produto_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Produto já cadastrado ou dados inválidos",
        )

    return {"id": produto_id}


from app.schemas.produto import ProdutoResponse


@router.get("/filtrar", response_model=List[ProdutoResponse])
async def filtrar_produtos_por_nome(
    nome: str = Query(..., min_length=1),
    user: dict = Depends(get_current_user),
):
    produtos = Produto.listar_por_nome_regex(nome)
    return [ProdutoResponse.from_mongo(p) for p in produtos]


@router.get("/categorias/sugestoes", response_model=List[str])
async def sugerir_categorias(descricao: str = Query(..., min_length=1)):
    categorias = get_produtos_collection().distinct(
        "descricao", {"descricao": {"$regex": f".*{descricao}.*", "$options": "i"}}
    )
    return sorted(filter(None, categorias))


@router.get("/", response_model=List[ProdutoResponse])
async def listar_todos_produtos(user=Depends(get_current_user)):
    produtos = get_produtos_collection().find().sort("nome", 1)
    return [ProdutoResponse.from_mongo(p) for p in produtos]


@router.get("/{produto_id}", response_model=ProdutoResponse)
async def obter_produto(produto_id: str, user=Depends(get_current_user)):
    produto = Produto.buscar_por_id(produto_id)

    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    return ProdutoResponse.from_mongo(produto)


@router.get("/categoria/{categoria}", response_model=list[ProdutoResponse])
async def listar_produtos_por_categoria(categoria: str, user=Depends(get_current_user)):
    produtos = Produto.listar_por_categoria(categoria)
    return [
        ProdutoResponse(
            _id=str(produto["_id"]),
            nome=produto["nome"],
            preco=produto["preco"],
            preco_mao_obra=produto.get("preco_mao_obra", 0.0),
            categoria=produto.get("categoria"),
            descricao=produto.get("descricao"),
        )
        for produto in produtos
    ]


@router.put("/{produto_id}")
async def atualizar_produto(
    produto_id: str,
    nome: Optional[str] = None,
    preco: Optional[Decimal] = None,
    preco_mao_obra: Optional[Decimal] = None,
    categoria: Optional[str] = None,
    descricao: Optional[str] = None,
    admin: dict = Depends(verificar_admin),
):
    dados_atualizacao = {}
    if nome:
        dados_atualizacao["nome"] = nome
    if preco:
        dados_atualizacao["preco"] = preco
    if preco_mao_obra:
        dados_atualizacao["preco_mao_obra"] = preco_mao_obra
    if categoria:
        dados_atualizacao["categoria"] = categoria
    if descricao:
        dados_atualizacao["deascricao"] = descricao

    if not dados_atualizacao:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nenhum dado fornecido para atualização",
        )

    sucesso = Produto.atualizar_produto(produto_id, dados_atualizacao)
    if not sucesso:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produto não encontrado",
        )
    return {"message": "Produto atualizado"}


@router.delete("/{produto_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deletar_produto(produto_id: str, user=Depends(verificar_admin)):
    produtos_col = get_produtos_collection()
    result = produtos_col.delete_one({"_id": ObjectId(produto_id)})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
