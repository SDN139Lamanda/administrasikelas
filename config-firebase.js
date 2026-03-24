/**
 * 🔥 Firebase Configuration - administrasikelas
 * File konfigurasi terpusat untuk semua modul
 * 
 * ✅ Firebase SDK v9+ (Modular)
 * ✅ Compatible dengan GitHub Pages (ES Modules via CDN)
 * ✅ Export fungsi yang sering digunakan
 */

// === IMPORT FIREBASE SDK (via CDN) ===
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

// === KONFIGURASI FIREBASE PROJECT ===
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

// === INISIALISASI FIREBASE ===
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// === EXPORT UTAMA (untuk import di file lain) ===
export {
  auth,
  database,
  // Auth functions
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  // Database functions
  ref,
  set,
  get,
  child,
  update,
  remove,
  onValue,
  push
};

// === HELPER FUNCTIONS (opsional, untuk memudahkan development) ===

/**
 * Ambil data user dari database berdasarkan UID
 * @param {string} uid - User ID dari Firebase Auth
 * @returns {Promise<Object|null>} Data user atau null
 */
export async function getUserData(uid) {
  try {
    const snapshot = await get(child(ref(database), `users/${uid}`));
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error("❌ Error fetching user ", error);
    return null;
  }
}

/**
 * Cek apakah user adalah guru
 * @param {string} uid - User ID
 * @returns {Promise<boolean>}
 */
export async function isGuru(uid) {
  const user = await getUserData(uid);
  return user?.role === 'guru';
}

/**
 * Redirect ke dashboard berdasarkan role
 * @param {string} role - 'guru' atau 'siswa'
 */
export function goToDashboard(role) {
  const routes = {
    'guru': 'dashboard.html',
    'siswa': 'dashboard-siswa.html'
  };
  const target = routes[role] || 'index.html';
  window.location.href = target;
}

/**
 * Format tanggal ke format Indonesia
 * @param {string|Date} date - Tanggal yang diformat
 * @returns {string} Tanggal dalam format DD MMMM YYYY
 */
export function formatDateID(date) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Format timestamp Firebase ke string readable
 * @param {number} timestamp - Unix timestamp
 * @returns {string}
 */
export function formatTimestamp(timestamp) {
  if (!timestamp) return '-';
  return new Date(parseInt(timestamp)).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// === LOG UNTUK DEBUGGING ===
console.log("✅ Firebase initialized - administrasikelas");
console.log("📦 Available exports: auth, database, getUserData, isGuru, goToDashboard, formatDateID");
