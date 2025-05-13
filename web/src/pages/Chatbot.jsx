import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

import chatbotimagem from "../assets/chatbot.jpg";
import telefone from "../assets/telefone-preto.svg";
import whatsapp from "../assets/whatsapp-preto.svg";
import enviar from "../assets/enviar.svg";

import "./Chatbot.css";

function Chatbot() {
  const [messages, setMessages] = useState([
    {
      text: "Bem vindo(a) à SennaCar, como posso te ajudar hoje?",
      sender: "bot",
      options: ["Agendar", "Ver serviços", "Tirar dúvida"],
    },
  ]);

  const exibirFormulario = messages.some(
    (message) =>
      message.sender == "bot" &&
      message.text.toLowerCase().includes("coplete com seus dados")
  );

  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const sendMessageToServer = async (message) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/chatbot/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      return await response.json();
    } catch (error) {
      console.error("Erro:", error);
      return {
        response:
          "Serviço indisponível no momento. Por favor, tente novamente mais tarde ou entre em contato diretamente pelo WhatsApp.",
        options: null,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const chatMessagesRef = useRef(null);
  const scrollToBottom = () => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTo({
        top: chatMessagesRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputValue.trim() === "" || isLoading) return;

    const userMessage = { text: inputValue, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    const { response, options } = await sendMessageToServer(inputValue);

    setMessages((prev) => [
      ...prev,
      { text: response, sender: "bot", options },
    ]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSendMessage();
  };

  const handleOptionClick = async (option) => {
    setMessages((prev) => [...prev, { text: option, sender: "user" }]);

    const { response, options } = await sendMessageToServer(option);

    setMessages((prev) => [
      ...prev,
      { text: response, sender: "bot", options },
    ]);
  };

  return (
    <>
      <div className="foto-principal">
        <img src={chatbotimagem} className="foto-bot" alt="chatbot" />
        <div className="escurecedor"></div>
        <div className="texto-img-principal">
          <h1>
            Agendamentos
            <br />
            e atendente
            <br />
            virtual
          </h1>
        </div>
      </div>
      <div className="texto">
        <h2 className="titulo">Contatos</h2>
        <p className="subtitulo-chatbot">
          Agende via telefone ou whatsapp, ou fale com o nosso assistente
          virtual!
        </p>

        <ul className="lista-contatos">
          <li className="item-contato">
            (11) 2440-5733
            <img src={telefone} alt="telefone" className="icon-contato" />
          </li>
          <a
            href="https://wa.me/5511940385204"
            style={{ textDecoration: "none", color: "inherit" }}
            target="_blank"
            rel="noopener noreferrer"
          >
            <li className="item-contato">
              (11) 94038-5204
              <img src={whatsapp} alt="whatsapp" className="icon-contato" />
            </li>
          </a>
        </ul>
      </div>
      <div className="chatbot-container">
        <p className="titulo-chatbot">Nosso assistente virtual está online!</p>
        <div className="chat-box">
          <div className="chat-messages" ref={chatMessagesRef}>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message-container ${message.sender}`}
              >
                <div className="message-sender">
                  {message.sender === "bot" ? (
                    "Assistente virtual SennaCar"
                  ) : (
                    <strong>Você</strong>
                  )}
                </div>
                <div className={`message ${message.sender}`}>
                  <div className="message-content">
                    {message.text.split("\n").map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        <br />
                      </React.Fragment>
                    ))}
                    {message.sender === "bot" && message.options && (
                      <div className="message-options">
                        {message.options.map((option, i) => (
                          <button
                            key={i}
                            className="option-button"
                            onClick={() => handleOptionClick(option)}
                            disabled={isLoading}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          {exibirFormulario && (
            <div className="formulario-dados">
              <input type="text" placeholder="Nome" className="input-form" />
              <input type="email" placeholder="Email" className="input-form" />
              <input type="tel" placeholder="Telefone" className="input-form" />
              <button
                onClick={() => alert("Enviado!")}
                className="botao-enviar-form"
              >
                Enviar dados
              </button>
            </div>
          )}
          <div className="chat-input">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Digite sua mensagem..."
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || inputValue.trim() === ""}
            >
              {isLoading ? (
                "Enviando..."
              ) : (
                <>
                  <img src={enviar} alt="Enviar" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Chatbot;
