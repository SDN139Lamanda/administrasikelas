/**
 * 🔥 Firebase Configuration - administrasikelas
 * File ini harus dimuat PERTAMA sebelum file JS lainnya
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { 
  getDatabase, 
  ref, 
  set, 
  get, 
  child, 
  update, 
  remove, 
  onValue, 
  push
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// ⚙️ KONFIGURASI FIREBASE PROJECT
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

// 🚀 Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// 📦 Export semua yang dibutuhkan
export {
  auth,
  database,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  ref,
  set,
  get,
  child,
  update,
  remove,
  onValue,
  push
};

// 🎯 Helper: Ambil data user dari database
export async function getCurrentUserData(uid) {
  try {
    const snapshot = await get(child(ref(database), `users/${uid}`));
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error("❌ Error fetching user data:", error);
    return null;
  }
}

// 🎯 Helper: Redirect berdasarkan role
export function redirectToDashboard(role) {
  const redirects = {
    'guru': 'dashboard-guru.html',
    'siswa': 'dashboard-siswa.html'
  };
  const target = redirects[role];
  if (target) {
    window.location.href = target;
  } else {
    window.location.href = 'index.html';
  }
}

// 🎯 Helper: Format tanggal Indonesia
export function formatDateID(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

console.log("✅ Firebase initialized - administrasikelas");
