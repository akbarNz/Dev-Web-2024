import React, { useState, useEffect } from "react";

const Header = ({ setShowProfileForm, setShowHistorique, setShowFavoris }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await fetch("/api/menu-items");
        const data = await response.json();
        setMenuItems(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des éléments du menu:", error);
        setMenuItems([]);
      }
    };
    
    fetchMenuItems();
  }, []);
  
  const toggleSubmenu = () => {
    setIsSubmenuOpen(!isSubmenuOpen);
  };

  return (
    <header>
      <nav>
        <a href="logo">
          <img src="#" alt="Logo"/>
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
        {/* <a href="#" className="register-btn">S'enregistrer</a> */}
        <button className="register-btn" onClick={() => setShowHistorique(true)}>Historique des réservations</button>
        <button className="register-btn" onClick={() => setShowFavoris(true)}>Favoris</button>
        <button id="profil_button" className="register-btn" onClick={() => setShowProfileForm(true)}>Modifier mon
          profil
        </button>
      </nav>
    </header>
  );
};

export default Header;