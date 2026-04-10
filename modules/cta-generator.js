/**
 * ============================================
 * MODULE: CTA GENERATOR (CP/TP/ATP)
 * Platform Administrasi Kelas Digital
 * ============================================
 */
console.log('🔴 [CTA Generator] Script START');

import { hasGroqApiKey, generateWithGroq, getGroqApiKey } from './groq-api.js';
import { validateInput, validateInputWithFilter } from './cta-templates.js';
import { db, auth, collection, addDoc, query, where, orderBy, onSnapshot, doc, getDoc, serverTimestamp } from './firebase-config.js';

console.log('✅ [CTA Generator] All imports successful');

let userRole = 'teacher';
let userKelasDiampu = [];
let userMapelDiampu = [];
let userSdMapelType = 'kelas';
let _aiReadyCache = null;

export async function isAiReady() {
  if (_aiReadyCache !== null) return _aiReadyCache;
  try {
    const globalKey = await getGroqApiKey();
    if (globalKey) { _aiReadyCache = true; return true; }
    const localKey = localStorage.getItem('groq_api_key');
    if (localKey && localKey.startsWith('gsk_') && localKey.length >= 20) { _aiReadyCache = true; return true; }
    _aiReadyCache = false; return false;
  } catch (error) { console.error('❌ [CTA Generator] Error checking AI readiness:', error); _aiReadyCache = false; return false; }
}

function filterCTAOptions(userData) {
  if (!userData) return;
  const { jenjang_sekolah, kelas_diampu, mapel_diampu, sd_mapel_type } = userData;
  
  const kelasSelect = document.getElementById('cta-kelas');
  if (kelasSelect && kelas_diampu?.length > 0) {
    if (jenjang_sekolah === 'sd' && sd_mapel_type !== 'kelas') {
      enableOptions(kelasSelect, ['1','2','3','4','5','6']);
    } else {
      enableOptions(kelasSelect, kelas_diampu);
    }
  }
  
  const mapelSelect = document.getElementById('cta-mapel');
  if (mapelSelect) {
    if (jenjang_sekolah === 'sd' && sd_mapel_type === 'kelas') {
      enableOptions(mapelSelect, 'all');
    } else if (jenjang_sekolah === 'sd' && sd_mapel_type !== 'kelas') {
      const allowed = sd_mapel_type === 'pai' ? ['pai'] : ['pjok'];
      enableOptions(mapelSelect, allowed);
    } else if (mapel_diampu?.length > 0) {
      enableOptions(mapelSelect, mapel_diampu);
    }
  }
}

function enableOptions(selectEl, allowedValues) {
  if (!selectEl) return;
  Array.from(selectEl.options).forEach(opt => {
    if (allowedValues === 'all' || allowedValues.includes(opt.value)) {
      opt.disabled = false;
    } else {
      opt.disabled = true;
    }
  });
}

// ✅ FIXED: Setup jenjang dropdown auto-select + prevent change
function setupJenjangDropdown(userData) {
  if (!userData) { console.warn('⚠️ [Jenjang] No userData, skip'); return; }
  const userJenjang = userData.jenjang_sekolah;
  console.log('🔍 [Jenjang] Setup:', { userJenjang });
  if (!userJenjang) { console.warn('⚠️ [Jenjang] userJenjang empty, skip'); return; }
  
  setTimeout(() => {
    const jenjangSelect = document.getElementById('cta-jenjang');
    if (!jenjangSelect) { console.error('❌ [Jenjang] #cta-jenjang not found!'); return; }
    jenjangSelect.value = userJenjang;
    const newSelect = jenjangSelect.cloneNode(true);
    jenjangSelect.replaceWith(newSelect);
    newSelect.addEventListener('change', function(e) {
      if (this.value !== userJenjang) {
        e.preventDefault();
        const label = {sd:'SD', smp:'SMP', sma:'SMA'}[userJenjang] || userJenjang.toUpperCase();
        alert(`⚠️ Jenjang Terkunci\n\nAnda: Guru ${label}\nJenjang tidak dapat diubah.`);
        this.value = userJenjang;
      }
    });
    console.log(`✅ [Jenjang] Setup complete: ${userJenjang}`);
  }, 150);
}

// ✅ NEW: Download function for CTA results
function downloadCTAResult() {
  const cp = document.getElementById('result-cp')?.value || '';
  const tp = document.getElementById('result-tp')?.value || '';
  const atp = document.getElementById('result-atp')?.value || '';
  
  if (!cp || cp.includes('⏳') || cp.includes('Error')) {
    alert('⚠️ Generate data dulu sebelum download!');
    return;
  }
  
  const jenjang = document.getElementById('cta-jenjang')?.value || '';
  const kelas = document.getElementById('cta-kelas')?.value || '';
  const semester = document.getElementById('cta-semester')?.value || '';
  const mapel = document.getElementById('cta-mapel')?.value || '';
  const topik = document.getElementById('cta-topik')?.value || '';
  const sekolah = document.getElementById('kop-sekolah')?.value || '';
  const guru = document.getElementById('cta-guru')?.value || '';
  const tahun = document.getElementById('kop-tahun')?.value || '';
  
  const labelJenjang = {sd:'SD', smp:'SMP', sma:'SMA'}[jenjang] || jenjang.toUpperCase();
  const labelSemester = semester === '1' ? 'Ganjil' : 'Genap';
  
  let content = `═══════════════════════════════════════════════════════════\n`;
  content += `              CAPAIAN PEMBELAJARAN (CP/TP/ATP)\n`;
  content += `                  KURIKULUM MERDEKA\n`;
  content += `═══════════════════════════════════════════════════════════\n\n`;
  content += `INFORMASI DOKUMEN\n`;
  content += `───────────────────────────────────────────────────────────\n`;
  content += `Nama Sekolah  : ${sekolah}\n`;
  content += `Tahun Ajaran  : ${tahun}\n`;
  content += `Jenjang       : ${labelJenjang}\n`;
  content += `Kelas         : ${kelas}\n`;
  content += `Semester      : ${labelSemester}\n`;
  content += `Mata Pelajaran: ${mapel}\n`;
  content += `Guru Pengampu : ${guru}\n`;
  content += `Topik/Materi  : ${topik}\n\n`;
  content += `═══════════════════════════════════════════════════════════\n`;
  content += `                    CAPAIAN PEMBELAJARAN (CP)\n`;
  content += `═══════════════════════════════════════════════════════════\n\n`;
  content += `${cp}\n\n`;
  content += `═══════════════════════════════════════════════════════════\n`;
  content += `                    TUJUAN PEMBELAJARAN (TP)\n`;
  content += `═══════════════════════════════════════════════════════════\n\n`;
  content += `${tp}\n\n`;
  content += `═══════════════════════════════════════════════════════════\n`;
  content += `              ALUR TUJUAN PEMBELAJARAN (ATP)\n`;
  content += `═══════════════════════════════════════════════════════════\n\n`;
  content += `${atp}\n\n`;
  content += `═══════════════════════════════════════════════════════════\n`;
  content += `Dokumen ini dibuat dengan Platform Administrasi Kelas Digital\n`;
  content += `© 2026 - Generated by AI\n`;
  
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `CP-TP-ATP_${labelJenjang}_Kelas${kelas}_${mapel}_${topik.replace(/\s+/g, '_')}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  console.log('✅ [Download] File downloaded successfully');
}

window.renderCTAGenerator = async function(jenjangFromParam, kelasFromParam, semesterFromParam) {
  console.log('📝 [CTA Generator] renderCTAGenerator() called');
  const container = document.getElementById('module-container');
  if (!container) { console.error('❌ Container not found!'); return; }
  const user = auth.currentUser;
  if (!user) { alert('⚠️ Silakan login dulu!'); return; }
  const userNama = localStorage.getItem('user_nama_lengkap') || '';
  const userSekolah = localStorage.getItem('user_nama_sekolah') || '';
  console.log('👤 [CTA Generator] Current user:', user.email, user.uid);
  
  const aiReady = await isAiReady();
  console.log('🤖 [CTA Generator] AI Ready:', aiReady);
  
  try {
    const userProfile = await getDoc(doc(db, 'users', user.uid));
    if (userProfile.exists()) {
      const userData = userProfile.data();
      userRole = userData.role || 'teacher';
      userKelasDiampu = userData.kelas_diampu || [];
      userMapelDiampu = userData.mapel_diampu || [];
      userSdMapelType = userData.sd_mapel_type || 'kelas';
      console.log('👤 [CTA Generator] User:', { role: userRole, kelas: userKelasDiampu, mapel: userMapelDiampu, sdType: userSdMapelType });
      filterCTAOptions(userData);
      setupJenjangDropdown(userData);
    } else {
      userRole = 'teacher'; userKelasDiampu = []; userMapelDiampu = []; userSdMapelType = 'kelas';
    }
  } catch (e) { console.error('❌ [CTA Generator] Failed to load user ', e); userRole = 'teacher'; userKelasDiampu = []; }
  
  const allClasses = ['1','2','3','4','5','6','7','8','9','10','11','12'];
  let availableClasses = allClasses;
  let isClassLocked = false;
  if (userRole === 'teacher' && userKelasDiampu.length > 0) {
    if (userSdMapelType !== 'kelas') {
      availableClasses = ['1','2','3','4','5','6'];
    } else {
      availableClasses = userKelasDiampu;
    }
    isClassLocked = true;
  }
  let defaultClass = kelasFromParam || '';
  if (isClassLocked && availableClasses.length > 0) defaultClass = availableClasses[0];
  console.log('📚 [CTA Generator] Available classes:', availableClasses);
  
  // ✅ RENDER UI — UPDATED: Hide scrollbar + Add Download button
  container.innerHTML = `
    <style>
      .cta-generator-form { max-width: 950px; margin: auto; padding: 30px; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
      .cta-generator-form h2 { text-align: center; color: #0891b2; margin-bottom: 10px; font-size: 28px; }
      .subtitle { text-align: center; color: #6b7280; margin-bottom: 30px; }
      .section-title { font-size: 18px; font-weight: 700; color: #374151; margin: 25px 0 15px 0; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb; display: flex; align-items: center; gap: 8px; }
      .cta-generator-form label { display: block; margin-top: 12px; font-weight: 600; color: #374151; font-size: 14px; }
      .cta-generator-form input, .cta-generator-form select { width: 100%; margin-top: 8px; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 14px; font-family: inherit; }
      .cta-generator-form input:focus, .cta-generator-form select:focus { outline: none; border-color: #0891b2; }
      .cta-generator-form select:disabled { background: #f3f4f6; color: #6b7280; cursor: not-allowed; }
      
      /* ✅ FIXED: Remove ALL borders + HIDE SCROLLBAR */
      #result-cp, #result-tp, #result-atp {
        width: 100%;
        min-height: 200px;
        padding: 16px 0;
        border: NONE !important;
        border-left: NONE !important;
        border-right: NONE !important;
        border-top: NONE !important;
        border-bottom: NONE !important;
        border-radius: 0 !important;
        background: transparent !important;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 14px;
        line-height: 1.8;
        white-space: pre-wrap;
        margin-top: 8px;
        resize: vertical;
        box-shadow: none !important;
        outline: none !important;
        color: #1f2937;
        /* Hide scrollbar */
        scrollbar-width: none !important; /* Firefox */
        -ms-overflow-style: none !important; /* IE/Edge */
      }
      #result-cp::-webkit-scrollbar,
      #result-tp::-webkit-scrollbar,
      #result-atp::-webkit-scrollbar {
        display: none !important; /* Chrome/Safari */
      }
      #result-cp:focus, #result-tp:focus, #result-atp:focus {
        background: transparent !important;
        outline: none !important;
        border: none !important;
      }
      
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
      .btn-back:hover { background: #4b5563; }
      .hidden { display: none !important; }
      .auto-filled { background: #f0fdf4; border-color: #10b981 !important; }
      .grid-cols-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
      .grid-cols-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
      @media (max-width: 768px) { .grid-cols-2, .grid-cols-3 { grid-template-columns: 1fr; } }
      .cta-item { background: white; padding: 20px; margin-top: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
      .status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600; margin-left: 8px; }
      .status-ready { background: #dcfce7; color: #166534; }
      .status-warning { background: #fef3c7; color: #92400e; }
      .status-info { background: #dbeafe; color: #1e40af; }
      .result-section { margin-top: 30px; }
      .lock-indicator { font-size: 11px; color: #6b7280; margin-top: 4px; display: flex; align-items: center; gap: 4px; }
      .debug-box { background: #fef3c7; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; font-size: 13px; }
      .debug-success { background: #dcfce7; border-left-color: #166534; }
      .debug-error { background: #fef2f2; border-left-color: #ef4444; }
      .result-separator { border: none; border-top: 1px dashed #e5e7eb; margin: 24px 0; }
      @media print {
        .cta-generator-form h2, .subtitle, .section-title, .cta-generator-form label, .btn-generate, .btn-save, .btn-secondary, .btn-print, .btn-download, .btn-back, .debug-box, #cta-form, .mt-12 { display: none !important; }
        #cta-result { display: block !important; }
        #result-cp, #result-tp, #result-atp { border: none !important; background: white !important; color: black !important; font-size: 12pt; min-height: auto; }
        body { background: white; }
      }
    </style>
    <div class="cta-generator-form">
      <h2>📄 Generator CP/TP/ATP</h2>
      <p class="subtitle">Buat Perangkat Pembelajaran dengan AI ${aiReady ? '<span class="status-badge status-ready">✅ AI Siap</span>' : '<span class="status-badge status-warning">⚠️ Setup Diperlukan</span>'} ${userRole === 'admin' ? '<span class="status-badge status-info">👑 Admin</span>' : '<span class="status-badge status-info">👤 Guru</span>'}</p>
      ${!aiReady ? `<div style="background:#fef3c7;padding:16px;border-radius:8px;margin-bottom:20px;color:#92400e;font-size:13px;border-left:4px solid #f59e0b;"><strong>⚠️ Setup AI Diperlukan</strong><br><br>${userRole === 'admin' ? '🔧 <strong>Untuk Admin:</strong><br>1. Pastikan Firestore document <code>settings/api_key</code> ada<br>2. Pastikan field <code>keys</code> array berisi minimal 1 key aktif<br>3. Cek Firestore Rules mengizinkan read ke <code>settings/*</code>' : 'Hubungi admin untuk aktivasi AI, atau input API key manual di profil.'}</div>` : '<div style="background:#dcfce7;padding:12px;border-radius:8px;margin-bottom:20px;color:#166534;font-size:13px;border-left:4px solid #10b981;">✅ AI aktif dan siap digunakan</div>'}
      <div id="debug-api-status" class="debug-box"><strong>🔍 Debug API Key Status:</strong><br><span id="debug-api-message">Checking...</span></div>
      <button class="btn-back" onclick="backToDashboard()"><i class="fas fa-arrow-left mr-2"></i>Kembali ke Dashboard</button>
      <form id="cta-form">
        <div class="section-title"><i class="fas fa-university"></i><span>1. Informasi Sekolah</span></div>
        <div><label for="kop-sekolah"><i class="fas fa-school mr-2"></i>Nama Sekolah</label><input type="text" id="kop-sekolah" placeholder="Masukkan nama sekolah" value="${userSekolah}" class="${userSekolah ? 'auto-filled' : ''}" required></div>
        <div class="grid-cols-2">
          <div><label for="kop-tahun"><i class="fas fa-calendar mr-2"></i>Tahun Ajaran</label><input type="text" id="kop-tahun" placeholder="2025/2026" value="2025/2026"></div>
          <div><label for="cta-guru"><i class="fas fa-chalkboard-teacher mr-2"></i>Nama Guru</label><input type="text" id="cta-guru" placeholder="Opsional" value="${userNama}" class="${userNama ? 'auto-filled' : ''}"></div>
        </div>
        <div class="section-title"><i class="fas fa-book-open"></i><span>2. Informasi Pembelajaran</span></div>
        <div class="grid-cols-3">
          <div><label for="cta-jenjang"><i class="fas fa-school mr-2"></i>Jenjang</label><select id="cta-jenjang" required><option value="">Pilih</option><option value="sd" ${jenjangFromParam === 'sd' ? 'selected' : ''}>SD</option><option value="smp" ${jenjangFromParam === 'smp' ? 'selected' : ''}>SMP</option><option value="sma" ${jenjangFromParam === 'sma' ? 'selected' : ''}>SMA</option></select></div>
          <div><label for="cta-kelas"><i class="fas fa-users mr-2"></i>Kelas</label><select id="cta-kelas" required ${isClassLocked ? 'disabled' : ''}><option value="">Pilih</option>${availableClasses.map(k => `<option value="${k}" ${k === defaultClass ? 'selected' : ''}>${k}</option>`).join('')}</select>${isClassLocked ? `<p class="lock-indicator"><i class="fas fa-lock"></i> Terkunci untuk kelas yang Anda ampu</p>` : ''}</div>
          <div><label for="cta-semester"><i class="fas fa-clock mr-2"></i>Semester</label><select id="cta-semester" required><option value="">Pilih</option><option value="1" ${semesterFromParam === '1' ? 'selected' : ''}>1 (Ganjil)</option><option value="2" ${semesterFromParam === '2' ? 'selected' : ''}>2 (Genap)</option></select></div>
        </div>
        <div class="grid-cols-2">
          <div><label for="cta-mapel"><i class="fas fa-book mr-2"></i>Mata Pelajaran</label><select id="cta-mapel" required><option value="">Pilih</option><option value="matematika">Matematika</option><option value="ipas">IPAS</option><option value="bahasa-indonesia">Bahasa Indonesia</option><option value="pjok">PJOK</option><option value="seni-budaya">Seni Budaya</option><option value="lainnya">Lainnya</option></select></div>
          <div><label for="cta-topik"><i class="fas fa-tag mr-2"></i>Topik/Materi</label><input type="text" id="cta-topik" placeholder="Contoh: Bilangan 1-20" required></div>
        </div>
        <button type="button" id="btn-generate" class="btn-generate"><i class="fas fa-magic"></i> Generate dengan AI</button>
      </form>
      <div id="cta-result" class="hidden result-section">
        <h3 class="text-xl font-bold mb-4 text-gray-800">📋 Hasil Generate</h3>
        <label for="result-cp"><i class="fas fa-bullseye mr-2"></i>Capaian Pembelajaran (CP)</label><textarea id="result-cp" placeholder="CP akan muncul setelah generate..." readonly></textarea>
        <hr class="result-separator">
        <label for="result-tp"><i class="fas fa-flag-checkered mr-2"></i>Tujuan Pembelajaran (TP)</label><textarea id="result-tp" placeholder="TP akan muncul setelah generate..." readonly></textarea>
        <hr class="result-separator">
        <label for="result-atp"><i class="fas fa-stream mr-2"></i>Alur Tujuan Pembelajaran (ATP)</label><textarea id="result-atp" placeholder="ATP akan muncul setelah generate..." readonly></textarea>
        <div style="display: flex; gap: 12px; margin-top: 16px;">
          <button type="button" id="btn-print" class="btn-print" style="flex: 1;"><i class="fas fa-print"></i> Print</button>
          <button type="button" id="btn-download" class="btn-download" style="flex: 1;"><i class="fas fa-download"></i> Download</button>
          <button type="button" id="btn-save" class="btn-save" style="flex: 1;"><i class="fas fa-save"></i> Simpan</button>
          <button type="button" id="btn-regenerate" class="btn-secondary" style="flex: 1;"><i class="fas fa-redo"></i> Ulang</button>
        </div>
      </div>
      <div class="mt-12"><h3 class="text-xl font-bold mb-4 text-gray-800"><i class="fas fa-archive mr-2"></i>Dokumen Tersimpan (<span id="saved-count">0</span>)</h3><div id="cta-list" class="space-y-4"><div class="loading-spinner"><i class="fas fa-spinner fa-spin text-2xl mb-3"></i><p>Memuat...</p></div></div></div>
    </div>`;
  
  (async function showDebugStatus() {
    const debugBox = document.getElementById('debug-api-status'), debugMsg = document.getElementById('debug-api-message');
    if (!debugBox || !debugMsg) return;
    try {
      const { getGroqApiKey } = await import('./groq-api.js'), key = await getGroqApiKey();
      if (key && key.startsWith('gsk_') && key.length >= 20) { debugBox.className = 'debug-box debug-success'; debugMsg.innerHTML = `<span style="color:#166534;"><strong>✅ API KEY FOUND!</strong></span><br>Key: ${key.substring(0,15)}...<br>Length: ${key.length} chars`; }
      else if (key) { debugBox.className = 'debug-box debug-error'; debugMsg.innerHTML = `<span style="color:#991b1b;"><strong>⚠️ KEY INVALID</strong></span>`; }
      else { debugBox.className = 'debug-box debug-error'; debugMsg.innerHTML = `<span style="color:#991b1b;"><strong>❌ NO KEY FOUND</strong></span>`; }
    } catch (e) { debugBox.className = 'debug-box debug-error'; debugMsg.innerHTML = `<span style="color:#991b1b;"><strong>❌ ERROR</strong></span><br>${e.message}`; }
  })();
  
  // Print Button
  const btnPrint = document.getElementById('btn-print');
  if (btnPrint) btnPrint.addEventListener('click', () => { const cp = document.getElementById('result-cp')?.value; if (!cp || cp.includes('⏳') || cp.includes('Error')) { alert('⚠️ Generate data dulu sebelum print!'); return; } window.print(); });
  
  // ✅ NEW: Download Button
  const btnDownload = document.getElementById('btn-download');
  if (btnDownload) btnDownload.addEventListener('click', downloadCTAResult);
  
  // Test Global Key Button (admin)
  const testKeyBtn = document.getElementById('btn-test-global-key');
  if (testKeyBtn && userRole === 'admin') testKeyBtn.addEventListener('click', async () => { try { const { getNextApiKey } = await import('./global-api-key.js'), key = await getNextApiKey(); if (key) { alert('✅ Global API Key ditemukan!'); location.reload(); } else alert('❌ Global API Key TIDAK ditemukan.'); } catch (e) { console.error('❌ [CTA Generator] Test error:', e); alert('❌ Error: ' + e.message); } });
  
  hideDashboardSections(); container.classList.remove('hidden'); setupEventHandlers(); loadCTAData(); console.log('✅ [CTA Generator] UI rendered');
};

function hideDashboardSections() { document.querySelector('.dashboard-hero')?.closest('section')?.classList.add('hidden'); document.querySelector('[aria-labelledby="rooms-heading"]')?.classList.add('hidden'); document.querySelectorAll('#sd-section, #smp-section, #sma-section').forEach(s => s.classList.add('hidden')); }
function setupEventHandlers() { const btnGenerate = document.getElementById('btn-generate'), btnSave = document.getElementById('btn-save'), btnRegenerate = document.getElementById('btn-regenerate'); if (btnGenerate) btnGenerate.addEventListener('click', handleGenerate); if (btnSave) btnSave.addEventListener('click', handleSave); if (btnRegenerate) btnRegenerate.addEventListener('click', handleGenerate); }

async function handleGenerate() {
  console.log('🪄 [CTA Generator] Generate clicked');
  const user = auth.currentUser; if (!user) { alert('⚠️ Silakan login dulu!'); return; }
  const jenjang = document.getElementById('cta-jenjang')?.value, kelas = document.getElementById('cta-kelas')?.value, semester = document.getElementById('cta-semester')?.value, mapel = document.getElementById('cta-mapel')?.value, sekolah = document.getElementById('kop-sekolah')?.value, tahun = document.getElementById('kop-tahun')?.value, guru = document.getElementById('cta-guru')?.value, topik = document.getElementById('cta-topik')?.value;
  
  const validation = validateInputWithFilter({ sekolah, jenjang, kelas, semester, mapel, topik }, { jenjang_sekolah: jenjang, kelas_diampu: userKelasDiampu, mapel_diampu: userMapelDiampu, sd_mapel_type: userSdMapelType });
  if (!validation.valid) { alert('⚠️ ' + validation.errors.join('\n')); return; }
  
  const aiReady = await isAiReady(); if (!aiReady) { const userDoc = await getDoc(doc(db, 'users', user.uid)), isAdmin = userDoc.exists() && userDoc.data()?.role === 'admin'; if (isAdmin) alert('⚠️ Global API Key belum terdeteksi.'); else alert('⚠️ AI belum aktif. Hubungi admin.'); return; }
  
  const resultDiv = document.getElementById('cta-result'); if (resultDiv) resultDiv.classList.remove('hidden');
  document.getElementById('result-cp').value = `⏳ Generating CP...`; document.getElementById('result-tp').value = `⏳ Generating TP...`; document.getElementById('result-atp').value = `⏳ Generating ATP...`; resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
  
  try {
    console.log('🤖 [CTA Generator] Calling AI...');
    const inputData = { sekolah, jenjang, kelas, semester, mapel, guru, topik, tahun }, result = await generateWithGroq(inputData);
    document.getElementById('result-cp').value = result.cp; document.getElementById('result-tp').value = result.tp; document.getElementById('result-atp').value = result.atp;
    console.log('✅ [CTA Generator] Generation complete!');
  } catch (error) {
    console.error('❌ [CTA Generator] Error:', error);
    let errorMessage = error.message;
    if (error.message.includes('API key')) errorMessage = 'API Key tidak valid.';
    else if (error.message.includes('quota') || error.message.includes('429')) errorMessage = 'Limit AI harian habis.';
    else if (error.message.includes('koneksi') || error.message.includes('network')) errorMessage = 'Koneksi internet bermasalah.';
    document.getElementById('result-cp').value = `❌ Error: ${errorMessage}`; document.getElementById('result-tp').value = ''; document.getElementById('result-atp').value = '';
    alert('❌ Gagal generate:\n\n' + errorMessage);
  }
}

async function handleSave() {
  console.log('💾 [CTA Generator] Save clicked');
  const user = auth.currentUser; if (!user) { alert('⚠️ Silakan login dulu!'); return; }
  const cp = document.getElementById('result-cp')?.value, tp = document.getElementById('result-tp')?.value, atp = document.getElementById('result-atp')?.value;
  if (!cp || !tp || !atp || cp.includes('Error') || cp.includes('Loading') || cp.includes('⏳')) { alert('⚠️ Generate data dulu sebelum menyimpan!'); return; }
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid)), isAdmin = userDoc.exists() && userDoc.data()?.role === 'admin';
    await addDoc(collection(db, 'cp_tp_atp'), { userId: user.uid, userEmail: user.email, userName: user.displayName || 'Guru', sekolah: document.getElementById('kop-sekolah')?.value, tahun: document.getElementById('kop-tahun')?.value, jenjang: document.getElementById('cta-jenjang')?.value, kelas: document.getElementById('cta-kelas')?.value, semester: document.getElementById('cta-semester')?.value, mapel: document.getElementById('cta-mapel')?.value, guru: document.getElementById('cta-guru')?.value, topik: document.getElementById('cta-topik')?.value, mode: 'AI', cp: cp, tp: tp, atp: atp, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), isAdmin: isAdmin });
    console.log('✅ [CTA Generator] Data saved!'); alert('✅ Berhasil disimpan!'); loadCTAData();
  } catch (error) { console.error('❌ [CTA Generator] Save error:', error); alert('❌ Gagal simpan: ' + error.message); }
}

function loadCTAData() {
  const list = document.getElementById('cta-list'), countSpan = document.getElementById('saved-count');
  if (!list) { console.error('❌ List container not found!'); return; }
  const user = auth.currentUser; if (!user) { list.innerHTML = `<div class="text-center py-8 text-gray-500"><p>Silakan login untuk melihat data</p></div>`; return; }
  (async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid)), isAdmin = userDoc.exists() && userDoc.data()?.role === 'admin';
      let q; if (isAdmin) q = query(collection(db, 'cp_tp_atp'), orderBy('createdAt', 'desc')); else q = query(collection(db, 'cp_tp_atp'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
      onSnapshot(q, (snapshot) => {
        if (snapshot.empty) { list.innerHTML = `<div class="text-center py-8 text-gray-500"><p>Belum ada dokumen tersimpan</p></div>`; return; }
        if (countSpan) countSpan.textContent = snapshot.docs.length;
        list.innerHTML = snapshot.docs.map(docSnap => { const d = docSnap.data(), date = d.createdAt?.toDate?.()?.toLocaleString('id-ID') || '-'; return `<div class="cta-item"><div class="flex justify-between items-start mb-2"><div><strong class="text-lg">${d.mapel?.toUpperCase() || '-'} - Kelas ${d.kelas}</strong><br><small class="text-gray-500">${d.userName} • ${d.sekolah || '-'}</small></div><small class="text-gray-400">${date}</small></div><p class="text-gray-700 mt-2"><strong>📋 Topik:</strong> ${d.topik || '-'}</p><p class="text-gray-600 text-sm">${d.cp?.substring(0, 150) || '-'}...</p></div>`; }).join('');
      });
    } catch (e) { console.error('❌ [CTA Generator] Load error:', e); if (e.message?.includes('index')) list.innerHTML = `<div class="text-center py-8 text-yellow-600"><p>⚠️ Index Firestore belum siap.</p></div>`; }
  })();
}

console.log('🟢 [CTA Generator] READY — No Scrollbar + Download Feature');
