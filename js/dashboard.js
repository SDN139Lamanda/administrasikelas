/**
 * ============================================
 * DASHBOARD LOGIC - dashboard.js
 * Platform Administrasi Kelas Digital
 * ============================================
 * 
 * Fungsi:
 * - Load user context from sessionStorage
 * - Filter rooms based on jenjang (SD/SMP/SMA)
 * - Navigate between rooms (sections)
 * - Back to dashboard functionality
 */

console.log('📦 dashboard.js loaded');

// ============================================
// INIT: Wait for DOM ready
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Dashboard DOM Ready');
    
    // Load user context
    loadUserContext();
    
    // Setup navigation
    setupNavigation();
});

// ============================================
// FUNGSI: Load User Context from Session
// ============================================
function loadUserContext() {
    try {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        
        if (!currentUser || !currentUser.uid) {
            console.warn('⚠️ No user session, redirect to login');
            window.location.href = 'login.html';
            return;
        }
        
        console.log('✅ User loaded:', currentUser.email);
        
        // Display user info
        document.getElementById('userEmail').textContent = currentUser.email;
        document.getElementById('userAvatar').src = `https://ui-avatars.com/api/?name=${currentUser.namaLengkap || currentUser.email}&background=7c3aed&color=fff`;
        
        // Display context badge
        const contextText = getUserContextText(currentUser);
        document.getElementById('userContextText').textContent = contextText;
        
        // Filter rooms based on jenjang
        filterRooms(currentUser.jenjang);
        
    } catch (error) {
        console.error('❌ Error loading user context:', error);
        window.location.href = 'login.html';
    }
}

// ============================================
// FUNGSI: Get User Context Text
// ============================================
function getUserContextText(user) {
    const { jenjang, kelas, mataPelajaran, sdRole, mataPelajaranSD, mataPelajaranSMP, mataPelajaranSMA } = user;
    
    if (jenjang === 'sd') {
        if (sdRole === 'guru_kelas') {
            return `Guru Kelas ${kelas} SD`;
        } else if (sdRole === 'guru_agama') {
            return `Guru Agama SD (${mataPelajaranSD})`;
        } else if (sdRole === 'guru_mapel') {
            return `Guru Mapel SD (${mataPelajaranSD})`;
        }
        return 'Guru SD';
    } else if (jenjang === 'smp') {
        return `Guru ${mataPelajaranSMP} SMP`;
    } else if (jenjang === 'sma') {
        return `Guru ${mataPelajaranSMA} SMA`;
    }
    
    return 'Guru';
}

// ============================================
// FUNGSI: Filter Rooms Based on Jenjang
// ============================================
function filterRooms(jenjang) {
    console.log('🔍 Filtering rooms for jenjang:', jenjang);
    
    // Hide all jenjang-specific rooms first
    document.querySelectorAll('.room-sd, .room-smp, .room-sma').forEach(room => {
        room.classList.add('hidden');
    });
    
    // Show relevant rooms
    if (jenjang === 'sd') {
        document.querySelectorAll('.room-sd').forEach(room => {
            room.classList.remove('hidden');
        });
    } else if (jenjang === 'smp') {
        document.querySelectorAll('.room-smp').forEach(room => {
            room.classList.remove('hidden');
        });
    } else if (jenjang === 'sma') {
        document.querySelectorAll('.room-sma').forEach(room => {
            room.classList.remove('hidden');
        });
    }
    
    // Admin sees all (if role === 'admin')
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (currentUser?.role === 'admin') {
        document.querySelectorAll('.room-sd, .room-smp, .room-sma').forEach(room => {
            room.classList.remove('hidden');
        });
    }
}

// ============================================
// FUNGSI: Setup Navigation
// ============================================
function setupNavigation() {
    // Handle room clicks
    document.querySelectorAll('.room-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                navigateToSection(href.substring(1));
            }
        });
    });
    
    // Handle kelas clicks
    document.querySelectorAll('.kelas-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                navigateToMapel(href.substring(1));
            }
        });
    });
}

// ============================================
// FUNGSI: Navigate to Section
// ============================================
function navigateToSection(sectionId) {
    console.log('🔗 Navigate to:', sectionId);
    
    // Hide dashboard hero
    document.querySelector('.dashboard-hero').classList.add('hidden');
    
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        if (!section.classList.contains('bg-gray-50')) { // Keep module container
            section.classList.add('hidden');
        }
    });
    
    // Show target section
    const target = document.getElementById(sectionId);
    if (target) {
        target.classList.remove('hidden');
        target.classList.add('active');
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// ============================================
// FUNGSI: Navigate to Mata Pelajaran
// ============================================
function navigateToMapel(mapelId) {
    console.log('🔗 Navigate to mapel:', mapelId);
    // Future: Load mata pelajaran content
    alert('Fitur Mata Pelajaran akan segera hadir!');
}

// ============================================
// FUNGSI: Back to Dashboard
// ============================================
window.backToDashboard = () => {
    console.log('🏠 Back to dashboard');
    
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        if (!section.classList.contains('bg-gray-50')) {
            section.classList.add('hidden');
        }
    });
    
    // Show dashboard hero
    document.querySelector('.dashboard-hero').classList.remove('hidden');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ============================================
// FUNGSI: Logout
// ============================================
window.logout = async () => {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
        try {
            // Clear session
            sessionStorage.removeItem('currentUser');
            
            // Redirect to login
            window.location.href = 'login.html';
        } catch (error) {
            console.error('❌ Logout error:', error);
            alert('Gagal logout: ' + error.message);
        }
    }
};
