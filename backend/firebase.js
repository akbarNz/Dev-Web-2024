const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");

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
const db = getFirestore(app);

module.exports = db ;