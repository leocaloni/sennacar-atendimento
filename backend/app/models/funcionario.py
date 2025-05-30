from app.database import get_funcionario_collection
from bcrypt import hashpw, gensalt, checkpw
from typing import Optional, Dict, List
from bson import ObjectId


class Funcionario:
    def __init__(self, nome: str, email: str, senha: str, is_admin: bool = False):
        self.nome = nome
        self.email = email
        self.senha = senha
        self.is_admin = is_admin

    # Cadastra um novo funcionário
    # - Verifica se o email já está cadastrado
    # - Criptografa a senha com bcrypt
    # - Retorna o ID do funcionário ou None se já existir
    def cadastrar_funcionario(self) -> Optional[str]:
        try:
            funcionario_collection = get_funcionario_collection()

            if funcionario_collection.find_one({"email": self.email}):
                print("Email já cadastrado")
                return None

            hashed_senha = hashpw(self.senha.encode("utf-8"), gensalt())

            funcionario_id = funcionario_collection.insert_one(
                {
                    "nome": self.nome,
                    "email": self.email,
                    "senha": hashed_senha,
                    "isAdmin": self.is_admin,
                }
            ).inserted_id

            print(f"Funcionário cadastrado com sucesso. ID: {funcionario_id}")
            return str(funcionario_id)

        except Exception as e:
            print(f"Erro ao cadastrar funcionário: {e}")
            return None

    # Busca um funcionário pelo ID
    # Retorna o documento correspondente ou None
    @staticmethod
    def buscar_por_id(funcionario_id: str) -> Optional[Dict]:
        try:
            funcionario_id_obj = ObjectId(funcionario_id)
            funcionario = get_funcionario_collection().find_one(
                {"_id": funcionario_id_obj}
            )
            return funcionario if funcionario else None
        except Exception as e:
            print(f"Erro ao buscar funcionário: {e}")
            return None

    # Obtém um funcionário pelo ID (mesma funcionalidade de buscar_por_id)
    # Mantido por compatibilidade ou nomenclatura
    @staticmethod
    def obter_funcionario_por_id(funcionario_id: str) -> Optional[Dict]:
        try:
            funcionario_id_obj = ObjectId(funcionario_id)
            return get_funcionario_collection().find_one({"_id": funcionario_id_obj})
        except Exception as e:
            print(f"Erro ao buscar funcionário por id: {e}")
            return None

    # Busca um funcionário pelo email
    # Retorna o documento correspondente ou None
    @staticmethod
    def buscar_por_email(email: str) -> Optional[Dict]:
        try:
            return get_funcionario_collection().find_one({"email": email})
        except Exception as e:
            print(f"Erro ao buscar funcionário por email: {e}")
            return None

    # Lista funcionários cujo nome corresponde parcialmente ao texto informado
    # Apenas funcionários não administradores são listados
    @staticmethod
    def listar_por_nome_regex(texto: str) -> List[Dict]:
        regex = {"$regex": f".*{texto}.*", "$options": "i"}
        return list(
            get_funcionario_collection()
            .find({"nome": regex, "isAdmin": False})
            .limit(10)
        )

    # Lista funcionários cujo email corresponde parcialmente ao texto informado
    # Apenas funcionários não administradores são listados
    @staticmethod
    def listar_por_email_regex(texto: str) -> List[Dict]:
        regex = {"$regex": f".*{texto}.*", "$options": "i"}
        return list(
            get_funcionario_collection()
            .find({"email": regex, "isAdmin": False})
            .limit(10)
        )

    # Lista todos os funcionários cadastrados que não são administradores
    @staticmethod
    def listar_todos() -> List[Dict]:
        try:
            return list(get_funcionario_collection().find({"isAdmin": False}))
        except Exception as e:
            print(f"Erro ao listar funcionários: {e}")
            return []

    # Atualiza os dados de um funcionário com base no ID
    # Retorna True se a atualização foi realizada com sucesso
    @staticmethod
    def atualizar_funcionario(funcionario_id: str, dados_atualizacao: Dict) -> bool:
        try:
            result = get_funcionario_collection().update_one(
                {"_id": ObjectId(funcionario_id)}, {"$set": dados_atualizacao}
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Erro ao atualizar funcionário: {e}")
            return False

    # Deleta um funcionário com base no ID
    # Retorna True se a exclusão foi bem-sucedida
    @staticmethod
    def deletar_funcionario(funcionario_id: str) -> bool:
        try:
            result = get_funcionario_collection().delete_one(
                {"_id": ObjectId(funcionario_id)}
            )
            return result.deleted_count > 0
        except Exception as e:
            print(f"Erro ao deletar funcionário: {e}")
            return False

    # Verifica se a senha informada corresponde à senha criptografada armazenada
    # Utiliza bcrypt para comparação
    @staticmethod
    def verificar_senha(senha_criptografada: bytes, senha: str) -> bool:
        try:
            return checkpw(senha.encode("utf-8"), senha_criptografada)
        except Exception as e:
            print(f"Erro ao verificar senha: {e}")
            return False
