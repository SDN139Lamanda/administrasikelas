/**
 * ============================================
 * MODULE: ADMIN ANNOUNCEMENTS (PAPAN INFORMASI)
 * Folder: js/admin-announcements.js
 * Platform Administrasi Kelas Digital
 * ✅ FINAL: CRUD Firestore + Validation + Real-time Sync
 * ============================================
 */

console.log('🔴 [Admin Announcements] Script START');

import { 
  db, auth, collection, addDoc, updateDoc, deleteDoc, 
  query, where, orderBy, onSnapshot, doc, getDocs, serverTimestamp 
} from '../modules/firebase-config.js';

console.log('✅ [Admin Announcements] Firebase imports successful');

const ANNOUNCEMENTS_COLLECTION = 'announcements';
const MAX_CHARS = 500;

// ============================================
// ✅ RENDER ADMIN FORM
// ============================================

export function renderAnnouncementsAdmin() {
  console.log('📝 [Admin Announcements] renderAnnouncementsAdmin() called');
  
  const container = document.getElementById('admin-announcements-container');
  if (!container) {
    console.error('❌ [Admin Announcements] Container #admin-announcements-container NOT FOUND');
    return;
  }
  
  const user = auth.currentUser;
  if (!user) {
    container.innerHTML = '<div class="p-6 text-center text-gray-500">⚠️ Silakan login sebagai admin.</div>';
    return;
  }
  
  container.innerHTML = `
    <style>
      .announcements-admin { max-width: 800px; margin: auto; padding: 25px; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
      .announcements-admin h3 { text-align: center; color: #7c3aed; margin-bottom: 10px; font-size: 22px; }
      .subtitle { text-align: center; color: #6b7280; margin-bottom: 20px; font-size: 13px; }
      .form-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin-bottom: 20px; }
      .announcements-admin label { display: block; font-weight: 600; color: #374151; margin-bottom: 8px; }
      .announcements-admin textarea { width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; line-height: 1.6; resize: vertical; min-height: 100px; font-family: inherit; }
      .announcements-admin textarea:focus { outline: none; border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,0.1); }
      .char-count { text-align: right; font-size: 12px; color: #6b7280; margin-top: 4px; }
      .char-count.warning { color: #f59e0b; }
      .char-count.error { color: #ef4444; font-weight: 600; }
      .btn-publish { width: 100%; padding: 12px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 12px; }
      .btn-publish:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(16,185,129,0.3); }
      .btn-publish:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
      .history-item { border-bottom: 1px solid #e2e8f0; padding: 12px 0; }
      .history-item:last-child { border-bottom: none; }
      .history-text { font-weight: 500; color: #334155; margin-bottom: 6px; white-space: pre-wrap; }
      .history-meta { font-size: 11px; color: #94a3b8; display: flex; justify-content: space-between; align-items: center; }
      .badge-active { background: #10b981; color: white; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 600; }
      .badge-inactive { background: #94a3b8; color: white; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 600; }
      .btn-edit { background: none; border: none; color: #3b82f6; cursor: pointer; font-size: 12px; padding: 4px 8px; }
      .btn-delete { background: none; border: none; color: #ef4444; cursor: pointer; font-size: 12px; padding: 4px 8px; }
      .btn-back { margin-top: 20px; padding: 10px 20px; background: #64748b; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; width: auto; display: inline-flex; align-items: center; gap: 6px; }
    </style>
    
    <div class="announcements-admin">
      <h3>📢 Papan Informasi</h3>
      <p class="subtitle">Kelola pengumuman berjalan di halaman depan (maks. 500 karakter)</p>
      
      <button class="btn-back" id="btn-back-announcements"><i class="fas fa-arrow-left"></i> Kembali</button>
      
      <div class="form-box">
        <label for="announcement-text"><i class="fas fa-edit mr-2"></i>Tulis Pengumuman</label>
        <textarea id="announcement-text" placeholder="Contoh: Libur semester dimulai 15 Desember 2025. Semua kegiatan belajar mengajar diliburkan."></textarea>
        <div class="char-count" id="char-count">0 / ${MAX_CHARS} karakter</div>
        <button id="btn-publish" class="btn-publish"><i class="fas fa-bullhorn"></i> Publish Pengumuman</button>
      </div>
      
      <div class="form-box" style="margin-top: 25px;">
        <label style="margin-bottom:12px;"><i class="fas fa-history mr-2"></i>Riwayat Pengumuman</label>
        <div id="announcements-history-list">
          <p class="text-center py-4 text-gray-500" style="text-align:center;"><i class="fas fa-spinner fa-spin"></i> Memuat...</p>
        </div>
      </div>
    </div>
  `;
  
  // Setup logic
  setTimeout(() => {
    setupAnnouncementsHandlers();
    loadAnnouncementsHistory();
    console.log('✅ [Admin Announcements] UI & listeners ready');
  }, 80);
}

window.renderAnnouncementsAdmin = renderAnnouncementsAdmin;

// ============================================
// ✅ HANDLERS & LOGIC
// ============================================

function setupAnnouncementsHandlers() {
  const backBtn = document.getElementById('btn-back-announcements');
  if (backBtn) backBtn.addEventListener('click', () => {
    if (typeof window.toggleAdminWidget === 'function') window.toggleAdminWidget();
    else document.getElementById('admin-announcements-container')?.classList.add('hidden');
  });
  
  const textarea = document.getElementById('announcement-text');
  const charCount = document.getElementById('char-count');
  
  if (textarea && charCount) {
    textarea.addEventListener('input', () => {
      const len = textarea.value.length;
      charCount.textContent = `${len} / ${MAX_CHARS} karakter`;
      charCount.classList.toggle('warning', len > 400 && len <= MAX_CHARS);
      charCount.classList.toggle('error', len > MAX_CHARS);
    });
  }
  
  const publishBtn = document.getElementById('btn-publish');
  if (publishBtn) publishBtn.addEventListener('click', handlePublish);
}

async function handlePublish() {
  const textarea = document.getElementById('announcement-text');
  const publishBtn = document.getElementById('btn-publish');
  
  const text = textarea?.value?.trim();
  if (!text) return alert('⚠️ Silakan tulis pengumuman terlebih dahulu.');
  if (text.length > MAX_CHARS) return alert(`⚠️ Maksimal ${MAX_CHARS} karakter. Saat ini: ${text.length}`);
  // Validasi: hanya huruf, angka, spasi, dan tanda baca dasar
  if (!/^[\w\s.,;:!?'"()\-\n]+$/.test(text)) {
    return alert('⚠️ Hanya diperbolehkan huruf, angka, spasi, dan tanda baca dasar (.,;:!?\'"()-)');
  }
  
  publishBtn.disabled = true;
  publishBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
  
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User tidak terautentikasi');
    
    // ✅ Non-aktifkan semua pengumuman lama (mode 1 teks aktif)
    const oldQ = query(collection(db, ANNOUNCEMENTS_COLLECTION), where('isActive', '==', true));
    const oldSnap = await getDocs(oldQ);
    oldSnap.forEach(async (docSnap) => {
      await updateDoc(doc(db, ANNOUNCEMENTS_COLLECTION, docSnap.id), { 
        isActive: false, 
        updatedAt: serverTimestamp() 
      });
    });
    
    // ✅ Publish pengumuman baru sebagai aktif
    await addDoc(collection(db, ANNOUNCEMENTS_COLLECTION), {
      text: text,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: user.uid,
      createdByEmail: user.email
    });
    
    alert('✅ Pengumuman berhasil dipublish!');
    textarea.value = '';
    document.getElementById('char-count').textContent = `0 / ${MAX_CHARS} karakter`;
    loadAnnouncementsHistory();
    
  } catch (err) {
    console.error('❌ [Admin Announcements] Publish failed:', err);
    alert(`❌ Gagal publish: ${err.message}`);
  } finally {
    publishBtn.disabled = false;
    publishBtn.innerHTML = '<i class="fas fa-bullhorn"></i> Publish Pengumuman';
  }
}

function loadAnnouncementsHistory() {
  const list = document.getElementById('announcements-history-list');
  if (!list) return;
  
  const user = auth.currentUser;
  if (!user) { list.innerHTML = '<p class="text-center py-4 text-gray-500">Silakan login</p>'; return; }
  
  const q = query(
    collection(db, ANNOUNCEMENTS_COLLECTION),
    orderBy('createdAt', 'desc')
  );
  
  onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      list.innerHTML = '<p class="text-center py-4 text-gray-500">Belum ada pengumuman.</p>';
      return;
    }
    
    list.innerHTML = snapshot.docs.map(docSnap => {
      const v = docSnap.data();
      const t = v.createdAt?.toDate?.()?.toLocaleString('id-ID') || '-';
      const isActive = v.isActive === true;
      return `
        <div class="history-item">
          <div class="history-text">${v.text}</div>
          <div class="history-meta">
            <span>${t} • ${v.createdByEmail?.split('@')[0] || '-'}</span>
            <div>
              ${isActive ? '<span class="badge-active">Aktif</span>' : '<span class="badge-inactive">Non-aktif</span>'}
              ${isActive ? `<button class="btn-edit" onclick="window.deactivateAnnouncement('${docSnap.id}')">Non-aktifkan</button>` : ''}
              <button class="btn-delete" onclick="window.deleteAnnouncement('${docSnap.id}')">Hapus</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  });
}

// Expose functions to window for onclick
window.deactivateAnnouncement = async function(id) {
  if (!confirm('Non-aktifkan pengumuman ini?')) return;
  try {
    await updateDoc(doc(db, ANNOUNCEMENTS_COLLECTION, id), { 
      isActive: false, 
      updatedAt: serverTimestamp() 
    });
    alert('✅ Pengumuman dinon-aktifkan.');
  } catch (e) { alert('❌ Gagal: ' + e.message); }
};

window.deleteAnnouncement = async function(id) {
  if (!confirm('Hapus permanen pengumuman ini?')) return;
  try {
    await deleteDoc(doc(db, ANNOUNCEMENTS_COLLECTION, id));
    alert('✅ Pengumuman dihapus.');
  } catch (e) { alert('❌ Gagal: ' + e.message); }
};

console.log('🟢 [Admin Announcements] READY — CRUD + Validation + Real-time');
