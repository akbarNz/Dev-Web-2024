import { useState, useEffect } from "react";
import Axios from "axios";
import { Cloudinary } from "@cloudinary/url-gen";
import { AdvancedImage } from "@cloudinary/react";
import { useSnackbar } from "./SnackBar";

// Condition pour éviter les erreurs en mode test
const isTestEnvironment = process.env.NODE_ENV === 'test';

const EnregistrementForm = ({ enregistrement, setEnregistrement, onBack }) => {
  const [users, setUsers] = useState([]);
  const [publicId, setPublicId] = useState("");
  const [villes, setVille] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    fetch(`/api/proprietaires`)
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
      })
      .catch((err) => console.error("Erreur chargement utilisateurs:", err));

    fetch(`/api/studio/villes`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Données reçues pour villes:", data);
        setVille(data);
      })
      .catch((err) => console.error("Erreur chargement villes:", err));
  }, []);

  // Configuration Cloudinary (seulement en environnement non-test)
  let cld = null;
  let img = null;
  
  if (!isTestEnvironment) {
    cld = new Cloudinary({ cloud: { cloudName: "dpszia6xf" } });
    if (publicId) {
      img = cld.image(publicId);
    }
  }

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
        proprietaire_id: enregistrement.artiste_id
      };

      console.log("Données envoyées au serveur:", enregistrementData);

      const response = await fetch(`/api/studio/enregistrer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(enregistrementData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur serveur: ${errorText}`);
      }

      const result = await response.json();
      console.log(result);
      showSnackbar("Studio enregistré avec succès!", "success");
    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
      showSnackbar(`Erreur: ${error.message}`, "error");
    }
  };

  return (
  <div className="enregi_form">
    <h1>Enregistrer un studio</h1>
    <form onSubmit={handleEnregistrementSubmit} data-testid="enregistrement-form">
      <label htmlFor="photo">Photo du studio</label>
      <input
        id="photo"
        type="file"
        accept="image/*"
        onChange={(e) => uploadImage(e.target.files)}
        disabled={isUploading}
      />
      {isUploading && <p>Upload en cours...</p>}
      {publicId && !isTestEnvironment && img && (
        <div style={{ marginTop: "10px" }}>
          <AdvancedImage
            cldImg={img}
            style={{ maxWidth: "200px", maxHeight: "200px" }}
          />
        </div>
      )}
      {publicId && isTestEnvironment && (
        <div style={{ marginTop: "10px" }}>
          <div data-testid="mock-cloudinary-image" style={{ maxWidth: "200px", maxHeight: "200px" }}>
            Image mockée (ID: {publicId})
          </div>
        </div>
      )}

      <label htmlFor="proprietaire">Propriétaire ?</label>
      <select
        id="proprietaire"
        name="artiste_id"
        value={enregistrement.artiste_id}
        onChange={handleEnregistrementChange}
        required
      >
        <option value="">Sélectionnez votre nom</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.nom}
          </option>
        ))}
      </select>

      <label htmlFor="nom_studio">Nom du studio</label>
      <input
        id="nom_studio"
        type="text"
        name="nom_studio"
        value={enregistrement.nom_studio}
        onChange={handleEnregistrementChange}
        placeholder="Entrer le nom de votre studio"
        required
      />

      <label htmlFor="description">Description du studio</label>
      <textarea
        id="description"
        name="description"
        value={enregistrement.description}
        onChange={handleEnregistrementChange}
        placeholder="Entrer la description de votre studio"
        required
      />

      <label htmlFor="adresse">Adresse du studio</label>
      <input
        id="adresse"
        type="text"
        name="adresse"
        value={enregistrement.adresse}
        onChange={handleEnregistrementChange}
        required
      />

      <label htmlFor="code_postal">Code postal</label>
      <select
        id="code_postal"
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

      <label htmlFor="prix_par_heure">Prix par heure (€)</label>
      <input
        id="prix_par_heure"
        type="number"
        name="prix_par_heure"
        value={enregistrement.prix_par_heure}
        onChange={handleEnregistrementChange}
        required
        min="0"
        step="0.01"
      />

      <label htmlFor="equipement">Équipements (séparés par des virgules)</label>
      <input
        id="equipement"
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