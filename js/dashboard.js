/**
 * ============================================
 * DASHBOARD LOGIC - Platform Administrasi Kelas
 * VERSI: BULLETPROOF (Pasti Berfungsi!)
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

// Fungsi logout
window.logout = async function() {
    console.log('🚪 [Dashboard] logout DIPANGGIL');
    
    try {
        const { auth, signOut } = await import('../modules/firebase-config.js');
        await signOut(auth);
        console.log('✅ Logout successful');
        window.location.href = 'index.html';
    } catch (error) {
        console.error('❌ Logout error:', error);
        alert('Gagal logout. Silakan coba lagi.');
    }
};

console.log('🟢 [Dashboard] Global functions registered:');
console.log('   - window.showSection:', typeof window.showSection);
console.log('   - window.backToDashboard:', typeof window.backToDashboard);
console.log('   - window.loadSemester:', typeof window.loadSemester);
console.log('   - window.logout:', typeof window.logout);

// ============================================
// DOM READY INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('✅ [Dashboard] DOM Ready');
    
    // Check authentication status
    await checkAuthStatus();
    
    // Initialize room card visibility
    initRoomCards();
    
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
        
        onAuthStateChanged(auth, (user) => {
            if (user) {
                document.getElementById('userEmail').textContent = user.email;
                document.getElementById('userAvatar').src = user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'User'}&background=7c3aed&color=fff`;
                document.getElementById('userContextText').textContent = user.displayName || user.email;
                console.log('✅ [Dashboard] User logged in:', user.email);
            } else {
                console.warn('⚠️ [Dashboard] User not logged in, redirecting...');
                window.location.href = 'index.html';
            }
        });
    } catch (error) {
        console.error('❌ [Dashboard] Auth check error:', error);
        document.getElementById('userEmail').textContent = 'Guest';
        document.getElementById('userContextText').textContent = 'Loading...';
    }
}

// ============================================
// ROOM CARD VISIBILITY
// ============================================

function initRoomCards() {
    const userRole = 'guru'; // Default role
    
    if (userRole === 'guru') {
        document.querySelectorAll('.room-card').forEach(card => {
            card.classList.remove('hidden');
        });
    }
    
    console.log('✅ [Dashboard] Room cards initialized');
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
console.log('   • logout()');
console.log('🚀 READY TO USE!');
