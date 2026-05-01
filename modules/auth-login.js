/**
 * ============================================
 * AUTH LOGIN - auth-login.js
 * Platform Administrasi Kelas Digital
 * ✅ UPDATE: Session Timeout + Force Login
 * ============================================
 */

import { auth, db } from './firebase-config.js';

import { 
    signInWithEmailAndPassword, 
    signOut 
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

import { 
    doc, 
    getDoc,
    updateDoc,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

const ADMIN_EMAIL = 'radiah.tifarahs@gmail.com';
const SESSION_TIMEOUT_MINUTES = 30; // ✅ Auto-clear session if inactive > 30 min

// ============================================
// FUNGSI UTAMA: Login User + Smart Session Check
// ============================================
export async function loginUser(email, password, forceLogin = false) {
    console.log('🔐 Login attempt for:', email, forceLogin ? '(FORCE)' : '');
    
    try {
        // ✅ STEP 1: SIGN IN dengan Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        console.log('✅ Auth successful, UID:', user.uid);
        
        // ✅ STEP 2: AMBIL DATA USER dari Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (!userDoc.exists()) {
            console.error('❌ User document not found in Firestore');
            await signOut(auth);
            throw new Error('❌ Data user tidak ditemukan. Hubungi admin.');
        }
        
        const userData = userDoc.data();
        
        // ✅ STEP 3: VALIDASI STATUS USER
        if (userData.status === 'rejected') {
            await signOut(auth);
            throw new Error(`❌ Akun Anda ditolak. Alasan: ${userData.rejectedReason || 'Tidak ada alasan'}`);
        }
        
        if (userData.status === 'suspended') {
            await signOut(auth);
            throw new Error('❌ Akun Anda dinonaktifkan. Hubungi admin.');
        }
        
        // ✅ STEP 4: SMART SINGLE-SESSION CHECK
        if (userData.isSessionActive === true && userData.role !== 'admin') {
            const lastActive = userData.lastActive?.toDate?.() || userData.lastLogin?.toDate?.();
            const now = new Date();
            
            // 🔄 CASE A: Session timeout (>30 min inactive) → auto-clear
            if (lastActive && (now - lastActive) > SESSION_TIMEOUT_MINUTES * 60 * 1000) {
                console.log('🔄 [Session] Stale session detected → auto-clear');
                await updateDoc(doc(db, 'users', user.uid), { isSessionActive: false });
                // Lanjut ke step 5 (set session active baru)
            } 
            // 🔄 CASE B: Force login requested → overwrite session
            else if (forceLogin) {
                console.log('⚡ [Session] Force login activated');
                // Lanjut ke step 5 (overwrite session)
            } 
            // ❌ CASE C: Session aktif + bukan force login → blokir
            else {
                await signOut(auth);
                // ✅ Return special error code for UI to show "Force Login" option
                const error = new Error('🔒 Akun Anda sudah login di device lain.');
                error.code = 'auth/session-active';
                error.userData = userData; // For UI to show email/name
                throw error;
            }
        }
        
        // ✅ STEP 5: SET SESSION ACTIVE + lastActive (kecuali admin)
        if (userData.role !== 'admin') {
            await updateDoc(doc(db, 'users', user.uid), {
                isSessionActive: true,
                lastActive: serverTimestamp(),  // ✅ BARU: untuk timeout detection
                lastLogin: serverTimestamp()
            });
            localStorage.setItem('session_active', 'true');
            console.log('✅ Session marked active for:', user.uid);
        }
        
        // ✅ STEP 6: BUILD RETURN OBJECT
        const returnUser = {
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            nama_lengkap: userData.nama_lengkap || '',
            no_hp: userData.no_hp || '',
            nama_sekolah: userData.nama_sekolah || '',
            jenjang_sekolah: userData.jenjang_sekolah || null,
            kelas_diampu: userData.kelas_diampu || [],
            mapel_diampu: userData.mapel_diampu || [],
            sd_mapel_type: userData.sd_mapel_type || 'kelas',
            role: userData.role || 'guru',
            isActive: userData.isActive === true,
            isApproved: userData.isApproved === true,
            createdAt: userData.createdAt || null,
            lastLogin: userData.lastLogin || null
        };
        
        console.log('✅ Login successful, returning user:', {
            email: returnUser.email,
            jenjang: returnUser.jenjang_sekolah,
            role: returnUser.role,
            isApproved: returnUser.isApproved
        });
        
        return {
            success: true,
            message: 'Login berhasil!',
            user: returnUser
        };
        
    } catch (error) {
        console.error('❌ Login error:', error);
        
        // ✅ Preserve special error codes for UI handling
        if (error.code === 'auth/session-active') {
            throw error; // Re-throw untuk ditangani login.js
        }
        
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
// FUNGSI: Logout User + Clear Session
// ============================================
export async function logoutUser() {
    try {
        const user = auth.currentUser;
        if (user) {
            const userData = await getDoc(doc(db, 'users', user.uid));
            if (userData.exists() && userData.data().role !== 'admin') {
                await updateDoc(doc(db, 'users', user.uid), {
                    isSessionActive: false
                });
            }
            localStorage.removeItem('session_active');
        }
        await signOut(auth);
        console.log('✅ Logout successful + session cleared');
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

console.log('✅ [Auth Login] Loaded + Session Timeout + Force Login');
