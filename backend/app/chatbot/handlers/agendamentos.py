from datetime import datetime

from app.models.agendamento import Agendamento
from app.models.cliente import Cliente


def iniciar_agendamento(chatbot_assistant):
    if not chatbot_assistant.selected_product:
        return "Nenhum produto selecionado. Por favor, selecione um produto primeiro."
    
    if not chatbot_assistant.client_data.get('nome'):
        return ("Para agendar, preciso dos seus dados. "
                "Por favor, envie no formato: Nome, Email, Telefone")
    
    return ("Vamos agendar! Por favor, informe a data e horário desejados "
            "(formato: DD/MM/AAAA HH:MM):")

def confirmar_agendamento(chatbot_assistant, input_message):
    if input_message.lower() == 'cancelar':
        chatbot_assistant.awaiting_scheduling = False
        chatbot_assistant.temp_agendamento_data = None
        return "Agendamento cancelado. Como posso ajudar?"
    
    try:
        # Primeiro verifica se é confirmação
        if chatbot_assistant.awaiting_scheduling_confirmation:
            if input_message.lower() in ['sim', 'confirmar']:
                if not chatbot_assistant.temp_agendamento_data:
                    return "❌ Dados do agendamento perdidos. Por favor, recomece."
                
                # Guarda os dados em variáveis locais antes de limpar
                agendamento_data = chatbot_assistant.temp_agendamento_data
                produtos_nomes = [p['nome'] for p in chatbot_assistant.selected_products]
                
                # Cria o agendamento
                agendamento = Agendamento(
                    cliente_id=agendamento_data['cliente_id'],
                    data_agendada=agendamento_data['data'],
                    produtos=agendamento_data['produtos'],
                    status="confirmado"
                )
                
                agendamento_id = agendamento.criar_agendamento()
                
                # Limpa os estados
                chatbot_assistant.selected_products = []
                chatbot_assistant.awaiting_scheduling = False
                chatbot_assistant.awaiting_scheduling_confirmation = False
                chatbot_assistant.temp_agendamento_data = None
                
                if agendamento_id:
                    return (f"✅ Agendamento confirmado!\n\n"
                           f"📅 Data: {agendamento_data['data'].strftime('%d/%m/%Y %H:%M')}\n"
                           f"🔧 Serviços: {', '.join(produtos_nomes)}\n"
                           f"📋 ID: {agendamento_id}\n\n"
                           "Obrigado por agendar conosco!")
                return "❌ Não foi possível confirmar o agendamento."
            
            elif input_message.lower() == 'alterar data':
                chatbot_assistant.awaiting_scheduling_confirmation = False
                return "Por favor, informe a nova data (DD/MM/AAAA HH:MM):"
            
            else:
                chatbot_assistant.awaiting_scheduling_confirmation = False
                chatbot_assistant.temp_agendamento_data = None
                return "Agendamento não confirmado. Como posso ajudar?"
        
        # Processamento da data
        data_agendada = datetime.strptime(input_message, "%d/%m/%Y %H:%M")
        
        # Verifica dados necessários
        if not chatbot_assistant.selected_products:
            return "❌ Nenhum produto selecionado. Por favor, recomece."
        
        # Busca o cliente
        cliente = Cliente(
            chatbot_assistant.client_data['nome'],
            chatbot_assistant.client_data['email'],
            chatbot_assistant.client_data['telefone']
        )
        cliente_db = cliente.buscar_por_telefone(cliente.telefone)
        
        if not cliente_db:
            return "❌ Cliente não encontrado. Por favor, cadastre-se primeiro."

        # Prepara dados para confirmação
        chatbot_assistant.temp_agendamento_data = {
            'cliente_id': str(cliente_db['_id']),
            'data': data_agendada,
            'produtos': [str(p['_id']) for p in chatbot_assistant.selected_products]
        }
        
        # Prepara resumo
        resposta = "📋 Confirme o agendamento:\n\n"
        resposta += f"📅 Data: {data_agendada.strftime('%d/%m/%Y %H:%M')}\n"
        resposta += "🔧 Serviços:\n"
        for p in chatbot_assistant.selected_products:
            resposta += f"- {p['nome']} ({p.get('categoria', '')})\n"
        
        total = sum(p['preco'] + p.get('preco_mao_obra', 0) for p in chatbot_assistant.selected_products)
        resposta += f"\n💳 Valor Total: R${total:.2f}\n\n"
        resposta += "Digite:\n- 'confirmar' para finalizar\n- 'cancelar' para abortar\n- 'alterar data' para corrigir"
        
        chatbot_assistant.awaiting_scheduling_confirmation = True
        return resposta
    
    except ValueError:
        return "❌ Formato inválido. Use DD/MM/AAAA HH:MM ou comandos ('confirmar', 'cancelar', 'alterar data')"
