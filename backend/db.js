const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Récupère un utilisateur par email (recherche dans Client et Proprio)
async function getUserByEmail(email) {
  const clientQuery = 'SELECT id, nom as name, email, password, role FROM Client WHERE email = $1';
  const proprioQuery = 'SELECT id, nom as name, email, password, role FROM Proprio WHERE email = $1';

  let res = await pool.query(clientQuery, [email]);
  if (res.rows.length > 0) return res.rows[0];

  res = await pool.query(proprioQuery, [email]);
  if (res.rows.length > 0) return res.rows[0];

  return null;
}

// Récupère un utilisateur par id (recherche dans Client et Proprio)
async function getUserById(id) {
  const clientQuery = 'SELECT id, nom as name, email, password, role FROM Client WHERE id = $1';
  const proprioQuery = 'SELECT id, nom as name, email, password, role FROM Proprio WHERE id = $1';

  let res = await pool.query(clientQuery, [id]);
  if (res.rows.length > 0) return res.rows[0];

  res = await pool.query(proprioQuery, [id]);
  if (res.rows.length > 0) return res.rows[0];

  return null;
}

// Crée un nouvel utilisateur, en fonction du rôle, dans la table appropriée
async function createUser(user) {
  const { email, password, name, role, createdAt } = user;
  if (role === 'client' || role === 'artiste') {
    const query = 'INSERT INTO Client (email, nom, password, role, date_inscription) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, nom as name, role';
    const values = [email, name, password, role, createdAt];
    const res = await pool.query(query, values);
    return res.rows[0];
  } else if (role === 'propriétaire' || role === 'proprio') {
    const query = 'INSERT INTO Proprio (email, nom, password, role, date_inscription) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, nom as name, role';
    const values = [email, name, password, role, createdAt];
    const res = await pool.query(query, values);
    return res.rows[0];
  } else {
    throw new Error('Rôle utilisateur invalide');
  }
}

module.exports = {
  pool,
  getUserByEmail,
  getUserById,
  createUser,
};
