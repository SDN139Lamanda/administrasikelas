// config-firebase.js
// Konfigurasi Firebase - Auth + Firestore
// Versi: Diperbaiki & Lengkap

// ✅ Import Firebase SDK (dari CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// ✅ Firebase Config (DIPERBAIKI - tanpa spasi di databaseURL)
const firebaseConfig = {
  apiKey: "AIzaSyCYoUcSKj8aAZTaNgKtrn0bYHPmedVHAE4",
  authDomain: "sdn139lamanda-a67a8.firebaseapp.com",
  databaseURL: "https://sdn139lamanda-a67a8-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sdn139lamanda-a67a8",
  storageBucket: "sdn139lamanda-a67a8.firebasestorage.app",
  messagingSenderId: "520862158793",
  appId: "1:520862158793:web:c8cb5a4259d5e54ea06218",
  measurementId: "G-S012NQH5LS"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Initialize Services
const auth = getAuth(app);
const db = getFirestore(app);

// ✅ Export untuk digunakan di file lain
export { auth, signInWithEmailAndPassword, signOut, db };
