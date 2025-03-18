const ReservationForm = ({ reservation, setReservation }) => {
    const handleReservationChange = (e) => {
      setReservation({ ...reservation, [e.target.name]: e.target.value });
    };
  
    const handleReservationSubmit = (e) => {
      e.preventDefault();
      console.log("Réservation envoyée:", reservation);
    };
  
    return (
      <div className="reservation-form">
        <h1>Réserver un studio</h1>
        <form onSubmit={handleReservationSubmit}>
          <label>Votre nom</label>
          <select name="nom" value={reservation.nom} onChange={handleReservationChange}></select>
  
          <label>Choisir un studio</label>
          <select name="studio" value={reservation.studio} onChange={handleReservationChange} required></select>
  
          <label>Date de réservation</label>
          <input type="date" name="date_reservation" value={reservation.date_reservation} onChange={handleReservationChange} required />
  
          <label>Nombre de personnes</label>
          <input type="number" name="nbr_personne" value={reservation.nbr_personne} onChange={handleReservationChange} />
  
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
  