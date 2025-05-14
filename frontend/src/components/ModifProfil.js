import { useState, useEffect } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import Axios from "axios";
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage } from '@cloudinary/react';
import { useSnackbar } from "./SnackBar";

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
  const { showSnackbar } = useSnackbar();

  // Fonction pour déterminer si l'utilisateur est un artiste ou un propriétaire
  const getUserType = (user) => {
    // Pour le système JWT
    if (user.type === 'client') return 'artiste';
    if (user.type === 'proprio') return 'proprietaire';
    
    // Pour le système legacy
    if (user.type === 'artiste') return 'artiste';
    if (user.type === 'proprietaire') return 'proprietaire';
    
    // Valeur par défaut
    return 'artiste';
  };

  // Fonction pour charger les données de l'utilisateur (méthode legacy)
  const fetchUserDataLegacy = async (user) => {
    if (!user) return;
    
    try {
      // Fetch les données selon le type d'utilisateur
      const userType = getUserType(user);
      const url = userType === 'artiste' 
        ? `/api/clients/info?id=${user.id}`
        : `/api/proprietaires/info?id=${user.id}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données du profil');
      }
      
      const data = await response.json();
      
      setProfil({ 
        ...data, 
        numero_telephone: data.numero_telephone.startsWith('+') ? data.numero_telephone : `+${data.numero_telephone}`,
        type: userType
      });
      setPublicId(data.photo_url);
      setCurrentUser(user);
      
      // Réinitialiser l'image locale et le fichier à télécharger
      setLocalImage(null);
      setFileToUpload(null);
    } catch (error) {
      console.error("Erreur lors de la récupération du profil :", error);
      showSnackbar("Erreur lors de la récupération du profil", "error");
    }
  };

  // Fonction pour charger les données de l'utilisateur (méthode JWT)
  const fetchUserDataJWT = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const authUser = JSON.parse(localStorage.getItem('authUser'));
      if (!authUser) return;
      
      // Déterminer le type d'utilisateur et l'URL
      const userType = getUserType(authUser);
      const url = userType === 'artiste' 
        ? `/api/clients/me` 
        : `/api/proprietaires/me`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données du profil');
      }
      
      const data = await response.json();
      
      setProfil({ 
        ...data, 
        numero_telephone: data.numero_telephone.startsWith('+') ? data.numero_telephone : `+${data.numero_telephone}`,
        type: userType
      });
      setPublicId(data.photo_url);
      setCurrentUser(authUser);
      
      // Réinitialiser l'image locale et le fichier à télécharger
      setLocalImage(null);
      setFileToUpload(null);
    } catch (error) {
      console.error("Erreur lors de la récupération du profil JWT :", error);
      // En cas d'erreur avec le système JWT, essayer avec le système legacy
      const userFromStorage = JSON.parse(localStorage.getItem('currentUser'));
      if (userFromStorage) {
        fetchUserDataLegacy(userFromStorage);
      }
    }
  };

  useEffect(() => {
    // Vérifier si l'utilisateur est authentifié avec JWT
    const token = localStorage.getItem('token');
    const authUser = localStorage.getItem('authUser');
    
    if (token && authUser) {
      fetchUserDataJWT();
    } else {
      // Mode legacy si pas d'authentification JWT
      const userFromStorage = JSON.parse(localStorage.getItem('currentUser'));
      if (userFromStorage) {
        setCurrentUser(userFromStorage);
        fetchUserDataLegacy(userFromStorage);
      }
    }
    
    // Écouter les changements d'utilisateur (legacy)
    const handleUserChange = (event) => {
      const newUser = event.detail;
      setCurrentUser(newUser);
      fetchUserDataLegacy(newUser);
    };
    
    // Écouter les changements d'authentification (JWT)
    const handleAuthChange = () => {
      const token = localStorage.getItem('token');
      const authUser = localStorage.getItem('authUser');
      
      if (token && authUser) {
        fetchUserDataJWT();
      } else {
        // Vider le profil si l'utilisateur est déconnecté
        setProfil({
          id: "",
          photo_url: "",
          nom: "",
          email: "",
          numero_telephone: "",
          type: ""
        });
        setPublicId("");
        setCurrentUser(null);
      }
    };
    
    window.addEventListener('userChanged', handleUserChange);
    window.addEventListener('authChanged', handleAuthChange);
    
    // Nettoyage
    return () => {
      window.removeEventListener('userChanged', handleUserChange);
      window.removeEventListener('authChanged', handleAuthChange);
    };
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileToUpload(file);
      setLocalImage(URL.createObjectURL(file)); // Aperçu immédiat
    }
  };

  // Fonction pour supprimer une image sur Cloudinary
  const deleteCloudinaryImage = async (publicId) => {
    if (!publicId) return;
    
    try {
      const response = await fetch('/api/cloudinary/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_id: publicId })
      });
      
      if (!response.ok) {
        console.error('Erreur lors de la suppression de l\'image:', await response.text());
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'image sur Cloudinary:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!profil.id) {
      showSnackbar("Impossible de mettre à jour le profil : ID manquant", "error");
      return;
    }

    let finalPublicId = publicId;
    let oldPublicId = publicId;

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
        showSnackbar("Erreur lors de l'upload de l'image", "error");
        return;
      }
    }

    // Formatage du numéro de téléphone
    const formattedPhone = profil.numero_telephone?.replace(/[\s+]/g, '') || '';
    const updatedProfil = { ...profil, numero_telephone: formattedPhone, photo_url: finalPublicId };

    try {
      // Vérifier si l'utilisateur est authentifié avec JWT
      const token = localStorage.getItem('token');
      const authUser = localStorage.getItem('authUser');
      
      let response;
      
      if (token && authUser) {
        // Utiliser les nouvelles routes protégées par JWT
        const url = profil.type === 'artiste' 
          ? `/api/clients/${profil.id}`
          : `/api/proprietaires/${profil.id}`;
        
        response = await fetch(url, {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(updatedProfil),
        });
      } else {
        // Utiliser les routes legacy
        const url = profil.type === 'artiste' 
          ? `/api/clients/save`
          : `/api/proprietaires/save`;
        
        response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedProfil),
        });
      }

      if (!response.ok) throw new Error("Erreur lors de la mise à jour du profil");
      
      // Si l'utilisateur a changé d'image et qu'il y avait une ancienne image, la supprimer
      if (fileToUpload && oldPublicId && oldPublicId !== finalPublicId) {
        await deleteCloudinaryImage(oldPublicId);
      }
      
      showSnackbar("Profil mis à jour avec succès !", "success");

      setPublicId(finalPublicId); 
      setLocalImage(null); // Nettoyer l'aperçu
      setFileToUpload(null);
      
      // Mettre à jour les données selon le mode d'authentification
      if (token && authUser) {
        // Mise à jour des données JWT
        const updatedAuthUser = {
          ...JSON.parse(localStorage.getItem('authUser')),
          nom: profil.nom,
          photo_url: finalPublicId
        };
        localStorage.setItem('authUser', JSON.stringify(updatedAuthUser));
        
        // Déclencher l'événement d'authentification
        const authEvent = new CustomEvent('authChanged');
        window.dispatchEvent(authEvent);
      } else {
        // Mise à jour des données legacy
        const updatedUser = {
          ...currentUser,
          nom: profil.nom
        };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        // Déclencher l'événement avec les données mises à jour
        const event = new CustomEvent('userUpdated', { detail: updatedUser });
        window.dispatchEvent(event);
      }
      
    } catch (error) {
      console.error(error);
      showSnackbar("Erreur lors de la mise à jour du profil", "error");
    }
  };

  const cld = new Cloudinary({ cloud: { cloudName: "dpszia6xf" } });
  const img = cld.image(publicId);

  // Si aucun profil n'est chargé, afficher un message de chargement
  if (!profil.id) {
    return (
      <div className="profil-container">
        <div className="form-wrapper-profil">
          <h2>Chargement du profil...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="profil-container">
      <div className="form-wrapper-profil">
        <h2>Modifier mon profil {profil.type === 'proprietaire' ? '(Propriétaire)' : '(Artiste)'}</h2>
        <form onSubmit={handleSubmit}>
          <label>
            <div className="photo-upload-container">
              {localImage ? (
                <img src={localImage} alt="Aperçu" className="profil-photo" />
              ) : publicId ? (
                <AdvancedImage cldImg={img} className="profil-photo" />
              ) : (
                <img src="logo512.png" alt="Photo de profil" className="profil-photo" />
              )}
              <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} />
            </div>
            <label id="profil_button" htmlFor="file-upload" className="register-btn">
              Changer de photo
            </label>
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