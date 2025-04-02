const express = require('express');
const router = express.Router();
const StudioController = require('../../controllers/studioController');
const { 
    validateStudioSearch, 
    validateStudioCreation, 
    validate 
} = require('../../middleware/validation');

// Get studios near a location
router.get('/nearby', validateStudioSearch, validate, StudioController.getNearbyStudios);

// Get studio by ID
router.get('/:id', StudioController.getStudioById);

// Create new studio
router.post('/', validateStudioCreation, validate, StudioController.createStudio);

module.exports = router;