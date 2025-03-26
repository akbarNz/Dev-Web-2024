import React, { useState, useEffect } from "react";

const Header = ({ setShowProfileForm }) => {
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    const fetchMenuItems = async () => {
      const response = await fetch("/api/menu-items");
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
        <button className="register-btn" onClick={() => setShowProfileForm(true)}>Modifier mon profil</button>
      </nav>
    </header>
  );
};

export default Header;