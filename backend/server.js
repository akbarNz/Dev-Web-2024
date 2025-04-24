const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();


const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/studio', require('./routes/studio'));
app.use('/api/clients', require('./routes/client'));
app.use('/api/proprietaires', require('./routes/proprio'));
app.use('/api/reservations', require('./routes/reservation'));
app.use('/api/favoris', require('./routes/favoris'));
app.use('/api/avis', require('./routes/avis'));

app.use(express.static(path.join(__dirname, 'public')));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
