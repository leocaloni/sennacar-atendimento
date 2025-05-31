import pytest
from app.chatbot.chatbot import ChatbotAssistant

@pytest.fixture
def assistant():
    def fake_cadastrar_cliente(instance):
        # Simula o sucesso no cadastro
        return True

    mappings = {
        "cadastrar_cliente": fake_cadastrar_cliente
    }

    bot = ChatbotAssistant("tests/mocks/intents_mock.json", function_mappings=mappings)
    bot.intents = ["greeting"]  # Simples para não precisar de rede neural
    bot.vocabulary = []
    bot.model = None  # Não vamos usar a rede neste teste

    return bot

def test_fluxo_cadastro_valido(assistant):
    entrada = "João Silva, joao@email.com, 11999999999"
    resposta = assistant.process_message(entrada)

    assert "confirme seus dados" in resposta
    assert assistant.awaiting_confirmation is True

def test_confirma_dados_e_cadastra_cliente(assistant):
    # Simular estado após envio dos dados
    assistant.client_data_temp = {
        "nome": "João Silva",
        "email": "joao@email.com",
        "telefone": "11999999999"
    }
    assistant.awaiting_confirmation = True

    resposta = assistant.process_message("dados corretos")

    assert "✅ Dados confirmados" in resposta
    assert assistant.awaiting_confirmation is False
    assert assistant.client_data["nome"] == "João Silva"

def test_dados_incorretos_reinicia_fluxo(assistant):
    assistant.awaiting_confirmation = True
    resposta = assistant.process_message("dados incorretos")

    assert "reenvie seus dados" in resposta
    assert assistant.client_data_temp is None
    assert assistant.awaiting_confirmation is False
