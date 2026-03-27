// modules/refleksi.js
// Module Refleksi Pembelajaran - Jurnal Refleksi Guru
// SDN 139 LAMANDA
// ✅ UPDATED: Security (userId + admin bypass) + Navigasi Dashboard

import { db } from '../config-firebase.js';
import { auth } from '../config-firebase.js';  // ✅ TAMBAH: Import auth untuk security
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

const collectionName = "refleksi";
const ADMIN_EMAIL = 'andi@139batuassung.com';  // ✅ TAMBAH: Email admin Anda

// ============================================
// FUNGSI RENDER - Menghasilkan HTML Module
// ============================================
export function render() {
    const div = document.createElement('div');
    div.innerHTML = `
        <!-- Navigation Bar -->
        <div class="mb-4">
            <button onclick="window.kembaliKeDashboard()" class="text-gray-600 hover:text-gray-800 text-sm flex items-center gap-2">
                <i class="fas fa-arrow-left"></i>
                <span>Kembali ke Dashboard</span>
            </button>
        </div>

        <!-- Header Section -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div>
                <h2 class="text-2xl font-bold text-gray-800">Jurnal Refleksi Guru</h2>
                <p class="text-gray-500 text-sm">Catat refleksi pembelajaran untuk peningkatan kualitas mengajar</p>
            </div>
            <button onclick="window.openModalRefleksi()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition flex items-center gap-2">
                <i class="fas fa-plus"></i> Tambah Refleksi
            </button>
        </div>

        <!-- Statistik Ringkas -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
                <p class="text-gray-500 text-xs">Total Refleksi</p>
                <p class="text-2xl font-bold" id="totalRefleksi">0</p>
            </div>
            <div class="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
                <p class="text-gray-500 text-xs">Minggu Ini</p>
                <p class="text-2xl font-bold" id="refleksiMingguIni">0</p>
            </div>
            <div class="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-500">
                <p class="text-gray-500 text-xs">Bulan Ini</p>
                <p class="text-2xl font-bold" id="refleksiBulanIni">0</p>
            </div>
            <div class="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-500">
                <p class="text-gray-500 text-xs">Rata-rata/Minggu</p>
                <p class="text-2xl font-bold" id="rataRataMinggu">0</p>
            </div>
        </div>

        <!-- Filter & Search -->
        <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div class="flex flex-col md:flex-row gap-4">
                <div class="flex-1">
                    <label class="block text-gray-700 text-sm font-medium mb-1">Cari Refleksi</label>
                    <div class="relative">
                        <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        <input type="text" id="searchRefleksi" placeholder="Topik atau catatan..." 
                            class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                    </div>
                </div>
                <div class="w-full md:w-48">
                    <label class="block text-gray-700 text-sm font-medium mb-1">Dari Tanggal</label>
                    <input type="date" id="filterDari" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                </div>
                <div class="w-full md:w-48">
                    <label class="block text-gray-700 text-sm font-medium mb-1">Sampai Tanggal</label>
                    <input type="date" id="filterSampai" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                </div>
            </div>
        </div>

        <!-- Loading State -->
        <div id="loadingRefleksi" class="text-center py-12">
            <i class="fas fa-spinner fa-spin text-4xl text-blue-500 mb-4"></i>
            <p class="text-gray-500">Memuat jurnal refleksi...</p>
        </div>

        <!-- List Refleksi -->
        <div id="listRefleksi" class="space-y-4 hidden">
            <!-- Cards akan di-render di sini -->
        </div>

        <!-- Empty State -->
        <div id="emptyRefleksi" class="text-center py-12 hidden">
            <i class="fas fa-book-open text-5xl text-gray-300 mb-4"></i>
            <h3 class="text-lg font-semibold text-gray-600">Belum ada refleksi</h3>
            <p class="text-gray-500 text-sm">Mulai catat perjalanan mengajar Anda</p>
        </div>

        <!-- MODAL FORM TAMBAH/EDIT REFLEKSI -->
        <div id="modalRefleksi" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-gray-800" id="modalTitle">Tambah Refleksi</h3>
                    <button onclick="window.closeModalRefleksi()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <form id="formRefleksi">
                    <input type="hidden" id="refleksiId">
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2">Tanggal *</label>
                            <input type="date" id="tanggal" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500" required>
                        </div>
                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2">Kelas</label>
                            <select id="kelas" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                                <option value="">Pilih Kelas</option>
                                <option value="1">satu</option>
                                <option value="2">dua</option>
                                <option value="3">tiga</option>
                                <option value="4">empat</option>
                                <option value="5">lima</option>
                                <option value="6">enam</option> 
                            </select>
                        </div>
                    </div>

                    <div class="mb-4">
                        <label class="block text-gray-700 text-sm font-bold mb-2">Topik Pembelajaran *</label>
                        <input type="text" id="topik" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500" required placeholder="Contoh: Persamaan Linear Dua Variabel">
                    </div>

                    <div class="mb-4">
                        <label class="block text-gray-700 text-sm font-bold mb-2">Apa yang Berjalan Baik? ✅</label>
                        <textarea id="berjalanBaik" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 h-20" placeholder="Hal positif yang terjadi selama pembelajaran..."></textarea>
                    </div>

                    <div class="mb-4">
                        <label class="block text-gray-700 text-sm font-bold mb-2">Apa yang Perlu Diperbaiki? ⚠️</label>
                        <textarea id="perluPerbaikan" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 h-20" placeholder="Kendala atau hal yang perlu ditingkatkan..."></textarea>
                    </div>

                    <div class="mb-4">
                        <label class="block text-gray-700 text-sm font-bold mb-2">Catatan Tambahan</label>
                        <textarea id="catatan" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 h-20" placeholder="Catatan lain yang relevan..."></textarea>
                    </div>

                    <div class="mb-4">
                        <label class="block text-gray-700 text-sm font-bold mb-2">Tindak Lanjut</label>
                        <input type="text" id="tindakLanjut" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500" placeholder="Rencana untuk pertemuan berikutnya...">
                    </div>

                    <div class="flex gap-2 pt-4">
                        <button type="button" onclick="window.closeModalRefleksi()" class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg">Batal</button>
                        <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">Simpan Refleksi</button>
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
    const modal = document.getElementById('modalRefleksi');
    const formRefleksi = document.getElementById('formRefleksi');
    const listRefleksi = document.getElementById('listRefleksi');
    const loadingRefleksi = document.getElementById('loadingRefleksi');
    const emptyRefleksi = document.getElementById('emptyRefleksi');
    const searchInput = document.getElementById('searchRefleksi');
    const filterDari = document.getElementById('filterDari');
    const filterSampai = document.getElementById('filterSampai');
    const modalTitle = document.getElementById('modalTitle');

    // Set tanggal hari ini default
    document.getElementById('tanggal').valueAsDate = new Date();

    // ============================================
    // NAVIGASI: KEMBALI KE DASHBOARD
    // ============================================
    window.kembaliKeDashboard = () => {
        // Navigate back to dashboard
        if (window.loadModule) {
            window.loadModule('dashboard');
        } else {
            window.location.href = 'dashboard.html';
        }
    }

    // --- FUNGSI MODAL ---
    window.openModalRefleksi = () => {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
    
    window.closeModalRefleksi = () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        formRefleksi.reset();
        document.getElementById('refleksiId').value = '';
        document.getElementById('tanggal').valueAsDate = new Date();
        modalTitle.textContent = 'Tambah Refleksi';
    }

    // --- RENDER CARD REFLEKSI ---
    function renderCard(docId, data) {
        const date = new Date(data.tanggal);
        const dateStr = date.toLocaleDateString('id-ID', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        return `
            <div class="bg-white rounded-lg shadow-sm border hover:shadow-md transition p-5">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center gap-3">
                        <div class="p-2 rounded-lg bg-blue-100 text-blue-600">
                            <i class="fas fa-book-open text-xl"></i>
                        </div>
                        <div>
                            <h4 class="font-semibold text-gray-800">${data.topik}</h4>
                            <p class="text-xs text-gray-500">${dateStr}</p>
                        </div>
                    </div>
                    <div class="flex gap-1">
                        <button onclick="window.editRefleksi('${docId}', ${JSON.stringify(data).replace(/'/g, "\\'")})" 
                            class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="window.deleteRefleksi('${docId}')" 
                            class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded" title="Hapus">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                ${data.kelas ? `<span class="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600 mb-3 inline-block">Kelas: ${data.kelas}</span>` : ''}
                
                <div class="space-y-3 text-sm">
                    ${data.berjalanBaik ? `
                        <div class="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                            <p class="font-medium text-green-700 mb-1">✅ Yang Berjalan Baik</p>
                            <p class="text-gray-700">${data.berjalanBaik}</p>
                        </div>
                    ` : ''}
                    
                    ${data.perluPerbaikan ? `
                        <div class="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded">
                            <p class="font-medium text-yellow-700 mb-1">⚠️ Perlu Perbaikan</p>
                            <p class="text-gray-700">${data.perluPerbaikan}</p>
                        </div>
                    ` : ''}
                    
                    ${data.catatan ? `
                        <div class="bg-gray-50 border-l-4 border-gray-400 p-3 rounded">
                            <p class="font-medium text-gray-700 mb-1">📝 Catatan</p>
                            <p class="text-gray-600">${data.catatan}</p>
                        </div>
                    ` : ''}
                    
                    ${data.tindakLanjut ? `
                        <div class="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                            <p class="font-medium text-blue-700 mb-1">🎯 Tindak Lanjut</p>
                            <p class="text-gray-700">${data.tindakLanjut}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // --- UPDATE STATISTIK ---
    function updateStats(refleksiList) {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        let total = refleksiList.length;
        let mingguIni = 0;
        let bulanIni = 0;
        
        refleksiList.forEach(r => {
            const rDate = new Date(r.tanggal);
            if (rDate >= startOfWeek) mingguIni++;
            if (rDate >= startOfMonth) bulanIni++;
        });
        
        const weeksPassed = Math.ceil(total / 4) || 1;
        const rataRata = (total / weeksPassed).toFixed(1);
        
        document.getElementById('totalRefleksi').textContent = total;
        document.getElementById('refleksiMingguIni').textContent = mingguIni;
        document.getElementById('refleksiBulanIni').textContent = bulanIni;
        document.getElementById('rataRataMinggu').textContent = rataRata;
    }

    // ============================================
    // READ: Load Data dari Firestore (✅ UPDATED: Security Filter)
    // ============================================
    async function loadRefleksi() {
        try {
            loadingRefleksi.classList.remove('hidden');
            listRefleksi.classList.add('hidden');
            emptyRefleksi.classList.add('hidden');

            // ✅ Admin Bypass Logic
            const userEmail = auth.currentUser?.email;
            const isAdmin = userEmail === ADMIN_EMAIL;
            
            let q;
            if (isAdmin) {
                // Admin: load SEMUA data
                q = query(collection(db, collectionName), orderBy("tanggal", "desc"));
            } else {
                // Guru: hanya load data milik sendiri
                q = query(collection(db, collectionName), 
                    where("userId", "==", auth.currentUser?.uid),
                    orderBy("tanggal", "desc")
                );
            }
            
            const snapshot = await getDocs(q);
            
            listRefleksi.innerHTML = '';
            const refleksiList = [];
            
            if (snapshot.empty) {
                loadingRefleksi.classList.add('hidden');
                emptyRefleksi.classList.remove('hidden');
                updateStats([]);
                return;
            }

            const keyword = searchInput?.value?.toLowerCase() || '';
            const dariDate = filterDari?.value ? new Date(filterDari.value) : null;
            const sampaiDate = filterSampai?.value ? new Date(filterSampai.value) : null;

            snapshot.forEach(docSnap => {
                const data = docSnap.data();
                refleksiList.push(data);
                
                // Filter by search keyword
                if (keyword) {
                    const searchable = `${data.topik} ${data.berjalanBaik} ${data.perluPerbaikan} ${data.catatan}`.toLowerCase();
                    if (!searchable.includes(keyword)) return;
                }
                
                // Filter by date range
                const rDate = new Date(data.tanggal);
                if (dariDate && rDate < dariDate) return;
                if (sampaiDate && rDate > sampaiDate) return;
                
                listRefleksi.innerHTML += renderCard(docSnap.id, data);
            });

            updateStats(refleksiList);

            if (listRefleksi.innerHTML.trim() === '') {
                emptyRefleksi.innerHTML = `
                    <i class="fas fa-search text-5xl text-gray-300 mb-4"></i>
                    <h3 class="text-lg font-semibold text-gray-600">Tidak ada hasil</h3>
                    <p class="text-gray-500 text-sm">Coba ubah kata kunci atau filter tanggal</p>
                `;
                emptyRefleksi.classList.remove('hidden');
            } else {
                listRefleksi.classList.remove('hidden');
                emptyRefleksi.classList.add('hidden');
            }

        } catch (error) {
            console.error("Error loading refleksi:", error);
            loadingRefleksi.innerHTML = `
                <i class="fas fa-exclamation-circle text-3xl text-red-500"></i>
                <p class="text-red-500 mt-2">Gagal memuat data</p>
            `;
        } finally {
            loadingRefleksi.classList.add('hidden');
        }
    }

    // ============================================
    // CREATE & UPDATE: Submit Form (✅ UPDATED: Add userId)
    // ============================================
    formRefleksi.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('refleksiId').value;
        const data = {
            tanggal: document.getElementById('tanggal').value,
            kelas: document.getElementById('kelas').value,
            topik: document.getElementById('topik').value,
            berjalanBaik: document.getElementById('berjalanBaik').value,
            perluPerbaikan: document.getElementById('perluPerbaikan').value,
            catatan: document.getElementById('catatan').value,
            tindakLanjut: document.getElementById('tindakLanjut').value,
            updatedAt: new Date()
        };

        try {
            if (id) {
                // Update existing
                await updateDoc(doc(db, collectionName, id), data);
                alert('✅ Refleksi berhasil diupdate!');
            } else {
                // Create new with userId
                data.createdAt = new Date();
                data.userId = auth.currentUser?.uid;  // ✅ TAMBAH: Field userId
                await addDoc(collection(db, collectionName), data);
                alert('✅ Refleksi berhasil ditambahkan!');
            }
            window.closeModalRefleksi();
            loadRefleksi();
        } catch (error) {
            console.error("Error saving refleksi:", error);
            alert("❌ Gagal menyimpan: " + error.message);
        }
    });

    // --- EDIT: Isi Form dengan Data Existing ---
    window.editRefleksi = (id, data) => {
        const parsed = typeof data === 'string' ? JSON.parse(data.replace(/\\'/g, "'")) : data;
        
        document.getElementById('refleksiId').value = id;
        document.getElementById('tanggal').value = parsed.tanggal;
        document.getElementById('kelas').value = parsed.kelas || '';
        document.getElementById('topik').value = parsed.topik;
        document.getElementById('berjalanBaik').value = parsed.berjalanBaik || '';
        document.getElementById('perluPerbaikan').value = parsed.perluPerbaikan || '';
        document.getElementById('catatan').value = parsed.catatan || '';
        document.getElementById('tindakLanjut').value = parsed.tindakLanjut || '';
        
        modalTitle.textContent = 'Edit Refleksi';
        window.openModalRefleksi();
    }

    // --- DELETE: Hapus Data ---
    window.deleteRefleksi = async (id) => {
        if (confirm('⚠️ Apakah Anda yakin ingin menghapus refleksi ini?')) {
            try {
                await deleteDoc(doc(db, collectionName, id));
                alert('✅ Refleksi berhasil dihapus!');
                loadRefleksi();
            } catch (error) {
                console.error("Error deleting refleksi:", error);
                alert("❌ Gagal menghapus: " + error.message);
            }
        }
    }

    // --- SEARCH & FILTER Events ---
    if (searchInput) searchInput.addEventListener('input', loadRefleksi);
    if (filterDari) filterDari.addEventListener('change', loadRefleksi);
    if (filterSampai) filterSampai.addEventListener('change', loadRefleksi);

    // Initial Load
    loadRefleksi();
}
