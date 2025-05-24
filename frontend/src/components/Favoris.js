import React, { useEffect, useState } from "react";
import { useSnackbar } from "./SnackBar";

const Favoris = ({ onBack }) => {
  const [favorisList, setFavorisList] = useState([]);
  const { showSnackbar } = useSnackbar();
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchFavoris = async (clientId) => {
      try {
        const res = await fetch(`/api/favoris?client=${clientId}`);
        if (!res.ok) throw new Error("Erreur HTTP");
        const data = await res.json();
        setFavorisList(data);
      } catch (err) {
        console.error("Erreur lors du fetch des favoris :", err);
        showSnackbar("Erreur lors du chargement des favoris.", "error");
      }
    };

    const token = localStorage.getItem("token");
    const authUser = localStorage.getItem("authUser");

    if (token && authUser) {
      const user = JSON.parse(authUser);
      setUserId(user.id);
      setCurrentUser(user);
      fetchFavoris(user.id);
    } else {
      const userFromStorage = JSON.parse(localStorage.getItem("currentUser"));
      if (userFromStorage) {
        setUserId(userFromStorage.id);
        setCurrentUser(userFromStorage);
        fetchFavoris(userFromStorage.id);
      } else {
        showSnackbar("Utilisateur non identifié.", "error");
      }
    }

    const handleAuthChange = () => {
      const token = localStorage.getItem("token");
      const authUser = localStorage.getItem("authUser");

      if (token && authUser) {
        const user = JSON.parse(authUser);
        setUserId(user.id);
        setCurrentUser(user);
        fetchFavoris(user.id);
      }
    };

    const handleUserChange = (event) => {
      const newUser = event.detail;
      setUserId(newUser.id);
      setCurrentUser(newUser);
      fetchFavoris(newUser.id);
    };

    window.addEventListener("authChanged", handleAuthChange);
    window.addEventListener("userChanged", handleUserChange);

    return () => {
      window.removeEventListener("authChanged", handleAuthChange);
      window.removeEventListener("userChanged", handleUserChange);
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
                    data-testid={`retirer-${studio.studio_id}`}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "#e53935",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: loadingId === studio.studio_id ? "not-allowed" : "pointer",
                      opacity: loadingId === studio.studio_id ? 0.6 : 1,
                    }}
                    disabled={loadingId === studio.studio_id}
                    onClick={async () => {
                      setLoadingId(studio.studio_id);
                      await retirerFavori(
                        currentUser?.id,
                        studio.studio_id,
                        showSnackbar,
                        () => {
                          setFavorisList((prev) =>
                            prev.filter((s) => s.studio_id !== studio.studio_id)
                          );
                        }
                      );
                      setLoadingId(null);
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

const ajouterAuxFavoris = async (clientId, studioId, showSnackbar) => {
  try {
    const response = await fetch(`/api/favoris`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ client_id: clientId, studio_id: studioId }),
    });

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

export const retirerFavori = async (clientId, studioId, showSnackbar, onSuccess) => {
  try {
    const response = await fetch(`/api/favoris`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId, studio_id: studioId }),
    });

    if (!response.ok) throw new Error();

    showSnackbar("Studio retiré des favoris.", "success");
    if (onSuccess) onSuccess();
  } catch {
    showSnackbar("Erreur lors du retrait du favori.", "error");
  }
};

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
