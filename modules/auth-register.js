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
 * - Set status = "pending" (menunggu approval admin)
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
        // ⚠️ PENTING: Simpan jenjang, kelas_diampu, mapel_diampu untuk context-based access
        
        const userData = {
            uid: user.uid,
            email: formData.email,
            nama_lengkap: formData.namaLengkap,  // ✅ Match field name di register.html
            no_hp: formData.noHp,                 // ✅ Match field name
            nama_sekolah: formData.sekolah,       // ✅ Match field name
            
            // ✅ CONTEXT-BASED ACCESS FIELDS (UPDATED)
            jenjang_sekolah: formData.jenjang,              // "sd" | "smp" | "sma"
            kelas_diampu: formData.kelas_diampu || [],      // ✅ Array: ["1"] or ["7","8"] or ["10","12"]
            mapel_diampu: formData.mapel_diampu || [],      // ✅ Array: ["paibd","pjok"] or ["matematika"] etc.
            sd_mapel_type: formData.sd_mapel_type || 'kelas', // ✅ String: "kelas" | "mapel" (SD only)
            
            // ✅ ROLE & STATUS (UPDATED)
            role: 'teacher',                           // Default role: teacher
            isActive: false,                           // ✅ PENDING: cannot access features yet
            isApproved: false,                         // ✅ Waiting for admin approval
            isEmailVerified: user.emailVerified,
            
            // ✅ ADMIN FIELDS (untuk tracking)
            approvedBy: null,                          // Will be set by admin
            approvedAt: null,
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
            jenjang: userData.jenjang_sekolah,
            kelas: userData.kelas_diampu,
            mapel: userData.mapel_diampu,
            role: userData.role,
            status: userData.isApproved ? 'approved' : 'pending'
        });
        
        return {
            success: true,
            message: 'Registrasi berhasil! Silakan cek email untuk verifikasi. Menunggu persetujuan admin.',
            needsVerification: true,
            isPending: true,  // ✅ New flag for UI
            user: {
                uid: user.uid,
                email: user.email,
                nama_lengkap: formData.namaLengkap,
                jenjang_sekolah: userData.jenjang_sekolah,
                kelas_diampu: userData.kelas_diampu,
                mapel_diampu: userData.mapel_diampu,
                role: userData.role,
                isApproved: userData.isApproved,
                isActive: userData.isActive,
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
            jenjang_sekolah: data.jenjang_sekolah,
            kelas_diampu: data.kelas_diampu,
            mapel_diampu: data.mapel_diampu,
            sd_mapel_type: data.sd_mapel_type,
            role: data.role,
            isApproved: data.isApproved,
            isActive: data.isActive,
            nama_sekolah: data.nama_sekolah
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
    
    // ✅ PENDING USERS: Cannot access any features until approved
    if (!userContext.isApproved) {
        console.log('🔒 [Access Check] User pending approval:', userContext.email);
        return false;
    }
    
    const { jenjang_sekolah, kelas_diampu, mapel_diampu, role } = userContext;
    
    // Admin bisa akses semua
    if (role === 'admin') return true;
    
    // Check berdasarkan module type
    switch(moduleType) {
        case 'adm-kelas':
            // Semua guru approved bisa akses adm-kelas
            return true;
            
        case 'adm-pembelajaran':
            // Filter berdasarkan jenjang
            return jenjang_sekolah !== null;
            
        case 'asisten-modul':
            // Filter berdasarkan mapel (hanya SMP/SMA)
            return jenjang_sekolah === 'smp' || jenjang_sekolah === 'sma';
            
        case 'penilaian':
            // Semua guru approved bisa akses
            return true;
            
        case 'refleksi':
            // Semua guru approved bisa akses
            return true;
            
        default:
            return false;
    }
}

// ============================================
// FUNGSI BARU: Check if User is Pending
// ============================================
export function isUserPending(userContext) {
    return userContext && !userContext.isApproved;
}

// ============================================
// FUNGSI BARU: Get Pending Message for UI
// ============================================
export function getPendingMessage(userContext) {
    if (!userContext) return 'Silakan login terlebih dahulu.';
    if (userContext.isApproved) return null;
    
    return `⏳ Akun Anda dalam status <strong>pending</strong>.<br>
            Menunggu persetujuan admin.<br>
            <small class="text-gray-500">Anda akan mendapat notifikasi email setelah disetujui.</small>`;
}
