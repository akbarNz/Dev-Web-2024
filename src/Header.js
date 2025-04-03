import React, { useState, useEffect } from "react";

const Header = ({ setShowProfileForm, setShowHistorique }) => {
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
        <a href="index.html" className="logo-link">
          <img src="logo.png" alt="Logo" className="logo-img" />
        </a>

        <ul className="main-nav">
          <li><a href="index.html">Home</a></li>
          
          <li 
            className="studio-menu-item"
            onMouseEnter={() => setIsStudioSubmenuOpen(true)}
            onMouseLeave={() => setIsStudioSubmenuOpen(false)}
          >
            <span className="studio-trigger">Studio ▼</span>
            
            {isStudioSubmenuOpen && (
              <ul className="studio-submenu">
                {studioSubmenuItems.map((item, index) => (
                  <li key={index}>
                    <a 
                      href={item.link}
                      className="submenu-link"
                      onClick={() => setIsStudioSubmenuOpen(false)}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>

          <li><a href="about.html">A propos</a></li>
          <li><a href="contact.html">Contact</a></li>
        </ul>
        {/* <a href="#" className="register-btn">S'enregistrer</a> */}
        <button className="register-btn" onClick={() => setShowHistorique(true)}>Historique des réservations</button>
        <button id="profil_button" className="register-btn" onClick={() => setShowProfileForm(true)}>Modifier mon profil</button>
      </nav>
    </header>
  );
};

export default Header;