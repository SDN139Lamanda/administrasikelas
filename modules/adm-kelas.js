// modules/adm-kelas.js
// Module Administrasi Kelas - CRUD Siswa + Absensi Digital
// SDN 139 LAMANDA

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

const collectionName = "siswa";
const absensiCollection = "absensi";

// ============================================
// FUNGSI RENDER - Menghasilkan HTML Module
// ============================================
export function render() {
    const div = document.createElement('div');
    div.innerHTML = `
        <!-- TAB NAVIGATION -->
        <div class="border-b border-gray-200 mb-6">
            <nav class="-mb-px flex space-x-8">
                <button onclick="window.showTab('data-siswa')" id="tab-data-siswa" 
                    class="tab-button py-4 px-1 border-b-2 font-medium text-sm active border-blue-500 text-blue-600">
                    <i class="fas fa-users mr-2"></i>Data Siswa
                </button>
                <button onclick="window.showTab('absensi')" id="tab-absensi" 
                    class="tab-button py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700">
                    <i class="fas fa-clipboard-check mr-2"></i>Absensi Digital
                </button>
            </nav>
        </div>

        <!-- TAB CONTENT: DATA SISWA -->
        <div id="content-data-siswa" class="tab-content">
            <!-- Statistik Card -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div class="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
                    <div class="flex items-center">
                        <div class="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
                            <i class="fas fa-users text-xl"></i>
                        </div>
                        <div>
                            <p class="text-gray-500 text-sm">Total Siswa</p>
                            <p class="text-2xl font-bold" id="totalSiswa">0</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
                    <div class="flex items-center">
                        <div class="p-3 rounded-full bg-green-100 text-green-500 mr-4">
                            <i class="fas fa-user-check text-xl"></i>
                        </div>
                        <div>
                            <p class="text-gray-500 text-sm">Laki-laki</p>
                            <p class="text-2xl font-bold" id="totalLaki">0</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white p-6 rounded-lg shadow-sm border-l-4 border-pink-500">
                    <div class="flex items-center">
                        <div class="p-3 rounded-full bg-pink-100 text-pink-500 mr-4">
                            <i class="fas fa-user-graduate text-xl"></i>
                        </div>
                        <div>
                            <p class="text-gray-500 text-sm">Perempuan</p>
                            <p class="text-2xl font-bold" id="totalPerempuan">0</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tabel Data Siswa -->
            <div class="bg-white rounded-lg shadow-sm p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-bold text-gray-700">Data Siswa</h3>
                    <button onclick="window.openModalSiswa()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition">
                        <i class="fas fa-plus mr-1"></i> Tambah Siswa
                    </button>
                </div>
                
                <!-- Loading State -->
                <div id="loadingTable" class="text-center py-8">
                    <i class="fas fa-spinner fa-spin text-3xl text-blue-500"></i>
                    <p class="text-gray-500 mt-2">Memuat data siswa...</p>
                </div>

                <!-- Tabel -->
                <div class="overflow-x-auto">
                    <table class="min-w-full text-left text-sm whitespace-nowrap hidden" id="tableSiswa">
                        <thead class="uppercase tracking-wider border-b-2 border-gray-200 bg-gray-50">
                            <tr>
                                <th class="px-6 py-3">NISN</th>
                                <th class="px-6 py-3">Nama Siswa</th>
                                <th class="px-6 py-3">Kelas</th>
                                <th class="px-6 py-3">L/P</th>
                                <th class="px-6 py-3">Status</th>
                                <th class="px-6 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="tbodySiswa"></tbody>
                    </table>
                </div>
                
                <!-- Empty State -->
                <div id="emptyState" class="text-center py-8 hidden">
                    <i class="fas fa-inbox text-4xl text-gray-300"></i>
                    <p class="text-gray-500 mt-2">Belum ada data siswa</p>
                </div>
            </div>
        </div>

        <!-- TAB CONTENT: ABSENSI DIGITAL -->
        <div id="content-absensi" class="tab-content hidden">
            <div class="bg-white rounded-lg shadow-sm p-8" id="absensiContent">
                <!-- KOP ABSENSI -->
                <div class="text-center mb-6 pb-6 border-b-2 border-gray-300">
                    <h2 class="text-2xl font-bold text-gray-800 mb-2">ABSENSI DIGITAL SDN 139 LAMANDA</h2>
                    <p class="text-gray-500 text-sm">Sistem Manajemen Kelas Digital</p>
                </div>

                <!-- FORM INFO ABSENSI -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div>
                        <label class="block text-gray-700 text-sm font-bold mb-2">Kelas *</label>
                        <select id="absenKelas" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500" required>
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
                        <label class="block text-gray-700 text-sm font-bold mb-2">Semester *</label>
                        <select id="absenSemester" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500" required>
                            <option value="">Pilih Semester</option>
                            <option value="1">Semester 1 (Ganjil)</option>
                            <option value="2">Semester 2 (Genap)</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-gray-700 text-sm font-bold mb-2">Tahun Pelajaran *</label>
                        <input type="text" id="absenTahun" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500" 
                            placeholder="2025/2026" value="2025/2026">
                    </div>
                    <div>
                        <label class="block text-gray-700 text-sm font-bold mb-2">Tanggal *</label>
                        <input type="date" id="absenTanggal" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500" required>
                    </div>
                </div>

                <div class="mb-6">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Nama Guru *</label>
                    <input type="text" id="absenGuru" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500" 
                        placeholder="Nama guru pengajar" required>
                </div>

                <!-- TOMBOL LOAD SISWA -->
                <div class="mb-4">
                    <button onclick="window.loadSiswaUntukAbsen()" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm transition">
                        <i class="fas fa-sync-alt mr-2"></i>Load Data Siswa dari Kelas Terpilih
                    </button>
                </div>

                <!-- Loading State -->
                <div id="loadingAbsensi" class="text-center py-8 hidden">
                    <i class="fas fa-spinner fa-spin text-3xl text-blue-500"></i>
                    <p class="text-gray-500 mt-2">Memuat data siswa...</p>
                </div>

                <!-- TABEL ABSENSI -->
                <div class="overflow-x-auto">
                    <table class="min-w-full text-left text-sm hidden" id="tableAbsensi">
                        <thead class="uppercase tracking-wider border-b-2 border-gray-200 bg-gray-50">
                            <tr>
                                <th class="px-4 py-3">No</th>
                                <th class="px-4 py-3">Nama Siswa</th>
                                <th class="px-4 py-3 text-center">H</th>
                                <th class="px-4 py-3 text-center">S</th>
                                <th class="px-4 py-3 text-center">I</th>
                                <th class="px-4 py-3 text-center">A</th>
                                <th class="px-4 py-3">Keterangan</th>
                            </tr>
                        </thead>
                        <tbody id="tbodyAbsensi"></tbody>
                    </table>
                </div>

                <!-- Empty State -->
                <div id="emptyAbsensi" class="text-center py-8 hidden">
                    <i class="fas fa-users-slash text-4xl text-gray-300"></i>
                    <p class="text-gray-500 mt-2">Pilih kelas dan klik "Load Data Siswa"</p>
                </div>

                <!-- TOMBOL AKSI -->
                <div class="mt-6 flex flex-wrap gap-4">
                    <button onclick="window.simpanAbsensi()" class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-sm transition">
                        <i class="fas fa-save mr-2"></i>Simpan Absensi
                    </button>
                    <button onclick="window.downloadExcel()" class="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg text-sm transition">
                        <i class="fas fa-file-excel mr-2"></i>Download Excel
                    </button>
                    <button onclick="window.downloadPDF()" class="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg text-sm transition">
                        <i class="fas fa-file-pdf mr-2"></i>Download PDF
                    </button>
                    <button onclick="window.cetakAbsensi()" class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg text-sm transition">
                        <i class="fas fa-print mr-2"></i>Cetak
                    </button>
                </div>

                <!-- INFO GURU -->
                <div class="mt-8 pt-6 border-t border-gray-300">
                    <div class="flex justify-between items-end">
                        <div class="text-sm text-gray-500">
                            <p>Dicetak pada: <span id="tanggalCetak"></span></p>
                        </div>
                        <div class="text-center">
                            <p class="text-sm text-gray-700 mb-16">Guru Mata Pelajaran,</p>
                            <p class="font-bold text-gray-800 border-b-2 border-gray-800 px-8 pb-1" id="ttdGuru">_________________________</p>
                            <p class="text-sm text-gray-500 mt-1" id="namaGuruTtd"></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- MODAL FORM TAMBAH/EDIT SISWA -->
        <div id="modalSiswa" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-gray-800" id="modalTitle">Tambah Siswa</h3>
                    <button onclick="window.closeModalSiswa()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <form id="formSiswa">
                    <input type="hidden" id="siswaId">
                    
                    <div class="mb-4">
                        <label class="block text-gray-700 text-sm font-bold mb-2">NISN</label>
                        <input type="text" id="nisn" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500" required placeholder="Contoh: 0012345678">
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-gray-700 text-sm font-bold mb-2">Nama Lengkap</label>
                        <input type="text" id="nama" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500" required placeholder="Nama siswa">
                    </div>

                    <div class="mb-4">
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
                    
                    <div class="mb-4">
                        <label class="block text-gray-700 text-sm font-bold mb-2">Jenis Kelamin</label>
                        <select id="jenisKelamin" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500" required>
                            <option value="">Pilih...</option>
                            <option value="L">Laki-laki</option>
                            <option value="P">Perempuan</option>
                        </select>
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-gray-700 text-sm font-bold mb-2">Status</label>
                        <select id="status" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500" required>
                            <option value="Aktif">Aktif</option>
                            <option value="Tidak Aktif">Tidak Aktif</option>
                        </select>
                    </div>
                    
                    <div class="flex gap-2">
                        <button type="button" onclick="window.closeModalSiswa()" class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg">Batal</button>
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
    // DOM Elements - Data Siswa
    const modal = document.getElementById('modalSiswa');
    const formSiswa = document.getElementById('formSiswa');
    const tbodySiswa = document.getElementById('tbodySiswa');
    const tableSiswa = document.getElementById('tableSiswa');
    const loadingTable = document.getElementById('loadingTable');
    const emptyState = document.getElementById('emptyState');
    const modalTitle = document.getElementById('modalTitle');

    // DOM Elements - Absensi
    const loadingAbsensi = document.getElementById('loadingAbsensi');
    const tableAbsensi = document.getElementById('tableAbsensi');
    const emptyAbsensi = document.getElementById('emptyAbsensi');
    const tbodyAbsensi = document.getElementById('tbodyAbsensi');

    // Set tanggal hari ini
    document.getElementById('absenTanggal').valueAsDate = new Date();
    document.getElementById('tanggalCetak').textContent = new Date().toLocaleDateString('id-ID', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    // ============================================
    // FUNGSI MODAL SISWA
    // ============================================
    window.openModalSiswa = () => {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
    
    window.closeModalSiswa = () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        formSiswa.reset();
        document.getElementById('siswaId').value = '';
        modalTitle.textContent = 'Tambah Siswa';
    }

    // ============================================
    // FUNGSI GANTI TAB
    // ============================================
    window.showTab = (tabName) => {
        document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active', 'border-blue-500', 'text-blue-600');
            btn.classList.add('border-transparent', 'text-gray-500');
        });
        document.getElementById(`content-${tabName}`).classList.remove('hidden');
        document.getElementById(`tab-${tabName}`).classList.add('active', 'border-blue-500', 'text-blue-600');
        document.getElementById(`tab-${tabName}`).classList.remove('border-transparent', 'text-gray-500');
        
        if (tabName === 'data-siswa') {
            loadSiswa();
        }
    }

    // ============================================
    // DATA SISWA - LOAD
    // ============================================
    async function loadSiswa() {
        try {
            const q = query(collection(db, collectionName), orderBy("nama"));
            const querySnapshot = await getDocs(q);
            
            tbodySiswa.innerHTML = '';
            let total = 0, laki = 0, perempuan = 0;

            if (querySnapshot.empty) {
                tableSiswa.classList.add('hidden');
                emptyState.classList.remove('hidden');
            } else {
                tableSiswa.classList.remove('hidden');
                emptyState.classList.add('hidden');

                querySnapshot.forEach((docSnap) => {
                    const data = docSnap.data();
                    total++;
                    if(data.jenisKelamin === 'L') laki++;
                    else perempuan++;

                    const row = `
                        <tr class="border-b hover:bg-gray-50">
                            <td class="px-6 py-4">${data.nisn}</td>
                            <td class="px-6 py-4 font-medium">${data.nama}</td>
                            <td class="px-6 py-4"><span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Kelas ${data.kelas}</span></td>
                            <td class="px-6 py-4">${data.jenisKelamin}</td>
                            <td class="px-6 py-4">
                                <span class="${data.status === 'Aktif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} py-1 px-3 rounded-full text-xs">
                                    ${data.status}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-center">
                                <button onclick="window.editSiswa('${docSnap.id}', '${data.nisn}', '${data.nama}', '${data.kelas}', '${data.jenisKelamin}', '${data.status}')" 
                                    class="text-blue-600 hover:text-blue-800 mx-1" title="Edit">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="window.deleteSiswa('${docSnap.id}')" 
                                    class="text-red-600 hover:text-red-800 mx-1" title="Hapus">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                    tbodySiswa.innerHTML += row;
                });
            }

            document.getElementById('totalSiswa').textContent = total;
            document.getElementById('totalLaki').textContent = laki;
            document.getElementById('totalPerempuan').textContent = perempuan;

        } catch (error) {
            console.error("Error loading siswa:", error);
        } finally {
            loadingTable.classList.add('hidden');
        }
    }

    // ============================================
    // DATA SISWA - SUBMIT FORM
    // ============================================
    formSiswa.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('siswaId').value;
        const data = {
            nisn: document.getElementById('nisn').value,
            nama: document.getElementById('nama').value,
            kelas: document.getElementById('kelas').value,
            jenisKelamin: document.getElementById('jenisKelamin').value,
            status: document.getElementById('status').value,
            updatedAt: new Date()
        };

        try {
            if (id) {
                await updateDoc(doc(db, collectionName, id), data);
                alert('✅ Data berhasil diupdate!');
            } else {
                data.createdAt = new Date();
                await addDoc(collection(db, collectionName), data);
                alert('✅ Siswa berhasil ditambahkan!');
            }
            window.closeModalSiswa();
            loadSiswa();
        } catch (error) {
            alert("❌ Gagal menyimpan: " + error.message);
        }
    });

    // ============================================
    // DATA SISWA - EDIT
    // ============================================
    window.editSiswa = (id, nisn, nama, kelas, jenisKelamin, status) => {
        document.getElementById('siswaId').value = id;
        document.getElementById('nisn').value = nisn;
        document.getElementById('nama').value = nama;
        document.getElementById('kelas').value = kelas;
        document.getElementById('jenisKelamin').value = jenisKelamin;
        document.getElementById('status').value = status;
        modalTitle.textContent = 'Edit Siswa';
        window.openModalSiswa();
    }

    // ============================================
    // DATA SISWA - DELETE
    // ============================================
    window.deleteSiswa = async (id) => {
        if (confirm('⚠️ Apakah Anda yakin ingin menghapus data siswa ini?')) {
            try {
                await deleteDoc(doc(db, collectionName, id));
                alert('✅ Siswa berhasil dihapus!');
                loadSiswa();
            } catch (error) {
                alert("❌ Gagal menghapus: " + error.message);
            }
        }
    }

    // ============================================
    // ABSENSI - LOAD SISWA UNTUK ABSEN
    // ============================================
    window.loadSiswaUntukAbsen = async () => {
        const kelas = document.getElementById('absenKelas').value;
        
        if (!kelas) {
            alert('⚠️ Pilih kelas terlebih dahulu!');
            return;
        }

        loadingAbsensi.classList.remove('hidden');
        tableAbsensi.classList.add('hidden');
        emptyAbsensi.classList.add('hidden');
        tbodyAbsensi.innerHTML = '';

        try {
            const q = query(collection(db, collectionName), where("kelas", "==", kelas), orderBy("nama"));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                loadingAbsensi.classList.add('hidden');
                emptyAbsensi.innerHTML = `
                    <i class="fas fa-users-slash text-4xl text-gray-300"></i>
                    <p class="text-gray-500 mt-2">Tidak ada siswa di Kelas ${kelas}</p>
                `;
                emptyAbsensi.classList.remove('hidden');
                return;
            }

            let no = 1;
            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                tbodyAbsensi.innerHTML += `
                    <tr class="border-b hover:bg-gray-50">
                        <td class="px-4 py-3">${no++}</td>
                        <td class="px-4 py-3 font-medium">${data.nama}</td>
                        <td class="px-4 py-3 text-center">
                            <input type="radio" name="absen_${docSnap.id}" value="H" checked class="h-4 w-4 text-green-600">
                        </td>
                        <td class="px-4 py-3 text-center">
                            <input type="radio" name="absen_${docSnap.id}" value="S" class="h-4 w-4 text-yellow-600">
                        </td>
                        <td class="px-4 py-3 text-center">
                            <input type="radio" name="absen_${docSnap.id}" value="I" class="h-4 w-4 text-blue-600">
                        </td>
                        <td class="px-4 py-3 text-center">
                            <input type="radio" name="absen_${docSnap.id}" value="A" class="h-4 w-4 text-red-600">
                        </td>
                        <td class="px-4 py-3">
                            <input type="text" class="w-full px-2 py-1 border rounded text-sm" placeholder="Keterangan...">
                        </td>
                    </tr>
                `;
            });

            loadingAbsensi.classList.add('hidden');
            tableAbsensi.classList.remove('hidden');

        } catch (error) {
            console.error("Error loading siswa untuk absen:", error);
            loadingAbsensi.classList.add('hidden');
            alert("❌ Gagal memuat data siswa: " + error.message);
        }
    }

    // ============================================
    // ABSENSI - SIMPAN
    // ============================================
    window.simpanAbsensi = async () => {
        const kelas = document.getElementById('absenKelas').value;
        const semester = document.getElementById('absenSemester').value;
        const tahun = document.getElementById('absenTahun').value;
        const tanggal = document.getElementById('absenTanggal').value;
        const guru = document.getElementById('absenGuru').value;

        if (!kelas || !semester || !tahun || !tanggal || !guru) {
            alert('⚠️ Mohon lengkapi semua informasi absensi!');
            return;
        }

        if (tbodyAbsensi.innerHTML.trim() === '') {
            alert('⚠️ Load data siswa terlebih dahulu!');
            return;
        }

        try {
            const rows = tbodyAbsensi.querySelectorAll('tr');
            let saved = 0;

            for (const row of rows) {
                const radioInputs = row.querySelectorAll('input[type="radio"]');
                const keteranganInput = row.querySelector('input[type="text"]');
                const namaSiswa = row.querySelector('td:nth-child(2)').textContent;
                
                let status = 'H';
                for (const radio of radioInputs) {
                    if (radio.checked) {
                        status = radio.value;
                        break;
                    }
                }

                await addDoc(collection(db, absensiCollection), {
                    kelas: kelas,
                    semester: semester,
                    tahunPelajaran: tahun,
                    tanggal: tanggal,
                    namaGuru: guru,
                    namaSiswa: namaSiswa,
                    status: status,
                    keterangan: keteranganInput.value,
                    createdAt: new Date()
                });
                saved++;
            }

            alert(`✅ Absensi berhasil disimpan untuk ${saved} siswa!`);
            
            // Update ttd guru
            document.getElementById('ttdGuru').textContent = guru;
            document.getElementById('namaGuruTtd').textContent = guru;
            document.getElementById('tanggalCetak').textContent = new Date().toLocaleDateString('id-ID', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });

        } catch (error) {
            console.error("Error saving absensi:", error);
            alert("❌ Gagal menyimpan: " + error.message);
        }
    }

    // ============================================
    // ABSENSI - DOWNLOAD EXCEL
    // ============================================
    window.downloadExcel = () => {
        if (tbodyAbsensi.innerHTML.trim() === '') {
            alert('⚠️ Load data siswa terlebih dahulu!');
            return;
        }

        const kelas = document.getElementById('absenKelas').value;
        const semester = document.getElementById('absenSemester').value;
        const tahun = document.getElementById('absenTahun').value;
        const tanggal = document.getElementById('absenTanggal').value;
        const guru = document.getElementById('absenGuru').value;

        // Build Excel content
        let excelContent = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
            <head><meta charset="UTF-8"></head><body>
            <table border="1">
                <tr><td colspan="7" style="text-align:center;font-weight:bold;font-size:16px;">ABSENSI DIGITAL SDN 139 LAMANDA</td></tr>
                <tr><td colspan="7" style="text-align:center;">Kelas ${kelas} | Semester ${semester} | Tahun ${tahun}</td></tr>
                <tr><td colspan="7" style="text-align:center;">Tanggal: ${tanggal} | Guru: ${guru}</td></tr>
                <tr>
                    <th>No</th><th>Nama Siswa</th><th>H</th><th>S</th><th>I</th><th>A</th><th>Keterangan</th>
                </tr>
        `;

        const rows = tbodyAbsensi.querySelectorAll('tr');
        rows.forEach((row, index) => {
            const nama = row.querySelector('td:nth-child(2)').textContent;
            const H = row.querySelector('input[value="H"]:checked') ? '✓' : '';
            const S = row.querySelector('input[value="S"]:checked') ? '✓' : '';
            const I = row.querySelector('input[value="I"]:checked') ? '✓' : '';
            const A = row.querySelector('input[value="A"]:checked') ? '✓' : '';
            const ket = row.querySelector('input[type="text"]').value;

            excelContent += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${nama}</td>
                    <td style="text-align:center;">${H}</td>
                    <td style="text-align:center;">${S}</td>
                    <td style="text-align:center;">${I}</td>
                    <td style="text-align:center;">${A}</td>
                    <td>${ket}</td>
                </tr>
            `;
        });

        excelContent += `
                <tr><td colspan="7" style="height:80px;"></td></tr>
                <tr><td colspan="4"></td><td colspan="3" style="text-align:center;">Guru Mata Pelajaran,<br><br><br>_________________________<br>${guru}</td></tr>
            </table></body></html>
        `;

        // Create download
        const blob = new Blob(['\ufeff', excelContent], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Absensi_Kelas${kelas}_${tanggal}.xls`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // ============================================
    // ABSENSI - DOWNLOAD PDF
    // ============================================
    window.downloadPDF = () => {
        if (tbodyAbsensi.innerHTML.trim() === '') {
            alert('⚠️ Load data siswa terlebih dahulu!');
            return;
        }
        window.cetakAbsensi();
    }

    // ============================================
    // ABSENSI - CETAK
    // ============================================
    window.cetakAbsensi = () => {
        if (tbodyAbsensi.innerHTML.trim() === '') {
            alert('⚠️ Load data siswa terlebih dahulu!');
            return;
        }
        
        // Update ttd before print
        const guru = document.getElementById('absenGuru').value;
        document.getElementById('ttdGuru').textContent = guru;
        document.getElementById('namaGuruTtd').textContent = guru;
        
        window.print();
    }

    // ============================================
    // INITIAL LOAD
    // ============================================
    loadSiswa();
}
