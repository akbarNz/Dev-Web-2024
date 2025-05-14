import React, { useEffect, useState } from "react";
import { useSnackbar } from "./SnackBar";

const Favoris = ({ onBack }) => {
  const [favorisList, setFavorisList] = useState([]);
  const { showSnackbar } = useSnackbar();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Vérifier si l'utilisateur est authentifié
    const token = localStorage.getItem('token');
    const authUser = localStorage.getItem('authUser');
    
    if (token && authUser) {
      const user = JSON.parse(authUser);
      setCurrentUser(user);
      fetchFavoris(user.id, token);
    } else {
      // Mode legacy si pas d'authentification
      const userFromStorage = JSON.parse(localStorage.getItem('currentUser'));
      if (userFromStorage) {
        setCurrentUser(userFromStorage);
        fetchFavoris(userFromStorage.id);
      }
    }

    const handleAuthChange = () => {
      const token = localStorage.getItem('token');
      const authUser = localStorage.getItem('authUser');
      
      if (token && authUser) {
        const user = JSON.parse(authUser);
        setCurrentUser(user);
        fetchFavoris(user.id, token);
      } else {
        setCurrentUser(null);
        setFavorisList([]);
      }
    };

    // Support du mode legacy
    const handleUserChange = (event) => {
      const newUser = event.detail;
      setCurrentUser(newUser);
      fetchFavoris(newUser.id);
    };

    window.addEventListener('authChanged', handleAuthChange);
    window.addEventListener('userChanged', handleUserChange);

    return () => {
      window.removeEventListener('authChanged', handleAuthChange);
      window.removeEventListener('userChanged', handleUserChange);
    };
  }, []);

  const fetchFavoris = async (userId, token = null) => {
    setLoading(true);
    try {
      let response;
      
      if (token) {
        // Utiliser le nouvel endpoint avec authentification
        response = await fetch(`/api/favoris/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } else {
        // Utiliser l'ancien endpoint
        response = await fetch(`/api/favoris?client=${userId}`);
      }

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des favoris");
      }
      
      const data = await response.json();
      console.log("Favoris récupérés :", data);
      setFavorisList(data);
    } catch (err) {
      console.error("Erreur lors du fetch des favoris :", err);
      setError("Erreur lors de la récupération des favoris. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>Mes Studios Favoris</h2>
        <p>Chargement de vos favoris...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>Mes Studios Favoris</h2>
        <p style={{ color: "#e53935" }}>{error}</p>
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
  }

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
            {favorisList.map((studio) => {
              // Adapter au format de l'objet selon l'API utilisée
              const studioId = studio.studio_id || studio.studio?.id;
              const nom = studio.nom || studio.studio?.nom;
              const adresse = studio.adresse || studio.studio?.adresse;
              
              return (
                <tr key={studioId}>
                  <td style={tdStyle}>{nom}</td>
                  <td style={tdStyle}>{adresse}</td>
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
                          studioId,
                          showSnackbar,
                          () => {
                            setFavorisList((prev) =>
                              prev.filter((s) => 
                                (s.studio_id || s.studio?.id) !== studioId
                              )
                            );
                          }
                        )
                      }
                    >
                      Retirer
                    </button>
                  </td>
                </tr>
              );
            })}
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

// Ajuster la fonction ajouterAuxFavoris pour utiliser l'authentification JWT si disponible
const ajouterAuxFavoris = async (clientId, studioId, showSnackbar) => {
  try {
    const token = localStorage.getItem('token');
    const headers = {
      "Content-Type": "application/json"
    };
    
    // Ajouter le token d'authentification s'il existe
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    const response = await fetch(`/api/favoris`, {
      method: "POST",
      headers,
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

// Ajuster la fonction retirerFavori pour utiliser l'authentification JWT si disponible
export async function retirerFavori(clientId, studioId, showSnackbar, onSuccess) {
  try {
    const token = localStorage.getItem('token');
    const headers = {
      "Content-Type": "application/json"
    };
    
    // Ajouter le token d'authentification s'il existe
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    const response = await fetch(`/api/favoris`, {
      method: "DELETE",
      headers,
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