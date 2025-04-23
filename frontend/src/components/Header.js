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
  const [users, setUsers] = useState({
    artistes: [],
    proprietaires: []
  });
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Fonction pour récupérer la liste des utilisateurs
  const fetchUsers = async () => {
    try {
      // Fetch artistes
      const artistesResponse = await fetch("http://localhost:5001/api/clients/artistes");
      const artistesData = await artistesResponse.json();
      
      // Fetch propriétaires
      const proprietairesResponse = await fetch("http://localhost:5001/api/proprietaires/");
      const proprietairesData = await proprietairesResponse.json();
      
      setUsers({
        artistes: artistesData,
        proprietaires: proprietairesData
      });
      
      // user par défaut
      if (!selectedUser && artistesData.length > 0) {
        const defaultUser = {
          id: artistesData[0].id,
          nom: artistesData[0].nom,
          type: 'artiste'
        };
        setSelectedUser(defaultUser);
        localStorage.setItem('currentUser', JSON.stringify(defaultUser));
      }
      
      // Si un utilisateur est déjà sélectionné, mettre à jour ses informations
      if (selectedUser) {
        const userType = selectedUser.type;
        const userId = selectedUser.id;
        const userList = userType === 'artiste' ? artistesData : proprietairesData;
        const updatedUser = userList.find(user => user.id === userId);
        
        if (updatedUser) {
          const refreshedUser = {
            id: updatedUser.id,
            nom: updatedUser.nom,
            type: userType
          };
          setSelectedUser(refreshedUser);
          localStorage.setItem('currentUser', JSON.stringify(refreshedUser));
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
    }
  };
  
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
    fetchUsers();
    
    // user dans localStorage ? 
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setSelectedUser(JSON.parse(storedUser));
    }
    
    const handleUserUpdate = (event) => {
      if (event.detail) {
        // Mettre à jour l'utilisateur sélectionné avec les données de l'événement
        setSelectedUser(event.detail);
      }
      fetchUsers();
    };
    
    window.addEventListener('userUpdated', handleUserUpdate);
    
    // Update la liste
    return () => {
      window.removeEventListener('userUpdated', handleUserUpdate);
    };
  }, []);
  
  const toggleSubmenu = () => {
    setIsSubmenuOpen(!isSubmenuOpen);
  };
  
  const handleUserChange = (e) => {
    const [id, nom, type] = e.target.value.split('|');
    const newUser = {
      id: parseInt(id),
      nom,
      type
    };
    
    setSelectedUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    // évenement pour prévenir user a changé
    const event = new CustomEvent('userChanged', { detail: newUser });
    window.dispatchEvent(event);
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
        <div className="user-select-container">
          <select 
            className="user-select" 
            value={selectedUser ? `${selectedUser.id}|${selectedUser.nom}|${selectedUser.type}` : ''}
            onChange={handleUserChange}
          >
            <optgroup label="Artistes">
              {users.artistes.map(artiste => (
                <option key={`artiste-${artiste.id}`} value={`${artiste.id}|${artiste.nom}|artiste`}>
                  {artiste.nom}
                </option>
              ))}
            </optgroup>
            <optgroup label="Propriétaires">
              {users.proprietaires.map(proprio => (
                <option key={`proprio-${proprio.id}`} value={`${proprio.id}|${proprio.nom}|proprietaire`}>
                  {proprio.nom}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </nav>
    </header>
  );
};

export default Header;