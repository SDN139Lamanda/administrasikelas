/**
 * ============================================
 * MODULE: JENJANG CLASSES (UNIFIED)
 * Platform Administrasi Kelas Digital
 * ============================================
 * 
 * ✅ Unified navigation untuk SD/SMP/SMA
 * ✅ Flow: Jenjang → Kelas → Semester → Mapel → Detail
 * ✅ Semua fungsi di window object (onclick compatible)
 * ✅ Zero dependency ke dashboard.js
 * ✅ True modular architecture
 */

console.log('🔴 [Jenjang Module] Script START');

// ============================================
// ✅ NEW: MATA PELAJARAN PER JENJANG (KURIKULUM MERDEKA)
// ============================================
const MAPEL_PER_JENJANG = {
    // ========== SD (Fase A/B/C) ==========
    'sd': {
        '1': { 
            fase: 'A', 
            mapel: [
                { id: 'bahasa-indonesia', name: 'Bahasa Indonesia', icon: 'fa-book', color: 'from-red-500 to-red-600' },
                { id: 'paibd', name: 'PAI/BD', icon: 'fa-mosque', color: 'from-emerald-500 to-emerald-600' },
                { id: 'matematika', name: 'Matematika', icon: 'fa-calculator', color: 'from-blue-500 to-blue-600' },
                { id: 'ppkn', name: 'PPKn', icon: 'fa-flag', color: 'from-yellow-500 to-yellow-600' },
                { id: 'ipas', name: 'IPAS', icon: 'fa-flask', color: 'from-green-500 to-green-600' },
                { id: 'seni-budaya', name: 'Seni & Budaya', icon: 'fa-palette', color: 'from-purple-500 to-purple-600' },
                { id: 'pjok', name: 'PJOK', icon: 'fa-running', color: 'from-orange-500 to-orange-600' }
            ]
        },
        '2': { 
            fase: 'A', 
            mapel: [
                { id: 'bahasa-indonesia', name: 'Bahasa Indonesia', icon: 'fa-book', color: 'from-red-500 to-red-600' },
                { id: 'paibd', name: 'PAI/BD', icon: 'fa-mosque', color: 'from-emerald-500 to-emerald-600' },
                { id: 'matematika', name: 'Matematika', icon: 'fa-calculator', color: 'from-blue-500 to-blue-600' },
                { id: 'ppkn', name: 'PPKn', icon: 'fa-flag', color: 'from-yellow-500 to-yellow-600' },
                { id: 'ipas', name: 'IPAS', icon: 'fa-flask', color: 'from-green-500 to-green-600' },
                { id: 'seni-budaya', name: 'Seni & Budaya', icon: 'fa-palette', color: 'from-purple-500 to-purple-600' },
                { id: 'pjok', name: 'PJOK', icon: 'fa-running', color: 'from-orange-500 to-orange-600' }
            ]
        },
        '3': { 
            fase: 'B', 
            mapel: [
                { id: 'bahasa-indonesia', name: 'Bahasa Indonesia', icon: 'fa-book', color: 'from-red-500 to-red-600' },
                { id: 'paibd', name: 'PAI/BD', icon: 'fa-mosque', color: 'from-emerald-500 to-emerald-600' },
                { id: 'matematika', name: 'Matematika', icon: 'fa-calculator', color: 'from-blue-500 to-blue-600' },
                { id: 'ppkn', name: 'PPKn', icon: 'fa-flag', color: 'from-yellow-500 to-yellow-600' },
                { id: 'ipas', name: 'IPAS', icon: 'fa-flask', color: 'from-green-500 to-green-600' },
                { id: 'seni-budaya', name: 'Seni & Budaya', icon: 'fa-palette', color: 'from-purple-500 to-purple-600' },
                { id: 'pjok', name: 'PJOK', icon: 'fa-running', color: 'from-orange-500 to-orange-600' },
                { id: 'bahasa-inggris', name: 'Bahasa Inggris', icon: 'fa-language', color: 'from-pink-500 to-pink-600' },
                { id: 'informatika', name: 'Informatika', icon: 'fa-laptop', color: 'from-gray-500 to-gray-600' }
            ]
        },
        '4': { 
            fase: 'B', 
            mapel: [
                { id: 'bahasa-indonesia', name: 'Bahasa Indonesia', icon: 'fa-book', color: 'from-red-500 to-red-600' },
                { id: 'paibd', name: 'PAI/BD', icon: 'fa-mosque', color: 'from-emerald-500 to-emerald-600' },
                { id: 'matematika', name: 'Matematika', icon: 'fa-calculator', color: 'from-blue-500 to-blue-600' },
                { id: 'ppkn', name: 'PPKn', icon: 'fa-flag', color: 'from-yellow-500 to-yellow-600' },
                { id: 'ipas', name: 'IPAS', icon: 'fa-flask', color: 'from-green-500 to-green-600' },
                { id: 'seni-budaya', name: 'Seni & Budaya', icon: 'fa-palette', color: 'from-purple-500 to-purple-600' },
                { id: 'pjok', name: 'PJOK', icon: 'fa-running', color: 'from-orange-500 to-orange-600' },
                { id: 'bahasa-inggris', name: 'Bahasa Inggris', icon: 'fa-language', color: 'from-pink-500 to-pink-600' },
                { id: 'informatika', name: 'Informatika', icon: 'fa-laptop', color: 'from-gray-500 to-gray-600' }
            ]
        },
        '5': { 
            fase: 'C', 
            mapel: [
                { id: 'bahasa-indonesia', name: 'Bahasa Indonesia', icon: 'fa-book', color: 'from-red-500 to-red-600' },
                { id: 'paibd', name: 'PAI/BD', icon: 'fa-mosque', color: 'from-emerald-500 to-emerald-600' },
                { id: 'matematika', name: 'Matematika', icon: 'fa-calculator', color: 'from-blue-500 to-blue-600' },
                { id: 'ppkn', name: 'PPKn', icon: 'fa-flag', color: 'from-yellow-500 to-yellow-600' },
                { id: 'ipas', name: 'IPAS', icon: 'fa-flask', color: 'from-green-500 to-green-600' },
                { id: 'seni-budaya', name: 'Seni & Budaya', icon: 'fa-palette', color: 'from-purple-500 to-purple-600' },
                { id: 'pjok', name: 'PJOK', icon: 'fa-running', color: 'from-orange-500 to-orange-600' },
                { id: 'bahasa-inggris', name: 'Bahasa Inggris', icon: 'fa-language', color: 'from-pink-500 to-pink-600' },
                { id: 'informatika', name: 'Informatika', icon: 'fa-laptop', color: 'from-gray-500 to-gray-600' }
            ]
        },
        '6': { 
            fase: 'C', 
            mapel: [
                { id: 'bahasa-indonesia', name: 'Bahasa Indonesia', icon: 'fa-book', color: 'from-red-500 to-red-600' },
                { id: 'paibd', name: 'PAI/BD', icon: 'fa-mosque', color: 'from-emerald-500 to-emerald-600' },
                { id: 'matematika', name: 'Matematika', icon: 'fa-calculator', color: 'from-blue-500 to-blue-600' },
                { id: 'ppkn', name: 'PPKn', icon: 'fa-flag', color: 'from-yellow-500 to-yellow-600' },
                { id: 'ipas', name: 'IPAS', icon: 'fa-flask', color: 'from-green-500 to-green-600' },
                { id: 'seni-budaya', name: 'Seni & Budaya', icon: 'fa-palette', color: 'from-purple-500 to-purple-600' },
                { id: 'pjok', name: 'PJOK', icon: 'fa-running', color: 'from-orange-500 to-orange-600' },
                { id: 'bahasa-inggris', name: 'Bahasa Inggris', icon: 'fa-language', color: 'from-pink-500 to-pink-600' },
                { id: 'informatika', name: 'Informatika', icon: 'fa-laptop', color: 'from-gray-500 to-gray-600' }
            ]
        }
    },
    
    // ========== SMP (Fase D) ==========
    'smp': {
        '7': { 
            fase: 'D', 
            mapel: [
                { id: 'bahasa-indonesia', name: 'Bahasa Indonesia', icon: 'fa-book', color: 'from-red-500 to-red-600' },
                { id: 'pai', name: 'Pendidikan Agama', icon: 'fa-mosque', color: 'from-emerald-500 to-emerald-600' },
                { id: 'matematika', name: 'Matematika', icon: 'fa-calculator', color: 'from-blue-500 to-blue-600' },
                { id: 'ipa', name: 'IPA', icon: 'fa-flask', color: 'from-green-500 to-green-600' },
                { id: 'ips', name: 'IPS', icon: 'fa-globe', color: 'from-yellow-500 to-yellow-600' },
                { id: 'ppkn', name: 'PPKn', icon: 'fa-flag', color: 'from-yellow-500 to-yellow-600' },
                { id: 'seni-budaya', name: 'Seni Budaya', icon: 'fa-palette', color: 'from-purple-500 to-purple-600' },
                { id: 'pjok', name: 'PJOK', icon: 'fa-running', color: 'from-orange-500 to-orange-600' },
                { id: 'bahasa-inggris', name: 'Bahasa Inggris', icon: 'fa-language', color: 'from-pink-500 to-pink-600' },
                { id: 'informatika', name: 'Informatika', icon: 'fa-laptop', color: 'from-gray-500 to-gray-600' },
                { id: 'prakarya', name: 'Prakarya', icon: 'fa-tools', color: 'from-amber-500 to-amber-600' }
            ]
        },
        '8': { fase: 'D', mapel: [] }, // Copy dari kelas 7
        '9': { fase: 'D', mapel: [] }  // Copy dari kelas 7
    },
    
    // ========== SMA (Fase E/F) ==========
    'sma': {
        '10': { 
            fase: 'E', 
            mapel: [
                { id: 'bahasa-indonesia', name: 'Bahasa Indonesia', icon: 'fa-book', color: 'from-red-500 to-red-600' },
                { id: 'pai', name: 'Pendidikan Agama', icon: 'fa-mosque', color: 'from-emerald-500 to-emerald-600' },
                { id: 'matematika', name: 'Matematika', icon: 'fa-calculator', color: 'from-blue-500 to-blue-600' },
                { id: 'fisika', name: 'Fisika', icon: 'fa-atom', color: 'from-cyan-500 to-cyan-600' },
                { id: 'kimia', name: 'Kimia', icon: 'fa-flask', color: 'from-green-500 to-green-600' },
                { id: 'biologi', name: 'Biologi', icon: 'fa-dna', color: 'from-emerald-500 to-emerald-600' },
                { id: 'sejarah', name: 'Sejarah', icon: 'fa-landmark', color: 'from-amber-500 to-amber-600' },
                { id: 'geografi', name: 'Geografi', icon: 'fa-globe-asia', color: 'from-teal-500 to-teal-600' },
                { id: 'ekonomi', name: 'Ekonomi', icon: 'fa-chart-line', color: 'from-indigo-500 to-indigo-600' },
                { id: 'ppkn', name: 'PPKn', icon: 'fa-flag', color: 'from-yellow-500 to-yellow-600' },
                { id: 'bahasa-inggris', name: 'Bahasa Inggris', icon: 'fa-language', color: 'from-pink-500 to-pink-600' }
            ]
        },
        '11': { fase: 'F', mapel: [] }, // Sesuaikan peminatan
        '12': { fase: 'F', mapel: [] }  // Sesuaikan peminatan
    }
};

// ============================================
// ✅ NEW: FUNGSI 1 - Load Semester (UNIFIED)
// ============================================
window.loadSemester = function(jenjang, kelasId) {
    console.log('📚 [Jenjang] Load Semester:', jenjang, 'Kelas:', kelasId);
    
    // Sembunyikan semua section kecuali module-container
    document.querySelectorAll('.section').forEach(section => {
        if (section.id !== 'module-container') {
            section.classList.add('hidden');
        }
    });
    
    // Simpan konteks di sessionStorage
    sessionStorage.setItem('selectedJenjang', jenjang);
    sessionStorage.setItem('selectedKelas', kelasId);
    
    // Ambil container
    const container = document.getElementById('module-container');
    if (!container) {
        console.error('❌ [Jenjang] Module container tidak ditemukan!');
        return;
    }
    
    // Render semester pilihan
    container.innerHTML = `
        <div class="container py-8">
            <div class="semester-section bg-white p-6 rounded-lg shadow-lg">
                <div class="section-header mb-6 border-b pb-4">
                    <h2 class="text-2xl font-bold text-gray-800">
                        <i class="fas fa-calendar-alt mr-2 text-purple-600"></i>
                        ${jenjang.toUpperCase()} Kelas ${kelasId} - Pilih Semester
                    </h2>
                    <p class="text-gray-600 mt-2">Pilih semester untuk melihat mata pelajaran</p>
                    <button onclick="backToJenjang('${jenjang}')" class="btn btn-ghost btn-sm mt-4">
                        <i class="fas fa-arrow-left mr-2"></i>Kembali
                    </button>
                </div>
                
                <div class="semester-grid grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
                    <!-- Semester 1 -->
                    <article class="semester-card bg-gradient-to-br from-blue-500 to-blue-600 p-8 rounded-lg shadow hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1 text-white" 
                             onclick="loadMapelBySemester('${jenjang}', '${kelasId}', '1')">
                        <div class="semester-icon bg-white bg-opacity-20 text-white w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                            <i class="fas fa-sun text-3xl"></i>
                        </div>
                        <h3 class="font-bold text-xl mb-2">Semester 1</h3>
                        <p class="text-blue-100">Ganjil</p>
                        <p class="text-sm text-blue-200 mt-2">8-12 Mata Pelajaran</p>
                    </article>
                    
                    <!-- Semester 2 -->
                    <article class="semester-card bg-gradient-to-br from-green-500 to-green-600 p-8 rounded-lg shadow hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1 text-white" 
                             onclick="loadMapelBySemester('${jenjang}', '${kelasId}', '2')">
                        <div class="semester-icon bg-white bg-opacity-20 text-white w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                            <i class="fas fa-cloud-sun text-3xl"></i>
                        </div>
                        <h3 class="font-bold text-xl mb-2">Semester 2</h3>
                        <p class="text-green-100">Genap</p>
                        <p class="text-sm text-green-200 mt-2">8-12 Mata Pelajaran</p>
                    </article>
                </div>
            </div>
        </div>
    `;
    
    container.classList.remove('hidden');
    console.log('✅ [Jenjang] Semester ditampilkan');
};

// ============================================
// ✅ NEW: FUNGSI 2 - Load Mapel by Semester (UNIFIED)
// ============================================
window.loadMapelBySemester = function(jenjang, kelasId, semesterId) {
    console.log('📚 [Jenjang] Load Mapel:', jenjang, 'Kelas:', kelasId, 'Semester:', semesterId);
    
    // Sembunyikan semua section kecuali module-container
    document.querySelectorAll('.section').forEach(section => {
        if (section.id !== 'module-container') {
            section.classList.add('hidden');
        }
    });
    
    // Simpan semester
    sessionStorage.setItem('selectedSemester', semesterId);
    
    // Ambil container
    const container = document.getElementById('module-container');
    if (!container) {
        console.error('❌ [Jenjang] Module container tidak ditemukan!');
        return;
    }
    
    // Ambil mapel dari data
    const jenjangData = MAPEL_PER_JENJANG[jenjang];
    const kelasData = jenjangData?.[kelasId];
    const mapelList = kelasData?.mapel || [];
    
    // Render mapel section
    container.innerHTML = `
        <div class="container py-8">
            <div class="mapel-section bg-white p-6 rounded-lg shadow-lg">
                <div class="section-header mb-6 border-b pb-4">
                    <h2 class="text-2xl font-bold text-gray-800">
                        <i class="fas fa-book-open mr-2 text-purple-600"></i>
                        ${jenjang.toUpperCase()} Kelas ${kelasId} - Semester ${semesterId}
                    </h2>
                    <p class="text-gray-600 mt-2">${mapelList.length} Mata Pelajaran (Kurikulum Merdeka)</p>
                    <div class="flex gap-2 mt-4">
                        <button onclick="loadSemester('${jenjang}', '${kelasId}')" class="btn btn-ghost btn-sm">
                            <i class="fas fa-arrow-left mr-2"></i>Kembali ke Semester
                        </button>
                        <button onclick="backToJenjang('${jenjang}')" class="btn btn-ghost btn-sm">
                            <i class="fas fa-home mr-2"></i>Dashboard
                        </button>
                    </div>
                </div>
                
                <div class="mapel-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    ${mapelList.map(mapel => `
                        <article class="mapel-card bg-gradient-to-br ${mapel.color} to-white p-6 rounded-lg shadow hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1" 
                                 onclick="openMapelDetail('${mapel.id}', '${jenjang}', '${kelasId}', '${semesterId}')">
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
    console.log('✅ [Jenjang] Mapel ditampilkan');
};

// ============================================
// ✅ UPDATED: FUNGSI 3 - Buka Detail Mapel (UNIFIED)
// ============================================
window.openMapelDetail = function(mapelId, jenjang, kelasId, semesterId) {
    console.log('📖 [Jenjang] Detail Mapel:', mapelId, jenjang, kelasId, semesterId);
    
    // ✅ Routing ke module spesifik berdasarkan jenjang + mapel
    const moduleName = `${jenjang}-${mapelId}`;
    const moduleFunction = `render${jenjang.toUpperCase()}${mapelId.charAt(0).toUpperCase() + mapelId.slice(1)}`;
    
    if (typeof window[moduleFunction] === 'function') {
        console.log(`🔗 [Jenjang] Calling ${moduleFunction}...`);
        window[moduleFunction](kelasId, semesterId);
    } else {
        // Fallback ke alert jika module belum ada
        const mapelName = MAPEL_PER_JENJANG[jenjang]?.[kelasId]?.mapel?.find(m => m.id === mapelId)?.name || mapelId;
        alert(`📚 ${mapelName} - ${jenjang.toUpperCase()} Kelas ${kelasId} - Semester ${semesterId}\n\n✅ Fitur yang akan tersedia:\n• Modul Ajar\n• ATP (Alur Tujuan Pembelajaran)\n• CP (Capaian Pembelajaran)\n• Bahan Ajar Digital\n• Asesmen & Rubrik\n• Video Pembelajaran`);
    }
};

// ============================================
// ✅ NEW: FUNGSI 4 - Back Navigation (UNIFIED)
// ============================================
window.backToJenjang = function(jenjang) {
    console.log('🏠 [Jenjang] Back to:', jenjang);
    
    const container = document.getElementById('module-container');
    if (container) {
        container.classList.add('hidden');
        container.innerHTML = '';
    }
    
    const jenjangSection = document.getElementById(`${jenjang}-section`);
    if (jenjangSection) {
        jenjangSection.classList.remove('hidden');
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ============================================
// ✅ BACKWARD COMPATIBILITY: Fungsi Lama (Deprecated)
// ============================================
// ⚠️ Fungsi ini tetap ada untuk kompatibilitas, tapi akan dihapus di versi berikutnya

window.loadSDMapel = function(kelasId) {
    console.warn('⚠️ [DEPRECATED] loadSDMapel() akan dihapus. Gunakan loadSemester("sd", kelasId)');
    window.loadSemester('sd', kelasId);
};

window.backToSDClasses = function() {
    console.warn('⚠️ [DEPRECATED] backToSDClasses() akan dihapus. Gunakan backToJenjang("sd")');
    window.backToJenjang('sd');
};

window.openSDMapelDetail = function(mapelId, kelasId) {
    console.warn('⚠️ [DEPRECATED] openSDMapelDetail() akan dihapus. Gunakan openMapelDetail(mapelId, "sd", kelasId, "1")');
    window.openMapelDetail(mapelId, 'sd', kelasId, '1');
};

// ============================================
// CONFIRM: Functions Registered di Window
// ============================================
console.log('🟢 [Jenjang] window.loadSemester:', typeof window.loadSemester);
console.log('🟢 [Jenjang] window.loadMapelBySemester:', typeof window.loadMapelBySemester);
console.log('🟢 [Jenjang] window.openMapelDetail:', typeof window.openMapelDetail);
console.log('🟢 [Jenjang] window.backToJenjang:', typeof window.backToJenjang);
console.log('🟢 [Jenjang] Script FINISHED');

// ============================================
// EXPORT (Optional - untuk module lain)
// ============================================
export { MAPEL_PER_JENJANG };
