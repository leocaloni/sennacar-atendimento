# SennaCar – Site + Sistema de Agendamentos com Chatbot

Este é um sistema completo desenvolvido para a **SennaCar**, composto por um site institucional que possui um **chatbot inteligente** para atendimento ao cliente e **aplicativo mobile para funcionários**. O foco é facilitar a comunicação com o cliente, oferecer produtos e permitir agendamentos de instalações de forma automatizada.

---

## 🧠 Funcionalidades Principais

### 🌐 Site Institucional + ChatBot
- Página com informações da loja.
- Página dedicada com o **ChatBot interativo**.
- O ChatBot é capaz de:
  - Responder dúvidas frequentes sobre a loja.
  - Exibir produtos por categoria.
  - Simular um carrinho com múltiplos itens.
  - Agendar instalações com o cliente, mostrando horários disponíveis.
  - Cadastrar ou atualizar os dados do cliente no banco.


---

### 📱 Aplicativo Mobile para Funcionários
- Login para funcionários.
- Consultar perfil de clientes.
- Ver, adicionar e cancelar agendamentos.

### 🔐 Painel Admin
- Administradores podem:
  - Gerenciar produtos, agendamentos, funcionários e clientes (**CRUD completo**).

---

## 🧰 Tecnologias e Bibliotecas Utilizadas

### Backend (Python)
- **FastAPI** – Framework principal para API.
- **Uvicorn** – Servidor ASGI.
- **Pymongo / Motor** – Acesso assíncrono ao MongoDB.
- **Python-Jose / Passlib / Bcrypt** – Autenticação e segurança.
- **python-dotenv** – Gerenciamento de variáveis de ambiente.
- **Pytz** – Suporte a fusos horários.
- **Torch / Numpy / NLTK** – Treinamento e execução do modelo do chatbot.
- **Google API Client / google-auth** – Integração com Google Calendar para agendamentos.

### Frontend Web
- **React** - Para construção da interface
- **Vite** - Ambiente de desenvolvimento rápido
- **React Router** - Navegação entre páginas
- **React Icons** - Ícones modernos

### Mobile
- **React Native** - Desenvolvimento multiplataforma
- **Expo** - Ferramentas para desenvolvimento mobile
- **React Navigation** - Navegação no app


---

## 🚀 Como Rodar o Projeto

### Pré-requisitos
- Python 3.10+ (backend)
- Node.js 18+ (frontend)
- MongoDB rodando localmente ou em nuvem
- Expo CLI instalado globalmente (para mobile)
  
### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
pip install -r requirements.txt
uvicorn main:app --reload
uvicorn main:app --reload
```
### Frontend Web
```bash
cd web
npm install
npm run dev
```

### Frontend Mobile (Android/iOS)
```bash
cd mobile
npm install
expo start
# Escanear o QR code com o app Expo Go
```
