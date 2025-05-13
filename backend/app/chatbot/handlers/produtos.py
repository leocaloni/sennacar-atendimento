from app.models.produto import Produto


def listar_produtos_por_categoria(chatbot_assistant, categoria=None):
    # Verifica cancelamento
    if (
        hasattr(chatbot_assistant, "last_user_choice")
        and chatbot_assistant.last_user_choice.lower() == "cancelar"
    ):
        chatbot_assistant.awaiting_product_selection = False
        chatbot_assistant.produtos_temp = None
        chatbot_assistant.current_category = None
        chatbot_assistant.selected_products = []
        return {
            "response": "Operação cancelada. Como posso ajudar?",
            "options": ["Agendar", "Ver serviços", "Tirar dúvida"],
        }

    # Se o usuário escolheu "Continuar comprando" ou "Adicionar mais produtos"
    if (
        hasattr(chatbot_assistant, "last_user_choice")
        and chatbot_assistant.last_user_choice
        in ["Continuar comprando", "Adicionar mais produtos"]
        and not categoria
    ):
        return {
            "response": "Escolha a categoria para adicionar mais produtos:",
            "options": ["Insulfilm", "Som", "Multimídia", "PPF"],
        }

    # Lógica para determinar a categoria
    if not categoria:
        message = getattr(chatbot_assistant, "current_message", "").lower()
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

    # Mostra produtos
    resposta = "📋 LISTA DE PRODUTOS 📋\n\n"
    resposta += f"🔹 {categoria.upper()}:\n\n"

    for produto in produtos:
        resposta += f"{produto['nome']} - R${produto['preco']:.2f}"
        if produto.get("preco_mao_obra", 0) > 0:
            resposta += f" + R${produto['preco_mao_obra']:.2f} (instalação)"
        resposta += "\n"

    # Opções baseadas no estado atual
    if (
        hasattr(chatbot_assistant, "selected_products")
        and chatbot_assistant.selected_products
    ):
        resposta += "\n\nVocê já tem produtos selecionados. Selecione uma opção:"
        options = [
            "Quero comprar",  # Para adicionar produtos desta categoria
            "Ver meus produtos",
            "Agendar instalação",
            "Cancelar",
        ]
    else:
        resposta += "\n \n Gostaria de comprar algum desses produtos?"
        options = [
            "Quero comprar",
            "Ver outras categorias",
            "Cancelar",
        ]

    chatbot_assistant.produtos_temp = produtos
    chatbot_assistant.current_category = categoria
    chatbot_assistant.awaiting_product_selection = True

    return {"response": resposta, "options": options}


def selecionar_produto(chatbot_assistant, produto=None):
    if (
        not hasattr(chatbot_assistant, "produtos_temp")
        or not chatbot_assistant.produtos_temp
    ):
        return "Por favor, primeiro liste os produtos de uma categoria."

    # Se o usuário clicou em "Adicionar mais produtos"
    if produto == "Adicionar mais produtos":
        return {
            "response": "Escolha a categoria para adicionar mais produtos:",
            "options": ["Insulfilm", "Som", "Multimídia", "PPF"],
        }

    # Se o usuário clicou em "Quero comprar" (sem produto específico)
    if produto is None:
        resposta = "Selecione o produto que deseja comprar:\n\n"
        produtos = [p["nome"] for p in chatbot_assistant.produtos_temp]
        return {"response": resposta, "options": produtos}

    # Se o usuário selecionou um produto específico
    produto_selecionado = next(
        (p for p in chatbot_assistant.produtos_temp if p["nome"] == produto), None
    )

    if produto_selecionado:
        chatbot_assistant.selected_products.append(produto_selecionado)
        resposta = (
            f"✅ Produto adicionado:\n"
            f"{produto_selecionado['nome']} - R${produto_selecionado['preco']:.2f}"
        )

        if produto_selecionado.get("preco_mao_obra", 0) > 0:
            resposta += (
                f" + R${produto_selecionado['preco_mao_obra']:.2f} (instalação)\n\n"
            )

        # Mostra resumo dos produtos selecionados
        if len(chatbot_assistant.selected_products) > 1:
            resposta += "\n📦 Seus produtos selecionados:\n"
            total = 0
            for idx, p in enumerate(chatbot_assistant.selected_products, 1):
                preco_total = p["preco"] + p.get("preco_mao_obra", 0)
                resposta += f"{idx}. {p['nome']} - R${preco_total:.2f}\n"
                total += preco_total
            resposta += f"\n💰 Total: R${total:.2f}\n\n"

        resposta += "O que deseja fazer agora?"

        return {
            "response": resposta,
            "options": [
                "Adicionar mais produtos",
                "Ver meus produtos",
                "Agendar instalação",
                "Cancelar",
            ],
        }

    return "Por favor, selecione um produto válido da lista."
