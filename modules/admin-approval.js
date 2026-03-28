// modules/admin-approval.js
// Dashboard Admin untuk Approve/Reject User
// Platform Administrasi Kelas Digital - Guru SDN
// ✅ UPDATED: Optimized stats loading + consistent field naming + better UX

import { db } from '../config-firebase.js';
import { auth } from '../config-firebase.js';
import { 
    collection, 
    getDocs, 
    query, 
    where, 
    doc, 
    updateDoc,
    addDoc,
    orderBy,
    count
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const ADMIN_EMAIL = 'radiah.tifarah@gmail..com';
const collectionName = 'users';
const logsCollection = 'approval_logs';

// ============================================
// FUNGSI HELPER: LOAD STATS (Optimized)
// ============================================
async function loadStats() {
    try {
        // Load counts dengan query terpisah (lebih efisien)
        const [pendingSnap, activeSnap, rejectedSnap, totalSnap] = await Promise.all([
            getDocs(query(collection(db, collectionName), where('status', '==', 'pending_approval'))),
            getDocs(query(collection(db, collectionName), where('status', '==', 'active'))),
            getDocs(query(collection(db, collectionName), where('status', '==', 'rejected'))),
            getDocs(collection(db, collectionName))
        ]);
        
        document.getElementById('countPending').textContent = pendingSnap.size;
        document.getElementById('countActive').textContent = activeSnap.size;
        document.getElementById('countRejected').textContent = rejectedSnap.size;
        document.getElementById('countTotal').textContent = totalSnap.size;
        
    } catch (error) {
        console.warn('⚠️ Gagal load stats:', error.message);
        // Fallback: set 0 jika error
        ['countPending', 'countActive', 'countRejected', 'countTotal'].forEach(id => {
            document.getElementById(id).textContent = '0';
        });
    }
}

// ============================================
// FUNGSI RENDER - HTML Admin Approval
// ============================================
export function render() {
    const div = document.createElement('div');
    div.innerHTML = `
        <!-- Header -->
        <div class="mb-6 flex justify-between items-center">
            <div>
                <h2 class="text-2xl font-bold text-gray-800">Approval User</h2>
                <p class="text-gray-500 text-sm">Kelola persetujuan user baru</p>
            </div>
            <button onclick="window.loadUsers()" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                <i class="fas fa-sync-alt"></i> Refresh
            </button>
        </div>
        
        <!-- Statistik -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-500">
                <p class="text-gray-500 text-xs">Pending</p>
                <p class="text-2xl font-bold text-yellow-600" id="countPending">0</p>
            </div>
            <div class="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
                <p class="text-gray-500 text-xs">Active</p>
                <p class="text-2xl font-bold text-green-600" id="countActive">0</p>
            </div>
            <div class="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500">
                <p class="text-gray-500 text-xs">Rejected</p>
                <p class="text-2xl font-bold text-red-600" id="countRejected">0</p>
            </div>
            <div class="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
                <p class="text-gray-500 text-xs">Total User</p>
                <p class="text-2xl font-bold text-blue-600" id="countTotal">0</p>
            </div>
        </div>
        
        <!-- Tabel User Pending -->
        <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-bold text-gray-700">User Menunggu Persetujuan</h3>
                <span class="text-sm text-gray-500" id="pendingCount">0 user</span>
            </div>
            
            <div id="loadingUsers" class="text-center py-8">
                <i class="fas fa-spinner fa-spin text-3xl text-blue-500"></i>
                <p class="text-gray-500 mt-2">Memuat data user...</p>
            </div>
            
            <div class="overflow-x-auto">
                <table class="min-w-full text-left text-sm hidden" id="tableUsers">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-4 py-3">Email</th>
                            <th class="px-4 py-3">Nama</th>
                            <th class="px-4 py-3">NIP</th>
                            <th class="px-4 py-3">Sekolah</th>
                            <th class="px-4 py-3">Tanggal Daftar</th>
                            <th class="px-4 py-3 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody id="tbodyUsers"></tbody>
                </table>
            </div>
            
            <div id="emptyUsers" class="text-center py-8 hidden">
                <i class="fas fa-check-circle text-4xl text-green-300"></i>
                <p class="text-gray-500 mt-2">Tidak ada user pending</p>
                <p class="text-gray-400 text-xs mt-1">Semua user telah diproses</p>
            </div>
        </div>
        
        <!-- Modal Reject -->
        <div id="modalReject" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <h3 class="text-xl font-bold text-gray-800 mb-4">Tolak User</h3>
                <input type="hidden" id="rejectUserId">
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Alasan Penolakan *</label>
                    <textarea id="rejectReason" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-red-500 h-24" 
                        placeholder="Contoh: Data tidak lengkap, email tidak valid, NIP tidak sesuai, dll..." required></textarea>
                    <p class="text-xs text-gray-500 mt-1">Alasan akan dikirim ke user sebagai notifikasi</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="window.closeRejectModal()" class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg">Batal</button>
                    <button onclick="window.confirmReject()" class="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">Konfirmasi Tolak</button>
                </div>
            </div>
        </div>
    `;
    
    setTimeout(() => initModule(), 0);
    return div;
}

// ============================================
// FUNGSI INIT - Logic Module
// ============================================
async function initModule() {
    // Double-check admin access (defense in depth)
    const user = auth.currentUser;
    if (user?.email !== ADMIN_EMAIL) {
        console.error('❌ Unauthorized access attempt');
        document.getElementById('loadingUsers')?.classList.add('hidden');
        document.getElementById('emptyUsers')?.classList.remove('hidden');
        document.getElementById('emptyUsers').innerHTML = `
            <i class="fas fa-lock text-4xl text-red-300 mb-3"></i>
            <p class="text-red-500 font-medium">Akses ditolak</p>
            <p class="text-gray-500 text-sm">Hanya admin yang bisa akses halaman ini</p>
        `;
        return;
    }
    
    // Load stats + users in parallel
    await Promise.all([
        loadStats(),
        loadUsers()
    ]);
}

// ============================================
// LOAD USER LIST (Pending Approval Only)
// ============================================
async function loadUsers() {
    const loadingUsers = document.getElementById('loadingUsers');
    const tableUsers = document.getElementById('tableUsers');
    const emptyUsers = document.getElementById('emptyUsers');
    const tbodyUsers = document.getElementById('tbodyUsers');
    const pendingCount = document.getElementById('pendingCount');
    
    loadingUsers.classList.remove('hidden');
    tableUsers.classList.add('hidden');
    emptyUsers.classList.add('hidden');
    tbodyUsers.innerHTML = '';
    
    try {
        // Query hanya user pending_approval (lebih efisien)
        const q = query(
            collection(db, collectionName), 
            where('status', '==', 'pending_approval'), 
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        
        // Update pending count display
        if (pendingCount) pendingCount.textContent = `${snapshot.size} user`;
        
        if (snapshot.empty) {
            loadingUsers.classList.add('hidden');
            emptyUsers.classList.remove('hidden');
            return;
        }
        
        // Render each user row
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const tanggal = data.createdAt?.toDate 
                ? data.createdAt.toDate().toLocaleDateString('id-ID', { 
                    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' 
                }) 
                : 'N/A';
            
            tbodyUsers.innerHTML += `
                <tr class="border-b hover:bg-gray-50 transition">
                    <td class="px-4 py-3 font-medium text-gray-800">${data.email || '-'}</td>
                    <td class="px-4 py-3">${data.namaLengkap || '-'}</td>
                    <td class="px-4 py-3">${data.nip || '-'}</td>
                    <td class="px-4 py-3">${data.sekolah || '-'}</td>
                    <td class="px-4 py-3 text-gray-500 text-xs">${tanggal}</td>
                    <td class="px-4 py-3 text-center">
                        <button onclick="window.approveUser('${docSnap.id}', '${data.email || ''}')" 
                            class="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs font-medium mr-1 transition flex items-center gap-1">
                            <i class="fas fa-check"></i> Approve
                        </button>
                        <button onclick="window.openRejectModal('${docSnap.id}')" 
                            class="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs font-medium transition flex items-center gap-1">
                            <i class="fas fa-times"></i> Reject
                        </button>
                    </td>
                </tr>
            `;
        });
        
        loadingUsers.classList.add('hidden');
        tableUsers.classList.remove('hidden');
        
    } catch (error) {
        console.error('❌ Error loading users:', error);
        loadingUsers.classList.add('hidden');
        
        // Show user-friendly error
        emptyUsers.innerHTML = `
            <i class="fas fa-exclamation-circle text-4xl text-red-300 mb-3"></i>
            <p class="text-red-500 font-medium">Gagal memuat data</p>
            <p class="text-gray-500 text-sm mb-3">${error.message}</p>
            <button onclick="window.loadUsers()" class="text-purple-600 hover:text-purple-800 text-sm font-medium">
                <i class="fas fa-sync-alt mr-1"></i>Coba Lagi
            </button>
        `;
        emptyUsers.classList.remove('hidden');
    }
}

// ============================================
// APPROVE USER
// ============================================
window.approveUser = async (userId, email) => {
    if (!confirm(`✅ Setujui user "${email}"?\n\nStatus akan diubah menjadi ACTIVE dan user bisa akses penuh.`)) {
        return;
    }
    
    try {
        // Update user status
        await updateDoc(doc(db, collectionName, userId), {
            status: 'active',
            approvedBy: ADMIN_EMAIL,  // ✅ Simpan email admin (lebih readable)
            approvedAt: new Date(),
            updatedAt: new Date()
        });
        
        // Log ke approval_logs
        await addDoc(collection(db, logsCollection), {
            userId: userId,
            userEmail: email,
            action: 'approved',
            adminId: auth.currentUser?.uid,
            adminEmail: ADMIN_EMAIL,
            timestamp: new Date(),
            notes: 'User approved via admin dashboard'
        });
        
        alert(`✅ User "${email}" berhasil disetujui!\n\nUser sekarang bisa login dengan akses penuh.`);
        await Promise.all([loadStats(), loadUsers()]);
        
    } catch (error) {
        console.error('❌ Error approving user:', error);
        
        // Handle specific Firebase errors
        let errorMsg = error.message;
        if (error.code === 'permission-denied') {
            errorMsg = 'Akses ditolak. Cek Firestore Security Rules.';
        }
        
        alert(`❌ Gagal menyetujui user:\n\n${errorMsg}`);
    }
};

// ============================================
// REJECT USER - MODAL FUNCTIONS
// ============================================
window.openRejectModal = (userId) => {
    document.getElementById('rejectUserId').value = userId;
    document.getElementById('rejectReason').value = '';
    document.getElementById('modalReject').classList.remove('hidden');
    document.getElementById('modalReject').classList.add('flex');
    
    // Focus textarea for better UX
    setTimeout(() => document.getElementById('rejectReason')?.focus(), 100);
};

window.closeRejectModal = () => {
    document.getElementById('modalReject').classList.add('hidden');
    document.getElementById('modalReject').classList.remove('flex');
    document.getElementById('rejectUserId').value = '';
    document.getElementById('rejectReason').value = '';
};

window.confirmReject = async () => {
    const userId = document.getElementById('rejectUserId').value;
    const reason = document.getElementById('rejectReason').value.trim();
    
    if (!reason) {
        alert('❌ Alasan penolakan wajib diisi');
        document.getElementById('rejectReason')?.focus();
        return;
    }
    
    if (!confirm(`❌ Tolak user ini?\n\nAlasan: "${reason}"\n\nUser akan mendapat notifikasi dan tidak bisa login.`)) {
        return;
    }
    
    try {
        // Update user status
        await updateDoc(doc(db, collectionName, userId), {
            status: 'rejected',
            rejectedReason: reason,
            approvedBy: ADMIN_EMAIL,  // ✅ Simpan email admin
            approvedAt: new Date(),
            updatedAt: new Date()
        });
        
        // Log ke approval_logs
        await addDoc(collection(db, logsCollection), {
            userId: userId,
            action: 'rejected',
            adminId: auth.currentUser?.uid,
            adminEmail: ADMIN_EMAIL,
            reason: reason,
            timestamp: new Date(),
            notes: 'User rejected via admin dashboard'
        });
        
        alert(`✅ User berhasil ditolak.\n\nAlasan: "${reason}"`);
        window.closeRejectModal();
        await Promise.all([loadStats(), loadUsers()]);
        
    } catch (error) {
        console.error('❌ Error rejecting user:', error);
        
        let errorMsg = error.message;
        if (error.code === 'permission-denied') {
            errorMsg = 'Akses ditolak. Cek Firestore Security Rules.';
        }
        
        alert(`❌ Gagal menolak user:\n\n${errorMsg}`);
    }
};

// ============================================
// GLOBAL EXPOSE FOR HTML ONCLICK
// ============================================
window.loadUsers = loadUsers;
