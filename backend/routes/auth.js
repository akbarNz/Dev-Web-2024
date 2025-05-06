const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Route pour l'inscription
router.post('/register', authController.register);

// Route pour la connexion
router.post('/login', authController.login);

// Route pour récupérer l'utilisateur actuel (protégée)
router.get('/me', authMiddleware, authController.getCurrentUser);

// Route pour la déconnexion
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;