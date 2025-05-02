import { Link } from "react-router-dom";
import logo from "../assets/logo-completa.png";
import "./Navbar.css";

export default function Navbar() {
  return (
    <nav className="nav-bar">
      <Link to="/">
        <img src={logo} className="logo-principal" alt="Logo" />
      </Link>
      <ul className="nav-bar-itens">
        <li className="list-item">
          <Link to="/">Início</Link>
        </li>
        <li className="list-item">
          <Link to="/servicos">Nossos serviços</Link>
        </li>
        <li className="list-item">
          <Link to="/sobre">Sobre</Link>
        </li>
        <li className="list-item">
          <Link to="/contato">Contato</Link>
        </li>
        <li className="list-item-button">
          <Link to="/chatbot">Agende nossos serviços!</Link>
        </li>
      </ul>
    </nav>
  );
}
