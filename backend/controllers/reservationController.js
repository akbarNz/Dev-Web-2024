const pool = require('../db');

exports.createReservation = async (req, res) => {
  const { client_id, studio_id, date_reservation, nbr_personne, heure_debut, heure_fin, prix_total } = req.body;

  try {
    const query = `
      INSERT INTO reservation (client_id, studio_id, date_reservation, nbr_personne, heure_debut, heure_fin, prix_total) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;
    `;

    const result = await pool.query(query, [client_id, studio_id, date_reservation, nbr_personne, heure_debut, heure_fin, prix_total]);
    res.status(201).json({ message: 'Réservation enregistrée!', reservation: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.getHistorique = async (req, res) => {
  const { artiste } = req.query;
  if (!artiste) return res.status(400).json({ error: "Paramètre artiste manquant" });

  try {
    const result = await pool.query(`
      SELECT 
        r.id, r.studio_id, r.date_reservation AS date, r.nbr_personne,
        r.heure_debut, r.heure_fin, r.statut, r.prix_total,
        s.nom, s.adresse, s.photo_url
      FROM Reservation AS r
      JOIN Studio AS s ON r.studio_id = s.id
      WHERE r.client_id = $1
      ORDER BY r.date_reservation DESC;
    `, [artiste]);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
};