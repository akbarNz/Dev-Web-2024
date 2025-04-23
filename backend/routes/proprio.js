const express = require('express');
const router = express.Router();
const proprioController = require('../controllers/proprioController');

router.get('/', proprioController.getProprietaires);
router.get('/info', proprioController.getProprioInfo);
router.post('/save', proprioController.saveProprioInfo);

module.exports = router;