import { useState, useEffect } from "react";
import { InputLabel, Select, MenuItem, CircularProgress, Box } from "@mui/material";
import { db } from "./firebase";
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
  const [isLoading, setIsLoading] = useState(true);

  // Initialisation des champs de réservation
  useEffect(() => {
    setReservation(prev => ({
      client_id: prev.client_id || "",
      studio_id: prev.studio_id || "",
      date_reservation: prev.date_reservation || "",
      nbr_personne: prev.nbr_personne || 1,
      heure_debut: prev.heure_debut || "",
      heure_fin: prev.heure_fin || "",
      prix_total: prev.prix_total || 0
    }));
  }, [setReservation]);

  // Chargement initial de tous les studios et des utilisateurs
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [studioRes, userRes] = await Promise.all([
          fetch("http://localhost:5001/api/studio"),
          fetch("http://localhost:5001/api/clients/artistes"),
        ]);
        const [studioData, userData] = await Promise.all([
          studioRes.json(),
          userRes.json(),
        ]);
        setStudios(studioData);
        setUsers(userData);
      } catch (err) {
        console.error("Erreur chargement initial:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    // Ne fait rien si aucun filtre n'est défini
    if (prixMin === null && prixMax === null && noteMin === null && !selectedEquipements?.length) {
      return;
    }
  
    const fetchFilteredStudios = async () => {
      try {
        const response = await fetch(
          `http://localhost:5001/api/studio/filter?prixMin=${prixMin || 0}&prixMax=${prixMax || 1000}&noteMin=${noteMin || 0}&selectedEquipements=${encodeURIComponent(
            JSON.stringify(selectedEquipements || [])
          )}`
        );
        const data = await response.json();
        setStudios(data);
      } catch (err) {
        console.error("Erreur filtre studios:", err);
      }
    };
    fetchFilteredStudios();
  }, [prixMin, prixMax, noteMin, selectedEquipements]);

  const calculateTimeDifference = (startTime, endTime) => {
    if (startTime && endTime) {
      const start = new Date(`2023-01-01T${startTime}`);
      const end = new Date(`2023-01-01T${endTime}`);
      return (end - start) / (1000 * 60 * 60); // différence en heures
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
    setReservation(prev => ({ ...prev, [name]: value }));

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
      client_id: parseInt(reservation.client_id),
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
      await addDoc(collection(db, "reservations"), {
        nbr_personne: reservationData.nbr_personne,
        firebase_created_at: serverTimestamp()
      });

      const response = await fetch("http://localhost:5001/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reservationData),
      });

      if (!response.ok) throw new Error("Erreur backend");

      alert("Réservation enregistrée avec succès !");
    } catch (error) {
      console.error("Erreur:", error);
      alert(`Erreur lors de l'enregistrement: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="reservation-form">
      <h1>Réserver un studio</h1>
      <form onSubmit={handleReservationSubmit}>
        <InputLabel id="artiste-select-label">Votre nom</InputLabel>
        <Select
          sx={{ width: '100%', height: '45px', mb: 2 }}
          labelId="artiste-select-label"
          id="artiste-select"
          name="client_id"
          value={reservation.client_id || ""}
          onChange={handleReservationChange}
          required
        >
          <MenuItem value=""><em>Sélectionnez votre nom</em></MenuItem>
          {users.map((user) => (
            <MenuItem key={user.id} value={user.id.toString()}>
              {user.nom}
            </MenuItem>
          ))}
        </Select>

        <InputLabel id="studio-select-label">Choisir un studio</InputLabel>
        <Select
          sx={{ width: '100%', height: '45px', mb: 2 }}
          labelId="studio-select-label"
          id="studio-select"
          name="studio_id"
          value={reservation.studio_id || ""}
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

        <InputLabel htmlFor="date_reservation">Date de réservation</InputLabel>
        <input
          type="date"
          id="date_reservation"
          name="date_reservation"
          value={reservation.date_reservation}
          onChange={handleReservationChange}
          required
          style={{ width: '100%', padding: '8px', marginBottom: '16px' }}
        />

        <InputLabel htmlFor="nbr_personne">Nombre de personnes</InputLabel>
        <input
          type="number"
          id="nbr_personne"
          name="nbr_personne"
          value={reservation.nbr_personne}
          onChange={handleReservationChange}
          required
          min="1"
          style={{ width: '100%', padding: '8px', marginBottom: '16px' }}
        />

        <InputLabel htmlFor="heure_debut">Heure de début</InputLabel>
        <input
          type="time"
          id="heure_debut"
          name="heure_debut"
          value={reservation.heure_debut}
          onChange={handleReservationChange}
          required
          style={{ width: '100%', padding: '8px', marginBottom: '16px' }}
        />

        <InputLabel htmlFor="heure_fin">Heure de fin</InputLabel>
        <input
          type="time"
          id="heure_fin"
          name="heure_fin"
          value={reservation.heure_fin}
          onChange={handleReservationChange}
          required
          style={{ width: '100%', padding: '8px', marginBottom: '16px' }}
        />

        <Box sx={{ mb: 2 }}>
          <InputLabel>Prix total :</InputLabel>
          <span id="prixTotal" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
            {prixTotal.toFixed(2)}€
          </span>
        </Box>

        <button 
          type="submit" 
          disabled={isSubmitting}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: isSubmitting ? '#cccccc' : '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          {isSubmitting ? "Enregistrement..." : "Réserver"}
        </button>
      </form>
    </div>
  );
};

export default ReservationForm;