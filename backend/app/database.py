from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")
db = client["sennacar_db"]

db["funcionarios"].create_index("email", unique=True)
db["agendamentos"].create_index("data_agendada", unique=True)
db["produtos"].create_index("nome")
db["clientes"].create_index("telefone", unique=True)


def get_funcionario_collection():
    return db["funcionarios"]


def get_clientes_collection():
    return db["clientes"]


def get_agendamentos_collection():
    return db["agendamentos"]


def get_produtos_collection():
    return db["produtos"]
