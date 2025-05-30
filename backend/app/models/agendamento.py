from app.database import get_agendamentos_collection
from bson import ObjectId
from datetime import datetime, timedelta
from typing import Optional, Dict, List
from app.models.produto import Produto
from app.google.calendario import GoogleCalendarService


class Agendamento:
    def __init__(
        self,
        cliente_id: str,
        data_agendada: datetime,
        produtos: List[str] = [],
        status: str = "pendente",
        observacoes: str = "",
        valor_total: float = 0.0,
    ):
        self.cliente_id = cliente_id
        self.data_agendada = data_agendada
        self.produtos = produtos
        self.status = status
        self.observacoes = observacoes
        self.valor_total = valor_total

    # Cria um novo agendamento
    # - Verifica disponibilidade de horário
    # - Calcula valor total dos produtos
    # - Cria evento no Google Calendar
    # - Salva o agendamento no banco de dados
    def criar_agendamento(self) -> Optional[str]:
        try:
            agendamentos_col = get_agendamentos_collection()

            if agendamentos_col.find_one(
                {
                    "data_agendada": self.data_agendada,
                    "status": {"$in": ["pendente", "confirmado"]},
                }
            ):
                print("Horário já ocupado")
                return None

            valor_total = Produto.calcular_valor_total(self.produtos)

            from app.models.cliente import Cliente

            cliente = Cliente.buscar_por_id(self.cliente_id)
            nome_cliente = cliente["nome"] if cliente else "Cliente"

            nomes_produtos = []
            for pid in self.produtos:
                produto = Produto.buscar_por_id(pid)
                if produto:
                    nomes_produtos.append(produto["nome"])

            google_service = GoogleCalendarService()
            start_time = self.data_agendada
            end_time = start_time + timedelta(minutes=30)
            event = google_service.create_event(
                {
                    "summary": f"Agendamento - {nome_cliente}",
                    "description": f"Produtos: {', '.join(nomes_produtos)}",
                    "start_time": start_time,
                    "end_time": end_time,
                }
            )
            google_event_id = event.get("id") if event else None

            agendamento_id = agendamentos_col.insert_one(
                {
                    "cliente_id": self.cliente_id,
                    "data_agendada": self.data_agendada,
                    "produtos": self.produtos,
                    "valor_total": valor_total,
                    "status": self.status,
                    "observacoes": self.observacoes,
                    "google_event_id": google_event_id,
                    "criado_em": datetime.now(),
                }
            ).inserted_id

            print(
                f"Agendamento criado | Cliente: {nome_cliente} | Total: R${valor_total:.2f} | ID: {agendamento_id}"
            )
            return str(agendamento_id)

        except Exception as e:
            print(f"Erro ao criar agendamento: {str(e)}")
            return None

    # Busca um agendamento pelo ID
    # Retorna um dicionário com os dados ou None se não encontrado
    @staticmethod
    def buscar_por_id(agendamento_id: str) -> Optional[Dict]:
        try:
            return get_agendamentos_collection().find_one(
                {"_id": ObjectId(agendamento_id)}
            )
        except Exception as e:
            print(f"Erro ao buscar agendamento: {str(e)}")
            return None

    # Retorna todos os agendamentos de um cliente, ordenados pela data mais recente
    @staticmethod
    def buscar_por_cliente(cliente_id: str) -> List[Dict]:
        try:
            return list(
                get_agendamentos_collection().find(
                    {"cliente_id": cliente_id}, sort=[("data_agendada", -1)]
                )
            )
        except Exception as e:
            print(f"Erro ao buscar agendamentos: {str(e)}")
            return []

    # Busca agendamentos dentro de um intervalo de datas
    # Pode filtrar também pelo status se informado
    @staticmethod
    def buscar_por_periodo(
        data_inicio: datetime, data_fim: datetime, status: Optional[str] = None
    ) -> List[Dict]:
        try:
            query = {"data_agendada": {"$gte": data_inicio, "$lte": data_fim}}
            if status:
                query["status"] = status

            return list(
                get_agendamentos_collection().find(query, sort=[("data_agendada", 1)])
            )
        except Exception as e:
            print(f"Erro ao filtrar agendamentos: {str(e)}")
            return []

    # Lista todos os agendamentos cadastrados no banco
    @staticmethod
    def listar_todos() -> List[Dict]:
        try:
            return list(get_agendamentos_collection().find({}))
        except Exception as e:
            print(f"Erro ao listar agendamentos: {e}")
            return []

    # Atualiza os dados de um agendamento com base no ID
    # Retorna True se houve modificação, False caso contrário
    @staticmethod
    def atualizar_agendamento(agendamento_id: str, dados: dict) -> bool:
        try:
            result = get_agendamentos_collection().update_one(
                {"_id": ObjectId(agendamento_id)}, {"$set": dados}
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Erro ao atualizar agendamento: {str(e)}")
            return False

    # Atualiza a lista de produtos e o valor total de um agendamento
    # Retorna True se a atualização foi realizada com sucesso
    @staticmethod
    def atualizar_produtos(agendamento_id: str, novos_produtos: List[str]) -> bool:
        try:
            valor_total = Produto.calcular_valor_total(novos_produtos)
            result = get_agendamentos_collection().update_one(
                {"_id": ObjectId(agendamento_id)},
                {"$set": {"produtos": novos_produtos, "valor_total": valor_total}},
            )
            if result.modified_count > 0:
                print(f"Atualizado | Novo total: R${valor_total:.2f}")
                return True
            return False
        except Exception as e:
            print(f"Erro: {str(e)}")
            return False

    # Atualiza o status de um agendamento (ex.: de 'pendente' para 'confirmado')
    # Retorna True se a alteração foi feita
    @staticmethod
    def atualizar_status(agendamento_id: str, novo_status: str) -> bool:
        try:
            result = get_agendamentos_collection().update_one(
                {"_id": ObjectId(agendamento_id)}, {"$set": {"status": novo_status}}
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Erro ao atualizar status: {str(e)}")
            return False

    # Deleta um agendamento com base no ID
    # Retorna True se o agendamento foi excluído
    @staticmethod
    def deletar_agendamento(agendamento_id: str) -> bool:
        try:
            result = get_agendamentos_collection().delete_one(
                {"_id": ObjectId(agendamento_id)}
            )
            return result.deleted_count > 0
        except Exception as e:
            print(f"Erro ao deletar agendamento: {str(e)}")
            return False
