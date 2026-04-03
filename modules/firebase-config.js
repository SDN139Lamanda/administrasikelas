// modules/firebase-config.js
// Konfigurasi Firebase - Auth + Firestore (LENGKAP + Google Sign-In)

// ✅ Import Firebase SDK (dari CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";

// ✅ Import Auth functions (LENGKAP termasuk Google Sign-In)
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signInWithPopup,      // ← TAMBAHAN: Untuk Google login
  GoogleAuthProvider,   // ← TAMBAHAN: Provider Google
  signOut,
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// ✅ Import Firestore functions (TAMBAH getDoc!)
import { 
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,              // ← ✅ DITAMBAHKAN: Untuk fetch single document!
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  where
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// ✅ Firebase Config (Data Asli)
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
const googleProvider = new GoogleAuthProvider(); // ← Provider untuk Google login

// ✅ EXPORT SEMUA YANG DIPERLUKAN (TAMBAH getDoc!)
export { 
  // Auth
  auth, 
  googleProvider,           // ← TAMBAHAN: Export provider Google
  signInWithEmailAndPassword, 
  signInWithPopup,          // ← TAMBAHAN: Export function Google login
  signOut,
  onAuthStateChanged,
  
  // Firestore Core
  db,
  
  // Firestore Functions (TAMBAH getDoc!)
  collection,
  addDoc,
  getDocs,
  getDoc,                  // ← ✅ DITAMBAHKAN: Untuk fetch single document!
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
