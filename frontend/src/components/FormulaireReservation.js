import { useState, useEffect } from "react";
import {
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Box,
} from "@mui/material";
import { useSnackbar } from "./SnackBar";

const ReservationForm = ({
  reservation,
  setReservation,
  prixMin,
  prixMax,
  noteMin,
  selectedEquipements,
}) => {
  const [studios, setStudios] = useState([]);
  const [timeDifference, setTimeDifference] = useState(0);
  const [prixTotal, setPrixTotal] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const { showSnackbar } = useSnackbar();

  // Récupérer l'utilisateur connecté
  useEffect(() => {
    const fetchCurrentUser = () => {
      // Vérifier si l'utilisateur est authentifié avec JWT
      const token = localStorage.getItem("token");
      const authUser = localStorage.getItem("authUser");

      if (token && authUser) {
        // Utilisateur authentifié avec JWT
        const user = JSON.parse(authUser);
        if (user.type === "client") {
          setCurrentUser(user);
          setReservation((prev) => ({
            ...prev,
            client_id: user.id,
          }));
        } else {
          showSnackbar(
            "Seuls les artistes peuvent faire une réservation",
            "warning"
          );
        }
      } else {
        // Méthode legacy
        const legacyUser = JSON.parse(localStorage.getItem("currentUser"));
        if (legacyUser && legacyUser.type === "artiste") {
          setCurrentUser(legacyUser);
          setReservation((prev) => ({
            ...prev,
            client_id: legacyUser.id,
          }));
        } else {
          showSnackbar(
            "Veuillez vous connecter en tant qu'artiste pour réserver",
            "warning"
          );
        }
      }
    };

    fetchCurrentUser();
  }, [setReservation, showSnackbar]);

  // Initialisation des champs de réservation
  useEffect(() => {
    setReservation((prev) => ({
      client_id: prev.client_id || "",
      studio_id: prev.studio_id || "",
      date_reservation: prev.date_reservation || "",
      nbr_personne: prev.nbr_personne || 1,
      heure_debut: prev.heure_debut || "",
      heure_fin: prev.heure_fin || "",
      prix_total: prev.prix_total || 0,
    }));
  }, [setReservation]);

  // Chargement initial de tous les studios
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const studioRes = await fetch(`/api/studio`);
        const studioData = await studioRes.json();
        setStudios(studioData);
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
    if (
      prixMin === null &&
      prixMax === null &&
      noteMin === null &&
      !selectedEquipements?.length
    ) {
      return;
    }

    const fetchFilteredStudios = async () => {
      try {
        const response = await fetch(
          `/api/studio/filter?prixMin=${prixMin || 0}&prixMax=${
            prixMax || 1000
          }&noteMin=${noteMin || 0}&selectedEquipements=${encodeURIComponent(
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
      const [startHours, startMinutes] = startTime.split(":").map(Number);
      const [endHours, endMinutes] = endTime.split(":").map(Number);

      let totalHours = endHours - startHours;
      let totalMinutes = endMinutes - startMinutes;

      // Si l'heure de fin est avant l'heure de début, on ajoute 24h
      if (totalHours < 0 || (totalHours === 0 && totalMinutes < 0)) {
        totalHours += 24;
      }

      // Convertir les minutes en fraction d'heure
      const timeDiff = totalHours + totalMinutes / 60;

      return timeDiff;
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
    setReservation((prev) => ({ ...prev, [name]: value }));

    if (name === "heure_debut" || name === "heure_fin") {
      const startTime =
        name === "heure_debut" ? value : reservation.heure_debut;
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

    if (!currentUser) {
      showSnackbar(
        "Vous devez être connecté pour faire une réservation",
        "error"
      );
      return;
    }

    setIsSubmitting(true);

    const reservationData = {
      client_id: parseInt(currentUser.id),
      studio_id: parseInt(reservation.studio_id),
      date_reservation: reservation.date_reservation,
      nbr_personne: parseInt(reservation.nbr_personne),
      heure_debut: reservation.heure_debut,
      heure_fin: reservation.heure_fin,
      prix_total: prixTotal,
      equipements: selectedEquipements,
      created_at: new Date().toISOString(),
    };

    try {
      await fetch(`/api/firebase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nbr_personne: reservationData.nbr_personne }),
      });

      // Vérifier si l'utilisateur est authentifié avec JWT
      const token = localStorage.getItem("token");
      let response;

      if (token) {
        // Utiliser la route sécurisée
        response = await fetch(`/api/reservations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(reservationData),
        });
      } else {
        // Utiliser l'ancienne route
        response = await fetch(`/api/reservations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reservationData),
        });
      }

      if (!response.ok) throw new Error("Erreur backend");

      showSnackbar("Réservation enregistrée avec succès !", "success");

      // Réinitialiser le formulaire
      setReservation({
        client_id: currentUser.id,
        studio_id: "",
        date_reservation: "",
        nbr_personne: 1,
        heure_debut: "",
        heure_fin: "",
        prix_total: 0,
      });
      setPrixTotal(0);
    } catch (error) {
      console.error("Erreur:", error);
      showSnackbar(
        `Erreur lors de l'enregistrement: ${error.message}`,
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Si aucun utilisateur artiste n'est trouvé, afficher un message
  if (!currentUser) {
    return (
      <div className="reservation-form">
        <h1>Réserver un studio</h1>
        <p>
          Vous devez être connecté en tant qu'artiste pour faire une
          réservation.
        </p>
        <p>Veuillez vous connecter ou vous inscrire.</p>
      </div>
    );
  }

  return (
    <div className="reservation-form">
      <h1>Réserver un studio</h1>
      <p>
        Connecté en tant que: <strong>{currentUser.nom}</strong>
      </p>
      <br></br>
      <form onSubmit={handleReservationSubmit}>
        <InputLabel id="studio-select-label">Choisir un studio</InputLabel>
        <Select
          sx={{ width: "100%", height: "45px", mb: 2 }}
          labelId="studio-select-label"
          id="studio-select"
          name="studio_id"
          value={reservation.studio_id || ""}
          onChange={handleReservationChange}
          required
        >
          <MenuItem value="">
            <em>Sélectionnez un studio</em>
          </MenuItem>
          {studios.map((studio) => (
            <MenuItem key={studio.id_stud} value={studio.id_stud}>
              {studio.nom_stud} - {studio.prix_par_heure}€/h - ⭐{" "}
              {studio.moyenne_note != null ? Number(studio.moyenne_note).toFixed(2) : "N/A"}
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
          style={{ width: "100%", padding: "8px", marginBottom: "16px" }}
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
          style={{ width: "100%", padding: "8px", marginBottom: "16px" }}
        />

        <InputLabel htmlFor="heure_debut">Heure de début</InputLabel>
        <input
          type="time"
          id="heure_debut"
          name="heure_debut"
          value={reservation.heure_debut}
          onChange={handleReservationChange}
          required
          style={{ width: "100%", padding: "8px", marginBottom: "16px" }}
        />

        <InputLabel htmlFor="heure_fin">Heure de fin</InputLabel>
        <input
          type="time"
          id="heure_fin"
          name="heure_fin"
          value={reservation.heure_fin}
          onChange={handleReservationChange}
          required
          style={{ width: "100%", padding: "8px", marginBottom: "16px" }}
        />

        <Box sx={{ mb: 2 }}>
          <InputLabel>Prix total :</InputLabel>
          <span
            id="prixTotal"
            style={{ fontSize: "1.2rem", fontWeight: "bold" }}
          >
            {prixTotal.toFixed(2)}€
          </span>
        </Box>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: isSubmitting ? "#cccccc" : "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          {isSubmitting ? "Enregistrement..." : "Réserver"}
        </button>
      </form>
    </div>
  );
};

export default ReservationForm;
