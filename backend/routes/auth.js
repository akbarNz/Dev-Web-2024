const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Routes d'inscription
router.post('/register/client', authController.registerClient);
router.post('/register/proprio', authController.registerProprio);

// Route de connexion
router.post('/login', authController.login);

// Route pour récupérer l'utilisateur courant (protégée)
router.get('/me', auth, authController.getCurrentUser);

module.exports = router;