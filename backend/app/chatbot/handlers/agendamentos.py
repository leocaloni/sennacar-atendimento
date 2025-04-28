from datetime import datetime, timedelta, timezone
from app.models.agendamento import Agendamento
from app.models.cliente import Cliente
from app.google.calendario import GoogleCalendarService 

def iniciar_agendamento(chatbot_assistant):
    """Mantido igual ao seu original"""
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
        if chatbot_assistant.awaiting_scheduling_confirmation:
            if input_message.lower() in ['sim', 'confirmar']:
                if not chatbot_assistant.temp_agendamento_data:
                    return "❌ Dados do agendamento perdidos. Por favor, recomece."
                
                agendamento_data = chatbot_assistant.temp_agendamento_data
                produtos_nomes = [p['nome'] for p in chatbot_assistant.selected_products]
                
                # 1. Cria no MongoDB
                agendamento = Agendamento(
                    cliente_id=agendamento_data['cliente_id'],
                    data_agendada=agendamento_data['data'],
                    produtos=agendamento_data['produtos'],
                    status="confirmado"
                )
                
                agendamento_id = agendamento.criar_agendamento()
                
                if not agendamento_id:
                    return "❌ Não foi possível confirmar o agendamento."

                # 2. Sincroniza com Google Calendar (novo)
                try:
                    calendar = GoogleCalendarService()
                    event_data = {
                        "summary": f"Agendamento - {chatbot_assistant.client_data['nome']}",
                        "description": f"Produtos: {', '.join(produtos_nomes)}",
                        "start_time": agendamento_data['data'],
                        "end_time": agendamento_data['data'] + timedelta(hours=1)
                    }
                    google_event = calendar.create_event(event_data)
                    
                    if google_event:
                        # Atualiza MongoDB com ID do Google
                        Agendamento.atualizar_agendamento(
                            agendamento_id,
                            {"google_event_id": google_event["id"]}
                        )
                except Exception as e:
                    print(f"Erro Google Calendar (não crítico): {e}")

                # Limpa os estados
                chatbot_assistant.selected_products = []
                chatbot_assistant.awaiting_scheduling = False
                chatbot_assistant.awaiting_scheduling_confirmation = False
                chatbot_assistant.temp_agendamento_data = None
                
                return (f"✅ Agendamento confirmado!\n\n"
                       f"📅 Data: {agendamento_data['data'].strftime('%d/%m/%Y %H:%M')}\n"
                       f"🔧 Serviços: {', '.join(produtos_nomes)}\n"
                       f"📋 ID: {agendamento_id}\n\n"
                       "Obrigado por agendar conosco!")
            
            elif input_message.lower() == 'alterar data':
                chatbot_assistant.awaiting_scheduling_confirmation = False
                return "Por favor, informe a nova data (DD/MM/AAAA HH:MM):"
            
            else:
                chatbot_assistant.awaiting_scheduling_confirmation = False
                chatbot_assistant.temp_agendamento_data = None
                return "Agendamento não confirmado. Como posso ajudar?"
        
        # Processamento da data (mantido)
        data_agendada = datetime.strptime(input_message, "%d/%m/%Y %H:%M").replace(tzinfo=timezone.utc)  # Adicionado timezone
        
        if not chatbot_assistant.selected_products:
            return "❌ Nenhum produto selecionado. Por favor, recomece."
        
        cliente = Cliente(
            chatbot_assistant.client_data['nome'],
            chatbot_assistant.client_data['email'],
            chatbot_assistant.client_data['telefone']
        )
        cliente_db = cliente.buscar_por_telefone(cliente.telefone)
        
        if not cliente_db:
            return "❌ Cliente não encontrado. Por favor, cadastre-se primeiro."

        chatbot_assistant.temp_agendamento_data = {
            'cliente_id': str(cliente_db['_id']),
            'data': data_agendada,
            'produtos': [str(p['_id']) for p in chatbot_assistant.selected_products]
        }
        
        # Restante mantido igual
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