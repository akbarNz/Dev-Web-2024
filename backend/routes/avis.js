const express = require('express');
const router = express.Router();
const avisController = require('../controllers/avisController');

router.get('/', avisController.getAvis);
router.post('/', avisController.postAvis);

module.exports = router;