import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Ajoutez cette ligne
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Exportez les services nécessaires
export const db = getFirestore(app); // Firestore
export const analytics = getAnalytics(app); // Analytics (optionnel)