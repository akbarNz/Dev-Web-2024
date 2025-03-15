const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
require("dotenv").config();
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

// Serve les fichiers statiques depuis le dossier 'public'
app.use(express.static("public"));

// Route pour servir un fichier HTML spécifique
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "reservation_studios.html"));
});

// Configuration de PostgreSQL
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "testtri",
    password: "",
    port: 5432,
});

// Route pour récupérer les studios
app.get("/reserv", async (req, res) => {
  try {
    // Récupérer les paramètres de requête
    const { prixMin, prixMax } = req.query;

// Exécuter la requête SQL directement
const result = await pool.query(`
  SELECT S.id AS id_stud, S.nom AS nom_stud, S.prix_par_heure, S.photo_url,
         U.id AS id_uti, U.nom AS nom_uti
  FROM studios AS S
  JOIN utilisateurs AS U ON S.proprietaire_id = U.id
  WHERE S.prix_par_heure >= $1 AND S.prix_par_heure <= $2
`, [prixMin, prixMax]);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

app.get("/prixMinMax", async (req, res) => {
  try {
      const result = await pool.query(`
          SELECT MIN(prix_par_heure) AS prix_min, MAX(prix_par_heure) AS prix_max
          FROM studios;
      `);
      res.json(result.rows[0]);
  } catch (err) {
      console.error(err);
      res.status(500).send('Erreur serveur');
  }
});


// Route pour enregistrer une réservation
app.post('/reserve', async (req, res) => {
    const { artiste_id, studio_id, date_reservation, nbr_personne, heure_debut, heure_fin } = req.body;
  
    try {
      const query = `
        INSERT INTO reservations (artiste_id, studio_id, date_reservation, nbr_personne, heure_debut, heure_fin) 
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
      `;
  
      const values = [artiste_id, studio_id, date_reservation, nbr_personne, heure_debut, heure_fin];
      const result = await pool.query(query, values);
  
      res.status(201).json({ message: 'Réservation enregistrée !', reservation: result.rows[0] });
    } catch (error) {
      console.error('Erreur lors de l’insertion :', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });
  
// Démarrer le serveur
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
