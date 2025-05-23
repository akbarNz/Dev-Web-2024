const express = require('express');
const router = express.Router();
const cloudinaryController = require('../controllers/cloudinaryController');

// Route sécurisée pour supprimer une image
router.post('/delete', cloudinaryController.deleteImage);

module.exports = router;
