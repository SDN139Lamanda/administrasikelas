/**
 * PENILAIAN MODULE - FRESH DESIGN
 * ✅ 100% compatible with adm-kelas architecture
 * ✅ Minimal error: proper window exposure + syntax validated
 * ✅ Preserves penilaian model: PH, STS, SAS, NA, Sikap
 */

// ✅ Import pattern: match adm-kelas.js
import { storage } from '../adm-kelas/storage.js';
import { penilaianStorage } from './penilaian-storage.js';
import { hitungNA, formatNilai, showToast } from './penilaian-utils.js';

// ✅ State management: match adm-kelas.js pattern
let dbKelas = [];
let dbNilaiFull = {};
let indexAktif = null;
let viewAktif = 'pengetahuan'; // 'pengetahuan' | 'sikap'
let jumlahPH = 1;

// ============================================
// ✅ ENTRY POINT: window.renderPenilaian (match adm-kelas)
// ============================================
window.renderPenilaian = async function() {
  console.log('📦 [Penilaian] renderPenilaian() called');
  
  const container = document.getElementById('module-container');
  if (!container) {
    console.error('❌ [Penilaian] module-container not found');
    return;
  }
  
  // ✅ AUTH WAIT PATTERN: match adm-kelas.js EXACTLY
  let authUser = null;
  try {
    const { auth, onAuthStateChanged } = await import('../firebase-config.js');
    
    if (auth.currentUser) {
      authUser = auth.currentUser;
    } else {
      authUser = await new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          unsubscribe();
          resolve(user);
        });
        setTimeout(() => resolve(null), 3000); // 3s timeout match adm-kelas
      });
    }
  } catch (e) {
    console.warn('⚠️ [Penilaian] Auth not available');
  }
  
  // ✅ CRITICAL: Set userId BEFORE any storage call (match adm-kelas.js)
  storage.userId = authUser?.uid || null;
  console.log('🔧 [Penilaian] storage.userId:', storage.userId?.substring(0, 10) + '...');
  
  // ✅ Load classes from adm-kelas storage
  dbKelas = await storage.loadClasses();
  console.log('✅ [Penilaian] Classes loaded:', dbKelas.length);
  
  // ✅ Render UI template
  if (typeof window.getPenilaianTemplate !== 'function') {
    container.innerHTML = '<div class="p-8 text-rose-600 text-center">❌ Template not loaded</div>';
    return;
  }
  
  container.innerHTML = window.getPenilaianTemplate();
  container.classList.remove('hidden');
  
  // ✅ Hide dashboard sections (match adm-kelas.js)
  document.querySelectorAll('.dashboard-hero, [aria-labelledby="rooms-heading"], #sd-section, #smp-section, #sma-section')
    .forEach(el => el?.closest('section')?.classList.add('hidden'));
  
  // ✅ Initialize UI
  initDropdown();
  setupEventListeners();
  
  console.log('✅ [Penilaian] Module rendered successfully');
};

// ✅ Alias for compatibility
window.loadPenilaianModule = window.renderPenilaian;

// ============================================
// ✅ UI INITIALIZATION
// ============================================
function initDropdown() {
  const select = document.getElementById('selectKelasNilai');
  if (!select) return;
  
  select.innerHTML = '<option value="">-- Pilih Kelas --</option>';
  if (dbKelas.length === 0) {
    select.innerHTML += '<option disabled>📝 Belum ada kelas. Buat di Adm. Kelas dulu!</option>';
    return;
  }
  dbKelas.forEach((k) => {
    const siswaCount = k.siswa?.length || 0;
    select.innerHTML += `<option value="${k.id}">${k.nama} (${siswaCount} siswa)</option>`;
  });
}

function setupEventListeners() {
  // KKM input
  const kkmInput = document.getElementById('inputKKM');
  if (kkmInput) {
    kkmInput.addEventListener('input', () => updateSemuaWarna());
  }
}

// ============================================
// ✅ CORE FUNCTIONS (exposed to window for HTML onclick)
// ============================================

// ✅ SWITCH VIEW - exposed for HTML onclick
window.switchView = function(mode) {
  viewAktif = mode;
  // Update UI active state
  document.getElementById('btnPengetahuan')?.classList.toggle('bg-blue-600', mode === 'pengetahuan');
  document.getElementById('btnPengetahuan')?.classList.toggle('text-white', mode === 'pengetahuan');
  document.getElementById('btnSikap')?.classList.toggle('bg-rose-600', mode === 'sikap');
  document.getElementById('btnSikap')?.classList.toggle('text-white', mode === 'sikap');
  // Update title
  document.getElementById('mainTitle').innerText = mode === 'pengetahuan' ? 'Penilaian Pengetahuan' : 'Penilaian Sikap';
  document.getElementById('mainDesc').innerText = mode === 'pengetahuan' ? 'Input Nilai PH, STS, dan SAS' : 'Predikat Karakter & Catatan Deskripsi Siswa';
  // Show/hide controls
  document.getElementById('kontrolPengetahuan')?.classList.toggle('hidden', mode === 'sikap');
  // Re-render table if class selected
  if (indexAktif !== null) renderTabel();
};

// ✅ TAMBAH KOLOM PH - exposed for HTML onclick
window.tambahKolomPH = function() {
  if (indexAktif === null) return alert('Pilih kelas dulu!');
  jumlahPH++;
  renderTabel();
};

// ✅ INIT TABLE - exposed for HTML onchange
window.inisialisasiTabel = async function(classId) {
  if (!classId) {
    indexAktif = null;
    const body = document.getElementById('tabelNilaiBody');
    if (body) body.innerHTML = `<tr><td colspan="7" class="p-20 text-center text-slate-300">Pilih kelas untuk mengaktifkan tabel</td></tr>`;
    return;
  }
  
  // Re-load classes to ensure fresh data
  dbKelas = await storage.loadClasses();
  
  const classIndex = dbKelas.findIndex(k => k.id === classId);
  if (classIndex === -1) return alert('❌ Kelas tidak ditemukan!');
  
  indexAktif = classIndex;
  const kelas = dbKelas[classIndex];
  const namaKelas = kelas.nama;
  
  // Handle empty siswa
  if (!kelas.siswa || kelas.siswa.length === 0) {
    const body = document.getElementById('tabelNilaiBody');
    if (body) {
      body.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-slate-500">
        ⚠️ Belum ada siswa di kelas ini. 
        <br><button onclick="window.admKelas?.backToDashboard?.()" class="text-blue-600 underline mt-2">
        Tambah siswa di Adm. Kelas
        </button>
      </td></tr>`;
    }
    return;
  }
  
  // Load grades for this class
  dbNilaiFull[namaKelas] = await penilaianStorage.loadGrades(classId);
  jumlahPH = dbNilaiFull[namaKelas]?.meta?.jumlahPH || 1;
  
  renderTabel();
};

// ✅ CALCULATE NA - exposed for HTML oninput
window.hitungNA = function(sIdx) {
  const result = hitungNA(sIdx, jumlahPH, document);
  if (result.elNa) {
    result.elNa.innerText = result.na;
    const kkm = parseFloat(document.getElementById('inputKKM')?.value || 75);
    result.elNa.className = `px-6 py-3 text-center font-bold ${result.na < kkm ? 'text-rose-500' : 'text-emerald-600'}`;
  }
};

// ✅ UPDATE SEMUA WARNA - exposed for HTML oninput
window.updateSemuaWarna = function() {
  if (indexAktif !== null && viewAktif === 'pengetahuan') {
    // Re-render to apply new KKM colors
    renderTabel();
  }
};

// ✅ SAVE PERMANEN (bulk save) - exposed for HTML onclick
window.simpanPermanen = async function() {
  if (indexAktif === null) return alert('Pilih kelas dulu!');
  
  const classId = dbKelas[indexAktif].id;
  const namaKelas = dbKelas[indexAktif].nama;
  const siswa = dbKelas[indexAktif].siswa || [];
  const dataLama = dbNilaiFull[namaKelas]?.data || {};
  
  let payload = { meta: { jumlahPH },  {} };
  
  siswa.forEach((s, sIdx) => {
    const studentKey = s.id || s.nama || `siswa_${sIdx}`;
    const sLama = dataLama[studentKey] || {};
    
    if (viewAktif === 'pengetahuan') {
      let listPH = [];
      for (let i = 0; i < jumlahPH; i++) {
        const el = document.getElementById(`ph_${sIdx}_${i}`);
        listPH.push(el ? el.value : 0);
      }
      payload.data[studentKey] = {
        ...sLama,
        ph: listPH,
        sts: document.getElementById(`sts_${sIdx}`)?.value || 0,
        sas: document.getElementById(`sas_${sIdx}`)?.value || 0
      };
    } else {
      payload.data[studentKey] = {
        ...sLama,
        sikap: document.getElementById(`sikap_${sIdx}`)?.value || 'B',
        catatan: document.getElementById(`catatan_${sIdx}`)?.value || ''
      };
    }
  });
  
  try {
    await penilaianStorage.saveGrades(classId, payload);
    dbNilaiFull[namaKelas] = payload;
    showToast('✅ Data Berhasil Disimpan!', 'success');
  } catch (e) {
    console.error('❌ [Penilaian] simpanPermanen error:', e);
    showToast('❌ Gagal menyimpan: ' + e.message, 'error');
  }
};

// ============================================
// ✅ RENDER TABLE (core UI logic)
// ============================================
function renderTabel() {
  if (indexAktif === null) return;
  
  const head = document.getElementById('tabelHead');
  const body = document.getElementById('tabelNilaiBody');
  if (!head || !body) return;
  
  const kelas = dbKelas[indexAktif];
  const siswa = kelas.siswa || [];
  const namaKelas = kelas.nama;
  const savedData = dbNilaiFull[namaKelas]?.data || {};
  
  body.innerHTML = '';
  
  if (viewAktif === 'pengetahuan') {
    // Render pengetahuan view
    renderPengetahuanTable(head, body, siswa, savedData);
  } else {
    // Render sikap view
    renderSikapTable(head, body, siswa, savedData);
  }
}

function renderPengetahuanTable(head, body, siswa, savedData) {
  // Header
  let headPH = '';
  for (let i = 1; i <= jumlahPH; i++) {
    headPH += `<th class="px-4 py-2 text-center bg-blue-50/30 min-w-[80px]">PH ${i}</th>`;
  }
  head.innerHTML = `<tr>
    <th class="px-8 py-4 sticky-col min-w-[250px] bg-white">Identitas Siswa</th>
    ${headPH}
    <th class="px-6 py-4 text-center bg-amber-50/30 min-w-[100px]">STS</th>
    <th class="px-6 py-4 text-center bg-emerald-50/30 min-w-[100px]">SAS</th>
    <th class="px-6 py-4 text-center bg-slate-900 text-white">NA</th>
    <th class="px-4 py-4 text-center bg-slate-100 min-w-[120px]">Aksi</th>
  </tr>`;
  
  // Body rows
  siswa.forEach((s, sIdx) => {
    const studentKey = s.id || s.nama || `siswa_${sIdx}`;
    const sVal = savedData[studentKey] || { ph: [], sts: 0, sas: 0 };
    
    let rowPH = '';
    for (let i = 0; i < jumlahPH; i++) {
      const val = sVal.ph?.[i] ?? 0;
      rowPH += `<td class="px-2 py-2">
        <input type="number" id="ph_${sIdx}_${i}" value="${val}" 
          oninput="window.hitungNA(${sIdx})" 
          class="w-full bg-slate-50 border border-slate-200 p-2 rounded text-center">
      </td>`;
    }
    
    body.innerHTML += `<tr class="hover:bg-slate-50/50" data-student-id="${studentKey}">
      <td class="px-8 py-3 sticky-col font-medium text-slate-800 bg-white">${s.nama || 'Siswa ' + (sIdx+1)}</td>
      ${rowPH}
      <td class="px-4 py-3">
        <input type="number" id="sts_${sIdx}" value="${sVal.sts ?? 0}" 
          oninput="window.hitungNA(${sIdx})" 
          class="w-16 mx-auto block bg-white border border-amber-200 p-2 rounded text-center">
      </td>
      <td class="px-4 py-3">
        <input type="number" id="sas_${sIdx}" value="${sVal.sas ?? 0}" 
          oninput="window.hitungNA(${sIdx})" 
          class="w-16 mx-auto block bg-white border border-emerald-200 p-2 rounded text-center">
      </td>
      <td class="px-6 py-3 text-center font-bold" id="na_${sIdx}">0</td>
      <td class="px-4 py-3 text-center">
        <div class="flex items-center justify-center gap-1">
          <button onclick="window.aksiSimpanRow(${sIdx})" class="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition" title="Simpan">
            <i class="fas fa-save text-sm"></i>
          </button>
          <button onclick="window.aksiEditRow(${sIdx})" class="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition" title="Edit">
            <i class="fas fa-edit text-sm"></i>
          </button>
          <button onclick="window.aksiHapusRow(${sIdx})" class="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition" title="Hapus">
            <i class="fas fa-trash text-sm"></i>
          </button>
        </div>
      </td>
    </tr>`;
    
    // Auto-calc NA on render
    window.hitungNA(sIdx);
  });
}

function renderSikapTable(head, body, siswa, savedData) {
  // Header
  head.innerHTML = `<tr>
    <th class="px-8 py-4 sticky-col min-w-[250px] bg-white">Identitas Siswa</th>
    <th class="px-8 py-4 text-center bg-purple-50 text-purple-600 min-w-[150px]">Predikat</th>
    <th class="px-8 py-4 text-left bg-slate-50 min-w-[400px]">Catatan Deskripsi Sikap</th>
    <th class="px-4 py-4 text-center bg-slate-100 min-w-[120px]">Aksi</th>
  </tr>`;
  
  // Body rows
  siswa.forEach((s, sIdx) => {
    const studentKey = s.id || s.nama || `siswa_${sIdx}`;
    const sVal = savedData[studentKey] || { sikap: 'B', catatan: '' };
    
    body.innerHTML += `<tr class="hover:bg-slate-50/50" data-student-id="${studentKey}">
      <td class="px-8 py-4 sticky-col font-medium text-slate-800 bg-white">${s.nama || 'Siswa ' + (sIdx+1)}</td>
      <td class="px-8 py-4 text-center">
        <select id="sikap_${sIdx}" class="bg-white border-2 border-purple-200 px-3 py-2 rounded-lg font-medium text-purple-600">
          <option value="A" ${sVal.sikap === 'A' ? 'selected' : ''}>A (Sangat Baik)</option>
          <option value="B" ${sVal.sikap === 'B' ? 'selected' : ''}>B (Baik)</option>
          <option value="C" ${sVal.sikap === 'C' ? 'selected' : ''}>C (Cukup)</option>
          <option value="D" ${sVal.sikap === 'D' ? 'selected' : ''}>D (Kurang)</option>
        </select>
      </td>
      <td class="px-8 py-4">
        <textarea id="catatan_${sIdx}" placeholder="Catatan sikap..." 
          class="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg text-sm outline-none focus:ring-2 ring-purple-300 resize-none" 
          rows="2">${sVal.catatan || ''}</textarea>
      </td>
      <td class="px-4 py-4 text-center">
        <div class="flex items-center justify-center gap-1">
          <button onclick="window.aksiSimpanSikapRow(${sIdx})" class="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition" title="Simpan">
            <i class="fas fa-save text-sm"></i>
          </button>
          <button onclick="window.aksiEditSikapRow(${sIdx})" class="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition" title="Edit">
            <i class="fas fa-edit text-sm"></i>
          </button>
          <button onclick="window.aksiHapusRow(${sIdx})" class="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition" title="Hapus">
            <i class="fas fa-trash text-sm"></i>
          </button>
        </div>
      </td>
    </tr>`;
  });
}

// ============================================
// ✅ ACTION FUNCTIONS (exposed to window for HTML onclick)
// ============================================

// 💾 Simpan satu row (Pengetahuan)
window.aksiSimpanRow = async function(sIdx) {
  if (indexAktif === null) return;
  
  const classId = dbKelas[indexAktif].id;
  const namaKelas = dbKelas[indexAktif].nama;
  const siswa = dbKelas[indexAktif].siswa[sIdx];
  const studentKey = siswa.id || siswa.nama || `siswa_${sIdx}`;
  
  // Get current values
  let listPH = [];
  for (let i = 0; i < jumlahPH; i++) {
    const el = document.getElementById(`ph_${sIdx}_${i}`);
    listPH.push(el ? el.value : 0);
  }
  const sts = document.getElementById(`sts_${sIdx}`)?.value || 0;
  const sas = document.getElementById(`sas_${sIdx}`)?.value || 0;
  
  try {
    // Load existing, merge, save
    const existing = await penilaianStorage.loadGrades(classId);
    if (!existing.data) existing.data = {};
    existing.data[studentKey] = { ...(existing.data[studentKey] || {}), ph: listPH, sts, sas };
    
    await penilaianStorage.saveGrades(classId, existing);
    
    // Update local cache
    if (!dbNilaiFull[namaKelas]) dbNilaiFull[namaKelas] = { meta: { jumlahPH },  {} };
    dbNilaiFull[namaKelas].data[studentKey] = { ph: listPH, sts, sas };
    
    showToast(`✅ Nilai ${siswa.nama} disimpan!`, 'success');
  } catch (e) {
    console.error('❌ [Penilaian] aksiSimpanRow error:', e);
    showToast('❌ Gagal simpan: ' + e.message, 'error');
  }
};

// ✏️ Edit mode (Pengetahuan)
window.aksiEditRow = function(sIdx) {
  // Highlight inputs for edit mode
  for (let i = 0; i < jumlahPH; i++) {
    const el = document.getElementById(`ph_${sIdx}_${i}`);
    if (el) {
      el.classList.add('bg-yellow-50', 'border-blue-400', 'ring-2', 'ring-blue-200');
      el.focus();
    }
  }
  const stsEl = document.getElementById(`sts_${sIdx}`);
  const sasEl = document.getElementById(`sas_${sIdx}`);
  if (stsEl) { stsEl.classList.add('bg-yellow-50', 'border-blue-400'); stsEl.focus(); }
  if (sasEl) { sasEl.classList.add('bg-yellow-50', 'border-blue-400'); sasEl.focus(); }
  
  showToast('✏️ Edit mode aktif. Ubah nilai lalu klik 💾', 'info');
};

// 💾 Simpan satu row (Sikap)
window.aksiSimpanSikapRow = async function(sIdx) {
  if (indexAktif === null) return;
  
  const classId = dbKelas[indexAktif].id;
  const namaKelas = dbKelas[indexAktif].nama;
  const siswa = dbKelas[indexAktif].siswa[sIdx];
  const studentKey = siswa.id || siswa.nama || `siswa_${sIdx}`;
  
  const sikap = document.getElementById(`sikap_${sIdx}`)?.value || 'B';
  const catatan = document.getElementById(`catatan_${sIdx}`)?.value || '';
  
  try {
    const existing = await penilaianStorage.loadGrades(classId);
    if (!existing.data) existing.data = {};
    existing.data[studentKey] = { ...(existing.data[studentKey] || {}), sikap, catatan };
    
    await penilaianStorage.saveGrades(classId, existing);
    
    if (!dbNilaiFull[namaKelas]) dbNilaiFull[namaKelas] = { meta: { jumlahPH },  {} };
    dbNilaiFull[namaKelas].data[studentKey] = { ...(dbNilaiFull[namaKelas].data[studentKey] || {}), sikap, catatan };
    
    showToast(`✅ Sikap ${siswa.nama} disimpan!`, 'success');
  } catch (e) {
    console.error('❌ [Penilaian] aksiSimpanSikapRow error:', e);
    showToast('❌ Gagal simpan: ' + e.message, 'error');
  }
};

// ✏️ Edit mode (Sikap)
window.aksiEditSikapRow = function(sIdx) {
  const sikapEl = document.getElementById(`sikap_${sIdx}`);
  const catatanEl = document.getElementById(`catatan_${sIdx}`);
  
  if (sikapEl) { sikapEl.classList.add('bg-yellow-50', 'border-blue-400'); sikapEl.focus(); }
  if (catatanEl) { 
    catatanEl.classList.add('bg-yellow-50', 'border-blue-400'); 
    catatanEl.style.minHeight = '80px';
    catatanEl.focus(); 
  }
  
  showToast('✏️ Edit mode aktif. Ubah lalu klik 💾', 'info');
};

// 🗑️ Hapus data satu row (both views)
window.aksiHapusRow = async function(sIdx) {
  if (indexAktif === null) return;
  
  const siswa = dbKelas[indexAktif].siswa[sIdx];
  const studentKey = siswa.id || siswa.nama || `siswa_${sIdx}`;
  
  if (!confirm(`Hapus data nilai untuk ${siswa.nama}?`)) return;
  
  const classId = dbKelas[indexAktif].id;
  const namaKelas = dbKelas[indexAktif].nama;
  
  try {
    const existing = await penilaianStorage.loadGrades(classId);
    if (existing.data?.[studentKey]) {
      delete existing.data[studentKey];
    }
    await penilaianStorage.saveGrades(classId, existing);
    
    if (dbNilaiFull[namaKelas]?.data?.[studentKey]) {
      delete dbNilaiFull[namaKelas].data[studentKey];
    }
    
    // Clear UI inputs
    for (let i = 0; i < jumlahPH; i++) {
      const el = document.getElementById(`ph_${sIdx}_${i}`);
      if (el) el.value = '';
    }
    const stsEl = document.getElementById(`sts_${sIdx}`);
    const sasEl = document.getElementById(`sas_${sIdx}`);
    if (stsEl) stsEl.value = '';
    if (sasEl) sasEl.value = '';
    const naEl = document.getElementById(`na_${sIdx}`);
    if (naEl) naEl.innerText = '0';
    
    const sikapEl = document.getElementById(`sikap_${sIdx}`);
    const catatanEl = document.getElementById(`catatan_${sIdx}`);
    if (sikapEl) sikapEl.value = 'B';
    if (catatanEl) catatanEl.value = '';
    
    showToast(`🗑️ Data ${siswa.nama} dihapus!`, 'success');
  } catch (e) {
    console.error('❌ [Penilaian] aksiHapusRow error:', e);
    showToast('❌ Gagal hapus: ' + e.message, 'error');
  }
};

console.log('🟢 [Penilaian] Module LOADED - Fresh Design');
