import React from "react";
import "./Sobre.css";

import lojaAntiga from "../assets/loja-antiga1.jpg";
import senna from "../assets/senna.jpg";
import lojaAntiga2 from "../assets/loja-antiga3.jpg";
import lojaAntiga3 from "../assets/loja-antiga4.jpg";
import lojaAntiga4 from "../assets/loja-antiga5.jpg";
import lojaAntiga5 from "../assets/loja-antiga6.jpg";
import lojaConstrucao from "../assets/loja-construcao.jpg";
import ulisses from "../assets/img-ulisses.jpg";
import lojaNova from "../assets/loja-nova.jpeg";
import video from "../assets/video-loja.mp4";

function Sobre() {
  const linhaDoTempo = [
    {
      ano: "1958",
      descricao:
        "Elicivaldo Senna Munduruca, baiano da cidade de Lençóis na Chapada Diamantina, se muda para São Paulo, ficando em Guarulhos.",
      imagens: [senna],
    },
    {
      ano: "1970",
      descricao:
        "Após alguns anos trabalhando na área de acessórios automotivos, Senna funda a SennaCar na Avenida Duque de Caxias no centro de São Paulo.",
      imagens: [lojaAntiga2, lojaAntiga3, lojaAntiga4, lojaAntiga5],
    },
    {
      ano: "1982",
      descricao:
        "Senna constrói sua própria propriedade no centro de Guarulhos.",
      imagens: [lojaConstrucao, lojaAntiga],
    },
    {
      ano: "2000",
      descricao: "Ulisses, filho de Senna, assume a loja.",
      imagens: [ulisses],
    },
    {
      ano: "2020",
      descricao: "A loja completou 50 anos!",
      imagens: [lojaNova],
    },
    {
      ano: "2025",
      descricao:
        "Somos uma das maiores lojas de acessórios automotivos em Guarulhos!",
      video: video,
    },
  ];

  return (
    <>
      <div className="foto-principal">
        <img src={lojaAntiga} className="foto-loja" alt="fachada antiga" />
        <div className="escurecedor"></div>
        <div className="texto-img-principal">
          <h1>
            Sobre <br /> a loja
          </h1>
        </div>
      </div>

      <div className="linha-do-tempo-container">
        <h2 className="titulo-linha-do-tempo">Nossa linha do tempo</h2>
        <div className="linha-do-tempo">
          {linhaDoTempo.map((item, index) => (
            <div
              key={index}
              className={`item-linha-tempo ${
                index % 2 === 0 ? "esquerda" : "direita"
              }`}
              data-ano={item.ano}
            >
              <div className="marcador-ano">
                <span>{item.ano}</span>
              </div>
              <div className="conteudo-linha-tempo">
                <div
                  className={`media-linha-tempo ${
                    item.imagens?.length === 2 ? "img-dupla" : ""
                  }`}
                >
                  {item.imagens &&
                    item.imagens.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={`Evento ${item.ano} - ${i}`}
                      />
                    ))}
                  {item.video && (
                    <video controls className="video-linha-tempo">
                      <source src={item.video} type="video/mp4" />
                      Seu navegador não suporta vídeo.
                    </video>
                  )}
                </div>
                <div className="texto-linha-tempo">
                  <h3>{item.ano}</h3>
                  <p>{item.descricao}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Sobre;
