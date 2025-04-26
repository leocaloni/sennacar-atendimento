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

    def cadastrar_funcionario(self) -> Optional[str]:
        try:
            funcionario_collection = get_funcionario_collection()
            
            if funcionario_collection.find_one({"email": self.email}):
                print("Email já cadastrado")
                return None
            
            hashed_senha = hashpw(self.senha.encode('utf-8'), gensalt())
            
            funcionario_id = funcionario_collection.insert_one({
                "nome": self.nome,
                "email": self.email,
                "senha": hashed_senha,
                "isAdmin": self.is_admin
            }).inserted_id

            print(f"Funcionário cadastrado com sucesso. ID: {funcionario_id}")
            return str(funcionario_id)
            
        except Exception as e:
            print(f"Erro ao cadastrar funcionário: {e}")
            return None

    @staticmethod
    def buscar_por_id(funcionario_id: str) -> Optional[Dict]:
        try:
            funcionario = get_funcionario_collection().find_one(
                {"_id": ObjectId(funcionario_id)}
            )
            return funcionario if funcionario else None
        except Exception as e:
            print(f"Erro ao buscar funcionário: {e}")
            return None

    @staticmethod
    def buscar_por_email(email: str) -> Optional[Dict]:
        try:
            return get_funcionario_collection().find_one({"email": email})
        except Exception as e:
            print(f"Erro ao buscar funcionário por email: {e}")
            return None

    @staticmethod
    def listar_todos() -> List[Dict]:
        try:
            return list(get_funcionario_collection().find({}))
        except Exception as e:
            print(f"Erro ao listar funcionários: {e}")
            return []

    @staticmethod
    def atualizar_funcionario(
        funcionario_id: str, 
        dados_atualizacao: Dict
    ) -> bool:
        try:
            result = get_funcionario_collection().update_one(
                {"_id": ObjectId(funcionario_id)},
                {"$set": dados_atualizacao}
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Erro ao atualizar funcionário: {e}")
            return False

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

    @staticmethod
    def verificar_senha(senha_criptografada: bytes, senha: str) -> bool:
        try:
            return checkpw(senha.encode('utf-8'), senha_criptografada)
        except Exception as e:
            print(f"Erro ao verificar senha: {e}")
            return False