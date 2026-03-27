// modules/auth-login.js
// Login dengan Validasi Status User
// Platform Administrasi Kelas Digital - Guru SDN

import { auth, db } from '../config-firebase.js';
import { 
    signInWithEmailAndPassword, 
    signOut,
    sendEmailVerification
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { doc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

export async function loginUser(email, password) {
    console.log('🔐 Login attempt for:', email);
    
    try {
        // ✅ STEP 1: LOGIN via Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        console.log('✅ Auth successful:', user.uid);
        
        // ✅ STEP 2: CEK EMAIL VERIFIED
        if (!user.emailVerified) {
            console.warn('⚠️ Email not verified');
            await signOut(auth);
            throw new Error('❌ Email belum terverifikasi. Silakan cek inbox/spam Anda.');
        }
        
        // ✅ STEP 3: CEK STATUS USER di Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (!userDoc.exists()) {
            await signOut(auth);
            throw new Error('❌ Data user tidak ditemukan. Hubungi admin.');
        }
        
        const userData = userDoc.data();
        console.log('📋 User status:', userData.status);
        
        // ✅ STEP 4: VALIDASI STATUS
        if (userData.status === 'pending_verification') {
            await signOut(auth);
            throw new Error('⏳ Email belum diverifikasi. Silakan cek inbox/spam Anda.');
        }
        
        if (userData.status === 'pending_approval') {
            await signOut(auth);
            throw new Error('⏳ Akun Anda masih menunggu persetujuan admin. Silakan hubungi admin.');
        }
        
        if (userData.status === 'rejected') {
            await signOut(auth);
            const reason = userData.rejectedReason || 'Tidak ada alasan';
            throw new Error(`❌ Akun Anda ditolak. Alasan: ${reason}`);
        }
        
        if (userData.status === 'suspended') {
            await signOut(auth);
            throw new Error('❌ Akun Anda dinonaktifkan. Hubungi admin.');
        }
        
        if (userData.status !== 'active') {
            await signOut(auth);
            throw new Error('❌ Status akun tidak valid. Hubungi admin.');
        }
        
        // ✅ STEP 5: UPDATE LAST LOGIN
        await updateDoc(doc(db, 'users', user.uid), {
            lastLogin: new Date()
        });
        
        console.log('✅ Login successful!');
        
        return {
            success: true,
            user: {
                uid: user.uid,
                email: user.email,
                namaLengkap: userData.namaLengkap,
                sekolah: userData.sekolah,
                role: userData.role
            }
        };
        
    } catch (error) {
        console.error('❌ Login error:', error);
        throw error;
    }
}

export async function logoutUser() {
    await signOut(auth);
    console.log('✅ Logout successful');
}

export async function getCurrentUser() {
    const user = auth.currentUser;
    if (!user) return null;
    
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) return null;
    
    const userData = userDoc.data();
    return {
        uid: user.uid,
        email: user.email,
        namaLengkap: userData.namaLengkap,
        sekolah: userData.sekolah,
        role: userData.role,
        status: userData.status
    };
}
