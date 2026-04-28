/**
 * ============================================
 * DASHBOARD LOGIC - Platform Administrasi Kelas
 * VERSI: Clean Sync with dashboard.html + Protsma Compatible
 * 
 * CATATAN ARSITEKTUR:
 * • dashboard.html inline script = UI ONLY + routing
 * • File ini = LOGIC ONLY (auth + approval + state)
 * • Admin widget init di sini (setelah role diketahui)
 * • ✅ Import path: ../modules/ (karena file ini di js/)
 * • ✅ Compatible dengan protsma module (modules/protsma/)
 * ============================================
 */

console.log('🔴 [Dashboard.js] Clean Sync Version START');

// ============================================
// ✅ GLOBAL STATE - Initialize
// ============================================

window.currentUserRole = null;
window.currentUserIsApproved = false;
window.currentUserJenjang = null;
window.currentUserKelas = [];
window.currentUserMapel = [];

// ============================================
// ✅ HELPER: Approval Check (Simple & Direct)
// ============================================

/**
 * Check if user can access features
 * Rules:
 * • Admin → ALWAYS approved
 * • Member with isApproved: true → approved
 * • Member with isApproved: false/undefined → NOT approved (wait for admin)
 */
window.isUserApproved = function() {
    // Admin always approved
    if (window.currentUserRole === 'admin') {
        return true;
    }
    
    // Member: check isApproved field
    return window.currentUserIsApproved === true;
};

// ============================================
// ✅ NAVIGATION: Show pending UI (optional helper)
// ============================================

window.showPendingApprovalUI = function() {
    console.log('⏳ [Dashboard.js] Showing pending UI');
    
    const ctx = document.getElementById('userContextText');
    if (ctx) {
        ctx.innerHTML = '<span class="text-yellow-600">⏳ Menunggu approval...</span>';
    }
    
    // Disable feature cards visually (but keep them clickable for UX)
    document.querySelectorAll('.room-card').forEach(card => {
        if (!card.classList.contains('room-info')) {
            card.style.opacity = '0.6';
            card.title = '🔒 Menunggu persetujuan admin';
        }
    });
};

// ============================================
// ✅ AUTH INIT - Main Entry Point
// ============================================

async function initAuth() {
    console.log('🔐 [Dashboard.js] initAuth START');
    
    try {
        // ✅ FIX: Import path corrected to ../modules/
        const { auth, onAuthStateChanged, db, doc, getDoc } = await import('../modules/firebase-config.js');
        
        onAuthStateChanged(auth, async (user) => {
            // Not authenticated → redirect to login
            if (!user) {
                console.log('⚠️ [Dashboard.js] Not authenticated, redirecting...');
                window.location.href = 'index.html?notauth=1';
                return;
            }
            
            console.log('✅ [Dashboard.js] Auth confirmed:', user.email);
            
            // Update basic UI (sync with inline script)
            const emailEl = document.getElementById('userEmail');
            const avatarEl = document.getElementById('userAvatar');
            const contextEl = document.getElementById('userContextText');
            
            if (emailEl) emailEl.textContent = user.email;
            if (avatarEl) {
                avatarEl.src = user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'User'}&background=7c3aed&color=fff`;
            }
            if (contextEl && !contextEl.textContent.includes('Loading')) {
                contextEl.textContent = user.displayName || user.email;
            }
            
            // Fetch user data from Firestore
            try {
                // ✅ FIX: Import path corrected to ../modules/
                const { db, doc, getDoc } = await import('../modules/firebase-config.js');
                
                const snap = await getDoc(doc(db, 'users', user.uid));
                
                if (!snap.exists()) {
                    console.warn('⚠️ [Dashboard.js] User doc not found');
                    setDefaultState();
                    finalizeAuth();
                    return;
                }
                
                const data = snap.data();
                
                // 🔍 Debug log (helpful for troubleshooting)
                console.log('🔍 [Dashboard.js] User data:', {
                    role: data.role,
                    isApproved: data.isApproved,
                    jenjang: data.jenjang_sekolah
                });
                
                // ✅ Set global state from Firestore
                window.currentUserRole = data.role || 'teacher';
                window.currentUserJenjang = data.jenjang_sekolah || null;
                window.currentUserKelas = Array.isArray(data.kelas_diampu) ? data.kelas_diampu : [];
                window.currentUserMapel = Array.isArray(data.mapel_diampu) ? data.mapel_diampu : [];
                
                // ✅ APPROVAL LOGIC (Simple & Direct):
                if (window.currentUserRole === 'admin') {
                    // Admin ALWAYS approved
                    window.currentUserIsApproved = true;
                    console.log('✅ [Dashboard.js] ADMIN - auto approved');
                } else if (data.isApproved === true) {
                    // Member with explicit approval
                    window.currentUserIsApproved = true;
                    console.log('✅ [Dashboard.js] Member approved');
                } else {
                    // Member not approved (new user or rejected)
                    window.currentUserIsApproved = false;
                    console.log('⏳ [Dashboard.js] Member pending approval');
                }
                
                // ✅ Save to localStorage for other scripts (inline script, navigation)
                localStorage.setItem('user_role', window.currentUserRole);
                localStorage.setItem('user_jenjang', window.currentUserJenjang || '');
                localStorage.setItem('user_kelas_diampu', JSON.stringify(window.currentUserKelas));
                
                console.log('✅ [Dashboard.js] State saved:', {
                    role: window.currentUserRole,
                    approved: window.currentUserIsApproved
                });
                
                // ✅ CRITICAL: Init admin widget IMMEDIATELY after role is known
                // This ensures widget appears for admin WITHOUT waiting for anything else
                if (typeof window.initAdminWidget === 'function') {
                    console.log('👑 [Dashboard.js] Calling initAdminWidget with role:', window.currentUserRole);
                    window.initAdminWidget(window.currentUserRole);
                }
                
                // ✅ Show pending UI if member & not approved
                if (!window.currentUserIsApproved && window.currentUserRole !== 'admin') {
                    window.showPendingApprovalUI?.();
                }
                
            } catch (e) {
                console.error('❌ [Dashboard.js] Fetch user error:', e);
                setDefaultState();
            }
            
            // Finalize: log ready state
            finalizeAuth();
        });
        
    } catch (e) {
        console.error('❌ [Dashboard.js] Auth init error:', e);
        setDefaultState();
        finalizeAuth();
    }
}

// Set safe defaults (for error cases)
function setDefaultState() {
    window.currentUserRole = 'teacher';
    window.currentUserIsApproved = false;
    window.currentUserJenjang = null;
    window.currentUserKelas = [];
    window.currentUserMapel = [];
}
// ============================================
// ✅ ROUTER MODUL - Tambah di dashboard.js
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Tangkap semua tombol menu modul
    document.querySelectorAll('[data-module]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const moduleName = btn.dataset.module; // contoh: "asisten-modul"
            
            // 2. Cek approval dulu
            if (!window.isUserApproved()) {
                alert('⏳ Akun kamu belum di-approve admin. Tunggu ya.');
                return;
            }
            
            // 3. Hide semua section dashboard
            document.querySelector('.dashboard-hero')?.closest('section')?.classList.add('hidden');
            document.querySelector('[aria-labelledby="rooms-heading"]')?.classList.add('hidden');
            document.querySelectorAll('#sd-section, #smp-section, #sma-section').forEach(s => s.classList.add('hidden'));
            
            // 4. Load + Render modul yang diklik
            try {
                if (moduleName === 'asisten-modul') {
                    await import('../modules/asisten-modul/asisten-modul.js');
                    window.renderGeneratorModule(); // ← INI YANG BIKIN TOMBOL JALAN
                }
                
                if (moduleName === 'cta-generator') {
                    await import('../modules/cta-generator/cta-generator.js');
                    window.renderCtaGenerator();
                }
                
                if (moduleName === 'protsma') {
                    await import('../modules/protsma/protsma.js');
                    window.renderProtsmaModule();
                }
                
                console.log(`✅ [Router] Modul ${moduleName} loaded`);
            } catch (err) {
                console.error(`❌ [Router] Gagal load ${moduleName}:`, err);
                alert(`Gagal buka ${moduleName}. Cek console.`);
            }
        });
    });
});

// 5. Fungsi back yang dipake asisten-modul.js
window.backToDashboard = () => {
    document.getElementById('module-container').innerHTML = '';
    document.getElementById('module-container').classList.add('hidden');
    document.querySelector('.dashboard-hero')?.closest('section')?.classList.remove('hidden');
    document.querySelector('[aria-labelledby="rooms-heading"]')?.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
};
// Log ready state
function finalizeAuth() {
    console.log('🟢 [Dashboard.js] Auth init complete:', {
        role: window.currentUserRole,
        approved: window.currentUserIsApproved
    });
}

// ============================================
// ✅ LOGOUT - Simple & Reliable
// ============================================

window.logout = async function() {
    console.log('🚪 [Dashboard.js] Logout called');
    
    // Set session flags to prevent reload loops
    sessionStorage.setItem('__justLoggedOut', 'true');
    sessionStorage.setItem('__loggingOut', 'true');
    
    // Try Firebase signOut
    try {
        // ✅ FIX: Import path corrected to ../modules/
        const { auth, signOut } = await import('../modules/firebase-config.js');
        await signOut(auth);
        console.log('✅ [Dashboard.js] Firebase signOut success');
    } catch (e) {
        console.warn('⚠️ [Dashboard.js] Firebase signOut failed, continuing...');
    }
    
    // Clear storage & redirect
    localStorage.clear();
    
    const redirectUrl = 'index.html?logout=' + Date.now() + '&r=' + Math.random().toString(36).substr(2, 9);
    console.log('🔄 [Dashboard.js] Redirecting to:', redirectUrl);
    
    // Use replace() to prevent back-button issues
    window.location.replace(redirectUrl);
    
    // Fallback if replace didn't work
    setTimeout(() => {
        window.location.href = redirectUrl;
    }, 150);
};

// ============================================
// ✅ AUTO-INIT ON DOM READY
// ============================================

// Run auth check when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    // DOM already loaded
    initAuth();
}

// ============================================
// ✅ EXPORT (for module imports if needed)
// ============================================

export { initAuth };

// ============================================
// ✅ FINAL CONFIRMATION
// ============================================

console.log('🟢🟢🟢 [Dashboard.js] READY - Clean Sync Version 🟢🟢🟢');
console.log('📋 Available:');
console.log('   • isUserApproved() ← Check access');
console.log('   • showPendingApprovalUI() ← Show pending state');
console.log('   • logout() ← Sign out + redirect');
console.log('   • initAuth() ← Main entry (auto-run)');
console.log('🎯 Sync with dashboard.html: UI-only inline script');
console.log('✅ FIX: Import path ../modules/ (bukan ./modules/)');
console.log('✅ Compatible with protsma module (modules/protsma/protsma.js)');
