/**
 * ============================================
 * DASHBOARD LOGIC - Platform Administrasi Kelas
 * VERSI: Fix Admin Auto-Approved + Backward Compatibility
 * ============================================
 */

// ✅ Flag to prevent double-execution of logout
if (typeof window.__logoutExecuted === 'undefined') {
    window.__logoutExecuted = false;
}

// ✅ CRITICAL: Sync logout shim
if (typeof window.logout !== 'function') {
    window.logout = function() {
        if (window.__logoutExecuted) return;
        window.__logoutExecuted = true;
        
        console.log('🚪 [Dashboard] Logout called (sync shim)');
        sessionStorage.setItem('__justLoggedOut', 'true');
        sessionStorage.setItem('__loggingOut', 'true');
        
        try { localStorage.clear(); } catch(e) {}
        const redirectUrl = 'index.html?loggedout=' + Date.now() + '&' + Math.random().toString(36).substr(2, 9);
        window.location.replace(redirectUrl);
        setTimeout(function() { if (window.__logoutExecuted) window.location.href = redirectUrl; }, 100);
    };
}

console.log('🔴 [Dashboard] Script START');

// ============================================
// ✅ GLOBAL STATE
// ============================================

window.currentUserIsApproved = false;
window.currentUserRole = null;
window.currentUserJenjang = null;
window.currentUserKelas = [];
window.currentUserMapel = [];
window.currentUserSdMapelType = 'kelas';
window.currentUserMiMapelType = 'kelas';

// ============================================
// ✅ HELPER FUNCTIONS
// ============================================

// ✅ UPDATED: Admin ALWAYS approved + backward compatibility for missing field
window.isUserApproved = function() {
    // ✅ CRITICAL: Admin role ALWAYS approved (no check needed)
    if (window.currentUserRole === 'admin') {
        console.log('✅ [Approval] Admin user - auto approved');
        return true;
    }
    
    // Check approval value
    const approved = window.currentUserIsApproved;
    
    // Handle boolean true
    if (approved === true) return true;
    
    // Handle string "true" (case-insensitive)
    if (typeof approved === 'string' && approved.toLowerCase() === 'true') return true;
    
    // Handle number 1
    if (approved === 1) return true;
    
    // ✅ BACKWARD COMPATIBILITY: undefined means old account → treat as approved
    if (approved === undefined || approved === null) {
        console.log('✅ [Approval] No approval field (old account) - treating as approved');
        return true;
    }
    
    // Default: not approved
    return false;
};

window.showPendingApprovalUI = function() {
    console.log('⏳ [Dashboard] Showing pending approval UI');
    
    const userContext = document.getElementById('userContextText');
    if (userContext) {
        userContext.innerHTML = `<span class="text-yellow-600"><i class="fas fa-hourglass-half mr-1"></i>Menunggu approval...</span>`;
    }
    
    document.querySelectorAll('.room-card').forEach(card => {
        if (!card.classList.contains('room-info')) {
            card.style.opacity = '0.5';
            card.style.pointerEvents = 'none';
            card.title = '🔒 Fitur terkunci - menunggu persetujuan admin';
            card.setAttribute('aria-disabled', 'true');
        }
    });
    
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
// ✅ NAVIGATION & ROUTING
// ============================================

window.currentJenjang = null; 
window.currentKelas = null;
window.currentUserJenjang = null;

window.showJenjangSection = function(jenjang) {
    if (!window.isUserApproved() && window.currentUserRole !== 'admin') {
        alert('⏳ Akun Anda masih menunggu persetujuan admin.\n\nFitur belum dapat diakses.');
        return;
    }
    
    document.querySelectorAll('section[data-jenjang]').forEach(sec => sec.classList.add('hidden'));
    const target = document.getElementById(`${jenjang}-section`);
    if (target) { 
        target.classList.remove('hidden'); 
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
    }
    ['module-container','refleksi-container','penilaian-container','asisten-container','cita-container']
        .forEach(id => {
            const el = document.getElementById(id); 
            if(el) { el.classList.add('hidden'); el.innerHTML = ''; }
        });
};

window.showSubFeatureModal = function(jenjang, kelas) {
    if (!window.isUserApproved() && window.currentUserRole !== 'admin') {
        console.log('🔒 [SubFeature] User pending, blocking modal');
        alert('⏳ Akun Anda masih menunggu persetujuan admin.\n\nFitur belum dapat diakses.');
        return;
    }
    
    window.currentJenjang = jenjang; 
    window.currentKelas = kelas;
    window.currentUserJenjang = localStorage.getItem('user_jenjang') || '';
    
    const lbl = {tk:'TK', sd:'SD', mi:'MI', smp:'SMP', mts:'MTs', sma:'SMA', ma:'MA'}[jenjang] || jenjang.toUpperCase();
    document.getElementById('modal-jenjang-kelas').textContent = `${lbl} - Kelas ${kelas}`;
    document.getElementById('subfeature-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    window.hideMainSectionsForSubFeature?.() || hideMainSectionsForSubFeatureFallback();
};

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

window.loadSubFeature = async function(subfitur) {
    const j = window.currentJenjang, k = window.currentKelas;
    const userJenjang = window.currentUserJenjang || localStorage.getItem('user_jenjang') || '';
    
    if (!j || !k) { alert('❌ Konteks kelas tidak ditemukan.'); return; }
    
    if (!window.isUserApproved() && window.currentUserRole !== 'admin') {
        console.log('🔒 [LoadSubFeature] User pending, blocking feature load');
        alert('⏳ Akun Anda masih menunggu persetujuan admin.\n\nFitur belum dapat diakses.');
        return;
    }
    
    localStorage.setItem('current_jenjang', j); 
    localStorage.setItem('current_kelas', k); 
    localStorage.setItem('current_subfitur', subfitur);
    
    closeSubFeatureModal();
    hideModuleContainers();
    
    (window.hideMainSectionsForSubFeature || hideMainSectionsForSubFeatureFallback)();
    
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
        (window.showMainSections || showMainSectionsFallback)();
    }
};

window.backToDashboard = function() {
    (window.showMainSections || showMainSectionsFallback)();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ============================================
// ✅ AUTHENTICATION CHECK - FIXED ADMIN + BACKWARD COMPATIBILITY
// ============================================

async function checkAuthStatus() {
    try {
        const { auth, onAuthStateChanged } = await import('./modules/firebase-config.js');
        
        return new Promise((resolve) => {
            const unsubscribe = onAuthStateChanged(auth, async (user) => {
                if (typeof unsubscribe === 'function') unsubscribe();
                
                if (user) {
                    document.getElementById('userEmail').textContent = user.email;
                    document.getElementById('userAvatar').src = user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'User'}&background=7c3aed&color=fff`;
                    document.getElementById('userContextText').textContent = user.displayName || user.email;
                    console.log('✅ [Dashboard] User logged in:', user.email);
                    
                    try {
                        const { db, doc, getDoc } = await import('./modules/firebase-config.js');
                        
                        const userDoc = await getDoc(doc(db, 'users', user.uid));
                        
                        if (userDoc.exists()) {
                            const userData = userDoc.data();
                            
                            // ✅ DEBUG: Log all fields
                            console.log('🔍 [Dashboard] User doc fields:', Object.keys(userData));
                            console.log('🔍 [Dashboard] Role:', userData.role);
                            console.log('🔍 [Dashboard] isApproved:', userData.isApproved, 'type:', typeof userData.isApproved);
                            
                            // ✅ Set role FIRST (before approval check)
                            window.currentUserRole = userData.role || 'teacher';
                            
                            // ✅ CRITICAL FIX: Admin ALWAYS approved
                            let approvalValue = false;
                            
                            if (window.currentUserRole === 'admin') {
                                approvalValue = true;
                                console.log('✅ [Approval] ADMIN USER - auto approved regardless of isApproved field');
                            }
                            // ✅ BACKWARD COMPATIBILITY: Old accounts without isApproved field → approved
                            else if (userData.isApproved === undefined || userData.isApproved === null) {
                                approvalValue = true;
                                console.log('✅ [Approval] No isApproved field (old account) - treating as approved');
                            }
                            // ✅ Check isApproved (various formats)
                            else if (userData.isApproved === true || userData.isApproved === 'true' || userData.isApproved === 1) {
                                approvalValue = true;
                                console.log('✅ [Approval] isApproved field is true');
                            }
                            // ✅ Fallback field names
                            else if (userData.approved === true || userData.approved === 'true') {
                                approvalValue = true;
                                console.log('✅ [Approval] approved field is true');
                            }
                            else {
                                approvalValue = false;
                                console.log('⚠️ [Approval] User NOT approved (isApproved = false)');
                            }
                            
                            // ✅ Set all user data
                            window.currentUserJenjang = userData.jenjang_sekolah || null;
                            window.currentUserKelas = Array.isArray(userData.kelas_diampu) ? userData.kelas_diampu : [];
                            window.currentUserMapel = Array.isArray(userData.mapel_diampu) ? userData.mapel_diampu : [];
                            window.currentUserSdMapelType = userData.sd_mapel_type || 'kelas';
                            window.currentUserMiMapelType = userData.mi_mapel_type || 'kelas';
                            window.currentUserIsApproved = approvalValue;
                            
                            console.log('✅ [Dashboard] User profile loaded:', { 
                                role: window.currentUserRole, 
                                jenjang: window.currentUserJenjang, 
                                isApproved: window.currentUserIsApproved,
                                raw_isApproved: userData.isApproved
                            });
                            
                        } else {
                            console.warn('⚠️ [Dashboard] User doc NOT FOUND in Firestore!');
                            window.currentUserRole = 'teacher';
                            window.currentUserJenjang = null;
                            window.currentUserKelas = [];
                            window.currentUserMapel = [];
                            window.currentUserSdMapelType = 'kelas';
                            window.currentUserMiMapelType = 'kelas';
                            window.currentUserIsApproved = true; // ✅ No doc → treat as approved (edge case)
                        }
                    } catch (e) {
                        console.error('❌ [Dashboard] Failed to fetch user profile:', e);
                        window.currentUserRole = 'teacher';
                        window.currentUserJenjang = null;
                        window.currentUserKelas = [];
                        window.currentUserMapel = [];
                        window.currentUserSdMapelType = 'kelas';
                        window.currentUserMiMapelType = 'kelas';
                        window.currentUserIsApproved = true; // ✅ Error → treat as approved (fail open)
                    }
                    
                    if (typeof window.initAdminWidget === 'function') {
                        window.initAdminWidget(window.currentUserRole);
                    }
                    
                    resolve();
                } else {
                    console.warn('⚠️ [Dashboard] User not logged in, redirecting...');
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.href = 'index.html?notauth=' + Date.now();
                    resolve();
                }
            });
        });
    } catch (error) {
        console.error('❌ [Dashboard] Auth check error:', error);
        document.getElementById('userEmail').textContent = 'Guest';
        document.getElementById('userContextText').textContent = 'Loading...';
        window.currentUserRole = 'teacher';
        window.currentUserJenjang = null;
        window.currentUserKelas = [];
        window.currentUserMapel = [];
        window.currentUserSdMapelType = 'kelas';
        window.currentUserMiMapelType = 'kelas';
        window.currentUserIsApproved = true; // ✅ Error → fail open
    }
}

// ============================================
// ROOM CARD VISIBILITY
// ============================================

async function initRoomCards() {
    console.log('🔍 [Dashboard] initRoomCards() called');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const userRole = window.currentUserRole || 'teacher';
    const userJenjang = window.currentUserJenjang || null;
    const isApproved = window.currentUserIsApproved;
    
    console.log('🎯 [Dashboard] User data:', { 
        role: userRole, 
        jenjang: userJenjang, 
        isApproved: isApproved
    });
    
    // ✅ CRITICAL: Check approval using helper (which handles admin + backward compat)
    if (!window.isUserApproved() && userRole !== 'admin') {
        console.log('🔒 [Dashboard] User pending, showing pending UI');
        window.showPendingApprovalUI();
        return;
    }
    
    console.log('✅ [Dashboard] User approved, showing rooms');
    
    if (userRole === 'teacher' && !userJenjang) {
        console.log('👨‍ [Dashboard] Showing all rooms (no jenjang restriction)');
        showAllRooms();
    } else if (userJenjang) {
        console.log(`🎯 [Dashboard] Showing ${userJenjang.toUpperCase()} rooms only`);
        showRoomsByJenjang(userJenjang);
    } else {
        console.log('⚠️ [Dashboard] Fallback: Showing all rooms');
        showAllRooms();
    }
    
    console.log('✅ [Dashboard] Room cards initialized');
}

function showAllRooms() {
    document.querySelectorAll('.room-card').forEach(card => {
        card.classList.remove('hidden');
    });
    console.log('✅ [Dashboard] All rooms shown');
}

function showRoomsByJenjang(jenjang) {
    document.querySelectorAll('.room-card').forEach(card => {
        card.classList.add('hidden');
    });
    
    const targetRoom = document.querySelector(`.room-${jenjang}`);
    if (targetRoom) {
        targetRoom.classList.remove('hidden');
        console.log(`✅ [Dashboard] Shown: room-${jenjang}`);
    }
    
    const alwaysVisible = ['adm-kelas', 'adm-pembelajaran', 'penilaian', 'refleksi', 'generator-modul', 'asisten-modul', 'cita-generator'];
    alwaysVisible.forEach(feature => {
        const room = document.querySelector(`.room-${feature}`);
        if (room) {
            room.classList.remove('hidden');
            console.log(`✅ [Dashboard] Always visible: room-${feature}`);
        }
    });
}

// ============================================
// SMOOTH SCROLL
// ============================================

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === 'javascript:void(0)') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
    
    console.log('✅ [Dashboard] Smooth scroll initialized');
}

// ============================================
// FINAL CONFIRMATION
// ============================================

console.log('🟢🟢 [Dashboard] SCRIPT SELESAI LOADING 🟢🟢🟢');
console.log('📋 Available functions:');
console.log('   • showJenjangSection(jenjang)');
console.log('   • showSubFeatureModal(jenjang, kelas)');
console.log('   • closeSubFeatureModal()');
console.log('   • loadSubFeature(subfitur)');
console.log('   • backToDashboard()');
console.log('   • logout() ← UPDATED');
console.log('   • isUserApproved() ← FIXED: Admin auto-approved + backward compat');
console.log('   • showPendingApprovalUI()');
console.log('🚀 READY TO USE!');
