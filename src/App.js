import { useState } from "react";
import FilterForm from "./Filtrage";
import ReservationForm from "./FormulaireReservation";
import Header from "./Header";
import Wrapper from "./Wrapper";
import ModifProfil from "./ModifProfil";
import Historique from "./Historique"
import Favoris from "./Favoris";

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

  const [enregistrement, setEnregistrement] = useState({ // Nouvel état
    artiste_id: "",
    nom_studio: "",
    adresse: "",
    prix_par_heure: "",
    equipement: "",
    photo_url: ""
  });

  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showHistorique, setShowHistorique] = useState(false);
  const [showFavoris, setShowFavoris] = useState(false);


  const handleShowProfile = () => {
    setShowProfileForm(true);
    setShowHistorique(false);
    setShowFavoris(false);
  };

  const handleShowHistorique = () => {
    setShowHistorique(true);
    setShowProfileForm(false);
    setShowFavoris(false);
  };

  const handleShowFavoris = () => {
    setShowFavoris(true);
    setShowHistorique(false);
    setShowProfileForm(false);
  };


  const ajouterAuFavoris = (studio) => {
    console.log("Studio à ajouter :", studio);
  // Plus tard, tu feras un fetch vers l’API ici
  };


  };


  const ajouterAuFavoris = (studio) => {
    console.log("Studio à ajouter :", studio);
  // Plus tard, tu feras un fetch vers l’API ici
  };

  return (
    <div> 
      <Header 
        setShowProfileForm={handleShowProfile}
        setShowHistorique={handleShowHistorique}
        setShowFavoris={handleShowFavoris}
      />
      
      {showHistorique && (
        <Historique
        onBack={() => setShowHistorique(false)}
        artisteId={4}
        ajouterAuFavoris={ajouterAuFavoris}
        />
      )}

      {showFavoris && (
        <Favoris
        onBack={() => setShowFavoris(false)}
        />
      )}
      
      {showProfileForm && (
        <ModifProfil onBack={() => setShowProfileForm(false)} />
      )}

      {showEnregistrementForm && ( // Nouveau formulaire
        <EnregistrementForm 
          enregistrement={enregistrement}
          setEnregistrement={setEnregistrement}
          onBack={() => setShowEnregistrementForm(false)}
        />
      )}
      
      {!showProfileForm && !showHistorique && !showFavoris &&(
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


export default App;