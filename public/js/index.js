async function getStudio() {
  try {
    const response = await fetch("http://localhost:5001/reserv");
    if (!response.ok) {
      console.error("Erreur lors de la récupération des données !");
      return;
    }
    const data = await response.json();

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

  } catch (error) {
    console.error("Erreur lors de la récupération des messages :", error);
    alert("Erreur lors de la récupération des studios !");
  }
}

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