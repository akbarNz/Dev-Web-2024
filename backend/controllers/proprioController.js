const pool = require('../db');

exports.getProprietaires = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM proprio WHERE role = 'propriétaire'");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
};

exports.getProprioInfo = async (req, res) => {
  try {
    const userId = req.query.id;
    if (!userId) return res.status(400).json({ error: "ID utilisateur manquant" });
    
    const result = await pool.query('SELECT * FROM Proprio WHERE id = $1', [userId]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Propriétaire non trouvé" });

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur serveur");
  }
};

exports.saveProprioInfo = async (req, res) => {
  try {
    const { id, photo_url, nom, email, numero_telephone } = req.body;

    const query = `
      UPDATE Proprio
      SET photo_url = $1, nom = $2, email = $3, numero_telephone = $4
      WHERE id = $5
      RETURNING *;
    `;

    const result = await pool.query(query, [photo_url, nom, email, numero_telephone, id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Propriétaire non trouvé" });

    res.json({ message: "Profil propriétaire mis à jour", user: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};