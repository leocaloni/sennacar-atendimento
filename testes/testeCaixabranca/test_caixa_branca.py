from app.chatbot.chatbot_assistant import ChatbotAssistant

def test_bag_of_words():
    assistant = ChatbotAssistant("fake_path.json")
    assistant.vocabulary = ["oi", "tchau", "comprar"]
    entrada = ["oi", "comprar"]

    resultado = assistant.bag_of_words(entrada)
    assert resultado == [1, 0, 1]
