/**
 * ============================================
 * MODULE: REFLEKSI (FORM SIMPLE + FIREBASE)
 * Platform Administrasi Kelas Digital
 * ============================================
 */

console.log('🔴 [Refleksi Module] Script START');

// ✅ Import Firebase
import { db, auth, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from './firebase-config.js';

console.log('✅ [Refleksi] Firebase imports successful');

// ✅ Global Function
window.renderRefleksiForm = function() {
  console.log('📝 [Refleksi] renderRefleksiForm() called');
  
  const container = document.getElementById('refleksi-container');
  if (!container) {
    console.error('❌ Container not found!');
    return;
  }
  
  const user = auth.currentUser;
  
  // ✅ Render Form (Design dari Anda + Firebase Integration)
  container.innerHTML = `
    <style>
      .reflection-form {
        max-width: 800px;
        margin: auto;
        padding: 20px;
        background: #f9f9f9;
        border-radius: 8px;
      }
      .reflection-form h2 {
        text-align: center;
        color: #6b46c1;
        margin-bottom: 20px;
      }
      .reflection-form label {
        display: block;
        margin-top: 15px;
        font-weight: bold;
        color: #333;
      }
      .reflection-form textarea {
        width: 100%;
        height: 80px;
        margin-top: 5px;
        padding: 10px;
        border-radius: 4px;
        border: 1px solid #ccc;
        resize: vertical;
        font-family: Arial, sans-serif;
      }
      .reflection-form button {
        margin-top: 20px;
        padding: 12px 30px;
        background: #6b46c1;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
        width: 100%;
      }
      .reflection-form button:hover {
        background: #553c9a;
      }
      .reflection-item {
        background: white;
        padding: 15px;
        margin-top: 15px;
        border-radius: 6px;
        border-left: 4px solid #6b46c1;
      }
    </style>
    
    <div class="container py-8">
      <div class="reflection-form">
        <h2>📝 Form Refleksi Guru</h2>
        
        ${user ? `
          <form id="refleksi-form">
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label>Kelas</label>
                <select id="refleksi-kelas" class="w-full p-2 border rounded" required>
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
                <label>Mata Pelajaran</label>
                <select id="refleksi-mapel" class="w-full p-2 border rounded" required>
                  <option value="">Pilih Mapel</option>
                  <option value="matematika">Matematika</option>
                  <option value="bahasa-indonesia">B. Indonesia</option>
                  <option value="ipa">IPA</option>
                  <option value="ips">IPS</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>
            </div>
            
            <label for="judul">📌 Judul Refleksi</label>
            <textarea id="judul" name="judul" placeholder="Contoh: Refleksi Pembelajaran Matematika Kelas 5 - Pecahan" required></textarea>
            
            <label for="sudah">✅ Apa yang sudah dilakukan?</label>
            <textarea id="sudah" name="sudah" placeholder="Deskripsikan kegiatan pembelajaran yang sudah dilaksanakan..." required></textarea>
            
            <label for="belum">⚠️ Apa yang belum optimal?</label>
            <textarea id="belum" name="belum" placeholder="Identifikasi kendala atau hal yang perlu diperbaiki..."></textarea>
            
            <label for="pelajaran">💡 Apa yang dipelajari?</label>
            <textarea id="pelajaran" name="pelajaran" placeholder="Insight atau pembelajaran yang didapat dari kegiatan ini..."></textarea>
            
            <label for="rencana">📋 Rencana ke depan</label>
            <textarea id="rencana" name="rencana" placeholder="Tindak lanjut untuk pertemuan berikutnya..." required></textarea>
            
            <label for="perasaan">💭 Perasaan dan sikap pribadi</label>
            <textarea id="perasaan" name="perasaan" placeholder="Refleksi pribadi tentang pengalaman mengajar..."></textarea>
            
            <button type="submit">💾 Simpan Refleksi</button>
          </form>
        ` : `
          <div class="p-4 bg-yellow-50 rounded text-center">
            <p class="text-yellow-800">⚠️ Silakan login untuk menulis refleksi</p>
          </div>
        `}
        
        <!-- List Refleksi -->
        <h3 class="text-xl font-bold mt-8 mb-4">📚 Refleksi Tersimpan</h3>
        <div id="refleksi-list" class="space-y-4">
          <div class="text-center py-8 text-gray-500">
            <i class="fas fa-spinner fa-spin text-2xl mb-3"></i>
            <p>Memuat refleksi...</p>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Show container
  container.classList.remove('hidden');
  
  // Add form submit handler
  const form = document.getElementById('refleksi-form');
  if (form) {
    form.addEventListener('submit', handleSubmit);
  }
  
  // Load realtime data
  loadRefleksiData();
  
  console.log('✅ [Refleksi] Form rendered & ready');
};

// ✅ Handle Form Submit
async function handleSubmit(event) {
  event.preventDefault();
  
  const user = auth.currentUser;
  if (!user) {
    alert('⚠️ Silakan login dulu!');
    return;
  }
  
  const data = {
    kelas: document.getElementById('refleksi-kelas')?.value,
    mapel: document.getElementById('refleksi-mapel')?.value,
    judul: document.getElementById('judul')?.value.trim(),
    sudah: document.getElementById('sudah')?.value.trim(),
    belum: document.getElementById('belum')?.value.trim(),
    pelajaran: document.getElementById('pelajaran')?.value.trim(),
    rencana: document.getElementById('rencana')?.value.trim(),
    perasaan: document.getElementById('perasaan')?.value.trim()
  };
  
  // Validation
  if (!data.kelas || !data.mapel || !data.judul || !data.sudah || !data.rencana) {
    alert('⚠️ Lengkapi field wajib (Kelas, Mapel, Judul, Sudah dilakukan, Rencana)!');
    return;
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
    
    alert('✅ Refleksi berhasil disimpan!');
    form.reset();
    
  } catch (error) {
    console.error('❌ Error:', error);
    alert('❌ Gagal: ' + (error.code === 'permission-denied' ? 'Izin ditolak. Cek Firebase Rules!' : error.message));
  }
}

// ✅ Load Realtime Data
function loadRefleksiData() {
  const list = document.getElementById('refleksi-list');
  if (!list) return;
  
  const q = query(collection(db, 'reflections'), orderBy('timestamp', 'desc'));
  
  onSnapshot(q, (snapshot) => {
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
        <div class="reflection-item">
          <div class="flex justify-between items-start mb-2">
            <div>
              <strong class="text-lg">${d.judul || 'Tanpa Judul'}</strong>
              <br>
              <small class="text-gray-500">${d.guruName} • ${d.guruEmail}</small>
            </div>
            <small class="text-gray-400">${date}</small>
          </div>
          <div class="text-sm mb-2">
            <span class="bg-purple-100 px-2 py-0.5 rounded text-xs">Kelas ${d.kelas}</span>
            <span class="bg-blue-100 px-2 py-0.5 rounded text-xs ml-1">${d.mapel}</span>
          </div>
          <p class="text-gray-700"><strong>✅ Sudah:</strong> ${d.sudah}</p>
          ${d.belum ? `<p class="text-gray-700"><strong>⚠️ Belum:</strong> ${d.belum}</p>` : ''}
          ${d.pelajaran ? `<p class="text-gray-700"><strong>💡 Dipelajari:</strong> ${d.pelajaran}</p>` : ''}
          <p class="text-gray-700"><strong>📋 Rencana:</strong> ${d.rencana}</p>
          ${d.perasaan ? `<p class="text-gray-700"><strong>💭 Perasaan:</strong> ${d.perasaan}</p>` : ''}
        </div>
      `;
    }).join('');
    
  }, (error) => {
    console.error('❌ Realtime error:', error);
    list.innerHTML = `
      <div class="text-center py-8 text-red-500">
        <i class="fas fa-exclamation-circle text-3xl mb-3"></i>
        <p>Gagal memuat: ${error.message}</p>
      </div>
    `;
  });
}

// ✅ Confirm Registration
console.log('🟢 [Refleksi] window.renderRefleksiForm:', typeof window.renderRefleksiForm);
console.log('🟢 [Refleksi] Module FINISHED - Ready to use!');
