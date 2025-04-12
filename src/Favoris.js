import React, { useEffect, useState } from "react";

const Favoris = ({ onBack }) => {
  const [favorisList, setFavorisList] = useState([]);

  useEffect(() => {
    const fetchFavoris = async () => {
      try {
        const response = await fetch("http://localhost:5001/favoris?artiste=4"); // artiste_id = 4
        const data = await response.json();
        console.log("Favoris récupérés :", data);
        setFavorisList(data);
      } catch (err) {
        console.error("Erreur lors du fetch des favoris :", err);
      }
    };

    fetchFavoris();
  }, []);

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Mes Studios Favoris</h2>

      {favorisList.length > 0 ? (
        <table
          style={{
            margin: "20px auto",
            borderCollapse: "collapse",
            width: "80%",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f5f5f5" }}>
              <th style={thStyle}>Nom du studio</th>
              <th style={thStyle}>Localisation</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {favorisList.map((studio) => (
              <tr key={studio.studio_id}>
                <td style={tdStyle}>{studio.nom}</td>
                <td style={tdStyle}>{studio.adresse}</td>
                <td style={tdStyle}>
                  <button
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "#e53935",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                    onClick={() => {retirerDesFavoris(4, studio.studio_id);// 4 à changer pour artiste
                    }}
                  >
                    Retirer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Aucun favori pour l'instant.</p>
      )}

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
export async function ajouterAuxFavoris(artisteId, studioId) {
  try {
    const response = await fetch("http://localhost:5001/favoris", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        artiste_id: artisteId,
        studio_id: studioId
      })
    });
    if (response.status === 409) {
      console.warn("Le favori existe déjà.");
      return;
    }

    if (!response.ok) throw new Error("Erreur API");

    const data = await response.json();
    console.log("Favoris ajouté :", data);
    return data;
  } catch (err) {
    console.error("Erreur lors de l'ajout aux favoris :", err);
    throw err;
  }
}

async function retirerDesFavoris(artisteId, studioId) {
  try {
    const response = await fetch("http://localhost:5001/favoris", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ artiste_id: artisteId, studio_id: studioId }),
    });

    console.log("Statut de la réponse DELETE:", response.status); // 🧪 Ajoute ceci

    if (!response.ok) {
      throw new Error("Échec de la suppression");
    }

    console.log("Favori supprimé avec succès");
  } catch (err) {
    console.error("Erreur lors du retrait des favoris :", err);
  }
}




const thStyle = {
  border: "1px solid #ddd",
  padding: "12px",
  fontWeight: "bold",
  textAlign: "center",
};

const tdStyle = {
  border: "1px solid #ddd",
  padding: "12px",
  textAlign: "center",
};

export default Favoris;
