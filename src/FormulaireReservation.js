import { useState, useEffect } from "react";

const ReservationForm = ({ reservation, setReservation, prixMin, prixMax, noteMin }) => {
  const [studios, setStudios] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Récupération des studios avec des valeurs par défaut pour prixMin et prixMax
    fetch(`http://localhost:5001/reserv?prixMin=${prixMin}&prixMax=${prixMax}&noteMin=${noteMin}`)
      .then((res) => res.json())
      .then((data) => {
        setStudios(data);
        console.log("Studios chargés:", data);
      })
      .catch((err) => console.error("Erreur chargement studios:", err));
    
    // Récupération des utilisateurs
    fetch("http://localhost:5001/artiste")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        console.log("Utilisateurs chargés:", data);
      })
      .catch((err) => console.error("Erreur chargement utilisateurs:", err));
  }, [prixMin, prixMax, noteMin]);

  const handleReservationChange = (e) => {
    setReservation({ ...reservation, [e.target.name]: e.target.value });
  };

  const handleReservationSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5001/reserv", {
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
        <label>Votre nom</label>
        <select name="nom" value={reservation.nom} onChange={handleReservationChange} required>
          <option value="">Sélectionnez votre nom</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>{user.nom}</option>
          ))}
        </select>

        <label>Choisir un studio</label>
        <select name="studio" value={reservation.studio} onChange={handleReservationChange} required>
          <option value="">Sélectionnez un studio</option>
          {studios.map((studio) => (
            <option key={studio.id_stud} value={studio.id_stud}>{studio.nom_stud} - Prix : {studio.prix_par_heure}</option>
          ))}
        </select>

        <label>Date de réservation</label>
        <input type="date" name="date_reservation" value={reservation.date_reservation} onChange={handleReservationChange} required />

        <label>Nombre de personnes</label>
        <input type="number" name="nbr_personne" value={reservation.nbr_personne} onChange={handleReservationChange} required min="1" />

        <label>Heure de début</label>
        <input type="time" name="heure_debut" value={reservation.heure_debut} onChange={handleReservationChange} required />

        <label>Heure de fin</label>
        <input type="time" name="heure_fin" value={reservation.heure_fin} onChange={handleReservationChange} required />

        <button type="submit">Réserver</button>
      </form>
    </div>
  );
};

export default ReservationForm;
