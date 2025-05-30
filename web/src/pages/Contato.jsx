import React from "react";
import { Link } from "react-router-dom";

import fotosatelite from "../assets/foto-satelite.png";
import telefone from "../assets/telefone-preto.svg";
import whatsapp from "../assets/whatsapp-preto.svg";
import instagram from "../assets/instagram-preto.svg";
import facebook from "../assets/facebook-preto.svg";

import "./Contato.css";

// Componente que exibe informações de contato e localização da empresa
function Contato() {
  return (
    <>
      <div className="foto-principal">
        <img
          src={fotosatelite}
          className="foto-satelite"
          alt="Som automotivo"
        />
        <div className="escurecedor"></div>
        <div className="texto-img-principal">
          <h1>
            Como nos <br />
            achar e <br />
            contatar
          </h1>
        </div>
      </div>

      <div className="contatos-container">
        <div className="texto">
          <h2 className="titulo">Contatos</h2>
          <p className="subtitulo">
            Fale com a gente ou contate nosso assitente virtual!
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
            <a
              href="https://www.instagram.com/sennacar/"
              style={{ textDecoration: "none", color: "inherit" }}
              target="_blank"
              rel="noopener noreferrer"
            >
              <li className="item-contato">
                sennacar
                <img src={instagram} alt="instagram" className="icon-contato" />
              </li>
            </a>
            <a
              href="https://www.facebook.com/sennacarsom?fref=ts"
              style={{ textDecoration: "none", color: "inherit" }}
              target="_blank"
              rel="noopener noreferrer"
            >
              <li className="item-contato">
                Senna Car
                <img src={facebook} alt="facebook" className="icon-contato" />
              </li>
            </a>
          </ul>

          <Link to="/chatbot" className="botao-chatbot">
            Fale com o nosso assistente virtual!
          </Link>
        </div>

        <div className="mapa-container">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3659.6596836072595!2d-46.529323925024386!3d-23.472737058341576!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce5ff7fe2ddf27%3A0x157d87a470f86b0e!2sSenna%20Car!5e0!3m2!1spt-BR!2sbr!4v1746562166781!5m2!1spt-BR!2sbr"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Localização da Senna Car"
          ></iframe>
        </div>
      </div>
    </>
  );
}

export default Contato;
