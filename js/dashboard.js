/**
 * ============================================
 * DASHBOARD LOGIC - Platform Administrasi Kelas
 * VERSI: Fix logout + Flexible approval check for existing users
 * ============================================
 */

// ✅ Flag to prevent double-execution of logout (shared with index.html)
if (typeof window.__logoutExecuted === 'undefined') {
    window.__logoutExecuted = false;
}

// ✅ CRITICAL: Define window.logout SYNCHRONOUSLY at file top (before any async code)
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
// ✅ GLOBAL STATE - Initialize with safe defaults
// ============================================

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

// ✅ UPDATED: Flexible approval check - handles boolean, string, and missing field
window.isUserApproved = function() {
    // Check multiple possible values for approval
    const approved = window.currentUserIsApproved;
    
    // Handle boolean true
    if (approved === true) return true;
    
    // Handle string "true" (case-insensitive)
    if (typeof approved === 'string' && approved.toLowerCase() === 'true') return true;
    
    // Handle number 1
    if (approved === 1) return true;
    
    // Default: not approved
    return false;
};

// ✅ Helper: Show pending screen (reusable)
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
// ✅ YOUR CODE - PRESERVED 100% (Navigation & Routing)
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
// ✅ AUTHENTICATION CHECK - UPDATED WITH FLEXIBLE APPROVAL + DEBUG LOGS
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
                            
                            // ✅ DEBUG: Log all possible approval fields
                            console.log('🔍 [Dashboard] User doc fields:', Object.keys(userData));
                            console.log('🔍 [Dashboard] Approval check:', {
                                isApproved: userData.isApproved,
                                approved: userData.approved,
                                is_approved: userData.is_approved,
                                type_isApproved: typeof userData.isApproved,
                                type_approved: typeof userData.approved
                            });
                            
                            // ✅ FLEXIBLE: Check multiple possible field names and values
                            let approvalValue = false;
                            
                            // Check isApproved (boolean or string)
                            if (userData.isApproved === true || userData.isApproved === 'true' || userData.isApproved === 1) {
                                approvalValue = true;
                            }
                            // Check approved (fallback field name)
                            else if (userData.approved === true || userData.approved === 'true' || userData.approved === 1) {
                                approvalValue = true;
                            }
                            // Check is_approved (another fallback)
                            else if (userData.is_approved === true || userData.is_approved === 'true' || userData.is_approved === 1) {
                                approvalValue = true;
                            }
                            
                            // ✅ Set global state
                            window.currentUserRole = userData.role || 'teacher';
                            window.currentUserJenjang = userData.jenjang_sekolah || null;
                            window.currentUserKelas = Array.isArray(userData.kelas_diampu) ? userData.kelas_diampu : [];
                            window.currentUserMapel = Array.isArray(userData.mapel_diampu) ? userData.mapel_diampu : [];
                            window.currentUserSdMapelType = userData.sd_mapel_type || 'kelas';
                            window.currentUserMiMapelType = userData.mi_mapel_type || 'kelas';
                            window.currentUserIsApproved = approvalValue; // ✅ Store the flexible check result
                            
                            console.log('✅ [Dashboard] User profile loaded:', { 
                                role: window.currentUserRole, 
                                jenjang: window.currentUserJenjang, 
                                kelas: window.currentUserKelas,
                                isApproved: window.currentUserIsApproved,
                                raw_isApproved: userData.isApproved
                            });
                            
                            // ✅ AUTO-FIX: If user should be approved but isn't, log warning for admin
                            if (!approvalValue && (userData.isApproved || userData.approved || userData.is_approved)) {
                                console.warn('⚠️ [Dashboard] Approval field mismatch detected! User has approval flag but check failed. Possible causes:');
                                console.warn('  • Field name mismatch (isApproved vs approved vs is_approved)');
                                console.warn('  • Type mismatch (boolean true vs string "true")');
                                console.warn('  • Value: isApproved=', userData.isApproved, 'approved=', userData.approved);
                            }
                            
                        } else {
                            console.warn('⚠️ [Dashboard] User doc NOT FOUND in Firestore!');
                            window.currentUserRole = 'teacher';
                            window.currentUserJenjang = null;
                            window.currentUserKelas = [];
                            window.currentUserMapel = [];
                            window.currentUserSdMapelType = 'kelas';
                            window.currentUserMiMapelType = 'kelas';
                            window.currentUserIsApproved = false;
                        }
                    } catch (e) {
                        console.error('❌ [Dashboard] Failed to fetch user profile:', e);
                        window.currentUserRole = 'teacher';
                        window.currentUserJenjang = null;
                        window.currentUserKelas = [];
                        window.currentUserMapel = [];
                        window.currentUserSdMapelType = 'kelas';
                        window.currentUserMiMapelType = 'kelas';
                        window.currentUserIsApproved = false;
                    }
                    
                    if (typeof window.initAdminWidget === 'function') {
                        window.initAdminWidget(window.currentUserRole);
                    }
                    
                    resolve();
                } else {
                    console.warn('⚠️ [Dashboard] User not logged in, redirecting to login...');
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
        window.currentUserIsApproved = false;
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
        kelas: window.currentUserKelas,
        isApproved: isApproved
    });
    
    if (window.currentUserRole === null && !isApproved) {
        console.error('❌ [Dashboard] User data NOT loaded! Check Firestore connection!');
        if (!window.isUserApproved()) {
            window.showPendingApprovalUI();
        }
        return;
    }
    
    if (!window.isUserApproved() && userRole !== 'admin') {
        console.log('🔒 [Dashboard] User pending, hiding all feature rooms');
        window.showPendingApprovalUI();
        return;
    }
    
    if (userRole === 'teacher' && !userJenjang) {
        console.log('👨‍🏫 [Dashboard] Showing all rooms (no jenjang restriction)');
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

console.log('🟢🟢🟢 [Dashboard] SCRIPT SELESAI LOADING 🟢🟢🟢');
console.log('📋 Available functions:');
console.log('   • showJenjangSection(jenjang)');
console.log('   • showSubFeatureModal(jenjang, kelas)');
console.log('   • closeSubFeatureModal()');
console.log('   • loadSubFeature(subfitur)');
console.log('   • backToDashboard()');
console.log('   • logout() ← UPDATED with replace() + cache busting + double-execution guard!');
console.log('   • isUserApproved() ← UPDATED: flexible check for boolean/string/number');
console.log('   • showPendingApprovalUI() ← NEW helper');
console.log('🚀 READY TO USE!');
