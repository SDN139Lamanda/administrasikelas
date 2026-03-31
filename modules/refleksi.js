/**
 * ============================================
 * MODULE: REFLEKSI (FIREBASE REALTIME - TERSTRUKTUR)
 * Platform Administrasi Kelas Digital
 * ============================================
 */

import { db, auth, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy, onSnapshot, serverTimestamp, where } from '../js/firebase-config.js';

console.log('🔴 [Refleksi Module] Script START');

// ============================================
// ✅ FUNGSI: Render Form Refleksi Terstruktur
// ============================================
window.renderRefleksiForm = function() {
  const container = document.getElementById('refleksi-container');
  if (!container) return;
  
  const user = auth.currentUser;
  
  container.innerHTML = `
    <div class="container py-8">
      <div class="refleksi-section bg-white p-6 rounded-lg shadow-lg">
        <div class="section-header mb-6 border-b pb-4">
          <h2 class="text-2xl font-bold text-gray-800">
            <i class="fas fa-clipboard-list mr-2 text-purple-600"></i>
            Ruang Refleksi Guru
          </h2>
          <p class="text-gray-600 mt-2">Dokumentasi dan refleksi pembelajaran untuk peningkatan kualitas mengajar</p>
        </div>
        
        <!-- Form Tambah Refleksi Terstruktur -->
        ${user ? `
        <div class="mb-8 p-6 bg-purple-50 rounded-lg border border-purple-200">
          <h3 class="font-semibold text-purple-800 mb-4 flex items-center">
            <i class="fas fa-pen-fancy mr-2"></i>📝 Tulis Refleksi Baru
          </h3>
          
          <form id="refleksi-form" class="space-y-4">
            <!-- Kelas & Mapel -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  <i class="fas fa-chalkboard-teacher mr-2"></i>Kelas
                </label>
                <select id="refleksi-kelas" class="w-full p-3 border rounded-lg focus:outline-none focus:border-purple-500" required>
                  <option value="">Pilih Kelas</option>
                  <option value="1">Kelas 1</option>
                  <option value="2">Kelas 2</option>
                  <option value="3">Kelas 3</option>
                  <option value="4">Kelas 4</option>
                  <option value="5">Kelas 5</option>
                  <option value="6">Kelas 6</option>
                  <option value="7">Kelas 7</option>
                  <option value="8">Kelas 8</option>
                  <option value="9">Kelas 9</option>
                  <option value="10">Kelas 10</option>
                  <option value="11">Kelas 11</option>
                  <option value="12">Kelas 12</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  <i class="fas fa-book mr-2"></i>Mata Pelajaran
                </label>
                <select id="refleksi-mapel" class="w-full p-3 border rounded-lg focus:outline-none focus:border-purple-500" required>
                  <option value="">Pilih Mapel</option>
                  <option value="matematika">Matematika</option>
                  <option value="bahasa-indonesia">Bahasa Indonesia</option>
                  <option value="ipa">IPA</option>
                  <option value="ips">IPS</option>
                  <option value="bahasa-inggris">Bahasa Inggris</option>
                  <option value="ppkn">PPKn</option>
                  <option value="seni-budaya">Seni Budaya</option>
                  <option value="pjok">PJOK</option>
                  <option value="informatika">Informatika</option>
                  <option value="pai">Pendidikan Agama</option>
                </select>
              </div>
            </div>
            
            <!-- Aspek 1: Efektivitas Metode -->
            <div class="p-4 bg-white rounded-lg border border-gray-200">
              <label class="block text-sm font-semibold text-gray-800 mb-2">
                <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-2">1</span>
                📊 Efektivitas Metode
              </label>
              <p class="text-xs text-gray-500 mb-3">Apakah strategi pembelajaran yang digunakan berhasil membuat siswa aktif?</p>
              <textarea id="aspek-efektivitas" rows="3" class="w-full p-3 border rounded-lg focus:outline-none focus:border-purple-500" 
                        placeholder="Jelaskan efektivitas metode yang digunakan..." required></textarea>
            </div>
            
            <!-- Aspek 2: Ketercapaian TP -->
            <div class="p-4 bg-white rounded-lg border border-gray-200">
              <label class="block text-sm font-semibold text-gray-800 mb-2">
                <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs mr-2">2</span>
                🎯 Ketercapaian Tujuan Pembelajaran (TP)
              </label>
              <p class="text-xs text-gray-500 mb-3">Berapa persen siswa yang telah mencapai TP hari ini?</p>
              <div class="flex items-center gap-4">
                <input type="range" id="aspek-tp" min="0" max="100" value="75" class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" 
                       oninput="document.getElementById('tp-value').textContent = this.value + '%'">
                <span id="tp-value" class="text-2xl font-bold text-green-600 w-20 text-center">75%</span>
              </div>
              <textarea id="aspek-tp-catatan" rows="2" class="w-full p-3 border rounded-lg focus:outline-none focus:border-purple-500 mt-3" 
                        placeholder="Catatan tambahan tentang ketercapaian TP..."></textarea>
            </div>
            
            <!-- Aspek 3: Kendala -->
            <div class="p-4 bg-white rounded-lg border border-gray-200">
              <label class="block text-sm font-semibold text-gray-800 mb-2">
                <span class="bg-red-100 text-red-800 px-2 py-1 rounded text-xs mr-2">3</span>
                ⚠️ Kendala
              </label>
              <p class="text-xs text-gray-500 mb-3">Masalah apa yang muncul selama proses KBM (teknis, manajemen kelas, atau waktu)?</p>
              <textarea id="aspek-kendala" rows="3" class="w-full p-3 border rounded-lg focus:outline-none focus:border-purple-500" 
                        placeholder="Jelaskan kendala yang dihadapi..."></textarea>
            </div>
            
            <!-- Aspek 4: Respon Siswa -->
            <div class="p-4 bg-white rounded-lg border border-gray-200">
              <label class="block text-sm font-semibold text-gray-800 mb-2">
                <span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs mr-2">4</span>
                👥 Respon Siswa
              </label>
              <p class="text-xs text-gray-500 mb-3">Bagaimana tingkat keterlibatan siswa selama diskusi atau pengerjaan tugas?</p>
              <select id="aspek-respon" class="w-full p-3 border rounded-lg focus:outline-none focus:border-purple-500" required>
                <option value="">Pilih Tingkat Keterlibatan</option>
                <option value="sangat-tinggi">😍 Sangat Tinggi (>90% siswa aktif)</option>
                <option value="tinggi">😊 Tinggi (70-90% siswa aktif)</option>
                <option value="cukup">😐 Cukup (50-70% siswa aktif)</option>
                <option value="kurang">😟 Kurang (30-50% siswa aktif)</option>
                <option value="sangat-kurang">😞 Sangat Kurang (<30% siswa aktif)</option>
              </select>
              <textarea id="aspek-respon-catatan" rows="2" class="w-full p-3 border rounded-lg focus:outline-none focus:border-purple-500 mt-3" 
                        placeholder="Catatan tambahan tentang respon siswa..."></textarea>
            </div>
            
            <!-- Aspek 5: Rencana Tindak Lanjut -->
            <div class="p-4 bg-white rounded-lg border border-gray-200">
              <label class="block text-sm font-semibold text-gray-800 mb-2">
                <span class="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs mr-2">5</span>
                📋 Rencana Tindak Lanjut
              </label>
              <p class="text-xs text-gray-500 mb-3">Apa yang perlu diubah atau diperbaiki untuk pertemuan berikutnya?</p>
              <textarea id="aspek-tindak-lanjut" rows="3" class="w-full p-3 border rounded-lg focus:outline-none focus:border-purple-500" 
                        placeholder="Rencana perbaikan untuk pertemuan berikutnya..." required></textarea>
            </div>
            
            <!-- Submit Button -->
            <div class="flex justify-end gap-3 pt-4">
              <button type="button" onclick="resetRefleksiForm()" class="btn btn-ghost">
                <i class="fas fa-undo mr-2"></i>Reset
              </button>
              <button type="submit" onclick="submitRefleksi(event)" class="btn btn-primary">
                <i class="fas fa-paper-plane mr-2"></i>Kirim Refleksi
              </button>
            </div>
          </form>
        </div>
        ` : `
        <div class="mb-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200 text-center">
          <p class="text-yellow-800">⚠️ Silakan login untuk menulis refleksi</p>
        </div>
        `}
        
        <!-- Filter -->
        <div class="mb-6 flex flex-wrap gap-4 items-center">
          <label class="text-sm font-semibold text-gray-700">
            <i class="fas fa-filter mr-2"></i>Filter:
          </label>
          <select id="filter-kelas" onchange="loadRefleksiRealtime()" class="px-3 py-2 border rounded-lg focus:outline-none focus:border-purple-500 text-sm">
            <option value="all">Semua Kelas</option>
            <option value="1">Kelas 1</option>
            <option value="2">Kelas 2</option>
            <option value="3">Kelas 3</option>
            <option value="4">Kelas 4</option>
            <option value="5">Kelas 5</option>
            <option value="6">Kelas 6</option>
          </select>
          <select id="filter-mapel" onchange="loadRefleksiRealtime()" class="px-3 py-2 border rounded-lg focus:outline-none focus:border-purple-500 text-sm">
            <option value="all">Semua Mapel</option>
            <option value="matematika">Matematika</option>
            <option value="bahasa-indonesia">Bahasa Indonesia</option>
            <option value="ipa">IPA</option>
            <option value="ips">IPS</option>
          </select>
          <span id="refleksi-count" class="text-sm text-gray-500"></span>
        </div>
        
        <!-- Daftar Refleksi (Realtime) -->
        <div class="refleksi-list space-y-4" id="refleksi-list">
          <div class="text-center py-8 text-gray-500">
            <i class="fas fa-spinner fa-spin text-2xl mb-3"></i>
            <p>Memuat refleksi...</p>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Load refleksi realtime
  loadRefleksiRealtime();
};

// ============================================
// ✅ FUNGSI: Reset Form
// ============================================
window.resetRefleksiForm = function() {
  document.getElementById('refleksi-form')?.reset();
  document.getElementById('tp-value').textContent = '75%';
};

// ============================================
// ✅ FUNGSI: Submit Refleksi Terstruktur
// ============================================
window.submitRefleksi = async function(event) {
  event.preventDefault();
  
  const user = auth.currentUser;
  if (!user) {
    alert('⚠️ Silakan login untuk menulis refleksi!');
    return;
  }
  
  // Get form values
  const data = {
    kelas: document.getElementById('refleksi-kelas')?.value,
    mapel: document.getElementById('refleksi-mapel')?.value,
    efektivitas: document.getElementById('aspek-efektivitas')?.value.trim(),
    tpPersen: parseInt(document.getElementById('aspek-tp')?.value) || 0,
    tpCatatan: document.getElementById('aspek-tp-catatan')?.value.trim(),
    kendala: document.getElementById('aspek-kendala')?.value.trim(),
    respon: document.getElementById('aspek-respon')?.value,
    responCatatan: document.getElementById('aspek-respon-catatan')?.value.trim(),
    tindakLanjut: document.getElementById('aspek-tindak-lanjut')?.value.trim()
  };
  
  // Validation
  if (!data.kelas || !data.mapel) {
    alert('⚠️ Pilih kelas dan mata pelajaran!');
    return;
  }
  if (!data.efektivitas || data.efektivitas.length < 10) {
    alert('⚠️ Efektivitas metode minimal 10 karakter!');
    return;
  }
  if (!data.tindakLanjut || data.tindakLanjut.length < 10) {
    alert('⚠️ Rencana tindak lanjut minimal 10 karakter!');
    return;
  }
  
  try {
    console.log('📤 [Refleksi] Submitting structured reflection...');
    
    await addDoc(collection(db, 'reflections'), {
      // User info
      guruId: user.uid,
      guruName: user.displayName || 'Guru',
      guruEmail: user.email,
      guruPhoto: user.photoURL || 'https://ui-avatars.com/api/?name=User&background=7c3aed&color=fff',
      
      // Reflection data
      kelas: data.kelas,
      mapel: data.mapel,
      efektivitas: data.efektivitas,
      tpPersen: data.tpPersen,
      tpCatatan: data.tpCatatan,
      kendala: data.kendala,
      respon: data.respon,
      responCatatan: data.responCatatan,
      tindakLanjut: data.tindakLanjut,
      
      // Metadata
      timestamp: serverTimestamp(),
      edited: false,
      likes: 0,
      comments: 0
    });
    
    console.log('✅ [Refleksi] Reflection submitted!');
    resetRefleksiForm();
    alert('✅ Refleksi berhasil dikirim!');
    
  } catch (error) {
    console.error('❌ [Refleksi] Error submitting reflection:', error);
    
    if (error.code === 'permission-denied') {
      alert('❌ Anda tidak memiliki izin untuk menulis refleksi. Periksa Firebase Rules!');
    } else if (error.code === 'failed-precondition') {
      alert('❌ Validasi data gagal. Periksa format input!');
    } else {
      alert('❌ Gagal mengirim refleksi: ' + error.message);
    }
  }
};

// ============================================
// ✅ FUNGSI: Load Refleksi (REALTIME with Filter)
// ============================================
function loadRefleksiRealtime() {
  const refleksiList = document.getElementById('refleksi-list');
  const refleksiCount = document.getElementById('refleksi-count');
  if (!refleksiList) return;
  
  const filterKelas = document.getElementById('filter-kelas')?.value || 'all';
  const filterMapel = document.getElementById('filter-mapel')?.value || 'all';
  
  // Build query with filters
  let q = query(collection(db, 'reflections'), orderBy('timestamp', 'desc'));
  
  // ✅ REALTIME LISTENER
  onSnapshot(q, (snapshot) => {
    console.log('🔄 [Refleksi] Realtime update:', snapshot.docs.length, 'reflections');
    
    // Filter client-side for simplicity (for production, use composite indexes)
    let docs = snapshot.docs;
    
    if (filterKelas !== 'all') {
      docs = docs.filter(doc => doc.data().kelas === filterKelas);
    }
    if (filterMapel !== 'all') {
      docs = docs.filter(doc => doc.data().mapel === filterMapel);
    }
    
    if (refleksiCount) {
      refleksiCount.textContent = `${docs.length} refleksi`;
    }
    
    if (docs.length === 0) {
      refleksiList.innerHTML = `
        <div class="text-center py-8 text-gray-500">
          <i class="fas fa-inbox text-3xl mb-3"></i>
          <p>Belum ada refleksi. Jadilah yang pertama!</p>
        </div>
      `;
      return;
    }
    
    const user = auth.currentUser;
    
    refleksiList.innerHTML = docs.map(docSnap => {
      const data = docSnap.data();
      const isOwner = user && user.uid === data.guruId;
      const timestamp = data.timestamp?.toDate ? data.timestamp.toDate() : new Date();
      
      // Respon emoji
      const responEmoji = {
        'sangat-tinggi': '😍',
        'tinggi': '😊',
        'cukup': '😐',
        'kurang': '😟',
        'sangat-kurang': '😞'
      }[data.respon] || '😐';
      
      return `
        <article class="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500 hover:shadow-lg transition">
          <!-- Header -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <img src="${data.guruPhoto}" alt="${data.guruName}" class="w-12 h-12 rounded-full">
              <div>
                <h4 class="font-bold text-gray-800">${data.guruName}</h4>
                <p class="text-sm text-gray-500">${data.guruEmail}</p>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                    <i class="fas fa-chalkboard-teacher mr-1"></i>Kelas ${data.kelas}
                  </span>
                  <span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    <i class="fas fa-book mr-1"></i>${formatMapel(data.mapel)}
                  </span>
                  <span class="text-xs text-gray-400">
                    <i class="fas fa-clock mr-1"></i>${formatTimestamp(timestamp)}
                  </span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              ${isOwner ? `
              <button onclick="editRefleksi('${docSnap.id}')" class="text-blue-600 hover:text-blue-800 text-sm p-2">
                <i class="fas fa-edit"></i>
              </button>
              <button onclick="deleteRefleksi('${docSnap.id}')" class="text-red-600 hover:text-red-800 text-sm p-2">
                <i class="fas fa-trash"></i>
              </button>
              ` : ''}
            </div>
          </div>
          
          <!-- Content Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Aspek 1 -->
            <div class="p-3 bg-blue-50 rounded-lg">
              <h5 class="font-semibold text-blue-800 text-sm mb-2">
                <span class="bg-blue-200 text-blue-800 px-2 py-0.5 rounded text-xs mr-2">1</span>
                📊 Efektivitas Metode
              </h5>
              <p class="text-sm text-gray-700">${escapeHtml(data.efektivitas)}</p>
            </div>
            
            <!-- Aspek 2 -->
            <div class="p-3 bg-green-50 rounded-lg">
              <h5 class="font-semibold text-green-800 text-sm mb-2">
                <span class="bg-green-200 text-green-800 px-2 py-0.5 rounded text-xs mr-2">2</span>
                🎯 Ketercapaian TP
              </h5>
              <div class="flex items-center gap-2 mb-2">
                <div class="flex-1 bg-gray-200 rounded-full h-3">
                  <div class="bg-green-500 h-3 rounded-full" style="width: ${data.tpPersen}%"></div>
                </div>
                <span class="text-lg font-bold text-green-600">${data.tpPersen}%</span>
              </div>
              ${data.tpCatatan ? `<p class="text-xs text-gray-600">${escapeHtml(data.tpCatatan)}</p>` : ''}
            </div>
            
            <!-- Aspek 3 -->
            <div class="p-3 bg-red-50 rounded-lg">
              <h5 class="font-semibold text-red-800 text-sm mb-2">
                <span class="bg-red-200 text-red-800 px-2 py-0.5 rounded text-xs mr-2">3</span>
                ⚠️ Kendala
              </h5>
              <p class="text-sm text-gray-700">${data.kendala ? escapeHtml(data.kendala) : '<span class="text-gray-400">Tidak ada kendala</span>'}</p>
            </div>
            
            <!-- Aspek 4 -->
            <div class="p-3 bg-yellow-50 rounded-lg">
              <h5 class="font-semibold text-yellow-800 text-sm mb-2">
                <span class="bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded text-xs mr-2">4</span>
                👥 Respon Siswa
              </h5>
              <p class="text-sm text-gray-700">${responEmoji} ${formatRespon(data.respon)}</p>
              ${data.responCatatan ? `<p class="text-xs text-gray-600 mt-1">${escapeHtml(data.responCatatan)}</p>` : ''}
            </div>
          </div>
          
          <!-- Aspek 5 (Full Width) -->
          <div class="mt-4 p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
            <h5 class="font-semibold text-purple-800 text-sm mb-2">
              <span class="bg-purple-200 text-purple-800 px-2 py-0.5 rounded text-xs mr-2">5</span>
              📋 Rencana Tindak Lanjut
            </h5>
            <p class="text-sm text-gray-700">${escapeHtml(data.tindakLanjut)}</p>
          </div>
          
          ${data.edited ? '<p class="text-xs text-gray-400 mt-3"><i class="fas fa-pen"></i> Diedit</p>' : ''}
        </article>
      `;
    }).join('');
    
  }, (error) => {
    console.error('❌ [Refleksi] Realtime error:', error);
    refleksiList.innerHTML = `
      <div class="text-center py-8 text-red-500">
        <i class="fas fa-exclamation-circle text-3xl mb-3"></i>
        <p>Gagal memuat refleksi: ${error.message}</p>
        <p class="text-sm mt-2">Periksa Firebase Rules & koneksi internet</p>
      </div>
    `;
  });
}

// ============================================
// ✅ FUNGSI: Edit Refleksi
// ============================================
window.editRefleksi = async function(reflectionId) {
  alert('ℹ️ Fitur edit akan membuka form dengan data existing. (Implementasi lengkap pada versi berikutnya)');
  // TODO: Implement full edit functionality
};

// ============================================
// ✅ FUNGSI: Delete Refleksi
// ============================================
window.deleteRefleksi = async function(reflectionId) {
  if (!confirm('⚠️ Apakah Anda yakin ingin menghapus refleksi ini?')) return;
  
  try {
    await deleteDoc(doc(db, 'reflections', reflectionId));
    alert('✅ Refleksi berhasil dihapus!');
  } catch (error) {
    console.error('❌ [Refleksi] Error deleting reflection:', error);
    if (error.code === 'permission-denied') {
      alert('❌ Anda tidak memiliki izin untuk menghapus refleksi ini!');
    } else {
      alert('❌ Gagal menghapus refleksi: ' + error.message);
    }
  }
};

// ============================================
// ✅ HELPER: Format Mapel Name
// ============================================
function formatMapel(mapel) {
  const mapelNames = {
    'matematika': 'Matematika',
    'bahasa-indonesia': 'B. Indonesia',
    'ipa': 'IPA',
    'ips': 'IPS',
    'bahasa-inggris': 'B. Inggris',
    'ppkn': 'PPKn',
    'seni-budaya': 'Seni Budaya',
    'pjok': 'PJOK',
    'informatika': 'Informatika',
    'pai': 'Pendidikan Agama'
  };
  return mapelNames[mapel] || mapel;
}

// ============================================
// ✅ HELPER: Format Respon
// ============================================
function formatRespon(respon) {
  const responNames = {
    'sangat-tinggi': 'Sangat Tinggi (>90% aktif)',
    'tinggi': 'Tinggi (70-90% aktif)',
    'cukup': 'Cukup (50-70% aktif)',
    'kurang': 'Kurang (30-50% aktif)',
    'sangat-kurang': 'Sangat Kurang (<30% aktif)'
  };
  return responNames[respon] || respon;
}

// ============================================
// ✅ HELPER: Format Timestamp
// ============================================
function formatTimestamp(date) {
  return date.toLocaleDateString('id-ID', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// ============================================
// ✅ HELPER: Escape HTML (Security)
// ============================================
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================
// CONFIRM: Functions Registered
// ============================================
console.log('🟢 [Refleksi] window.renderRefleksiForm:', typeof window.renderRefleksiForm);
console.log('🟢 [Refleksi] window.submitRefleksi:', typeof window.submitRefleksi);
console.log('🟢 [Refleksi] Module FINISHED');
