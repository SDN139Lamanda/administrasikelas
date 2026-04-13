// modules/firebase-config.js
// Firebase Configuration

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";

// ✅ TAMBAHAN: Import lebih banyak Auth functions
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  // ✅ TAMBAHAN UNTUK REGISTER & RESET PASSWORD:
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  sendPasswordResetEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

import { 
  getFirestore,
  collection,
  setDoc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  where
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// ✅ TAMBAHAN: Export semua fungsi yang dibutuhkan
export { 
  auth, 
  googleProvider,
  // Auth sign in/out
  signInWithEmailAndPassword, 
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  // ✅ TAMBAHAN: Auth functions untuk register & reset password
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  sendPasswordResetEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  // Firestore
  db,
  collection,
  setDoc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  where
};
// ... existing firebase config code ...
// ============================================
// ✅ RE-EXPORTS FOR BROWSER ES MODULES
// ============================================
// Re-export Firestore functions so other modules can import locally
export { doc, setDoc, getDoc, collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, deleteDoc, updateDoc } from 'firebase/firestore';
export { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';

console.log('✅ [Firebase Config] Re-exports ready for browser modules');
console.log('✅ Firebase initialized');
