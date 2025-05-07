import React, { useState, useEffect } from "react";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage } from '@cloudinary/react';
import { ajouterAuxFavoris } from "./Favoris";
import Rating from '@mui/material/Rating';
import { useSnackbar } from "./SnackBar";



const Historique = ({ onBack }) => {
  const [historique, sethistorique] = useState([]);
  const [notes, setNotes] = useState({});
  const cld = new Cloudinary({cloud: {cloudName: "dpszia6xf"}});
  const { showSnackbar } = useSnackbar();
  const [userId, setUserId] = useState(null);


  useEffect(() => {
    const userFromStorage = JSON.parse(localStorage.getItem('currentUser'));
    if (userFromStorage) {
      setUserId(userFromStorage.id);
    }

    const handleUserChange = (event) => {
      const newUser = event.detail;
      setUserId(newUser.id);
    };

    window.addEventListener('userChanged', handleUserChange);

    return () => {
      window.removeEventListener('userChanged', handleUserChange);
    };
  }, []);

  useEffect(() => {
    if (!userId) return;
    const historic = async () => {
      try {
        const response = await fetch(`/api/reservations/historique?artiste=${userId}`);
        const data = await response.json();
        sethistorique(data);
      } catch (error) {
        console.error("Erreur lors de la récupération de l'historique:", error);
      }
    };

    historic();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const fetchNotes = async () => {
      try {
        const response = await fetch(`/api/avis?client_id=${userId}`);
        const data = await response.json();

        const notesMap = data.reduce((acc, avis) => {
          acc[avis.studio_id] = avis.note;
          return acc;
        }, {});

        setNotes(notesMap);
      } catch (error) {
        console.error("Erreur lors de la récupération des notes:", error);
      }
    };

    fetchNotes();
  }, [userId]);


  // Fonction pour formater la date
  const formatDate = (dateString) => {
    const options = {year: 'numeric', month: 'long', day: 'numeric'};
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const handleRatingChange = async (newValue, studioId) => {
    const oldValue = notes[studioId] || 0;
    
    setNotes(prev => ({ ...prev, [studioId]: newValue }));
    
    try {
      const response = await fetch(`/api/avis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: userId,
          studio_id: studioId,
          note: newValue
        }),
      });
  
      if (!response.ok) throw new Error('Erreur serveur');
      
      const data = await response.json();
      console.log('Avis enregistré:', data);
      
    } catch (error) {
      console.error("Erreur:", error);
      setNotes(prev => ({ ...prev, [studioId]: oldValue }));
      
      alert("La note n'a pas pu être sauvegardée. Veuillez réessayer.");
    }
  };

  return (
      <div className="siu" style={{ textAlign: "center" }}>
        {historique.map((reservation, index) => {
          const img = cld.image(reservation.photo_url);
          return (
              <div className="cardHistorique" key={index}>
                <Card sx={{minWidth: 1000}}>
                  <CardContent sx={{display: 'flex', alignItems: 'center'}}>
                    <div style={{marginRight: '20px'}}>
                      <AdvancedImage cldImg={img} className="photo-historique"/>
                    </div>
                    <div>
                      <Typography variant="h5" component="div" gutterBottom>
                        {reservation.nom} - Studio
                      </Typography>
                      <Typography sx={{mb: 1.5}} color="text.secondary">
                        Adresse: {reservation.adresse}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        <strong>Date:</strong> {formatDate(reservation.date)}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        <strong>Créneau:</strong> {reservation.heure_debut} - {reservation.heure_fin}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        <strong>Nombre de personnes:</strong> {reservation.nbr_personne}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Prix total:</strong> {reservation.prix_total} €
                      </Typography>
                    </div>
                  </CardContent>
                  <CardActions>
                  <div className="ratingStar">
                  <Rating 
                    name={`rating-${reservation.studio_id}`}
                    size="large" 
                    onChange={(event, newValue) => handleRatingChange(newValue, reservation.studio_id)}
                    value={notes[reservation.studio_id] || 0}
                    precision={0.5} 
                  />
                  </div>
                    <Button size="small"
                            style={{
                              backgroundColor: "#ff5722",
                              color: "#fff",
                              border: "none",
                              borderRadius: "5px",
                              cursor: "pointer",
                            }}
                            onClick={() => ajouterAuxFavoris(userId, reservation.studio_id, showSnackbar)}>
                      Ajouter aux favoris
                    </Button>
                  </CardActions>
                </Card>
              </div>
          );
        })}
        <button
            id="backbutton"
            type="button"
            className="register-btn"
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: "#ff5722",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            onClick={onBack}
        >
          Retour
        </button>
      </div>
  );
};

export default Historique;