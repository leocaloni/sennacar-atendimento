from .clientes import cadastrar_cliente
from .produtos import (
    listar_todos_produtos,
    listar_produtos_por_categoria,
    handle_product_selection
)
from .agendamentos import (
    iniciar_agendamento,
    confirmar_agendamento
)

__all__ = [
    'cadastrar_cliente',
    'listar_todos_produtos',
    'listar_produtos_por_categoria',
    'handle_product_selection',
    'iniciar_agendamento',
    'confirmar_agendamento'
]