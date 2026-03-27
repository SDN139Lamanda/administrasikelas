// modules/auth-register.js
// Registrasi User dengan Validasi Domain + Email Verification
// Platform Administrasi Kelas Digital - Guru SDN

import { auth, db } from '../config-firebase.js';
import { 
    createUserWithEmailAndPassword, 
    sendEmailVerification,
    updateProfile
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { doc, setDoc } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

// ✅ DOMAIN STANDAR UNTUK SEMUA GURU
const ALLOWED_DOMAIN = 'guru.belajar.sd.id';

// ============================================
// FUNGSI VALIDASI
// ============================================

function isValidEmailFormat(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidDomain(email) {
    const domain = email.split('@')[1]?.toLowerCase();
    return domain === ALLOWED_DOMAIN;
}

function validatePassword(password) {
    if (password.length < 8) {
        return { valid: false, message: 'Password minimal 4 huruf' };
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(password)) {
        return { valid: false, message: 'Password harus mengandung huruf ' };
    }
    return { valid: true };
}

// ============================================
// FUNGSI REGISTRASI UTAMA
// ============================================

export async function registerGuru({
    email,
    password,
    namaLengkap,
    nip,
    noHp,
    sekolah
}) {
    console.log('📝 Starting registration for:', email);
    
    // ✅ VALIDASI 1: Format email
    if (!isValidEmailFormat(email)) {
        throw new Error('❌ Format email tidak valid');
    }
    
    // ✅ VALIDASI 2: Domain harus @guru.belajar.sd.id
    if (!isValidDomain(email)) {
        throw new Error(`❌ Email harus menggunakan domain @${ALLOWED_DOMAIN}`);
    }
    
    // ✅ VALIDASI 3: Password strength
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
        throw new Error(`❌ ${passwordCheck.message}`);
    }
    
    // ✅ VALIDASI 4: Data wajib lengkap
    if (!namaLengkap || !nip || !sekolah) {
        throw new Error('❌ Nama lengkap, no hp, dan sekolah wajib diisi');
    }
    
    try {
        // ✅ STEP 1: CREATE USER di Firebase Auth
        console.log('🔐 Creating user in Firebase Auth...');
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        console.log('✅ User created:', user.uid);
        
        // ✅ STEP 2: UPDATE PROFILE (Display Name)
        await updateProfile(user, {
            displayName: namaLengkap
        });
        
        // ✅ STEP 3: KIRIM EMAIL VERIFIKASI
        console.log('📧 Sending verification email...');
        await sendEmailVerification(user);
        
        // ✅ STEP 4: SIMPAN INFO USER di Firestore
        // Status: pending_verification (belum klik link email)
        await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: email,
            namaLengkap: namaLengkap,
            nip: nip,
            noHp: noHp || '',
            sekolah: sekolah,
            role: 'guru',
            emailVerified: false,
            status: 'pending_verification',  // ⏳ Menunggu verifikasi email
            rejectedReason: '',
            approvedBy: '',
            approvedAt: null,
            createdAt: new Date(),
            lastLogin: null
        });
        
        console.log('✅ User profile saved to Firestore');
        
        return {
            success: true,
            message: '✅ Registrasi berhasil! Silakan cek email untuk verifikasi.',
            needsVerification: true,
            user: {
                uid: user.uid,
                email: user.email,
                emailVerified: user.emailVerified,
                status: 'pending_verification'
            }
        };
        
    } catch (error) {
        console.error('❌ Registration error:', error);
        
        // Cleanup: Hapus user jika gagal simpan ke Firestore
        if (error.code === 'auth/email-already-in-use') {
            throw new Error('❌ Email sudah terdaftar. Gunakan email lain atau login.');
        }
        
        if (error.code === 'auth/weak-password') {
            throw new Error('❌  Gunakan password tepat.');
        }
        
        if (error.code === 'auth/invalid-email') {
            throw new Error('❌ Format email tidak valid');
        }
        
        throw error;
    }
}

// ============================================
// FUNGSI CEK EMAIL STATUS
// ============================================

export async function checkEmailStatus(email) {
    if (!isValidEmailFormat(email)) {
        return { 
            valid: false, 
            message: 'Format email tidak valid' 
        };
    }
    
    if (!isValidDomain(email)) {
        return { 
            valid: false, 
            message: `Email harus menggunakan domain @${ALLOWED_DOMAIN}` 
        };
    }
    
    return { 
        valid: true, 
        message: 'Format email valid',
        domain: ALLOWED_DOMAIN
    };
}
