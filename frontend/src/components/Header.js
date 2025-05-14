// frontend/src/components/Header.js
import React, { useState, useEffect } from "react";

const Header = ({ 
  setShowProfileForm, 
  setShowHistorique, 
  setShowFavoris, 
  setShowEnregistrement,
  setShowLogin,        
  setShowRegister      
}) => {
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const [isAuthMenuOpen, setIsAuthMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem('token');
    const authUser = localStorage.getItem('authUser');
    
    if (token && authUser) {
      setIsAuthenticated(true);
      setCurrentUser(JSON.parse(authUser));
    }
    
    const handleAuthChange = () => {
      const token = localStorage.getItem('token');
      const authUser = localStorage.getItem('authUser');
      
      if (token && authUser) {
        setIsAuthenticated(true);
        setCurrentUser(JSON.parse(authUser));
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    };
    
    // Fermer les menus déroulants lors d'un clic à l'extérieur
    const handleClickOutside = (event) => {
      if (isSubmenuOpen && !event.target.closest('.studio-menu')) {
        setIsSubmenuOpen(false);
      }
      if (isAuthMenuOpen && !event.target.closest('.auth-menu')) {
        setIsAuthMenuOpen(false);
      }
    };
    
    window.addEventListener('authChanged', handleAuthChange);
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      window.removeEventListener('authChanged', handleAuthChange);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isSubmenuOpen, isAuthMenuOpen]);
  
  const toggleSubmenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSubmenuOpen(!isSubmenuOpen);
    // Fermer le menu d'authentification si ouvert
    if (isAuthMenuOpen) setIsAuthMenuOpen(false);
  };
  
  const toggleAuthMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAuthMenuOpen(!isAuthMenuOpen);
    // Fermer le menu studio si ouvert
    if (isSubmenuOpen) setIsSubmenuOpen(false);
  };
  
  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('authUser');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setIsAuthMenuOpen(false);
    
    // Déclencher l'événement de changement d'authentification
    const event = new CustomEvent('authChanged');
    window.dispatchEvent(event);
  };

  return (
    <header>
      <nav>
        <a href="/">
          <img id="logo" src="zikfreek_VF.png" alt="Logo" />
        </a>
        <ul>
          <li className="studio-menu">
            <a href="#" onClick={toggleSubmenu}>Studio {isSubmenuOpen ? '▲' : '▼'}</a>
            <ul className={`submenu ${isSubmenuOpen ? 'visible' : ''}`}>
              <li><a href="#" onClick={(e) => {
                e.preventDefault();
                setShowEnregistrement(true);
                setIsSubmenuOpen(false);
              }}>Enregistrer un studio</a></li>
            </ul>
          </li>
          
          {isAuthenticated ? (
            <>
              {/* Boutons d'historique et de favoris - visibles seulement si connecté */}
              <li>
                <button className="nav-btn" onClick={() => setShowHistorique(true)}>
                  Historique
                </button>
              </li>
              <li>
                <button className="nav-btn" onClick={() => setShowFavoris(true)}>
                  Favoris
                </button>
              </li>
            </>
          ) : null}
          
          {/* Menu d'authentification */}
          <li className="auth-menu">
            {isAuthenticated ? (
              <>
                <a href="#" onClick={toggleAuthMenu}>
                  Connecté: {currentUser?.nom} {isAuthMenuOpen ? '▲' : '▼'}
                </a>
                <ul className={`submenu auth-submenu ${isAuthMenuOpen ? 'visible' : ''}`}>
                  <li><a href="#" onClick={(e) => {
                    e.preventDefault();
                    setShowProfileForm(true);
                    setIsAuthMenuOpen(false);
                  }}>Modifier profil</a></li>
                  <li><a href="#" onClick={handleLogout}>Déconnexion</a></li>
                </ul>
              </>
            ) : (
              <div className="auth-buttons">
                <button className="auth-btn login-btn" onClick={() => setShowLogin(true)}>
                  Connexion
                </button>
                <button className="auth-btn register-btn" onClick={() => setShowRegister(true)}>
                  Inscription
                </button>
              </div>
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;