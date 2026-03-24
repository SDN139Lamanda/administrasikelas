// modules/penilaian.js
// Module Penilaian - Input Nilai, Kalkulasi & Analisis

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

const collectionName = "penilaian";

// ============================================
// FUNGSI RENDER - Menghasilkan HTML Module
// ============================================
export function render() {
    const div = document.createElement('div');
    div.innerHTML = `
        <!-- Header Section -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div>
                <h2 class="text-2xl font-bold text-gray-800">Penilaian & Laporan</h2>
                <p class="text-gray-500 text-sm">Input nilai siswa dan analisis hasil pembelajaran</p>
            </div>
            <button onclick="window.openModalNilai()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition flex items-center gap-2">
                <i class="fas fa-plus"></i> Input Nilai
            </button>
        </div>

        <!-- Statistik Card -->
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div class="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
                <p class="text-gray-500 text-xs">Total Penilaian</p>
                <p class="text-2xl font-bold" id="totalPenilaian">0</p>
            </div>
            <div class="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
                <p class="text-gray-500 text-xs">Rata-rata Kelas</p>
                <p class="text-2xl font-bold" id="rataRataKelas">0</p>
            </div>
            <div class="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-500">
                <p class="text-gray-500 text-xs">Nilai Tertinggi</p>
                <p class="text-2xl font-bold" id="nilaiTertinggi">0</p>
            </div>
            <div class="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-500">
                <p class="text-gray-500 text-xs">Nilai Terendah</p>
                <p class="text-2xl font-bold" id="nilaiTerendah">0</p>
            </div>
            <div class="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500">
                <p class="text-gray-500 text-xs">Di Bawah KKM</p>
                <p class="text-2xl font-bold" id="diBawahKKM">0</p>
            </div>
        </div>

        <!-- Filter & Search -->
        <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div class="flex flex-col md:flex-row gap-4">
                <div class="flex-1">
                    <label class="block text-gray-700 text-sm font-medium mb-1">Cari Siswa</label>
                    <div class="relative">
                        <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        <input type="text" id="searchNilai" placeholder="Nama siswa..." 
                            class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                    </div>
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
                <div class="w-full md:w-48">
                    <label class="block text-gray-700 text-sm font-medium mb-1">Jenis Penilaian</label>
                    <select id="filterJenis" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                        <option value="">Semua Jenis</option>
                        <option value="harian">Tugas Harian</option>
                        <option value="uts">UTS</option>
                        <option value="uas">UAS</option>
                        <option value="praktik">Praktik</option>
                    </select>
                </div>
                <div class="w-full md:w-32">
                    <label class="block text-gray-700 text-sm font-medium mb-1">KKM</label>
                    <input type="number" id="filterKKM" value="75" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                </div>
            </div>
        </div>

        <!-- Grafik Sederhana -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 class="text-lg font-bold text-gray-700 mb-4">Distribusi Nilai</h3>
            <div id="chartContainer" class="h-48 flex items-end justify-around gap-2 px-4">
                <!-- Chart bars akan di-render di sini -->
            </div>
            <div class="flex justify-around mt-2 text-xs text-gray-500">
                <span>0-59</span>
                <span>60-69</span>
                <span>70-79</span>
                <span>80-89</span>
                <span>90-100</span>
            </div>
        </div>

        <!-- Loading State -->
        <div id="loadingNilai" class="text-center py-12">
            <i class="fas fa-spinner fa-spin text-4xl text-blue-500 mb-4"></i>
            <p class="text-gray-500">Memuat data penilaian...</p>
        </div>

        <!-- Tabel Nilai -->
        <div class="bg-white rounded-lg shadow-sm overflow-hidden hidden" id="tableNilai">
            <div class="overflow-x-auto">
                <table class="min-w-full text-left text-sm">
                    <thead class="bg-gray-50 uppercase text-xs font-bold text-gray-600">
                        <tr>
                            <th class="px-4 py-3">Tanggal</th>
                            <th class="px-4 py-3">Nama Siswa</th>
                            <th class="px-4 py-3">Kelas</th>
                            <th class="px-4 py-3">Jenis</th>
                            <th class="px-4 py-3">Mapel</th>
                            <th class="px-4 py-3 text-center">Nilai</th>
                            <th class="px-4 py-3 text-center">Status</th>
                            <th class="px-4 py-3 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody id="tbodyNilai" class="divide-y divide-gray-200">
                        <!-- Data akan di-render di sini -->
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Empty State -->
        <div id="emptyNilai" class="text-center py-12 hidden">
            <i class="fas fa-clipboard-list text-5xl text-gray-300 mb-4"></i>
            <h3 class="text-lg font-semibold text-gray-600">Belum ada data penilaian</h3>
            <p class="text-gray-500 text-sm">Klik "Input Nilai" untuk memulai</p>
        </div>

        <!-- MODAL FORM INPUT/EDIT NILAI -->
        <div id="modalNilai" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-gray-800" id="modalTitle">Input Nilai</h3>
                    <button onclick="window.closeModalNilai()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <form id="formNilai">
                    <input type="hidden" id="nilaiId">
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2">Nama Siswa *</label>
                            <input type="text" id="namaSiswa" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500" required placeholder="Nama lengkap">
                        </div>
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
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2">Jenis Penilaian *</label>
                            <select id="jenis" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500" required>
                                <option value="">Pilih Jenis</option>
                                <option value="harian">Tugas Harian</option>
                                <option value="uts">UTS</option>
                                <option value="uas">UAS</option>
                                <option value="praktik">Praktik</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2">Mapel</label>
                            <input type="text" id="mapel" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500" placeholder="Contoh: Matematika">
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2">Tanggal *</label>
                            <input type="date" id="tanggal" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500" required>
                        </div>
                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2">Nilai (0-100) *</label>
                            <input type="number" id="nilai" min="0" max="100" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500" required placeholder="0-100">
                        </div>
                    </div>

                    <div class="mb-4">
                        <label class="block text-gray-700 text-sm font-bold mb-2">Catatan</label>
                        <textarea id="catatan" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 h-20" placeholder="Catatan tambahan tentang penilaian..."></textarea>
                    </div>

                    <div class="flex gap-2 pt-4">
                        <button type="button" onclick="window.closeModalNilai()" class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg">Batal</button>
                        <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">Simpan Nilai</button>
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
    const modal = document.getElementById('modalNilai');
    const formNilai = document.getElementById('formNilai');
    const tableNilai = document.getElementById('tableNilai');
    const tbodyNilai = document.getElementById('tbodyNilai');
    const loadingNilai = document.getElementById('loadingNilai');
    const emptyNilai = document.getElementById('emptyNilai');
    const searchInput = document.getElementById('searchNilai');
    const filterKelas = document.getElementById('filterKelas');
    const filterJenis = document.getElementById('filterJenis');
    const filterKKM = document.getElementById('filterKKM');
    const modalTitle = document.getElementById('modalTitle');
    const chartContainer = document.getElementById('chartContainer');

    // Set tanggal hari ini default
    document.getElementById('tanggal').valueAsDate = new Date();

    // --- FUNGSI MODAL ---
    window.openModalNilai = () => {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
    
    window.closeModalNilai = () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        formNilai.reset();
        document.getElementById('nilaiId').value = '';
        document.getElementById('tanggal').valueAsDate = new Date();
        modalTitle.textContent = 'Input Nilai';
    }

    // --- RENDER CHART DISTRIBUTION ---
    function renderChart(nilaiList) {
        const ranges = [
            { min: 0, max: 59, count: 0, label: '0-59' },
            { min: 60, max: 69, count: 0, label: '60-69' },
            { min: 70, max: 79, count: 0, label: '70-79' },
            { min: 80, max: 89, count: 0, label: '80-89' },
            { min: 90, max: 100, count: 0, label: '90-100' }
        ];

        nilaiList.forEach(n => {
            const nilai = parseInt(n.nilai);
            ranges.forEach(r => {
                if (nilai >= r.min && nilai <= r.max) r.count++;
            });
        });

        const maxCount = Math.max(...ranges.map(r => r.count), 1);
        const colors = ['bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500'];

        chartContainer.innerHTML = ranges.map((r, i) => `
            <div class="flex flex-col items-center flex-1">
                <div class="w-full ${colors[i]} rounded-t transition-all" style="height: ${Math.max((r.count / maxCount) * 150, 4)}px; min-height: 4px;"></div>
                <span class="text-xs mt-2 font-medium">${r.count}</span>
            </div>
        `).join('');
    }

    // --- UPDATE STATISTIK ---
    function updateStats(nilaiList) {
        const total = nilaiList.length;
        const kkm = parseInt(filterKKM.value) || 75;
        
        if (total === 0) {
            document.getElementById('totalPenilaian').textContent = '0';
            document.getElementById('rataRataKelas').textContent = '0';
            document.getElementById('nilaiTertinggi').textContent = '0';
            document.getElementById('nilaiTerendah').textContent = '0';
            document.getElementById('diBawahKKM').textContent = '0';
            return;
        }

        const sum = nilaiList.reduce((acc, n) => acc + parseInt(n.nilai), 0);
        const avg = (sum / total).toFixed(1);
        const max = Math.max(...nilaiList.map(n => parseInt(n.nilai)));
        const min = Math.min(...nilaiList.map(n => parseInt(n.nilai)));
        const belowKKM = nilaiList.filter(n => parseInt(n.nilai) < kkm).length;

        document.getElementById('totalPenilaian').textContent = total;
        document.getElementById('rataRataKelas').textContent = avg;
        document.getElementById('nilaiTertinggi').textContent = max;
        document.getElementById('nilaiTerendah').textContent = min;
        document.getElementById('diBawahKKM').textContent = belowKKM;
    }

    // --- RENDER TABLE ROW ---
    function renderRow(docId, data, kkm) {
        const nilai = parseInt(data.nilai);
        const status = nilai >= kkm 
            ? '<span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">Lulus</span>'
            : '<span class="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">Remedial</span>';
        
        const jenisLabels = {
            'harian': 'Tugas Harian',
            'uts': 'UTS',
            'uas': 'UAS',
            'praktik': 'Praktik'
        };

        return `
            <tr class="hover:bg-gray-50">
                <td class="px-4 py-3">${data.tanggal}</td>
                <td class="px-4 py-3 font-medium">${data.namaSiswa}</td>
                <td class="px-4 py-3">${data.kelas}</td>
                <td class="px-4 py-3">${jenisLabels[data.jenis] || data.jenis}</td>
                <td class="px-4 py-3">${data.mapel || '-'}</td>
                <td class="px-4 py-3 text-center">
                    <span class="font-bold ${nilai >= kkm ? 'text-green-600' : 'text-red-600'}">${nilai}</span>
                </td>
                <td class="px-4 py-3 text-center">${status}</td>
                <td class="px-4 py-3 text-center">
                    <button onclick="window.editNilai('${docId}', ${JSON.stringify(data).replace(/'/g, "\\'")})" 
                        class="text-blue-600 hover:text-blue-800 mx-1" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="window.deleteNilai('${docId}')" 
                        class="text-red-600 hover:text-red-800 mx-1" title="Hapus">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }

    // --- READ: Load Data dari Firestore ---
    async function loadNilai() {
        try {
            loadingNilai.classList.remove('hidden');
            tableNilai.classList.add('hidden');
            emptyNilai.classList.add('hidden');

            let q = query(collection(db, collectionName), orderBy("tanggal", "desc"));
            const snapshot = await getDocs(q);
            
            tbodyNilai.innerHTML = '';
            const nilaiList = [];
            const kkm = parseInt(filterKKM.value) || 75;

            if (snapshot.empty) {
                loadingNilai.classList.add('hidden');
                emptyNilai.classList.remove('hidden');
                updateStats([]);
                renderChart([]);
                return;
            }

            const keyword = searchInput?.value?.toLowerCase() || '';
            const kelas = filterKelas?.value || '';
            const jenis = filterJenis?.value || '';

            snapshot.forEach(docSnap => {
                const data = docSnap.data();
                nilaiList.push(data);
                
                // Filter by search
                if (keyword && !data.namaSiswa.toLowerCase().includes(keyword)) return;
                
                // Filter by kelas
                if (kelas && data.kelas !== kelas) return;
                
                // Filter by jenis
                if (jenis && data.jenis !== jenis) return;
                
                tbodyNilai.innerHTML += renderRow(docSnap.id, data, kkm);
            });

            updateStats(nilaiList);
            renderChart(nilaiList);

            if (tbodyNilai.innerHTML.trim() === '') {
                emptyNilai.innerHTML = `
                    <i class="fas fa-search text-5xl text-gray-300 mb-4"></i>
                    <h3 class="text-lg font-semibold text-gray-600">Tidak ada hasil</h3>
                    <p class="text-gray-500 text-sm">Coba ubah kata kunci atau filter</p>
                `;
                emptyNilai.classList.remove('hidden');
            } else {
                tableNilai.classList.remove('hidden');
                emptyNilai.classList.add('hidden');
            }

        } catch (error) {
            console.error("Error loading nilai:", error);
            loadingNilai.innerHTML = `
                <i class="fas fa-exclamation-circle text-3xl text-red-500"></i>
                <p class="text-red-500 mt-2">Gagal memuat  ${error.message}</p>
            `;
        } finally {
            loadingNilai.classList.add('hidden');
        }
    }

    // --- CREATE & UPDATE: Submit Form ---
    formNilai.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('nilaiId').value;
        const data = {
            namaSiswa: document.getElementById('namaSiswa').value,
            kelas: document.getElementById('kelas').value,
            jenis: document.getElementById('jenis').value,
            mapel: document.getElementById('mapel').value,
            tanggal: document.getElementById('tanggal').value,
            nilai: document.getElementById('nilai').value,
            catatan: document.getElementById('catatan').value,
            updatedAt: new Date()
        };

        try {
            if (id) {
                await updateDoc(doc(db, collectionName, id), data);
                alert('✅ Nilai berhasil diupdate!');
            } else {
                data.createdAt = new Date();
                await addDoc(collection(db, collectionName), data);
                alert('✅ Nilai berhasil disimpan!');
            }
            window.closeModalNilai();
            loadNilai();
        } catch (error) {
            console.error("Error saving nilai:", error);
            alert("❌ Gagal menyimpan: " + error.message);
        }
    });

    // --- EDIT: Isi Form dengan Data Existing ---
    window.editNilai = (id, data) => {
        const parsed = typeof data === 'string' ? JSON.parse(data.replace(/\\'/g, "'")) : data;
        
        document.getElementById('nilaiId').value = id;
        document.getElementById('namaSiswa').value = parsed.namaSiswa;
        document.getElementById('kelas').value = parsed.kelas;
        document.getElementById('jenis').value = parsed.jenis;
        document.getElementById('mapel').value = parsed.mapel || '';
        document.getElementById('tanggal').value = parsed.tanggal;
        document.getElementById('nilai').value = parsed.nilai;
        document.getElementById('catatan').value = parsed.catatan || '';
        
        modalTitle.textContent = 'Edit Nilai';
        window.openModalNilai();
    }

    // --- DELETE: Hapus Data ---
    window.deleteNilai = async (id) => {
        if (confirm('⚠️ Apakah Anda yakin ingin menghapus nilai ini?')) {
            try {
                await deleteDoc(doc(db, collectionName, id));
                alert('✅ Nilai berhasil dihapus!');
                loadNilai();
            } catch (error) {
                console.error("Error deleting nilai:", error);
                alert("❌ Gagal menghapus: " + error.message);
            }
        }
    }

    // --- SEARCH & FILTER Events ---
    if (searchInput) searchInput.addEventListener('input', loadNilai);
    if (filterKelas) filterKelas.addEventListener('change', loadNilai);
    if (filterJenis) filterJenis.addEventListener('change', loadNilai);
    if (filterKKM) filterKKM.addEventListener('input', loadNilai);

    // Initial Load
    loadNilai();
}
