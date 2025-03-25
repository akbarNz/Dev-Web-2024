import { useState, useEffect } from "react";

const ReservationForm = ({ reservation, setReservation, prixMin, prixMax, noteMin }) => {
  const [studios, setStudios] = useState([]);
  const [users, setUsers] = useState([]);
  const [timeDifference, setTimeDifference] = useState(0);
  const [prixTotal, setPrixTotal] = useState(0);

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

  const calculateTimeDifference = (startTime, endTime) => {
    if (startTime && endTime) {
      const start = new Date(`2023-01-01T${startTime}`);
      const end = new Date(`2023-01-01T${endTime}`);

      // Calculer la différence en heures
      const diffMinutes = (end - start) / (1000 * 60);
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;

      console.log(`Différence de temps : ${hours} heures ${minutes} minutes`);
      return diffMinutes / 60;
    }
    return 0;
  };

  const calculatePrixTotal = (studioId, timeDiff) => {
    const selectedStudio = studios.find((studio) => studio.id_stud === parseInt(studioId));
    if (selectedStudio) {
      const total = timeDiff * selectedStudio.prix_par_heure;
      setPrixTotal(total);
      console.log("Prix total calculé :", total);
    }
  };

  const handleReservationChange = (e) => {
    const { name, value } = e.target;

    setReservation({ ...reservation, [name]: value });

    // Si les champs sont heure_debut ou heure_fin, calculer la différence
    if (name === 'heure_debut' || name === 'heure_fin') {
      const startTime = name === 'heure_debut' ? value : reservation.heure_debut;
      const endTime = name === 'heure_fin' ? value : reservation.heure_fin;

      const diff = calculateTimeDifference(startTime, endTime);
      setTimeDifference(diff);
      calculatePrixTotal(reservation.studio, diff);
    }

    // Si le studio change, recalculer le prix total
    if (name === 'studio') {
      calculatePrixTotal(value, timeDifference);
    }
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
      console.log(reservation.prix_par_heure);
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

        <label><strong>Heure de fin</strong></label>
        <input type="time" name="heure_fin" value={reservation.heure_fin} onChange={handleReservationChange} required />

        <label>Prix total :</label>
        <span id="prixTotal">{prixTotal.toFixed(2)}€</span>

        <button type="submit">Réserver</button>
      </form>
    </div>
  );
};

export default ReservationForm;