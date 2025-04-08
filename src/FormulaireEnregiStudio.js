import { useState, useEffect } from "react";
import Axios from "axios";
import { Cloudinary } from "@cloudinary/url-gen";
import { AdvancedImage } from "@cloudinary/react";

const EnregistrementForm = ({ enregistrement, setEnregistrement, onBack }) => {
  const [users, setUsers] = useState([]);
  const [publicId, setPublicId] = useState("");
  const [villes, setVille] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5001/artiste")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
      })
      .catch((err) => console.error("Erreur chargement utilisateurs:", err));

    fetch("http://localhost:5001/ville")
      .then((res) => res.json())
      .then((data) => {
        console.log("Données reçues pour villes:", data); // Ajoutez ce log
        setVille(data);
      })
      .catch((err) => console.error("Erreur chargement villes:", err));
  }, []);

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
      setEnregistrement((prev) => ({
        ...prev,
        photo_url: response.data.secure_url,
      }));
    } catch (error) {
      console.error("Erreur lors de l'upload :", error);
      alert("Erreur lors de l'upload de l'image");
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
        adresse: enregistrement.adresse,
        code_postal: enregistrement.code_postal,
        prix_par_heure: parseFloat(enregistrement.prix_par_heure),
        equipements: equipementsArray,
        photo_url: enregistrement.photo_url || "",
      };

      console.log("Données envoyées au serveur:", enregistrementData);

      const response = await fetch("http://localhost:5001/enregi", {
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
      alert("Studio enregistré avec succès!");
    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
      alert(`Erreur: ${error.message}`);
    }
  };

  return (
    <div className="enregi_form">
      <h1>Enregistrer un studio</h1>
      <form onSubmit={handleEnregistrementSubmit}>
        {/* Nouveau champ pour l'upload d'image */}
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

        <label>Artiste ?</label>
        <select
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

        <label>Nom du studio</label>
        <input
          type="text"
          name="nom_studio"
          value={enregistrement.nom_studio}
          onChange={handleEnregistrementChange}
          placeholder="Entrer le nom de votre studio"
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
