/**
 * ============================================
 * AUTH LOGIN - auth-login.js
 * Platform Administrasi Kelas Digital
 * ============================================
 * 
 * Fungsi:
 * - Login user dengan Firebase Authentication
 * - Ambil data user dari Firestore (include context: jenjang/kelas/mapel)
 * - Return user data lengkap untuk session storage
 * - Handle error dengan pesan user-friendly
 * 
 * ⚠️ PENTING: Return structure HARUS match dengan yang dibutuhkan dashboard.js
 */

// ✅ IMPORT FIREBASE CONFIG
import { auth, db } from './config-firebase.js';

// ✅ IMPORT FIREBASE SDK FUNCTIONS
import { 
    signInWithEmailAndPassword, 
    signOut 
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

import { 
    doc, 
    getDoc 
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

// ✅ ADMIN EMAIL (Untuk bypass check - opsional)
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
        
        // ✅ STEP 2: CEK EMAIL VERIFIED
        if (!user.emailVerified) {
            console.warn('⚠️ Email not verified');
            await signOut(auth);
            throw new Error('❌ Email belum terverifikasi. Silakan cek inbox/spam Anda.');
        }
        
        // ✅ STEP 3: AMBIL DATA USER dari Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (!userDoc.exists()) {
            console.error('❌ User document not found in Firestore');
            await signOut(auth);
            throw new Error('❌ Data user tidak ditemukan. Hubungi admin.');
        }
        
        const userData = userDoc.data();
        
        console.log('📋 User data loaded:', {
            email: userData.email,
            jenjang: userData.jenjang,
            role: userData.role,
            status: userData.status
        });
        
        // ✅ STEP 4: VALIDASI STATUS USER
        if (userData.status === 'rejected') {
            await signOut(auth);
            const reason = userData.rejectedReason || 'Tidak ada alasan';
            throw new Error(`❌ Akun Anda ditolak. Alasan: ${reason}`);
        }
        
        if (userData.status === 'suspended') {
            await signOut(auth);
            throw new Error('❌ Akun Anda dinonaktifkan. Hubungi admin.');
        }
        
        // ✅ STEP 5: UPDATE LAST LOGIN (Opsional tapi recommended)
        // Note: Tidak await agar tidak blocking UI
        getDoc(doc(db, 'users', user.uid)).then(async (docSnap) => {
            if (docSnap.exists()) {
                // Import updateDoc dynamically to avoid circular dependency issues
                const { updateDoc } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js');
                await updateDoc(doc(db, 'users', user.uid), {
                    lastLogin: new Date()
                });
            }
        }).catch(err => console.warn('⚠️ Could not update lastLogin:', err));
        
        // ✅ STEP 6: BUILD RETURN OBJECT (HARUS MATCH DENGAN DASHBOARD.JS)
        const returnUser = {
            // ✅ Basic Auth Fields
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            
            // ✅ Profile Fields
            namaLengkap: userData.namaLengkap || '',
            noHp: userData.noHp || '',
            sekolah: userData.sekolah || '',
            
            // ✅ CONTEXT-BASED ACCESS FIELDS (KRITIS UNTUK DASHBOARD FILTERING)
            jenjang: userData.jenjang || null,              // "sd" | "smp" | "sma"
            
            // SD-specific fields
            sdRole: userData.sdRole || null,                // "guru_kelas" | "guru_agama" | "guru_mapel"
            kelas: userData.kelas || null,                  // "1"|"2"|"3"|"4"|"5"|"6" (hanya untuk SD guru kelas)
            mataPelajaranSD: userData.mataPelajaranSD || null, // Mapel untuk guru agama/mapel SD
            
            // SMP-specific fields
            mataPelajaranSMP: userData.mataPelajaranSMP || null, // Mapel untuk SMP
            
            // SMA-specific fields
            mataPelajaranSMA: userData.mataPelajaranSMA || null, // Mapel untuk SMA
            
            // ✅ Role & Status
            role: userData.role || 'guru',                  // "guru" | "admin"
            status: userData.status || 'active',            // "active" | "pending" | etc.
            
            // ✅ Admin Fields
            approvedBy: userData.approvedBy || null,
            approvedAt: userData.approvedAt || null,
            
            // ✅ Timestamps
            createdAt: userData.createdAt || null,
            lastLogin: userData.lastLogin || null
        };
        
        console.log('✅ Login successful, returning user:', {
            email: returnUser.email,
            jenjang: returnUser.jenjang,
            role: returnUser.role
        });
        
        return {
            success: true,
            message: 'Login berhasil!',
            user: returnUser
        };
        
    } catch (error) {
        console.error('❌ Login error:', error);
        
        // ✅ HANDLE SPECIFIC FIREBASE ERROR CODES
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
        } else if (error.code === 'auth/operation-not-allowed') {
            errorMessage = 'Login email/password belum diaktifkan. Hubungi admin.';
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
// FUNGSI: Get Current User (Helper)
// ============================================
export async function getCurrentUser() {
    const user = auth.currentUser;
    
    if (!user) {
        return null;
    }
    
    try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (!userDoc.exists()) {
            return null;
        }
        
        const userData = userDoc.data();
        
        return {
            uid: user.uid,
            email: user.email,
            namaLengkap: userData.namaLengkap,
            jenjang: userData.jenjang,
            role: userData.role,
            status: userData.status,
            sekolah: userData.sekolah
        };
    } catch (error) {
        console.error('❌ Error getting current user:', error);
        return null;
    }
}

// ============================================
// FUNGSI: Check if User is Admin (Helper)
// ============================================
export function isAdmin(email) {
    return email === ADMIN_EMAIL;
}
