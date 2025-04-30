// backend/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics"; // optionnel, souvent inutile côté backend

const firebaseConfig = {
  apiKey: "AIzaSyDtwceY5HXb142zc5WV9diW6rHZ32zNtck",
  authDomain: "dev-elec-projet.firebaseapp.com",
  projectId: "dev-elec-projet",
  storageBucket: "dev-elec-projet.appspot.com",
  messagingSenderId: "698971351779",
  appId: "1:698971351779:web:4328358fc7c07203ccb3d6",
  measurementId: "G-HB71THGN4P"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);