import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';

const languages = [
  { code: 'EN', label: 'English' },
  { code: 'FR', label: 'Français' },
  { code: 'NL', label: 'Nederlands' },
];

const Header = () => {
  const [currentLang, setCurrentLang] = useState('EN');

  const handleLanguageChange = (e) => {
    setCurrentLang(e.target.value);
  };

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Link to="/">
          ZikFreak
        </Link>
      </div>
      
      <nav className={styles.nav}>
        <select 
          value={currentLang}
          onChange={handleLanguageChange}
          className={styles.langSelect}
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.code}
            </option>
          ))}
        </select>
        
        <div className={styles.authLinks}>
          <Link to="/signup" className={styles.link}>
            Sign Up
          </Link>
          <Link to="/login" className={styles.link}>
            Login
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
