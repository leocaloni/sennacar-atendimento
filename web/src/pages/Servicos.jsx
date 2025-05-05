import React from "react";
import { Link } from "react-router-dom";

import somCarro from "../assets/som-carro.jpg";
import subwoofer from "../assets/subwoofer-servico.jpg";
import audi from "../assets/audi.jpg";
import check from "../assets/check.svg";
import landrover from "../assets/land-rover.jpg";
import midiacarro from "../assets/multimidia-servico.jpg";

import "./Servicos.css";

function Servicos() {
  return (
    <>
      <div className="foto-principal">
        <img src={somCarro} className="foto-som" alt="Som automotivo" />
        <div className="escurecedor"></div>
        <div className="texto-img-principal">
          <h1>
            Nossos <br />
            serviços
          </h1>
        </div>
      </div>
      <div className="servicos-container">
        <div className="texto">
          <h2 className="titulo">Instalação de Som Automotivo</h2>
          <p className="subtitulo">
            Instalamos o melhor sistema de som automotivo no seu carro! Confira
            já as opções:
          </p>

          <ul className="lista-servicos">
            <li className="item-servico">
              <span className="servico-titulo">Subwoofers:</span>
              <ul className="sub-lista">
                <li>
                  Temos subwoofers das melhores marcas, como X, Y, Z, entre
                  outros!
                </li>
              </ul>
            </li>
            <li className="item-servico">
              <span className="servico-titulo">Caixas de som:</span>
              <ul className="sub-lista">
                <li>
                  Instalamos caixas de som de marcas como A, B, C, entre outros!
                </li>
              </ul>
            </li>
          </ul>
          <Link to="/chatbot" className="botao-chatbot">
            Consulte todas as opções com o nosso assistente virtual!
          </Link>
        </div>
        <img src={subwoofer} alt="subwoofer" className="imagem-servico" />
      </div>
      <div className="servicos-container">
        <img src={audi} alt="audi" className="imagem-servico" />
        <div className="texto">
          <h2 className="titulo">Instalação de Insulfim</h2>
          <p className="subtitulo">
            Instalamos diversos tipos de insulfims no seu carro, e sem deixar
            bolhas!
          </p>

          <ul className="lista-servicos">
            <li className="item-servico">
              <ul className="sub-lista">
                <li>
                  Insulfim G5
                  <img src={check} alt="check" className="check" />
                </li>
                <li>
                  Insulfim G20
                  <img src={check} alt="check" className="check" />
                </li>
                <li>
                  Insulfim G50
                  <img src={check} alt="check" className="check" />
                </li>
              </ul>
            </li>
          </ul>
          <Link to="/chatbot" className="botao-chatbot">
            Agende sua instalação agora mesmo!
          </Link>
        </div>
      </div>
      <div className="servicos-container">
        <div className="texto">
          <h2 className="titulo">Instalação de PPF</h2>
          <p className="subtitulo">
            Instalamos PPF para proteger a pintura do seu carro!
          </p>
          <p className="ppf-texto">
            O PPF (película de proteção de pintura) protege seu carro de riscos
            na pintura! Temos o modelo transparente e black piano
          </p>
          <Link to="/chatbot" className="botao-chatbot">
            Fale com um de nossos especialistas para um orçamento!
          </Link>
        </div>
        <img src={landrover} alt="landrover" className="imagem-servico" />
      </div>
      <div className="servicos-container">
        <img src={midiacarro} alt="midia" className="imagem-servico" />
        <div className="texto">
          <h2 className="titulo">Instalação de Multimídia</h2>
          <p className="subtitulo">
            Instalamos as melhores multimídias do mercado no seu carro!
          </p>

          <ul className="lista-servicos">
            <li className="item-servico">
              <ul className="sub-lista">
                <li>
                  Multimídia 2GB
                  <img src={check} alt="check" className="check" />
                </li>
                <li>
                  Multimídia 4GB
                  <img src={check} alt="check" className="check" />
                </li>
                <li>
                  Multimídia 6GB
                  <img src={check} alt="check" className="check" />
                </li>
                <li>
                  Multimídia 8GB
                  <img src={check} alt="check" className="check" />
                </li>
              </ul>
            </li>
          </ul>
          <Link to="/chatbot" className="botao-chatbot">
            Agende sua instalação agora mesmo!
          </Link>
        </div>
      </div>
    </>
  );
}

export default Servicos;
