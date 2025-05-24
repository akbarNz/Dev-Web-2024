const pool = require('../db');

exports.getArtistes = async (req, res) => {
  try {
    const result = await pool.query("SELECT id, nom, email, photo_url FROM client WHERE role = 'artiste'");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
};

exports.getClientInfo = async (req, res) => {
  try {
    // Ancien système avec query parameter
    let userId = req.query.id;
    
    // Support pour le nouveau système JWT
    if (req.user && req.params.id) {
      // Si l'utilisateur demande ses propres informations, utiliser l'ID du token
      // Sinon, vérifier qu'un admin fait la demande
      if (parseInt(req.user.id) === parseInt(req.params.id) && req.user.type === 'client') {
        userId = req.params.id;
      } else if (req.user.role === 'admin') {
        userId = req.params.id;
      } else {
        return res.status(403).json({ error: "Accès non autorisé" });
      }
    }
    
    if (!userId) return res.status(400).json({ error: "ID utilisateur manquant" });
    
    // Exclure le mot de passe de la réponse
    const result = await pool.query('SELECT id, nom, email, numero_telephone, photo_url, role, date_inscription, verifie, deux_facteur_active FROM Client WHERE id = $1', [userId]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Utilisateur non trouvé" });

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur serveur");
  }
};

exports.saveClientInfo = async (req, res) => {
  try {
    const { id, photo_url, nom, email, numero_telephone } = req.body;
    
    // Vérifier l'authentification JWT si présente
    if (req.user) {
      // Seul l'utilisateur concerné ou un admin peut modifier ses infos
      if (parseInt(req.user.id) !== parseInt(id) || req.user.type !== 'client') {
        if (req.user.role !== 'admin') {
          return res.status(403).json({ error: "Accès non autorisé" });
        }
      }
    }

    const query = `
      UPDATE Client
      SET photo_url = $1, nom = $2, email = $3, numero_telephone = $4
      WHERE id = $5
      RETURNING id, nom, email, numero_telephone, photo_url, role, date_inscription, verifie, deux_facteur_active;
    `;

    const result = await pool.query(query, [photo_url, nom, email, numero_telephone, id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Utilisateur non trouvé" });

    res.json({ message: "Profil client mis à jour", user: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Nouvelle méthode pour obtenir les informations de l'utilisateur authentifié
exports.getCurrentClient = async (req, res) => {
  try {
    if (!req.user || req.user.type !== 'client') {
      return res.status(403).json({ error: "Accès non autorisé" });
    }
    
    const userId = req.user.id;
    
    const result = await pool.query(
      'SELECT id, nom, email, numero_telephone, photo_url, role, date_inscription, verifie, deux_facteur_active FROM Client WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur serveur");
  }
};