from app.database import get_clientes_collection
from bson import ObjectId
from typing import Optional, Dict, List


class Cliente:
    def __init__(self, nome: str, email: str, telefone: str):
        self.nome = nome
        self.email = email
        self.telefone = telefone

    # Cadastra um novo cliente no banco de dados
    # - Verifica se já existe cliente com mesmo email ou telefone
    # - Retorna o ID do cliente cadastrado ou None se já existir
    def cadastrar_cliente(self) -> Optional[str]:
        try:
            clientes_collection = get_clientes_collection()

            if clientes_collection.find_one(
                {"$or": [{"email": self.email}, {"telefone": self.telefone}]}
            ):
                print("Cliente já cadastrado (email ou telefone existente)")
                return None

            cliente_id = clientes_collection.insert_one(
                {"nome": self.nome, "email": self.email, "telefone": self.telefone}
            ).inserted_id

            print(f"Cliente cadastrado com sucesso. ID: {cliente_id}")
            return str(cliente_id)

        except Exception as e:
            print(f"Erro ao cadastrar cliente: {e}")
            return None

    # Busca um cliente pelo ID
    # Retorna o documento do cliente ou None se não encontrado
    @staticmethod
    def buscar_por_id(cliente_id: str) -> Optional[Dict]:
        try:
            return get_clientes_collection().find_one({"_id": ObjectId(cliente_id)})
        except Exception as e:
            print(f"Erro ao buscar cliente: {e}")
            return None

    # Busca um cliente pelo número de telefone
    # Retorna o cliente correspondente ou None
    @staticmethod
    def buscar_por_telefone(telefone: str) -> Optional[Dict]:
        try:
            return get_clientes_collection().find_one({"telefone": telefone})
        except Exception as e:
            print(f"Erro ao buscar cliente por telefone: {e}")
            return None

    # Busca um cliente pelo nome exato
    # Retorna o cliente correspondente ou None
    @staticmethod
    def buscar_por_nome(nome: str) -> Optional[Dict]:
        try:
            return get_clientes_collection().find_one({"nome": nome})
        except Exception as e:
            print(f"Erro ao buscar cliente por nome: {e}")
            return None

    # Busca um cliente pelo email
    # Retorna o cliente correspondente ou None
    @staticmethod
    def buscar_por_email(email: str) -> Optional[Dict]:
        try:
            return get_clientes_collection().find_one({"email": email})
        except Exception as e:
            print(f"Erro ao buscar cliente por email: {e}")
            return None

    # Lista clientes cujo nome corresponde parcialmente ao texto informado
    # Utiliza expressão regular para busca insensível a maiúsculas/minúsculas
    @staticmethod
    def listar_por_nome_regex(texto: str) -> List[Dict]:
        regex = {"$regex": f".*{texto}.*", "$options": "i"}
        return list(get_clientes_collection().find({"nome": regex}).limit(10))

    # Lista clientes cujo email corresponde parcialmente ao texto informado
    # Utiliza expressão regular para busca insensível a maiúsculas/minúsculas
    @staticmethod
    def listar_por_email_regex(texto: str) -> List[Dict]:
        regex = {"$regex": f".*{texto}.*", "$options": "i"}
        return list(get_clientes_collection().find({"email": regex}).limit(10))

    # Lista clientes cujo telefone corresponde parcialmente ao texto informado
    # Utiliza expressão regular para busca insensível a maiúsculas/minúsculas
    @staticmethod
    def listar_por_telefone_regex(texto: str) -> List[Dict]:
        regex = {"$regex": f".*{texto}.*", "$options": "i"}
        return list(get_clientes_collection().find({"telefone": regex}).limit(10))

    # Lista todos os clientes cadastrados no banco
    @staticmethod
    def listar_todos() -> List[Dict]:
        try:
            return list(get_clientes_collection().find({}))
        except Exception as e:
            print(f"Erro ao listar clientes: {e}")
            return []

    # Atualiza os dados de um cliente com base no ID
    # Retorna True se a atualização foi realizada com sucesso
    @staticmethod
    def atualizar_cliente(cliente_id: str, dados_atualizacao: Dict) -> bool:
        try:
            result = get_clientes_collection().update_one(
                {"_id": ObjectId(cliente_id)}, {"$set": dados_atualizacao}
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Erro ao atualizar cliente: {e}")
            return False

    # Deleta um cliente com base no ID
    # Retorna True se a exclusão foi bem-sucedida
    @staticmethod
    def deletar_cliente(cliente_id: str) -> bool:
        try:
            result = get_clientes_collection().delete_one({"_id": ObjectId(cliente_id)})
            return result.deleted_count > 0
        except Exception as e:
            print(f"Erro ao deletar cliente: {e}")
            return False
