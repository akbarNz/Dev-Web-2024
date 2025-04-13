import { useState, useEffect } from "react";
import { InputLabel, Select, MenuItem } from "@mui/material";
import { db } from "./firebase"; // Assurez-vous que ce chemin est correct
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const ReservationForm = ({
  reservation,
  setReservation,
  prixMin,
  prixMax,
  noteMin,
  selectedEquipements,
}) => {
  const [studios, setStudios] = useState([]);
  const [users, setUsers] = useState([]);
  const [timeDifference, setTimeDifference] = useState(0);
  const [prixTotal, setPrixTotal] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Récupération des studios
    const validNoteMin = noteMin ?? 0;
    fetch(
      `http://localhost:5001/reserv?prixMin=${prixMin}&prixMax=${prixMax}&noteMin=${validNoteMin}&selectedEquipements=${encodeURIComponent(
        JSON.stringify(selectedEquipements)
      )}`
    )
      .then((res) => res.json())
      .then((data) => setStudios(data))
      .catch((err) => console.error("Erreur chargement studios:", err));

    // Récupération des utilisateurs
    fetch("http://localhost:5001/artiste")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Erreur chargement utilisateurs:", err));
  }, [prixMin, prixMax, noteMin, selectedEquipements]);

  const calculateTimeDifference = (startTime, endTime) => {
    if (startTime && endTime) {
      const start = new Date(`2023-01-01T${startTime}`);
      const end = new Date(`2023-01-01T${endTime}`);
      const diffMinutes = (end - start) / (1000 * 60);
      return diffMinutes / 60;
    }
    return 0;
  };

  const calculatePrixTotal = (studioId, timeDiff) => {
    const selectedStudio = studios.find(
      (studio) => studio.id_stud === parseInt(studioId)
    );
    if (selectedStudio) {
      const total = timeDiff * selectedStudio.prix_par_heure;
      setPrixTotal(total);
      setReservation((prev) => ({
        ...prev,
        prix_total: total,
      }));
    }
  };

  const handleReservationChange = (e) => {
    const { name, value } = e.target;
    setReservation({ ...reservation, [name]: value });

    if (name === "heure_debut" || name === "heure_fin") {
      const startTime = name === "heure_debut" ? value : reservation.heure_debut;
      const endTime = name === "heure_fin" ? value : reservation.heure_fin;
      const diff = calculateTimeDifference(startTime, endTime);
      setTimeDifference(diff);
      calculatePrixTotal(reservation.studio_id, diff);
    }

    if (name === "studio_id") {
      calculatePrixTotal(value, timeDifference);
    }
  };

  const handleReservationSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const reservationData = {
      artiste_id: parseInt(reservation.artiste_id),
      studio_id: parseInt(reservation.studio_id),
      date_reservation: reservation.date_reservation,
      nbr_personne: parseInt(reservation.nbr_personne),
      heure_debut: reservation.heure_debut,
      heure_fin: reservation.heure_fin,
      prix_total: prixTotal,
      equipements: selectedEquipements,
      created_at: new Date().toISOString()
    };

    try {
      // Envoi à Firebase
      await addDoc(collection(db, "reservations"), {
        nbr_personne: reservationData.nbr_personne, // Seulement ce champ
        firebase_created_at: serverTimestamp()
      });

      // Envoi à votre backend
      const response = await fetch("http://localhost:5001/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reservationData),
      });

      if (!response.ok) throw new Error("Erreur backend");
      
      const result = await response.json();
      alert("Réservation enregistrée avec succès !");
    } catch (error) {
      console.error("Erreur:", error);
      alert(`Erreur lors de l'enregistrement: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="reservation-form">
      <h1>Réserver un studio</h1>
      <form onSubmit={handleReservationSubmit}>
        <InputLabel id="artiste-select-label">Votre nom</InputLabel>
        <Select
          sx={{ width: '100%', height: '45px' }}
          labelId="artiste-select-label"
          id="artiste-select"
          name="artiste_id"
          value={reservation.artiste_id}
          onChange={handleReservationChange}
          required
        >
          <MenuItem value=""><em>Sélectionnez votre nom</em></MenuItem>
          {users.map((user) => (
            <MenuItem key={user.id} value={user.id}>
              {user.nom}
            </MenuItem>
          ))}
        </Select>

        <InputLabel id="studio-select-label">Choisir un studio</InputLabel>
        <Select
          sx={{ width: '100%', height: '45px' }}
          labelId="studio-select-label"
          id="studio-select"
          name="studio_id"
          value={reservation.studio_id}
          onChange={handleReservationChange}
          required
        >
          <MenuItem value=""><em>Sélectionnez un studio</em></MenuItem>
          {studios.map((studio) => (
            <MenuItem key={studio.id_stud} value={studio.id_stud}>
              {studio.nom_stud} - {studio.prix_par_heure}€/h
            </MenuItem>
          ))}
        </Select>

        <label>Date de réservation</label>
        <input
          type="date"
          name="date_reservation"
          value={reservation.date_reservation}
          onChange={handleReservationChange}
          required
        />

        <label>Nombre de personnes</label>
        <input
          type="number"
          name="nbr_personne"
          value={reservation.nbr_personne}
          onChange={handleReservationChange}
          required
          min="1"
        />

        <label>Heure de début</label>
        <input
          type="time"
          name="heure_debut"
          value={reservation.heure_debut}
          onChange={handleReservationChange}
          required
        />

        <label>Heure de fin</label>
        <input
          type="time"
          name="heure_fin"
          value={reservation.heure_fin}
          onChange={handleReservationChange}
          required
        />

        <label>Prix total :</label>
        <span id="prixTotal">{prixTotal.toFixed(2)}€</span>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement..." : "Réserver"}
        </button>
      </form>
    </div>
  );
};

export default ReservationForm;