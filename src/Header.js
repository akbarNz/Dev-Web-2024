// Header.js
import React, { useState, useEffect } from "react";

const Header = () => {
  // Exemple de données récupérées depuis une base de données
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    // Simuler une récupération de données depuis une base de données
    const fetchMenuItems = async () => {
      const response = await fetch("/api/menu-items"); // Remplacez par votre endpoint API
      const data = await response.json();
      setMenuItems(data);
    };

    fetchMenuItems();
  }, []);

  return (
    <header>
      <nav>
        <a href="logo">
          <img src="#" alt="Logo" />
        </a>
        <ul>
          <li><a href="#">Home</a></li>
          <li>
            <a href="#">Studio ▼</a>
            <ul className="submenu">
              {menuItems.map((item, index) => (
                <li key={index}><a href={item.link}>{item.label}</a></li>
              ))}
            </ul>
          </li>
          <li><a href="#">A propos</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
        <a href="#" className="register-btn">S'enregistrer</a>
      </nav>
    </header>
  );
};

export default Header;