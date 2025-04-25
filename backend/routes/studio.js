const express = require('express');
const router = express.Router();
const studioController = require('../controllers/studioController');

router.get('/', studioController.getStudios);
router.get('/filter', studioController.getFilteredStudios);
router.get('/equipements', studioController.getEquipements);
router.get('/prixMinMax', studioController.getPrixMinMax);
router.get('/ville', studioController.getVille);
router.post('/enregistrer', studioController.registerStudio);

module.exports = router;
