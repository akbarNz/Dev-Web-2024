import express from "express";
import { saveReservationToFirebase } from "../controllers/firebaseController.js";

const router = express.Router();

router.post("/firebase/reservations", saveReservationToFirebase);

export default router;