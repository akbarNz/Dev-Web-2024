import React, { useState, useEffect } from "react";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage } from '@cloudinary/react';
import { ajouterAuxFavoris } from "./Favoris";



const Historique = ({ onBack, artisteId }) => {
  const [historique, sethistorique] = useState([]);
  const cld = new Cloudinary({cloud: {cloudName: "dpszia6xf"}});

  useEffect(() => {
    const historic = async () => {
      try {
        const response = await fetch(`http://localhost:5001/historique?artiste=${artisteId}`);
        const data = await response.json();
        sethistorique(data);
      } catch (error) {
        console.error("Erreur lors de la récupération de l'historique:", error);
      }
    };

    historic();
  }, [artisteId]);


  // Fonction pour formater la date
  const formatDate = (dateString) => {
    const options = {year: 'numeric', month: 'long', day: 'numeric'};
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  return (
      <div className="siu">
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
                      <Typography variant="body1" gutterBottom>
                        <strong>Statut:</strong> {reservation.statut}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Prix total:</strong> {reservation.prix_total} €
                      </Typography>
                    </div>
                  </CardContent>
                  <CardActions>
                    <Button size="small"
                            style={{
                              marginTop: "20px",
                              padding: "10px 20px",
                              backgroundColor: "#ff5722",
                              color: "#fff",
                              border: "none",
                              borderRadius: "5px",
                              cursor: "pointer",
                            }}
                            onClick={() => ajouterAuxFavoris(artisteId, reservation.studio_id)}>
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