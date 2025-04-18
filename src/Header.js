import React, { useState, useEffect } from "react";

const Header = ({ 
  setShowProfileForm, 
  setShowHistorique, 
  setShowFavoris, 
  setShowEnregistrement,
  setShowReservationForm 
}) => {
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
          <img src="zikfreak_logo.png" alt="Logo" />
        </a>
        <ul>
          <li>
            <a href="#" onClick={(e) => {
              e.preventDefault();
              toggleSubmenu();
            }}>Studio ▼</a>
            {isSubmenuOpen && (
              <ul className="submenu">
                {menuItems.map((item, index) => (
                  <li key={index}><a href={item.link}>{item.label}</a></li>
                ))}
                <li><a href="#" onClick={(e) => {
                  e.preventDefault();
                  setShowEnregistrement(true);
                }}>Enregistrer un studio</a></li>
              </ul>
            )}
          </li>
        </ul>
        <button className="register-btn" onClick={() => setShowHistorique(true)}>
          Historique
        </button>
        <button className="register-btn" onClick={() => setShowFavoris(true)}>
          Favoris
        </button>
        <button id="profil_button" className="register-btn" onClick={() => setShowProfileForm(true)}>
          Profil
        </button>
      </nav>
    </header>
  );
};

export default Header;