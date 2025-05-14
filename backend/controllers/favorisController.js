const pool = require('../db');

exports.addFavorite = async (req, res) => {
  const { client_id, studio_id } = req.body;

  try {
    // Vérifier si l'authentification JWT est utilisée
    if (req.user) {
      // Vérifier que l'utilisateur peut ajouter ce favori
      if (req.user.type !== 'client' || parseInt(req.user.id) !== parseInt(client_id)) {
        return res.status(403).json({ message: "Accès non autorisé" });
      }
    }
    
    await pool.query(`
      INSERT INTO Favoris (client_id, studio_id, date_ajout)
      VALUES ($1, $2, NOW())
    `, [client_id, studio_id]);

    res.status(201).json({ message: "Favori ajouté" });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ message: "Déjà en favoris" });
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.getFavorites = async (req, res) => {
  // Support pour l'ancien système (query parameter)
  let clientId = req.query.client;
  
  // Support pour le nouveau système (JWT auth)
  if (req.user && req.params.id) {
    // Vérifier que l'utilisateur demande ses propres favoris
    if (parseInt(req.user.id) !== parseInt(req.params.id) || req.user.type !== 'client') {
      return res.status(403).json({ message: "Accès non autorisé" });
    }
    
    clientId = req.params.id;
  }
  
  if (!clientId) return res.status(400).json({ error: "Paramètre client manquant" });

  try {
    const result = await pool.query(`
      SELECT 
        f.studio_id, f.client_id, f.date_ajout, s.nom, s.adresse, s.photo_url, s.prix_par_heure
      FROM Favoris f
      JOIN Studio s ON f.studio_id = s.id
      WHERE f.client_id = $1
    `, [clientId]);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
};

exports.deleteFavorite = async (req, res) => {
  const { client_id, studio_id } = req.body;
  if (!client_id || !studio_id) return res.status(400).json({ error: "Paramètres manquants" });

  try {
    // Vérifier si l'authentification JWT est utilisée
    if (req.user) {
      // Vérifier que l'utilisateur peut supprimer ce favori
      if (req.user.type !== 'client' || parseInt(req.user.id) !== parseInt(client_id)) {
        return res.status(403).json({ message: "Accès non autorisé" });
      }
    }

    const result = await pool.query(
      `DELETE FROM Favoris WHERE client_id = $1 AND studio_id = $2`,
      [client_id, studio_id]
    );

    if (result.rowCount === 0) return res.status(404).json({ message: "Favori non trouvé" });
    res.json({ message: "Favori retiré avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Nouvelle fonction pour récupérer les favoris avec authentification JWT
exports.getUserFavorites = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Vérifier que l'utilisateur a accès à ces données
    if (parseInt(req.user.id) !== parseInt(userId) || req.user.type !== 'client') {
      return res.status(403).json({ message: "Accès non autorisé" });
    }
    
    // Récupérer les favoris de l'utilisateur
    const query = `
      SELECT 
        f.studio_id, f.client_id, f.date_ajout, s.nom, s.adresse, s.photo_url, s.prix_par_heure
      FROM Favoris f
      JOIN Studio s ON f.studio_id = s.id
      WHERE f.client_id = $1
    `;
    
    const result = await pool.query(query, [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des favoris:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};