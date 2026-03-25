// modules/asisten-modul.js
// Asisten Modul Ajar - Generator Modul Pembelajaran Kurikulum Merdeka
// SDN 139 LAMANDA

import { db } from '../config-firebase.js';
import { 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    deleteDoc, 
    query, 
    orderBy,
    where
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const collectionName = "modul-ajar";

// ============================================
// FUNGSI RENDER - Menghasilkan HTML Module
// ============================================
export function render() {
    const div = document.createElement('div');
    div.innerHTML = `
        <!-- Header Section -->
        <div class="mb-6">
            <div class="flex items-center gap-3 mb-2">
                <div class="p-3 bg-purple-100 rounded-xl">
                    <i class="fas fa-wand-magic-sparkles text-purple-600 text-2xl"></i>
                </div>
                <div>
                    <h2 class="text-2xl font-bold text-gray-800">Asisten Modul Ajar</h2>
                    <p class="text-gray-500 text-sm">Generator Modul Pembelajaran Kurikulum Merdeka</p>
                </div>
            </div>
        </div>

        <!-- Tab Navigation -->
        <div class="border-b border-gray-200 mb-6">
            <nav class="-mb-px flex space-x-8 overflow-x-auto">
                <button onclick="window.showTab('generator')" id="tab-generator" 
                    class="tab-button py-4 px-1 border-b-2 font-medium text-sm active border-purple-500 text-purple-600 whitespace-nowrap">
                    <i class="fas fa-pen-fancy mr-2"></i>Generator Modul
                </button>
                <button onclick="window.showTab('riwayat')" id="tab-riwayat" 
                    class="tab-button py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 whitespace-nowrap">
                    <i class="fas fa-history mr-2"></i>Riwayat Modul
                </button>
            </nav>
        </div>

        <!-- TAB CONTENT: GENERATOR -->
        <div id="content-generator" class="tab-content">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Form Input (Left Column) -->
                <div class="lg:col-span-1">
                    <div class="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                        <h3 class="font-bold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-sliders-h text-purple-600 mr-2"></i>
                            Parameter Modul
                        </h3>

                        <form id="formModul" class="space-y-4">
                            <!-- Identitas -->
                            <div class="space-y-3">
                                <h4 class="text-sm font-semibold text-gray-700 border-b pb-2">📋 Identitas Modul</h4>
                                
                                <div>
                                    <label class="block text-gray-700 text-xs font-bold mb-1">Nama Penyusun *</label>
                                    <input type="text" id="namaPenyusun" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-purple-500 text-sm" 
                                        placeholder="Nama guru" required>
                                </div>
                                
                                <div>
                                    <label class="block text-gray-700 text-xs font-bold mb-1">Nama Sekolah *</label>
                                    <input type="text" id="namaSekolah" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-purple-500 text-sm" 
                                        value="SDN 139 LAMANDA" required>
                                </div>
                            </div>

                            <!-- Informasi -->
                            <div class="space-y-3">
                                <h4 class="text-sm font-semibold text-gray-700 border-b pb-2">📚 Informasi Pembelajaran</h4>
                                
                                <div>
                                    <label class="block text-gray-700 text-xs font-bold mb-1">Mata Pelajaran *</label>
                                    <select id="mapel" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-purple-500 text-sm" required>
                                        <option value="">Pilih Mapel</option>
                                        <option value="Matematika">Matematika</option>
                                        <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                                        <option value="IPA">IPA (Sains)</option>
                                        <option value="IPS">IPS</option>
                                        <option value="Pendidikan Pancasila">Pendidikan Pancasila</option>
                                        <option value="PJOK">PJOK</option>
                                        <option value="Seni Budaya">Seni Budaya</option>
                                        <option value="Bahasa Inggris">Bahasa Inggris</option>
                                    </select>
                                </div>

                                <div>
                                    <label class="block text-gray-700 text-xs font-bold mb-1">Kelas / Fase *</label>
                                    <select id="kelasFase" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-purple-500 text-sm" required>
                                        <option value="">Pilih Kelas</option>
                                        <option value="1-A">Kelas 1 (Fase A)</option>
                                        <option value="2-A">Kelas 2 (Fase A)</option>
                                        <option value="3-B">Kelas 3 (Fase B)</option>
                                        <option value="4-B">Kelas 4 (Fase B)</option>
                                        <option value="5-C">Kelas 5 (Fase C)</option>
                                        <option value="6-C">Kelas 6 (Fase C)</option>
                                    </select>
                                </div>

                                <div>
                                    <label class="block text-gray-700 text-xs font-bold mb-1">Alokasi Waktu *</label>
                                    <input type="text" id="alokasiWaktu" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-purple-500 text-sm" 
                                        placeholder="Contoh: 2 x 35 menit" value="2 x 35 menit" required>
                                </div>

                                <div>
                                    <label class="block text-gray-700 text-xs font-bold mb-1">Tahun Pelajaran</label>
                                    <input type="text" id="tahunPelajaran" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-purple-500 text-sm" 
                                        value="2025/2026">
                                </div>
                            </div>

                            <!-- Konten -->
                            <div class="space-y-3">
                                <h4 class="text-sm font-semibold text-gray-700 border-b pb-2">📝 Konten Pembelajaran</h4>
                                
                                <div>
                                    <label class="block text-gray-700 text-xs font-bold mb-1">Topik / Materi *</label>
                                    <input type="text" id="topik" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-purple-500 text-sm" 
                                        placeholder="Contoh: Pecahan Sederhana" required>
                                </div>

                                <div>
                                    <label class="block text-gray-700 text-xs font-bold mb-1">Capaian Pembelajaran (CP) *</label>
                                    <textarea id="capaianPembelajaran" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-purple-500 text-sm h-20" 
                                        placeholder="Salin CP dari dokumen kurikulum..." required></textarea>
                                    <p class="text-xs text-gray-500 mt-1">Dapat diisi manual atau biarkan kosong untuk auto-generate</p>
                                </div>

                                <div>
                                    <label class="block text-gray-700 text-xs font-bold mb-1">Tujuan Pembelajaran *</label>
                                    <textarea id="tujuanPembelajaran" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-purple-500 text-sm h-20" 
                                        placeholder="Setelah pembelajaran, siswa dapat..." required></textarea>
                                </div>

                                <div>
                                    <label class="block text-gray-700 text-xs font-bold mb-1">Profil Pelajar Pancasila</label>
                                    <select id="profilPancasila" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-purple-500 text-sm" multiple>
                                        <option value="Beriman">Beriman, Bertakwa kepada Tuhan YME</option>
                                        <option value="Berkebinekaan">Berkebinekaan Global</option>
                                        <option value="Bergotong-royong">Bergotong Royong</option>
                                        <option value="Mandiri">Mandiri</option>
                                        <option value="Bernalar Kritis">Bernalar Kritis</option>
                                        <option value="Kreatif">Kreatif</option>
                                    </select>
                                    <p class="text-xs text-gray-500 mt-1">Tahan Ctrl untuk pilih multiple</p>
                                </div>

                                <div>
                                    <label class="block text-gray-700 text-xs font-bold mb-1">Model Pembelajaran</label>
                                    <select id="modelPembelajaran" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-purple-500 text-sm">
                                        <option value="Tatap Muka">Tatap Muka</option>
                                        <option value="Blended Learning">Blended Learning</option>
                                        <option value="Daring">Daring (Online)</option>
                                        <option value="Luring">Luring (Offline)</option>
                                    </select>
                                </div>

                                <div>
                                    <label class="block text-gray-700 text-xs font-bold mb-1">Media & Sumber Belajar</label>
                                    <textarea id="mediaPembelajaran" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-purple-500 text-sm h-16" 
                                        placeholder="Contoh: PPT, Video, LKPD, Buku Siswa..."></textarea>
                                </div>
                            </div>

                            <!-- Action Buttons -->
                            <div class="pt-4 space-y-2">
                                <button type="button" onclick="window.generateModul()" class="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2">
                                    <i class="fas fa-wand-magic-sparkles"></i> Generate Modul Ajar
                                </button>
                                <button type="button" onclick="window.resetForm()" class="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm transition">
                                    <i class="fas fa-undo"></i> Reset Form
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Preview (Right Column) -->
                <div class="lg:col-span-2">
                    <!-- Empty State -->
                    <div id="emptyPreview" class="bg-white rounded-lg shadow-sm p-12 text-center">
                        <i class="fas fa-file-circle-plus text-6xl text-gray-300 mb-4"></i>
                        <h3 class="text-xl font-semibold text-gray-600 mb-2">Belum Ada Modul</h3>
                        <p class="text-gray-500">Isi form di sebelah kiri dan klik "Generate Modul Ajar"</p>
                    </div>

                    <!-- Loading State -->
                    <div id="loadingPreview" class="hidden bg-white rounded-lg shadow-sm p-12 text-center">
                        <i class="fas fa-spinner fa-spin text-4xl text-purple-500 mb-4"></i>
                        <h3 class="text-xl font-semibold text-gray-600 mb-2">Menyusun Modul Ajar...</h3>
                        <p class="text-gray-500">AI sedang menganalisis parameter Anda</p>
                    </div>

                    <!-- Preview Content -->
                    <div id="previewContent" class="hidden">
                        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
                            <!-- Preview Header -->
                            <div class="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <h2 class="text-2xl font-bold mb-1">MODUL AJAR</h2>
                                        <p class="text-purple-100" id="previewTopik">Topik Pembelajaran</p>
                                    </div>
                                    <div class="flex gap-2">
                                        <button onclick="window.copyModul()" class="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1 transition">
                                            <i class="fas fa-copy"></i> Copy
                                        </button>
                                        <button onclick="window.downloadWord()" class="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1 transition">
                                            <i class="fas fa-file-word"></i> Word
                                        </button>
                                        <button onclick="window.downloadPDF()" class="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1 transition">
                                            <i class="fas fa-file-pdf"></i> PDF
                                        </button>
                                        <button onclick="window.saveToFirebase()" class="bg-green-500/80 hover:bg-green-500 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1 transition">
                                            <i class="fas fa-save"></i> Simpan
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- Preview Body -->
                            <div id="modulBody" class="p-6 prose prose-sm max-w-none">
                                <!-- Content will be generated here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- TAB CONTENT: RIWAYAT -->
        <div id="content-riwayat" class="tab-content hidden">
            <div class="bg-white rounded-lg shadow-sm p-6">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-lg font-bold text-gray-800">Riwayat Modul Ajar</h3>
                    <button onclick="window.loadRiwayat()" class="bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                        <i class="fas fa-sync-alt"></i> Refresh
                    </button>
                </div>

                <div id="loadingRiwayat" class="text-center py-8">
                    <i class="fas fa-spinner fa-spin text-3xl text-purple-500"></i>
                    <p class="text-gray-500 mt-2">Memuat riwayat...</p>
                </div>

                <div id="gridRiwayat" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 hidden">
                    <!-- Cards will be rendered here -->
                </div>

                <div id="emptyRiwayat" class="text-center py-8 hidden">
                    <i class="fas fa-inbox text-4xl text-gray-300 mb-3"></i>
                    <p class="text-gray-500">Belum ada modul yang disimpan</p>
                </div>
            </div>
        </div>
    `;

    setTimeout(() => initModule(), 0);
    return div;
}

// ============================================
// FUNGSI INIT - Mengaktifkan Logic Module
// ============================================
async function initModule() {
    const formModul = document.getElementById('formModul');
    const emptyPreview = document.getElementById('emptyPreview');
    const loadingPreview = document.getElementById('loadingPreview');
    const previewContent = document.getElementById('previewContent');
    const modulBody = document.getElementById('modulBody');
    const previewTopik = document.getElementById('previewTopik');

    // --- FUNGSI TAB ---
    window.showTab = (tabName) => {
        document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active', 'border-purple-500', 'text-purple-600');
            btn.classList.add('border-transparent', 'text-gray-500');
        });
        document.getElementById(`content-${tabName}`).classList.remove('hidden');
        document.getElementById(`tab-${tabName}`).classList.add('active', 'border-purple-500', 'text-purple-600');
        document.getElementById(`tab-${tabName}`).classList.remove('border-transparent', 'text-gray-500');

        if (tabName === 'riwayat') {
            loadRiwayat();
        }
    }

    // --- FUNGSI RESET FORM ---
    window.resetForm = () => {
        formModul.reset();
        document.getElementById('namaSekolah').value = 'SDN 139 LAMANDA';
        document.getElementById('tahunPelajaran').value = '2025/2026';
        document.getElementById('alokasiWaktu').value = '2 x 35 menit';
        emptyPreview.classList.remove('hidden');
        previewContent.classList.add('hidden');
    }

    // ============================================
    // 🔹 GENERATOR MODUL AJAR (COMPLEX)
    // ============================================

    window.generateModul = () => {
        // Get all form values
        const data = {
            namaPenyusun: document.getElementById('namaPenyusun').value.trim(),
            namaSekolah: document.getElementById('namaSekolah').value.trim(),
            mapel: document.getElementById('mapel').value,
            kelasFase: document.getElementById('kelasFase').value,
            alokasiWaktu: document.getElementById('alokasiWaktu').value.trim(),
            tahunPelajaran: document.getElementById('tahunPelajaran').value.trim(),
            topik: document.getElementById('topik').value.trim(),
            capaianPembelajaran: document.getElementById('capaianPembelajaran').value.trim(),
            tujuanPembelajaran: document.getElementById('tujuanPembelajaran').value.trim(),
            profilPancasila: Array.from(document.getElementById('profilPancasila').selectedOptions).map(opt => opt.value),
            modelPembelajaran: document.getElementById('modelPembelajaran').value,
            mediaPembelajaran: document.getElementById('mediaPembelajaran').value.trim()
        };

        // Validation
        const required = ['namaPenyusun', 'namaSekolah', 'mapel', 'kelasFase', 'alokasiWaktu', 'topik', 'tujuanPembelajaran'];
        const missing = required.filter(field => !data[field]);

        if (missing.length > 0) {
            alert('⚠️ Mohon lengkapi field bertanda *');
            return;
        }

        // Show loading
        emptyPreview.classList.add('hidden');
        previewContent.classList.add('hidden');
        loadingPreview.classList.remove('hidden');

        // Simulate AI processing
        setTimeout(() => {
            const modulHTML = createComplexModulTemplate(data);
            modulBody.innerHTML = modulHTML;
            previewTopik.textContent = `${data.topik} - ${data.mapel} Kelas ${data.kelasFase.split('-')[0]}`;

            loadingPreview.classList.add('hidden');
            previewContent.classList.remove('hidden');

            // Store for later use
            window.currentModulData = data;
            window.currentModulHTML = modulHTML;

            // Scroll to preview
            previewContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 2000);
    }

    // ============================================
    // COMPLEX MODUL TEMPLATE GENERATOR
    // ============================================
    function createComplexModulTemplate(data) {
        const { 
            namaPenyusun, namaSekolah, mapel, kelasFase, alokasiWaktu, tahunPelajaran,
            topik, capaianPembelajaran, tujuanPembelajaran, profilPancasila, 
            modelPembelajaran, mediaPembelajaran 
        } = data;

        const kelas = kelasFase.split('-')[0];
        const fase = kelasFase.split('-')[1];
        const tanggal = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        // Generate components
        const cpContent = capaianPembelajaran || generateCapaianPembelajaran(mapel, kelas);
        const langkahContent = generateLangkahPembelajaranDetail(kelas, topik, mapel, modelPembelajaran);
        const asesmenContent = generateAsesmenDetail(kelas, topik, mapel);
        const profilContent = generateProfilPancasilaSection(profilPancasila, topik);
        const mediaContent = mediaPembelajaran || generateMediaPembelajaran(mapel, kelas);

        return `
            <!-- COVER -->
            <div class="border-b-2 border-purple-600 pb-6 mb-6 text-center">
                <div class="flex justify-center mb-4">
                    <div class="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
                        <i class="fas fa-graduation-cap text-4xl text-purple-600"></i>
                    </div>
                </div>
                <h1 class="text-2xl font-bold text-gray-900 mb-2">MODUL AJAR</h1>
                <h2 class="text-xl text-purple-600 font-semibold mb-4">${topik.toUpperCase()}</h2>
                <div class="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-600 max-w-2xl mx-auto">
                    <p><strong>Mata Pelajaran:</strong> ${mapel}</p>
                    <p><strong>Kelas/Fase:</strong> Kelas ${kelas} / Fase ${fase}</p>
                    <p><strong>Alokasi Waktu:</strong> ${alokasiWaktu}</p>
                    <p><strong>Tahun Pelajaran:</strong> ${tahunPelajaran}</p>
                    <p><strong>Sekolah:</strong> ${namaSekolah}</p>
                    <p><strong>Penyusun:</strong> ${namaPenyusun}</p>
                </div>
                <p class="text-xs text-gray-500 mt-4">Generated: ${tanggal}</p>
            </div>

            <!-- A. INFORMASI UMUM -->
            <div class="mb-6">
                <h3 class="font-bold text-lg text-gray-900 mb-3 flex items-center">
                    <span class="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm mr-3">A</span>
                    INFORMASI UMUM
                </h3>
                <div class="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                    <div class="grid grid-cols-3 gap-2">
                        <p class="text-gray-600"><strong>Kompetensi Awal:</strong></p>
                        <p class="col-span-2 text-gray-700">${generateKompetensiAwal(kelas, mapel)}</p>
                    </div>
                    <div class="grid grid-cols-3 gap-2">
                        <p class="text-gray-600"><strong>Profil Pelajar Pancasila:</strong></p>
                        <p class="col-span-2 text-gray-700">${profilPancasila.join(', ') || 'Bernalar Kritis, Kreatif, Mandiri'}</p>
                    </div>
                    <div class="grid grid-cols-3 gap-2">
                        <p class="text-gray-600"><strong>Sarana & Prasarana:</strong></p>
                        <p class="col-span-2 text-gray-700">${mediaContent}</p>
                    </div>
                    <div class="grid grid-cols-3 gap-2">
                        <p class="text-gray-600"><strong>Target Peserta Didik:</strong></p>
                        <p class="col-span-2 text-gray-700">Siswa reguler/tipikal; umum, tidak ada kesulitan dalam memahami konsep dan abstraksi</p>
                    </div>
                    <div class="grid grid-cols-3 gap-2">
                        <p class="text-gray-600"><strong>Model Pembelajaran:</strong></p>
                        <p class="col-span-2 text-gray-700">${modelPembelajaran} dengan pendekatan student-centered</p>
                    </div>
                </div>
            </div>

            <!-- B. KOMPONEN INTI -->
            <div class="mb-6">
                <h3 class="font-bold text-lg text-gray-900 mb-3 flex items-center">
                    <span class="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm mr-3">B</span>
                    KOMPONEN INTI
                </h3>

                <!-- B.1 Tujuan Pembelajaran -->
                <div class="mb-4">
                    <h4 class="font-semibold text-gray-800 mb-2 pl-11">1. Tujuan Pembelajaran</h4>
                    <p class="text-gray-700 pl-11">${tujuanPembelajaran}</p>
                </div>

                <!-- B.2 Pemahaman Bermakna -->
                <div class="mb-4">
                    <h4 class="font-semibold text-gray-800 mb-2 pl-11">2. Pemahaman Bermakna</h4>
                    <p class="text-gray-700 pl-11">${generatePemahamanBermakna(topik, mapel, kelas)}</p>
                </div>

                <!-- B.3 Pertanyaan Pemantik -->
                <div class="mb-4">
                    <h4 class="font-semibold text-gray-800 mb-2 pl-11">3. Pertanyaan Pemantik</h4>
                    <ul class="list-disc pl-14 space-y-1 text-gray-700">
                        ${generatePertanyaanPemantikComplex(topik, kelas, mapel).map(q => `<li>${q}</li>`).join('')}
                    </ul>
                </div>

                <!-- B.4 Kegiatan Pembelajaran -->
                <div class="mb-4">
                    <h4 class="font-semibold text-gray-800 mb-2 pl-11">4. Kegiatan Pembelajaran</h4>
                    ${langkahContent}
                </div>

                <!-- B.5 Asesmen -->
                <div class="mb-4">
                    <h4 class="font-semibold text-gray-800 mb-2 pl-11">5. Asesmen Pembelajaran</h4>
                    ${asesmenContent}
                </div>

                <!-- B.6 Pengayaan & Remedial -->
                <div class="mb-4">
                    <h4 class="font-semibold text-gray-800 mb-2 pl-11">6. Pengayaan dan Remedial</h4>
                    <div class="bg-blue-50 border-l-4 border-blue-500 p-3 pl-11">
                        <p class="text-gray-700"><strong>Pengayaan:</strong> Siswa yang sudah mencapai tujuan pembelajaran dapat mengerjakan soal tantangan atau membantu teman yang belum memahami.</p>
                        <p class="text-gray-700 mt-2"><strong>Remedial:</strong> Siswa yang belum mencapai tujuan pembelajaran akan diberikan bimbingan khusus dengan pendekatan yang berbeda dan latihan tambahan.</p>
                    </div>
                </div>
            </div>

            <!-- C. LAMPIRAN -->
            <div class="mb-6">
                <h3 class="font-bold text-lg text-gray-900 mb-3 flex items-center">
                    <span class="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm mr-3">C</span>
                    LAMPIRAN
                </h3>
                <div class="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
                    <p><strong>1. Lembar Kerja Peserta Didik (LKPD)</strong> - Terlampir terpisah</p>
                    <p><strong>2. Bahan Bacaan Guru & Peserta Didik</strong> - Sesuai materi ${topik}</p>
                    <p><strong>3. Glosarium</strong> - Daftar istilah kunci pada materi ${topik}</p>
                    <p><strong>4. Daftar Pustaka</strong> - Buku teks ${mapel} Kelas ${kelas}, Kurikulum Merdeka</p>
                </div>
            </div>

            <!-- MENGETAHUI -->
            <div class="border-t-2 border-gray-300 pt-6 mt-8">
                <div class="grid grid-cols-2 gap-8">
                    <div class="text-center">
                        <p class="text-sm text-gray-700 mb-16">Mengetahui,<br>Kepala Sekolah</p>
                        <p class="font-semibold border-b-2 border-gray-800 px-8 pb-1 inline-block">_________________________</p>
                        <p class="text-xs text-gray-500 mt-1">NIP. ...........................</p>
                    </div>
                    <div class="text-center">
                        <p class="text-sm text-gray-700 mb-16">${tanggal}<br>Guru Mata Pelajaran</p>
                        <p class="font-semibold border-b-2 border-gray-800 px-8 pb-1 inline-block">${namaPenyusun}</p>
                        <p class="text-xs text-gray-500 mt-1">NIP. ...........................</p>
                    </div>
                </div>
            </div>

            <!-- FOOTER -->
            <div class="border-t border-gray-200 pt-4 mt-8 text-center text-xs text-gray-500">
                <p>Modul ini disusun menggunakan Asisten Modul Ajar - ${namaSekolah}</p>
                <p class="mt-1">Kurikulum Merdeka | Tahun Pelajaran ${tahunPelajaran}</p>
            </div>
        `;
    }

    // ============================================
    // HELPER FUNCTIONS (COMPLEX GENERATORS)
    // ============================================

    function generateCapaianPembelajaran(mapel, kelas) {
        const cpDatabase = {
            'Matematika': {
                '1': 'Peserta didik dapat melakukan operasi penjumlahan dan pengurangan bilangan cacah sampai 100',
                '2': 'Peserta didik dapat melakukan operasi perkalian dan pembagian bilangan cacah',
                '3': 'Peserta didik dapat melakukan operasi hitung bilangan cacah, pecahan, dan desimal',
                '4': 'Peserta didik dapat melakukan operasi hitung bilangan bulat dan pecahan',
                '5': 'Peserta didik dapat melakukan operasi hitung bilangan bulat, pecahan, dan desimal',
                '6': 'Peserta didik dapat melakukan operasi hitung bilangan bulat, pecahan, dan persentase'
            },
            'Bahasa Indonesia': {
                '1': 'Peserta didik mampu membaca kata-kata yang dikenal sehari-hari',
                '2': 'Peserta didik mampu membaca teks pendek dengan lancar',
                '3': 'Peserta didik mampu membaca teks dengan pemahaman yang baik',
                '4': 'Peserta didik mampu membaca dan memahami teks informatif',
                '5': 'Peserta didik mampu membaca dan menganalisis teks berbagai jenis',
                '6': 'Peserta didik mampu membaca kritis dan memahami teks kompleks'
            }
        };
        return cpDatabase[mapel]?.[kelas] || 'Capaian pembelajaran sesuai Kurikulum Merdeka';
    }

    function generateKompetensiAwal(kelas, mapel) {
        return `Siswa telah memahami konsep dasar ${mapel} pada pertemuan sebelumnya dan memiliki pengetahuan prasyarat yang cukup untuk mempelajari materi baru.`;
    }

    function generatePemahamanBermakna(topik, mapel, kelas) {
        return `Melalui pembelajaran ${topik}, siswa memahami bahwa konsep ini memiliki aplikasi nyata dalam kehidupan sehari-hari dan dapat digunakan untuk memecahkan masalah kontekstual yang relevan dengan lingkungan mereka.`;
    }

    function generatePertanyaanPemantikComplex(topik, kelas, mapel) {
        const questions = [
            `Apa yang kalian ketahui tentang ${topik.toLowerCase()}?`,
            `Mengapa ${topik.toLowerCase()} penting untuk dipelajari dalam ${mapel}?`,
            `Di mana kita dapat menemukan penerapan ${topik.toLowerCase()} dalam kehidupan sehari-hari?`,
            `Bagaimana jika ${topik.toLowerCase()} tidak ada? Apa dampaknya?`
        ];
        return questions;
    }

    function generateLangkahPembelajaranDetail(kelas, topik, mapel, model) {
        const isLower = ['1', '2', '3'].includes(kelas);
        
        return `
            <div class="pl-11 space-y-4">
                <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <p class="font-semibold text-blue-800 mb-2">🔹 KEGIATAN PENDAHULUAN (${isLower ? '10' : '15'} menit)</p>
                    <ul class="list-disc pl-5 text-sm text-gray-700 space-y-1">
                        <li>Guru membuka pembelajaran dengan salam, doa, dan presensi</li>
                        <li>Apersepsi: Mengaitkan materi sebelumnya dengan ${topik}</li>
                        <li>Menyampaikan tujuan pembelajaran dan manfaatnya</li>
                        <li>Memberikan motivasi dan ice breaker ${isLower ? '(lagu/tepuk semangat)' : '(pertanyaan pemantik)'}</li>
                    </ul>
                </div>
                
                <div class="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                    <p class="font-semibold text-green-800 mb-2">🔹 KEGIATAN INTI (${isLower ? '45' : '55'} menit)</p>
                    <div class="text-sm text-gray-700 space-y-3">
                        <p><strong>Fase 1 - Orientasi:</strong></p>
                        <ul class="list-disc pl-5 space-y-1">
                            <li>Siswa mengamati stimulus (gambar/video/objek) terkait ${topik}</li>
                            <li>Guru mengajukan pertanyaan pemantik untuk激发 rasa ingin tahu</li>
                        </ul>
                        
                        <p class="mt-3"><strong>Fase 2 - Organisasi:</strong></p>
                        <ul class="list-disc pl-5 space-y-1">
                            <li>Siswa dibagi dalam kelompok ${isLower ? '4-5 orang' : '3-4 orang'}</li>
                            <li>Setiap kelompok menerima LKPD dan bahan diskusi</li>
                            <li>Siswa berdiskusi dan mengerjakan tugas secara kolaboratif</li>
                        </ul>
                        
                        <p class="mt-3"><strong>Fase 3 - Investigasi:</strong></p>
                        <ul class="list-disc pl-5 space-y-1">
                            <li>Siswa mengeksplorasi konsep ${topik} melalui aktivitas hands-on</li>
                            <li>Guru berkeliling memberikan scaffolding dan bimbingan</li>
                            <li>Siswa mencatat hasil temuan dan kesimpulan sementara</li>
                        </ul>
                        
                        <p class="mt-3"><strong>Fase 4 - Presentasi:</strong></p>
                        <ul class="list-disc pl-5 space-y-1">
                            <li>Perwakilan kelompok mempresentasikan hasil diskusi</li>
                            <li>Kelompok lain memberikan tanggapan dan pertanyaan</li>
                            <li>Guru memfasilitasi diskusi kelas dan memberikan penguatan</li>
                        </ul>
                    </div>
                </div>
                
                <div class="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                    <p class="font-semibold text-purple-800 mb-2">🔹 KEGIATAN PENUTUP (${isLower ? '10' : '15'} menit)</p>
                    <ul class="list-disc pl-5 text-sm text-gray-700 space-y-1">
                        <li>Siswa bersama guru menyimpulkan pembelajaran hari ini</li>
                        <li>Refleksi: Siswa menyebutkan 1 hal yang dipelajari dan 1 pertanyaan yang masih ada</li>
                        <li>Guru memberikan umpan balik terhadap proses pembelajaran</li>
                        <li>Penugasan/pengayaan (opsional) untuk pertemuan berikutnya</li>
                        <li>Penutup dengan doa dan salam</li>
                    </ul>
                </div>
            </div>
        `;
    }

    function generateAsesmenDetail(kelas, topik, mapel) {
        const isLower = ['1', '2', '3'].includes(kelas);
        
        return `
            <div class="pl-11 space-y-4 text-sm text-gray-700">
                <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                    <p class="font-semibold text-yellow-800 mb-2">📊 Asesmen Formatif (Selama Proses)</p>
                    <ul class="list-disc pl-5 space-y-1">
                        <li><strong>Observasi:</strong> Keaktifan siswa dalam diskusi dan kerja kelompok</li>
                        <li><strong>Unjuk Kerja:</strong> Presentasi hasil diskusi dan kemampuan berkomunikasi</li>
                        <li><strong>Kuis Singkat:</strong> ${isLower ? '3-5 soal lisan' : '5-10 soal tertulis'} untuk cek pemahaman</li>
                        <li><strong>Lembar Ceklis:</strong> Penilaian keterampilan proses ${isLower ? 'sederhana' : 'kompleks'}</li>
                    </ul>
                </div>
                
                <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <p class="font-semibold text-red-800 mb-2">📝 Asesmen Sumatif (Akhir)</p>
                    <ul class="list-disc pl-5 space-y-1">
                        <li><strong>Tes Tertulis:</strong> ${isLower ? 'Soal pilihan ganda dan isian singkat' : 'Soal uraian dan analisis'} tentang ${topik}</li>
                        <li><strong>Produk/Karya:</strong> Membuat ${isLower ? 'gambar/poster sederhana' : 'laporan/proyek kecil'} terkait ${topik}</li>
                        <li><strong>Portofolio:</strong> Kumpulan hasil kerja siswa selama pembelajaran</li>
                    </ul>
                    <p class="mt-2 text-xs text-gray-600"><em>Kriteria Ketuntasan: Skor ≥ 75 (KKM)</em></p>
                </div>
                
                <div class="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                    <p class="font-semibold text-green-800 mb-2">📋 Rubrik Penilaian</p>
                    <div class="text-xs space-y-2">
                        <p><strong>Sikap:</strong> Kerjasama, tanggung jawab, disiplin (Skala 1-4)</p>
                        <p><strong>Pengetahuan:</strong> Pemahaman konsep ${topik} (Skala 1-100)</p>
                        <p><strong>Keterampilan:</strong> Kemampuan menerapkan konsep dalam penyelesaian masalah (Skala 1-4)</p>
                    </div>
                </div>
            </div>
        `;
    }

    function generateProfilPancasilaSection(profilPancasila, topik) {
        if (!profilPancasila || profilPancasila.length === 0) {
            profilPancasila = ['Bernalar Kritis', 'Kreatif', 'Mandiri'];
        }
        
        const deskripsiProfil = {
            'Beriman': 'Siswa menunjukkan sikap beriman dan bertakwa dalam setiap aktivitas pembelajaran',
            'Berkebinekaan': 'Siswa menghargai perbedaan pendapat dan budaya dalam diskusi kelompok',
            'Bergotong-royong': 'Siswa bekerjasama dengan baik dalam menyelesaikan tugas kelompok',
            'Mandiri': 'Siswa mampu menyelesaikan tugas secara mandiri dengan tanggung jawab',
            'Bernalar Kritis': 'Siswa mampu menganalisis masalah dan提出 solusi yang logis',
            'Kreatif': 'Siswa menghasilkan ide-ide kreatif dalam penyelesaian masalah'
        };
        
        return profilPancasila.map(p => `
            <div class="flex items-start gap-2 mb-2">
                <i class="fas fa-check-circle text-green-500 mt-1"></i>
                <div>
                    <p class="font-semibold text-gray-800">${p}</p>
                    <p class="text-sm text-gray-600">${deskripsiProfil[p] || ''}</p>
                </div>
            </div>
        `).join('');
    }

    function generateMediaPembelajaran(mapel, kelas) {
        const mediaDatabase = {
            'Matematika': 'Papan tulis, spidol, kartu bilangan, manipulatif (blok dienes), LKPD, projector',
            'Bahasa Indonesia': 'Teks bacaan, gambar ilustrasi, audio cerita, LKPD, projector',
            'IPA': 'Alat peraga, gambar/foto, video eksperimen, LKPD, alat praktikum sederhana',
            'IPS': 'Peta, gambar, video dokumenter, LKPD, projector',
            'PJOK': 'Lapangan, bola, cone, peluit, stopwatch',
            'Seni Budaya': 'Kertas gambar, pensil warna, krayon, gunting, lem, contoh karya'
        };
        return mediaDatabase[mapel] || 'Papan tulis, LKPD, projector, bahan ajar sesuai materi';
    }

    // ============================================
    // EXPORT & SAVE FUNCTIONS
    // ============================================

    window.copyModul = () => {
        const content = modulBody.innerText;
        navigator.clipboard.writeText(content).then(() => {
            alert('✅ Modul berhasil disalin ke clipboard!');
        }).catch(err => {
            console.error('Gagal copy:', err);
            alert('❌ Gagal menyalin. Silakan blok teks dan copy manual.');
        });
    }

    window.downloadWord = () => {
        const content = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head><meta charset='utf-8'><title>Modul Ajar</title></head>
            <body>${modulBody.innerHTML}</body>
            </html>
        `;
        const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ModulAjar_${window.currentModulData?.topik?.replace(/\s+/g, '_') || 'modul'}.doc`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    window.downloadPDF = () => {
        // Simple print-to-PDF approach
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>Modul Ajar - ${window.currentModulData?.topik || ''}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; }
                    .prose { max-width: 800px; margin: 0 auto; }
                </style>
            </head>
            <body>${modulBody.innerHTML}</body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }

    window.saveToFirebase = async () => {
        if (!confirm('Simpan modul ini ke database?')) return;

        const data = window.currentModulData;
        
        try {
            await addDoc(collection(db, collectionName), {
                ...data,
                htmlContent: window.currentModulHTML,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            alert('✅ Modul berhasil disimpan!');
            // Switch to riwayat tab
            window.showTab('riwayat');
        } catch (error) {
            console.error('Error saving modul:', error);
            alert('❌ Gagal menyimpan: ' + error.message);
        }
    }

    // ============================================
    // RIWAYAT MODULE
    // ============================================

    window.loadRiwayat = async () => {
        const loadingRiwayat = document.getElementById('loadingRiwayat');
        const gridRiwayat = document.getElementById('gridRiwayat');
        const emptyRiwayat = document.getElementById('emptyRiwayat');

        loadingRiwayat.classList.remove('hidden');
        gridRiwayat.classList.add('hidden');
        emptyRiwayat.classList.add('hidden');

        try {
            const q = query(collection(db, collectionName), orderBy("createdAt", "desc"));
            const snapshot = await getDocs(q);

            gridRiwayat.innerHTML = '';

            if (snapshot.empty) {
                loadingRiwayat.classList.add('hidden');
                emptyRiwayat.classList.remove('hidden');
                return;
            }

            snapshot.forEach(docSnap => {
                const data = docSnap.data();
                const tanggal = new Date(data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt).toLocaleDateString('id-ID');
                
                gridRiwayat.innerHTML += `
                    <div class="border rounded-lg p-4 hover:shadow-md transition">
                        <div class="flex justify-between items-start mb-2">
                            <span class="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">${data.mapel}</span>
                            <button onclick="window.deleteModul('${docSnap.id}')" class="text-red-500 hover:text-red-700">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                        <h4 class="font-semibold text-gray-800 mb-1">${data.topik}</h4>
                        <p class="text-sm text-gray-600 mb-2">Kelas ${data.kelasFase?.split('-')[0]} | ${tanggal}</p>
                        <p class="text-xs text-gray-500">Oleh: ${data.namaPenyusun}</p>
                        <button onclick="window.viewModul('${docSnap.id}')" class="mt-3 w-full bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1.5 rounded text-sm">
                            <i class="fas fa-eye mr-1"></i> Lihat
                        </button>
                    </div>
                `;
            });

            loadingRiwayat.classList.add('hidden');
            gridRiwayat.classList.remove('hidden');

        } catch (error) {
            console.error('Error loading riwayat:', error);
            loadingRiwayat.classList.add('hidden');
            emptyRiwayat.innerHTML = `
                <i class="fas fa-exclamation-circle text-4xl text-red-300 mb-3"></i>
                <p class="text-red-500">Gagal memuat riwayat: ${error.message}</p>
            `;
            emptyRiwayat.classList.remove('hidden');
        }
    }

    window.deleteModul = async (id) => {
        if (!confirm('Hapus modul ini dari riwayat?')) return;
        
        try {
            await deleteDoc(doc(db, collectionName, id));
            alert('✅ Modul berhasil dihapus!');
            loadRiwayat();
        } catch (error) {
            alert('❌ Gagal menghapus: ' + error.message);
        }
    }

    window.viewModul = (id) => {
        // Implement view modul from history
        alert('Fitur view modul akan segera hadir!');
    }

    // Initial load
    loadRiwayat();
}
