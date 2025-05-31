from app.chatbot.chatbot_assistant import ChatbotAssistant

def test_dados_do_cliente_validos():
    assistant = ChatbotAssistant("fake_path.json")
    assistant.function_mappings = {"cadastrar_cliente": lambda self: True}
    assistant.client_data_temp = {
        "nome": "João",
        "email": "joao@email.com",
        "telefone": "+55 11999999999"
    }
    assistant.awaiting_confirmation = True

    resposta = assistant.process_message("dados corretos")
    assert "✅ Dados confirmados" in resposta
