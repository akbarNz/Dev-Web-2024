const pool = require('../db');

exports.getAvis = async (req, res) => {
  const { client_id } = req.query;
  if (!client_id) return res.status(400).json({ error: "Paramètre client_id manquant" });

  try {
    const result = await pool.query(
      'SELECT studio_id, note FROM avis WHERE client_id = $1',
      [client_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.postAvis = async (req, res) => {
  const { client_id, studio_id, note } = req.body;

  try {
    const existingAvis = await pool.query(
      'SELECT * FROM avis WHERE client_id = $1 AND studio_id = $2',
      [client_id, studio_id]
    );

    if (existingAvis.rows.length > 0) {
      const updateResult = await pool.query(
        'UPDATE avis SET note = $1, date_creation = NOW() WHERE client_id = $2 AND studio_id = $3 RETURNING *',
        [note, client_id, studio_id]
      );
      res.json({ message: 'Avis mis à jour', avis: updateResult.rows[0] });
    } else {
      const insertResult = await pool.query(
        'INSERT INTO avis (client_id, studio_id, note, date_creation) VALUES ($1, $2, $3, NOW()) RETURNING *',
        [client_id, studio_id, note]
      );
      res.status(201).json({ message: 'Avis créé', avis: insertResult.rows[0] });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};