const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const auth = require('../middleware/auth');

// Routes existantes (compatibilité avec l'ancien système)
router.get('/artistes', clientController.getArtistes);
router.get('/info', clientController.getClientInfo);
router.put('/save', clientController.saveClientInfo);

// Nouvelles routes protégées par JWT
router.get('/me', auth, clientController.getCurrentClient);
router.get('/:id', auth, clientController.getClientInfo);
router.put('/:id', auth, clientController.saveClientInfo);

module.exports = router;