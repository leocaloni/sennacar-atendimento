import React from "react";
import Slider from "react-slick";

import logo from "./assets/logo-completa.png";
import loja from "./assets/loja-nova.jpeg";
import speaker from "./assets/speaker.svg";
import multimidia from "./assets/Tablet.svg";
import insulfim from "./assets/mirror.svg";
import livina from "./assets/livina.jpg";
import mercedes from "./assets/mercedes.jpg";
import variant from "./assets/variant.jpg";
import midiaImagem from "./assets/multimidia-inicio.jpg";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./App.css";

function App() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  return (
    <>
      <nav className="nav-bar">
        <a href="App.jsx">
          <img src={logo} className="logo-principal" />
        </a>
        <ul className="nav-bar-itens">
          <li className="list-item">
            <a className="App.jsx"> Início </a>
          </li>
          <li className="list-item">
            <a className=""> Nossos serviços </a>
          </li>
          <li className="list-item">
            <a className=""> Sobre </a>
          </li>
          <li className="list-item">
            <a hrclassNameef=""> Contato</a>
          </li>
          <li className="list-item-button">
            <a href=""> Agende nossos serviços!</a>
          </li>
        </ul>
      </nav>
      <div className="foto-principal">
        <img src={loja} className="foto-loja" />
        <div className="escurecedor"></div>
        <div className="texto-img-principal">
          <h1>
            O som que <br />
            você ouve!
          </h1>
        </div>
      </div>
      <div className="nossos-servicos-inicio">
        <div className="texto">
          <h2 className="titulo">Nossos serviços</h2>
          <p className="subtitulo">
            Instalamos diversos acessórios automotivos
          </p>
          <div className="icons-inicio-serivcos-grid">
            <div className="item-servicos">
              <img src={speaker} alt="icon som" />
              <p>Caixas de Som</p>
            </div>
            <div className="item-servicos">
              <img src={multimidia} alt="icon midia" />
              <p>Multimídias</p>
            </div>
            <div className="item-servicos">
              <img src={insulfim} alt="icon film" />
              <p>Insulfim</p>
            </div>
          </div>
          <a href="Servicos.jsx" className="botao-mais-servicos">
            Ver todos os serviços
          </a>
        </div>
        <div className="carrossel">
          <Slider {...settings}>
            <div>
              <img
                src={livina}
                alt="Imagem livina"
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: "400px",
                  objectFit: "cover",
                }}
              />
            </div>
            <div>
              <img
                src={mercedes}
                alt="Imagem mercedes"
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: "400px",
                  objectFit: "cover",
                }}
              />
            </div>
            <div>
              <img
                src={variant}
                alt="Imagem variant"
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: "400px",
                  objectFit: "cover",
                }}
              />
            </div>
            <div>
              <img
                src={midiaImagem}
                alt="Imagem midia"
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: "400px",
                  objectFit: "cover",
                }}
              />
            </div>
          </Slider>
        </div>
      </div>
    </>
  );
}

export default App;
