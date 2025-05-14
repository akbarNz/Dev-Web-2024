import { useState, useEffect } from "react";
import Axios from "axios";
import { Cloudinary } from "@cloudinary/url-gen";
import { AdvancedImage } from "@cloudinary/react";
import { useSnackbar } from "./SnackBar";

const EnregistrementForm = ({ enregistrement, setEnregistrement, onBack }) => {
  const [publicId, setPublicId] = useState("");
  const [villes, setVille] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    // Récupérer l'utilisateur connecté
    const fetchCurrentUser = () => {
      // Vérifier si l'utilisateur est authentifié avec JWT
      const token = localStorage.getItem('token');
      const authUser = localStorage.getItem('authUser');
      
      if (token && authUser) {
        // Utilisateur authentifié avec JWT
        const user = JSON.parse(authUser);
        if (user.type === 'proprio') {
          setCurrentUser(user);
          setEnregistrement(prev => ({
            ...prev,
            artiste_id: user.id
          }));
        } else {
          showSnackbar("Seuls les propriétaires peuvent enregistrer un studio", "error");
          onBack(); // Retourner à la page précédente si ce n'est pas un propriétaire
        }
      } else {
        // Méthode legacy
        const legacyUser = JSON.parse(localStorage.getItem('currentUser'));
        if (legacyUser && legacyUser.type === 'proprietaire') {
          setCurrentUser(legacyUser);
          setEnregistrement(prev => ({
            ...prev,
            artiste_id: legacyUser.id
          }));
        } else {
          showSnackbar("Seuls les propriétaires peuvent enregistrer un studio", "error");
          onBack(); // Retourner à la page précédente si ce n'est pas un propriétaire
        }
      }
    };

    fetchCurrentUser();

    // Récupérer la liste des villes
    fetch(`/api/studio/villes`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Données reçues pour villes:", data);
        setVille(data);
      })
      .catch((err) => console.error("Erreur chargement villes:", err));
  }, [setEnregistrement, onBack, showSnackbar]);

  // Configuration Cloudinary
  const cld = new Cloudinary({ cloud: { cloudName: "dpszia6xf" } });
  const img = cld.image(publicId);

  const uploadImage = async (files) => {
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", files[0]);
    formData.append("upload_preset", "rnvyghre");
  
    try {
      const response = await Axios.post(
        "https://api.cloudinary.com/v1_1/dpszia6xf/image/upload",
        formData
      );
      setPublicId(response.data.public_id);
      
      // Utiliser public_id au lieu de secure_url
      setEnregistrement((prev) => ({
        ...prev,
        photo_url: response.data.public_id,
      }));
    } catch (error) {
      console.error("Erreur lors de l'upload :", error);
      showSnackbar("Erreur lors de l'upload de l'image", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEnregistrementChange = (e) => {
    const { name, value } = e.target;
    setEnregistrement({ ...enregistrement, [name]: value });
  };

  const handleEnregistrementSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      showSnackbar("Vous devez être connecté pour enregistrer un studio", "error");
      return;
    }
    
    try {
      const equipementsArray = enregistrement.equipement
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item !== "");

      const enregistrementData = {
        nom: enregistrement.nom_studio,
        description: enregistrement.description,
        adresse: enregistrement.adresse,
        code_postal: enregistrement.code_postal,
        prix_par_heure: parseFloat(enregistrement.prix_par_heure),
        equipements: equipementsArray,
        photo_url: enregistrement.photo_url || "",
        proprietaire_id: currentUser.id
      };

      console.log("Données envoyées au serveur:", enregistrementData);

      // Vérifier si l'utilisateur est authentifié avec JWT
      const token = localStorage.getItem('token');
      let response;
      
      if (token) {
        // Utiliser la route sécurisée
        response = await fetch(`/api/studio/secure/enregistrer`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(enregistrementData),
        });
      } else {
        // Utiliser l'ancienne route
        response = await fetch(`/api/studio/enregistrer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(enregistrementData),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur serveur: ${errorText}`);
      }

      const result = await response.json();
      console.log(result);
      showSnackbar("Studio enregistré avec succès!", "success");
      onBack(); // Retourner à la page précédente après l'enregistrement
    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
      showSnackbar(`Erreur: ${error.message}`, "error");
    }
  };

  // Si aucun utilisateur propriétaire n'est trouvé, ne pas afficher le formulaire
  if (!currentUser) {
    return (
      <div className="enregi_form">
        <h1>Accès non autorisé</h1>
        <p>Vous devez être connecté en tant que propriétaire pour enregistrer un studio.</p>
        <button
          id="backbutton"
          type="button"
          className="register-btn"
          onClick={onBack}
        >
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="enregi_form">
      <h1>Enregistrer un studio</h1>
      <p>Connecté en tant que: <strong>{currentUser.nom}</strong></p>
      <form onSubmit={handleEnregistrementSubmit}>
        {}
        <label>
          Photo du studio
          <input
            type="file"
            accept="image/*"
            onChange={(e) => uploadImage(e.target.files)}
            disabled={isUploading}
          />
          {isUploading && <p>Upload en cours...</p>}
          {publicId && (
            <div style={{ marginTop: "10px" }}>
              <AdvancedImage
                cldImg={img}
                style={{ maxWidth: "200px", maxHeight: "200px" }}
              />
            </div>
          )}
        </label>

        <label>Nom du studio</label>
        <input
          type="text"
          name="nom_studio"
          value={enregistrement.nom_studio}
          onChange={handleEnregistrementChange}
          placeholder="Entrer le nom de votre studio"
          required
        />

        <label>Description du studio</label>
          <textarea
          type="text"
          name="description"
          value={enregistrement.description}
          onChange={handleEnregistrementChange}
          placeholder="Entrer la description de votre studio"
          required
        />

        <label>Adresse du studio</label>
        <input
          type="text"
          name="adresse"
          value={enregistrement.adresse}
          onChange={handleEnregistrementChange}
          required
        />

        <select
          name="code_postal"
          value={enregistrement.code_postal}
          onChange={handleEnregistrementChange}
          required
        >
          <option value="">Sélectionnez un code postal</option>
          {villes.map((ville) => (
            <option key={ville.code_postal} value={ville.code_postal}>
              {ville.code_postal} -{" "}
              {ville.nom || ville.nom_ville || ville.name || ville.ville}
            </option>
          ))}
        </select>

        <label>Prix par heure (€)</label>
        <input
          type="number"
          name="prix_par_heure"
          value={enregistrement.prix_par_heure}
          onChange={handleEnregistrementChange}
          required
          min="0"
          step="0.01"
        />

        <label>Equipements (séparés par des virgules)</label>
        <input
          type="text"
          name="equipement"
          value={enregistrement.equipement}
          onChange={handleEnregistrementChange}
          placeholder="Microphone, Casque, Console, Ampli..."
          required
        />
        <small>Saisissez vos équipements séparés par des virgules</small>

        <button type="submit" disabled={isUploading}>
          {isUploading ? "Enregistrement en cours..." : "Enregistrer le studio"}
        </button>
      </form>
      <button
        id="backbutton"
        type="button"
        className="register-btn"
        onClick={onBack}
      >
        Retour
      </button>
    </div>
  );
};

export default EnregistrementForm;