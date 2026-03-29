/**
 * ============================================
 * MODULE: SD CLASSES (TRUE MODULAR)
 * Platform Administrasi Kelas Digital
 * ============================================
 * 
 * ✅ ZERO CHANGE ke dashboard.html & dashboard.js
 * ✅ Module handle semua logic sendiri
 * ✅ Self-contained & independent
 * 
 * Flow:
 * 1. User klik Kelas 1-6 di SD Section
 * 2. Module intercept click event
 * 3. Module render mata pelajaran di module-container
 * 4. User bisa kembali ke SD Section
 */

// ✅ IMPORT SHARED DEPENDENCIES
import { db, auth } from './config-firebase.js';
import { 
    collection, 
    getDocs, 
    query, 
    where 
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

// ✅ MATA PELAJARAN SD (KURIKULUM MERDEKA)
const MAPEL_SD = {
    '1': [
        { id: 'bahasa-indonesia', name: 'Bahasa Indonesia', icon: 'fa-book', color: 'from-red-500 to-red-600' },
        { id: 'matematika', name: 'Matematika', icon: 'fa-calculator', color: 'from-blue-500 to-blue-600' },
        { id: 'ppkn', name: 'PPKn', icon: 'fa-flag', color: 'from-yellow-500 to-yellow-600' },
        { id: 'ipas', name: 'IPAS', icon: 'fa-flask', color: 'from-green-500 to-green-600' },
        { id: 'seni-budaya', name: 'Seni & Budaya', icon: 'fa-palette', color: 'from-purple-500 to-purple-600' },
        { id: 'pjok', name: 'PJOK', icon: 'fa-running', color: 'from-orange-500 to-orange-600' }
    ],
    '2': [
        { id: 'bahasa-indonesia', name: 'Bahasa Indonesia', icon: 'fa-book', color: 'from-red-500 to-red-600' },
        { id: 'matematika', name: 'Matematika', icon: 'fa-calculator', color: 'from-blue-500 to-blue-600' },
        { id: 'ppkn', name: 'PPKn', icon: 'fa-flag', color: 'from-yellow-500 to-yellow-600' },
        { id: 'ipas', name: 'IPAS', icon: 'fa-flask', color: 'from-green-500 to-green-600' },
        { id: 'seni-budaya', name: 'Seni & Budaya', icon: 'fa-palette', color: 'from-purple-500 to-purple-600' },
        { id: 'pjok', name: 'PJOK', icon: 'fa-running', color: 'from-orange-500 to-orange-600' }
    ],
    '3': [
        { id: 'bahasa-indonesia', name: 'Bahasa Indonesia', icon: 'fa-book', color: 'from-red-500 to-red-600' },
        { id: 'matematika', name: 'Matematika', icon: 'fa-calculator', color: 'from-blue-500 to-blue-600' },
        { id: 'ppkn', name: 'PPKn', icon: 'fa-flag', color: 'from-yellow-500 to-yellow-600' },
        { id: 'ipas', name: 'IPAS', icon: 'fa-flask', color: 'from-green-500 to-green-600' },
        { id: 'seni-budaya', name: 'Seni & Budaya', icon: 'fa-palette', color: 'from-purple-500 to-purple-600' },
        { id: 'pjok', name: 'PJOK', icon: 'fa-running', color: 'from-orange-500 to-orange-600' },
        { id: 'bahasa-inggris', name: 'Bahasa Inggris', icon: 'fa-language', color: 'from-pink-500 to-pink-600' },
        { id: 'informatika', name: 'Informatika', icon: 'fa-laptop', color: 'from-gray-500 to-gray-600' }
    ],
    '4': [
        { id: 'bahasa-indonesia', name: 'Bahasa Indonesia', icon: 'fa-book', color: 'from-red-500 to-red-600' },
        { id: 'matematika', name: 'Matematika', icon: 'fa-calculator', color: 'from-blue-500 to-blue-600' },
        { id: 'ppkn', name: 'PPKn', icon: 'fa-flag', color: 'from-yellow-500 to-yellow-600' },
        { id: 'ipas', name: 'IPAS', icon: 'fa-flask', color: 'from-green-500 to-green-600' },
        { id: 'seni-budaya', name: 'Seni & Budaya', icon: 'fa-palette', color: 'from-purple-500 to-purple-600' },
        { id: 'pjok', name: 'PJOK', icon: 'fa-running', color: 'from-orange-500 to-orange-600' },
        { id: 'bahasa-inggris', name: 'Bahasa Inggris', icon: 'fa-language', color: 'from-pink-500 to-pink-600' },
        { id: 'informatika', name: 'Informatika', icon: 'fa-laptop', color: 'from-gray-500 to-gray-600' }
    ],
    '5': [
        { id: 'bahasa-indonesia', name: 'Bahasa Indonesia', icon: 'fa-book', color: 'from-red-500 to-red-600' },
        { id: 'matematika', name: 'Matematika', icon: 'fa-calculator', color: 'from-blue-500 to-blue-600' },
        { id: 'ppkn', name: 'PPKn', icon: 'fa-flag', color: 'from-yellow-500 to-yellow-600' },
        { id: 'ipas', name: 'IPAS', icon: 'fa-flask', color: 'from-green-500 to-green-600' },
        { id: 'seni-budaya', name: 'Seni & Budaya', icon: 'fa-palette', color: 'from-purple-500 to-purple-600' },
        { id: 'pjok', name: 'PJOK', icon: 'fa-running', color: 'from-orange-500 to-orange-600' },
        { id: 'bahasa-inggris', name: 'Bahasa Inggris', icon: 'fa-language', color: 'from-pink-500 to-pink-600' },
        { id: 'informatika', name: 'Informatika', icon: 'fa-laptop', color: 'from-gray-500 to-gray-600' }
    ],
    '6': [
        { id: 'bahasa-indonesia', name: 'Bahasa Indonesia', icon: 'fa-book', color: 'from-red-500 to-red-600' },
        { id: 'matematika', name: 'Matematika', icon: 'fa-calculator', color: 'from-blue-500 to-blue-600' },
        { id: 'ppkn', name: 'PPKn', icon: 'fa-flag', color: 'from-yellow-500 to-yellow-600' },
        { id: 'ipas', name: 'IPAS', icon: 'fa-flask', color: 'from-green-500 to-green-600' },
        { id: 'seni-budaya', name: 'Seni & Budaya', icon: 'fa-palette', color: 'from-purple-500 to-purple-600' },
        { id: 'pjok', name: 'PJOK', icon: 'fa-running', color: 'from-orange-500 to-orange-600' },
        { id: 'bahasa-inggris', name: 'Bahasa Inggris', icon: 'fa-language', color: 'from-pink-500 to-pink-600' },
        { id: 'informatika', name: 'Informatika', icon: 'fa-laptop', color: 'from-gray-500 to-gray-600' }
    ]
};

// ============================================
// FUNGSI: Load SD Mapel Section
// ============================================
window.loadSDMapel = (kelasId) => {
    console.log('📚 [SD Module] Load Mapel for Kelas:', kelasId);
    
    // Hide all sections (except module-container)
    document.querySelectorAll('.section').forEach(section => {
        if (section.id !== 'module-container') {
            section.classList.add('hidden');
        }
    });
    
    // Get mapel data for this kelas
    const mapelList = MAPEL_SD[kelasId] || [];
    
    if (mapelList.length === 0) {
        console.warn('⚠️ [SD Module] No mapel data for kelas:', kelasId);
        return;
    }
    
    // Get module container (SUDAH ADA di dashboard.html!)
    const container = document.getElementById('module-container');
    
    if (container) {
        // Render mapel section
        container.innerHTML = `
            <div class="container py-8">
                <div class="mapel-section bg-white p-6 rounded-lg shadow-lg">
                    <div class="section-header mb-6 border-b pb-4">
                        <h2 class="text-2xl font-bold text-gray-800">
                            <i class="fas fa-book-open mr-2 text-purple-600"></i>
                            Kelas ${kelasId} - Mata Pelajaran
                        </h2>
                        <p class="text-gray-600 mt-2">${mapelList.length} Mata Pelajaran</p>
                        <button onclick="backToSDClasses()" class="btn btn-ghost btn-sm mt-4">
                            <i class="fas fa-arrow-left mr-2"></i>Kembali ke SD
                        </button>
                    </div>
                    
                    <div class="mapel-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        ${mapelList.map(mapel => `
                            <article class="mapel-card bg-gradient-to-br ${mapel.color} to-white p-6 rounded-lg shadow hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1" 
                                     data-mapel="${mapel.id}"
                                     onclick="openSDMapelDetail('${mapel.id}', '${kelasId}')">
                                <div class="mapel-icon bg-white bg-opacity-30 text-white w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                                    <i class="fas ${mapel.icon} text-2xl"></i>
                                </div>
                                <h3 class="font-bold text-gray-800 mb-2">${mapel.name}</h3>
                                <p class="text-sm text-gray-600">6 Modul Ajar</p>
                            </article>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        container.classList.remove('hidden');
        console.log('✅ [SD Module] Mapel rendered for Kelas:', kelasId);
    }
};

// ============================================
// FUNGSI: Back to SD Classes
// ============================================
window.backToSDClasses = () => {
    console.log('🏠 [SD Module] Back to SD Classes');
    
    // Hide module container
    const container = document.getElementById('module-container');
    if (container) {
        container.classList.add('hidden');
        container.innerHTML = '';
    }
    
    // Show SD section
    const sdSection = document.getElementById('sd-section');
    if (sdSection) {
        sdSection.classList.remove('hidden');
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ============================================
// FUNGSI: Open Mapel Detail
// ============================================
window.openSDMapelDetail = (mapelId, kelasId) => {
    console.log('📖 [SD Module] Open Mapel Detail:', mapelId, 'Kelas:', kelasId);
    
    // Future: Navigate to modul ajar section
    // For now, show placeholder
    const mapelName = MAPEL_SD[kelasId]?.find(m => m.id === mapelId)?.name || mapelId;
    
    alert(`📚 ${mapelName} - Kelas ${kelasId}\n\nFitur detail akan segera hadir:\n• Modul Ajar\n• ATP (Alur Tujuan Pembelajaran)\n• CP (Capaian Pembelajaran)\n• Bahan Ajar\n• Asesmen`);
};

// ============================================
// INIT: Setup Kelas Card Handlers
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('📦 [SD Module] sd-classes.js loaded');
    
    // Wait for dashboard.js to finish loading
    setTimeout(() => {
        // Attach click handlers to kelas cards (DIRECT DOM QUERY!)
        const kelasCards = document.querySelectorAll('.kelas-card');
        console.log('🔍 [SD Module] Found kelas cards:', kelasCards.length);
        
        kelasCards.forEach(card => {
            const kelasLink = card.querySelector('.kelas-link');
            const kelasId = card.getAttribute('data-kelas');
            
            if (kelasLink && kelasId) {
                // Intercept click on kelas-link
                kelasLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🖱️ [SD Module] Kelas card clicked:', kelasId);
                    loadSDMapel(kelasId);
                });
                
                console.log('✅ [SD Module] Handler attached for Kelas:', kelasId);
            }
        });
        
        console.log('✅ [SD Module] All event handlers attached');
    }, 200); // Delay to ensure DOM is fully ready
});

// ============================================
// EXPORT (Optional - untuk module lain jika perlu)
// ============================================
export { loadSDMapel, MAPEL_SD };
