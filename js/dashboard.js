/**
 * ============================================
 * DASHBOARD LOGIC - Platform Administrasi Kelas
 * VERSI: Clean Sync with dashboard.html (UI-only inline script)
 * ============================================
 * 
 * CATATAN PENTING:
 * • dashboard.html inline script HANYA update UI dasar
 * • SEMUA approval logic ada di file ini
 * • Navigation functions dipanggil dari dashboard.html
 * ============================================
 */

// ============================================
// ✅ GLOBAL STATE - Initialize with safe defaults
// ============================================

// Flag to prevent double-execution of logout (shared with dashboard.html shim)
if (typeof window.__logoutExecuted === 'undefined') {
    window.__logoutExecuted = false;
}

// User state - will be populated after auth check
window.currentUserIsApproved = false;
window.currentUserRole = null;
window.currentUserJenjang = null;
window.currentUserKelas = [];
window.currentUserMapel = [];
window.currentUserSdMapelType = 'kelas';
window.currentUserMiMapelType = 'kelas';

// Navigation state
window.currentJenjang = null;
window.currentKelas = null;
window.currentUserJenjangNav = null;

console.log('🔴 [Dashboard.js] Script START - Clean Sync Version');

// ============================================
// ✅ HELPER: Flexible Approval Check
// ============================================

/**
 * Check if user is approved to access features
 * Rules:
 * 1. Admin role → ALWAYS approved
 * 2. No isApproved field (old account) → approved (backward compat)
 * 3. isApproved === true / 'true' / 1 → approved
 * 4. Otherwise → not approved
 */
window.isUserApproved = function() {
    // Rule 1: Admin ALWAYS approved
    if (window.currentUserRole === 'admin') {
        return true;
    }
    
    const approved = window.currentUserIsApproved;
    
    // Rule 2: No field = old account = approved
    if (approved === undefined || approved === null) {
        return true;
    }
    
    // Rule 3: Check various true values
    if (approved === true) return true;
    if (typeof approved === 'string' && approved.toLowerCase() === 'true') return true;
    if (approved === 1) return true;
    
    // Rule 4: Default = not approved
    return false;
};

/**
 * Show UI for pending approval state
 */
window.showPendingApprovalUI = function() {
    console.log('⏳ [Dashboard.js] Showing pending approval UI');
    
    // Update context badge
    const userContext = document.getElementById('userContextText');
    if (userContext) {
        userContext.innerHTML = `<span class="text-yellow-600"><i class="fas fa-hourglass-half mr-1"></i>Menunggu approval...</span>`;
    }
    
    // Disable feature cards (but keep them visible)
    document.querySelectorAll('.room-card').forEach(card => {
        if (!card.classList.contains('room-info')) {
            card.style.opacity = '0.5';
            card.style.pointerEvents = 'none';
            card.title = '🔒 Fitur terkunci - menunggu persetujuan admin';
            card.setAttribute('aria-disabled', 'true');
        }
    });
    
    // Update admin badge
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
// ✅ NAVIGATION FUNCTIONS (Called from dashboard.html)
// ============================================

/**
 * Show jenjang section - with approval check
 * Called from: onclick="showJenjangSection('sd')" in dashboard.html
 */
window.showJenjangSection = function(jenjang) {
    console.log('📂 [Dashboard.js] showJenjangSection:', jenjang);
    
    // ✅ Approval check BEFORE showing section
    if (!window.isUserApproved() && window.currentUserRole !== 'admin') {
        console.log('🔒 [Dashboard.js] User pending, blocking section access');
        alert('⏳ Akun Anda masih menunggu persetujuan admin.\n\nFitur belum dapat diakses.');
        return;
    }
    
    // Hide all jenjang sections
    document.querySelectorAll('section[data-jenjang]').forEach(sec => sec.classList.add('hidden'));
    
    // Show target section
    const target = document.getElementById(`${jenjang}-section`);
    if (target) {
        target.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        console.log(`✅ [Dashboard.js] Shown: ${jenjang}-section`);
    }
    
    // Hide module containers (user still in selection phase)
    hideModuleContainers();
};

/**
 * Show sub-feature modal - with approval check + hide main sections
 * Called from: onclick="showSubFeatureModal('sd', '1')" in dashboard.html
 */
window.showSubFeatureModal = function(jenjang, kelas) {
    console.log('🔍 [Dashboard.js] showSubFeatureModal:', jenjang, kelas);
    
    // ✅ CRITICAL: Approval check BEFORE showing modal
    if (!window.isUserApproved() && window.currentUserRole !== 'admin') {
        console.log('🔒 [Dashboard.js] User pending, blocking modal');
        alert('⏳ Akun Anda masih menunggu persetujuan admin.\n\nFitur belum dapat diakses.');
        return;
    }
    
    // Set navigation state
    window.currentJenjang = jenjang;
    window.currentKelas = kelas;
    window.currentUserJenjangNav = localStorage.getItem('user_jenjang') || '';
    
    // Update modal title
    const lbl = {tk:'TK', sd:'SD', mi:'MI', smp:'SMP', mts:'MTs', sma:'SMA', ma:'MA'}[jenjang] || jenjang.toUpperCase();
    const modalTitle = document.getElementById('modal-jenjang-kelas');
    if (modalTitle) {
        modalTitle.textContent = `${lbl} - Kelas ${kelas}`;
    }
    
    // Show modal
    const modal = document.getElementById('subfeature-modal');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        console.log('✅ [Dashboard.js] Sub-feature modal shown');
    }
    
    // Hide main dashboard sections (hero + rooms-grid)
    hideMainSectionsForSubFeature();
};

/**
 * Close sub-feature modal - show main sections again
 * Called from: onclick="closeSubFeatureModal()" in dashboard.html
 */
window.closeSubFeatureModal = function() {
    console.log('🔒 [Dashboard.js] closeSubFeatureModal');
    
    const modal = document.getElementById('subfeature-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
    
    // Reset navigation state
    window.currentJenjang = null;
    window.currentKelas = null;
    
    // Show main sections again
    showMainSections();
};

/**
 * Load sub-feature module - with approval check + container handling
 * Called from: onclick="loadSubFeature('adm-kelas')" in dashboard.html
 */
window.loadSubFeature = async function(subfitur) {
    console.log('🚀 [Dashboard.js] loadSubFeature:', subfitur);
    
    const j = window.currentJenjang;
    const k = window.currentKelas;
    
    if (!j || !k) {
        alert('❌ Konteks kelas tidak ditemukan.');
        return;
    }
    
    // ✅ CRITICAL: Approval check BEFORE loading feature
    if (!window.isUserApproved() && window.currentUserRole !== 'admin') {
        console.log('🔒 [Dashboard.js] User pending, blocking feature load');
        alert('⏳ Akun Anda masih menunggu persetujuan admin.\n\nFitur belum dapat diakses.');
        return;
    }
    
    // Save navigation state to localStorage
    localStorage.setItem('current_jenjang', j);
    localStorage.setItem('current_kelas', k);
    localStorage.setItem('current_subfitur', subfitur);
    
    // Close modal first
    closeSubFeatureModal();
    hideModuleContainers();
    
    // Hide main sections (user is now in feature view)
    hideMainSectionsForSubFeature();
    
    // Map sub-feature to container
    const containerMap = {
        'adm-kelas': 'module-container',
        'adm-pembelajaran': 'module-container',
        'penilaian': 'penilaian-container',
        'refleksi': 'refleksi-container',
        'asisten-modul': 'asisten-container',
        'cita-generator': 'cita-container'
    };
    const containerId = containerMap[subfitur] || 'module-container';
    const container = document.getElementById(containerId);
    if (container) container.classList.remove('hidden');
    
    // Load the actual module
    try {
        switch(subfitur) {
            case 'adm-kelas':
                await window.safeRenderAdmKelas?.() || safeRenderFallback('adm-kelas');
                break;
            case 'adm-pembelajaran':
                await window.safeRenderAdmPembelajaran?.() || safeRenderFallback('adm-pembelajaran');
                break;
            case 'penilaian':
                await window.safeRenderPenilaian?.() || safeRenderFallback('penilaian');
                break;
            case 'refleksi':
                await window.safeRenderRefleksiForm?.() || safeRenderFallback('refleksi');
                break;
            case 'asisten-modul':
                if (typeof window.renderAsistenModul === 'function') {
                    await window.renderAsistenModul(j, k);
                } else {
                    const m = await import('./modules/asisten-modul.js');
                    (m.renderAsistenModul || m.default)?.(j, k);
                }
                break;
            case 'cita-generator':
                if (typeof window.renderCitaGenerator === 'function') {
                    await window.renderCitaGenerator(j, k);
                } else {
                    const m = await import('./modules/cta-generator.js');
                    (m.renderCitaGenerator || m.default)?.(j, k);
                }
                break;
            default:
                if (['fitur-7','fitur-8','fitur-9','fitur-10'].includes(subfitur)) {
                    alert('🚧 Fitur ini sedang dalam pengembangan. Segera hadir!');
                } else {
                    console.warn(`⚠️ Sub-fitur ${subfitur} belum terpasang.`);
                }
        }
    } catch (err) {
        console.error('❌ [Dashboard.js] Load error:', err);
        alert(`⚠️ Gagal memuat ${subfitur}.`);
        // Show main sections again on error
        showMainSections();
    }
};

/**
 * Fallback renderer for safeRender functions
 */
async function safeRenderFallback(moduleName) {
    console.log(`🔄 [Dashboard.js] Fallback render for ${moduleName}`);
    const container = document.getElementById('module-container');
    if (container) {
        container.innerHTML = `<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-2xl text-indigo-600"></i><p class="mt-2 text-slate-600">Memuat modul ${moduleName}...</p></div>`;
        container.classList.remove('hidden');
    }
    await new Promise(resolve => setTimeout(resolve, 500));
}

/**
 * Return to dashboard - show main sections
 * Called from: onclick="backToDashboard()" in dashboard.html
 */
window.backToDashboard = function() {
    console.log('🏠 [Dashboard.js] backToDashboard');
    showMainSections();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ============================================
// ✅ UI HELPERS
// ============================================

function hideModuleContainers() {
    ['module-container','refleksi-container','penilaian-container','asisten-container','cita-container'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.add('hidden');
            el.innerHTML = '';
        }
    });
}

function hideMainSectionsForSubFeature() {
    console.log('🔒 [Dashboard.js] Hiding main sections for sub-feature');
    document.querySelector('.dashboard-hero')?.closest('section')?.classList.add('hidden');
    document.querySelector('[aria-labelledby="rooms-heading"]')?.classList.add('hidden');
    document.getElementById('admin-access-badge')?.classList.add('hidden');
}

function showMainSections() {
    console.log('🔓 [Dashboard.js] Showing main sections');
    document.querySelector('.dashboard-hero')?.closest('section')?.classList.remove('hidden');
    document.querySelector('[aria-labelledby="rooms-heading"]')?.classList.remove('hidden');
    
    // Re-apply jenjang visibility (for badge only)
    const userRole = localStorage.getItem('user_role') || 'teacher';
    const userJenjang = localStorage.getItem('user_jenjang') || '';
    if (typeof window.applyJenjangVisibility === 'function') {
        window.applyJenjangVisibility(userRole, userJenjang);
    }
    
    hideModuleContainers();
}

// ============================================
// ✅ LOGOUT - Sync with dashboard.html shim
// ============================================

/**
 * Sync logout shim - ensures inline onclick works before module loads
 */
if (typeof window.logout !== 'function') {
    window.logout = function() {
        if (window.__logoutExecuted) {
            console.log('🚪 [Dashboard.js] Logout already executed (shim), skipping');
            return;
        }
        window.__logoutExecuted = true;
        
        console.log('🚪 [Dashboard.js] Logout called (sync shim)');
        
        // Set session flags BEFORE redirect
        sessionStorage.setItem('__justLoggedOut', 'true');
        sessionStorage.setItem('__loggingOut', 'true');
        
        // Clear storage (keep logout flag)
        try { localStorage.clear(); } catch(e) {}
        
        // Hard redirect with cache busting
        const redirectUrl = 'index.html?loggedout=' + Date.now() + '&r=' + Math.random().toString(36).substr(2, 9);
        window.location.replace(redirectUrl);
        
        // Fallback if replace didn't work
        setTimeout(function() {
            if (window.__logoutExecuted) {
                window.location.href = redirectUrl;
            }
        }, 100);
    };
}

/**
 * Async logout - overrides shim after module loads (full Firebase signOut)
 */
window.logout = async function() {
    // Prevent double-execution
    if (window.__logoutExecuted) {
        console.log('🚪 [Dashboard.js] Logout already executed (async), skipping');
        return;
    }
    window.__logoutExecuted = true;
    
    console.log('🚪 [Dashboard.js] logout DIPANGGIL (async full implementation)');
    
    // Set session flags BEFORE any async operation
    sessionStorage.setItem('__justLoggedOut', 'true');
    sessionStorage.setItem('__loggingOut', 'true');
    
    // Try Firebase signOut
    try {
        const { auth, signOut } = await import('./modules/firebase-config.js');
        await signOut(auth);
        console.log('✅ [Dashboard.js] Firebase signOut successful');
    } catch (error) {
        console.warn('⚠️ [Dashboard.js] Firebase signOut failed (continuing with redirect):', error);
    }
    
    // Clear storage (keep logout flag)
    try {
        const logoutFlag = sessionStorage.getItem('__justLoggedOut');
        localStorage.clear();
        sessionStorage.clear();
        if (logoutFlag) sessionStorage.setItem('__justLoggedOut', 'true');
        console.log('✅ [Dashboard.js] Storage cleared');
    } catch (e) {
        console.warn('⚠️ [Dashboard.js] Storage clear failed:', e);
    }
    
    // Hard redirect with cache busting
    const redirectUrl = 'index.html?loggedout=' + Date.now() + '&r=' + Math.random().toString(36).substr(2, 9);
    console.log('🔄 [Dashboard.js] Redirecting to:', redirectUrl);
    window.location.replace(redirectUrl);
    
    // Fallback if replace didn't work
    setTimeout(function() {
        if (window.__logoutExecuted) {
            console.log('🔄 [Dashboard.js] Fallback redirect via href');
            window.location.href = redirectUrl;
        }
    }, 200);
};

// ============================================
// ✅ AUTHENTICATION CHECK - MAIN ENTRY POINT
// ============================================

/**
 * Initialize auth check and populate user state
 * Called from: DOMContentLoaded in dashboard.html inline script
 */
export async function initDashboardAuth() {
    console.log('🔐 [Dashboard.js] initDashboardAuth START');
    
    try {
        const { auth, onAuthStateChanged, db, doc, getDoc } = await import('./modules/firebase-config.js');
        
        return new Promise((resolve) => {
            const unsubscribe = onAuthStateChanged(auth, async (user) => {
                // Unsubscribe after first fire to prevent multiple calls
                if (typeof unsubscribe === 'function') unsubscribe();
                
                if (!user) {
                    console.log('⚠️ [Dashboard.js] User not authenticated, redirecting...');
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.href = 'index.html?notauth=' + Date.now();
                    resolve();
                    return;
                }
                
                console.log('✅ [Dashboard.js] User authenticated:', user.email);
                
                // Update basic UI (email, avatar) - sync with dashboard.html inline script
                const userEmailEl = document.getElementById('userEmail');
                const userAvatarEl = document.getElementById('userAvatar');
                const userContextEl = document.getElementById('userContextText');
                
                if (userEmailEl) userEmailEl.textContent = user.email;
                if (userAvatarEl) {
                    userAvatarEl.src = user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'User'}&background=7c3aed&color=fff`;
                }
                if (userContextEl) userContextEl.textContent = user.displayName || user.email;
                
                // Fetch user data from Firestore
                try {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    
                    if (!userDoc.exists()) {
                        console.warn('⚠️ [Dashboard.js] User doc NOT FOUND in Firestore');
                        setDefaultUserState();
                        finalizeAuth(resolve);
                        return;
                    }
                    
                    const userData = userDoc.data();
                    
                    // Debug log for troubleshooting
                    console.log('🔍 [Dashboard.js] User doc fields:', Object.keys(userData));
                    console.log('🔍 [Dashboard.js] Approval check:', {
                        role: userData.role,
                        isApproved: userData.isApproved,
                        type: typeof userData.isApproved
                    });
                    
                    // Set role FIRST (needed for approval check)
                    window.currentUserRole = userData.role || 'teacher';
                    
                    // ✅ FLEXIBLE APPROVAL CHECK
                    let approvalValue = false;
                    
                    // Rule 1: Admin ALWAYS approved
                    if (window.currentUserRole === 'admin') {
                        approvalValue = true;
                        console.log('✅ [Dashboard.js] ADMIN - auto approved');
                    }
                    // Rule 2: No field = old account = approved
                    else if (userData.isApproved === undefined || userData.isApproved === null) {
                        approvalValue = true;
                        console.log('✅ [Dashboard.js] No isApproved field (old account) - approved');
                    }
                    // Rule 3: Check various true values
                    else if (userData.isApproved === true || userData.isApproved === 'true' || userData.isApproved === 1) {
                        approvalValue = true;
                        console.log('✅ [Dashboard.js] isApproved field is true');
                    }
                    // Fallback field names
                    else if (userData.approved === true || userData.approved === 'true') {
                        approvalValue = true;
                        console.log('✅ [Dashboard.js] approved field is true');
                    }
                    // Default: not approved
                    else {
                        approvalValue = false;
                        console.log('⚠️ [Dashboard.js] User NOT approved (isApproved = false)');
                    }
                    
                    // Set all user state
                    window.currentUserIsApproved = approvalValue;
                    window.currentUserJenjang = userData.jenjang_sekolah || null;
                    window.currentUserKelas = Array.isArray(userData.kelas_diampu) ? userData.kelas_diampu : [];
                    window.currentUserMapel = Array.isArray(userData.mapel_diampu) ? userData.mapel_diampu : [];
                    window.currentUserSdMapelType = userData.sd_mapel_type || 'kelas';
                    window.currentUserMiMapelType = userData.mi_mapel_type || 'kelas';
                    
                    // Save to localStorage for other scripts
                    localStorage.setItem('user_role', window.currentUserRole);
                    localStorage.setItem('user_jenjang', window.currentUserJenjang || '');
                    localStorage.setItem('user_kelas_diampu', JSON.stringify(window.currentUserKelas));
                    
                    console.log('✅ [Dashboard.js] User state populated:', {
                        role: window.currentUserRole,
                        jenjang: window.currentUserJenjang,
                        isApproved: window.currentUserIsApproved
                    });
                    
                    // Init admin widget if available
                    if (typeof window.initAdminWidget === 'function') {
                        window.initAdminWidget(window.currentUserRole);
                    }
                    
                } catch (e) {
                    console.error('❌ [Dashboard.js] Failed to fetch user profile:', e);
                    setDefaultUserState();
                }
                
                finalizeAuth(resolve);
            });
        });
        
    } catch (error) {
        console.error('❌ [Dashboard.js] Auth init error:', error);
        setDefaultUserState();
        // Fail open: allow access if auth check fails
        window.currentUserIsApproved = true;
    }
}

/**
 * Set default user state (for error cases)
 */
function setDefaultUserState() {
    window.currentUserRole = 'teacher';
    window.currentUserJenjang = null;
    window.currentUserKelas = [];
    window.currentUserMapel = [];
    window.currentUserSdMapelType = 'kelas';
    window.currentUserMiMapelType = 'kelas';
    window.currentUserIsApproved = true; // Fail open for safety
}

/**
 * Finalize auth: apply UI based on approval state
 */
function finalizeAuth(resolve) {
    // If not approved, show pending UI
    if (!window.isUserApproved() && window.currentUserRole !== 'admin') {
        console.log('🔒 [Dashboard.js] User pending, showing pending UI');
        window.showPendingApprovalUI();
        
        // Disable interactive elements as extra safety
        document.querySelectorAll('a.room-link, button, .kelas-link').forEach(el => {
            if (!el.closest('#admin-approval-modal')) {
                el.setAttribute('data-disabled-by-approval', 'true');
                el.style.pointerEvents = 'none';
                el.setAttribute('aria-disabled', 'true');
            }
        });
    } else {
        console.log('✅ [Dashboard.js] User approved, enabling full access');
    }
    
    resolve();
}

// ============================================
// ✅ AUTO-INIT ON DOM READY
// ============================================

// Auto-run auth check when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboardAuth);
} else {
    // DOM already ready
    initDashboardAuth();
}

// ============================================
// ✅ EXPORT FOR MODULE IMPORTS
// ============================================

export { initDashboardAuth };

// ============================================
// ✅ FINAL CONFIRMATION
// ============================================

console.log('🟢🟢🟢 [Dashboard.js] SCRIPT READY 🟢🟢🟢');
console.log('📋 Available functions:');
console.log('   • isUserApproved() ← Flexible approval check');
console.log('   • showPendingApprovalUI() ← Show pending state');
console.log('   • showJenjangSection(jenjang) ← Navigation');
console.log('   • showSubFeatureModal(jenjang, kelas) ← Navigation');
console.log('   • closeSubFeatureModal() ← Navigation');
console.log('   • loadSubFeature(subfitur) ← Module loader');
console.log('   • backToDashboard() ← Navigation');
console.log('   • logout() ← Sync shim + async Firebase signOut');
console.log('   • initDashboardAuth() ← Main auth entry point (exported)');
console.log('🚀 READY - Sync with dashboard.html UI-only inline script');
