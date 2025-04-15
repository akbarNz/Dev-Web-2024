import React, { useEffect, useState } from "react";

const Favoris = ({ onBack }) => {
  const [favorisList, setFavorisList] = useState([]);

  useEffect(() => {
    const fetchFavoris = async () => {
      try {
        const response = await fetch("http://localhost:5001/getFav?artiste=4"); // artiste_id = 4
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
                      onClick={() =>
                          retirerFavori(studio.artiste_id || 4, studio.studio_id, () => {
                            setFavorisList((prev) =>
                                prev.filter((s) => s.studio_id !== studio.studio_id)
                            );
                          })
                      }
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
    const response = await fetch("http://localhost:5001/postFav", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        artiste_id: artisteId,
        studio_id: studioId
      })
    });

    const text = await response.text();

    if (response.status === 409) {
      console.warn("Le favori existe déjà.");
      return;
    }

    if (!response.ok) throw new Error("Erreur API");

    console.log("Favori ajouté :", JSON.parse(text));

    alert("Favori ajouté !");

  } catch (err) {
    console.error("Erreur lors de l'ajout aux favoris :", err);
    throw err;
  }
}

export async function retirerFavori(artisteId, studioId, onSuccess) {
  try {
    const response = await fetch("http://localhost:5001/deleteFav", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        artiste_id: artisteId,
        studio_id: studioId
      })
    });

    if (!response.ok) throw new Error("Erreur API");

    console.log("Favori retiré");
    alert("Favori retiré !");
    if (onSuccess) onSuccess();

  } catch (err) {
    console.error("Erreur lors du retrait des favoris :", err);
    alert("Erreur lors du retrait du favori");
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
