import { useState, useEffect } from "react";

const ModifProfil = ({ onBack }) => {
  const [profil, setProfil] = useState({
    nom: "",
    email: "",
    role: "artiste",
  });

  useEffect(() => {
    const fetchProfil = async () => {
      try {
        const response = await fetch("http://localhost:5001/getUserInfo?id=2");
        const data = await response.json();
        setProfil(data);
      } catch (error) {
        console.error("Erreur lors de la récupération du profil :", error);
      }
    };

    fetchProfil();
  }, []);

  const handleChange = (e) => {
    setProfil({ ...profil, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5001/saveUserInfo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profil),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du profil");
      }

      alert("Profil mis à jour avec succès !");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="form-wrapper">
      <h2>Modifier mon profil</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Nom :
          <input type="text" name="nom" value={profil.nom} onChange={handleChange} required />
        </label>
        <label>
          Email :
          <input type="email" name="email" value={profil.email} onChange={handleChange} required />
        </label>
        <label>
          Rôle :
          <select name="role" value={profil.role} onChange={handleChange} required>
            <option value="propriétaire">Propriétaire</option>
            <option value="artiste">Artiste</option>
          </select>
        </label>
        <button type="submit" className="register-btn">Enregistrer</button>
        <button type="button" className="register-btn" onClick={onBack}>Retour</button>
      </form>
    </div>
  );
};

export default ModifProfil;
