/**
 * ============================================
 * MODULE: REFLEKSI GURU
 * Platform Administrasi Kelas Digital
 * ISOLASI DATA: guruId-based filtering
 * ============================================
 * Fitur:
 * - Form refleksi terstruktur (6 aspek)
 * - Firebase Firestore realtime
 * - Multi-user support dengan isolasi data
 * - Auto-save dengan timestamp
 * ============================================
 */

console.log('🔴 [Refleksi Module] Script START');

// ✅ STEP 1: Import Firebase (dari folder yang sama)
import { 
  db, 
  auth, 
  collection, 
  addDoc, 
  serverTimestamp
} from './firebase-config.js';

console.log('✅ [Refleksi] Firebase imports successful');
console.log('✅ [Refleksi] db:', typeof db);
console.log('✅ [Refleksi] auth:', typeof auth);

// ✅ STEP 2: Register Global Function (untuk onclick di HTML)
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
  
  // ✅ STEP 3: Render HTML Form
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
      .reflection-item small {
        color: #666;
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
  
  console.log('✅ [Refleksi] Form ready');
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
    console.log('🔥 [Refleksi] Sending to Firestore (collection: pembelajaran)...');
    
    await addDoc(collection(db, 'pembelajaran'), {
      userId: user.uid,
      jenis: 'refleksi',
      jenjang: '',
      kelas: data.kelas || '',
      mapel: data.mapel || '',
      judul: data.judul || 'Refleksi Guru',
      konten: `
        <h3>✅ Sudah Dilakukan:</h3>
        <p>${data.sudah || '-'}</p>
        <h3>⚠️ Belum Optimal:</h3>
        <p>${data.belum || '-'}</p>
        <h3>💡 Dipelajari:</h3>
        <p>${data.pelajaran || '-'}</p>
        <h3>📋 Rencana:</h3>
        <p>${data.rencana || '-'}</p>
        <h3>💭 Perasaan:</h3>
        <p>${data.perasaan || '-'}</p>
      `,
      tags: ['refleksi', 'guru'],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ [Refleksi] Data sent to pembelajaran collection!');
    alert('✅ Refleksi berhasil disimpan!\n\nData akan muncul di:\nAdm.Pembelajaran → 📋 Dokumen CTA & Modul');
    event.target.reset();
    
  } catch (error) {
    console.error('❌ [Refleksi] Error sending ', error);
    alert('❌ Gagal: ' + (error.code === 'permission-denied' ? 'Izin ditolak. Cek Firebase Rules!' : error.message));
  }
}

// ✅ STEP 9: Confirm Registration
console.log('🟢 [Refleksi] window.renderRefleksiForm:', typeof window.renderRefleksiForm);
console.log('🟢 [Refleksi] Module FINISHED - Save to pembelajaran collection');

// ✅ STEP 10: Auto-test (untuk debugging)
setTimeout(() => {
  if (typeof window.renderRefleksiForm === 'function') {
    console.log('✅ [Refleksi] Function is registered and callable!');
  } else {
    console.error('❌ [Refleksi] Function NOT registered! Check import/export!');
  }
}, 2000);
