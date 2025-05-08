import React from "react";
import { Link } from "react-router-dom";

import chatbotimagem from "../assets/chatbot.jpg";

import "./Chatbot.css";

function Chatbot() {
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
    </>
  );
}

export default Chatbot;
