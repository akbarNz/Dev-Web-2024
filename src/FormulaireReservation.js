import { useState, useEffect } from "react";

const ReservationForm = ({ reservation, setReservation, prixMin, prixMax, noteMin, selectedEquipements }) => {
  const [studios, setStudios] = useState([]);
  const [users, setUsers] = useState([]);
  const [timeDifference, setTimeDifference] = useState(0);
  const [prixTotal, setPrixTotal] = useState(0);
  const [currentStudioIndex, setCurrentStudioIndex] = useState(0);

  useEffect(() => {
    // Récupération des studios avec des valeurs par défaut pour prixMin et prixMax
    console.log(selectedEquipements)
    const validNoteMin = noteMin ?? 0;
    fetch(`http://localhost:5001/reserv?prixMin=${prixMin}&prixMax=${prixMax}&noteMin=${validNoteMin}&selectedEquipements=${encodeURIComponent(JSON.stringify(selectedEquipements))}`)
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
  }, [prixMin, prixMax, noteMin, selectedEquipements]);

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
      
      // Mettre à jour le prix total dans l'objet reservation
      setReservation(prev => ({
        ...prev,
        prix_total: total
      }));
      
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
      calculatePrixTotal(reservation.studio_id, diff);
    }
  };

  const handleStudioSelect = (studioId) => {
    setReservation(prev => ({
      ...prev,
      studio_id: studioId
    }));
    calculatePrixTotal(studioId, timeDifference);
  };

  const handlePrevStudio = () => {
    if (currentStudioIndex > 0) {
      setCurrentStudioIndex(currentStudioIndex - 1);
    }
  };

  const handleNextStudio = () => {
    if (currentStudioIndex < studios.length - 1) {
      setCurrentStudioIndex(currentStudioIndex + 1);
    }
  };

  const handleReservationSubmit = async (e) => {
    e.preventDefault();
    try {
      // Préparer les données selon le format attendu par l'API
      const reservationData = {
        artiste_id: parseInt(reservation.artiste_id),
        studio_id: parseInt(reservation.studio_id),
        date_reservation: reservation.date_reservation,
        nbr_personne: parseInt(reservation.nbr_personne),
        heure_debut: reservation.heure_debut,
        heure_fin: reservation.heure_fin,
        prix_total: prixTotal 
      };

      console.log("Données envoyées:", reservationData);

      // Utiliser la route /reserve au lieu de /reserv
      const response = await fetch("http://localhost:5001/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reservationData),
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
        <select name="artiste_id" value={reservation.artiste_id} onChange={handleReservationChange} required>
          <option value="">Sélectionnez votre nom</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>{user.nom}</option>
          ))}
        </select>

        <label>Choisir un studio</label>
        <div className="studio-selection-container">
          <button 
            type="button" 
            className="studio-nav-button studio-prev" 
            onClick={handlePrevStudio}
            disabled={currentStudioIndex === 0}
          >
            previous
          </button>
          
          <div className="studio-cards-container">
            {studios.length > 0 && (
              <div 
                className={`studio-card ${reservation.studio_id === studios[currentStudioIndex].id_stud ? 'selected' : ''}`}
                onClick={() => handleStudioSelect(studios[currentStudioIndex].id_stud)}
              >
                <img 
                  src={studios[currentStudioIndex].image_url || "/api/placeholder/300/200"} 
                  alt={studios[currentStudioIndex].nom_stud} 
                  className="studio-image"
                />
                <div className="studio-info">
                  <h3>{studios[currentStudioIndex].nom_stud}</h3>
                  <p className="studio-price">{studios[currentStudioIndex].prix_par_heure}€/heure</p>
                </div>
              </div>
            )}
          </div>
          
          <button 
            type="button" 
            className="studio-nav-button studio-next" 
            onClick={handleNextStudio}
            disabled={studios.length === 0 || currentStudioIndex === studios.length - 1}
          >
            next
          </button>
        </div>

        <label>Date de réservation</label>
        <input type="date" name="date_reservation" value={reservation.date_reservation} onChange={handleReservationChange} required />

        <label>Nombre de personnes</label>
        <input type="number" name="nbr_personne" value={reservation.nbr_personne} onChange={handleReservationChange} required min="1" />

        <label>Heure de début</label>
        <input type="time" name="heure_debut" value={reservation.heure_debut} onChange={handleReservationChange} required />

        <label>Heure de fin</label>
        <input type="time" name="heure_fin" value={reservation.heure_fin} onChange={handleReservationChange} required />

        <label>Prix total :</label>
        <span id="prixTotal">{prixTotal.toFixed(2)}€</span>

        <button type="submit">Réserver</button>
      </form>
    </div>
  );
};

export default ReservationForm;