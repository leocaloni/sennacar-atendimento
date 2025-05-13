from app.models.produto import Produto


def listar_produtos_por_categoria(chatbot_assistant, categoria=None):
    if not categoria:
        message = getattr(chatbot_assistant, 'current_message', '').lower()
        if "insulfilm" in message or "insulfim" in message:
            categoria = "insulfilm"
        elif "som" in message or "caixa" in message:
            categoria = "som"
        elif "multimídia" in message or "multimidia" in message:
            categoria = "multimidia"
    
    if not categoria:
        return "Por favor, especifique qual categoria de produtos deseja ver: insulfilm, ppf, som ou multimídia."

    produtos = Produto.listar_por_categoria(categoria)
    
    if not produtos:
        return f"Não encontrei produtos na categoria {categoria}. Deseja ver outra categoria?"
    
    # Sempre mostra a lista completa primeiro
    resposta = "📋 LISTA DE PRODUTOS 📋\n\n"
    resposta += f"🔹 {categoria.upper()}:\n\n"
    
    for produto in produtos:
        resposta += f"{produto['nome']} - R${produto['preco']:.2f}"
        if produto.get('preco_mao_obra', 0) > 0:
            resposta += f" + R${produto['preco_mao_obra']:.2f} (instalação)"
        resposta += "\n"
    
    resposta += "\n \n Gostaria de comprar algum desses produtos? \n Ou gostaria de ver outra categoria?"

    chatbot_assistant.produtos_temp = produtos
    chatbot_assistant.current_category = categoria
    chatbot_assistant.awaiting_product_selection = True
    
    return resposta