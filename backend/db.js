const { Pool } = require('pg');

// Utiliser la variable d'environnement DATABASE_URL fournie par Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,  // Utiliser DATABASE_URL sur Render
});

module.exports = pool;
