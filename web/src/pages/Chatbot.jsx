import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import chatbotimagem from "../assets/chatbot.jpg";
import telefone from "../assets/telefone-preto.svg";
import whatsapp from "../assets/whatsapp-preto.svg";
import enviar from "../assets/enviar.svg";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "./Chatbot.css";

// Componente principal do chatbot
function Chatbot() {
  useEffect(() => {
    const savedMessages = localStorage.getItem("chat_messages");
    const savedFormData = localStorage.getItem("chat_formData");
    const savedClienteCadastrado = localStorage.getItem(
      "chat_clienteCadastrado"
    );

    if (savedMessages) setMessages(JSON.parse(savedMessages));
    if (savedFormData) setFormData(JSON.parse(savedFormData));
    if (savedClienteCadastrado)
      setClienteCadastrado(JSON.parse(savedClienteCadastrado));
  }, []);

  const initialMessages = JSON.parse(localStorage.getItem("chat_messages"));
  const [messages, setMessages] = useState(
    initialMessages && initialMessages.length > 0
      ? initialMessages
      : [
          {
            text: "Bem vindo(a) à SennaCar, como posso te ajudar hoje?",
            sender: "bot",
            options: ["Agendar", "Ver serviços", "Tirar dúvida"],
          },
        ]
  );

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
  });
  const [clienteCadastrado, setClienteCadastrado] = useState(false);

  // Salva mensagens no localStorage sempre que alteradas
  useEffect(() => {
    localStorage.setItem("chat_messages", JSON.stringify(messages));
  }, [messages]);

  // Salva dados do formulário no localStorage
  useEffect(() => {
    localStorage.setItem("chat_formData", JSON.stringify(formData));
  }, [formData]);

  // Salva status de cliente cadastrado no localStorage
  useEffect(() => {
    localStorage.setItem(
      "chat_clienteCadastrado",
      JSON.stringify(clienteCadastrado)
    );
  }, [clienteCadastrado]);

  // Lida com envio do formulário de cadastro de cliente
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nome || !formData.email || !formData.telefone) {
      setMessages((prev) => [
        ...prev,
        {
          text: "Por favor, preencha todos os campos do formulário.",
          sender: "bot",
        },
      ]);
      return;
    }
    const res = await sendMessageToServer(JSON.stringify(formData));
    setMessages((prev) => [
      ...prev,
      {
        text: res.response,
        sender: "bot",
        options: res.options,
        form: res.form,
        calendar: res.calendar,
      },
    ]);
    setClienteCadastrado(true);
    setFormData({ nome: "", email: "", telefone: "" });
  };

  // Lida com alterações nos inputs do formulário
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const [showModal, setShowModal] = useState(false);

  // Limpa a conversa e reseta localStorage
  const handleClearChat = () => {
    localStorage.removeItem("chat_messages");
    localStorage.removeItem("chat_formData");
    localStorage.removeItem("chat_clienteCadastrado");
    window.location.reload();
  };

  // Lida com clique nas opções do chatbot
  const handleOptionClick = async (option) => {
    setMessages((prev) => [...prev, { text: option, sender: "user" }]);

    if (option.startsWith("calendar|")) {
      const res = await sendMessageToServer(option);
      setMessages((prev) => [
        ...prev,
        {
          text: res.response,
          sender: "bot",
          options: res.options,
          form: res.form,
          calendar: res.calendar,
        },
      ]);
      return;
    }

    if (option === "Agendar instalação") {
      if (!clienteCadastrado) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            form: true,
            text: "Por favor, preencha seus dados para agendar a instalação:",
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            calendar: true,
            text: "Selecione a data e horário para o agendamento:",
          },
        ]);
      }
      return;
    }

    const res = await sendMessageToServer(option);
    setMessages((prev) => [
      ...prev,
      {
        text: res.response,
        sender: "bot",
        options: res.options,
        form: res.form,
        calendar: res.calendar,
      },
    ]);
  };

  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Envia mensagem ao backend e obtém resposta
  const sendMessageToServer = async (message) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;
      const response = await fetch("http://localhost:8000/chatbot/message", {
        method: "POST",
        headers,
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

  // Faz scroll automático para a última mensagem
  const scrollToBottom = () => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTo({
        top: chatMessagesRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timeout);
  }, [messages]);

  // Lida com envio de mensagem pelo input
  const handleSendMessage = async () => {
    if (inputValue.trim() === "" || isLoading) return;
    const userMessage = { text: inputValue, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    const res = await sendMessageToServer(inputValue);
    setMessages((prev) => [
      ...prev,
      {
        text: res.response,
        sender: "bot",
        options: res.options,
        form: res.form,
        calendar: res.calendar,
      },
    ]);
  };

  // Envia mensagem ao pressionar Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSendMessage();
  };

  // Componente interno: calendário de seleção de data e horário
  const CalendarPicker = ({ onDateSelect }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState(null);
    const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchHorarios = async () => {
        try {
          setLoading(true);
          const dataFormatada = currentDate.toISOString().split("T")[0];
          const response = await fetch(
            `http://localhost:8000/chatbot/api/horarios?data=${encodeURIComponent(
              dataFormatada
            )}`
          );
          if (!response.ok) throw new Error("Erro ao buscar horários");
          const data = await response.json();
          setHorariosDisponiveis(
            Array.isArray(data.horarios) ? data.horarios : []
          );
        } catch (error) {
          console.error("Erro ao buscar horários:", error);
          setHorariosDisponiveis([]);
        } finally {
          setLoading(false);
        }
      };
      fetchHorarios();
    }, [currentDate]);

    const isSunday = (date) => date.getDay() === 0;

    const handlePrevDay = () => {
      const newDate = new Date(currentDate);
      do {
        newDate.setDate(newDate.getDate() - 1);
      } while (isSunday(newDate));
      setCurrentDate(newDate);
      setSelectedTime(null);
    };

    const handleNextDay = () => {
      const newDate = new Date(currentDate);
      do {
        newDate.setDate(newDate.getDate() + 1);
      } while (isSunday(newDate));
      setCurrentDate(newDate);
      setSelectedTime(null);
    };

    const handleTimeSelect = (time) => {
      setSelectedTime(time);
      const dataHora = new Date(currentDate);
      const [hours, minutes] = time.split(":");
      dataHora.setHours(parseInt(hours, 10));
      dataHora.setMinutes(parseInt(minutes, 10));
      const dataFormatada = dataHora.toISOString().split("T")[0];
      const horaFormatada = `${hours}:${minutes}`;
      onDateSelect(`${dataFormatada}|${horaFormatada}`);
    };

    const formatDay = (date) => {
      const options = { weekday: "long", day: "numeric", month: "long" };
      return date.toLocaleDateString("pt-BR", options);
    };

    return (
      <div className="calendar-picker">
        <div className="calendar-header">
          <button
            onClick={handlePrevDay}
            disabled={loading}
            className="calendar-nav"
          >
            <FiChevronLeft size={20} />
          </button>
          <h3>{formatDay(currentDate)}</h3>
          <button
            onClick={handleNextDay}
            disabled={loading}
            className="calendar-nav"
          >
            <FiChevronRight size={20} />
          </button>
        </div>
        {loading ? (
          <p>Carregando horários disponíveis...</p>
        ) : Array.isArray(horariosDisponiveis) &&
          horariosDisponiveis.length > 0 ? (
          <div className="time-slots">
            {horariosDisponiveis.map((time, index) => (
              <button
                key={index}
                className={`time-slot ${
                  selectedTime === time ? "selected" : ""
                }`}
                onClick={() => handleTimeSelect(time)}
              >
                {time}
              </button>
            ))}
          </div>
        ) : (
          <p
            style={{
              marginTop: "1rem",
              padding: "10px 15px",
              backgroundColor: "#f5f5f5",
              borderRadius: "8px",
              color: "#1a1a1a",
              textAlign: "center",
              fontWeight: "500",
              fontSize: "15px",
              border: "1px solid #ccc",
            }}
          >
            Não há horários disponíveis para este dia.
          </p>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="foto-principal">
        <img src={chatbotimagem} className="foto-bot" alt="chatbot" />
        <div className="escurecedor"></div>
        <div className="texto-img-principal">
          <h1>
            Agendamentos
            <br />e atendente
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
            (11) 2440-5733{" "}
            <img src={telefone} alt="telefone" className="icon-contato" />
          </li>
          <a
            href="https://wa.me/5511940385204"
            style={{ textDecoration: "none", color: "inherit" }}
            target="_blank"
            rel="noopener noreferrer"
          >
            <li className="item-contato">
              (11) 94038-5204{" "}
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
                    {(message.text || "").split("\n").map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        <br />
                      </React.Fragment>
                    ))}
                    {message.form && (
                      <form
                        onSubmit={handleFormSubmit}
                        className="formulario-dados"
                      >
                        <div style={{ width: "100%" }}>
                          <input
                            type="text"
                            name="nome"
                            placeholder="Nome"
                            className="input-form"
                            value={formData.nome}
                            onChange={handleInputChange}
                            required
                          />
                          <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            className="input-form"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                          />
                          <input
                            type="tel"
                            name="telefone"
                            placeholder="Telefone"
                            className="input-form"
                            value={formData.telefone}
                            onChange={handleInputChange}
                            required
                          />
                          <button type="submit" className="botao-enviar-form">
                            Enviar dados
                          </button>
                          <button
                            type="button"
                            className="botao-enviar-form"
                            style={{ marginTop: "10px" }}
                            onClick={() => handleOptionClick("Cancelar tudo")}
                          >
                            Cancelar tudo
                          </button>
                        </div>
                      </form>
                    )}
                    {Boolean(message.calendar) && (
                      <div className="calendar-wrapper">
                        <CalendarPicker
                          onDateSelect={(dateTime) =>
                            handleOptionClick(`calendar|${dateTime}`)
                          }
                        />
                      </div>
                    )}
                    {message.options && (
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
        <button className="botao-limpar" onClick={() => setShowModal(true)}>
          Limpar conversa
        </button>
      </div>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <p>Tem certeza que deseja limpar a conversa?</p>
            <div className="modal-buttons">
              <button onClick={handleClearChat} className="confirm-btn">
                Sim
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="cancel-btn"
              >
                Não
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Chatbot;
