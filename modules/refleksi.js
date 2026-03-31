/**
 * ============================================
 * MODULE: REFLEKSI (FRESH START)
 * Platform Administrasi Kelas Digital
 * ============================================
 */

console.log('🔴 [Refleksi Module] Script START');

// ✅ STEP 1: Import Firebase (dari folder yang sama)
import { db, auth, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from './firebase-config.js';

console.log('✅ [Refleksi] Firebase imports successful');

// ✅ STEP 2: Register Global Function
window.renderRefleksiForm = function() {
  console.log('📝 [Refleksi] renderRefleksiForm() called');
  
  const container = document.getElementById('refleksi-container');
  
  if (!container) {
    console.error('❌ [Refleksi] Container #refleksi-container NOT FOUND!');
    alert('Error: Container refleksi tidak ditemukan di HTML!');
    return;
  }
  
  console.log('✅ [Refleksi] Container found');
  
  const user = auth.currentUser;
  console.log('👤 [Refleksi] Current user:', user?.email || 'Not logged in');
  
  // ✅ STEP 3: Render HTML
  container.innerHTML = `
    <div class="container py-8">
      <div class="bg-white p-6 rounded-lg shadow-lg">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">
          <i class="fas fa-clipboard-list mr-2 text-purple-600"></i>
          Ruang Refleksi Guru
        </h2>
        
        ${user ? `
          <!-- Form untuk user yang sudah login -->
          <div class="mb-6 p-4 bg-purple-50 rounded-lg">
            <form id="refleksi-form" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold mb-2">Kelas</label>
                  <select id="refleksi-kelas" class="w-full p-2 border rounded" required>
                    <option value="">Pilih</option>
                    <option value="1">Kelas 1</option>
                    <option value="2">Kelas 2</option>
                    <option value="3">Kelas 3</option>
                    <option value="4">Kelas 4</option>
                    <option value="5">Kelas 5</option>
                    <option value="6">Kelas 6</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-semibold mb-2">Mapel</label>
                  <select id="refleksi-mapel" class="w-full p-2 border rounded" required>
                    <option value="">Pilih</option>
                    <option value="matematika">Matematika</option>
                    <option value="bahasa-indonesia">B. Indonesia</option>
                    <option value="ipa">IPA</option>
                    <option value="ips">IPS</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-semibold mb-2">📊 Efektivitas Metode</label>
                <textarea id="aspek-efektivitas" rows="2" class="w-full p-2 border rounded" required></textarea>
              </div>
              
              <div>
                <label class="block text-sm font-semibold mb-2">🎯 Ketercapaian TP (%)</label>
                <input type="number" id="aspek-tp" min="0" max="100" value="75" class="w-full p-2 border rounded">
              </div>
              
              <div>
                <label class="block text-sm font-semibold mb-2">⚠️ Kendala</label>
                <textarea id="aspek-kendala" rows="2" class="w-full p-2 border rounded"></textarea>
              </div>
              
              <div>
                <label class="block text-sm font-semibold mb-2">📋 Tindak Lanjut</label>
                <textarea id="aspek-tindak-lanjut" rows="2" class="w-full p-2 border rounded" required></textarea>
              </div>
              
              <button type="submit" class="btn btn-primary w-full">
                <i class="fas fa-paper-plane mr-2"></i>Kirim Refleksi
              </button>
            </form>
          </div>
        ` : `
          <!-- Pesan untuk user belum login -->
          <div class="p-4 bg-yellow-50 rounded text-center">
            <p class="text-yellow-800">⚠️ Silakan login untuk menulis refleksi</p>
          </div>
        `}
        
        <!-- List Refleksi -->
        <div id="refleksi-list" class="space-y-4">
          <div class="text-center py-8 text-gray-500">
            <i class="fas fa-spinner fa-spin text-2xl mb-3"></i>
            <p>Memuat refleksi...</p>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // ✅ STEP 4: Show Container
  container.classList.remove('hidden');
  console.log('✅ [Refleksi] Container displayed');
  
  // ✅ STEP 5: Add Form Submit Handler
  const form = document.getElementById('refleksi-form');
  if (form) {
    form.addEventListener('submit', handleSubmit);
    console.log('✅ [Refleksi] Form submit handler attached');
  }
  
  // ✅ STEP 6: Load Realtime Data
  loadRefleksiData();
  console.log('✅ [Refleksi] Realtime data loading started');
};

// ✅ STEP 7: Handle Form Submit
async function handleSubmit(event) {
  event.preventDefault();
  console.log('📤 [Refleksi] Form submitted');
  
  const user = auth.currentUser;
  if (!user) {
    alert('⚠️ Silakan login dulu!');
    return;
  }
  
  const data = {
    kelas: document.getElementById('refleksi-kelas')?.value,
    mapel: document.getElementById('refleksi-mapel')?.value,
    efektivitas: document.getElementById('aspek-efektivitas')?.value.trim(),
    tpPersen: parseInt(document.getElementById('aspek-tp')?.value) || 0,
    kendala: document.getElementById('aspek-kendala')?.value.trim(),
    tindakLanjut: document.getElementById('aspek-tindak-lanjut')?.value.trim()
  };
  
  // Validation
  if (!data.kelas || !data.mapel || !data.efektivitas || !data.tindakLanjut) {
    alert('⚠️ Lengkapi field wajib!');
    return;
  }
  
  try {
    console.log('🔥 [Refleksi] Sending to Firestore...');
    
    await addDoc(collection(db, 'reflections'), {
      guruId: user.uid,
      guruName: user.displayName || 'Guru',
      guruEmail: user.email,
      guruPhoto: user.photoURL || 'https://ui-avatars.com/api/?name=User',
      ...data,
      timestamp: serverTimestamp(),
      edited: false
    });
    
    console.log('✅ [Refleksi] Data sent successfully!');
    alert('✅ Refleksi berhasil dikirim!');
    form.reset();
    
  } catch (error) {
    console.error('❌ [Refleksi] Error sending data:', error);
    alert('❌ Gagal: ' + (error.code === 'permission-denied' ? 'Izin ditolak. Cek Firebase Rules!' : error.message));
  }
}

// ✅ STEP 8: Load Realtime Data
function loadRefleksiData() {
  const list = document.getElementById('refleksi-list');
  if (!list) {
    console.error('❌ [Refleksi] List container not found!');
    return;
  }
  
  console.log('🔄 [Refleksi] Setting up realtime listener...');
  
  const q = query(collection(db, 'reflections'), orderBy('timestamp', 'desc'));
  
  onSnapshot(q, (snapshot) => {
    console.log('📥 [Refleksi] Realtime update:', snapshot.docs.length, 'documents');
    
    if (snapshot.empty) {
      list.innerHTML = `
        <div class="text-center py-8 text-gray-500">
          <i class="fas fa-inbox text-3xl mb-3"></i>
          <p>Belum ada refleksi. Jadilah yang pertama!</p>
        </div>
      `;
      return;
    }
    
    list.innerHTML = snapshot.docs.map(doc => {
      const d = doc.data();
      const date = d.timestamp?.toDate?.()?.toLocaleString('id-ID') || '-';
      
      return `
        <div class="bg-white p-4 rounded shadow border-l-4 border-purple-500">
          <div class="flex items-start gap-3">
            <img src="${d.guruPhoto}" class="w-10 h-10 rounded-full">
            <div class="flex-1">
              <div class="flex justify-between items-start">
                <div>
                  <strong class="text-gray-800">${d.guruName}</strong>
                  <br><small class="text-gray-500">${d.guruEmail}</small>
                </div>
                <small class="text-gray-400">${date}</small>
              </div>
              <div class="mt-2 text-sm">
                <span class="bg-purple-100 px-2 py-0.5 rounded text-xs">Kelas ${d.kelas}</span>
                <span class="bg-blue-100 px-2 py-0.5 rounded text-xs ml-1">${d.mapel}</span>
              </div>
              <p class="mt-2 text-gray-700"><strong>📊 Efektivitas:</strong> ${d.efektivitas}</p>
              <p class="text-gray-700"><strong>🎯 TP:</strong> ${d.tpPersen}%</p>
              ${d.kendala ? `<p class="text-gray-700"><strong>⚠️ Kendala:</strong> ${d.kendala}</p>` : ''}
              <p class="text-gray-700"><strong>📋 Tindak Lanjut:</strong> ${d.tindakLanjut}</p>
            </div>
          </div>
        </div>
      `;
    }).join('');
    
  }, (error) => {
    console.error('❌ [Refleksi] Realtime error:', error);
    list.innerHTML = `
      <div class="text-center py-8 text-red-500">
        <i class="fas fa-exclamation-circle text-3xl mb-3"></i>
        <p>Gagal memuat: ${error.message}</p>
        <p class="text-sm mt-2">Cek Firebase Console & Rules</p>
      </div>
    `;
  });
}

// ✅ STEP 9: Confirm Registration
console.log('🟢 [Refleksi] window.renderRefleksiForm:', typeof window.renderRefleksiForm);
console.log('🟢 [Refleksi] Module FINISHED - Ready to use!');

// ✅ STEP 10: Auto-test (remove after testing)
setTimeout(() => {
  console.log('🧪 [Refleksi] Auto-test: Calling renderRefleksiForm()...');
  if (typeof window.renderRefleksiForm === 'function') {
    console.log('✅ [Refleksi] Function is registered and callable!');
  } else {
    console.error('❌ [Refleksi] Function NOT registered! Check import/export!');
  }
}, 2000);
