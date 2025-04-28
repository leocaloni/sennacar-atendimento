import os
import json
import random

import nltk
import numpy as np

import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset

import re
from app.models.cliente import Cliente
from app.models.produto import Produto
from app.models.agendamento import Agendamento
from app.chatbot.handlers import *
from datetime import datetime

class ChatbotModel(nn.Module):

    def __init__(self, input_size, output_size):
        super(ChatbotModel, self).__init__()

        self.fc1 = nn.Linear(input_size, 128)
        self.fc2 = nn.Linear(128, 64)
        self.fc3 = nn.Linear(64, output_size)
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(0.5)

    def forward(self, x):
        x = self.relu(self.fc1(x))
        x = self.dropout(x)
        x = self.relu(self.fc2(x))
        x = self.dropout(x)
        x = self.fc3(x)

        return x


class ChatbotAssistant:

    def __init__(self, intents_path, function_mappings = None):
        self.model = None
        self.intents_path = intents_path

        self.documents = []
        self.vocabulary = []
        self.intents = []
        self.intents_responses = {}

        self.function_mappings = function_mappings

        self.X = None
        self.y = None

        self.selected_date = []
        self.client_data = {"nome" : None, "email" : None,"telefone" : None}
        self.selected_products = []
        self.awaiting_more_products = False
        self.produtos_por_categoria = {} 
        self.produtos_por_categoria = {} 
        self.produtos_temp = None
        self.awaiting_product_selection = False
        self.current_category = None
        self.selected_product = None
        self.awaiting_confirmation = False 
        self.client_data_temp = None
        self.awaiting_scheduling = False
        self.awaiting_scheduling_confirmation = False
        self.awaiting_category_selection = False
        self.temp_agendamento_data = None

    @staticmethod
    def tokenize_and_lemmatize(text):
        lemmatizer = nltk.WordNetLemmatizer()

        words = nltk.word_tokenize(text)
        words = [lemmatizer.lemmatize(word.lower()) for word in words]

        return words

    def bag_of_words(self, words):
        return [1 if word in words else 0 for word in self.vocabulary]

    def parse_intents(self):
        lemmatizer = nltk.WordNetLemmatizer()

        if os.path.exists(self.intents_path):
            with open(self.intents_path, 'r', encoding="utf-8") as f:
                intents_data = json.load(f)

            for intent in intents_data['intents']:
                if intent['tag'] not in self.intents:
                    self.intents.append(intent['tag'])
                    self.intents_responses[intent['tag']] = intent['responses']

                for pattern in intent['patterns']:
                    pattern_words = self.tokenize_and_lemmatize(pattern)
                    self.vocabulary.extend(pattern_words)
                    self.documents.append((pattern_words, intent['tag']))

                self.vocabulary = sorted(set(self.vocabulary))

    def prepare_data(self):
        bags = []
        indices = []

        for document in self.documents:
            words = document[0]
            bag = self.bag_of_words(words)

            intent_index = self.intents.index(document[1])

            bags.append(bag)
            indices.append(intent_index)

        self.X = np.array(bags)
        self.y = np.array(indices)

    def train_model(self, batch_size, lr, epochs):
        X_tensor = torch.tensor(self.X, dtype=torch.float32)
        y_tensor = torch.tensor(self.y, dtype=torch.long)

        dataset = TensorDataset(X_tensor, y_tensor)
        loader = DataLoader(dataset, batch_size=batch_size, shuffle=True)

        self.model = ChatbotModel(self.X.shape[1], len(self.intents)) 

        criterion = nn.CrossEntropyLoss()
        optimizer = optim.Adam(self.model.parameters(), lr=lr)

        for epoch in range(epochs):
            running_loss = 0.0

            for batch_X, batch_y in loader:
                optimizer.zero_grad()
                outputs = self.model(batch_X)
                loss = criterion(outputs, batch_y)
                loss.backward()
                optimizer.step()
                running_loss += loss
            
            print(f"Epoch {epoch+1}: Loss: {running_loss / len(loader):.4f}")

    def save_model(self, model_path, dimensions_path):
        torch.save(self.model.state_dict(), model_path)

        with open(dimensions_path, 'w') as f:
            json.dump({ 'input_size': self.X.shape[1], 'output_size': len(self.intents) }, f)

    def load_model(self, model_path, dimensions_path):
        with open(dimensions_path, 'r') as f:
            dimensions = json.load(f)

        self.model = ChatbotModel(dimensions['input_size'], dimensions['output_size'])
        self.model.load_state_dict(torch.load(model_path, weights_only=True))

    def process_message(self, input_message):
        category_mapping = {
        'orcamento_insulfim': 'insulfim',
        'orcamento_multimidia': 'multimidia',
        'orcamento_ppf': 'ppf',
        'orcamento_som': 'som',
        'agendamento_insulfim': 'insulfim',
        'agendamento_multimidia': 'multimidia',
        'agendamento_som': 'som'
    }
            
        if self.awaiting_confirmation:
            return self._handle_confirmation(input_message)
        
        if self.awaiting_product_selection:
            return handle_product_selection(self, input_message)
        
        if self.awaiting_scheduling:
            return confirmar_agendamento(self, input_message)
        
        if self.awaiting_scheduling_confirmation:
            if input_message.lower() in ['sim', 's']:
                self.awaiting_scheduling = True
                self.awaiting_scheduling_confirmation = False
                return "📅 Por favor, informe a data e horário (DD/MM/AAAA HH:MM):"
            else:
                self.awaiting_scheduling_confirmation = False
                return "Agendamento cancelado. Como posso ajudar?"
                
        match = re.match(r"([a-zA-Z\s]+),\s*([\w\.-]+@[\w\.-]+\.\w+),\s*(\+?\d{1,3}?[-.\s]?\(?\d{1,4}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4})", input_message)
        if match:
            nome, email, telefone = match.groups()
            self.client_data_temp = {
                "nome": nome.strip(),
                "email": email.strip(),
                "telefone": telefone.strip()
            }
            self.awaiting_confirmation = True
            return self._generate_confirmation_message()

        words = self.tokenize_and_lemmatize(input_message)
        bag = self.bag_of_words(words)

        bag_tensor = torch.tensor([bag], dtype=torch.float32)

        self.model.eval()
        with torch.no_grad():
            predictions = self.model(bag_tensor)

        predicted_class_index = torch.argmax(predictions, dim=1).item()
        predicted_intent = self.intents[predicted_class_index]

        if predicted_intent == 'catalogo_completo':
            if "listar_todos_produtos" in self.function_mappings:
                return self.function_mappings["listar_todos_produtos"](self)
        elif predicted_intent in category_mapping:
            categoria = category_mapping[predicted_intent]
            if "listar_produtos" in self.function_mappings:
                return self.function_mappings["listar_produtos"](self, categoria)

        if predicted_intent in category_mapping:
            categoria = category_mapping[predicted_intent]
            if "listar_produtos" in self.function_mappings:
                return self.function_mappings["listar_produtos"](self, categoria)
            
        if self.function_mappings and predicted_intent in self.function_mappings:
            self.function_mappings[predicted_intent](self)

        if self.function_mappings:
            if predicted_intent in self.function_mappings:
                self.function_mappings[predicted_intent]()

        if self.intents_responses[predicted_intent]:
            return random.choice(self.intents_responses[predicted_intent])
        else:
            return "Desculpe, não entendi. Poderia reformular sua pergunta? Caso queira posso te transferir para um de nossos atendentes, é só digitar 'trasnferir' que eu já te transifiro!"
    
    def _generate_confirmation_message(self):
        return (
            "Por favor, confirme seus dados:\n"
            f"Nome: {self.client_data_temp['nome']}\n"
            f"Email: {self.client_data_temp['email']}\n"
            f"Telefone: {self.client_data_temp['telefone']}\n\n"
            "Digite 'dados corretos' para confirmar ou 'dados incorretos' para reenviar."
        )

    def _handle_confirmation(self, input_message):
        if input_message.lower() == 'dados corretos':
            self.client_data = self.client_data_temp
            self.client_data_temp = None
            self.awaiting_confirmation = False
            
            if "cadastrar_cliente" in self.function_mappings:
                success = self.function_mappings["cadastrar_cliente"](self)
                if success and self.selected_products:
                    self.awaiting_scheduling = True
                    return ("✅ Dados confirmados!\n\n"
                        "📅 Informe a data e horário (DD/MM/AAAA HH:MM):")
                elif success:
                    return "✅ Dados confirmados com sucesso!"
                return "⚠️ Dados confirmados (cliente já existia)"
            
        elif input_message.lower() == 'dados incorretos':
            self.client_data_temp = None
            self.awaiting_confirmation = False
            return "↩️ Por favor, reenvie seus dados: Nome, Email, Telefone"
        
        return "⚠️ Digite 'dados corretos' para confirmar ou 'dados incorretos' para corrigir"
    
if __name__ == '__main__':
    function_mappings = {
        "cadastrar_cliente": cadastrar_cliente,
        "listar_produtos": listar_produtos_por_categoria,  
        "listar_todos_produtos": listar_todos_produtos,    
        "iniciar_agendamento": iniciar_agendamento
    }
    assistant = ChatbotAssistant('app/chatbot/intents.json', function_mappings=function_mappings)
    assistant.parse_intents()
    assistant.prepare_data()
    assistant.train_model(batch_size=8, lr=0.001, epochs=100)

    assistant.save_model('chatbot_model.pth', 'dimensions.json')

    # assistant = ChatbotAssistant('intents.json', function_mappings = {'stocks': get_stocks})
    # assistant.parse_intents()
    # assistant.load_model('chatbot_model.pth', 'dimensions.json')

    while True:
        message = input('Enter your message:')

        if message == '/quit':
            break

        print(assistant.process_message(message))