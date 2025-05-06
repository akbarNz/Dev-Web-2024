import React, { useState } from 'react';

const AUTH_STORAGE_KEY = 'appUser Authenticated';

export default function SignupForm({ onSignupSuccess }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Regex améliorée pour la validation des emails
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const validate = () => {
    const newErrors = {};
    
    // Validation du nom d'utilisateur
    if (!username.trim()) {
      newErrors.username = "Le nom d'utilisateur est requis.";
    }
    
    // Validation de l'email
    if (!email.trim()) {
      newErrors.email = "L'email est requis.";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "L'email n'est pas valide.";
    }
    
    // Validation du mot de passe
    if (!password) {
      newErrors.password = "Le mot de passe est requis.";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Effacer les erreurs précédentes
    setErrors({});
    setFormError('');
    
    // Valider le formulaire
    if (!validate()) return;

    setSubmitting(true);

    // Simulation d'une requête API de création de compte
    setTimeout(() => {
      setSubmitting(false);
      
      // Ici, vous pouvez ajouter la logique pour enregistrer l'utilisateur dans votre backend
      // Par exemple, vous pouvez faire une requête POST à votre API
      console.log('Utilisateur créé:', { username, email, password });

      // Simuler un succès
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      if (onSignupSuccess) onSignupSuccess();
    }, 1000); // Réduit le délai à 1s pour une meilleure expérience utilisateur
  };

  // Styles
  const styles = {
    form: {
      maxWidth: 350,
      margin: 'auto',
      padding: '20px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      borderRadius: '8px',
      backgroundColor: '#fff'
    },
    title: {
      color: '#2575fc',
      textAlign: 'center',
      marginBottom: '20px'
    },
    label: {
      fontWeight: '600',
      marginTop: '14px',
      display: 'block',
      color: '#333'
    },
    input: {
      padding: '10px 12px',
      fontSize: '16px',
      marginTop: '6px',
      border: '2px solid #ddd',
      borderRadius: '6px',
      width: '100%',
      boxSizing: 'border-box',
      transition: 'border-color 0.3s ease',
      minHeight: '38px',
    },
    inputError: {
      borderColor: '#e84343',
    },
    errorText: {
      color: '#e84343',
      fontSize: '0.85em',
      margin: '3px 0 0'
    },
    formError: {
      color: '#e84343',
      marginTop: 15,
      textAlign: 'center',
      fontWeight: '500'
    },
    button: {
      marginTop: 20,
      padding: '12px',
      backgroundColor: '#2575fc',
      border: 'none',
      color: 'white',
      fontWeight: '700',
      fontSize: '16px',
      borderRadius: '8px',
      cursor: 'pointer',
      width: '100%',
      transition: 'background-color 0.2s ease'
    },
    buttonDisabled: {
      opacity: 0.7,
      cursor: 'not-allowed'
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      noValidate
      style={styles.form}
      aria-labelledby="signup-title"
    >
      <h2 id="signup-title" style={styles.title}>Créer un compte</h2>

      <div>
      <label htmlFor="username" style={styles.label}>Nom d'utilisateur</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={submitting}
          aria-invalid={errors.username ? 'true' : 'false'}
          aria-describedby={errors.username ? "username-error" : undefined}
          placeholder="Nom d'utilisateur"
          style={{
            ...styles.input,
            ...(errors.username ? styles.inputError : {})
          }}
          required
        />
        {errors.username && (
          <p id="username-error" style={styles.errorText}>{errors.username}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" style={styles.label}>Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={submitting}
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? "email-error" : undefined}
          placeholder="exemple@domaine.com"
          style={{
            ...styles.input,
            ...(errors.email ? styles.inputError : {})
          }}
          required
        />
        {errors.email && (
          <p id="email-error" style={styles.errorText}>{errors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" style={styles.label}>Mot de passe</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={submitting}
          aria-invalid={errors.password ? 'true' : 'false'}
          aria-describedby={errors.password ? "password-error" : undefined}
          placeholder="Mot de passe"
          style={{
            ...styles.input,
            ...(errors.password ? styles.inputError : {})
          }}
          required
        />
        {errors.password && (
          <p id="password-error" style={styles.errorText}>{errors.password}</p>
        )}
      </div>

      {formError && (
        <p role="alert" style={styles.formError}>{formError}</p>
      )}

      <button 
        type="submit" 
        disabled={submitting} 
        style={{
          ...styles.button,
          ...(submitting ? styles.buttonDisabled : {})
        }}
        aria-busy={submitting}
      >
        {submitting ? 'Création en cours...' : 'Créer un compte'}
      </button>
    </form>
  );
}
