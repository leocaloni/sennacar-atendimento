from app.models.cliente import Cliente


# Função responsável por cadastrar ou atualizar um cliente no sistema
# Se o cliente já existir (baseado no telefone), atualiza os dados
# Caso contrário, cria um novo cliente no banco
# Retorna "existente", "novo" ou False conforme o resultado da operaçãos
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
            cliente.atualizar_cliente(
                str(cliente_existente["_id"]), {"nome": nome, "email": email}
            )
            return "existente"

        cliente_id = cliente.cadastrar_cliente()

        if cliente_id:
            print(f"Cliente {nome} cadastrado com sucesso! ID: {cliente_id}")
            return "novo"
        return False

    except Exception as e:
        print(f"Erro ao processar cliente: {e}")
        return False
