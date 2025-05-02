import { Link } from "react-router-dom";
import telefone from "../assets/telefone.svg";
import whatsapp from "../assets/whatsapp.svg";
import instagram from "../assets/instagram.svg";
import facebook from "../assets/facebook.svg";
import mapa from "../assets/mapa.svg";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-column">
          <h3 className="footer-title">Contato</h3>
          <div className="contact-item">
            <img src={telefone} alt="Telefone" className="footer-icon" />
            <span>(11) 2440-5733</span>
          </div>
          <div className="contact-item">
            <img src={whatsapp} alt="WhatsApp" className="footer-icon" />
            <span>(11) 94038-5204</span>
          </div>
        </div>

        <div className="footer-column">
          <h3 className="footer-title">Redes Sociais</h3>
          <div className="contact-item">
            <img src={instagram} alt="Instagram" className="footer-icon" />
            <span>sennacar</span>
          </div>
          <div className="contact-item">
            <img src={facebook} alt="Facebook" className="footer-icon" />
            <span>Senna Car</span>
          </div>
        </div>

        <div className="footer-column">
          <h3 className="footer-title">Endereço</h3>
          <div className="contact-item">
            <img src={mapa} alt="Mapa" className="footer-icon" />
            <span>
              Av. Antônio de Souza, 268 - Centro
              <br />
              Guarulhos - SP, 07013-090
            </span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} Senna Car. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
