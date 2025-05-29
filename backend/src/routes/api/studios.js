const express = require('express');
const router = express.Router();
const StudioController = require('../../controllers/studioController');
const { validateStudioSearch, validate, validateBestRatedSearch } = require('../../middleware/validation');

// Search studios with various criteria (radius, name, city)
router.get('/search', validateStudioSearch, validate, StudioController.getStudios);

// Get best rated studios
router.get('/best-rated', validateBestRatedSearch, validate, StudioController.getBestRatedStudios);

// Get studio by ID
router.get('/:id', StudioController.getStudioById);

module.exports = router;