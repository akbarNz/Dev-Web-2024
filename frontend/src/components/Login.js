// frontend/src/components/Login.js
import React, { useState } from 'react';

const Login = ({ onClose }) => {
  const [formData, setFormData] = useState({
    email: '',
    mot_de_passe: '',
    type: 'client'
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la connexion');
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
      setError(err.message || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Connexion</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
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
            <label htmlFor="type">Type de compte</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="client">Artiste</option>
              <option value="proprio">Propriétaire</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;