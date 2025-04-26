from decimal import Decimal
from bson import ObjectId
from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.produto import ProdutoCreate, ProdutoUpdate, ProdutoResponse
from app.models.produto import Produto
from app.auth.auth_utils import verificar_admin, get_current_user
from app.database import get_produtos_collection

router = APIRouter(prefix="/produtos", tags=["Produtos"])

@router.post("/", status_code=201)
async def criar_produto(
    produto: ProdutoCreate,
    admin: dict = Depends(verificar_admin)
):
    produtos_col = get_produtos_collection()
    
    novo_produto = produto.model_dump()
    resultado = produtos_col.insert_one(novo_produto)
    
    return {"id": str(resultado.inserted_id)}

@router.get("/{produto_id}", response_model=ProdutoResponse)
async def obter_produto(produto_id: str, user=Depends(get_current_user)):
    produto = Produto.buscar_por_id(produto_id)
    
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    
    produto['id'] = str(produto['_id'])
    return ProdutoResponse(**produto)

@router.get("/categoria/{categoria}", response_model=list[ProdutoResponse])
async def listar_produtos_por_categoria(categoria: str, user=Depends(get_current_user)):
    produtos = Produto.listar_por_categoria(categoria)
    return [
        ProdutoResponse(
            id=str(produto['_id']),
            nome=produto['nome'],
            preco=produto['preco'],
            preco_mao_obra=produto.get('preco_mao_obra', 0.0),
            categoria=produto.get('categoria'),
            descricao=produto.get('descricao')
        )
        for produto in produtos
    ]

@router.put("/{produto_id}")
async def atualizar_produto(
    produto_id: str,
    dados: ProdutoUpdate, 
    admin: dict = Depends(verificar_admin)
):
    produtos_col = get_produtos_collection()

    produto_existente = produtos_col.find_one({"_id": ObjectId(produto_id)})
    if not produto_existente:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    update_data = {k: (float(v) if isinstance (v, Decimal) else v) for k, v in dados.model_dump(exclude_unset=True).items()}

    if not update_data:
        raise HTTPException(status_code=400, detail="Nenhum dado enviado para atualização")

    produtos_col.update_one({"_id": ObjectId(produto_id)}, {"$set": update_data})
    return {"mensagem": "Produto atualizado com sucesso"}


@router.delete("/{produto_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deletar_produto(produto_id: str, user=Depends(verificar_admin)):
    produtos_col = get_produtos_collection()
    result = produtos_col.delete_one({"_id": ObjectId(produto_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
