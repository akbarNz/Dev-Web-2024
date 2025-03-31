import { useState, useEffect } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

const ModifProfil = ({ onBack }) => {
  const [profil, setProfil] = useState({
    photo_profil_url: "",
    nom: "",
    email: "",
    numero_telephone: "",
    role: ""
  });

  useEffect(() => {
    const fetchProfil = async () => {
      try {
        const response = await fetch("http://localhost:5001/getUserInfo?id=4"); //id à récupérer plus tard directement du login
        const data = await response.json();

        // Ajouter le "+" devant le numéro de téléphone
        const formattedNumero = `+${data.numero_telephone}`;
        
        setProfil({ ...data, numero_telephone: formattedNumero });
      } catch (error) {
        console.error("Erreur lors de la récupération du profil :", error);
      }
    };

    fetchProfil();
  }, []);

  const handleChange = (e) => {
    setProfil({ ...profil, [e.target.name]: e.target.value });
  };

    const handlePhoneChange = (value) => {
    setProfil({ ...profil, numero_telephone: value });
  }; 
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    //retirer le + et les espace dans le numéro
    const formattedPhone = profil.numero_telephone.replace(/[\s+]/g, '');
    console.log(formattedPhone)

    const updatedProfil = { ...profil, numero_telephone: formattedPhone };
    try {
      const response = await fetch("http://localhost:5001/saveUserInfo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProfil),
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
  <div className="profil-container">
    <div className="form-wrapper-profil">
      <h2>Modifier mon profil</h2>
      <form onSubmit={handleSubmit}>
        {/* Affichage et mise à jour de la photo de profil (encore à faire dynamiquement) */}
        <label>
          {/*
        {profil.photo_profil_url && (
            <div>
              <img src={profil.photo_profil_url} alt="Photo de profil" className="profil-photo" />
            </div>
          )}*/}
          <img src="logo512.png" alt="Photo de profil" className="profil-photo" />
        <label className="left_label">Changer de photo</label>
          <input
            type="url"
            name="photo_profil_url"
            placeholder="URL de la photo"
            value={profil.photo_profil_url}
            onChange={handleChange}
          />
        </label>

        <label className="left_label">
          Nom :
          <input type="text" name="nom" value={profil.nom} onChange={handleChange} required />
        </label>

        <label className="left_label">
          Email :
          <input type="email" name="email" value={profil.email} onChange={handleChange} required />
        </label>

        <label className="left_label">
          Numéro de téléphone :
          <PhoneInput
            defaultCountry="BE"
            value={profil.numero_telephone}
            onChange={handlePhoneChange}
          />
        </label>

        <label className="left_label">
          Rôle :
          <select name="role" value={profil.role} onChange={handleChange} required>
            <option value="propriétaire">Propriétaire</option>
            <option value="artiste">Artiste</option>
          </select>
        </label>

        <button type="submit" className="register-btn">Enregistrer</button>
      </form>
    </div>
    <button id="backbutton" type="button" className="register-btn" onClick={onBack}>Retour</button>
  </div>
  );
};

export default ModifProfil;