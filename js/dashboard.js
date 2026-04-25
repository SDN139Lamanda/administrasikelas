/**
 * ============================================
 * DASHBOARD LOGIC - Platform Administrasi Kelas
 * VERSI: Fix logout redirect persistence + double-execution guard
 * ============================================
 */

// ✅ Flag to prevent double-execution of logout (shared with dashboard.html shim)
if (typeof window.__logoutExecuted === 'undefined') {
    window.__logoutExecuted = false;
}

// ✅ CRITICAL: Define window.logout SYNCHRONOUSLY at file top (before any async code)
// This ensures inline onclick="logout()" in dashboard.html works even before module fully loads
if (typeof window.logout !== 'function') {
    window.logout = function() {
        // Prevent double-execution
        if (window.__logoutExecuted) return;
        window.__logoutExecuted = true;
        
        console.log('🚪 [Dashboard] Logout called (sync shim)');
        try { localStorage.clear(); sessionStorage.clear(); } catch(e) {}
        const redirectUrl = 'index.html?loggedout=' + Date.now() + '&' + Math.random().toString(36).substr(2, 9);
        window.location.replace(redirectUrl);
        setTimeout(function() { if (window.__logoutExecuted) window.location.href = redirectUrl; }, 100);
    };
}

console.log('🔴 [Dashboard] Script START');

// ============================================
// ✅ GLOBAL STATE - Initialize with safe defaults
// ============================================

// ✅ Initialize approval state to FALSE by default (safety first)
window.currentUserIsApproved = false;
window.currentUserRole = null;
window.currentUserJenjang = null;
window.currentUserKelas = [];
window.currentUserMapel = [];
window.currentUserSdMapelType = 'kelas';
window.currentUserMiMapelType = 'kelas';

// ============================================
// ✅ HELPER FUNCTIONS - For approval & UI
// ============================================

// ✅ NEW: Helper function to check approval status (can be called from anywhere)
window.isUserApproved = function() {
    return window.currentUserIsApproved === true;
};

// ✅ NEW: Helper function to show pending screen (reusable)
window.showPendingApprovalUI = function() {
    console.log('⏳ [Dashboard] Showing pending approval UI');
    
    // Update context badge
    const userContext = document.getElementById('userContextText');
    if (userContext) {
        userContext.innerHTML = `<span class="text-yellow-600"><i class="fas fa-hourglass-half mr-1"></i>Menunggu approval...</span>`;
    }
    
    // Disable all feature rooms (keep only info rooms)
    document.querySelectorAll('.room-card').forEach(card => {
        if (!card.classList.contains('room-info')) {
            card.style.opacity = '0.5';
            card.style.pointerEvents = 'none';
            card.title = '🔒 Fitur terkunci - menunggu persetujuan admin';
            card.setAttribute('aria-disabled', 'true');
        }
    });
    
    // Show admin badge as pending
    const adminBadge = document.getElementById('admin-access-badge');
    if (adminBadge && window.currentUserRole !== 'admin') {
        adminBadge.innerHTML = `
            <div class="bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-300 rounded-lg p-3 flex items-center gap-3">
                <i class="fas fa-hourglass-half text-amber-600 text-lg"></i>
                <p class="text-sm text-amber-800 font-medium">Menunggu Persetujuan Admin: Akses terbatas sampai akun disetujui.</p>
            </div>
        `;
        adminBadge.classList.remove('hidden');
    }
};

// ============================================
// ✅ YOUR CODE - PRESERVED 100% (Navigation & Routing)
// ============================================

// ✅ UPDATED: Navigation & Sub-Feature Routing WITH APPROVAL CHECK
window.currentJenjang = null; 
window.currentKelas = null;
window.currentUserJenjang = null; // Store user's registered jenjang

window.showJenjangSection = function(jenjang) {
    // ✅ ACCESS CHECK: Validate if user can access this jenjang
    if (!window.isUserApproved?.() && window.currentUserRole !== 'admin') {
        alert('⏳ Akun Anda masih menunggu persetujuan admin.\n\nFitur belum dapat diakses.');
        return; // Block access
    }
    
    // If access granted, proceed normally
    document.querySelectorAll('section[data-jenjang]').forEach(sec => sec.classList.add('hidden'));
    const target = document.getElementById(`${jenjang}-section`);
    if (target) { 
        target.classList.remove('hidden'); 
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
    }
    // Hide module containers but NOT main sections yet (user still in jenjang selection)
    ['module-container','refleksi-container','penilaian-container','asisten-container','cita-container']
        .forEach(id => {
            const el = document.getElementById(id); 
            if(el) { el.classList.add('hidden'); el.innerHTML = ''; }
        });
};

// ✅ UPDATED: Sub-feature modal - APPROVAL CHECK HERE + hide main sections
window.showSubFeatureModal = function(jenjang, kelas) {
    // ✅ CRITICAL: Check approval BEFORE allowing sub-feature access
    if (!window.isUserApproved?.() && window.currentUserRole !== 'admin') {
        console.log('🔒 [SubFeature] User pending, blocking modal');
        alert('⏳ Akun Anda masih menunggu persetujuan admin.\n\nFitur belum dapat diakses.');
        return; // Block access
    }
    
    // If access granted, proceed
    window.currentJenjang = jenjang; 
    window.currentKelas = kelas;
    window.currentUserJenjang = localStorage.getItem('user_jenjang') || '';
    
    const lbl = {tk:'TK', sd:'SD', mi:'MI', smp:'SMP', mts:'MTs', sma:'SMA', ma:'MA'}[jenjang] || jenjang.toUpperCase();
    document.getElementById('modal-jenjang-kelas').textContent = `${lbl} - Kelas ${kelas}`;
    document.getElementById('subfeature-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // ✅ Hide main sections ONLY when sub-feature modal is open
    window.hideMainSectionsForSubFeature?.() || hideMainSectionsForSubFeatureFallback();
};

// ✅ Fallback function if not defined elsewhere
function hideMainSectionsForSubFeatureFallback() {
    document.querySelector('.dashboard-hero')?.closest('section')?.classList.add('hidden');
    document.querySelector('[aria-labelledby="rooms-heading"]')?.classList.add('hidden');
    document.getElementById('admin-access-badge')?.classList.add('hidden');
}

window.closeSubFeatureModal = function() {
    document.getElementById('subfeature-modal').classList.add('hidden');
    document.body.style.overflow = ''; 
    window.currentJenjang = null; 
    window.currentKelas = null;
    
    // ✅ Show main sections when modal closes
    window.showMainSections?.() || showMainSectionsFallback();
};

function showMainSectionsFallback() {
    document.querySelector('.dashboard-hero')?.closest('section')?.classList.remove('hidden');
    document.querySelector('[aria-labelledby="rooms-heading"]')?.classList.remove('hidden');
    ['module-container','refleksi-container','penilaian-container','asisten-container','cita-container']
        .forEach(id => {
            const el = document.getElementById(id); 
            if(el) { el.classList.add('hidden'); el.innerHTML = ''; }
        });
}

function hideModuleContainers() {
    ['module-container','refleksi-container','penilaian-container','asisten-container','cita-container'].forEach(id => {
        const el = document.getElementById(id); if(el) { el.classList.add('hidden'); el.innerHTML = ''; }
    });
}

// ✅ ROUTER TO SAFE WRAPPERS - APPROVAL CHECK AT SUB-FEATURE LEVEL ONLY
window.loadSubFeature = async function(subfitur) {
    const j = window.currentJenjang, k = window.currentKelas;
    const userJenjang = window.currentUserJenjang || localStorage.getItem('user_jenjang') || '';
    
    if (!j || !k) { alert('❌ Konteks kelas tidak ditemukan.'); return; }
    
    // ✅ CRITICAL: Block if user not approved
    if (!window.isUserApproved?.() && window.currentUserRole !== 'admin') {
        console.log('🔒 [LoadSubFeature] User pending, blocking feature load');
        alert('⏳ Akun Anda masih menunggu persetujuan admin.\n\nFitur belum dapat diakses.');
        return;
    }
    
    localStorage.setItem('current_jenjang', j); 
    localStorage.setItem('current_kelas', k); 
    localStorage.setItem('current_subfitur', subfitur);
    
    closeSubFeatureModal(); // Close modal first
    hideModuleContainers();
    
    // ✅ Ensure main sections are hidden when loading sub-feature
    (window.hideMainSectionsForSubFeature || hideMainSectionsForSubFeatureFallback)();
    
    // Show the specific container for this sub-feature
    const containerMap = {
        'adm-kelas': 'module-container',
        'adm-pembelajaran': 'module-container', 
        'penilaian': 'penilaian-container',
        'refleksi': 'refleksi-container',
        'asisten-modul': 'asisten-container',
        'cita-generator': 'cita-container'
    };
    const targetContainer = document.getElementById(containerMap[subfitur] || 'module-container');
    if (targetContainer) targetContainer.classList.remove('hidden');

    try {
        switch(subfitur) {
            case 'adm-kelas': await window.safeRenderAdmKelas(); break;
            case 'adm-pembelajaran': await window.safeRenderAdmPembelajaran(); break;
            case 'penilaian': await window.safeRenderPenilaian(); break;
            case 'refleksi': await window.safeRenderRefleksiForm(); break;
            case 'asisten-modul':
                if (typeof window.renderAsistenModul === 'function') await window.renderAsistenModul(j, k);
                else { const m = await import('./modules/asisten-modul.js'); (m.renderAsistenModul || m.default)?.(j, k); }
                break;
            case 'cita-generator':
                if (typeof window.renderCitaGenerator === 'function') await window.renderCitaGenerator(j, k);
                else { const m = await import('./modules/cta-generator.js'); (m.renderCitaGenerator || m.default)?.(j, k); }
                break;
            default: 
                if (['fitur-7','fitur-8','fitur-9','fitur-10'].includes(subfitur)) {
                    alert('🚧 Fitur ini sedang dalam pengembangan. Segera hadir!');
                } else {
                    console.warn(`⚠️ Sub-fitur ${subfitur} belum terpasang.`);
                }
        }
    } catch (err) { 
        console.error('Load Error:', err); 
        alert(`⚠️ Gagal memuat ${subfitur}.`); 
        // Show main sections again on error
        (window.showMainSections || showMainSectionsFallback)();
    }
};

window.backToDashboard = function() {
    // ✅ Show main sections when returning to dashboard
    (window.showMainSections || showMainSectionsFallback)();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ============================================
// ✅ ASYNC LOGOUT - Overrides sync shim after module loads (with persistence fix)
// ============================================

// ✅ UPDATED: Fungsi logout dengan fix redirect persistence + double-execution guard
window.logout = async function() {
    // Prevent double-execution
    if (window.__logoutExecuted) {
        console.log('🚪 [Dashboard] Logout already executed, skipping');
        return;
    }
    window.__logoutExecuted = true;
    
    console.log('🚪 [Dashboard] logout DIPANGGIL (async full implementation)');
    
    try {
        const { auth, signOut } = await import('./modules/firebase-config.js');
        
        // ✅ 1. Sign out dari Firebase Auth
        await signOut(auth);
        console.log('✅ [Dashboard] Firebase signOut successful');
        
    } catch (error) {
        console.warn('⚠️ [Dashboard] Firebase signOut failed (continuing with redirect):', error);
        // Continue with redirect even if Firebase signOut fails
    }
    
    try {
        // ✅ 2. Clear localStorage & sessionStorage
        localStorage.clear();
        sessionStorage.clear();
        console.log('✅ [Dashboard] Storage cleared');
    } catch (e) {
        console.warn('⚠️ [Dashboard] Storage clear failed:', e);
    }
    
    // ✅ 3. Force redirect using replace() + cache busting
    // replace() prevents browser back-button from returning to dashboard
    const redirectUrl = 'index.html?loggedout=' + Date.now() + '&' + Math.random().toString(36).substr(2, 9);
    
    console.log('🔄 [Dashboard] Redirecting to:', redirectUrl);
    window.location.replace(redirectUrl);
    
    // ✅ 4. Extra safety: force reload after delay if replace didn't work
    setTimeout(function() {
        if (window.__logoutExecuted) {
            console.log('🔄 [Dashboard] Fallback redirect via href');
            window.location.href = redirectUrl;
        }
    }, 200);
};

// ============================================
// FINAL CONFIRMATION
// ============================================

console.log('🟢🟢🟢 [Dashboard] SCRIPT SELESAI LOADING 🟢🟢🟢');
console.log('📋 Available functions:');
console.log('   • showJenjangSection(jenjang)');
console.log('   • showSubFeatureModal(jenjang, kelas)');
console.log('   • closeSubFeatureModal()');
console.log('   • loadSubFeature(subfitur)');
console.log('   • backToDashboard()');
console.log('   • logout() ← UPDATED with replace() + cache busting + double-execution guard!');
console.log('   • isUserApproved() ← NEW helper');
console.log('   • showPendingApprovalUI() ← NEW helper');
console.log('🚀 READY TO USE!');
