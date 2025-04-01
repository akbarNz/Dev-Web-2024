import { useState, useEffect } from "react";

const EnregistrementForm = ({ enregistrement, setEnregistrement }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5001/artiste")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        console.log("Utilisateurs chargés:", data);
      })
      .catch((err) => console.error("Erreur chargement utilisateurs:", err));
  }, []); 

  const handleEnregistrementChange = (e) => {
    const { name, value } = e.target;
    setEnregistrement({ ...enregistrement, [name]: value });
  };

  const handleEnregistrementSubmit = async (e) => {
    e.preventDefault();
    try {
      const enregistrementData = {
        artiste_id: parseInt(enregistrement.artiste_id),
        nom_stud: enregistrement.nom_studio,
        adresse: enregistrement.adresse,
        prix_par_heure: parseFloat(enregistrement.prix_par_heure),
        equipement: enregistrement.equipement
      };

      console.log('Envoie des données :', enregistrementData);
      
      const response = await fetch("http://localhost:5001/enregi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(enregistrementData)
      });
      
      const result = await response.json();
      alert(result.message);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
    }
  };

  return (
    <div className="enregi_form">
      <h1>Enregistrer un studio</h1>
      <form onSubmit={handleEnregistrementSubmit}>
        <label>Artiste ?</label>
        <select name="artiste_id" value={enregistrement.artiste_id} onChange={handleEnregistrementChange} required>
          <option value="">Sélectionnez votre nom</option>
          {users.map((user) => (<option key={user.id} value={user.id}>{user.nom}</option>))}
        </select>

        <label>Nom du studio</label>
        <input type="text" name="nom_studio" value={enregistrement.nom_studio} onChange={handleEnregistrementChange} placeholder="Entrer le nom de votre studio" required />

        <label>Entrer l'adresse du studio</label>
        <input type="text" name="adresse" value={enregistrement.adresse} onChange={handleEnregistrementChange} required />

        <label>Prix du studio par heure</label>
        <input type="number" name="prix_par_heure" value={enregistrement.prix_par_heure} onChange={handleEnregistrementChange} required />

        <label>Equipements en plus ?</label>
        <input type="text" name="equipement" value={enregistrement.equipement} onChange={handleEnregistrementChange} required />

        <button type="submit">Enregistrer le studio</button>
      </form>
    </div>
  );
};

export default EnregistrementForm;