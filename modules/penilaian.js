// modules/penilaian.js
// Module Penilaian - Landing Page (Tier 2)
// SDN 139 LAMANDA
// ✅ Menu utama untuk memilih jenis penilaian + Read-Only Mode Support

import { db } from '../config-firebase.js';
import { auth } from '../config-firebase.js';
import { 
    collection, 
    getDocs, 
    query, 
    where, 
    orderBy
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const collectionName = "penilaian";
const ADMIN_EMAIL = 'andi@139batuassung.com';  // ✅ KONSTANTA ADMIN

// ============================================
// FUNGSI HELPER: CHECK STATUS DENGAN ADMIN BYPASS
// ============================================
function checkAccessPermission() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const userEmail = currentUser?.email;
    const isAdmin = userEmail === ADMIN_EMAIL;
    
    // ✅ Admin selalu punya akses
    if (isAdmin) {
        return true;
    }
    
    // User biasa: cek status
    if (currentUser?.status !== 'active') {
        alert('⚠️ Fitur ini belum aktif. Akun Anda masih menunggu persetujuan admin.');
        return false;
    }
    
    return true;
}

// ============================================
// FUNGSI HELPER: ENABLE READ-ONLY VISUAL CUE
// ============================================
function enableReadOnlyVisual() {
    // Disable semua card sub item (visual cue)
    document.querySelectorAll('[onclick*="bukaSubItem"]').forEach(card => {
        card.classList.add('opacity-60', 'cursor-not-allowed');
        card.title = 'Fitur aktif setelah akun disetujui admin';
        // Override onclick untuk prevent navigation
        card.onclick = (e) => {
            e.preventDefault();
            alert('⚠️ Fitur ini belum aktif. Akun Anda masih menunggu persetujuan admin.');
        };
    });
    
    console.log('🔒 Read-only mode enabled: penilaian');
}

// ============================================
// KONFIGURASI SUB ITEM PENILAIAN
// ============================================
const SUB_ITEMS = [
    { 
        id: 'penilaian-harian', 
        label: 'Penilaian Harian', 
        icon: 'fa-clipboard-check', 
        color: 'blue',
        deskripsi: 'Penilaian formatif untuk setiap pertemuan pembelajaran'
    },
    { 
        id: 'pts', 
        label: 'Penilaian Tengah Semester', 
        icon: 'fa-book-reader', 
        color: 'purple',
        deskripsi: 'Penilaian sumatif di tengah semester'
    },
    { 
        id: 'pas', 
        label: 'Penilaian Akhir Semester', 
        icon: 'fa-graduation-cap', 
        color: 'green',
        deskripsi: 'Penilaian sumatif di akhir semester'
    },
    { 
        id: 'laporan-pendidikan', 
        label: 'Laporan Pendidikan', 
        icon: 'fa-file-alt', 
        color: 'orange',
        deskripsi: 'Laporan hasil belajar dan perkembangan siswa'
    }
];

// ============================================
// FUNGSI RENDER - Landing Page HTML
// ============================================
export function render() {
    const div = document.createElement('div');
    div.innerHTML = `
        <!-- Navigation Bar -->
        <div class="mb-6">
            <button onclick="window.kembaliKeDashboard()" class="text-gray-600 hover:text-gray-800 text-sm flex items-center gap-2 mb-4">
                <i class="fas fa-home"></i>
                <span>Kembali ke Dashboard</span>
            </button>
        </div>

        <!-- Header Section -->
        <div class="mb-8">
            <div class="flex items-center gap-3 mb-2">
                <div class="p-3 bg-green-100 rounded-xl">
                    <i class="fas fa-chart-bar text-green-600 text-2xl"></i>
                </div>
                <div>
                    <h2 class="text-2xl font-bold text-gray-800">Penilaian</h2>
                    <p class="text-gray-500 text-sm">Pilih jenis penilaian yang ingin dikelola</p>
                </div>
            </div>
        </div>

        <!-- Info Box -->
        <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
            <div class="flex items-start">
                <i class="fas fa-info-circle text-blue-500 mr-3 mt-1"></i>
                <div>
                    <p class="text-blue-800 font-semibold text-sm">Cara Penggunaan</p>
                    <p class="text-blue-700 text-xs mt-1">Klik salah satu jenis penilaian di bawah untuk mengelola data penilaian Anda. Setiap jenis memiliki halaman tersendiri.</p>
                </div>
            </div>
        </div>

        <!-- Sub Items Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            ${SUB_ITEMS.map(item => `
                <div onclick="window.bukaSubItem('${item.id}')" 
                     class="bg-white rounded-lg shadow-sm border-l-4 border-${item.color}-500 hover:shadow-lg transition cursor-pointer group">
                    <div class="p-6">
                        <div class="flex items-center mb-4">
                            <div class="p-3 bg-${item.color}-100 rounded-lg mr-4 group-hover:bg-${item.color}-200 transition">
                                <i class="fas ${item.icon} text-${item.color}-600 text-xl"></i>
                            </div>
                            <div>
                                <h3 class="font-bold text-gray-800 text-lg">${item.label}</h3>
                            </div>
                        </div>
                        <p class="text-gray-500 text-sm mb-4">${item.deskripsi}</p>
                        <div class="flex items-center text-${item.color}-600 font-semibold text-sm">
                            <span>Kelola Penilaian</span>
                            <i class="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition"></i>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>

        <!-- Statistik Ringkas -->
        <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-bold text-gray-700">Statistik Penilaian Saya</h3>
                <button onclick="window.loadStatistik()" class="text-green-600 hover:text-green-700 text-sm">
                    <i class="fas fa-sync-alt mr-1"></i> Refresh
                </button>
            </div>
            
            <div id="loadingStat" class="text-center py-4 hidden">
                <i class="fas fa-spinner fa-spin text-green-500"></i>
            </div>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4" id="statGrid">
                <!-- Statistik akan di-load di sini -->
            </div>
        </div>

        <!-- Quick Tips -->
        <div class="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p class="text-yellow-800 text-sm font-semibold mb-2">
                <i class="fas fa-lightbulb mr-1"></i> Tips:
            </p>
            <ul class="text-yellow-700 text-xs space-y-1">
                <li>• Setiap penilaian terikat dengan akun Anda (tidak bisa dilihat guru lain)</li>
                <li>• Admin dapat melihat semua penilaian dari semua guru</li>
                <li>• Data nilai adalah informasi sensitif - pastikan input dengan teliti</li>
                <li>• Backup data secara berkala untuk keamanan</li>
            </ul>
        </div>
    `;

    setTimeout(() => initModule(), 0);
    return div;
}

// ============================================
// FUNGSI INIT - Mengaktifkan Logic
// ============================================
async function initModule() {
    // ✅ CHECK USER STATUS - Enable read-only mode if pending (dengan Admin Bypass)
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const userEmail = currentUser?.email;
    const isAdmin = userEmail === ADMIN_EMAIL;
    
    console.log('🔍 penilaian initModule:', { email: userEmail, isAdmin: isAdmin, status: currentUser?.status });
    
    // ✅ Jika user pending (bukan admin), enable read-only visual
    if (!isAdmin && currentUser?.status !== 'active') {
        enableReadOnlyVisual();
    }

    // ============================================
    // KEMBALI KE DASHBOARD
    // ============================================
    window.kembaliKeDashboard = () => {
        if (window.loadModule) {
            window.loadModule('dashboard');
        } else {
            window.location.href = 'dashboard.html';
        }
    }

    // ============================================
    // BUKA SUB ITEM (✅ DENGAN ADMIN BYPASS)
    // ============================================
    window.bukaSubItem = (subItemId) => {
        // ✅ Check status dengan admin bypass
        if (!checkAccessPermission()) {
            return;
        }
        
        sessionStorage.setItem('penilaian_subitem', subItemId);
        const moduleName = `penilaian-${subItemId}`;
        
        console.log(`📂 Membuka sub item: ${subItemId}`);
        console.log(`📄 Module yang akan di-load: ${moduleName}`);
        
        if (window.loadModule) {
            window.loadModule(moduleName);
        } else {
            alert(`📂 Membuka: ${subItemId}\n\nModule ${moduleName} akan segera tersedia!`);
        }
    }

    // ============================================
    // LOAD STATISTIK (Read-only: selalu diizinkan)
    // ============================================
    window.loadStatistik = async () => {
        const loadingStat = document.getElementById('loadingStat');
        const statGrid = document.getElementById('statGrid');
        
        loadingStat.classList.remove('hidden');
        statGrid.innerHTML = '';
        
        try {
            const userEmail = auth.currentUser?.email;
            const isAdmin = userEmail === ADMIN_EMAIL;
            
            let q;
            if (isAdmin) {
                q = query(collection(db, collectionName), orderBy("createdAt", "desc"));
            } else {
                q = query(collection(db, collectionName), 
                    where("userId", "==", auth.currentUser?.uid),
                    orderBy("createdAt", "desc")
                );
            }
            
            const snapshot = await getDocs(q);
            
            const stats = {};
            SUB_ITEMS.forEach(item => {
                stats[item.id] = 0;
            });
            
            snapshot.forEach(doc => {
                const data = doc.data();
                const jenis = data.jenisPenilaian || data.subItem;
                if (stats[jenis] !== undefined) {
                    stats[jenis]++;
                }
            });
            
            statGrid.innerHTML = SUB_ITEMS.map(item => `
                <div class="text-center p-3 bg-${item.color}-50 rounded-lg">
                    <p class="text-xl font-bold text-${item.color}-600">${stats[item.id]}</p>
                    <p class="text-xs text-gray-500">${item.label}</p>
                </div>
            `).join('');
            
        } catch (error) {
            console.error("Error loading statistik:", error);
            statGrid.innerHTML = `
                <div class="col-span-full text-center text-red-500 text-sm">
                    <i class="fas fa-exclamation-circle mr-1"></i>
                    Gagal memuat statistik
                </div>
            `;
        } finally {
            loadingStat.classList.add('hidden');
        }
    }

    // Initial load statistik
    window.loadStatistik();
}
