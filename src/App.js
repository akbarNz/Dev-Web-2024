import { useState } from "react";
import FilterForm from "./Filtrage";
import ReservationForm from "./FormulaireReservation";
import Header from "./Header";
import Wrapper from "./Wrapper";

const StudioReservation = () => {
  const [filters, setFilters] = useState({
    prixMin: "",
    prixMax: "",
    noteMin: 0,
    noteMax: 5,
  });

  const [reservation, setReservation] = useState({
    nom: "",
    studio: "",
    date_reservation: "",
    nbr_personne: "",
    heure_debut: "",
    heure_fin: "",
  });

  return (
  <div> 
    <Header /> {}
    <Wrapper /> 
  <div className="form-container">
    <FilterForm filters={filters} setFilters={setFilters} />
    <ReservationForm
      reservation={reservation}
      setReservation={setReservation}
    />
  </div>
</div>
  );
};

export default StudioReservation;