// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCYrnEE4jmO6BBCrBRn0MEpiDLkHB50FQg",
  authDomain: "constra-efd4d.firebaseapp.com",
  projectId: "constra-efd4d",
  storageBucket: "constra-efd4d.firebasestorage.app",
  messagingSenderId: "197431773308",
  appId: "1:197431773308:web:24977a6d0ef9b0707461f9",
  measurementId: "G-WSKLLEN21K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { app, db, storage, auth };
