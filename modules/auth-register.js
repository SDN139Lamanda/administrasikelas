/**
 * ============================================
 * AUTH REGISTER - auth-register.js
 * Platform Administrasi Kelas Digital
 * ============================================
 * 
 * Fungsi:
 * - Register user baru ke Firebase Auth
 * - Simpan data user ke Firestore (include jenjang/kelas/mapel)
 * - Kirim email verifikasi
 * - Set status = "active" (langsung aktif, tanpa approval)
 */

import { auth, db } from './config-firebase.js';
import { ADMIN_CONFIG } from './config-admin.js';
import { 
    createUserWithEmailAndPassword, 
    updateProfile,
    sendEmailVerification 
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { 
    doc, 
    setDoc 
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

// ============================================
// FUNGSI: Register Guru Baru
// ============================================
export async function registerGuru(formData) {
    console.log('📝 Registration attempt for:', formData.email);
    
    try {
        // ✅ STEP 1: CREATE USER di Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
            auth, 
            formData.email, 
            formData.password
        );
        const user = userCredential.user;
        
        console.log('✅ Auth user created:', user.uid);
        
        // ✅ STEP 2: UPDATE PROFILE (Display Name)
        await updateProfile(user, {
            displayName: formData.namaLengkap
        });
        
        // ✅ STEP 3: KIRIM EMAIL VERIFIKASI
        await sendEmailVerification(user);
        console.log('📧 Verification email sent');
        
        // ✅ STEP 4: SIMPAN DATA USER di Firestore
        // ⚠️ PENTING: Simpan jenjang, kelas, mataPelajaran untuk context-based access
        
        const userData = {
            uid: user.uid,
            email: formData.email,
            namaLengkap: formData.namaLengkap,
            noHp: formData.noHp,
            sekolah: formData.sekolah,
            
            // ✅ CONTEXT-BASED ACCESS FIELDS
            jenjang: formData.jenjang,              // "sd" | "smp" | "sma"
            kelas: formData.kelas || null,          // "1"|"2"|"3"|"4"|"5"|"6" (hanya untuk SD)
            mataPelajaran: formData.mataPelajaran || null,  // "Matematika"|"B. Indo"|dll (hanya untuk SMP/SMA)
            
            // ✅ ROLE & STATUS
            role: 'guru',                           // Default role: guru
            status: 'active',                       // ✅ Langsung aktif (tanpa approval)
            emailVerified: user.emailVerified,
            
            // ✅ ADMIN FIELDS (untuk tracking)
            approvedBy: 'system',                   // Auto-approved by system
            approvedAt: new Date(),
            rejectedReason: '',
            
            // ✅ TIMESTAMPS
            createdAt: new Date(),
            lastLogin: null,
            updatedAt: new Date()
        };
        
        // Save to Firestore
        await setDoc(doc(db, 'users', user.uid), userData);
        
        console.log('✅ User profile saved to Firestore');
        console.log('📋 User context:', {
            jenjang: userData.jenjang,
            kelas: userData.kelas,
            mataPelajaran: userData.mataPelajaran,
            role: userData.role,
            status: userData.status
        });
        
        return {
            success: true,
            message: 'Registrasi berhasil! Silakan cek email untuk verifikasi.',
            needsVerification: true,
            user: {
                uid: user.uid,
                email: user.email,
                namaLengkap: formData.namaLengkap,
                jenjang: userData.jenjang,
                kelas: userData.kelas,
                mataPelajaran: userData.mataPelajaran,
                role: userData.role,
                status: userData.status,
                emailVerified: user.emailVerified
            }
        };
        
    } catch (error) {
        console.error('❌ Registration error:', error);
        
        // Handle specific Firebase errors
        let errorMessage = error.message;
        
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'Email sudah terdaftar. Silakan login atau gunakan email lain.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Format email tidak valid.';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'Password terlalu lemah. Minimal 8 karakter.';
        } else if (error.code === 'auth/network-request-failed') {
            errorMessage = 'Koneksi internet bermasalah. Silakan coba lagi.';
        } else if (error.code === 'auth/operation-not-allowed') {
            errorMessage = 'Registrasi email/password belum diaktifkan di Firebase Console.';
        }
        
        return {
            success: false,
            error: errorMessage
        };
    }
}

// ============================================
// FUNGSI: Get User Context (Helper untuk Dashboard)
// ============================================
export async function getUserContext(uid) {
    try {
        const { getDoc } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js');
        const userDoc = await getDoc(doc(db, 'users', uid));
        
        if (!userDoc.exists()) {
            return null;
        }
        
        const data = userDoc.data();
        
        return {
            jenjang: data.jenjang,
            kelas: data.kelas,
            mataPelajaran: data.mataPelajaran,
            role: data.role,
            status: data.status,
            sekolah: data.sekolah
        };
    } catch (error) {
        console.error('❌ Error getting user context:', error);
        return null;
    }
}

// ============================================
// FUNGSI: Check User Access (Helper untuk Module Filtering)
// ============================================
export function checkModuleAccess(userContext, moduleType) {
    if (!userContext) return false;
    
    const { jenjang, kelas, mataPelajaran, role } = userContext;
    
    // Admin bisa akses semua
    if (role === 'admin') return true;
    
    // Check berdasarkan module type
    switch(moduleType) {
        case 'adm-kelas':
            // Semua guru bisa akses adm-kelas
            return true;
            
        case 'adm-pembelajaran':
            // Filter berdasarkan jenjang
            return jenjang !== null;
            
        case 'asisten-modul':
            // Filter berdasarkan mapel (hanya SMP/SMA)
            return jenjang === 'smp' || jenjang === 'sma';
            
        case 'penilaian':
            // Semua guru bisa akses
            return true;
            
        case 'refleksi':
            // Semua guru bisa akses
            return true;
            
        default:
            return false;
    }
}
