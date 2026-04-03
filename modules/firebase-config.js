// modules/firebase-config.js
// Konfigurasi Firebase - Auth + Firestore (LENGKAP)
// Versi: Updated for Reflection Module

// ✅ Import Firebase SDK (dari CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";

// ✅ Import Auth functions
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// ✅ Import Firestore functions (TAMBAHKAN INI!)
import { 
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  where
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// ✅ Firebase Config (Data Asli - Sudah Benar)
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

// ✅ EXPORT SEMUA YANG DIPERLUKAN (INI KUNCINYA!)
export { 
  // Auth
  auth, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  
  // Firestore Core
  db,
  
  // Firestore Functions (DITAMBAHKAN!)
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  where
};

console.log('✅ Firebase initialized & all exports ready');
