import React, { useState } from "react";

const Header = () => {
  const [isStudioSubmenuOpen, setIsStudioSubmenuOpen] = useState(false);

  const studioSubmenuItems = [
    { label: "Formulaire Réservation", link: "formulaire-reservation.html" },
    { label: "Formulaire Enregistrement", link: "formulaire-enregistrement-studio.html" }
  ];

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

        <a href="register.html" className="register-btn">S'enregistrer</a>
      </nav>
    </header>
  );
};

export default Header;