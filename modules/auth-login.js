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
        
        // ✅ STEP 4: VALIDASI STATUS - Allow pending users to login (read-only mode)
        // Hanya reject status yang benar-benar invalid
        if (userData.status === 'rejected') {
            await signOut(auth);
            const reason = userData.rejectedReason || 'Tidak ada alasan';
            throw new Error(`❌ Akun Anda ditolak. Alasan: ${reason}`);
        }
        
        if (userData.status === 'suspended') {
            await signOut(auth);
            throw new Error('❌ Akun Anda dinonaktifkan. Hubungi admin.');
        }
        
        // ✅ Allow: 'active', 'pending_verification', 'pending_approval'
        // UI akan handle read-only mode berdasarkan status
        
        // ✅ STEP 5: UPDATE LAST LOGIN
        await updateDoc(doc(db, 'users', user.uid), {
            lastLogin: new Date()
        });
        
        console.log('✅ Login successful!');
        
        // ✅ RETURN dengan status + isPending flag untuk UI check
        return {
            success: true,
            user: {
                uid: user.uid,
                email: user.email,
                namaLengkap: userData.namaLengkap,
                sekolah: userData.sekolah,
                role: userData.role,
                status: userData.status  // ← TAMBAH: Return status untuk UI check
            },
            isPending: userData.status !== 'active'  // ← TAMBAH: Flag untuk read-only mode
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
