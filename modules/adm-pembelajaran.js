// modules/adm-pembelajaran.js
// Module Administrasi Pembelajaran - Manajemen Materi + AI Prompt Generator Modul Ajar

import { db } from '../config-firebase.js';
import { 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    updateDoc, 
    deleteDoc, 
    query, 
    orderBy, 
    where 
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const collectionName = "pembelajaran";
const modulCollection = "modul-ajar";

// ============================================
// FUNGSI RENDER - Menghasilkan HTML Module
// ============================================
export function render() {
    const div = document.createElement('div');
    div.innerHTML = `
        <!-- TAB NAVIGATION -->
        <div class="border-b border-gray-200 mb-6">
            <nav class="-mb-px flex space-x-8 overflow-x-auto pb-2">
                <button onclick="window.showTab('daftar-materi')" id="tab-daftar-materi" 
                    class="tab-button py-4 px-1 border-b-2 font-medium text-sm active border-blue-500 text-blue-600 whitespace-nowrap">
                    <i class="fas fa-list mr-2"></i>Daftar Materi
                </button>
                <button onclick="window.showTab('buat-modul')" id="tab-buat-modul" 
                    class="tab-button py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 whitespace-nowrap">
                    <i class="fas fa-magic mr-2"></i>Buat Modul Ajar
                </button>
            </nav>
        </div>

        <!-- TAB CONTENT: DAFTAR MATERI -->
        <div id="content-daftar-materi" class="tab-content">
            <!-- Header Section -->
            <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                <div>
                    <h2 class="text-2xl font-bold text-gray-800">Administrasi Pembelajaran</h2>
                    <p class="text-gray-500 text-sm">Kelola RPP, Modul Ajar, dan Materi Pembelajaran</p>
                </div>
                <button onclick="window.openModalMateri()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition flex items-center gap-2">
                    <i class="fas fa-plus"></i> Tambah Materi
                </button>
            </div>

            <!-- Filter & Search -->
            <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div class="flex flex-col md:flex-row gap-4">
                    <div class="flex-1">
                        <label class="block text-gray-700 text-sm font-medium mb-1">Cari Materi</label>
                        <div class="relative">
                            <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            <input type="text" id="searchMateri" placeholder="Judul, topik, atau jenis..." 
                                class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                        </div>
                    </div>
                    <div class="w-full md:w-48">
                        <label class="block text-gray-700 text-sm font-medium mb-1">Jenis</label>
                        <select id="filterJenis" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                            <option value="">Semua Jenis</option>
                            <option value="rpp">RPP</option>
                            <option value="modul">Modul Ajar</option>
                            <option value="materi">Materi Presentasi</option>
                            <option value="video">Video Pembelajaran</option>
                            <option value="lainnya">Lainnya</option>
                        </select>
                    </div>
                    <div class="w-full md:w-48">
                        <label class="block text-gray-700 text-sm font-medium mb-1">Kelas</label>
                        <select id="filterKelas" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                            <option value="">Semua Kelas</option>
                            <option value="1">Kelas 1</option>
                            <option value="2">Kelas 2</option>
                            <option value="3">Kelas 3</option>
                            <option value="4">Kelas 4</option>
                            <option value="5">Kelas 5</option>
                            <option value="6">Kelas 6</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Loading State -->
            <div id="loadingMateri" class="text-center py-12">
                <i class="fas fa-spinner fa-spin text-4xl text-blue-500 mb-4"></i>
                <p class="text-gray-500">Memuat data pembelajaran...</p>
            </div>

            <!-- Grid Materi -->
            <div id="gridMateri" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 hidden">
                <!-- Cards akan di-render di sini -->
            </div>

            <!-- Empty State -->
            <div id="emptyMateri" class="text-center py-12 hidden">
                <i class="fas fa-folder-open text-5xl text-gray-300 mb-4"></i>
                <h3 class="text-lg font-semibold text-gray-600">Belum ada materi pembelajaran</h3>
                <p class="text-gray-500 text-sm">Klik "Tambah Materi" untuk memulai</p>
            </div>
        </div>

        <!-- TAB CONTENT: BUAT MODUL AJAR (FITUR BARU) -->
        <div id="content-buat-modul" class="tab-content hidden">
            <div class="bg-white rounded-lg shadow-sm p-6">
                <div class="flex items-center gap-3 mb-6">
                    <div class="p-3 bg-purple-100 rounded-lg">
                        <i class="fas fa-magic text-purple-600 text-xl"></i>
                    </div>
                    <div>
                        <h2 class="text-2xl font-bold text-gray-800">Asisten Modul Ajar</h2>
                        <p class="text-gray-500 text-sm">Bantu susun modul ajar dengan panduan terstruktur</p>
                    </div>
                </div>

                <!-- Form Input Prompt -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label class="block text-gray-700 text-sm font-bold mb-2">Topik / Materi *</label>
                        <input type="text" id="modulTopik" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-purple-500" 
                            placeholder="Contoh: Pecahan Sederhana" required>
                    </div>
                    <div>
                        <label class="block text-gray-700 text-sm font-bold mb-2">Kelas *</label>
                        <select id="modulKelas" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-purple-500" required>
                            <option value="">Pilih Kelas</option>
                            <option value="1">Kelas 1</option>
                            <option value="2">Kelas 2</option>
                            <option value="3">Kelas 3</option>
                            <option value="4">Kelas 4</option>
                            <option value="5">Kelas 5</option>
                            <option value="6">Kelas 6</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-gray-700 text-sm font-bold mb-2">Mata Pelajaran *</label>
                        <input type="text" id="modulMapel" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-purple-500" 
                            placeholder="Contoh: Matematika" required>
                    </div>
                    <div>
                        <label class="block text-gray-700 text-sm font-bold mb-2">Alokasi Waktu</label>
                        <input type="text" id="modulWaktu" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-purple-500" 
                            placeholder="Contoh: 2 x 35 menit" value="2 x 35 menit">
                    </div>
                </div>

                <div class="mb-6">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Tujuan Pembelajaran *</label>
                    <textarea id="modulTujuan" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-purple-500 h-20" 
                        placeholder="Contoh: Siswa dapat menjumlahkan pecahan dengan penyebut sama" required></textarea>
                </div>

                <div class="mb-6">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Catatan Tambahan (Opsional)</label>
                    <textarea id="modulCatatan" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-purple-500 h-16" 
                        placeholder="Media, metode, atau konteks khusus..."></textarea>
                </div>

                <button onclick="window.generateModul()" class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg text-sm transition flex items-center gap-2">
                    <i class="fas fa-wand-magic-sparkles"></i>Generate Modul Ajar
                </button>
            </div>

            <!-- Loading Generator -->
            <div id="loadingGenerator" class="hidden text-center py-8">
                <i class="fas fa-spinner fa-spin text-3xl text-purple-500 mb-3"></i>
                <p class="text-gray-500">Menyusun modul ajar...</p>
            </div>

            <!-- Preview Hasil Generate -->
            <div id="previewModul" class="hidden mt-6">
                <div class="bg-gray-50 rounded-lg border border-gray-200 p-6">
                    <div class="flex justify-between items-start mb-4">
                        <h3 class="text-lg font-bold text-gray-800">Preview Modul Ajar</h3>
                        <div class="flex gap-2">
                            <button onclick="window.copyModul()" class="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded text-sm flex items-center gap-1">
                                <i class="fas fa-copy"></i> Copy
                            </button>
                            <button onclick="window.downloadModul()" class="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1.5 rounded text-sm flex items-center gap-1">
                                <i class="fas fa-download"></i> Download
                            </button>
                            <button onclick="window.saveModulToFirebase()" class="bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1.5 rounded text-sm flex items-center gap-1">
                                <i class="fas fa-save"></i> Simpan
                            </button>
                        </div>
                    </div>
                    
                    <div id="modulContent" class="prose prose-sm max-w-none text-gray-700 space-y-4">
                        <!-- Content will be generated here -->
                    </div>
                </div>
            </div>
        </div>

        <!-- MODAL FORM TAMBAH/EDIT MATERI (Existing) -->
        <div id="modalMateri" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-gray-800" id="modalTitle">Tambah Materi</h3>
                    <button onclick="window.closeModalMateri()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <form id="formMateri">
                    <input type="hidden" id="materiId">
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2">Judul *</label>
                            <input type="text" id="judul" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500" required placeholder="Contoh: Persamaan Linear">
                        </div>
                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2">Jenis *</label>
                            <select id="jenis" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500" required>
                                <option value="">Pilih Jenis</option>
                                <option value="rpp">RPP</option>
                                <option value="modul">Modul Ajar</option>
                                <option value="materi">Materi Presentasi</option>
                                <option value="video">Video Pembelajaran</option>
                                <option value="lainnya">Lainnya</option>
                            </select>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2">Kelas *</label>
                            <select id="kelas" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500" required>
                                <option value="">Pilih Kelas</option>
                                <option value="1">Kelas 1</option>
                                <option value="2">Kelas 2</option>
                                <option value="3">Kelas 3</option>
                                <option value="4">Kelas 4</option>
                                <option value="5">Kelas 5</option>
                                <option value="6">Kelas 6</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2">Mapel</label>
                            <input type="text" id="mapel" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500" placeholder="Contoh: Matematika">
                        </div>
                    </div>

                    <div class="mb-4">
                        <label class="block text-gray-700 text-sm font-bold mb-2">Deskripsi</label>
                        <textarea id="deskripsi" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 h-20" placeholder="Deskripsi singkat materi..."></textarea>
                    </div>

                    <div class="mb-4">
                        <label class="block text-gray-700 text-sm font-bold mb-2">Link/File *</label>
                        <input type="url" id="linkFile" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500" required placeholder="https://... (Google Drive, YouTube, dll)">
                        <p class="text-xs text-gray-500 mt-1">Masukkan link Google Drive, YouTube, atau URL file</p>
                    </div>

                    <div class="mb-4">
                        <label class="block text-gray-700 text-sm font-bold mb-2">Tanggal Upload</label>
                        <input type="date" id="tanggal" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                    </div>

                    <div class="flex gap-2 pt-4">
                        <button type="button" onclick="window.closeModalMateri()" class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg">Batal</button>
                        <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">Simpan</button>
                    </div>
                </form>
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
    // DOM Elements - Daftar Materi
    const modal = document.getElementById('modalMateri');
    const formMateri = document.getElementById('formMateri');
    const gridMateri = document.getElementById('gridMateri');
    const loadingMateri = document.getElementById('loadingMateri');
    const emptyMateri = document.getElementById('emptyMateri');
    const searchInput = document.getElementById('searchMateri');
    const filterJenis = document.getElementById('filterJenis');
    const filterKelas = document.getElementById('filterKelas');
    const modalTitle = document.getElementById('modalTitle');

    // DOM Elements - Buat Modul
    const loadingGenerator = document.getElementById('loadingGenerator');
    const previewModul = document.getElementById('previewModul');
    const modulContent = document.getElementById('modulContent');

    // --- FUNGSI TAB ---
    window.showTab = (tabName) => {
        document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active', 'border-blue-500', 'text-blue-600');
            btn.classList.add('border-transparent', 'text-gray-500');
        });
        document.getElementById(`content-${tabName}`).classList.remove('hidden');
        document.getElementById(`tab-${tabName}`).classList.add('active', 'border-blue-500', 'text-blue-600');
        document.getElementById(`tab-${tabName}`).classList.remove('border-transparent', 'text-gray-500');
        
        if (tabName === 'daftar-materi') {
            loadMateri();
        }
    }

    // --- FUNGSI MODAL MATERI (Existing) ---
    window.openModalMateri = () => {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
    window.closeModalMateri = () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        formMateri.reset();
        document.getElementById('materiId').value = '';
        document.getElementById('tanggal').valueAsDate = new Date();
        modalTitle.textContent = 'Tambah Materi';
    }

    // --- RENDER CARD MATERI (Existing) ---
    function renderCard(docId, data) {
        const icons = {
            'rpp': 'fa-file-alt text-blue-500',
            'modul': 'fa-book-open text-purple-500',
            'materi': 'fa-chalkboard-teacher text-green-500',
            'video': 'fa-video text-red-500',
            'lainnya': 'fa-folder text-gray-500'
        };
        const labels = {
            'rpp': 'RPP',
            'modul': 'Modul',
            'materi': 'Materi',
            'video': 'Video',
            'lainnya': 'Lainnya'
        };

        return `
            <div class="bg-white rounded-lg shadow-sm border hover:shadow-md transition p-5">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center gap-3">
                        <div class="p-2 rounded-lg bg-gray-100">
                            <i class="fas ${icons[data.jenis] || icons['lainnya']} text-xl"></i>
                        </div>
                        <div>
                            <span class="text-xs font-medium px-2 py-1 rounded bg-blue-100 text-blue-700">
                                ${labels[data.jenis] || data.jenis}
                            </span>
                        </div>
                    </div>
                    <div class="flex gap-1">
                        <button onclick="window.editMateri('${docId}', ${JSON.stringify(data).replace(/'/g, "\\'")})" 
                            class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="window.deleteMateri('${docId}')" 
                            class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded" title="Hapus">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <h4 class="font-semibold text-gray-800 mb-1 line-clamp-1">${data.judul}</h4>
                <p class="text-sm text-gray-500 mb-3 line-clamp-2">${data.deskripsi || 'Tanpa deskripsi'}</p>
                
                <div class="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <span class="px-2 py-1 bg-gray-100 rounded">Kelas ${data.kelas}</span>
                    ${data.mapel ? `<span class="px-2 py-1 bg-gray-100 rounded">${data.mapel}</span>` : ''}
                </div>
                
                <a href="${data.linkFile}" target="_blank" 
                    class="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm">
                    <i class="fas fa-external-link-alt"></i> Buka Materi
                </a>
            </div>
        `;
    }

    // --- LOAD MATERI (Existing) ---
    async function loadMateri() {
        try {
            loadingMateri.classList.remove('hidden');
            gridMateri.classList.add('hidden');
            emptyMateri.classList.add('hidden');

            let q = query(collection(db, collectionName), orderBy("createdAt", "desc"));
            
            const keyword = searchInput?.value?.toLowerCase() || '';
            const jenis = filterJenis?.value || '';
            const kelas = filterKelas?.value || '';

            if (jenis) q = query(q, where("jenis", "==", jenis));
            if (kelas) q = query(q, where("kelas", "==", kelas));

            const snapshot = await getDocs(q);
            
            gridMateri.innerHTML = '';
            
            if (snapshot.empty) {
                loadingMateri.classList.add('hidden');
                emptyMateri.classList.remove('hidden');
                return;
            }

            let count = 0;
            snapshot.forEach(docSnap => {
                const data = docSnap.data();
                
                if (keyword) {
                    const searchable = `${data.judul} ${data.deskripsi} ${data.mapel}`.toLowerCase();
                    if (!searchable.includes(keyword)) return;
                }
                
                count++;
                gridMateri.innerHTML += renderCard(docSnap.id, data);
            });

            if (count === 0) {
                emptyMateri.innerHTML = `
                    <i class="fas fa-search text-5xl text-gray-300 mb-4"></i>
                    <h3 class="text-lg font-semibold text-gray-600">Tidak ada hasil</h3>
                    <p class="text-gray-500 text-sm">Coba ubah kata kunci atau filter</p>
                `;
                emptyMateri.classList.remove('hidden');
            } else {
                gridMateri.classList.remove('hidden');
                emptyMateri.classList.add('hidden');
            }

        } catch (error) {
            console.error("Error loading materi:", error);
            loadingMateri.innerHTML = `
                <i class="fas fa-exclamation-circle text-3xl text-red-500"></i>
                <p class="text-red-500 mt-2">Gagal memuat data</p>
            `;
        } finally {
            loadingMateri.classList.add('hidden');
        }
    }

    // ============================================
    // 🔹 FITUR BARU: GENERATOR MODUL AJAR
    // ============================================

    // --- Generate Modul Ajar Berdasarkan Input ---
    window.generateModul = () => {
        const topik = document.getElementById('modulTopik').value.trim();
        const kelas = document.getElementById('modulKelas').value;
        const mapel = document.getElementById('modulMapel').value.trim();
        const tujuan = document.getElementById('modulTujuan').value.trim();
        const waktu = document.getElementById('modulWaktu').value.trim() || '2 x 35 menit';
        const catatan = document.getElementById('modulCatatan').value.trim();

        if (!topik || !kelas || !mapel || !tujuan) {
            alert('⚠️ Mohon lengkapi field bertanda *');
            return;
        }

        // Show loading
        loadingGenerator.classList.remove('hidden');
        previewModul.classList.add('hidden');

        // Simulate processing delay
        setTimeout(() => {
            const modul = createModulTemplate({ topik, kelas, mapel, tujuan, waktu, catatan });
            modulContent.innerHTML = modul;
            
            loadingGenerator.classList.add('hidden');
            previewModul.classList.remove('hidden');
            
            // Scroll to preview
            previewModul.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 1500);
    }

    // --- Template Generator (Rule-Based) ---
    function createModulTemplate(data) {
        const { topik, kelas, mapel, tujuan, waktu, catatan } = data;
        
        // Generate langkah pembelajaran berdasarkan kelas
        const langkahPembelajaran = generateLangkahPembelajaran(kelas, topik, mapel);
        
        // Generate asesmen sederhana
        const asesmen = generateAsesmen(kelas, topik);

        return `
            <div class="space-y-6">
                <!-- Header Modul -->
                <div class="border-b pb-4">
                    <h1 class="text-xl font-bold text-gray-900">MODUL AJAR: ${topik.toUpperCase()}</h1>
                    <div class="grid grid-cols-2 gap-2 text-sm text-gray-600 mt-2">
                        <p><strong>Mata Pelajaran:</strong> ${mapel}</p>
                        <p><strong>Kelas:</strong> ${kelas}</p>
                        <p><strong>Alokasi Waktu:</strong> ${waktu}</p>
                        <p><strong>Fase:</strong> ${getFaseByKelas(kelas)}</p>
                    </div>
                </div>

                <!-- A. Tujuan Pembelajaran -->
                <div>
                    <h3 class="font-semibold text-gray-800 mb-2 flex items-center">
                        <span class="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs mr-2">A</span>
                        Tujuan Pembelajaran
                    </h3>
                    <p class="text-gray-700 pl-8">${tujuan}</p>
                </div>

                <!-- B. Pemahaman Bermakna -->
                <div>
                    <h3 class="font-semibold text-gray-800 mb-2 flex items-center">
                        <span class="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs mr-2">B</span>
                        Pemahaman Bermakna
                    </h3>
                    <p class="text-gray-700 pl-8">Siswa memahami bahwa ${topik.toLowerCase()} memiliki manfaat dalam kehidupan sehari-hari, khususnya dalam konteks ${getContextByMapel(mapel)}.</p>
                </div>

                <!-- C. Pertanyaan Pemantik -->
                <div>
                    <h3 class="font-semibold text-gray-800 mb-2 flex items-center">
                        <span class="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs mr-2">C</span>
                        Pertanyaan Pemantik
                    </h3>
                    <ul class="list-disc pl-10 space-y-1 text-gray-700">
                        ${generatePertanyaanPemantik(topik, kelas).map(q => `<li>${q}</li>`).join('')}
                    </ul>
                </div>

                <!-- D. Langkah Pembelajaran -->
                <div>
                    <h3 class="font-semibold text-gray-800 mb-2 flex items-center">
                        <span class="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs mr-2">D</span>
                        Langkah Pembelajaran
                    </h3>
                    <div class="pl-8 space-y-4">
                        ${langkahPembelajaran}
                    </div>
                </div>

                <!-- E. Asesmen -->
                <div>
                    <h3 class="font-semibold text-gray-800 mb-2 flex items-center">
                        <span class="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs mr-2">E</span>
                        Asesmen Pembelajaran
                    </h3>
                    ${asesmen}
                </div>

                <!-- F. Refleksi -->
                <div>
                    <h3 class="font-semibold text-gray-800 mb-2 flex items-center">
                        <span class="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs mr-2">F</span>
                        Refleksi Guru & Siswa
                    </h3>
                    <div class="pl-8 space-y-2 text-gray-700">
                        <p><strong>Refleksi Guru:</strong></p>
                        <ul class="list-disc pl-5 space-y-1">
                            <li>Apakah tujuan pembelajaran tercapai?</li>
                            <li>Aktivitas mana yang paling efektif?</li>
                            <li>Apa kendala yang dihadapi dan solusinya?</li>
                        </ul>
                        <p class="mt-2"><strong>Refleksi Siswa:</strong></p>
                        <ul class="list-disc pl-5 space-y-1">
                            <li>Apa yang paling menarik dari pembelajaran hari ini?</li>
                            <li>Apa yang masih belum dipahami?</li>
                            <li>Apa yang ingin dipelajari lebih lanjut?</li>
                        </ul>
                    </div>
                </div>

                ${catatan ? `
                <!-- G. Catatan Khusus -->
                <div>
                    <h3 class="font-semibold text-gray-800 mb-2 flex items-center">
                        <span class="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs mr-2">G</span>
                        Catatan Khusus
                    </h3>
                    <p class="text-gray-700 pl-8">${catatan}</p>
                </div>
                ` : ''}

                <!-- Footer -->
                <div class="border-t pt-4 text-sm text-gray-500">
                    <p>Modul ini disusun menggunakan Asisten Modul Ajar - SDN 139 LAMANDA</p>
                    <p class="mt-1">Tanggal: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>
        `;
    }

    // --- Helper: Generate Langkah Pembelajaran ---
    function generateLangkahPembelajaran(kelas, topik, mapel) {
        const isLower = ['1','2','3'].includes(kelas);
        
        return `
            <div class="space-y-3">
                <div class="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                    <p class="font-medium text-blue-800">🔹 Pendahuluan (10 menit)</p>
                    <ul class="list-disc pl-5 text-sm text-gray-700 mt-1 space-y-1">
                        <li>Guru membuka dengan salam dan doa</li>
                        <li>Presensi dan apersepsi: mengaitkan materi sebelumnya dengan ${topik}</li>
                        <li>Menyampaikan tujuan pembelajaran dan motivasi</li>
                        ${isLower ? '<li>Ice breaker: lagu/tepuk semangat terkait ' + mapel + '</li>' : ''}
                    </ul>
                </div>
                
                <div class="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                    <p class="font-medium text-green-800">🔹 Kegiatan Inti (${isLower ? '40' : '50'} menit)</p>
                    <ul class="list-disc pl-5 text-sm text-gray-700 mt-1 space-y-2">
                        <li><strong>Eksplorasi:</strong> Siswa mengamati contoh/visual terkait ${topik}</li>
                        <li><strong>Elaborasi:</strong> 
                            ${isLower 
                                ? 'Siswa berdiskusi dalam kelompok kecil, mengerjakan LKPD sederhana' 
                                : 'Siswa bekerja individu/kelompok menyelesaikan masalah kontekstual'}
                        </li>
                        <li><strong>Konfirmasi:</strong> Guru memandu presentasi, memberikan umpan balik, dan penguatan konsep</li>
                    </ul>
                </div>
                
                <div class="bg-purple-50 border-l-4 border-purple-500 p-3 rounded">
                    <p class="font-medium text-purple-800">🔹 Penutup (15 menit)</p>
                    <ul class="list-disc pl-5 text-sm text-gray-700 mt-1 space-y-1">
                        <li>Siswa menyimpulkan pembelajaran bersama guru</li>
                        <li>Refleksi: apa yang dipelajari dan manfaatnya</li>
                        <li>Penugasan/pengayaan (opsional)</li>
                        <li>Penutup dengan doa dan salam</li>
                    </ul>
                </div>
            </div>
        `;
    }

    // --- Helper: Generate Pertanyaan Pemantik ---
    function generatePertanyaanPemantik(topik, kelas) {
        const questions = [
            `Apa yang kalian ketahui tentang ${topik.toLowerCase()}?`,
            `Mengapa ${topik.toLowerCase()} penting untuk dipelajari?`,
            `Di mana kita bisa menemukan ${topik.toLowerCase()} dalam kehidupan sehari-hari?`
        ];
        
        if (['4','5','6'].includes(kelas)) {
            questions.push(`Bagaimana jika ${topik.toLowerCase()} tidak ada? Apa dampaknya?`);
        }
        
        return questions;
    }

    // --- Helper: Generate Asesmen ---
    function generateAsesmen(kelas, topik) {
        const isLower = ['1','2','3'].includes(kelas);
        
        return `
            <div class="pl-8 space-y-3 text-gray-700">
                <p><strong>Asesmen Formatif (Proses):</strong></p>
                <ul class="list-disc pl-5 space-y-1">
                    <li>Observasi keaktifan siswa selama diskusi</li>
                    <li>Unjuk kerja: presentasi hasil diskusi/karya</li>
                    <li>${isLower ? 'Lembar ceklis keterampilan sederhana' : 'Kuis singkat 3-5 soal'}</li>
                </ul>
                
                <p class="mt-3"><strong>Asesmen Sumatif (Akhir):</strong></p>
                <ul class="list-disc pl-5 space-y-1">
                    <li>${isLower ? 'Tes lisan: menjawab pertanyaan tentang ' + topik.toLowerCase() : 'Tes tertulis: soal uraian/pilihan ganda terkait ' + topik.toLowerCase()}</li>
                    <li>Produk: membuat ${isLower ? 'gambar/poster' : 'laporan kecil'} tentang ${topik.toLowerCase()}</li>
                </ul>
                
                <p class="mt-3 text-sm text-gray-600"><em>Kriteria Ketuntasan: Siswa dianggap tuntas jika mencapai skor ≥ 75</em></p>
            </div>
        `;
    }

    // --- Helper: Get Fase by Kelas ---
    function getFaseByKelas(kelas) {
        const faseMap = { '1':'A', '2':'A', '3':'B', '4':'B', '5':'C', '6':'C' };
        return `Fase ${faseMap[kelas] || '-'}`;
    }

    // --- Helper: Get Context by Mapel ---
    function getContextByMapel(mapel) {
        const contextMap = {
            'Matematika': 'pemecahan masalah sehari-hari',
            'IPA': 'fenomena alam dan lingkungan',
            'IPS': 'kehidupan sosial dan budaya',
            'Bahasa Indonesia': 'komunikasi dan literasi',
            'PJOK': 'kesehatan dan kebugaran',
            'Seni Budaya': 'ekspresi dan kreativitas'
        };
        return contextMap[mapel] || 'konteks pembelajaran';
    }

    // --- Copy Modul ke Clipboard ---
    window.copyModul = () => {
        const content = modulContent.innerText;
        navigator.clipboard.writeText(content).then(() => {
            alert('✅ Modul berhasil disalin ke clipboard!');
        }).catch(err => {
            console.error('Gagal copy:', err);
            alert('❌ Gagal menyalin. Silakan blok teks dan copy manual.');
        });
    }

    // --- Download Modul as Text ---
    window.downloadModul = () => {
        const content = modulContent.innerText;
        const topik = document.getElementById('modulTopik').value || 'modul';
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ModulAjar_${topik.replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // --- Save Modul to Firebase ---
    window.saveModulToFirebase = async () => {
        const kelas = document.getElementById('modulKelas').value;
        const mapel = document.getElementById('modulMapel').value;
        const topik = document.getElementById('modulTopik').value;
        const content = modulContent.innerHTML;
        
        if (!confirm('Simpan modul ini ke database?')) return;
        
        try {
            await addDoc(collection(db, modulCollection), {
                topik: topik,
                kelas: kelas,
                mapel: mapel,
                content: content,
                createdAt: new Date(),
                userId: 'guru-sdn139' // Bisa diganti dengan auth.currentUser.uid nanti
            });
            alert('✅ Modul berhasil disimpan!');
        } catch (error) {
            console.error('Error saving modul:', error);
            alert('❌ Gagal menyimpan: ' + error.message);
        }
    }

    // --- Existing: Submit Form Materi ---
    formMateri.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('materiId').value;
        const data = {
            judul: document.getElementById('judul').value,
            jenis: document.getElementById('jenis').value,
            kelas: document.getElementById('kelas').value,
            mapel: document.getElementById('mapel').value,
            deskripsi: document.getElementById('deskripsi').value,
            linkFile: document.getElementById('linkFile').value,
            tanggal: document.getElementById('tanggal').value,
            updatedAt: new Date()
        };
        try {
            if (id) {
                await updateDoc(doc(db, collectionName, id), data);
                alert('✅ Materi berhasil diupdate!');
            } else {
                data.createdAt = new Date();
                await addDoc(collection(db, collectionName), data);
                alert('✅ Materi berhasil ditambahkan!');
            }
            window.closeModalMateri();
            loadMateri();
        } catch (error) {
            alert("❌ Gagal menyimpan: " + error.message);
        }
    });

    // --- Existing: Edit Materi ---
    window.editMateri = (id, data) => {
        const parsed = typeof data === 'string' ? JSON.parse(data.replace(/\\'/g, "'")) : data;
        document.getElementById('materiId').value = id;
        document.getElementById('judul').value = parsed.judul;
        document.getElementById('jenis').value = parsed.jenis;
        document.getElementById('kelas').value = parsed.kelas;
        document.getElementById('mapel').value = parsed.mapel || '';
        document.getElementById('deskripsi').value = parsed.deskripsi || '';
        document.getElementById('linkFile').value = parsed.linkFile;
        document.getElementById('tanggal').value = parsed.tanggal || '';
        modalTitle.textContent = 'Edit Materi';
        window.openModalMateri();
    }

    // --- Existing: Delete Materi ---
    window.deleteMateri = async (id) => {
        if (confirm('⚠️ Apakah Anda yakin ingin menghapus materi ini?')) {
            try {
                await deleteDoc(doc(db, collectionName, id));
                alert('✅ Materi berhasil dihapus!');
                loadMateri();
            } catch (error) {
                alert("❌ Gagal menghapus: " + error.message);
            }
        }
    }

    // --- Existing: Search & Filter Events ---
    if (searchInput) searchInput.addEventListener('input', loadMateri);
    if (filterJenis) filterJenis.addEventListener('change', loadMateri);
    if (filterKelas) filterKelas.addEventListener('change', loadMateri);

    // Initial Load
    loadMateri();
}
