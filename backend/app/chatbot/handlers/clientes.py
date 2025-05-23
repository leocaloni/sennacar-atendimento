from app.models.cliente import Cliente


def cadastrar_cliente(chatbot_assistant):
    nome = chatbot_assistant.client_data["nome"]
    email = chatbot_assistant.client_data["email"]
    telefone = chatbot_assistant.client_data["telefone"]

    if not all([nome, email, telefone]):
        print("Dados do cliente incompletos!")
        return False

    try:
        cliente = Cliente(nome, email, telefone)
        cliente_existente = cliente.buscar_por_telefone(telefone)

        if cliente_existente:
            print(f"Cliente encontrado (ID: {cliente_existente['_id']})")
            # Atualiza os dados do cliente existente se necessário
            cliente.atualizar_cliente(
                str(cliente_existente["_id"]), {"nome": nome, "email": email}
            )
            return "existente"  # Retorna um status diferente para cliente existente

        cliente_id = cliente.cadastrar_cliente()

        if cliente_id:
            print(f"Cliente {nome} cadastrado com sucesso! ID: {cliente_id}")
            return "novo"  # Retorna status para novo cliente
        return False

    except Exception as e:
        print(f"Erro ao processar cliente: {e}")
        return False
