// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAIoTh_sTvR_8hi1X8oRxRMAadY3M6Ji7E",
  authDomain: "rentalhub-f0782.firebaseapp.com",
  projectId: "rentalhub-f0782",
  storageBucket: "rentalhub-f0782.firebasestorage.app",
  messagingSenderId: "991825837841",
  appId: "1:991825837841:web:c78bc82e1cc6bb616916b0",
  measurementId: "G-382NMRFMT6"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); // Firestore instance
export const googleProvider = new GoogleAuthProvider();
const analytics = getAnalytics(app);
