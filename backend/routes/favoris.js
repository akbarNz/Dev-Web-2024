const express = require('express');
const router = express.Router();
const favorisController = require('../controllers/favorisController');

router.post('/', favorisController.addFavorite);
router.get('/', favorisController.getFavorites);
router.delete('/', favorisController.deleteFavorite);

module.exports = router;