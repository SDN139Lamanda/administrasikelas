/**
 * ============================================
 * AUTH LOGIN - auth-login.js
 * Platform Administrasi Kelas Digital
 * ============================================
 * 
 * ✅ UPDATE: Tambah field 'features' untuk UI visibility control
 */

import { auth, db } from './config-firebase.js';

import { 
    signInWithEmailAndPassword, 
    signOut 
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

import { 
    doc, 
    getDoc 
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

const ADMIN_EMAIL = 'radiah.tifarahs@gmail.com';

// ============================================
// FUNGSI UTAMA: Login User
// ============================================
export async function loginUser(email, password) {
    console.log('🔐 Login attempt for:', email);
    
    try {
        // ✅ STEP 1: SIGN IN dengan Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        console.log('✅ Auth successful, UID:', user.uid);
        
        // ✅ STEP 2: CEK EMAIL VERIFIED (Temporary disabled for testing)
        // if (!user.emailVerified) {
        //     await signOut(auth);
        //     throw new Error('❌ Email belum terverifikasi.');
        // }
        
        // ✅ STEP 3: AMBIL DATA USER dari Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (!userDoc.exists()) {
            console.error('❌ User document not found in Firestore');
            await signOut(auth);
            throw new Error('❌ Data user tidak ditemukan. Hubungi admin.');
        }
        
        const userData = userDoc.data();
        
        // ✅ STEP 4: VALIDASI STATUS USER
        if (userData.status === 'rejected') {
            await signOut(auth);
            throw new Error(`❌ Akun Anda ditolak. Alasan: ${userData.rejectedReason || 'Tidak ada alasan'}`);
        }
        
        if (userData.status === 'suspended') {
            await signOut(auth);
            throw new Error('❌ Akun Anda dinonaktifkan. Hubungi admin.');
        }
        
        // ✅ STEP 5: BUILD RETURN OBJECT
        const returnUser = {
            // Basic Auth Fields
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            
            // Profile Fields
            namaLengkap: userData.namaLengkap || '',
            noHp: userData.noHp || '',
            sekolah: userData.sekolah || '',
            
            // CONTEXT-BASED ACCESS FIELDS
            jenjang: userData.jenjang || null,
            sdRole: userData.sdRole || null,
            kelas: userData.kelas || null,
            mataPelajaranSD: userData.mataPelajaranSD || null,
            mataPelajaranSMP: userData.mataPelajaranSMP || null,
            mataPelajaranSMA: userData.mataPelajaranSMA || null,
            
            // Role & Status
            role: userData.role || 'guru',
            status: userData.status || 'active',
            
            // ✅ FEATURE ACCESS FIELD (UPDATE BARU!) ⭐
            features: userData.features || null,
            
            // Timestamps
            createdAt: userData.createdAt || null,
            lastLogin: userData.lastLogin || null
        };
        
        console.log('✅ Login successful, returning user:', {
            email: returnUser.email,
            jenjang: returnUser.jenjang,
            role: returnUser.role,
            features: returnUser.features
        });
        
        return {
            success: true,
            message: 'Login berhasil!',
            user: returnUser
        };
        
    } catch (error) {
        console.error('❌ Login error:', error);
        
        let errorMessage = error.message;
        
        if (error.code === 'auth/invalid-email') {
            errorMessage = 'Format email tidak valid.';
        } else if (error.code === 'auth/user-disabled') {
            errorMessage = 'Akun ini telah dinonaktifkan.';
        } else if (error.code === 'auth/user-not-found') {
            errorMessage = 'Email tidak terdaftar. Silakan daftar terlebih dahulu.';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Password salah. Silakan coba lagi.';
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Terlalu banyak percobaan. Silakan coba beberapa menit lagi.';
        } else if (error.code === 'auth/network-request-failed') {
            errorMessage = 'Koneksi internet bermasalah. Silakan periksa koneksi Anda.';
        }
        
        return {
            success: false,
            error: errorMessage,
            code: error.code
        };
    }
}

// ============================================
// FUNGSI: Logout User
// ============================================
export async function logoutUser() {
    try {
        await signOut(auth);
        console.log('✅ Logout successful');
        return { success: true };
    } catch (error) {
        console.error('❌ Logout error:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// FUNGSI: Check if User is Admin
// ============================================
export function isAdmin(email) {
    return email === ADMIN_EMAIL;
}
