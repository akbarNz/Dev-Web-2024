const express = require('express');
const router = express.Router();
const favorisController = require('../controllers/favorisController');
const auth = require('../middleware/auth'); // Middleware d'authentification

// Routes existantes (compatibilité avec l'ancien système)
router.post('/', favorisController.addFavorite);
router.get('/', favorisController.getFavorites);
router.delete('/', favorisController.deleteFavorite);

// Nouvelles routes protégées par JWT
router.get('/user/:id', auth, favorisController.getUserFavorites);
router.post('/secure', auth, favorisController.addFavorite);
router.delete('/secure', auth, favorisController.deleteFavorite);

module.exports = router;