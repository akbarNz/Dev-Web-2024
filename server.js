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

// Configuration de PostgreSQL
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "testtri",
    password: "WICJTYHIFHIF1@",
    port: 5432,
});

// Route pour récupérer les studios
app.get("/reserv", async (req, res) => {
  try {
    const { prixMin, prixMax, noteMin, selectedEquipements } = req.query;
    
    let equipementsArray = [];
    if (selectedEquipements) {
      try {
        equipementsArray = JSON.parse(decodeURIComponent(selectedEquipements));
      } catch (e) {
        console.error("Erreur de parsing des équipements:", e);
      }
    }

    let query = `
      SELECT S.id AS id_stud, 
            S.nom AS nom_stud, 
            S.prix_par_heure,
            A.moyenne_note,
            S.photo_url
      FROM studios AS S
      JOIN (
          SELECT studio_id, AVG(note) AS moyenne_note
          FROM avis
          GROUP BY studio_id
          HAVING AVG(note) >= $3
      ) AS A ON S.id = A.studio_id
      WHERE S.prix_par_heure BETWEEN $1 AND $2
    `;

    let values = [prixMin || 0, prixMax || 1000, noteMin || 0];

    if (equipementsArray.length > 0) {
      query += ` AND (
        SELECT COUNT(*) FROM json_array_elements_text(S.equipements) AS elem
        WHERE elem = ANY($4)
      ) = $5`;
      values.push(equipementsArray);
      values.push(equipementsArray.length);
    }    

    console.log("Final query:", query);
    console.log("Query values:", values);

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur détaillée:", err);
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
});


app.get("/equipements", async (req, res) => {
  try {
    const { equipements } = req.query;

    const result = await pool.query(`
      SELECT DISTINCT eq AS equipements
      FROM studios, json_array_elements_text(studios.equipements) AS eq;
      `, []);
    res.json(result.rows);
  } catch(err){
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

//Route pour récupérer les artistes
app.get("/artiste", async (req, res) => {
  try {
    console.log("Requête reçue sur /artiste");
    const result = await pool.query(`SELECT * FROM utilisateurs WHERE role = 'artiste'`);
    console.log("Artistes récupérés :", result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur lors de la récupération des artistes :", err);
    res.status(500).send('Erreur Serveur !');
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
  const { artiste_id, studio_id, date_reservation, nbr_personne, heure_debut, heure_fin, prix_total } = req.body;

  try {
    const query = `
      INSERT INTO reservations (artiste_id, studio_id, date_reservation, nbr_personne, heure_debut, heure_fin, prix_total) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;
    `;

    const values = [artiste_id, studio_id, date_reservation, nbr_personne, heure_debut, heure_fin, prix_total];
    const result = await pool.query(query, values);

    res.status(201).json({ message: 'Réservation enregistrée !', reservation: result.rows[0] });
  } catch (error) {
    console.error(`Erreur lors de l'insertion :, error`);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour récupérer les données du profil utilisateur
app.get('/getUserInfo', async (req, res) => {
  try {
    const userId = req.query.id;
    if (!userId) {
      return res.status(400).json({ error: "ID utilisateur manquant" });
    }
    const result = await pool.query('SELECT * FROM utilisateurs WHERE id = $1', [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
  
  res.json(result.rows[0]);
} catch (error) {
    console.log(error);
    res.status(500).send("Erreur serveur")
  }
})

app.post('/saveUserInfo', async (req, res) => {
  try {
    console.log("Données reçues :", req.body);
    const { id, photo_profil_url, nom, email, numero_telephone, role } = req.body;

    const query = `
      UPDATE utilisateurs
      SET photo_profil_url = $1, nom = $2, email = $3, numero_telephone = $4, role = $5
      WHERE id = $6
      RETURNING *;
    `;

    const values = [photo_profil_url, nom, email, numero_telephone, role, id];

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res.json({ message: "Profil mis à jour avec succès", user: result.rows[0] });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.get('/historique', async (req, res) => {
  try {
    const result = await pool.query(`
      select r.studio_id, r.date_reservation as date, r.nbr_personne, r.heure_debut, r.heure_fin, r.statut, r.prix_total, s.nom, s.adresse, s.photo_url 
      from reservations as r
      join studios as s on r.artiste_id = s.id
      where artiste_id = 4
      order by date DESC;
      `);
    res.json(result.rows);
  } catch(err){
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

// Démarrer le serveur
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});