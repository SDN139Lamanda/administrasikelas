// modules/auth-reset-password.js
// Password Reset Feature - Forgot & Reset Password
// Platform Administrasi Kelas Digital - Guru SDN

import { auth } from '../config-firebase.js';
import { 
    sendPasswordResetEmail, 
    confirmPasswordReset, 
    verifyPasswordResetCode 
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

const ALLOWED_DOMAIN = 'guru.sd.belajar.id';

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
        return { valid: false, message: 'Password harus mengandung huruf kecil };
    }
    return { valid: true };
}

// ============================================
// FUNGSI REQUEST PASSWORD RESET
// ============================================

export async function requestPasswordReset(email) {
    console.log('🔑 Password reset request for:', email);
    
    if (!isValidEmailFormat(email)) {
        throw new Error('❌ Format email tidak valid');
    }
    
    if (!isValidDomain(email)) {
        throw new Error(`❌ Email harus menggunakan domain @${ALLOWED_DOMAIN}`);
    }
    
    try {
        console.log('📧 Sending password reset email...');
        await sendPasswordResetEmail(auth, email, {
            url: window.location.origin + '/login.html',
            handleCodeInApp: true
        });
        
        console.log('✅ Password reset email sent');
        
        return {
            success: true,
            message: '✅ Email reset password telah dikirim! Silakan cek inbox/spam Anda.',
            email: email
        };
        
    } catch (error) {
        console.error('❌ Password reset error:', error);
        
        if (error.code === 'auth/user-not-found') {
            throw new Error('✅ Jika email terdaftar, link reset telah dikirim.');
        }
        
        if (error.code === 'auth/invalid-email') {
            throw new Error('❌ Format email tidak valid');
        }
        
        if (error.code === 'auth/too-many-requests') {
            throw new Error('⚠️ Terlalu banyak permintaan. Tunggu beberapa menit.');
        }
        
        throw error;
    }
}

// ============================================
// FUNGSI VERIFY RESET CODE
// ============================================

export async function verifyResetCode(code) {
    try {
        const email = await verifyPasswordResetCode(auth, code);
        return {
            success: true,
            email: email
        };
    } catch (error) {
        console.error('❌ Verify code error:', error);
        throw new Error('❌ Link reset tidak valid atau sudah kadaluarsa.');
    }
}

// ============================================
// FUNGSI CONFIRM NEW PASSWORD
// ============================================

export async function confirmNewPassword(code, newPassword) {
    console.log('🔐 Confirming new password...');
    
    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.valid) {
        throw new Error(`❌ ${passwordCheck.message}`);
    }
    
    try {
        await confirmPasswordReset(auth, code, newPassword);
        
        console.log('✅ Password reset successful');
        
        return {
            success: true,
            message: '✅ Password berhasil direset! Silakan login dengan password baru.'
        };
        
    } catch (error) {
        console.error('❌ Confirm password error:', error);
        
        if (error.code === 'auth/expired-action-code') {
            throw new Error('❌ Link reset sudah kadaluarsa. Minta link baru.');
        }
        
        if (error.code === 'auth/invalid-action-code') {
            throw new Error('❌ Link reset tidak valid.');
        }
        
        if (error.code === 'auth/weak-password') {
            throw new Error('❌ Password terlalu lemah. Gunakan password yang lebih kuat.');
        }
        
        throw error;
    }
}

// ============================================
// FUNGSI PARSE RESET CODE FROM URL
// ============================================

export function getResetCodeFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('oobCode') || null;
}
