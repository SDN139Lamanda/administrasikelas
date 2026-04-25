/**
 * ============================================
 * DASHBOARD LOGIC - Platform Administrasi Kelas
 * VERSI: FINAL - Admin always approved, member needs approval
 * ============================================
 */

console.log('🔴 [Dashboard.js] FINAL VERSION');

// Global state
window.currentUserRole = null;
window.currentUserIsApproved = false;
window.currentUserJenjang = null;
window.currentUserKelas = [];

// ============================================
// ✅ APPROVAL CHECK - Admin ALWAYS approved
// ============================================

window.isUserApproved = function() {
    // ✅ ADMIN ALWAYS APPROVED - no check needed
    if (window.currentUserRole === 'admin') {
        return true;
    }
    
    // ✅ Member/Teacher: check isApproved field from Firestore
    return window.currentUserIsApproved === true;
};

// ============================================
// ✅ NAVIGATION FUNCTIONS
// ============================================

window.showJenjangSection = function(jenjang) {
    if (!window.isUserApproved()) {
        alert('⏳ Akun Anda masih menunggu persetujuan admin.');
        return;
    }
    
    document.querySelectorAll('section[data-jenjang]').forEach(s => s.classList.add('hidden'));
    const target = document.getElementById(`${jenjang}-section`);
    if (target) {
        target.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

window.showSubFeatureModal = function(jenjang, kelas) {
    if (!window.isUserApproved()) {
        alert('⏳ Akun Anda masih menunggu persetujuan admin.');
        return;
    }
    
    window.currentJenjang = jenjang;
    window.currentKelas = kelas;
    
    const lbl = {tk:'TK', sd:'SD', mi:'MI', smp:'SMP', mts:'MTs', sma:'SMA', ma:'MA'}[jenjang] || jenjang.toUpperCase();
    const title = document.getElementById('modal-jenjang-kelas');
    if (title) title.textContent = `${lbl} - Kelas ${kelas}`;
    
    const modal = document.getElementById('subfeature-modal');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
};

window.closeSubFeatureModal = function() {
    const modal = document.getElementById('subfeature-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
    window.currentJenjang = null;
    window.currentKelas = null;
};

window.loadSubFeature = async function(subfitur) {
    if (!window.isUserApproved()) {
        alert('⏳ Akun Anda masih menunggu persetujuan admin.');
        return;
    }
    
    const j = window.currentJenjang, k = window.currentKelas;
    if (!j || !k) { alert('❌ Konteks kelas tidak ditemukan.'); return; }
    
    closeSubFeatureModal();
    
    // Load module...
    console.log('Loading:', subfitur);
};

window.backToDashboard = function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ============================================
// ✅ LOGOUT
// ============================================

window.logout = async function() {
    sessionStorage.setItem('__loggedOut', 'true');
    
    try {
        const { auth, signOut } = await import('./modules/firebase-config.js');
        await signOut(auth);
    } catch(e) {}
    
    localStorage.clear();
    window.location.replace('index.html?logout=' + Date.now());
};

// ============================================
// ✅ AUTH INIT - Read from Firestore
// ============================================

async function initAuth() {
    console.log('🔐 initAuth START');
    
    try {
        const { auth, onAuthStateChanged, db, doc, getDoc } = await import('./modules/firebase-config.js');
        
        onAuthStateChanged(auth, async (user) => {
            if (!user) {
                window.location.href = 'index.html?notauth=1';
                return;
            }
            
            console.log('✅ Auth:', user.email);
            
            // Update UI
            if (document.getElementById('userEmail')) {
                document.getElementById('userEmail').textContent = user.email;
            }
            
            // Fetch user data from Firestore
            try {
                const snap = await getDoc(doc(db, 'users', user.uid));
                if (snap.exists()) {
                    const data = snap.data();
                    
                    // Set state from Firestore
                    window.currentUserRole = data.role || 'teacher';
                    
                    // ✅ CRITICAL: Admin ALWAYS approved (ignore isApproved field)
                    if (window.currentUserRole === 'admin') {
                        window.currentUserIsApproved = true;
                        console.log('✅ ADMIN - auto approved (no approval needed)');
                    } else {
                        // Member/Teacher: check isApproved field
                        window.currentUserIsApproved = data.isApproved === true;
                        console.log('✅ Member - isApproved:', window.currentUserIsApproved);
                    }
                    
                    window.currentUserJenjang = data.jenjang_sekolah || null;
                    window.currentUserKelas = data.kelas_diampu || [];
                    
                    // Save to localStorage
                    localStorage.setItem('user_role', window.currentUserRole);
                    localStorage.setItem('user_jenjang', window.currentUserJenjang || '');
                    
                    console.log('✅ User state:', { 
                        role: window.currentUserRole, 
                        isApproved: window.currentUserIsApproved 
                    });
                    
                    // Init admin widget
                    if (typeof window.initAdminWidget === 'function') {
                        window.initAdminWidget(window.currentUserRole);
                    }
                    
                    // Show pending UI if member & not approved
                    if (!window.currentUserIsApproved && window.currentUserRole !== 'admin') {
                        console.log('🔒 Member pending approval');
                        if (document.getElementById('userContextText')) {
                            document.getElementById('userContextText').innerHTML = '<span class="text-yellow-600">⏳ Menunggu approval...</span>';
                        }
                    }
                }
            } catch(e) {
                console.error('Fetch user error:', e);
            }
        });
    } catch(e) {
        console.error('Auth init error:', e);
    }
}

// Run auto-init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    initAuth();
}

console.log('🟢 [Dashboard.js] READY - FINAL VERSION');
