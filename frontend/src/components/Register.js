// frontend/src/components/Register.js
import React, { useState } from 'react';

const Register = ({ onClose }) => {
  const [userType, setUserType] = useState('client'); // client ou proprio
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    numero_telephone: '',
    mot_de_passe: '',
    confirmation_mot_de_passe: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleTypeChange = (type) => {
    setUserType(type);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation du formulaire
    if (formData.mot_de_passe !== formData.confirmation_mot_de_passe) {
      return setError('Les mots de passe ne correspondent pas');
    }

    if (formData.mot_de_passe.length < 6) {
      return setError('Le mot de passe doit contenir au moins 6 caractères');
    }

    try {
      setError('');
      setLoading(true);

      // Convertir les numéros belges commençant par 0 en 32...
    let numero = formData.numero_telephone.trim();
    if (/^0\d{8,9}$/.test(numero)) {
      numero = '32' + numero.slice(1);
    }
      
      // Supprimer la confirmation du mot de passe des données envoyées
      const { confirmation_mot_de_passe, ...userData } = formData;
      
      // Remplacer le num par la valeur DB
      userData.numero_telephone = numero;

      const endpoint = userType === 'client' 
        ? '/api/auth/register/client' 
        : '/api/auth/register/proprio';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de l\'inscription');
      }
      
      // Stocker le token et les infos utilisateur
      localStorage.setItem('token', data.token);
      localStorage.setItem('authUser', JSON.stringify(data.user));
      
      // Déclencher l'événement de changement d'authentification
      const event = new CustomEvent('authChanged');
      window.dispatchEvent(event);
      
      // Fermer la modale
      onClose();
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Inscription</h2>
        
        <div className="user-type-selector">
          <button 
            className={`type-btn ${userType === 'client' ? 'active' : ''}`}
            onClick={() => handleTypeChange('client')}
            type="button"
          >
            Artiste
          </button>
          <button 
            className={`type-btn ${userType === 'proprio' ? 'active' : ''}`}
            onClick={() => handleTypeChange('proprio')}
            type="button"
          >
            Propriétaire
          </button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nom">Nom</label>
            <input
              type="text"
              id="nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="numero_telephone">Numéro de téléphone</label>
            <input
              type="tel"
              id="numero_telephone"
              name="numero_telephone"
              value={formData.numero_telephone}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="mot_de_passe">Mot de passe</label>
            <input
              type="password"
              id="mot_de_passe"
              name="mot_de_passe"
              value={formData.mot_de_passe}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmation_mot_de_passe">Confirmer le mot de passe</label>
            <input
              type="password"
              id="confirmation_mot_de_passe"
              name="confirmation_mot_de_passe"
              value={formData.confirmation_mot_de_passe}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Inscription en cours...' : 'S\'inscrire'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;