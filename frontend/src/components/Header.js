// frontend/src/components/Header.js - VERSION SÉCURISÉE
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
  const [loading, setLoading] = useState(true);
  
  // Fonction pour vérifier l'authentification avec l'API
  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setIsAuthenticated(false);
      setCurrentUser(null);
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        setCurrentUser(data.user);
        
        // Mettre à jour le localStorage avec les vraies données du serveur
        localStorage.setItem('authUser', JSON.stringify(data.user));
      } else {
        // Token invalide ou expiré
        localStorage.removeItem('token');
        localStorage.removeItem('authUser');
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error);
      // En cas d'erreur réseau, on peut garder l'état actuel
      // ou déconnecter l'utilisateur selon votre préférence
      setIsAuthenticated(false);
      setCurrentUser(null);
    }
    
    setLoading(false);
  };
  
  useEffect(() => {
    // Vérifier l'authentification au chargement
    checkAuthStatus();
    
    const handleAuthChange = () => {
      // Lors d'un changement d'auth, re-vérifier avec l'API
      checkAuthStatus();
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
  }, []);
  
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

  // Afficher un loader pendant la vérification
  if (loading) {
    return (
      <header>
        <nav>
          <a href="/">
            <img id="logo" src="zikfreek_VF.png" alt="Logo" />
          </a>
          <ul>
            <li>Chargement...</li>
          </ul>
        </nav>
      </header>
    );
  }

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