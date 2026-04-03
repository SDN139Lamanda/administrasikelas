/**
 * ============================================
 * DASHBOARD LOGIC - Platform Administrasi Kelas
 * ============================================
 */

console.log('🔴 [Dashboard] Script START');

// ============================================
// DOM READY INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('✅ [Dashboard] DOM Ready');
    
    // Check authentication status
    await checkAuthStatus();
    
    // Initialize room card visibility based on user role
    initRoomCards();
    
    // Initialize smooth scroll
    initSmoothScroll();
    
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
                console.warn('⚠️ [Dashboard] User not logged in, redirecting to login...');
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
    const userRole = 'guru';
    
    if (userRole === 'guru') {
        document.querySelectorAll('.room-card').forEach(card => {
            card.classList.remove('hidden');
        });
    }
    
    console.log('✅ [Dashboard] Room cards initialized');
}

// ============================================
// NAVIGATION FUNCTIONS
// ============================================

/**
 * ✅ Show section by ID (for SD/SMP/SMA clicks)
 */
window.showSection = function(sectionId) {
    console.log('📂 [Dashboard] showSection:', sectionId);
    
    // Hide welcome hero section
    const welcomeSection = document.querySelector('.dashboard-hero')?.parentElement;
    if (welcomeSection) {
        welcomeSection.classList.add('hidden');
    }
    
    // Hide all jenjang sections first
    document.querySelectorAll('#sd-section, #smp-section, #sma-section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        console.log('✅ [Dashboard] Section shown:', sectionId);
    } else {
        console.error('❌ [Dashboard] Section not found:', sectionId);
    }
};

/**
 * Navigate to SD/SMP/SMA section
 */
window.navigateToJenjang = function(jenjang) {
    console.log('📂 [Dashboard] Navigate to:', jenjang);
    window.showSection(`${jenjang}-section`);
};

/**
 * Back to main dashboard
 */
window.backToDashboard = function() {
    console.log('🏠 [Dashboard] Back to dashboard');
    
    // Show welcome section
    const welcomeSection = document.querySelector('.dashboard-hero')?.parentElement;
    if (welcomeSection) {
        welcomeSection.classList.remove('hidden');
    }
    
    // Hide jenjang sections
    document.querySelectorAll('#sd-section, #smp-section, #sma-section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Hide module containers
    document.getElementById('module-container')?.classList.add('hidden');
    document.getElementById('refleksi-container')?.classList.add('hidden');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

/**
 * Load semester view for specific class
 */
window.loadSemester = function(jenjang, kelas) {
    console.log('📚 [Dashboard] Load semester:', jenjang, 'Kelas', kelas);
};

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
// LOGOUT FUNCTION
// ============================================

window.logout = async function() {
    console.log('🚪 [Dashboard] Logout initiated');
    
    try {
        const { auth, signOut } = await import('../modules/firebase-config.js');
        await signOut(auth);
        console.log('✅ [Dashboard] Logout successful');
        window.location.href = 'index.html';
    } catch (error) {
        console.error('❌ [Dashboard] Logout error:', error);
        alert('Gagal logout. Silakan coba lagi.');
    }
};

// ============================================
// CONFIRM MODULE LOADED
// ============================================

console.log('🟢 [Dashboard] window.showSection:', typeof window.showSection);
console.log('🟢 [Dashboard] window.backToDashboard:', typeof window.backToDashboard);
console.log('🟢 [Dashboard] window.loadSemester:', typeof window.loadSemester);
console.log('🟢 [Dashboard] Module FINISHED - Ready to use!');
