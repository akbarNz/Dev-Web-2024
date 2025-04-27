import React, { useState, useEffect } from "react";
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage } from '@cloudinary/react';

const StudioSection = () => {
  const [studios, setStudios] = useState([]);
  const cld = new Cloudinary({ cloud: { cloudName: "dpszia6xf" } });

  useEffect(() => {
    const fetchStudios = async () => {
      try {
        const response = await fetch(`http://localhost:5001/studio?prixMin=0&prixMax=1000&noteMin=0`);
        const data = await response.json();
        setStudios(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des studios:", error);
      }
    };

    fetchStudios();
  }, []);

  // Duplique les studios pour créer un effet de boucle continu
  const duplicatedStudios = [...studios, ...studios];

  return (
    <section>
      <div className="wrapper">
        <div 
          className="scroll-container" 
          style={{ 
            animationDuration: `${studios.length * 5}s`,
            width: `calc(${studios.length * 320}px + ${studios.length * 2}rem)`
          }}
        >
          {duplicatedStudios.map((studio, index) => {
            const img = cld.image(studio.photo_url);
            return (
              <div key={`${studio.id_stud}-${index}`} className="item">
                <AdvancedImage cldImg={img} className="studio-photo" />
                <h5>{studio.nom}</h5>
                <h5>Prix : {studio.prix_par_heure}€/h</h5>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StudioSection;
