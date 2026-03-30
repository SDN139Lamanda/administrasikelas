/**
 * ============================================
 * MODULE: SD CLASSES
 * Platform Administrasi Kelas Digital
 * ============================================
 * 
 * Flow:
 * 1. User klik Kelas 1-6 di SD Section
 * 2. Module tampilkan mata pelajaran (Kurikulum Merdeka)
 * 3. User bisa kembali ke SD Section
 * 
 * ✅ Semua fungsi di window object (untuk onclick HTML)
 * ✅ Zero dependency ke dashboard.js
 * ✅ True modular architecture
 */

console.log('🔴 [SD Module] Script START');

// ============================================
// MATA PELAJARAN SD (KURIKULUM MERDEKA)
// ============================================
const MAPEL_SD = {
    // Fase A (Kelas 1-2) - 6 Mapel
    '1': [
        { id: 'bahasa-indonesia', name: 'Bahasa Indonesia', icon: 'fa-book', color: 'from-red-500 to-red-600' },
        { id: 'PAIBD', name: 'paibd', icon: 'fa-mosque', color: 'from-blue-500 to-blue-600' },
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
    // Fase B (Kelas 3-4) - 8 Mapel
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
    // Fase C (Kelas 5-6) - 8 Mapel
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
// FUNGSI 1: Load Mata Pelajaran (GLOBAL)
// ============================================
window.loadSDMapel = function(kelasId) {
    console.log('📚 [SD] Load Mapel untuk Kelas:', kelasId);
    
    // Sembunyikan semua section kecuali module-container
    document.querySelectorAll('.section').forEach(section => {
        if (section.id !== 'module-container') {
            section.classList.add('hidden');
        }
    });
    
    // Ambil data mapel untuk kelas ini
    const mapelList = MAPEL_SD[kelasId] || [];
    
    if (mapelList.length === 0) {
        console.warn('⚠️ [SD] Tidak ada mapel untuk kelas:', kelasId);
        alert('Maaf, data mata pelajaran untuk kelas ini belum tersedia.');
        return;
    }
    
    // Ambil container
    const container = document.getElementById('module-container');
    
    if (!container) {
        console.error('❌ [SD] Module container tidak ditemukan!');
        return;
    }
    
    // Render mata pelajaran
    container.innerHTML = `
        <div class="container py-8">
            <div class="mapel-section bg-white p-6 rounded-lg shadow-lg">
                <div class="section-header mb-6 border-b pb-4">
                    <h2 class="text-2xl font-bold text-gray-800">
                        <i class="fas fa-book-open mr-2 text-purple-600"></i>
                        Kelas ${kelasId} - Mata Pelajaran
                    </h2>
                    <p class="text-gray-600 mt-2">${mapelList.length} Mata Pelajaran (Kurikulum Merdeka)</p>
                    <button onclick="backToSDClasses()" class="btn btn-ghost btn-sm mt-4">
                        <i class="fas fa-arrow-left mr-2"></i>Kembali ke SD
                    </button>
                </div>
                
                <div class="mapel-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    ${mapelList.map(mapel => `
                        <article class="mapel-card bg-gradient-to-br ${mapel.color} to-white p-6 rounded-lg shadow hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1" 
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
    console.log('✅ [SD] Mapel berhasil ditampilkan untuk Kelas:', kelasId);
};

// ============================================
// FUNGSI 2: Kembali ke SD Section (GLOBAL)
// ============================================
window.backToSDClasses = function() {
    console.log('🏠 [SD] Kembali ke SD Classes');
    
    // Sembunyikan module container
    const container = document.getElementById('module-container');
    if (container) {
        container.classList.add('hidden');
        container.innerHTML = '';
    }
    
    // Tampilkan SD section
    const sdSection = document.getElementById('sd-section');
    if (sdSection) {
        sdSection.classList.remove('hidden');
    }
    
    // Scroll ke atas
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ============================================
// ✅ FUNGSI 3: Buka Detail Mapel (UPDATED) ⭐
// ============================================
window.openSDMapelDetail = function(mapelId, kelasId) {
    console.log('📖 [SD] Buka Detail Mapel:', mapelId, 'Kelas:', kelasId);
    
    // ✅ Jika mapel adalah Matematika, panggil module khusus
    if (mapelId === 'matematika') {
        if (typeof window.renderSDMatematika === 'function') {
            console.log('🧮 [SD] Calling renderSDMatematika...');
            window.renderSDMatematika(kelasId);
        } else {
            console.warn('⚠️ Module sd-matematika.js belum load');
            alert('⚠️ Module Matematika belum siap. Silakan refresh halaman.');
        }
        return; // ← PENTING! Stop disini, jangan lanjut ke alert
    }
    
    // Untuk mapel lain, tampilkan placeholder
    const mapelName = MAPEL_SD[kelasId]?.find(m => m.id === mapelId)?.name || mapelId;
    
    // Tampilkan detail (placeholder untuk sekarang)
    alert(`📚 ${mapelName} - Kelas ${kelasId}\n\n✅ Fitur yang akan tersedia:\n• Modul Ajar\n• ATP (Alur Tujuan Pembelajaran)\n• CP (Capaian Pembelajaran)\n• Bahan Ajar Digital\n• Asesmen & Rubrik\n• Video Pembelajaran`);
};

// ============================================
// CONFIRM: Functions Registered di Window
// ============================================
console.log('🟢 [SD] window.loadSDMapel:', typeof window.loadSDMapel);
console.log('🟢 [SD] window.backToSDClasses:', typeof window.backToSDClasses);
console.log('🟢 [SD] window.openSDMapelDetail:', typeof window.openSDMapelDetail);

// ============================================
// TEST COMMAND (Bisa dipanggil dari console)
// ============================================
console.log('💡 [SD] TEST: Ketik "window.loadSDMapel(\'1\')" di console untuk test');

console.log('🟢 [SD] Script FINISHED');

// ============================================
// EXPORT (Optional - untuk module lain)
// ============================================
export { MAPEL_SD };
