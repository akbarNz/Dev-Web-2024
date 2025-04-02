import { useState, useEffect } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import Axios from "axios";
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage } from '@cloudinary/react';


const ModifProfil = ({ onBack }) => {
  const [profil, setProfil] = useState({
    photo_profil_url: "",
    nom: "",
    email: "",
    numero_telephone: "",
    role: "",
  });

  const [publicId, setPublicId] = useState("");

  useEffect(() => {
    const fetchProfil = async () => {
      try {
        const response = await fetch("http://localhost:5001/getUserInfo?id=4"); 
        const data = await response.json();

        setProfil({ ...data, numero_telephone: `+${data.numero_telephone}` });
        setPublicId(data.photo_profil_url); // Charger l'image
      } catch (error) {
        console.error("Erreur lors de la récupération du profil :", error);
      }
    };

    fetchProfil();
  }, []);

  const uploadImage = async (files) => {
    const formData = new FormData();
    formData.append("file", files[0]);
    formData.append("upload_preset", "rnvyghre");

    try {
      const response = await Axios.post("https://api.cloudinary.com/v1_1/dpszia6xf/image/upload", formData);
      setPublicId(response.data.public_id);

      // Met à jour le profil direct
      setProfil((prev) => ({ ...prev, photo_profil_url: response.data.public_id }));
    } catch (error) {
      console.error("Erreur lors de l'upload :", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formattedPhone = profil.numero_telephone.replace(/[\s+]/g, '');
    const updatedProfil = { ...profil, numero_telephone: formattedPhone };

    try {
      const response = await fetch("http://localhost:5001/saveUserInfo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProfil),
      });

      if (!response.ok) throw new Error("Erreur lors de la mise à jour du profil");
      alert("Profil mis à jour avec succès !");
    } catch (error) {
      console.error(error);
    }
  };

  const cld = new Cloudinary({ cloud: { cloudName: "dpszia6xf" } });
  const img = cld.image(publicId);

  return (
    <div className="profil-container">
      <div className="form-wrapper-profil">
        <h2>Modifier mon profil</h2>
        <form onSubmit={handleSubmit}>
          <label>
            <div>
              {publicId ? (
                <AdvancedImage cldImg={img} className="profil-photo" />
              ) : (
                <img src="logo512.png" alt="Photo de profil" className="profil-photo" />
              )}
            </div>
            <label className="left_label">Changer de photo</label>
            <input type="file" accept="image/*" onChange={(e) => uploadImage(e.target.files)} />
          </label>

          <label className="left_label">
            Nom :
            <input type="text" name="nom" value={profil.nom} onChange={(e) => setProfil({ ...profil, nom: e.target.value })} required />
          </label>

          <label className="left_label">
            Email :
            <input type="email" name="email" value={profil.email} onChange={(e) => setProfil({ ...profil, email: e.target.value })} required />
          </label>

          <label className="left_label">
            Numéro de téléphone :
            <PhoneInput defaultCountry="BE" value={profil.numero_telephone} onChange={(value) => setProfil({ ...profil, numero_telephone: value })} />
          </label>

          <label className="left_label">
            Rôle :
            <select name="role" value={profil.role} onChange={(e) => setProfil({ ...profil, role: e.target.value })} required>
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