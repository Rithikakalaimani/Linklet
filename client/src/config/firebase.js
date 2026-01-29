import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase config - use env vars in production for Linklet project
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyB9VQUGWZyfKOlg-9E_Iqsa7chlNH76wwQ",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "linklet-c4db1.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "linklet-c4db1",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "linklet-c4db1.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "108515427065",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:108515427065:web:9c0b3361e4b21b7eb21828",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-J7G3XFCM3J",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
