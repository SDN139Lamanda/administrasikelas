/**
 * ============================================
 * MODULE: REFLEKSI (FIREBASE REALTIME - TERSTRUKTUR)
 * Platform Administrasi Kelas Digital
 * ============================================
 */

// ✅ UPDATE: Import dari folder yang sama (modules/)
import { 
  db, auth, collection, addDoc, updateDoc, deleteDoc, doc, 
  query, orderBy, onSnapshot, serverTimestamp 
} from './firebase-config.js';  // ← ✅ PATH BENAR: ./firebase-config.js

console.log('🔴 [Refleksi Module] Script START');

// ============================================
// ✅ FUNGSI: Render Form Refleksi Terstruktur
// ============================================
window.renderRefleksiForm = function() {
  console.log('📝 [Refleksi] renderRefleksiForm called');
  
  const container = document.getElementById('refleksi-container');
  if (!container) {
    console.error('❌ [Refleksi] Container #refleksi-container not found!');
    return;
  }
  
  const user = auth.currentUser;
  
  container.innerHTML = `
    <div class="container py-8">
      <div class="refleksi-section bg-white p-6 rounded-lg shadow-lg">
        <div class="section-header mb-6 border-b pb-4">
          <h2 class="text-2xl font-bold text-gray-800">
            <i class="fas fa-clipboard-list mr-2 text-purple-600"></i>
            Ruang Refleksi Guru
          </h2>
          <p class="text-gray-600 mt-2">Dokumentasi dan refleksi pembelajaran</p>
        </div>
        
        ${user ? `
        <div class="mb-8 p-6 bg-purple-50 rounded-lg border border-purple-200">
          <h3 class="font-semibold text-purple-800 mb-4">📝 Tulis Refleksi Baru</h3>
          <form id="refleksi-form" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Kelas</label>
                <select id="refleksi-kelas" class="w-full p-3 border rounded-lg" required>
                  <option value="">Pilih Kelas</option>
                  <option value="1">Kelas 1</option><option value="2">Kelas 2</option>
                  <option value="3">Kelas 3</option><option value="4">Kelas 4</option>
                  <option value="5">Kelas 5</option><option value="6">Kelas 6</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Mata Pelajaran</label>
                <select id="refleksi-mapel" class="w-full p-3 border rounded-lg" required>
                  <option value="">Pilih Mapel</option>
                  <option value="matematika">Matematika</option>
                  <option value="bahasa-indonesia">Bahasa Indonesia</option>
                  <option value="ipa">IPA</option><option value="ips">IPS</option>
                </select>
              </div>
            </div>
            
            <div class="p-4 bg-white rounded-lg border">
              <label class="block text-sm font-semibold mb-2">📊 Efektivitas Metode</label>
              <textarea id="aspek-efektivitas" rows="2" class="w-full p-3 border rounded" required placeholder="Jelaskan..."></textarea>
            </div>
            
            <div class="p-4 bg-white rounded-lg border">
              <label class="block text-sm font-semibold mb-2">🎯 Ketercapaian TP</label>
              <input type="range" id="aspek-tp" min="0" max="100" value="75" class="w-full" oninput="document.getElementById('tp-val').textContent=this.value+'%'">
              <span id="tp-val" class="text-lg font-bold text-green-600">75%</span>
            </div>
            
            <div class="p-4 bg-white rounded-lg border">
              <label class="block text-sm font-semibold mb-2">⚠️ Kendala</label>
              <textarea id="aspek-kendala" rows="2" class="w-full p-3 border rounded" placeholder="Opsional..."></textarea>
            </div>
            
            <div class="p-4 bg-white rounded-lg border">
              <label class="block text-sm font-semibold mb-2">👥 Respon Siswa</label>
              <select id="aspek-respon" class="w-full p-3 border rounded" required>
                <option value="tinggi">😊 Tinggi (70-90% aktif)</option>
                <option value="sangat-tinggi">😍 Sangat Tinggi (>90%)</option>
                <option value="cukup">😐 Cukup (50-70%)</option>
                <option value="kurang">😟 Kurang (<50%)</option>
              </select>
            </div>
            
            <div class="p-4 bg-white rounded-lg border">
              <label class="block text-sm font-semibold mb-2">📋 Rencana Tindak Lanjut</label>
              <textarea id="aspek-tindak-lanjut" rows="2" class="w-full p-3 border rounded" required placeholder="Rencana perbaikan..."></textarea>
            </div>
            
            <div class="flex justify-end gap-3">
              <button type="button" onclick="resetRefleksiForm()" class="btn btn-ghost">Reset</button>
              <button type="submit" onclick="submitRefleksi(event)" class="btn btn-primary">Kirim</button>
            </div>
          </form>
        </div>
        ` : `<div class="p-4 bg-yellow-50 rounded text-center">⚠️ Login untuk menulis refleksi</div>`}
        
        <div class="refleksi-list space-y-4" id="refleksi-list">
          <div class="text-center py-8 text-gray-500">
            <i class="fas fa-spinner fa-spin text-2xl mb-3"></i><p>Memuat refleksi...</p>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Show container
  container.classList.remove('hidden');
  
  // Load realtime data
  loadRefleksiRealtime();
  
  console.log('✅ [Refleksi] Form rendered');
};

// ============================================
// ✅ FUNGSI: Reset Form
// ============================================
window.resetRefleksiForm = function() {
  document.getElementById('refleksi-form')?.reset();
  document.getElementById('tp-val').textContent = '75%';
};

// ============================================
// ✅ FUNGSI: Submit Refleksi
// ============================================
window.submitRefleksi = async function(event) {
  event.preventDefault();
  
  const user = auth.currentUser;
  if (!user) { alert('Login dulu!'); return; }
  
  const data = {
    kelas: document.getElementById('refleksi-kelas')?.value,
    mapel: document.getElementById('refleksi-mapel')?.value,
    efektivitas: document.getElementById('aspek-efektivitas')?.value.trim(),
    tpPersen: parseInt(document.getElementById('aspek-tp')?.value) || 0,
    kendala: document.getElementById('aspek-kendala')?.value.trim(),
    respon: document.getElementById('aspek-respon')?.value,
    tindakLanjut: document.getElementById('aspek-tindak-lanjut')?.value.trim()
  };
  
  if (!data.kelas || !data.mapel || !data.efektivitas || !data.tindakLanjut) {
    alert('Lengkapi field wajib!'); return;
  }
  
  try {
    await addDoc(collection(db, 'reflections'), {
      guruId: user.uid,
      guruName: user.displayName || 'Guru',
      guruEmail: user.email,
      guruPhoto: user.photoURL || 'https://ui-avatars.com/api/?name=User',
      ...data,
      timestamp: serverTimestamp(),
      edited: false
    });
    
    alert('✅ Refleksi terkirim!');
    resetRefleksiForm();
    
  } catch (error) {
    console.error('❌ Error:', error);
    alert('Gagal: ' + (error.code === 'permission-denied' ? 'Izin ditolak. Cek Firebase Rules!' : error.message));
  }
};

// ============================================
// ✅ FUNGSI: Load Refleksi Realtime
// ============================================
function loadRefleksiRealtime() {
  const list = document.getElementById('refleksi-list');
  if (!list) return;
  
  const q = query(collection(db, 'reflections'), orderBy('timestamp', 'desc'));
  
  onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      list.innerHTML = `<div class="text-center py-8 text-gray-500"><i class="fas fa-inbox text-3xl mb-3"></i><p>Belum ada refleksi</p></div>`;
      return;
    }
    
    list.innerHTML = snapshot.docs.map(doc => {
      const d = doc.data();
      return `
        <article class="bg-white p-4 rounded shadow border-l-4 border-purple-500">
          <div class="flex items-start gap-3">
            <img src="${d.guruPhoto}" class="w-10 h-10 rounded-full">
            <div class="flex-1">
              <div class="flex justify-between">
                <div><strong>${d.guruName}</strong><br><small class="text-gray-500">${d.guruEmail}</small></div>
                <small class="text-gray-400">${d.timestamp?.toDate?.()?.toLocaleString('id-ID') || '-'}</small>
              </div>
              <div class="mt-2 text-sm">
                <span class="bg-purple-100 px-2 py-0.5 rounded text-xs">Kelas ${d.kelas}</span>
                <span class="bg-blue-100 px-2 py-0.5 rounded text-xs ml-1">${d.mapel}</span>
              </div>
              <p class="mt-2 text-gray-700"><strong>📊 Efektivitas:</strong> ${d.efektivitas}</p>
              <p class="text-gray-700"><strong>🎯 TP:</strong> ${d.tpPersen}%</p>
              ${d.kendala ? `<p class="text-gray-700"><strong>⚠️ Kendala:</strong> ${d.kendala}</p>` : ''}
              <p class="text-gray-700"><strong>👥 Respon:</strong> ${d.respon}</p>
              <p class="text-gray-700"><strong>📋 Tindak Lanjut:</strong> ${d.tindakLanjut}</p>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }, (err) => {
    console.error('❌ Realtime error:', err);
    list.innerHTML = `<div class="text-center py-8 text-red-500">Gagal load: ${err.message}</div>`;
  });
}

// ============================================
// CONFIRM: Functions Registered
// ============================================
console.log('🟢 [Refleksi] window.renderRefleksiForm:', typeof window.renderRefleksiForm);
console.log('🟢 [Refleksi] window.submitRefleksi:', typeof window.submitRefleksi);
console.log('🟢 [Refleksi] Module FINISHED');
