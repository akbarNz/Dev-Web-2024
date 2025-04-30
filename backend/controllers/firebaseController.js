import { db } from "../firebase.js";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const saveReservationToFirebase = async (req, res) => {
  try {
    const { nbr_personne } = req.body;

    await addDoc(collection(db, "reservations"), {
      nbr_personne,
      firebase_created_at: serverTimestamp(),
    });

    res.status(200).json({ message: "Réservation enregistrée dans Firebase" });
  } catch (error) {
    console.error("Erreur Firebase:", error);
    res.status(500).json({ error: "Erreur Firebase" });
  }
};