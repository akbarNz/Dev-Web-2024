import React, { useState, useEffect } from "react";
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage } from '@cloudinary/react';

const StudioSection = () => {
  const [studios, setStudios] = useState([]);
  const cld = new Cloudinary({ cloud: { cloudName: "dpszia6xf" } });

  useEffect(() => {
    const fetchStudios = async () => {
      try {
        const response = await fetch("http://localhost:5001/reserv?prixMin=0&prixMax=1000&noteMin=0");
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
        {studios.map((studio, index) => {
          const img = cld.image(studio.photo_url);
          return (
            <div key={studio.id_stud || index} className={`item item${index + 1}`}>
              <AdvancedImage cldImg={img} className="profil-photo" />
              <h5 id={`studio-name-${index + 1}`}>{studio.nom_stud}</h5>
              <h5>
                Prix : <span id={`studio-price-${index + 1}`}>{studio.prix_par_heure}</span>
              </h5>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default StudioSection;
