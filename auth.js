/**
 * 🔐 Module: Autentikasi Pengguna
 * Menangani: login, logout, register siswa, proteksi halaman
 */

import {
  auth,
  database,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  ref,
  get,
  child,
  set
} from './firebase-config.js';

// === 🎯 HANDLE LOGIN ===
export async function handleLogin(email, password) {
  try {
    // 1. Authenticate dengan Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // 2. Ambil data user dari Realtime Database
    const snapshot = await get(child(ref(database), `users/${user.uid}`));
    
    if (!snapshot.exists()) {
      await signOut(auth);
      throw new Error('⚠️ Data pengguna tidak ditemukan. Hubungi administrator.');
    }
    
    const userData = snapshot.val();
    
    // 3. Simpan info user di sessionStorage
    sessionStorage.setItem('currentUser', JSON.stringify({
      uid: user.uid,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      studentId: userData.studentId || null
    }));
    
    // 4. Return success + role untuk redirect
    return { 
      success: true, 
      role: userData.role,
      user: userData
    };
    
  } catch (error) {
    console.error("❌ Login error:", error);
    return { 
      success: false, 
      message: getLoginErrorMessage(error.code) 
    };
  }
}

// === 🎯 HANDLE LOGOUT ===
export async function handleLogout() {
  try {
    await signOut(auth);
    sessionStorage.removeItem('currentUser');
    window.location.href = 'index.html';
    return true;
  } catch (error) {
    console.error("❌ Logout error:", error);
    return false;
  }
}

// === 🎯 PROTEKSI HALAMAN ===
export function protectPage(requiredRole = null) {
  return new Promise((resolve, reject) => {
    const { onAuthStateChanged } = require('./firebase-config.js');
    
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = 'index.html';
        reject('User not authenticated');
        return;
      }
      
      let currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
      
      if (!currentUser) {
        try {
          const snapshot = await get(child(ref(database), `users/${user.uid}`));
          if (!snapshot.exists()) {
            await signOut(auth);
            window.location.href = 'index.html';
            reject('User data not found');
            return;
          }
          currentUser = snapshot.val();
          sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        } catch (error) {
          window.location.href = 'index.html';
          reject(error);
          return;
        }
      }
      
      if (requiredRole && currentUser.role !== requiredRole) {
        const redirectPath = currentUser.role === 'guru' ? 'dashboard-guru.html' : 'dashboard-siswa.html';
        window.location.href = redirectPath;
        reject('Unauthorized access');
        return;
      }
      
      resolve(currentUser);
    });
  });
}

// === 🎯 HELPER: Pesan Error ===
function getLoginErrorMessage(code) {
  const messages = {
    'auth/invalid-email': 'Format email tidak valid.',
    'auth/user-disabled': 'Akun ini telah dinonaktifkan.',
    'auth/user-not-found': 'Email tidak terdaftar.',
    'auth/wrong-password': 'Password salah.',
    'auth/too-many-requests': 'Terlalu banyak percobaan. Silakan tunggu.'
  };
  return messages[code] || 'Terjadi kesalahan. Silakan coba lagi.';
}

console.log("✅ Auth module loaded");
