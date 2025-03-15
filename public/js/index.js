// Fonction pour récupérer et afficher les studios
async function fetchAndUpdateStudios(prixMin, prixMax) {
  try {
    const response = await fetch(`http://localhost:5001/reserv?prixMin=${prixMin}&prixMax=${prixMax}`);
    if (!response.ok) {
      console.error("Erreur lors de la récupération des studios !");
      return;
    }
    const data = await response.json();
    updateStudios(data);
  } catch (error) {
    console.error("Erreur lors de la récupération des données :", error);
    alert("Erreur lors de la récupération des studios !");
  }
}

// Fonction pour initialiser les prix min/max et afficher les studios par défaut
async function getStudio() {
  try {
    const prixResponse = await fetch("http://localhost:5001/prixMinMax");
    if (!prixResponse.ok) {
      console.error("Erreur lors de la récupération des prix min et max !");
      return;
    }
    const prixData = await prixResponse.json();

    const prixMinInput = document.getElementById('prixMin');
    const prixMaxInput = document.getElementById('prixMax');

    if (prixMinInput && prixMaxInput) {
      prixMinInput.value = prixData.prix_min;
      prixMaxInput.value = prixData.prix_max;
      prixMinInput.min = prixData.prix_min;
      prixMaxInput.min = prixData.prix_min;
      prixMinInput.max = prixData.prix_max;
      prixMaxInput.max = prixData.prix_max;        
    }

    await fetchAndUpdateStudios(prixData.prix_min, prixData.prix_max);

  } catch (error) {
    console.error("Erreur lors de la récupération des données :", error);
    alert("Erreur lors de la récupération des studios !");
  }
}

// Gestionnaire d'événements pour le filtre
document.getElementById('filtrer').addEventListener('click', async (event) => {
  event.preventDefault();
  const prixMin = document.getElementById('prixMin').value;
  const prixMax = document.getElementById('prixMax').value;
  await fetchAndUpdateStudios(prixMin, prixMax);
});

// Fonction pour mettre à jour le DOM avec les studios
function updateStudios(data) {
  const studioSelect = document.getElementById('studio');
  const artisteSelect = document.getElementById('nom');

  if (!studioSelect || !artisteSelect) {
    console.error("Les éléments <select> sont introuvables !");
    return;
  }

  let studioOptions = "";
  let artisteOptions = "";

  data.forEach((studio, index) => {
    const studioNameElement = document.getElementById(`studio-name-${index + 1}`);
    const studioImageElement = document.getElementById(`studio-image-${index + 1}`);
    const studioPriceElement = document.getElementById(`studio-price-${index + 1}`);

    if (studioNameElement) studioNameElement.innerHTML = studio.nom_stud;
    if (studioImageElement) studioImageElement.src = studio.photo_url;
    if (studioPriceElement) studioPriceElement.innerHTML = studio.prix_par_heure;

    studioOptions += `<option value="${studio.id_stud}">${studio.nom_stud}</option>`;
    artisteOptions += `<option value="${studio.id_uti}">${studio.nom_uti}</option>`;
  });

  studioSelect.innerHTML = studioOptions;
  artisteSelect.innerHTML = artisteOptions;
}

// Appeler getStudio() au chargement de la page
getStudio();

async function reservStud(event) {
  event.preventDefault();

  const artiste_id = document.getElementById('nom')?.value;
  const studio_id = document.getElementById('studio')?.value;
  const date_reservation = document.getElementById('date_reservation')?.value;
  const nbr_personne = document.getElementById('nbr_personne')?.value || 0;
  const heure_debut = document.getElementById('heure_debut')?.value;
  const heure_fin = document.getElementById('heure_fin')?.value;

  if (!artiste_id || !studio_id || !date_reservation || !heure_debut || !heure_fin) {
    alert("Veuillez remplir tous les champs obligatoires.");
    return;
  }

  const reservationData = {
    artiste_id,
    studio_id,
    date_reservation,
    nbr_personne,
    heure_debut,
    heure_fin
  };

  try {
    const response = await fetch('http://localhost:5001/reserve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reservationData),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l’envoi des données');
    }

    const result = await response.json();
    alert('Réservation enregistrée avec succès !');
    console.log(result);
  } catch (error) {
    console.error('Erreur:', error);
    alert('Erreur lors de l’enregistrement de la réservation');
  }
}


document.querySelector('form').addEventListener('submit', reservStud); 

getStudio();