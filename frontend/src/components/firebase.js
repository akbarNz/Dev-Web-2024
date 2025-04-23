import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Ajoutez cette ligne
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDtwceY5HXb142zc5WV9diW6rHZ32zNtck",
  authDomain: "dev-elec-projet.firebaseapp.com",
  projectId: "dev-elec-projet",
  storageBucket: "dev-elec-projet.appspot.com", // Note: ".appspot.com" est le format standard
  messagingSenderId: "698971351779",
  appId: "1:698971351779:web:4328358fc7c07203ccb3d6",
  measurementId: "G-HB71THGN4P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Exportez les services nécessaires
export const db = getFirestore(app); // Firestore
export const analytics = getAnalytics(app); // Analytics (optionnel)