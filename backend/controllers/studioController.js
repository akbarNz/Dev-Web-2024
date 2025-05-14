const pool = require('../db');

exports.getStudios = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM studio ORDER BY prix_par_heure ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
};

exports.getFilteredStudios = async (req, res) => {
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

    query += ` ORDER BY S.prix_par_heure ASC`;

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
};

exports.getEquipements = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT eq AS equipements
      FROM Studio, json_array_elements_text(Studio.equipements) AS eq;
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
};

// Variable de cache pour les villes
let villesCache = null;

exports.getVilles = async (req, res) => {
  try {
    // Si les villes sont déjà en cache, les renvoyer directement
    if (villesCache) {
      console.log("Renvoi des villes depuis le cache serveur");
      return res.json(villesCache);
    }

    // Pour découvrir la structure de la table
    console.log("Chargement des villes depuis la base de données");
    
    // Récupérer d'abord les noms des colonnes de la table
    const columnsQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'villes'
    `;
    
    const columnsResult = await pool.query(columnsQuery);
    const columns = columnsResult.rows.map(row => row.column_name);
    console.log("Colonnes disponibles dans la table villes:", columns);
    
    // Déterminer les bonnes colonnes à utiliser
    let nomColumn = 'ville';
    
    // Vérifier si la colonne 'ville' existe, sinon utiliser d'autres possibilités
    if (!columns.includes('ville')) {
      if (columns.includes('nom_ville')) {
        nomColumn = 'nom_ville';
      } else if (columns.includes('name')) {
        nomColumn = 'name';
      } else if (columns.includes('nom_commune')) {
        nomColumn = 'nom_commune';
      } else if (columns.includes('nom')) {
        nomColumn = 'nom';
      } else {
        console.error("Aucune colonne de nom trouvée dans la table villes");
      }
    }
    
    console.log(`Utilisation de la colonne '${nomColumn}' pour les noms de villes`);
    
    // Utiliser la colonne trouvée
    const result = await pool.query(`
      SELECT code_postal, ${nomColumn} as nom_ville
      FROM villes
      ORDER BY code_postal
      LIMIT 1000
    `);
    
    // Stocker en cache pour les futures requêtes
    villesCache = result.rows;
    
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    
    // En cas d'erreur, on utilise un tableau de secours
    const villesFallback = [
      { code_postal: "75001", nom_ville: "Paris 1er" },
      { code_postal: "75002", nom_ville: "Paris 2e" },
      { code_postal: "75003", nom_ville: "Paris 3e" },
      { code_postal: "75004", nom_ville: "Paris 4e" },
      { code_postal: "75005", nom_ville: "Paris 5e" },
      { code_postal: "75006", nom_ville: "Paris 6e" },
      { code_postal: "75007", nom_ville: "Paris 7e" },
      { code_postal: "75008", nom_ville: "Paris 8e" },
      { code_postal: "75009", nom_ville: "Paris 9e" },
      { code_postal: "75010", nom_ville: "Paris 10e" },
      { code_postal: "75011", nom_ville: "Paris 11e" },
      { code_postal: "75012", nom_ville: "Paris 12e" },
      { code_postal: "69001", nom_ville: "Lyon 1er" },
      { code_postal: "69002", nom_ville: "Lyon 2e" },
      { code_postal: "69003", nom_ville: "Lyon 3e" },
      { code_postal: "69004", nom_ville: "Lyon 4e" },
      { code_postal: "69005", nom_ville: "Lyon 5e" },
      { code_postal: "13001", nom_ville: "Marseille 1er" },
      { code_postal: "13002", nom_ville: "Marseille 2e" },
      { code_postal: "13003", nom_ville: "Marseille 3e" },
    ];
    
    villesCache = villesFallback;
    res.json(villesFallback);
  }
};

exports.getPrixMinMax = async (req, res) => {
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
};

exports.registerStudio = async (req, res) => {
  const { nom, description, adresse, code_postal, prix_par_heure, equipements, photo_url, proprietaire_id } = req.body;

  if (!Array.isArray(equipements)) {
    return res.status(400).json({ error: "Le champ 'equipements' doit être un tableau" });
  }

  try {
    // Vérifier si l'authentification JWT est utilisée
    if (req.user) {
      // Vérifier que l'utilisateur peut enregistrer ce studio
      if (req.user.type !== 'proprio' || parseInt(req.user.id) !== parseInt(proprietaire_id)) {
        return res.status(403).json({ message: "Accès non autorisé" });
      }
    }
    
    const query = `
      INSERT INTO studio (nom, description, adresse, code_postal, prix_par_heure, equipements, photo_url, proprietaire_id)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;
      
    const values = [nom, description, adresse, code_postal, prix_par_heure, JSON.stringify(equipements), photo_url, proprietaire_id];
    const result = await pool.query(query, values);
    
    res.status(201).json({ 
      message: 'Studio enregistré avec succès!',
      studio: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
};

// Partie Historique des réservations
exports.getHistoriqueReservations = async (req, res) => {
  const artisteId = req.query.artiste;
  if (!artisteId) return res.status(400).json({ error: "Paramètre artiste manquant" });

  try {
    const result = await pool.query(`
      SELECT 
        r.id,
        r.date_reservation AS date,
        r.heure_debut,
        r.heure_fin,
        r.nbr_personne,
        r.prix_total,
        r.statut,
        s.id AS studio_id,
        s.nom,
        s.adresse,
        s.photo_url
      FROM reservation r
      JOIN studio s ON r.studio_id = s.id
      WHERE r.client_id = $1
      ORDER BY r.date_reservation DESC
    `, [artisteId]);
    
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
};

// Nouvelle fonction pour récupérer les réservations avec authentification JWT
exports.getUserReservations = async (req, res) => {
  try {
    const userId = req.params.id;
    const userType = req.user.type;
    
    // Vérifier que l'utilisateur a accès à ces données
    if (parseInt(req.user.id) !== parseInt(userId)) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }
    
    // Récupérer les réservations de l'utilisateur
    let query;
    
    if (userType === 'client') {
      query = `
        SELECT 
          r.id,
          r.date_reservation,
          r.heure_debut,
          r.heure_fin,
          r.nbr_personne,
          r.prix_total,
          r.statut,
          r.studio_id,
          s.nom,
          s.adresse,
          s.photo_url
        FROM reservation r
        JOIN studio s ON r.studio_id = s.id
        WHERE r.client_id = $1
        ORDER BY r.date_reservation DESC
      `;
    } else if (userType === 'proprio') {
      query = `
        SELECT 
          r.id,
          r.date_reservation,
          r.heure_debut,
          r.heure_fin,
          r.nbr_personne,
          r.prix_total,
          r.statut,
          r.studio_id,
          s.nom,
          s.adresse,
          s.photo_url
        FROM reservation r
        JOIN studio s ON r.studio_id = s.id
        WHERE s.proprietaire_id = $1
        ORDER BY r.date_reservation DESC
      `;
    } else {
      return res.status(400).json({ message: "Type d'utilisateur invalide" });
    }
    
    const result = await pool.query(query, [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des réservations:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};