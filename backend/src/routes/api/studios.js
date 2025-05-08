const express = require('express');
const router = express.Router();
const StudioController = require('../../controllers/studioController');
const { validateStudioSearch, validate, validateBestRatedSearch } = require('../../middleware/validation');

// Get studios based on search criteria
router.get('/search', validateStudioSearch, validate, StudioController.getStudios);

// Get studio by ID
router.get('/:id', StudioController.getStudioById);

// Get best rated studios nearby
router.get('/best-rated', validateBestRatedSearch, validate, StudioController.getBestRatedStudios);

module.exports = router;