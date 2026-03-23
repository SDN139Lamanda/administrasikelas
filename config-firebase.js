/**
 * Firebase Configuration
 * Menggunakan Environment Variables untuk keamanan
 */

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database"; // Untuk Realtime Database

// Deteksi environment (Vite vs CRA vs Fallback)
const getEnvVar = (key) => {
  // Vite
  if (import.meta && import.meta.env) {
    return import.meta.env[key];
  }
  // Create React App / Node
  if (process && process.env) {
    return process.env[key];
  }
  // Fallback (Development only - jangan dipakai di production)
  return null;
};

const firebaseConfig = {
  apiKey: getEnvVar('VITE_FIREBASE_API_KEY') || getEnvVar('REACT_APP_FIREBASE_API_KEY'),
  authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN') || getEnvVar('REACT_APP_FIREBASE_AUTH_DOMAIN'),
  databaseURL: getEnvVar('VITE_FIREBASE_DATABASE_URL') || getEnvVar('REACT_APP_FIREBASE_DATABASE_URL'),
  projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID') || getEnvVar('REACT_APP_FIREBASE_PROJECT_ID'),
  storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET') || getEnvVar('REACT_APP_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID') || getEnvVar('REACT_APP_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnvVar('VITE_FIREBASE_APP_ID') || getEnvVar('REACT_APP_FIREBASE_APP_ID'),
  measurementId: getEnvVar('VITE_FIREBASE_MEASUREMENT_ID') || getEnvVar('REACT_APP_FIREBASE_MEASUREMENT_ID')
};

// Validasi konfigurasi
if (!firebaseConfig.apiKey) {
  console.warn('⚠️ Firebase API Key tidak ditemukan! Pastikan file .env sudah dibuat dan server sudah direstart.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app); // Firestore
export const rtdb = getDatabase(app); // Realtime Database
export default app;
