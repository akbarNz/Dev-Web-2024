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
  const [localImage, setLocalImage] = useState(null); // photo locale
  const [fileToUpload, setFileToUpload] = useState(null); // Fichier sélectionné

  useEffect(() => {
    const fetchProfil = async () => {
      try {
        const response = await fetch("http://localhost:5001/getUserInfo?id=4");
        const data = await response.json();
        setProfil({ ...data, numero_telephone: `+${data.numero_telephone}` });
        setPublicId(data.photo_profil_url);
      } catch (error) {
        console.error("Erreur lors de la récupération du profil :", error);
      }
    };

    fetchProfil();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileToUpload(file);
      setLocalImage(URL.createObjectURL(file)); // Aperçu immédiat
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let finalPublicId = publicId;

    // Si l'utilisateur a sélectionné une nouvelle image
    if (fileToUpload) {
      const formData = new FormData();
      formData.append("file", fileToUpload);
      formData.append("upload_preset", "rnvyghre");

      try {
        const response = await Axios.post("https://api.cloudinary.com/v1_1/dpszia6xf/image/upload", formData);
        finalPublicId = response.data.public_id;
      } catch (error) {
        console.error("Erreur lors de l'upload :", error);
        return;
      }
    }

    const formattedPhone = profil.numero_telephone.replace(/[\s+]/g, '');
    const updatedProfil = { ...profil, numero_telephone: formattedPhone, photo_profil_url: finalPublicId };

    try {
      const response = await fetch("http://localhost:5001/saveUserInfo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProfil),
      });

      if (!response.ok) throw new Error("Erreur lors de la mise à jour du profil");
      alert("Profil mis à jour avec succès !");
      setPublicId(finalPublicId); // Mise à jour affichage après sauvegarde
      setLocalImage(null); // Nettoyer l'aperçu
      setFileToUpload(null);
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
              {localImage ? (
                <img src={localImage} alt="Aperçu" className="profil-photo" />
              ) : publicId ? (
                <AdvancedImage cldImg={img} className="profil-photo" />
              ) : (
                <img src="logo512.png" alt="Photo de profil" className="profil-photo" />
              )}
            </div>
            <label id= "profil_button" for="file-upload" class="register-btn">Changer de photo</label>
            <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} />
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
