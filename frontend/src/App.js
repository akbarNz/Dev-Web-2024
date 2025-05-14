import { useState } from "react";
import FilterForm from "./components/Filtrage";
import ReservationForm from "./components/FormulaireReservation";
import Header from "./components/Header";
import Wrapper from "./components/Wrapper";
import ModifProfil from "./components/ModifProfil";
import Historique from "./components/Historique";
import Favoris from "./components/Favoris";
import Enregistrement from "./components/FormulaireEnregiStudio";
import Login from "./components/Login";
import Register from "./components/Register";
import { SnackbarProvider } from "./components/SnackBar";

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

  const [enregistrement, setEnregistrement] = useState({
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
  const [showEnregistrementForm, setShowEnregistrementForm] = useState(false);
  // Nouveaux états pour les modales d'authentification
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleShowProfile = () => {
    setShowProfileForm(true);
    setShowHistorique(false);
    setShowFavoris(false);
    setShowEnregistrementForm(false);
    setShowLogin(false);
    setShowRegister(false);
  };

  const handleShowHistorique = () => {
    setShowHistorique(true);
    setShowProfileForm(false);
    setShowFavoris(false);
    setShowEnregistrementForm(false);
    setShowLogin(false);
    setShowRegister(false);
  };

  const handleShowFavoris = () => {
    setShowFavoris(true);
    setShowHistorique(false);
    setShowProfileForm(false);
    setShowEnregistrementForm(false);
    setShowLogin(false);
    setShowRegister(false);
  };

  const handleShowEnregistrement = () => {
    setShowEnregistrementForm(true);
    setShowFavoris(false);
    setShowHistorique(false);
    setShowProfileForm(false);
    setShowLogin(false);
    setShowRegister(false);
  };

  const handleShowLogin = () => {
    setShowLogin(true);
    setShowRegister(false);
    setShowProfileForm(false);
    setShowHistorique(false);
    setShowFavoris(false);
    setShowEnregistrementForm(false);
  };

  const handleShowRegister = () => {
    setShowRegister(true);
    setShowLogin(false);
    setShowProfileForm(false);
    setShowHistorique(false);
    setShowFavoris(false);
    setShowEnregistrementForm(false);
  };

  const ajouterAuFavoris = (studio) => {
    console.log("Studio à ajouter :", studio);
  };

  return (
    <SnackbarProvider>
    <div> 
      <Header 
        setShowProfileForm={handleShowProfile}
        setShowHistorique={handleShowHistorique}
        setShowFavoris={handleShowFavoris}
        setShowEnregistrement={handleShowEnregistrement}
        setShowLogin={handleShowLogin}
        setShowRegister={handleShowRegister}
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

      {showEnregistrementForm && (
        <Enregistrement 
          enregistrement={enregistrement}
          setEnregistrement={setEnregistrement}
          onBack={() => setShowEnregistrementForm(false)}
        />
      )}

      {/* Nouvelles modales d'authentification */}
      {showLogin && (
        <Login onClose={() => setShowLogin(false)} />
      )}

      {showRegister && (
        <Register onClose={() => setShowRegister(false)} />
      )}
      
      {!showProfileForm && !showHistorique && !showFavoris && !showEnregistrementForm && !showLogin && !showRegister && (
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
    </SnackbarProvider>
  );
};

export default App;