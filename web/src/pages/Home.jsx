import React from "react";
import Slider from "react-slick";
import { Link } from "react-router-dom";

import loja from "../assets/loja-nova.jpeg";
import speaker from "../assets/speaker.svg";
import multimidia from "../assets/Tablet.svg";
import insulfim from "../assets/mirror.svg";
import livina from "../assets/livina.jpg";
import mercedes from "../assets/mercedes.jpg";
import variant from "../assets/variant.jpg";
import midiaImagem from "../assets/multimidia-inicio.jpg";
import ferramentas from "../assets/ferramentas.svg";
import dinheiro from "../assets/dinheiro.svg";
import qualidade from "../assets/Quality.svg";
import lojacamera from "../assets/loja-camera.jpg";
import mercedesinterior from "../assets/mercedes_interior.jpg";
import subwoofer from "../assets/subwoofer.jpg";
import buggy from "../assets/buggy.jpg";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./Home.css";

function Home() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  return (
    <>
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
          <Link to="/servicos" className="botao-mais-servicos">
            Ver todos os serviços
          </Link>
        </div>
        <div className="carrossel">
          <Slider {...settings}>
            <div>
              <img src={livina} alt="Imagem livina" />
            </div>
            <div>
              <img src={mercedes} alt="Imagem mercedes" />
            </div>
            <div>
              <img src={variant} alt="Imagem variant" />
            </div>
            <div>
              <img src={midiaImagem} alt="Imagem midia" />
            </div>
          </Slider>
        </div>
      </div>
      <div className="porque-escolher">
        <div className="carrossel2">
          <Slider {...settings}>
            <div>
              <img src={lojacamera} alt="Imagem camera" />
            </div>
            <div>
              <img src={mercedesinterior} alt="Imagem interior mercedes" />
            </div>
            <div>
              <img src={subwoofer} alt="Imagem subwoofer" />
            </div>
            <div>
              <img src={buggy} alt="Imagem buggy" />
            </div>
          </Slider>
        </div>
        <div className="texto2">
          <h2 className="titulo">Por que escolher a SennaCar?</h2>
          <ul className="lista-porque-escolher">
            <li className="item-porque-escolher">
              Profissionais especializados
              <img
                src={ferramentas}
                alt="ferramentas"
                className="icon-porque-escolher"
              />
            </li>
            <li className="item-porque-escolher">
              Preços acessíveis
              <img
                src={dinheiro}
                alt="dinheiro"
                className="icon-porque-escolher"
              />
            </li>
            <li className="item-porque-escolher">
              Produtos da melhor qualidade
              <img
                src={qualidade}
                alt="qualidade"
                className="icon-porque-escolher"
              />
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
export default Home;
