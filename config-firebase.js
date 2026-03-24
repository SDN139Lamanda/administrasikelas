// config-firebase.js
// Konfigurasi Firebase - Auth + Firestore

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// ⚠️ GANTI DENGAN DATA FIREBASE ANDA SENDIRI
const firebaseConfig = {
  apiKey: "AIzaSyDxxxx-xxxxxxxxxxxxxxx",
  authDomain: "proyek-anda.firebaseapp.com",
  projectId: "proyek-anda",
  storageBucket: "proyek-anda.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:xxxxx"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
const auth = getAuth(app);
const db = getFirestore(app); // ✅ Ini yang tadi kurang!

// Export semua yang dibutuhkan
export { auth, signInWithEmailAndPassword, signOut, db }; // ✅ db sudah di-export
