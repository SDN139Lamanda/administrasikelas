/**
 * ============================================
 * DASHBOARD LOGIC - dashboard.js
 * Platform Administrasi Kelas Digital
 * ============================================
 * 
 * ✅ UPDATE: Tambah feature-level access control
 */

console.log('📦 dashboard.js loaded');

// ============================================
// INIT: Wait for DOM ready
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Dashboard DOM Ready');
    loadUserContext();
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
        
        // ✅ NEW: Filter rooms based on features ⭐
        filterRoomsByFeatures(currentUser);
        
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
    
    // Admin sees all
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (currentUser?.role === 'admin') {
        document.querySelectorAll('.room-sd, .room-smp, .room-sma').forEach(room => {
            room.classList.remove('hidden');
        });
    }
}

// ============================================
// ✅ FUNGSI BARU: Check Feature Access ⭐
// ============================================
function hasFeatureAccess(featureName, user) {
    console.log('🔍 Check feature access:', featureName, user.features);
    
    // ✅ Admin akses semua fitur
    if (user.role === 'admin') {
        console.log('✅ Admin - full access');
        return true;
    }
    
    // ✅ Jika user TIDAK punya features field → akses semua
    if (!user.features || user.features === 'all') {
        console.log('✅ No features field - full access');
        return true;
    }
    
    // ✅ Jika user punya features array → check access
    if (Array.isArray(user.features)) {
        const hasAccess = user.features.includes(featureName);
        console.log(hasAccess ? `✅ Has access: ${featureName}` : `❌ No access: ${featureName}`);
        return hasAccess;
    }
    
    // ✅ Default: akses semua
    return true;
}

// ============================================
// ✅ FUNGSI BARU: Filter Rooms By Features ⭐
// ============================================
function filterRoomsByFeatures(user) {
    console.log('🔍 Filtering rooms by features...');
    
    const featureMapping = [
        { selector: '.room-adm-kelas', feature: 'adm-kelas' },
        { selector: '.room-adm-pembelajaran', feature: 'adm-pembelajaran' },
        { selector: '.room-penilaian', feature: 'penilaian' },
        { selector: '.room-refleksi', feature: 'refleksi' },
        { selector: '.room-generator-modul', feature: 'generator-modul' }
    ];
    
    featureMapping.forEach(mapping => {
        const element = document.querySelector(mapping.selector);
        if (element) {
            if (hasFeatureAccess(mapping.feature, user)) {
                element.classList.remove('hidden');
                console.log(`✅ Show: ${mapping.selector}`);
            } else {
                element.classList.add('hidden');
                console.log(`❌ Hide: ${mapping.selector}`);
            }
        }
    });
}

// ============================================
// FUNGSI: Back to Dashboard
// ============================================
window.backToDashboard = () => {
    console.log('🏠 Back to dashboard');
    
    document.querySelectorAll('.section').forEach(section => {
        if (!section.classList.contains('bg-gray-50')) {
            section.classList.add('hidden');
        }
    });
    
    document.querySelector('.dashboard-hero').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ============================================
// FUNGSI: Logout
// ============================================
window.logout = async () => {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
        try {
            sessionStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        } catch (error) {
            console.error('❌ Logout error:', error);
            alert('Gagal logout: ' + error.message);
        }
    }
};
