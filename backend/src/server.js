require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const studioRoutes = require('./routes/api/studios');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
      ? 'your-production-domain.com'
      : 'http://localhost:9090'
}));
app.use(express.json());
app.use(logger);

// Routes
app.use('/api/studios', studioRoutes);

// Error handling
app.use(errorHandler);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;