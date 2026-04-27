/**
 * ============================================
 * MODULE: CTA GENERATOR (MAIN)
 * Folder: modules/cta-generator/cta-generator.js
 * Platform Administrasi Kelas Digital
 * ============================================
 * FUNGSI:
 * - Render UI form CP/TP/ATP generator
 * - Filter dropdown kelas/mapel sesuai skema akses user
 * - Integrasi Groq API (pakai key dari Firestore)
 * - Validasi input sebelum generate
 * - Tampilkan hasil dalam format tabel + download
 * ============================================
 */

console.log('🔴 [CTA Generator] Script START');

// ✅ IMPORTS
import { generateWithGroq, getGroqApiKey } from '../groq-api.js';
import { validateInput, validateInputWithFilter, isMapelAllowedForUser, formatMapelName, getFase, formatSemester } from './cta-templates.js';
import { getCP, getTP, getATP, processContent } from './cta-loader.js';
import { db, auth, collection, addDoc, query, where, orderBy, onSnapshot, doc, getDoc, serverTimestamp } from '../firebase-config.js';

console.log('✅ [CTA Generator] All imports successful');

// ============================================
// ✅ GLOBAL STATE
// ============================================
let userRole = 'teacher';
let userKelasDiampu = [];
let userMapelDiampu = [];
let userSdMapelType = 'kelas';
let userJenjangSekolah = '';
let _aiReadyCache = null;
let _mapelCache = {};

// ============================================
// ✅ HELPER: FETCH MAPEL DATA FROM JSON
// ============================================
async function fetchMapelData(jenjang) {
  if (!jenjang) return [];
  if (_mapelCache[jenjang]) return _mapelCache[jenjang];
  
  try {
    const response = await fetch(`./data/mapel/${jenjang}.json`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('Invalid JSON structure');
    _mapelCache[jenjang] = data;
    return data;
  } catch (error) {
    console.warn(`⚠️ [Mapel] Failed to fetch ${jenjang}.json:`, error.message);
    // Fallback list
    const fallback = [
      { nama: 'Matematika', jenjang }, { nama: 'Bahasa Indonesia', jenjang },
      { nama: 'IPA', jenjang }, { nama: 'IPS', jenjang }, { nama: 'IPAS', jenjang },
      { nama: 'PJOK', jenjang }, { nama: 'PAIBD', jenjang },
      { nama: 'Seni Budaya', jenjang }, { nama: 'Bahasa Inggris', jenjang },
      { nama: 'PKn', jenjang }, { nama: 'Prakarya', jenjang }, { nama: 'Lainnya', jenjang }
    ];
    _mapelCache[jenjang] = fallback;
    return fallback;
  }
}

// ============================================
// ✅ POPULATE MAPEL DROPDOWN (WITH FILTERING)
// ============================================
async function populateMapelDropdown(jenjang, userMapelFromReg = null, userData = null) {
  const mapelSelect = document.getElementById('cta-mapel');
  if (!mapelSelect || !jenjang) return;
  
  const originalValue = mapelSelect.value;
  mapelSelect.innerHTML = '<option value="">Memuat daftar mapel...</option>';
  mapelSelect.disabled = true;
  
  try {
    const mapelList = await fetchMapelData(jenjang);
    mapelSelect.innerHTML = '<option value="">Pilih Mata Pelajaran</option>';
    
    // Determine filter rule based on skema
    const getFilterRule = () => {
      if (!userData) return { type: 'none' };
      let { jenjang_sekolah, sd_mapel_type, mapel_yang_diampu, role } = userData;
      
      // Fallback to localStorage
      if (!jenjang_sekolah) jenjang_sekolah = localStorage.getItem('user_jenjang') || jenjang_sekolah;
      if (!sd_mapel_type) sd_mapel_type = localStorage.getItem('user_sd_mapel_type') || sd_mapel_type;
      if (!mapel_yang_diampu) {
        try { mapel_yang_diampu = JSON.parse(localStorage.getItem('user_mapel_yang_diampu') || '[]'); } 
        catch(e) { mapel_yang_diampu = []; }
      }
      if (!role) role = localStorage.getItem('user_role') || 'teacher';

      if (role === 'admin') return { type: 'none' };
      if (jenjang_sekolah === 'tk') return { type: 'none' };

      // SD/MI Guru Kelas: exclude PAIBD/PJOK
      if (['sd', 'mi'].includes(jenjang_sekolah) && sd_mapel_type?.toLowerCase() === 'kelas') {
        return { type: 'exclude', values: ['paibd', 'pjok', 'pendidikan agama', 'pendidikan jasmani'] };
      }

      // SD/MI Guru Mapel: only their subject
      let targetMapel = '';
      if (sd_mapel_type && sd_mapel_type.toLowerCase() !== 'kelas') {
        targetMapel = sd_mapel_type.toLowerCase();
      } else if (mapel_yang_diampu && mapel_yang_diampu.length > 0) {
        targetMapel = mapel_yang_diampu[0].toLowerCase();
      }
      if (['sd', 'mi'].includes(jenjang_sekolah) && targetMapel) {
        return { type: 'include', values: [targetMapel] };
      }

      // SMP/MTs/SMA/MA: only assigned mapel
      if (['smp', 'mts', 'sma', 'ma'].includes(jenjang_sekolah) && mapel_yang_diampu?.length > 0) {
        return { type: 'include', values: mapel_yang_diampu.map(m => (m || '').toLowerCase()) };
      }

      return { type: 'none' };
    };
    
    const filterRule = getFilterRule();
    
    // Populate options with filtering
    mapelList.forEach(item => {
      const namaLower = (item.nama || '').toLowerCase();
      if (filterRule.type === 'exclude' && filterRule.values.some(v => namaLower.includes(v))) return;
      if (filterRule.type === 'include' && !filterRule.values.some(v => namaLower.includes(v) || v.includes(namaLower))) return;
      
      const opt = document.createElement('option');
      opt.value = item.nama;
      opt.textContent = item.nama;
      mapelSelect.appendChild(opt);
    });
    
    // Auto-lock if registered mapel matches
    if (userMapelFromReg) {
      const match = Array.from(mapelSelect.options).find(opt => 
        (opt.value || '').toLowerCase().includes(userMapelFromReg.toLowerCase()) || 
        (opt.textContent || '').toLowerCase().includes(userMapelFromReg.toLowerCase())
      );
      if (match) {
        mapelSelect.value = match.value;
        mapelSelect.disabled = true;
        const lockBadge = document.createElement('span');
        lockBadge.className = 'lock-indicator';
        lockBadge.innerHTML = `<i class="fas fa-lock text-emerald-600"></i> <strong>${userMapelFromReg}</strong> - Terkunci`;
        lockBadge.style.cssText = 'display:block;margin-top:6px;font-size:12px;color:#059669';
        const existingBadge = mapelSelect.parentNode.querySelector('.lock-indicator');
        if (existingBadge) existingBadge.remove();
        mapelSelect.parentNode.appendChild(lockBadge);
      } else {
        mapelSelect.disabled = false;
      }
    } else {
      if (originalValue && Array.from(mapelSelect.options).some(opt => opt.value === originalValue)) {
        mapelSelect.value = originalValue;
      }
      mapelSelect.disabled = false;
    }    
  } catch (error) {
    console.error('❌ [Mapel] Populate error:', error);
    mapelSelect.innerHTML = '<option value="">Gagal memuat mapel</option>';
    mapelSelect.disabled = false;
  }
}

// ============================================
// ✅ FILTER KELAS DROPDOWN
// ============================================
function filterKelasDropdown(userData) {
  if (!userData) return;
  const { jenjang_sekolah, kelas_diampu, sd_mapel_type, role } = userData;
  
  const kelasSelect = document.getElementById('cta-kelas');
  if (!kelasSelect) return;
  
  if (role === 'admin') {
    // Admin: all enabled
    Array.from(kelasSelect.options).forEach(opt => { opt.disabled = false; opt.style.display = ''; });
  } else if (jenjang_sekolah === 'tk') {
    // TK: only A/B
    Array.from(kelasSelect.options).forEach(opt => {
      const allowed = ['A', 'B'].includes(opt.value);
      opt.disabled = !allowed;
      opt.style.display = allowed ? '' : 'none';
    });
  } else if (['sd', 'mi'].includes(jenjang_sekolah) && sd_mapel_type?.toLowerCase() === 'kelas') {
    // SD/MI Guru Kelas: only assigned classes
    Array.from(kelasSelect.options).forEach(opt => {
      const allowed = !opt.value || kelas_diampu?.includes(opt.value);
      opt.disabled = !allowed;
      opt.style.display = allowed ? '' : 'none';
    });
  } else {
    // Others: all classes in jenjang
    const allClasses = jenjang_sekolah === 'sd' || jenjang_sekolah === 'mi' ? ['1','2','3','4','5','6'] :
                       jenjang_sekolah === 'smp' || jenjang_sekolah === 'mts' ? ['7','8','9'] : ['10','11','12'];
    Array.from(kelasSelect.options).forEach(opt => {
      const allowed = !opt.value || allClasses.includes(opt.value);
      opt.disabled = !allowed;
      opt.style.display = allowed ? '' : 'none';
    });
  }
}

// ============================================
// ✅ SETUP JENJANG DROPDOWN (LOCKED)
// ============================================
function setupJenjangDropdown(userData) {
  if (!userData) return;
  const userJenjang = userData.jenjang_sekolah;
  if (!userJenjang) return;
  
  setTimeout(() => {
    const jenjangSelect = document.getElementById('cta-jenjang');
    if (!jenjangSelect) return;
    jenjangSelect.value = userJenjang;
    jenjangSelect.disabled = true;
    jenjangSelect.title = `Terkunci: ${userJenjang.toUpperCase()}`;
  }, 100);
}

// ============================================
// ✅ AI READINESS CHECK
// ============================================
export async function isAiReady() {
  if (_aiReadyCache !== null) return _aiReadyCache;
  try {
    const globalKey = await getGroqApiKey();
    if (globalKey) { _aiReadyCache = true; return true; }
    const localKey = localStorage.getItem('groq_api_key');
    if (localKey && localKey.startsWith('gsk_') && localKey.length >= 20) { _aiReadyCache = true; return true; }
    _aiReadyCache = false; return false;
  } catch (error) { _aiReadyCache = false; return false; }
}

// ============================================
// ✅ MAIN RENDER FUNCTION
// ============================================
export async function renderCitaGenerator(jenjangFromParam, kelasFromParam, semesterFromParam) {
  console.log('📝 [CTA Generator] renderCitaGenerator() called');
  
  const container = document.getElementById('cita-container');
  if (!container) {
    console.error('❌ Container #cita-container not found!');
    return;
  }
  
  const user = auth.currentUser;
  if (!user) { alert('⚠️ Silakan login dulu!'); return; }
  
  // Load user data
  let userData = null;
  try {
    const userProfile = await getDoc(doc(db, 'users', user.uid));
    if (userProfile.exists()) {
      userData = userProfile.data();
      userRole = userData.role || 'teacher';
      userKelasDiampu = userData.kelas_diampu || [];
      userMapelDiampu = userData.mapel_yang_diampu || [];
      userSdMapelType = userData.sd_mapel_type || 'kelas';
      userJenjangSekolah = userData.jenjang_sekolah || '';
    }
  } catch (e) { console.error('❌ [CTA Generator] Failed to load user', e); }
  
  const aiReady = await isAiReady();
  const userNama = localStorage.getItem('user_nama_lengkap') || '';
  const userSekolah = localStorage.getItem('user_nama_sekolah') || '';
  const userMapelFromReg = localStorage.getItem('user_mapel') || null;
  
  // Determine available classes
  const allClasses = ['1','2','3','4','5','6','7','8','9','10','11','12'];
  let availableClasses = allClasses;
  let isClassLocked = false;
  
  if (userRole === 'admin') { availableClasses = allClasses; } 
  else if (userJenjangSekolah === 'tk') { availableClasses = ['A', 'B']; isClassLocked = true; } 
  else if (['sd', 'mi'].includes(userJenjangSekolah) && userSdMapelType?.toLowerCase() === 'kelas') { availableClasses = userKelasDiampu.length ? userKelasDiampu : allClasses; isClassLocked = true; } 
  else { availableClasses = userJenjangSekolah === 'sd' || userJenjangSekolah === 'mi' ? ['1','2','3','4','5','6'] : userJenjangSekolah === 'smp' || userJenjangSekolah === 'mts' ? ['7','8','9'] : ['10','11','12']; }
  
  let defaultClass = kelasFromParam || '';
  if (isClassLocked && availableClasses.length > 0) defaultClass = availableClasses[0];
  
  // Render UI
  container.innerHTML = `
    <style>
      .cta-generator-form { max-width: 950px; margin: auto; padding: 30px; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
      .cta-generator-form h2 { text-align: center; color: #0891b2; margin-bottom: 10px; font-size: 28px; }
      .subtitle { text-align: center; color: #6b7280; margin-bottom: 30px; }
      .section-title { font-size: 18px; font-weight: 700; color: #374151; margin: 25px 0 15px 0; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb; display: flex; align-items: center; gap: 8px; }
      .cta-generator-form label { display: block; margin-top: 12px; font-weight: 600; color: #374151; font-size: 14px; }
      .cta-generator-form input, .cta-generator-form select { width: 100%; margin-top: 8px; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 14px; font-family: inherit; box-sizing: border-box; }
      .cta-generator-form select:disabled { background: #f3f4f6; color: #6b7280; cursor: not-allowed; }
      .cta-result-table { width: 100%; border-collapse: collapse; margin-top: 16px; background: white; }
      .cta-result-table th { background: #0891b2; color: white; padding: 12px 16px; text-align: left; font-weight: 600; }
      .cta-result-table td { padding: 16px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
      .cta-result-table .label-col { width: 180px; background: #f8fafc; font-weight: 600; color: #374151; }
      .cta-result-table .content-col { white-space: pre-wrap; line-height: 1.6; color: #1f2937; }
      .btn-generate, .btn-save, .btn-secondary, .btn-print, .btn-download { margin-top: 20px; padding: 14px 30px; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600; width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; }
      .btn-generate { background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); color: white; }
      .btn-generate:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(8,145,178,0.3); }
      .btn-save { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; }
      .btn-save:hover { background: linear-gradient(135deg, #059669 0%, #047857 100%); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(16,185,129,0.3); }
      .btn-print { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; }
      .btn-print:hover { background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(99,102,241,0.3); }
      .btn-download { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; }
      .btn-download:hover { background: linear-gradient(135deg, #d97706 0%, #b45309 100%); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(245,158,11,0.3); }
      .btn-secondary { background: #6b7280; color: white; margin-top: 10px; }
      .btn-secondary:hover { background: #4b5563; transform: translateY(-2px); }
      .btn-back { margin-top: 20px; padding: 12px 30px; background: #6b7280; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; width: auto; }
      .hidden { display: none !important; }
      .auto-filled { background: #f0fdf4; border-color: #10b981 !important; }
      .grid-cols-2, .grid-cols-3 { display: grid; gap: 16px; }
      .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
      .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
      @media (max-width: 768px) { .grid-cols-2, .grid-cols-3 { grid-template-columns: 1fr; } }
      .cta-item { background: white; padding: 20px; margin-top: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
      .status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600; margin-left: 8px; }
      .status-ready { background: #dcfce7; color: #166534; }
      .status-warning { background: #fef3c7; color: #92400e; }
      .result-section { margin-top: 30px; }
      .lock-indicator { font-size: 11px; color: #6b7280; margin-top: 4px; display: flex; align-items: center; gap: 4px; }
      @media print {
        .cta-generator-form h2, .subtitle, .section-title, .cta-generator-form label, .btn-generate, .btn-save, .btn-secondary, .btn-print, .btn-download, .btn-back, #cta-form, .mt-12 { display: none !important; }
        #cta-result { display: block !important; }
        .cta-result-table { border: 1px solid #000; }
        body { background: white; }
      }
    </style>
    <div class="cta-generator-form">
      <h2>📄 Generator CP/TP/ATP</h2>
      <p class="subtitle">Buat Perangkat Pembelajaran dengan AI ${aiReady ? '<span class="status-badge status-ready">✅ AI Siap</span>' : '<span class="status-badge status-warning">⚠️ Setup Diperlukan</span>'}</p>
      <button class="btn-back" onclick="window.backToDashboard()"><i class="fas fa-arrow-left mr-2"></i>Kembali ke Dashboard</button>
      <form id="cta-form">
        <div class="section-title"><i class="fas fa-university"></i><span>1. Informasi Sekolah</span></div>
        <div><label for="kop-sekolah"><i class="fas fa-school mr-2"></i>Nama Sekolah</label><input type="text" id="kop-sekolah" placeholder="Masukkan nama sekolah" value="${userSekolah}" class="${userSekolah ? 'auto-filled' : ''}" required></div>
        <div class="grid-cols-2">
          <div><label for="kop-tahun"><i class="fas fa-calendar mr-2"></i>Tahun Ajaran</label><input type="text" id="kop-tahun" placeholder="2025/2026" value="2025/2026"></div>
          <div><label for="cta-guru"><i class="fas fa-chalkboard-teacher mr-2"></i>Nama Guru</label><input type="text" id="cta-guru" placeholder="Opsional" value="${userNama}" class="${userNama ? 'auto-filled' : ''}"></div>
        </div>
        <div class="section-title"><i class="fas fa-book-open"></i><span>2. Informasi Pembelajaran</span></div>
        <div class="grid-cols-3">
          <div><label for="cta-jenjang"><i class="fas fa-school mr-2"></i>Jenjang</label><select id="cta-jenjang" required><option value="">Pilih</option><option value="tk">TK</option><option value="sd">SD</option><option value="mi">MI</option><option value="smp">SMP</option><option value="mts">MTs</option><option value="sma">SMA</option><option value="ma">MA</option></select></div>
          <div><label for="cta-kelas"><i class="fas fa-users mr-2"></i>Kelas</label><select id="cta-kelas" required ${isClassLocked && userRole !== 'admin' ? 'disabled' : ''}><option value="">Pilih</option>${availableClasses.map(k => `<option value="${k}" ${k === defaultClass ? 'selected' : ''}>${k}</option>`).join('')}</select></div>
          <div><label for="cta-semester"><i class="fas fa-clock mr-2"></i>Semester</label><select id="cta-semester" required><option value="">Pilih</option><option value="1">1 (Ganjil)</option><option value="2">2 (Genap)</option></select></div>
        </div>
        <div class="grid-cols-2">
          <div><label for="cta-mapel"><i class="fas fa-book mr-2"></i>Mata Pelajaran</label><select id="cta-mapel" required><option value="">Memuat daftar mapel...</option></select></div>
          <div><label for="cta-topik"><i class="fas fa-tag mr-2"></i>Topik/Materi</label><input type="text" id="cta-topik" placeholder="Contoh: Bilangan 1-20" required></div>
        </div>
        <button type="button" id="btn-generate" class="btn-generate"><i class="fas fa-magic"></i> Generate dengan AI</button>
      </form>
      <div id="cta-result" class="hidden result-section">
        <h3 class="text-xl font-bold mb-4 text-gray-800">📋 Hasil Generate</h3>
        <table class="cta-result-table">
          <thead><tr><th class="label-col">Komponen</th><th class="content-col">Konten</th></tr></thead>
          <tbody>
            <tr><td class="label-col">🎯 Capaian Pembelajaran (CP)</td><td class="content-col" id="result-cp">CP akan muncul setelah generate...</td></tr>
            <tr><td class="label-col">🏁 Tujuan Pembelajaran (TP)</td><td class="content-col" id="result-tp">TP akan muncul setelah generate...</td></tr>
            <tr><td class="label-col">📊 Alur Tujuan Pembelajaran (ATP)</td><td class="content-col" id="result-atp">ATP akan muncul setelah generate...</td></tr>
          </tbody>
        </table>
        <div style="display: flex; gap: 12px; margin-top: 16px;">
          <button type="button" id="btn-print" class="btn-print" style="flex: 1;"><i class="fas fa-print"></i> Print</button>
          <button type="button" id="btn-download" class="btn-download" style="flex: 1;"><i class="fas fa-download"></i> Download</button>
          <button type="button" id="btn-save" class="btn-save" style="flex: 1;"><i class="fas fa-save"></i> Simpan</button>
          <button type="button" id="btn-regenerate" class="btn-secondary" style="flex: 1;"><i class="fas fa-redo"></i> Ulang</button>
        </div>
      </div>
      <div class="mt-12"><h3 class="text-xl font-bold mb-4 text-gray-800"><i class="fas fa-archive mr-2"></i>Dokumen Tersimpan (<span id="saved-count">0</span>)</h3><div id="cta-list" class="space-y-4"><div class="loading-spinner"><i class="fas fa-spinner fa-spin text-2xl mb-3"></i><p>Memuat...</p></div></div></div>
    </div>`;
  
  // Apply filters
  setupJenjangDropdown(userData);
  filterKelasDropdown(userData);
  
  // Populate mapel dropdown
  const jenjangSelect = document.getElementById('cta-jenjang');
  if (jenjangSelect) {
    const initialJenjang = jenjangFromParam || userJenjangSekolah;
    if (initialJenjang) {
      jenjangSelect.value = initialJenjang;
      await populateMapelDropdown(initialJenjang, userMapelFromReg, userData);
    }
    jenjangSelect.addEventListener('change', async function() {
      const newJenjang = this.value;
      if (newJenjang) await populateMapelDropdown(newJenjang, userMapelFromReg, userData);
    });
  }
  
  // Event listeners
  const btnGenerate = document.getElementById('btn-generate');
  if (btnGenerate) btnGenerate.addEventListener('click', handleGenerate);
  
  const btnPrint = document.getElementById('btn-print');
  if (btnPrint) btnPrint.addEventListener('click', () => { 
    const cp = document.getElementById('result-cp')?.textContent || ''; 
    if (!cp || cp.includes('⏳') || cp.includes('Error')) { alert('⚠️ Generate data dulu sebelum print!'); return; } 
    window.print(); 
  });
  
  const btnDownload = document.getElementById('btn-download');
  if (btnDownload) btnDownload.addEventListener('click', downloadCTAResult);
  
  const btnSave = document.getElementById('btn-save');
  if (btnSave) btnSave.addEventListener('click', handleSave);
  
  const btnRegenerate = document.getElementById('btn-regenerate');
  if (btnRegenerate) btnRegenerate.addEventListener('click', handleGenerate);
  
  // Hide main sections, show container
  hideDashboardSections(); 
  container.classList.remove('hidden'); 
  loadCTAData(); 
  
  console.log('✅ [CTA Generator] UI rendered to #cita-container');
}

// ============================================
// ✅ HANDLE GENERATE
// ============================================
async function handleGenerate() {
  const user = auth.currentUser; if (!user) { alert('⚠️ Silakan login dulu!'); return; }
  
  const jenjang = document.getElementById('cta-jenjang')?.value;
  const kelas = document.getElementById('cta-kelas')?.value;
  const semester = document.getElementById('cta-semester')?.value;
  const mapel = document.getElementById('cta-mapel')?.value;
  const sekolah = document.getElementById('kop-sekolah')?.value;
  const tahun = document.getElementById('kop-tahun')?.value;
  const guru = document.getElementById('cta-guru')?.value;
  const topik = document.getElementById('cta-topik')?.value;
  
  // Validate with skema-compliant function
  if (userRole !== 'admin') {
    const validation = validateInputWithFilter({ sekolah, jenjang, kelas, semester, mapel, topik }, { 
      jenjang_sekolah: userJenjangSekolah, kelas_diampu: userKelasDiampu, mapel_yang_diampu: userMapelDiampu, sd_mapel_type: userSdMapelType, role: userRole 
    });
    if (!validation.valid) { alert('⚠️ ' + validation.errors.join('\n')); return; }
  }
  
  // Check AI readiness
  const aiReady = await isAiReady(); if (!aiReady) { alert('⚠️ AI belum aktif. Hubungi admin.'); return; }
  
  // Show loading
  const resultDiv = document.getElementById('cta-result'); if (resultDiv) resultDiv.classList.remove('hidden');
  document.getElementById('result-cp').textContent = `⏳ Generating CP...`; 
  document.getElementById('result-tp').textContent = `⏳ Generating TP...`; 
  document.getElementById('result-atp').textContent = `⏳ Generating ATP...`; 
  
  try {
    // Call Groq API
    const result = await generateWithGroq({ sekolah, jenjang, kelas, semester, mapel, guru, topik, tahun });
    
    // Display results
    document.getElementById('result-cp').textContent = result.cp; 
    document.getElementById('result-tp').textContent = result.tp; 
    document.getElementById('result-atp').textContent = result.atp;
    
    console.log('✅ [CTA Generator] Generation complete!');
    showAlert('✅ Berhasil generate!', 'success');
    
    // Auto-save to Firestore
    await autoSaveCTA(result, { sekolah, jenjang, kelas, semester, mapel, guru, topik, tahun });
    
  } catch (error) {
    console.error('❌ [CTA Generator] Error:', error);
    document.getElementById('result-cp').textContent = `❌ Error: ${error.message}`; 
    alert('❌ Gagal generate:\n\n' + error.message);
  }
}

// ============================================
// ✅ DOWNLOAD FUNCTION
// ============================================
function downloadCTAResult() {
  const cp = document.getElementById('result-cp')?.textContent || '';
  if (!cp || cp.includes('⏳') || cp.includes('Error')) { alert('⚠️ Generate data dulu sebelum download!'); return; }
  
  const jenjang = document.getElementById('cta-jenjang')?.value || '';
  const kelas = document.getElementById('cta-kelas')?.value || '';
  const semester = document.getElementById('cta-semester')?.value || '';
  const mapel = document.getElementById('cta-mapel')?.value || '';
  const topik = document.getElementById('cta-topik')?.value || '';
  const sekolah = document.getElementById('kop-sekolah')?.value || '';
  const guru = document.getElementById('cta-guru')?.value || '';
  const tahun = document.getElementById('kop-tahun')?.value || '';
  const labelJenjang = {tk:'TK', sd:'SD', mi:'MI', smp:'SMP', mts:'MTs', sma:'SMA', ma:'MA'}[jenjang] || jenjang.toUpperCase();
  const labelSemester = semester === '1' ? 'Ganjil' : 'Genap';
  
  let content = `═══════════════════════════════════════════════════════════\n`;
  content += `              CAPAIAN PEMBELAJARAN (CP/TP/ATP)\n                  KURIKULUM MERDEKA\n═══════════════════════════════════════════════════════════\n\n`;
  content += `INFORMASI DOKUMEN\n───────────────────────────────────────────────────────────\n`;
  content += `Nama Sekolah  : ${sekolah}\nTahun Ajaran  : ${tahun}\nJenjang       : ${labelJenjang}\nKelas         : ${kelas}\nSemester      : ${labelSemester}\nMata Pelajaran: ${mapel}\nGuru Pengampu : ${guru}\nTopik/Materi  : ${topik}\n\n`;
  content += `═══════════════════════════════════════════════════════════\n                    CAPAIAN PEMBELAJARAN (CP)\n═══════════════════════════════════════════════════════════\n\n${document.getElementById('result-cp')?.textContent || ''}\n\n`;
  content += `═══════════════════════════════════════════════════════════\n                    TUJUAN PEMBELAJARAN (TP)\n═══════════════════════════════════════════════════════════\n\n${document.getElementById('result-tp')?.textContent || ''}\n\n`;
  content += `═══════════════════════════════════════════════════════════\n              ALUR TUJUAN PEMBELAJARAN (ATP)\n═══════════════════════════════════════════════════════════\n\n${document.getElementById('result-atp')?.textContent || ''}\n\n`;
  content += `═══════════════════════════════════════════════════════════\n`;
  
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `CP-TP-ATP_${labelJenjang}_Kelas${kelas}_${mapel}_${topik.replace(/\s+/g, '_')}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================
// ✅ SAVE TO FIRESTORE
// ============================================
async function handleSave() {
  const user = auth.currentUser; if (!user) return;
  const cp = document.getElementById('result-cp')?.textContent || '';
  if (!cp || cp.includes('⏳') || cp.includes('Error')) { alert('⚠️ Generate data dulu!'); return; }
  
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    await addDoc(collection(db, 'cp_tp_atp'), { 
      userId: user.uid, userEmail: user.email, userName: user.displayName || 'Guru', 
      sekolah: document.getElementById('kop-sekolah')?.value, tahun: document.getElementById('kop-tahun')?.value, 
      jenjang: document.getElementById('cta-jenjang')?.value, kelas: document.getElementById('cta-kelas')?.value, 
      semester: document.getElementById('cta-semester')?.value, mapel: document.getElementById('cta-mapel')?.value, 
      guru: document.getElementById('cta-guru')?.value, topik: document.getElementById('cta-topik')?.value, 
      mode: 'AI', cp: document.getElementById('result-cp')?.textContent, tp: document.getElementById('result-tp')?.textContent, atp: document.getElementById('result-atp')?.textContent,
      createdAt: serverTimestamp(), updatedAt: serverTimestamp(), isAdmin: userDoc.exists() && userDoc.data()?.role === 'admin' 
    });
    alert('✅ Berhasil disimpan!'); loadCTAData();
  } catch (error) { alert('❌ Gagal simpan: ' + error.message); }
}

// ============================================
// ✅ LOAD SAVED DATA LIST
// ============================================
function loadCTAData() {
  const list = document.getElementById('cta-list'), countSpan = document.getElementById('saved-count');
  if (!list) return;
  const user = auth.currentUser; if (!user) { list.innerHTML = `<div class="text-center py-8 text-gray-500"><p>Silakan login untuk melihat data</p></div>`; return; }
  
  (async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid)), isAdmin = userDoc.exists() && userDoc.data()?.role === 'admin';
      let q; if (isAdmin) q = query(collection(db, 'cp_tp_atp'), orderBy('createdAt', 'desc')); else q = query(collection(db, 'cp_tp_atp'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
      
      onSnapshot(q, (snapshot) => {
        if (snapshot.empty) { list.innerHTML = `<div class="text-center py-8 text-gray-500"><p>Belum ada dokumen tersimpan</p></div>`; return; }
        if (countSpan) countSpan.textContent = snapshot.docs.length;
        list.innerHTML = snapshot.docs.map(docSnap => { const d = docSnap.data(), date = d.createdAt?.toDate?.()?.toLocaleString('id-ID') || '-'; return `<div class="cta-item"><div class="flex justify-between items-start mb-2"><div><strong class="text-lg">${d.mapel?.toUpperCase() || '-'} - Kelas ${d.kelas}</strong><br><small class="text-gray-500">${d.userName} • ${d.sekolah || '-'}</small></div><small class="text-gray-400">${date}</small></div><p class="text-gray-700 mt-2"><strong>📋 Topik:</strong> ${d.topik || '-'}</p></div>`; }).join('');
      });
    } catch (e) { console.error('❌ [CTA Generator] Load error:', e); }
  })();
}

// ============================================
// ✅ AUTO-SAVE HELPER
// ============================================
async function autoSaveCTA(result, metadata) {
  try {
    const user = auth.currentUser; if (!user) return null;
    await addDoc(collection(db, 'cp_tp_atp'), {
      userId: user.uid, userEmail: user.email, userName: user.displayName || 'Guru',
      ...metadata, mode: 'AI', cp: result.cp, tp: result.tp, atp: result.atp,
      createdAt: serverTimestamp(), updatedAt: serverTimestamp()
    });
    return true;
  } catch(e) { console.warn('⚠️ Auto-save skipped:', e); return null; }
}

// ============================================
// ✅ SHOW ALERT HELPER
// ============================================
function showAlert(msg, type='success') {
  const c = document.createElement('div'); c.style.cssText='position:fixed;top:20px;right:20px;background:#10b981;color:white;padding:12px 20px;border-radius:8px;z-index:9999;'; c.textContent=msg; document.body.appendChild(c); setTimeout(()=>c.remove(), 3000);
}

// ============================================
// ✅ HIDE DASHBOARD SECTIONS
// ============================================
function hideDashboardSections() { 
  document.querySelector('.dashboard-hero')?.closest('section')?.classList.add('hidden'); 
  document.querySelector('[aria-labelledby="rooms-heading"]')?.classList.add('hidden'); 
  document.querySelectorAll('#sd-section, #smp-section, #sma-section, #tk-section, #mi-section, #mts-section, #ma-section').forEach(s => s.classList.add('hidden')); 
}

console.log('🟢 [CTA Generator] READY — SKEMA COMPLIANT + GROQ API INTEGRATION');
