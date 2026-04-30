/**
 * ============================================
 * DASHBOARD LOGIC - Platform Administrasi Kelas
 * VERSI: Clean Sync + Single-Session Validation
 * ✅ UPDATE: Blokir akses jika session tidak konsisten
 * ============================================
 */

console.log('🔴 [Dashboard.js] Clean Sync + Session Guard START');

// ============================================
// ✅ GLOBAL STATE
// ============================================
window.currentUserRole = null;
window.currentUserIsApproved = false;
window.currentUserJenjang = null;
window.currentUserKelas = [];
window.currentUserMapel = [];

// ============================================
// ✅ HELPER: Approval Check
// ============================================
window.isUserApproved = function() {
    if (window.currentUserRole === 'admin') return true;
    return window.currentUserIsApproved === true;
};

// ============================================
// ✅ HELPER: Show pending UI
// ============================================
window.showPendingApprovalUI = function() {
    console.log('⏳ [Dashboard.js] Showing pending UI');
    const ctx = document.getElementById('userContextText');
    if (ctx) ctx.innerHTML = '<span class="text-yellow-600">⏳ Menunggu approval...</span>';
    document.querySelectorAll('.room-card').forEach(card => {
        if (!card.classList.contains('room-info')) {
            card.style.opacity = '0.6';
            card.title = '🔒 Menunggu persetujuan admin';
        }
    });
};

// ============================================
// ✅ ROUTER MODUL
// ============================================
function initModulRouter() {
    console.log('🔍 [Router] Init router...');
    document.querySelectorAll('[data-module]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const moduleName = btn.dataset.module;
            if (!window.isUserApproved()) {
                alert('⏳ Akun kamu belum di-approve admin. Tunggu ya.');
                return;
            }
            document.querySelector('.dashboard-hero')?.closest('session')?.classList.add('hidden');
            document.querySelector('[aria-labelledby="rooms-heading"]')?.classList.add('hidden');
            document.querySelectorAll('#sd-section, #smp-section, #sma-section').forEach(s => s.classList.add('hidden'));
            const container = document.getElementById('module-container');
            container.classList.remove('hidden');
            container.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-2xl"></i><p>Loading modul...</p></div>';
            try {
                if (moduleName === 'asisten-modul') {
                    await import('../modules/asisten-modul.js');
                    window.renderGeneratorModule();
                }
                if (moduleName === 'cta-generator') {
                    await import('../modules/cta-generator.js');
                    window.renderCitaGenerator();
                }
                if (moduleName === 'protsma') {
                    await import('../modules/protsma/protsma.js');
                    window.renderProtsma();
                }
                console.log(`✅ [Router] Modul ${moduleName} loaded`);
            } catch (err) {
                console.error(`❌ [Router] Gagal load ${moduleName}:`, err);
                container.innerHTML = `<div class="text-center py-8 text-red-600"><i class="fas fa-exclamation-triangle text-2xl mb-2"></i><p>Gagal load modul.</p><button onclick="window.backToDashboard()" class="mt-4 px-4 py-2 bg-gray-600 text-white rounded">Kembali</button></div>`;
            }
        });
    });
}

window.backToDashboard = () => {
    document.getElementById('module-container').innerHTML = '';
    document.getElementById('module-container').classList.add('hidden');
    document.querySelector('.dashboard-hero')?.closest('section')?.classList.remove('hidden');
    document.querySelector('[aria-labelledby="rooms-heading"]')?.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ============================================
// ✅ SESSION VALIDATION HELPER
// ============================================
async function validateSession(user, userData) {
    // Admin bypass session check
    if (userData.role === 'admin') return true;
    
    const sessionFlag = localStorage.getItem('session_active');
    
    // Jika Firestore bilang aktif tapi localStorage tidak ada → kemungkinan tab/device lain
    if (userData.isSessionActive === true && sessionFlag !== 'true') {
        console.warn('⚠️ [Session] Inconsistent session detected → forcing logout');
        try {
            const { signOut } = await import('../modules/firebase-config.js');
            await signOut(auth);
        } catch (e) { console.warn('⚠️ SignOut during validation failed:', e); }
        localStorage.clear();
        sessionStorage.clear();
        alert('🔒 Akun Anda sedang digunakan di device lain. Silakan login ulang.');
        window.location.href = 'index.html?session_conflict=1';
        return false;
    }
    
    // Jika localStorage bilang aktif tapi Firestore tidak → reset flag
    if (sessionFlag === 'true' && userData.isSessionActive !== true) {
        localStorage.removeItem('session_active');
        console.log('🔄 [Session] Cleaned up stale session flag');
    }
    
    return true;
}

// ============================================
// ✅ AUTH INIT - Main Entry Point
// ============================================
async function initAuth() {
    console.log('🔐 [Dashboard.js] initAuth START');
    try {
        const { auth, onAuthStateChanged, db, doc, getDoc } = await import('../modules/firebase-config.js');
        
        onAuthStateChanged(auth, async (user) => {
            if (!user) {
                console.log('⚠️ [Dashboard.js] Not authenticated, redirecting...');
                window.location.href = 'index.html?notauth=1';
                return;
            }
            console.log('✅ [Dashboard.js] Auth confirmed:', user.email);
            
            // Update UI
            const emailEl = document.getElementById('userEmail');
            const avatarEl = document.getElementById('userAvatar');
            const contextEl = document.getElementById('userContextText');
            if (emailEl) emailEl.textContent = user.email;
            if (avatarEl) avatarEl.src = user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'User'}&background=7c3aed&color=fff`;
            if (contextEl && !contextEl.textContent.includes('Loading')) {
                contextEl.textContent = user.displayName || user.email;
            }
            
            // Fetch user data
            try {
                const snap = await getDoc(doc(db, 'users', user.uid));
                if (!snap.exists()) {
                    console.warn('⚠️ [Dashboard.js] User doc not found');
                    setDefaultState();
                    finalizeAuth();
                    return;
                }
                const data = snap.data();
                
                // ✅ SESSION VALIDATION
                const sessionValid = await validateSession(user, data);
                if (!sessionValid) return; // Logout already handled
                
                // Set global state
                window.currentUserRole = data.role || 'teacher';
                window.currentUserJenjang = data.jenjang_sekolah || null;
                window.currentUserKelas = Array.isArray(data.kelas_diampu) ? data.kelas_diampu : [];
                window.currentUserMapel = Array.isArray(data.mapel_diampu) ? data.mapel_diampu : [];
                
                // Approval logic
                if (window.currentUserRole === 'admin') {
                    window.currentUserIsApproved = true;
                    console.log('✅ [Dashboard.js] ADMIN - auto approved');
                } else if (data.isApproved === true) {
                    window.currentUserIsApproved = true;
                    console.log('✅ [Dashboard.js] Member approved');
                } else {
                    window.currentUserIsApproved = false;
                    console.log('⏳ [Dashboard.js] Member pending approval');
                }
                
                // Save to localStorage
                localStorage.setItem('user_role', window.currentUserRole);
                localStorage.setItem('user_jenjang', window.currentUserJenjang || '');
                localStorage.setItem('user_kelas_diampu', JSON.stringify(window.currentUserKelas));
                
                // Init admin widget
                if (typeof window.initAdminWidget === 'function') {
                    window.initAdminWidget(window.currentUserRole);
                }
                
                // Show pending UI if needed
                if (!window.currentUserIsApproved && window.currentUserRole !== 'admin') {
                    window.showPendingApprovalUI?.();
                }
                
            } catch (e) {
                console.error('❌ [Dashboard.js] Fetch user error:', e);
                setDefaultState();
            }
            finalizeAuth();
        });
    } catch (e) {
        console.error('❌ [Dashboard.js] Auth init error:', e);
        setDefaultState();
        finalizeAuth();
    }
}

function setDefaultState() {
    window.currentUserRole = 'teacher';
    window.currentUserIsApproved = false;
    window.currentUserJenjang = null;
    window.currentUserKelas = [];
    window.currentUserMapel = [];
}

function finalizeAuth() {
    console.log('🟢 [Dashboard.js] Auth init complete:', {
        role: window.currentUserRole,
        approved: window.currentUserIsApproved
    });
    initModulRouter();
}

// ============================================
// ✅ LOGOUT - Clear Session + Redirect
// ============================================
window.logout = async function() {
    console.log('🚪 [Dashboard.js] Logout called');
    sessionStorage.setItem('__justLoggedOut', 'true');
    sessionStorage.setItem('__loggingOut', 'true');
    
    try {
        const { auth, signOut, db, doc, updateDoc, getDoc } = await import('../modules/firebase-config.js');
        const user = auth.currentUser;
        if (user) {
            const userData = await getDoc(doc(db, 'users', user.uid));
            if (userData.exists() && userData.data().role !== 'admin') {
                await updateDoc(doc(db, 'users', user.uid), { isSessionActive: false });
            }
            localStorage.removeItem('session_active');
        }
        await signOut(auth);
        console.log('✅ [Dashboard.js] Firebase signOut + session cleared');
    } catch (e) {
        console.warn('⚠️ [Dashboard.js] Firebase signOut failed, continuing...');
    }
    
    localStorage.clear();
    const redirectUrl = 'index.html?logout=' + Date.now() + '&r=' + Math.random().toString(36).substr(2, 9);
    console.log('🔄 [Dashboard.js] Redirecting to:', redirectUrl);
    window.location.replace(redirectUrl);
    setTimeout(() => { window.location.href = redirectUrl; }, 150);
};

// ============================================
// ✅ AUTO-INIT
// ============================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    initAuth();
}

export { initAuth };

console.log('🟢🟢 [Dashboard.js] READY - Session Guard Active 🟢🟢🟢');
