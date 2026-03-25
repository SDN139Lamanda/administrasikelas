// modules/adm-pembelajaran.js
// Module Administrasi Pembelajaran - Manajemen RPP, Modul & Materi

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

// ============================================
// FUNGSI RENDER - Menghasilkan HTML Module
// ============================================
export function render() {
    const div = document.createElement('div');
    div.innerHTML = `
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
                        <option value="X-A">X-A</option>
                        <option value="X-B">X-B</option>
                        <option value="XI-A">XI-A</option>
                        <option value="XI-B">XI-B</option>
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

        <!-- MODAL FORM TAMBAH/EDIT MATERI -->
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
                                <option value="X-A">X-A</option>
                                <option value="X-B">X-B</option>
                                <option value="XI-A">XI-A</option>
                                <option value="XI-B">XI-B</option>
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
    const modal = document.getElementById('modalMateri');
    const formMateri = document.getElementById('formMateri');
    const gridMateri = document.getElementById('gridMateri');
    const loadingMateri = document.getElementById('loadingMateri');
    const emptyMateri = document.getElementById('emptyMateri');
    const searchInput = document.getElementById('searchMateri');
    const filterJenis = document.getElementById('filterJenis');
    const filterKelas = document.getElementById('filterKelas');
    const modalTitle = document.getElementById('modalTitle');

    // Set tanggal hari ini default
    document.getElementById('tanggal').valueAsDate = new Date();

    // --- FUNGSI MODAL ---
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

    // --- RENDER CARD MATERI ---
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
                    <span class="px-2 py-1 bg-gray-100 rounded">${data.kelas}</span>
                    ${data.mapel ? `<span class="px-2 py-1 bg-gray-100 rounded">${data.mapel}</span>` : ''}
                </div>
                
                <a href="${data.linkFile}" target="_blank" 
                    class="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm">
                    <i class="fas fa-external-link-alt"></i> Buka Materi
                </a>
            </div>
        `;
    }

    // --- READ: Load Data dari Firestore ---
    async function loadMateri() {
        try {
            loadingMateri.classList.remove('hidden');
            gridMateri.classList.add('hidden');
            emptyMateri.classList.add('hidden');

            let q = query(collection(db, collectionName), orderBy("createdAt", "desc"));
            
            // Apply filters
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
                
                // Filter by search keyword
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

    // --- CREATE & UPDATE: Submit Form ---
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
            console.error("Error saving materi:", error);
            alert("❌ Gagal menyimpan: " + error.message);
        }
    });

    // --- EDIT: Isi Form dengan Data Existing ---
    window.editMateri = (id, data) => {
        // Parse data string back to object (handle escaped quotes)
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

    // --- DELETE: Hapus Data ---
    window.deleteMateri = async (id) => {
        if (confirm('⚠️ Apakah Anda yakin ingin menghapus materi ini?')) {
            try {
                await deleteDoc(doc(db, collectionName, id));
                alert('✅ Materi berhasil dihapus!');
                loadMateri();
            } catch (error) {
                console.error("Error deleting materi:", error);
                alert("❌ Gagal menghapus: " + error.message);
            }
        }
    }

    // --- SEARCH & FILTER Events ---
    if (searchInput) searchInput.addEventListener('input', loadMateri);
    if (filterJenis) filterJenis.addEventListener('change', loadMateri);
    if (filterKelas) filterKelas.addEventListener('change', loadMateri);

    // Initial Load
    loadMateri();
}
