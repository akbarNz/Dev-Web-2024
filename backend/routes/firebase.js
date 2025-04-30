const express = require('express');
const router = express.Router();
const firebaseController = require("../controllers/firebaseController");

router.post('/', firebaseController.saveReservationToFirebase);

module.exports = router;