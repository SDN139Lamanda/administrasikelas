// modules/auth-login.js
// Login dengan Validasi Status User + Admin Bypass
// Platform Administrasi Kelas Digital - Guru SDN

import { auth, db } from '../config-firebase.js';
import { 
    signInWithEmailAndPassword, 
    signOut,
    sendEmailVerification
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { doc, getDoc, updateDoc, setDoc } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

// ✅ ADMIN EMAIL KONSTANTA
const ADMIN_EMAIL = 'andi@139batuassung.com';

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
        
        // ✅ STEP 3: CEK STATUS USER di Firestore + ADMIN BYPASS
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        // ✅ ADMIN BYPASS: Jika email admin, selalu anggap active
        const isAdmin = user.email === ADMIN_EMAIL;
        
        let userData = {};
        
        if (userDoc.exists()) {
            // User ada di Firestore → gunakan data existing
            userData = userDoc.data();
        } else if (isAdmin) {
            // Admin tanpa dokumen Firestore → buat data default + auto-create
            console.log('👑 Admin first login - creating default profile');
            userData = {
                uid: user.uid,
                email: user.email,
                namaLengkap: 'Administrator',
                sekolah: 'SDN 139 LAMANDA',
                role: 'admin',
                status: 'active',  // ← Admin selalu active
                emailVerified: user.emailVerified,
                rejectedReason: '',
                approvedBy: 'system',
                approvedAt: new Date(),
                createdAt: new Date(),
                lastLogin: null
            };
            // Auto-create dokumen admin di Firestore (opsional tapi direkomendasikan)
            await setDoc(doc(db, 'users', user.uid), userData);
            console.log('✅ Admin profile auto-created in Firestore');
        } else {
            // User non-admin tanpa dokumen → error
            await signOut(auth);
            throw new Error('❌ Data user tidak ditemukan. Hubungi admin.');
        }
        
        console.log('📋 User status:', userData.status, '| Is Admin:', isAdmin);
        
        // ✅ STEP 4: VALIDASI STATUS - Admin bypass semua check
        if (!isAdmin) {
            // Hanya non-admin yang kena validasi status
            if (userData.status === 'rejected') {
                await signOut(auth);
                const reason = userData.rejectedReason || 'Tidak ada alasan';
                throw new Error(`❌ Akun Anda ditolak. Alasan: ${reason}`);
            }
            
            if (userData.status === 'suspended') {
                await signOut(auth);
                throw new Error('❌ Akun Anda dinonaktifkan. Hubungi admin.');
            }
            
            // Allow: 'active', 'pending_verification', 'pending_approval'
            // UI akan handle read-only mode berdasarkan status
        }
        // Jika isAdmin → skip semua validasi, langsung lanjut ke STEP 5
        
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
                status: userData.status  // ← Return status untuk UI check
            },
            isPending: !isAdmin && userData.status !== 'active'  // ← Admin selalu false
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
    if (!userDoc.exists()) {
        // Admin fallback jika tidak ada dokumen
        if (user.email === ADMIN_EMAIL) {
            return {
                uid: user.uid,
                email: user.email,
                namaLengkap: 'Administrator',
                sekolah: 'SDN 139 LAMANDA',
                role: 'admin',
                status: 'active'
            };
        }
        return null;
    }
    
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
