import { useState, useEffect } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import Axios from "axios";
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage } from '@cloudinary/react';

const ModifProfil = ({ onBack }) => {
  const [profil, setProfil] = useState({
    id: "",
    photo_url: "",
    nom: "",
    email: "",
    numero_telephone: "",
    type: "" 
  });

  const [publicId, setPublicId] = useState("");
  const [localImage, setLocalImage] = useState(null); // photo locale
  const [fileToUpload, setFileToUpload] = useState(null); // Fichier sélectionné
  const [currentUser, setCurrentUser] = useState(null);

  // Fonction pour charger les données de l'utilisateur
  const fetchUserData = async (user) => {
    if (!user) return;
    
    try {
      // Fetch les données selon le type d'utilisateur
      const url = user.type === 'artiste' 
        ? `http://localhost:5001/getClientInfo?id=${user.id}`
        : `http://localhost:5001/getProprioInfo?id=${user.id}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      setProfil({ 
        ...data, 
        numero_telephone: `+${data.numero_telephone}`,
        type: user.type
      });
      setPublicId(data.photo_url);
      setCurrentUser(user);
      
      // Réinitialiser l'image locale et le fichier à télécharger
      setLocalImage(null);
      setFileToUpload(null);
    } catch (error) {
      console.error("Erreur lors de la récupération du profil :", error);
    }
  };

  useEffect(() => {
    // Récupération de l'utilisateur courant depuis localStorage
    const userFromStorage = JSON.parse(localStorage.getItem('currentUser'));
    if (userFromStorage) {
      setCurrentUser(userFromStorage);
      fetchUserData(userFromStorage);
    }
    
    // Écouter les changements d'utilisateur
    const handleUserChange = (event) => {
      const newUser = event.detail;
      setCurrentUser(newUser);
      fetchUserData(newUser);
    };
    
    window.addEventListener('userChanged', handleUserChange);
    
    // Nettoyage
    return () => {
      window.removeEventListener('userChanged', handleUserChange);
    };
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
    const updatedProfil = { ...profil, numero_telephone: formattedPhone, photo_url: finalPublicId };

    try {
      // Utiliser la route appropriée selon le type d'utilisateur
      const url = profil.type === 'artiste' 
        ? "http://localhost:5001/saveClientInfo"
        : "http://localhost:5001/saveProprioInfo";
      
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProfil),
      });

      if (!response.ok) throw new Error("Erreur lors de la mise à jour du profil");
      
      alert("Profil mis à jour avec succès !");
      setPublicId(finalPublicId); // Mise à jour affichage après sauvegarde
      setLocalImage(null); // Nettoyer l'aperçu
      setFileToUpload(null);
      
      // Mettre à jour les données dans localStorage si le nom a changé
      if (currentUser && profil.nom !== currentUser.nom) {
        const updatedUser = {
          ...currentUser,
          nom: profil.nom
        };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
      
      // Émettre un événement pour informer Header de la mise à jour
      const event = new CustomEvent('userUpdated');
      window.dispatchEvent(event);
      
    } catch (error) {
      console.error(error);
    }
  };

  const cld = new Cloudinary({ cloud: { cloudName: "dpszia6xf" } });
  const img = cld.image(publicId);

  return (
    <div className="profil-container">
      <div className="form-wrapper-profil">
        <h2>Modifier mon profil {profil.type === 'proprietaire' ? '(Propriétaire)' : '(Artiste)'}</h2>
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
            <label id="profil_button" htmlFor="file-upload" className="register-btn">Changer de photo</label>
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

          <button type="submit" className="register-btn">Enregistrer</button>
        </form>
      </div>
      <button id="backbutton" type="button" className="register-btn" onClick={onBack}>Retour</button>
    </div>
  );
};

export default ModifProfil;