// StudioSection.js
import React, { useState, useEffect } from "react";

const StudioSection = () => {
  const [studios, setStudios] = useState([]);

  useEffect(() => {
    const fetchStudios = async () => {
      try {
        const response = await fetch("http://localhost:5001/reserv?prixMin=0&prixMax=1000&noteMin=0"); // Remplacez par votre endpoint API avec les paramètres nécessaires
        const data = await response.json();
        setStudios(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des studios:", error);
      }
    };

    fetchStudios();
  }, []);

  return (
    <section>
      <div className="wrapper">
        {studios.map((studio, index) => (
          <div key={studio.id_stud} className={`item item${index + 1}`}>
            <img
              id={`studio-image-${index + 1}`}
              src={studio.photo_url} // Utilisation de photo_url pour l'URL de l'image
              alt={`Studio ${studio.nom_stud}`}
            />
            <h5 id={`studio-name-${index + 1}`}>{studio.nom_stud}</h5>
            <h5>
              Prix : <p id={`studio-price-${index + 1}`}>{studio.prix_par_heure}</p>
            </h5>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StudioSection;