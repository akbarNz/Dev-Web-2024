const express = require('express');
const router = express.Router();
const studioController = require('../controllers/studioController');

router.get('/', studioController.getStudios);
router.get('/filter', studioController.getFilteredStudios);
router.get('/equipements', studioController.getEquipements);
router.get('/prixMinMax', studioController.getPrixMinMax);
router.get('/villes', studioController.getVilles);
router.post('/enregistrer', studioController.registerStudio);

module.exports = router;