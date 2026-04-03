/**
 * ============================================
 * DASHBOARD LOGIC - Platform Administrasi Kelas
 * ============================================
 * Fungsi:
 * - User context & authentication check
 * - Navigation between sections
 * - Module integration support
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
        // Import Firebase auth
        const { auth, onAuthStateChanged } = await import('../modules/firebase-config.js');
        
        onAuthStateChanged(auth, (user) => {
            if (user) {
                // User is logged in
                document.getElementById('userEmail').textContent = user.email;
                document.getElementById('userAvatar').src = user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'User'}&background=7c3aed&color=fff`;
                document.getElementById('userContextText').textContent = user.displayName || user.email;
                
                console.log('✅ [Dashboard] User logged in:', user.email);
            } else {
                // User is not logged in - redirect to login
                console.warn('⚠️ [Dashboard] User not logged in, redirecting to login...');
                window.location.href = 'index.html';
            }
        });
    } catch (error) {
        console.error('❌ [Dashboard] Auth check error:', error);
        // Fallback: show loading state
        document.getElementById('userEmail').textContent = 'Guest';
        document.getElementById('userContextText').textContent = 'Loading...';
    }
}

// ============================================
// ROOM CARD VISIBILITY (Based on User Role)
// ============================================

function initRoomCards() {
    // Show/hide SD/SMP/SMA based on user assignment
    // For now, show all (can be customized later)
    
    const userRole = 'guru'; // Default role (can be fetched from Firebase)
    
    if (userRole === 'guru') {
        // Show all rooms for teachers
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
 * Navigate to SD/SMP/SMA section
 * @param {string} jenjang - 'sd', 'smp', or 'sma'
 */
window.navigateToJenjang = function(jenjang) {
    console.log('📂 [Dashboard] Navigate to:', jenjang);
    
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        if (section.id !== 'rooms-heading') {
            section.classList.add('hidden');
        }
    });
    
    // Show target section
    const targetSection = document.getElementById(`${jenjang}-section`);
    if (targetSection) {
        targetSection.classList.remove('hidden');
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Hide welcome section
    const heroSection = document.querySelector('.dashboard-hero');
    if (heroSection) {
        heroSection.parentElement.classList.add('hidden');
    }
};

/**
 * Back to main dashboard
 */
window.backToDashboard = function() {
    console.log('🏠 [Dashboard] Back to dashboard');
    
    // Show all room cards
    document.querySelectorAll('.room-card').forEach(card => {
        card.closest('.section')?.classList.remove('hidden');
    });
    
    // Show welcome section
    const heroSection = document.querySelector('.dashboard-hero');
    if (heroSection) {
        heroSection.parentElement.classList.remove('hidden');
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
 * @param {string} jenjang - 'sd', 'smp', or 'sma'
 * @param {string} kelas - Class number (1-12)
 */
window.loadSemester = function(jenjang, kelas) {
    console.log('📚 [Dashboard] Load semester:', jenjang, 'Kelas', kelas);
    
    // This function is handled by jenjang-classes.js module
    // Keep this as placeholder for compatibility
};

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === 'javascript:void(0)') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
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
// UTILITY FUNCTIONS
// ============================================

/**
 * Show/hide element by ID
 * @param {string} elementId - Element ID to toggle
 * @param {boolean} show - true to show, false to hide
 */
window.toggleElement = function(elementId, show = true) {
    const element = document.getElementById(elementId);
    if (element) {
        if (show) {
            element.classList.remove('hidden');
        } else {
            element.classList.add('hidden');
        }
    }
};

/**
 * Get URL parameter
 * @param {string} param - Parameter name
 * @returns {string|null} Parameter value
 */
function getUrlParameter(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// ============================================
// CONFIRM MODULE LOADED
// ============================================

console.log('🟢 [Dashboard] window.backToDashboard:', typeof window.backToDashboard);
console.log('🟢 [Dashboard] window.loadSemester:', typeof window.loadSemester);
console.log('🟢 [Dashboard] window.logout:', typeof window.logout);
console.log('🟢 [Dashboard] Module FINISHED - Ready to use!');
