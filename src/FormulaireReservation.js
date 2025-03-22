import { useState, useEffect } from "react";

const ReservationForm = ({ reservation, setReservation }) => {
  const [studios, setStudios] = useState([]);
  const [artistes, setArtistes] = useState([]);

  useEffect(() => {
    // Fonction générique pour gérer les fetch
    const fetchData = async (url, setter, label) => {
      try {
        const res = await fetch(url);
        const data = await res.json();
        setter(data);
        console.log(`${label} chargés:`, data);
      } catch (err) {
        console.error(`Erreur chargement ${label}:`, err);
      }
    };

    // Charger les studios, utilisateurs et artistes
    fetchData("http://localhost:5002/reserv?prixMin=0&prixMax=1000", setStudios, "Studios");
    fetchData("http://localhost:5002/artiste", setArtistes, "Artistes");
  }, []);

  // Gestion du changement de la réservation
  const handleReservationChange = (e) => {
    setReservation((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Envoi du formulaire
  const handleReservationSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5002/reserv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reservation),
      });
      const result = await response.json();
      alert(result.message);
    } catch (error) {
      console.error("Erreur lors de la réservation :", error);
    }
  };

  return (
    <div className="reservation-form">
      <h1>Réserver un studio</h1>
      <form onSubmit={handleReservationSubmit}>
        {/* Sélection de l'utilisateur */}
        <label>Votre nom</label>
        <select
          name="nom"
          value={reservation?.nom || ""}
          onChange={handleReservationChange}
          required
        >
          <option value="">Sélectionnez votre nom</option>
          {artistes.map((user) => (
            <option key={user.id} value={user.id}>
              {user.nom}
            </option>
          ))}
        </select>

        {/* Sélection du studio */}
        <label>Choisir un studio</label>
        <select
          name="studio"
          value={reservation?.studio || ""}
          onChange={handleReservationChange}
          required
        >
          <option value="">Sélectionnez un studio</option>
          {studios.map((studio) => (
            <option key={studio.id_stud} value={studio.id_stud}>
              {studio.nom_stud}
            </option>
          ))}
        </select>

        {/* Sélection de l'artiste */}
        <label>Choisir un artiste</label>
        <select
          name="artiste"
          value={reservation?.artiste || ""}
          onChange={handleReservationChange}
          required
        >
          <option value="">Sélectionnez un artiste</option>
          {artistes.map((artiste) => (
            <option key={artiste.id} value={artiste.id}>
              {artiste.nom}
            </option>
          ))}
        </select>

        {/* Autres champs */}
        <label>Date de réservation</label>
        <input
          type="date"
          name="date_reservation"
          value={reservation?.date_reservation || ""}
          onChange={handleReservationChange}
          required
        />

        <label>Nombre de personnes</label>
        <input
          type="number"
          name="nbr_personne"
          value={reservation?.nbr_personne || ""}
          onChange={handleReservationChange}
          required
          min="1"
        />

        <label>Heure de début</label>
        <input
          type="time"
          name="heure_debut"
          value={reservation?.heure_debut || ""}
          onChange={handleReservationChange}
          required
        />

        <label>Heure de fin</label>
        <input
          type="time"
          name="heure_fin"
          value={reservation?.heure_fin || ""}
          onChange={handleReservationChange}
          required
        />

        <button type="submit">Réserver</button>
      </form>
    </div>
  );
};

export default ReservationForm;