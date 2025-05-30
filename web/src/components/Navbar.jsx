import { Link } from "react-router-dom";
import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import logo from "../assets/logo-completa.png";
import "./Navbar.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <nav className="nav-bar">
      <Link to="/">
        <img src={logo} className="logo-principal" alt="Logo" />
      </Link>

      <div className="hamburger" onClick={toggleMenu}>
        {menuOpen ? <FiX size={26} /> : <FiMenu size={26} />}
      </div>

      <ul className={`nav-bar-itens ${menuOpen ? "open" : ""}`}>
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
