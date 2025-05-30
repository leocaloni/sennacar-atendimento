from app.models.produto import Produto


# Função que lista produtos de uma categoria específica para o chatbot
# Caso a operação seja cancelada, limpa os estados relacionados
# Se não for informada a categoria, tenta inferir a partir da mensagem do usuário
# Retorna uma mensagem com a lista de produtos e opções para o usuário
def listar_produtos_por_categoria(chatbot_assistant, categoria=None):
    if (
        hasattr(chatbot_assistant, "last_user_choice")
        and chatbot_assistant.last_user_choice.lower() == "cancelar tudo"
    ):
        chatbot_assistant.awaiting_product_selection = False
        chatbot_assistant.produtos_temp = None
        chatbot_assistant.current_category = None
        chatbot_assistant.selected_products = []
        return {
            "response": "Operação cancelada. Como posso ajudar?",
            "options": ["Agendar", "Ver serviços", "Tirar dúvida"],
        }

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

    resposta = "📋 LISTA DE PRODUTOS 📋\n\n"
    resposta += f"🔹 {categoria.upper()}:\n\n"

    for produto in produtos:
        resposta += f"{produto['nome']} - R${produto['preco']:.2f}"
        if produto.get("preco_mao_obra", 0) > 0:
            resposta += f" + R${produto['preco_mao_obra']:.2f} (instalação)"
        resposta += "\n"

    if (
        hasattr(chatbot_assistant, "selected_products")
        and chatbot_assistant.selected_products
    ):
        resposta += "\n\nVocê já tem produtos selecionados. Selecione uma opção:"
        options = [
            "Quero comprar",
            "Ver meus produtos",
            "Agendar instalação",
            "Cancelar tudo",
        ]
    else:
        resposta += "\n \n Gostaria de comprar algum desses produtos?"
        options = [
            "Quero comprar",
            "Ver outras categorias",
            "Cancelar tudo",
        ]

    chatbot_assistant.produtos_temp = produtos
    chatbot_assistant.current_category = categoria
    chatbot_assistant.awaiting_product_selection = True

    return {"response": resposta, "options": options}


# Função que permite o usuário selecionar um produto listado anteriormente
# Se o produto for selecionado, adiciona à lista de produtos escolhidos
# Mostra também um resumo dos produtos já selecionados e opções de próxima ação
def selecionar_produto(chatbot_assistant, produto=None):
    if (
        not hasattr(chatbot_assistant, "produtos_temp")
        or not chatbot_assistant.produtos_temp
    ):
        return "Por favor, primeiro liste os produtos de uma categoria."

    if produto == "Adicionar mais produtos":
        return {
            "response": "Escolha a categoria para adicionar mais produtos:",
            "options": ["Insulfilm", "Som", "Multimídia", "PPF"],
        }

    if produto is None:
        resposta = "Selecione o produto que deseja comprar:\n\n"
        produtos = [p["nome"] for p in chatbot_assistant.produtos_temp]
        return {"response": resposta, "options": produtos}

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
                "Agendar instalação",
                "Cancelar tudo",
            ],
        }

    return "Por favor, selecione um produto válido da lista."


# Função que exibe ao usuário todos os produtos que ele já selecionou
# Calcula o total de custo considerando preço e mão de obra
# Retorna uma mensagem resumida e opções de próximas ações
def ver_produtos_selecionados(chatbot_assistant):
    if (
        not hasattr(chatbot_assistant, "selected_products")
        or not chatbot_assistant.selected_products
    ):
        return {
            "response": "Você ainda não selecionou nenhum produto.",
            "options": ["Ver serviços", "Agendar", "Tirar dúvida"],
        }

    resposta = "📦 SEUS PRODUTOS SELECIONADOS:\n\n"
    total = 0

    for idx, produto in enumerate(chatbot_assistant.selected_products, 1):
        preco_total = produto["preco"] + produto.get("preco_mao_obra", 0)
        resposta += f"{idx}. {produto['nome']} - R${preco_total:.2f}\n"
        total += preco_total

    resposta += f"\n💰 TOTAL: R${total:.2f}\n\n"
    resposta += "O que deseja fazer agora?"

    return {
        "response": resposta,
        "options": [
            "Adicionar mais produtos",
            "Agendar instalação",
            "Cancelar tudo",
        ],
    }
