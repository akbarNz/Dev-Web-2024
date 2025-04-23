const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');

router.get('/artistes', clientController.getArtistes);
router.get('/info', clientController.getClientInfo);
router.post('/save', clientController.saveClientInfo);

module.exports = router;