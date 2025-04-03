import { useState } from "react";
import FilterForm from "./Filtrage";
import ReservationForm from "./FormulaireReservation";
import Header from "./Header";
import Wrapper from "./Wrapper";
import ModifProfil from "./ModifProfil";
import Historique from "./Historique"
//import Cloudinary from "./Cloudinary";
//import Enregi from "./FormulaireEnregiStudio"; 

const App = () => {
  const [filters, setFilters] = useState({
    prixMin: "",
    prixMax: "",
    noteMin: 0,
    selectedEquipements: [],
  });

  const [reservation, setReservation] = useState({
    nom: "",
    studio: "",
    date_reservation: "",
    nbr_personne: "",
    heure_debut: "",
    heure_fin: "",
  });

  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showHistorique, setShowHistorique] = useState(false);

  const handleShowProfile = () => {
    setShowProfileForm(true);
    setShowHistorique(false);
  };

  const handleShowHistorique = () => {
    setShowHistorique(true);
    setShowProfileForm(false);
  };

  return (
    <div> 
    <Header 
      setShowProfileForm={handleShowProfile}
      setShowHistorique={handleShowHistorique} 
    />
    
    {showHistorique && (
      <Historique 
        onBack={() => setShowHistorique(false)}
        artisteId={4}
      />
    )}
    
    {showProfileForm && (
      <ModifProfil onBack={() => setShowProfileForm(false)} />
    )}
    
    {!showProfileForm && !showHistorique && (
      <>
        <Wrapper />
        <div className="form-container">
          <FilterForm filters={filters} setFilters={setFilters} />
          <ReservationForm
            reservation={reservation}
            setReservation={setReservation}
            prixMin={filters.prixMin} 
            prixMax={filters.prixMax}
            noteMin={filters.noteMin}
            selectedEquipements={filters.selectedEquipements}
          />
        </div>
      </>
    )}
  </div>
  );
};

export default App;
