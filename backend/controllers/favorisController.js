const pool = require('../db');

exports.addFavorite = async (req, res) => {
  const { client_id, studio_id } = req.body;

  try {
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
  const { client } = req.query;
  if (!client) return res.status(400).json({ error: "Paramètre client manquant" });

  try {
    const result = await pool.query(`
      SELECT 
        f.studio_id, s.nom, s.adresse, s.photo_url, s.prix_par_heure
      FROM Favoris f
      JOIN Studio s ON f.studio_id = s.id
      WHERE f.client_id = $1
    `, [client]);

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