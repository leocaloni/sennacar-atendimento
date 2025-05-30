from app.database import get_produtos_collection, get_agendamentos_collection
from bson import ObjectId
from decimal import Decimal
from typing import Optional, Dict, List


class Produto:
    def __init__(
        self,
        nome: str,
        preco: float,
        preco_mao_obra: float = 0.0,
        categoria: str = None,
        descricao: str = None,
    ):
        self.nome = nome
        self.preco = Decimal(str(preco)).quantize(Decimal("0.00"))
        self.preco_mao_obra = Decimal(str(preco_mao_obra)).quantize(Decimal("0.00"))
        self.categoria = categoria
        self.descricao = descricao

    # Cadastra um novo produto no banco de dados
    # - Verifica se o produto já existe pelo nome
    # - Insere o produto e retorna o ID
    def cadastrar_produto(self) -> Optional[str]:
        try:
            produtos_col = get_produtos_collection()

            if produtos_col.find_one({"nome": self.nome}):
                print("Produto já existe")
                return None

            produto_id = produtos_col.insert_one(
                {
                    "nome": self.nome,
                    "preco": float(self.preco),
                    "preco_mao_obra": float(self.preco_mao_obra),
                    **({"categoria": self.categoria} if self.categoria else {}),
                    **({"descricao": self.descricao} if self.descricao else {}),
                }
            ).inserted_id

            print(f"Produto cadastrado | ID: {produto_id}")
            return str(produto_id)
        except Exception as e:
            print(f"Erro: {str(e)}")
            return None

    # Calcula o valor total de uma lista de produtos
    # - Soma o preço e o preço de mão de obra de cada produto
    # - Utiliza uma agregação no MongoDB
    @staticmethod
    def calcular_valor_total(produtos_ids: List[str]) -> float:
        try:
            produtos_col = get_produtos_collection()
            pipeline = [
                {"$match": {"_id": {"$in": [ObjectId(id) for id in produtos_ids]}}},
                {
                    "$group": {
                        "_id": None,
                        "total": {"$sum": {"$add": ["$preco", "$preco_mao_obra"]}},
                    }
                },
            ]
            result = list(produtos_col.aggregate(pipeline))
            return result[0]["total"] if result else 0.0
        except Exception as e:
            print(f"Erro no cálculo: {str(e)}")
            return 0.0

    # Atualiza o valor total de um agendamento com base nos produtos associados
    # - Busca o agendamento
    # - Recalcula o valor total e atualiza no banco
    @staticmethod
    def atualizar_agendamento_com_total(agendamento_id: str) -> bool:
        try:
            agendamento = get_agendamentos_collection().find_one(
                {"_id": ObjectId(agendamento_id)}
            )

            if not agendamento:
                return False

            valor_total = Produto.calcular_valor_total(agendamento["produtos"])

            result = get_agendamentos_collection().update_one(
                {"_id": ObjectId(agendamento_id)},
                {"$set": {"valor_total": valor_total}},
            )

            return result.modified_count > 0
        except Exception as e:
            print(f"Erro ao atualizar valor do agendamento: {str(e)}")
            return False

    # Busca um produto pelo ID
    # - Retorna o documento correspondente ou None
    @staticmethod
    def buscar_por_id(produto_id: str) -> Optional[Dict]:
        try:
            return get_produtos_collection().find_one({"_id": ObjectId(produto_id)})
        except Exception as e:
            print(f"Erro ao buscar produto: {str(e)}")
            return None

    # Lista produtos de uma categoria específica
    # - Ordena os resultados pelo nome
    @staticmethod
    def listar_por_categoria(categoria: str) -> List[Dict]:
        try:
            return list(
                get_produtos_collection().find(
                    {"categoria": categoria}, sort=[("nome", 1)]
                )
            )
        except Exception as e:
            print(f"Erro ao listar produtos: {str(e)}")
            return []

    # Lista produtos cujo nome corresponde parcialmente ao texto informado
    # - Utiliza expressão regular (case insensitive)
    @staticmethod
    def listar_por_nome_regex(texto: str) -> List[Dict]:
        regex = {"$regex": f".*{texto}.*", "$options": "i"}
        return list(get_produtos_collection().find({"nome": regex}).limit(15))

    # Atualiza os dados de um produto pelo ID
    # - Retorna True se a atualização foi bem-sucedida
    @staticmethod
    def atualizar_produto(produto_id: str, dados_atualizados: dict) -> bool:
        try:
            produtos_col = get_produtos_collection()
            result = produtos_col.update_one(
                {"_id": ObjectId(produto_id)}, {"$set": dados_atualizados}
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Erro ao atualizar produto: {str(e)}")
            return False

    # Deleta um produto pelo ID
    # - Retorna True se a exclusão foi realizada com sucesso
    @staticmethod
    def deletar_produto(produto_id: str) -> bool:
        try:
            produtos_col = get_produtos_collection()
            result = produtos_col.delete_one({"_id": ObjectId(produto_id)})
            return result.deleted_count > 0
        except Exception as e:
            print(f"Erro ao deletar produto: {str(e)}")
            return False
