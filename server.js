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
    database: "dev_projet",
    password: "dev_projet",
    port: 5432,
});

//Route pour les studios filtrés
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
            COALESCE(A.moyenne_note, 0) AS moyenne_note,
            S.photo_url
      FROM studio AS S
      LEFT JOIN (
          SELECT studio_id, AVG(note) AS moyenne_note
          FROM avis
          GROUP BY studio_id
      ) AS A ON S.id = A.studio_id
      WHERE 1=1
    `;

    let values = [];
    let paramIndex = 1;

    if (prixMin || prixMax) {
      query += ` AND S.prix_par_heure BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
      values.push(prixMin || 0);
      values.push(prixMax || 1000);
      paramIndex += 2;
    }

    if (noteMin) {
      query += ` AND COALESCE(A.moyenne_note, 0) >= $${paramIndex}`;
      values.push(noteMin);
      paramIndex += 1;
    }

    if (equipementsArray.length > 0) {
      query += ` AND (
        SELECT COUNT(*) FROM json_array_elements_text(S.equipements) AS elem
        WHERE elem = ANY($${paramIndex})
      ) = $${paramIndex + 1}`;
      values.push(equipementsArray);
      values.push(equipementsArray.length);
    }

    // Ajout du tri par prix croissant
    query += ` ORDER BY S.prix_par_heure ASC`;

    console.log("Final query:", query);
    console.log("Query values:", values);

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur détaillée:", err);
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
});

//Route pour récupérer les studios sans filtre : 
app.get("/studios", async(req, res) => {
  try{
    const result = await pool.query(`
      SELECT * 
      FROM studio
      ORDER BY prix_par_heure ASC
    `);
    res.json(result.rows)
  }
  catch (err) {
    console.error("Erreur lors de la récupération des artistes :", err);
    res.status(500).send('Erreur Serveur !');
  }
});


app.get("/equipements", async (req, res) => {
  try {
    const { equipements } = req.query;

    const result = await pool.query(`
      SELECT DISTINCT eq AS equipements
      FROM studio, json_array_elements_text(studios.equipements) AS eq;
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
    const result = await pool.query(`SELECT * FROM client WHERE role = 'artiste'`);
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
          FROM studio;
      `);
      res.json(result.rows[0]);
  } catch (err) {
      console.error(err);
      res.status(500).send('Erreur serveur');
  }
});


// Route pour enregistrer une réservation
app.post('/reserve', async (req, res) => {
  const { client_id, studio_id, date_reservation, nbr_personne, heure_debut, heure_fin, prix_total } = req.body;

  try {
    const query = `
      INSERT INTO reservation (client_id, studio_id, date_reservation, nbr_personne, heure_debut, heure_fin, prix_total) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;
    `;

    const values = [client_id, studio_id, date_reservation, nbr_personne, heure_debut, heure_fin, prix_total];
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
    const result = await pool.query('SELECT * FROM Client WHERE id = $1', [userId]);

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
    const { id, photo_profil_url, nom, email, numero_telephone} = req.body;

    const query = `
      UPDATE Client
      SET photo_url = $1, nom = $2, email = $3, numero_telephone = $4
      WHERE id = $5
      RETURNING *;
    `;

    const values = [photo_profil_url, nom, email, numero_telephone, id];

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
  const { artiste } = req.query;

  if (!artiste) {
    return res.status(400).json({ error: "Paramètre artiste manquant" });
  }

  try {
    const result = await pool.query(`
      SELECT 
        r.studio_id, 
        r.date_reservation AS date, 
        r.nbr_personne, 
        r.heure_debut, 
        r.heure_fin, 
        r.statut, 
        r.prix_total, 
        s.nom, 
        s.adresse, 
        s.photo_url 
      FROM reservations AS r
      JOIN studios AS s ON r.studio_id = s.id
      WHERE r.artiste_id = $1
      ORDER BY date DESC;
    `, [artiste]);

    res.json(result.rows);
  } catch (err) {
    console.error("Erreur dans /historique :", err);
    res.status(500).send('Erreur serveur');
  }
});

app.post("/postFav", async (req, res) => {
  const { artiste_id, studio_id } = req.body;

  try {
    await pool.query(`
      INSERT INTO favoris (artiste_id, studio_id, date_ajout)
      VALUES ($1, $2, NOW())
    `, [artiste_id, studio_id]);

    res.status(201).json({ message: "Favori ajouté" });

  } catch (error) {
    if (error.code === '23505') { // violation contrainte UNIQUE PostgreSQL
      return res.status(409).json({ message: "Déjà en favoris" });
    }
    console.error("Erreur ajout favoris :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


app.get("/getFav", async (req, res) => {
  const { artiste } = req.query;

  if (!artiste) {
    return res.status(400).json({ error: "Paramètre artiste manquant" });
  }

  try {
    const result = await pool.query(`
      SELECT 
        f.studio_id,
        s.nom,
        s.adresse,
        s.photo_url,
        s.prix_par_heure
      FROM favoris f
      JOIN studios s ON f.studio_id = s.id
      WHERE f.artiste_id = $1
    `, [artiste]);

    res.json(result.rows);
  } catch (err) {
    console.error("Erreur dans /favoris :", err);
    res.status(500).send("Erreur serveur");
  }
});

app.delete("/deleteFav", async (req, res) => {
  const { artiste_id, studio_id } = req.body;

  if (!artiste_id || !studio_id) {
    return res.status(400).json({ error: "Paramètres manquants" });
  }

  try {
    const result = await pool.query(
      `DELETE FROM favoris WHERE artiste_id = $1 AND studio_id = $2`,
      [artiste_id, studio_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Favori non trouvé" });
    }

    res.json({ message: "Favori retiré avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du favori :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

//Route pour récupérer les propriétaires : 
app.get("/proprietaire", async (req, res) => {
  try {
    console.log("Requête reçue sur /proprietaire");
    const result = await pool.query(`SELECT * FROM proprio WHERE role = 'propriétaire'`);
    console.log("Artistes récupérés :", result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur lors de la récupération des artistes :", err);
    res.status(500).send('Erreur Serveur !');
  }
});

app.get('/ville', async(req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM villes`);
    res.json(result.rows);
  } catch(err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

//Route d'enregistrement 
app.post('/enregi', async(req, res) => {
  const { nom, description, adresse, code_postal, prix_par_heure, equipements, photo_url, proprietaire_id } = req.body;

  if (!Array.isArray(equipements)) {
    return res.status(400).json({ error: "Le champ 'equipements' doit être un tableau" });
  }

  if (!proprietaire_id) {
    return res.status(400).json({ error: "L'ID du propriétaire est requis" });
  }

  try {
    const query = `
      INSERT INTO studio (nom, description, adresse, code_postal, prix_par_heure, equipements, photo_url, proprietaire_id)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;
      
    const values = [nom, description, adresse, code_postal, prix_par_heure, JSON.stringify(equipements), photo_url, proprietaire_id];
    const result = await pool.query(query, values);
    
    res.status(201).json({ 
      message: 'Studio enregistré avec succès!',
      studio: result.rows[0]
    });
  }
  catch(err) {
    console.error("Erreur détaillée:", err);
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
});

// Démarrer le serveur
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
