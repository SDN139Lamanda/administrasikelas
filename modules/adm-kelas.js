// modules/adm-kelas.js
// Module Administrasi Kelas - CRUD Siswa dengan Firebase Firestore

import { db } from '../config-firebase.js';
import { 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    updateDoc, 
    deleteDoc, 
    query, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const collectionName = "siswa";

// ============================================
// FUNGSI RENDER - Menghasilkan HTML Module
// ============================================
export function render() {
    const div = document.createElement('div');
    div.innerHTML = `
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
                <h3 class="text-lg font-bold text-gray-700">Data Siswa Kelas X-A</h3>
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
                            <th class="px-6 py-3">L/P</th>
                            <th class="px-6 py-3">Status</th>
                            <th class="px-6 py-3 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody id="tbodySiswa">
                        <!-- Data akan di-render di sini -->
                    </tbody>
                </table>
            </div>
            
            <!-- Empty State -->
            <div id="emptyState" class="text-center py-8 hidden">
                <i class="fas fa-inbox text-4xl text-gray-300"></i>
                <p class="text-gray-500 mt-2">Belum ada data siswa</p>
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
                        <input type="text" id="nisn" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500" required placeholder="Contoh: 1234567890">
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-gray-700 text-sm font-bold mb-2">Nama Lengkap</label>
                        <input type="text" id="nama" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500" required placeholder="Nama siswa">
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

    // Inisialisasi module setelah HTML di-render
    setTimeout(() => initModule(), 0);
    
    return div;
}

// ============================================
// FUNGSI INIT - Mengaktifkan Logic Module
// ============================================
async function initModule() {
    const modal = document.getElementById('modalSiswa');
    const formSiswa = document.getElementById('formSiswa');
    const tbodySiswa = document.getElementById('tbodySiswa');
    const tableSiswa = document.getElementById('tableSiswa');
    const loadingTable = document.getElementById('loadingTable');
    const emptyState = document.getElementById('emptyState');
    const modalTitle = document.getElementById('modalTitle');

    // --- FUNGSI MODAL ---
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

    // --- READ: Load Data Siswa dari Firestore ---
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
                            <td class="px-6 py-4">${data.jenisKelamin}</td>
                            <td class="px-6 py-4">
                                <span class="${data.status === 'Aktif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} py-1 px-3 rounded-full text-xs">
                                    ${data.status}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-center">
                                <button onclick="window.editSiswa('${docSnap.id}', '${data.nisn}', '${data.nama}', '${data.jenisKelamin}', '${data.status}')" 
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

            // Update Statistik
            document.getElementById('totalSiswa').textContent = total;
            document.getElementById('totalLaki').textContent = laki;
            document.getElementById('totalPerempuan').textContent = perempuan;

        } catch (error) {
            console.error("Error loading siswa:", error);
            loadingTable.innerHTML = `
                <i class="fas fa-exclamation-circle text-3xl text-red-500"></i>
                <p class="text-red-500 mt-2">Gagal memuat data: ${error.message}</p>
            `;
        } finally {
            loadingTable.classList.add('hidden');
        }
    }

    // --- CREATE & UPDATE: Submit Form ---
    formSiswa.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('siswaId').value;
        const data = {
            nisn: document.getElementById('nisn').value,
            nama: document.getElementById('nama').value,
            jenisKelamin: document.getElementById('jenisKelamin').value,
            status: document.getElementById('status').value,
            updatedAt: new Date()
        };

        try {
            if (id) {
                // UPDATE existing data
                await updateDoc(doc(db, collectionName, id), data);
                alert('✅ Data berhasil diupdate!');
            } else {
                // CREATE new data
                data.createdAt = new Date();
                await addDoc(collection(db, collectionName), data);
                alert('✅ Siswa berhasil ditambahkan!');
            }
            window.closeModalSiswa();
            loadSiswa(); // Refresh tabel
        } catch (error) {
            console.error("Error saving siswa:", error);
            alert("❌ Gagal menyimpan: " + error.message);
        }
    });

    // --- EDIT: Isi Form dengan Data Existing ---
    window.editSiswa = (id, nisn, nama, jenisKelamin, status) => {
        document.getElementById('siswaId').value = id;
        document.getElementById('nisn').value = nisn;
        document.getElementById('nama').value = nama;
        document.getElementById('jenisKelamin').value = jenisKelamin;
        document.getElementById('status').value = status;
        modalTitle.textContent = 'Edit Siswa';
        window.openModalSiswa();
    }

    // --- DELETE: Hapus Data ---
    window.deleteSiswa = async (id) => {
        if (confirm('⚠️ Apakah Anda yakin ingin menghapus data siswa ini?')) {
            try {
                await deleteDoc(doc(db, collectionName, id));
                alert('✅ Siswa berhasil dihapus!');
                loadSiswa(); // Refresh tabel
            } catch (error) {
                console.error("Error deleting siswa:", error);
                alert("❌ Gagal menghapus: " + error.message);
            }
        }
    }

    // Load data saat module pertama kali dibuka
    loadSiswa();
}
