/**
 * ============================================
 * DASHBOARD LOGIC - Platform Administrasi Kelas
 * VERSI: BULLETPROOF + GRANULAR VISIBILITY + LOGOUT FIX + APPROVAL CHECK
 * ============================================
 */

console.log('🔴 [Dashboard] Script START');

// ============================================
// ✅ GLOBAL FUNCTIONS - Attach to window IMMEDIATELY
// ============================================

// Fungsi showSection - WAJIB ada di window sebelum DOM ready
window.showSection = function(sectionId) {
    console.log('📂 [Dashboard] showSection DIPANGGIL:', sectionId);
    
    try {
        // ✅ BLOCK if user not approved
        if (window.currentUserIsApproved === false) {
            console.log('🔒 [Dashboard] User pending, blocking section access');
            alert('⏳ Akun Anda masih menunggu persetujuan admin.\n\nFitur belum dapat diakses.');
            return;
        }
        
        // Hide welcome hero section
        const welcomeSection = document.querySelector('.dashboard-hero');
        if (welcomeSection) {
            welcomeSection.closest('section')?.classList.add('hidden');
            console.log('✅ Welcome section hidden');
        }
        
        // Hide all jenjang sections
        const sectionsToHide = ['sd-section', 'smp-section', 'sma-section'];
        sectionsToHide.forEach(id => {
            const section = document.getElementById(id);
            if (section) {
                section.classList.add('hidden');
                console.log('✅ Hidden:', id);
            }
        });
        
        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.remove('hidden');
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // ✅ Filter class cards based on user's assigned kelas
            const jenjang = sectionId.replace('-section', ''); // "sd", "smp", "sma"
            if (typeof window.initKelasCards === 'function' && ['sd', 'smp', 'sma'].includes(jenjang)) {
                window.initKelasCards(jenjang);
            }
            
            console.log('✅✅✅ SECTION DITAMPILKAN:', sectionId);
        } else {
            console.error('❌❌❌ SECTION TIDAK DITEMUKAN:', sectionId);
            console.log('🔍 Available IDs:', [...document.querySelectorAll('[id]')].map(el => el.id));
        }
    } catch (error) {
        console.error('❌ [Dashboard] showSection ERROR:', error);
    }
};

// Fungsi backToDashboard
window.backToDashboard = function() {
    console.log('🏠 [Dashboard] backToDashboard DIPANGGIL');
    
    try {
        // Show welcome section
        const welcomeSection = document.querySelector('.dashboard-hero');
        if (welcomeSection) {
            welcomeSection.closest('section')?.classList.remove('hidden');
            console.log('✅ Welcome section shown');
        }
        
        // Hide jenjang sections
        ['sd-section', 'smp-section', 'sma-section'].forEach(id => {
            const section = document.getElementById(id);
            if (section) {
                section.classList.add('hidden');
            }
        });
        
        // Hide module containers
        const moduleContainer = document.getElementById('module-container');
        const refleksiContainer = document.getElementById('refleksi-container');
        if (moduleContainer) moduleContainer.classList.add('hidden');
        if (refleksiContainer) refleksiContainer.classList.add('hidden');
        
        // ✅ Reset class cards visibility when returning to dashboard
        document.querySelectorAll('.kelas-card').forEach(card => {
            card.classList.remove('hidden');
        });
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        console.log('✅✅✅ BACK TO DASHBOARD BERHASIL');
    } catch (error) {
        console.error('❌ [Dashboard] backToDashboard ERROR:', error);
    }
};

// Fungsi loadSemester (untuk kelas cards)
window.loadSemester = function(jenjang, kelas) {
    console.log('📚 [Dashboard] loadSemester:', jenjang, 'Kelas', kelas);
    // Handled by jenjang-classes.js module
};

// ✅ UPDATED: Fungsi logout dengan fix cache & storage clear
window.logout = async function() {
    console.log('🚪 [Dashboard] logout DIPANGGIL');
    
    try {
        const { auth, signOut } = await import('../modules/firebase-config.js');
        
        // ✅ 1. Sign out dari Firebase Auth
        await signOut(auth);
        console.log('✅ [Dashboard] Firebase signOut successful');
        
        // ✅ 2. Clear localStorage & sessionStorage
        localStorage.clear();
        sessionStorage.clear();
        console.log('✅ [Dashboard] Storage cleared');
        
        // ✅ 3. Force redirect to index.html dengan timestamp (bypass cache)
        window.location.href = 'index.html?loggedout=' + Date.now();
        
        // ✅ 4. Force reload setelah redirect (untuk mobile)
        setTimeout(() => {
            if (window.location.href.includes('index.html')) {
                window.location.reload(true);
            }
        }, 200);
        
    } catch (error) {
        console.error('❌ [Dashboard] Logout error:', error);
        // Fallback: force redirect anyway
        window.location.href = 'index.html?loggedout=' + Date.now();
    }
};

// ✅ UPDATED FUNCTION: Filter class cards by user's assigned kelas (with array handling)
window.initKelasCards = function(jenjang) {
    console.log('🔍 [Dashboard] initKelasCards() called for:', jenjang);
    
    // ✅ Ensure array (fallback to empty array)
    const userKelas = Array.isArray(window.currentUserKelas) ? window.currentUserKelas : [];
    
    // If no restriction, show all classes
    if (!userKelas || userKelas.length === 0) {
        console.log('✅ [Dashboard] No kelas restriction, showing all');
        document.querySelectorAll(`#${jenjang}-section .kelas-card`).forEach(card => {
            card.classList.remove('hidden');
        });
        return;
    }
    
    // Filter: Show only classes in userKelas array
    console.log('🎯 [Dashboard] Filtering classes:', userKelas);
    
    document.querySelectorAll(`#${jenjang}-section .kelas-card`).forEach(card => {
        const kelasNum = card.dataset.kelas; // "1", "2", "4", etc.
        if (userKelas.includes(kelasNum)) {
            card.classList.remove('hidden');
            console.log(`✅ [Dashboard] Shown: Kelas ${kelasNum}`);
        } else {
            card.classList.add('hidden');
            console.log(`❌ [Dashboard] Hidden: Kelas ${kelasNum}`);
        }
    });
};

console.log('🟢 [Dashboard] Global functions registered:');
console.log('   - window.showSection:', typeof window.showSection);
console.log('   - window.backToDashboard:', typeof window.backToDashboard);
console.log('   - window.loadSemester:', typeof window.loadSemester);
console.log('   - window.logout:', typeof window.logout);
console.log('   - window.initKelasCards:', typeof window.initKelasCards);

// ============================================
// DOM READY INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('✅ [Dashboard] DOM Ready');
    
    // Check authentication status (wait for it to complete)
    await checkAuthStatus();
    
    // ✅ Wait a bit more for data to propagate
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // ✅ BLOCK dashboard if user not approved
    if (window.currentUserIsApproved === false) {
        console.log('🔒 [Dashboard] User pending approval, blocking dashboard');
        // Show pending message in UI
        const userContext = document.getElementById('userContextText');
        if (userContext) {
            userContext.innerHTML = `<span class="text-yellow-600">⏳ Menunggu approval...</span>`;
        }
        // Disable all room cards
        document.querySelectorAll('.room-card').forEach(card => {
            card.style.opacity = '0.5';
            card.style.pointerEvents = 'none';
            card.title = 'Fitur terkunci - menunggu persetujuan admin';
        });
        return;
    }
    
    // Initialize room card visibility
    await initRoomCards();
    
    // Initialize smooth scroll
    initSmoothScroll();
    
    // TEST: Verify sections exist
    console.log('🔍 [Dashboard] Checking sections...');
    console.log('   - sd-section exists:', !!document.getElementById('sd-section'));
    console.log('   - smp-section exists:', !!document.getElementById('smp-section'));
    console.log('   - sma-section exists:', !!document.getElementById('sma-section'));
    
    console.log('🟢 [Dashboard] Initialization complete');
});

// ============================================
// AUTHENTICATION CHECK
// ============================================

async function checkAuthStatus() {
    try {
        const { auth, onAuthStateChanged } = await import('../modules/firebase-config.js');
        
        // ✅ Return Promise that resolves after user data loaded
        return new Promise((resolve) => {
            onAuthStateChanged(auth, async (user) => {
                if (user) {
                    document.getElementById('userEmail').textContent = user.email;
                    document.getElementById('userAvatar').src = user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'User'}&background=7c3aed&color=fff`;
                    document.getElementById('userContextText').textContent = user.displayName || user.email;
                    console.log('✅ [Dashboard] User logged in:', user.email);
                    
                    // ✅ Fetch user data from Firestore
                    try {
                        // ✅ FIX: Import getDoc along with db and doc
                        const { db, doc, getDoc } = await import('../modules/firebase-config.js');
                        
                        const userDoc = await getDoc(doc(db, 'users', user.uid));
                        
                        if (userDoc.exists()) {
                            const userData = userDoc.data();
                            
                            // ✅ FIX: Match field names with Firestore schema (from register.html)
                            window.currentUserRole = userData.role || 'guru';
                            window.currentUserJenjang = userData.jenjang_sekolah || null;  // ✅ Fixed: was 'jenjang'
                            window.currentUserKelas = userData.kelas_diampu || [];          // ✅ Fixed: was 'kelas', now array
                            window.currentUserMapel = userData.mapel_diampu || [];          // ✅ New: array of mapel
                            window.currentUserSdMapelType = userData.sd_mapel_type || 'kelas'; // ✅ New: for SD teacher type
                            window.currentUserIsApproved = userData.isApproved === true;    // ✅ New: approval status
                            
                            console.log('✅ [Dashboard] User profile loaded:', { 
                                role: window.currentUserRole, 
                                jenjang: window.currentUserJenjang, 
                                kelas: window.currentUserKelas,
                                mapel: window.currentUserMapel,
                                isApproved: window.currentUserIsApproved
                            });
                        } else {
                            console.warn('⚠️ [Dashboard] User doc NOT FOUND in Firestore!');
                            console.log('🔍 Expected Document ID:', user.uid);
                            window.currentUserRole = 'guru';
                            window.currentUserJenjang = null;
                            window.currentUserKelas = [];
                            window.currentUserMapel = [];
                            window.currentUserSdMapelType = 'kelas';
                            window.currentUserIsApproved = false;
                        }
                    } catch (e) {
                        console.error('❌ [Dashboard] Failed to fetch user profile:', e);
                        window.currentUserRole = 'guru';
                        window.currentUserJenjang = null;
                        window.currentUserKelas = [];
                        window.currentUserMapel = [];
                        window.currentUserSdMapelType = 'kelas';
                        window.currentUserIsApproved = false;
                    }
                    
                    // ✅ Resolve promise after data loaded
                    resolve();
                } else {
                    console.warn('⚠️ [Dashboard] User not logged in, redirecting to login...');
                    
                    // ✅ CLEAR STORAGE BEFORE REDIRECT (fix logout loop)
                    localStorage.clear();
                    sessionStorage.clear();
                    
                    // ✅ FORCE REDIRECT WITH TIMESTAMP (bypass cache)
                    window.location.href = 'index.html?notauth=' + Date.now();
                    resolve();
                }
            });
        });
    } catch (error) {
        console.error('❌ [Dashboard] Auth check error:', error);
        document.getElementById('userEmail').textContent = 'Guest';
        document.getElementById('userContextText').textContent = 'Loading...';
        // Set defaults to avoid errors
        window.currentUserRole = 'guru';
        window.currentUserJenjang = null;
        window.currentUserKelas = [];
        window.currentUserMapel = [];
        window.currentUserSdMapelType = 'kelas';
        window.currentUserIsApproved = false;
    }
}

// ============================================
// ROOM CARD VISIBILITY (Based on User Role, Jenjang & Kelas)
// ============================================

async function initRoomCards() {
    console.log('🔍 [Dashboard] initRoomCards() called');
    
    // ✅ Wait for auth + Firestore data to be ready
    console.log('⏳ [Dashboard] Waiting for user data...');
    await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms
    
    const userRole = window.currentUserRole || 'guru';
    const userJenjang = window.currentUserJenjang || null;
    
    console.log('🎯 [Dashboard] User data:', { 
        role: userRole, 
        jenjang: userJenjang, 
        kelas: window.currentUserKelas,
        isApproved: window.currentUserIsApproved
    });
    
    // ✅ DEBUG: Check if data is null (means Firestore not loaded)
    if (window.currentUserRole === undefined) {
        console.error('❌ [Dashboard] User data NOT loaded! Check Firestore connection!');
        showAllRooms();
        return;
    }
    
    // ✅ BLOCK: If user not approved, don't show any feature rooms
    if (window.currentUserIsApproved === false) {
        console.log('🔒 [Dashboard] User pending, hiding all feature rooms');
        document.querySelectorAll('.room-card').forEach(card => {
            // Keep only "info" rooms visible, hide feature rooms
            if (!card.classList.contains('room-info')) {
                card.classList.add('hidden');
            }
        });
        return;
    }
    
    if (userRole === 'guru' && !userJenjang) {
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

// ✅ Helper: Show ALL rooms
function showAllRooms() {
    document.querySelectorAll('.room-card').forEach(card => {
        card.classList.remove('hidden');
    });
    console.log('✅ [Dashboard] All rooms shown');
}

// ✅ Helper: Show rooms by jenjang ONLY
function showRoomsByJenjang(jenjang) {
    // Hide ALL room cards first
    document.querySelectorAll('.room-card').forEach(card => {
        card.classList.add('hidden');
    });
    
    // Show only the matching jenjang room
    const targetRoom = document.querySelector(`.room-${jenjang}`);
    if (targetRoom) {
        targetRoom.classList.remove('hidden');
        console.log(`✅ [Dashboard] Shown: room-${jenjang}`);
    }
    
    // ALWAYS show these rooms for all APPROVED users:
    const alwaysVisible = ['adm-kelas', 'adm-pembelajaran', 'penilaian', 'refleksi', 'generator-modul'];
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
console.log('   • showSection(sectionId)');
console.log('   • backToDashboard()');
console.log('   • loadSemester(jenjang, kelas)');
console.log('   • logout() ← UPDATED with cache fix!');
console.log('   • initKelasCards(jenjang)');
console.log('🚀 READY TO USE!');
