const express = require('express');
const router = express.Router();
const proprioController = require('../controllers/proprioController');
const auth = require('../middleware/auth');

// Routes existantes (compatibilité avec l'ancien système)
router.get('/', proprioController.getProprietaires);
router.get('/info', proprioController.getProprioInfo);
router.put('/save', proprioController.saveProprioInfo);

// Nouvelles routes protégées par JWT
router.get('/me', auth, proprioController.getCurrentProprio);
router.get('/:id', auth, proprioController.getProprioInfo);
router.put('/:id', auth, proprioController.saveProprioInfo);

module.exports = router;