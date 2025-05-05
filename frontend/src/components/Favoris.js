import React, { useEffect, useState } from "react";
import { useSnackbar } from "./SnackBar";

const Favoris = ({ onBack }) => {
  const [favorisList, setFavorisList] = useState([]);
  const { showSnackbar } = useSnackbar();
  const [currentUser, setCurrentUser] = useState(null);


  useEffect(() => {
  const fetchFavoris = async (userId) => {
    try {
      const response = await fetch(`/api/favoris?client=${userId}`);
      const data = await response.json();
      console.log("Favoris récupérés :", data);
      setFavorisList(data);
    } catch (err) {
      console.error("Erreur lors du fetch des favoris :", err);
    }
  };

  const userFromStorage = JSON.parse(localStorage.getItem('currentUser'));
  if (userFromStorage) {
    setCurrentUser(userFromStorage);
    fetchFavoris(userFromStorage.id);
  }

  const handleUserChange = (event) => {
    const newUser = event.detail;
    setCurrentUser(newUser);
    fetchFavoris(newUser.id);
  };

  window.addEventListener('userChanged', handleUserChange);

  return () => {
    window.removeEventListener('userChanged', handleUserChange);
  };
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
                        retirerFavori(
                          currentUser?.id,
                          studio.studio_id,
                          showSnackbar,
                          () => {
                            setFavorisList((prev) =>
                              prev.filter((s) => s.studio_id !== studio.studio_id)
                            );
                          }
                        )
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

const ajouterAuxFavoris = async (clientId, studioId, showSnackbar) => {
    try {
      const response = await fetch(`/api/favoris`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ client_id: clientId, studio_id: studioId })
      });

      const text = await response.text();

      if (response.status === 409) {
        showSnackbar("Ce studio est déjà dans vos favoris.", "warning");
        return;
      }

      if (!response.ok) throw new Error("Erreur API");

      showSnackbar("Favori ajouté !", "success");
    } catch (err) {
      console.error("Erreur lors de l'ajout aux favoris :", err);
      showSnackbar("Erreur lors de l'ajout du favori.", "error");
    }
  };


export async function retirerFavori(clientId, studioId, showSnackbar, onSuccess) {
  try {
    const response = await fetch(`/api/favoris`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        client_id: clientId,
        studio_id: studioId
      })
    });

    if (!response.ok) throw new Error("Erreur API");

    showSnackbar("Favori retiré !", "info");
    if (onSuccess) onSuccess();

  } catch (err) {
    console.error("Erreur lors du retrait des favoris :", err);
    showSnackbar("Erreur lors du retrait du favori.", "error");
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
export { ajouterAuxFavoris };
