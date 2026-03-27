// modules/admin-approval.js
// Dashboard Admin untuk Approve/Reject User
// Platform Administrasi Kelas Digital - Guru SDN

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
    orderBy
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const ADMIN_EMAIL = 'andi@139batuassung.com';

export function render() {
    const div = document.createElement('div');
    div.innerHTML = `
        <!-- Header -->
        <div class="mb-6">
            <h2 class="text-2xl font-bold text-gray-800">Approval User</h2>
            <p class="text-gray-500 text-sm">Kelola persetujuan user baru</p>
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
            <h3 class="text-lg font-bold text-gray-700 mb-4">User Menunggu Persetujuan</h3>
            
            <div id="loadingUsers" class="text-center py-8">
                <i class="fas fa-spinner fa-spin text-3xl text-blue-500"></i>
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
            </div>
        </div>
        
        <!-- Modal Reject -->
        <div id="modalReject" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <h3 class="text-xl font-bold text-gray-800 mb-4">Tolak User</h3>
                <input type="hidden" id="rejectUserId">
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Alasan Penolakan</label>
                    <textarea id="rejectReason" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-red-500 h-24" 
                        placeholder="Jelaskan alasan penolakan..."></textarea>
                </div>
                <div class="flex gap-2">
                    <button onclick="window.closeRejectModal()" class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg">Batal</button>
                    <button onclick="window.confirmReject()" class="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">Tolak</button>
                </div>
            </div>
        </div>
    `;
    
    setTimeout(() => initModule(), 0);
    return div;
}

async function initModule() {
    const user = auth.currentUser;
    if (user?.email !== ADMIN_EMAIL) {
        alert('❌ Akses ditolak. Hanya admin yang bisa akses halaman ini.');
        return;
    }
    
    loadUsers();
}

async function loadUsers() {
    const loadingUsers = document.getElementById('loadingUsers');
    const tableUsers = document.getElementById('tableUsers');
    const emptyUsers = document.getElementById('emptyUsers');
    const tbodyUsers = document.getElementById('tbodyUsers');
    
    loadingUsers.classList.remove('hidden');
    tableUsers.classList.add('hidden');
    emptyUsers.classList.add('hidden');
    
    try {
        const q = query(collection(db, 'users'), where('status', '==', 'pending_approval'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        
        tbodyUsers.innerHTML = '';
        let pending = 0, active = 0, rejected = 0;
        
        const allUsers = await getDocs(collection(db, 'users'));
        allUsers.forEach(doc => {
            const status = doc.data().status;
            if (status === 'pending_approval') pending++;
            else if (status === 'active') active++;
            else if (status === 'rejected') rejected++;
        });
        
        document.getElementById('countPending').textContent = pending;
        document.getElementById('countActive').textContent = active;
        document.getElementById('countRejected').textContent = rejected;
        document.getElementById('countTotal').textContent = allUsers.size;
        
        if (snapshot.empty) {
            loadingUsers.classList.add('hidden');
            emptyUsers.classList.remove('hidden');
            return;
        }
        
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const tanggal = data.createdAt?.toDate ? data.createdAt.toDate().toLocaleDateString('id-ID') : 'N/A';
            
            tbodyUsers.innerHTML += `
                <tr class="border-b hover:bg-gray-50">
                    <td class="px-4 py-3">${data.email}</td>
                    <td class="px-4 py-3 font-medium">${data.namaLengkap}</td>
                    <td class="px-4 py-3">${data.nip}</td>
                    <td class="px-4 py-3">${data.sekolah}</td>
                    <td class="px-4 py-3 text-gray-500 text-sm">${tanggal}</td>
                    <td class="px-4 py-3 text-center">
                        <button onclick="window.approveUser('${docSnap.id}', '${data.email}')" 
                            class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs mr-1">
                            <i class="fas fa-check"></i> Approve
                        </button>
                        <button onclick="window.openRejectModal('${docSnap.id}')" 
                            class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs">
                            <i class="fas fa-times"></i> Reject
                        </button>
                    </td>
                </tr>
            `;
        });
        
        loadingUsers.classList.add('hidden');
        tableUsers.classList.remove('hidden');
        
    } catch (error) {
        console.error('Error loading users:', error);
        loadingUsers.classList.add('hidden');
        emptyUsers.innerHTML = `<p class="text-red-500">Error: ${error.message}</p>`;
        emptyUsers.classList.remove('hidden');
    }
}

window.approveUser = async (userId, email) => {
    if (!confirm(`Approve user ${email}?`)) return;
    
    try {
        await updateDoc(doc(db, 'users', userId), {
            status: 'active',
            approvedBy: auth.currentUser.uid,
            approvedAt: new Date()
        });
        
        await addDoc(collection(db, 'approval_logs'), {
            userId: userId,
            action: 'approved',
            adminId: auth.currentUser.uid,
            adminEmail: auth.currentUser.email,
            timestamp: new Date()
        });
        
        alert('✅ User approved!');
        loadUsers();
    } catch (error) {
        alert('❌ Error: ' + error.message);
    }
};

window.openRejectModal = (userId) => {
    document.getElementById('rejectUserId').value = userId;
    document.getElementById('modalReject').classList.remove('hidden');
    document.getElementById('modalReject').classList.add('flex');
};

window.closeRejectModal = () => {
    document.getElementById('modalReject').classList.add('hidden');
    document.getElementById('modalReject').classList.remove('flex');
    document.getElementById('rejectReason').value = '';
};

window.confirmReject = async () => {
    const userId = document.getElementById('rejectUserId').value;
    const reason = document.getElementById('rejectReason').value.trim();
    
    if (!reason) {
        alert('❌ Alasan penolakan wajib diisi');
        return;
    }
    
    try {
        await updateDoc(doc(db, 'users', userId), {
            status: 'rejected',
            rejectedReason: reason,
            approvedBy: auth.currentUser.uid,
            approvedAt: new Date()
        });
        
        await addDoc(collection(db, 'approval_logs'), {
            userId: userId,
            action: 'rejected',
            adminId: auth.currentUser.uid,
            adminEmail: auth.currentUser.email,
            reason: reason,
            timestamp: new Date()
        });
        
        alert('✅ User rejected!');
        window.closeRejectModal();
        loadUsers();
    } catch (error) {
        alert('❌ Error: ' + error.message);
    }
};
