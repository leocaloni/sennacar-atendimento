from app.models.produto import Produto


def listar_todos_produtos(chatbot_assistant):
    """Lista todos os produtos agrupados por categoria"""
    categorias = ['insulfim', 'multimidia', 'som', 'ppf']
    resposta = "📋 Catálogo Completo de Produtos:\n\n"
    
    for categoria in categorias:
        produtos = Produto.listar_por_categoria(categoria)
        if produtos:
            resposta += f"🔹 {categoria.upper()}:\n"
            for idx, produto in enumerate(produtos, 1):
                resposta += f"   {idx}. {produto['nome']} - R${produto['preco']:.2f}"
                if produto.get('preco_mao_obra', 0) > 0:
                    resposta += f" + R${produto['preco_mao_obra']:.2f} (instalação)"
                resposta += "\n"
            resposta += "\n"
    
    chatbot_assistant.produtos_por_categoria = {
        cat: Produto.listar_por_categoria(cat) for cat in categorias
    }
    chatbot_assistant.awaiting_product_selection = True
    
    return resposta + "Digite o número do produto que deseja (ex: 1 para primeiro item) ou 'finalizar' para concluir:"

def listar_produtos_por_categoria(chatbot_assistant, categoria=None):
    """Lista produtos podendo alternar entre categorias"""
    if categoria:
        produtos = Produto.listar_por_categoria(categoria)
        resposta = f"🔹 {categoria.upper()}:\n\n"
    else:
        produtos = []
        resposta = "📋 Todos os Produtos:\n\n"
        for cat in ['insulfim', 'multimidia', 'som', 'ppf']:
            produtos.extend(Produto.listar_por_categoria(cat))
    
    for idx, produto in enumerate(produtos, 1):
        resposta += f"{idx}. {produto['nome']} - R${produto['preco']:.2f}"
        if produto.get('preco_mao_obra', 0) > 0:
            resposta += f" + R${produto['preco_mao_obra']:.2f} (instalação)"
        resposta += "\n"
    
    chatbot_assistant.produtos_temp = produtos
    chatbot_assistant.awaiting_product_selection = True
    
    resposta += "\n📌 Você pode:\n"
    resposta += "- Digitar o número de qualquer produto para adicionar\n"
    if categoria:
        resposta += "- Digite 'outros' para ver produtos de outras categorias\n"
    resposta += "- 'finalizar' para concluir a seleção\n"
    resposta += "- 'cancelar' para recomeçar"
    
    return resposta

def handle_product_selection(chatbot_assistant, input_message):
    if input_message.lower() == 'cancelar':
        chatbot_assistant.selected_products = []
        chatbot_assistant.awaiting_product_selection = False
        return "Operação cancelada. Como posso ajudar?"
    
    if input_message.lower() == 'finalizar':
        if not chatbot_assistant.selected_products:
            return "Nenhum produto selecionado. Por favor, escolha ao menos um produto."
        
        chatbot_assistant.awaiting_product_selection = False
        
        # Cria resumo
        resposta = "📋 Resumo dos Produtos Selecionados:\n\n"
        total = 0
        for idx, produto in enumerate(chatbot_assistant.selected_products, 1):
            preco_total = produto['preco'] + produto.get('preco_mao_obra', 0)
            resposta += f"{idx}. {produto['nome']} ({produto.get('categoria', '')}) - R${preco_total:.2f}\n"
            total += preco_total
        
        resposta += f"\n💳 Valor Total: R${total:.2f}\n\n"
        
        if all(chatbot_assistant.client_data.values()):
            resposta += "Deseja agendar a instalação? (sim/não)"
            chatbot_assistant.awaiting_scheduling_confirmation = True
        else:
            resposta += "Para agendar, preciso dos seus dados. Por favor, envie no formato: Nome, Email, Telefone"
        
        return resposta

    if input_message.lower() == 'outros':
        resposta = "📌 Escolha uma categoria:\n\n"
        categorias = ['insulfim', 'multimidia', 'som', 'ppf']
        for idx, cat in enumerate(categorias, 1):
            resposta += f"{idx}. {cat.upper()}\n"
        
        resposta += "\nDigite o número da categoria que deseja visualizar:"
        chatbot_assistant.awaiting_category_selection = True
        return resposta

    if hasattr(chatbot_assistant, 'awaiting_category_selection') and chatbot_assistant.awaiting_category_selection:
        try:
            selected_index = int(input_message) - 1
            categorias = ['insulfim', 'multimidia', 'som', 'ppf']
            if 0 <= selected_index < len(categorias):
                categoria = categorias[selected_index]
                chatbot_assistant.awaiting_category_selection = False
                return listar_produtos_por_categoria(chatbot_assistant, categoria)
            else:
                return "❌ Número inválido. Digite um número entre 1 e 4"
        except ValueError:
            return "❌ Por favor, digite um número válido (1-4)"

    try:
        selected_index = int(input_message) - 1
        if 0 <= selected_index < len(chatbot_assistant.produtos_temp):
            produto = chatbot_assistant.produtos_temp[selected_index]
            chatbot_assistant.selected_products.append(produto)
            
            resposta = f"✅ Adicionado: {produto['nome']}\n\n"
            resposta += "📦 Produtos selecionados até agora:\n"
            for idx, p in enumerate(chatbot_assistant.selected_products, 1):
                resposta += f"{idx}. {p['nome']} ({p.get('categoria', '')})\n"
            
            resposta += "\n📌 Você pode:\n"
            resposta += "- Digitar outro número para adicionar mais produtos desta categoria\n"
            resposta += "- Digitar 'outros' para ver outras categorias\n"
            resposta += "- 'finalizar' para concluir\n"
            resposta += "- 'cancelar' para recomeçar"
            
            return resposta
        else:
            return f"❌ Número inválido. Digite entre 1-{len(chatbot_assistant.produtos_temp)}, 'outros', 'finalizar' ou 'cancelar'"
    
    except ValueError:
        return "❌ Opção inválida. Digite um número, 'outros', 'finalizar' ou 'cancelar'"
    