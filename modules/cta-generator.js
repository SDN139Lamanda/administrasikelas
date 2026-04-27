/**
 * ============================================
 * MODULE: CTA GENERATOR (CP/TP/ATP)
 * Platform Administrasi Kelas Digital
 * ✅ UPDATED: Fix function name + container + table output format
 * ✅ UPDATED: Dynamic mapel loading + Auto-lock based on user registration (SKEMA COMPLIANT)
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
let userJenjangSekolah = '';
let _aiReadyCache = null;
let _mapelCache = {};

// ✅ HELPER: Check if mapel should be excluded for Guru Kelas SD/MI
function isMapelExcludedForGuruKelas(mapelNama) {
  const excluded = ['pai', 'pjok', 'bd', 'pai/bd', 'pendidikan agama islam', 'pendidikan jasmani', 'pendidikan keagamaan'];
  const namaLower = mapelNama.toLowerCase();
  return excluded.some(ex => namaLower.includes(ex));
}

// ✅ HELPER: Check if mapel should be included for Guru Mapel SD/MI
function isMapelAllowedForGuruMapel(mapelNama, sdMapelType) {
  const namaLower = mapelNama.toLowerCase();
  return namaLower.includes(sdMapelType);
}

// ✅ HELPER: Check if mapel is in user's assigned mapel list (for SMP/MTs/SMA/MA)
function isMapelInAssignedList(mapelNama, assignedList) {
  if (!assignedList || assignedList.length === 0) return true;
  const namaLower = mapelNama.toLowerCase();
  return assignedList.some(m => namaLower.includes(m.toLowerCase()));
}

export async function fetchMapelData(jenjang) {
  if (!jenjang) return [];
  if (_mapelCache[jenjang]) return _mapelCache[jenjang];
  
  try {
    console.log(`📥 [Mapel] Fetching ./data/mapel/${jenjang}.json`);
    const response = await fetch(`./data/mapel/${jenjang}.json`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('Invalid JSON structure');
    _mapelCache[jenjang] = data;
    console.log(`✅ [Mapel] Loaded ${data.length} subjects for ${jenjang.toUpperCase()}`);
    return data;
  } catch (error) {
    console.warn(`⚠️ [Mapel] Failed to fetch ${jenjang}.json:`, error.message);
    const fallback = [
      { nama: 'Matematika', jenjang },
      { nama: 'Bahasa Indonesia', jenjang },
      { nama: 'IPA/IPAS', jenjang },
      { nama: 'Lainnya', jenjang }
    ];
    _mapelCache[jenjang] = fallback;
    return fallback;
  }
}

// ✅ UPDATED: Populate mapel dropdown WITH FILTERING based on user registration (SKEMA COMPLIANT)
async function populateMapelDropdown(jenjang, userMapelFromReg = null, userData = null) {
  const mapelSelect = document.getElementById('cta-mapel');
  if (!mapelSelect || !jenjang) return;
  
  const originalValue = mapelSelect.value;
  mapelSelect.innerHTML = '<option value="">Memuat daftar mapel...</option>';
  mapelSelect.disabled = true;
  
  try {
    const mapelList = await fetchMapelData(jenjang);
    mapelSelect.innerHTML = '<option value="">Pilih Mata Pelajaran</option>';
    
    // ✅ DETERMINE FILTER RULE based on skema
    const getFilterRule = () => {
  if (!userData) return { type: 'none' };
  const { jenjang_sekolah, sd_mapel_type, mapel_diampu, role } = userData;
  
  if (role === 'admin') return { type: 'none' };
  if (jenjang_sekolah === 'tk') return { type: 'none' };
  
  // SD/MI Guru Kelas: EXCLUDE PAI/PJOK/BD
  if (['sd', 'mi'].includes(jenjang_sekolah) && sd_mapel_type === 'kelas') {
    return { type: 'exclude', values: ['pai', 'pjok', 'bd', 'pai/bd'] };
  }
  
  // ✅ SD/MI Guru Mapel: HANDLE MULTI-FORMAT (baru & lama)
  if (['sd', 'mi'].includes(jenjang_sekolah) && sd_mapel_type?.startsWith('guru-mapel')) {
    // Format baru: "guru-mapel-paibd" → extract "paibd"
    const extracted = sd_mapel_type.replace('guru-mapel-', '');
    return { type: 'include', values: [extracted] };
  }
  
  if (['sd', 'mi'].includes(jenjang_sekolah) && sd_mapel_type === 'mapel' && mapel_diampu?.length > 0) {
    // Format lama: sd_mapel_type="mapel" + mapel_diampu=["paibd","pjok"]
    return { type: 'include', values: mapel_diampu.map(m => m.toLowerCase()) };
  }
  
  // ✅ SMP/MTs/SMA/MA: Use mapel_diampu array
  if (['smp', 'mts', 'sma', 'ma'].includes(jenjang_sekolah) && mapel_diampu?.length > 0) {
    return { type: 'include', values: mapel_diampu.map(m => m.toLowerCase()) };
  }
  
  return { type: 'none' };
};
      }
      
      return { type: 'none' };
    };
    
    const filterRule = getFilterRule();
    console.log('🔍 [Mapel] Filter rule:', filterRule);
    
    mapelList.forEach(item => {
      const namaLower = item.nama.toLowerCase();
      
      // ✅ APPLY FILTER
      if (filterRule.type === 'exclude' && filterRule.values.some(v => namaLower.includes(v))) {
        return; // Skip this option
      }
      if (filterRule.type === 'include' && !filterRule.values.some(v => namaLower.includes(v))) {
        return; // Skip this option
      }
      
      const opt = document.createElement('option');
      opt.value = item.nama;
      opt.textContent = item.nama;
      mapelSelect.appendChild(opt);
    });
    
    // ✅ AUTO-LOCK if user has registered mapel AND it's in the filtered list
    if (userMapelFromReg) {
      const match = Array.from(mapelSelect.options).find(opt => 
        opt.value.toLowerCase() === userMapelFromReg.toLowerCase() || 
        opt.textContent.toLowerCase().includes(userMapelFromReg.toLowerCase())
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
        console.log(`🔐 [Mapel] Auto-locked to: ${userMapelFromReg}`);
      } else {
        // Registered mapel not in filtered list — show warning
        console.warn(`⚠️ [Mapel] Registered mapel "${userMapelFromReg}" not available after filtering`);
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

// ✅ UPDATED: Filter dropdown options based on user registration (SKEMA COMPLIANT)
function filterCTAOptions(userData) {
  if (!userData) return;
  const { jenjang_sekolah, kelas_diampu, mapel_yang_diampu, sd_mapel_type, role } = userData;
  
  // ✅ FILTER KELAS DROPDOWN
  const kelasSelect = document.getElementById('cta-kelas');
  if (kelasSelect) {
    if (role === 'admin') {
      // Admin: all classes enabled
      Array.from(kelasSelect.options).forEach(opt => opt.disabled = false);
      console.log('👑 [Filter] Admin: All classes enabled');
    } else if (jenjang_sekolah === 'tk') {
      // TK: only A/B enabled
      Array.from(kelasSelect.options).forEach(opt => {
        opt.disabled = !['A', 'B'].includes(opt.value);
      });
      console.log('🔐 [Filter] TK: Only classes A/B enabled');
    } else if (['sd', 'mi'].includes(jenjang_sekolah) && sd_mapel_type === 'kelas') {
      // SD/MI Guru Kelas: only kelas_diampu enabled
      Array.from(kelasSelect.options).forEach(opt => {
        opt.disabled = !kelas_diampu?.includes(opt.value);
      });
      console.log('🔐 [Filter] SD/MI Guru Kelas: Only assigned classes enabled:', kelas_diampu);
    } else {
      // SD/MI Guru Mapel, SMP/MTs/SMA/MA: all classes in jenjang enabled
      const allClasses = jenjang_sekolah === 'sd' || jenjang_sekolah === 'mi' ? ['1','2','3','4','5','6'] :
                         jenjang_sekolah === 'smp' || jenjang_sekolah === 'mts' ? ['7','8','9'] :
                         ['10','11','12'];
      Array.from(kelasSelect.options).forEach(opt => {
        opt.disabled = !allClasses.includes(opt.value);
      });
      console.log('🔐 [Filter] Guru Mapel: All classes in jenjang enabled');
    }
  }
  
  // ✅ FILTER MAPEL DROPDOWN (visual disable, not remove)
  const mapelSelect = document.getElementById('cta-mapel');
  if (mapelSelect && role !== 'admin') {
    // Note: Actual filtering is done in populateMapelDropdown()
    // This function just ensures no admin bypass issues
    console.log('🔐 [Filter] Mapel filtering handled in populateMapelDropdown()');
  }
}

// ✅ SETUP JENJANG DROPDOWN (unchanged — already locked)
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
        const label = {tk:'TK', sd:'SD', mi:'MI', smp:'SMP', mts:'MTs', sma:'SMA', ma:'MA'}[userJenjang] || userJenjang.toUpperCase();
        alert(`⚠️ Jenjang Terkunci\n\nAnda: Guru ${label}\nJenjang tidak dapat diubah.`);
        this.value = userJenjang;
      }
    });
    console.log(`✅ [Jenjang] Setup complete: ${userJenjang}`);
  }, 150);
}

// ✅ DOWNLOAD FUNCTION (unchanged)
function downloadCTAResult() {
  const cp = document.getElementById('result-cp')?.textContent || '';
  const tp = document.getElementById('result-tp')?.textContent || '';
  const atp = document.getElementById('result-atp')?.textContent || '';
  
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
  const labelJenjang = {tk:'TK', sd:'SD', mi:'MI', smp:'SMP', mts:'MTs', sma:'SMA', ma:'MA'}[jenjang] || jenjang.toUpperCase();
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

function autoExpandTextarea(textarea) {
  if (!textarea) return;
  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 'px';
}

// ✅ MAIN RENDER FUNCTION (UPDATED: pass userData to populateMapelDropdown)
window.renderCitaGenerator = async function(jenjangFromParam, kelasFromParam, semesterFromParam) {
  console.log('📝 [CTA Generator] renderCitaGenerator() called');
  
  const container = document.getElementById('cita-container');
  if (!container) { 
    console.error('❌ Container #cita-container not found!'); 
    const fallbackContainer = document.getElementById('module-container');
    if (fallbackContainer) {
      console.warn('⚠️ Using #module-container as fallback');
      return renderCTAGeneratorLegacy(jenjangFromParam, kelasFromParam, semesterFromParam, fallbackContainer);
    }
    return; 
  }
  
  const user = auth.currentUser;
  if (!user) { alert('⚠️ Silakan login dulu!'); return; }
  
  const userNama = localStorage.getItem('user_nama_lengkap') || '';
  const userSekolah = localStorage.getItem('user_nama_sekolah') || '';
  const userMapelFromReg = localStorage.getItem('user_mapel') || null;
  console.log('👤 [CTA Generator] Current user:', user.email, user.uid, { mapel_reg: userMapelFromReg });
  
  const aiReady = await isAiReady();
  console.log('🤖 [CTA Generator] AI Ready:', aiReady);
  
  let userProfile = null;
  let userData = null;
  try {
    userProfile = await getDoc(doc(db, 'users', user.uid));
    if (userProfile.exists()) {
      userData = userProfile.data();
      userRole = userData.role || 'teacher';
      userKelasDiampu = userData.kelas_diampu || [];
      userMapelDiampu = userData.mapel_diampu || [];
      userSdMapelType = userData.sd_mapel_type || 'kelas';
      userJenjangSekolah = userData.jenjang_sekolah || '';
      console.log('👤 [CTA Generator] User:', { role: userRole, jenjang: userJenjangSekolah, kelas: userKelasDiampu, mapel: userMapelDiampu, sdType: userSdMapelType });
      
      // ✅ APPLY FILTERS to dropdowns
      filterCTAOptions(userData);
      setupJenjangDropdown(userData);
    } else {
      userRole = 'teacher'; userKelasDiampu = []; userMapelDiampu = []; userSdMapelType = 'kelas'; userJenjangSekolah = '';
    }
  } catch (e) { console.error('❌ [CTA Generator] Failed to load user ', e); userRole = 'teacher'; userKelasDiampu = []; }
  
  // ✅ DETERMINE AVAILABLE CLASSES based on skema
  const allClasses = ['1','2','3','4','5','6','7','8','9','10','11','12'];
  let availableClasses = allClasses;
  let isClassLocked = false;
  
  if (userRole === 'admin') {
    availableClasses = allClasses;
    isClassLocked = false;
    console.log('👑 [CTA Generator] Admin mode: All classes unlocked');
  } else if (userJenjangSekolah === 'tk') {
    availableClasses = ['A', 'B'];
    isClassLocked = true;
    console.log('🔐 [CTA Generator] TK mode: Only classes A/B');
  } else if (['sd', 'mi'].includes(userJenjangSekolah) && userSdMapelType === 'kelas') {
    availableClasses = userKelasDiampu.length > 0 ? userKelasDiampu : ['1','2','3','4','5','6'];
    isClassLocked = true;
    console.log('🔐 [CTA Generator] SD/MI Guru Kelas mode: Classes locked to', availableClasses);
  } else {
    // SD/MI Guru Mapel, SMP/MTs/SMA/MA: all classes in jenjang
    if (userJenjangSekolah === 'sd' || userJenjangSekolah === 'mi') {
      availableClasses = ['1','2','3','4','5','6'];
    } else if (userJenjangSekolah === 'smp' || userJenjangSekolah === 'mts') {
      availableClasses = ['7','8','9'];
    } else if (userJenjangSekolah === 'sma' || userJenjangSekolah === 'ma') {
      availableClasses = ['10','11','12'];
    }
    isClassLocked = false;
    console.log('🔐 [CTA Generator] Guru Mapel mode: All classes in jenjang enabled');
  }
  
  let defaultClass = kelasFromParam || '';
  if (isClassLocked && availableClasses.length > 0) defaultClass = availableClasses[0];
  console.log('📚 [CTA Generator] Available classes:', availableClasses);
  
  // ✅ RENDER UI WITH TABLE FORMAT OUTPUT
  container.innerHTML = `
    <style>
      .cta-generator-form { max-width: 950px; margin: auto; padding: 30px; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
      .cta-generator-form h2 { text-align: center; color: #0891b2; margin-bottom: 10px; font-size: 28px; }
      .subtitle { text-align: center; color: #6b7280; margin-bottom: 30px; }
      .section-title { font-size: 18px; font-weight: 700; color: #374151; margin: 25px 0 15px 0; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb; display: flex; align-items: center; gap: 8px; }
      .cta-generator-form label { display: block; margin-top: 12px; font-weight: 600; color: #374151; font-size: 14px; }
      .cta-generator-form input, .cta-generator-form select { width: 100%; margin-top: 8px; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 14px; font-family: inherit; box-sizing: border-box; }
      .cta-generator-form input:focus, .cta-generator-form select:focus { outline: none; border-color: #0891b2; }
      .cta-generator-form select:disabled { background: #f3f4f6; color: #6b7280; cursor: not-allowed; }
      
      /* TABLE FORMAT OUTPUT */
      .cta-result-table { width: 100%; border-collapse: collapse; margin-top: 16px; background: white; }
      .cta-result-table th { background: #0891b2; color: white; padding: 12px 16px; text-align: left; font-weight: 600; }
      .cta-result-table td { padding: 16px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
      .cta-result-table tr:last-child td { border-bottom: none; }
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
      
      @media print {
        .cta-generator-form h2, .subtitle, .section-title, .cta-generator-form label, .btn-generate, .btn-save, .btn-secondary, .btn-print, .btn-download, .btn-back, .debug-box, #cta-form, .mt-12 { display: none !important; }
        #cta-result { display: block !important; }
        .cta-result-table { border: 1px solid #000; }
        .cta-result-table th, .cta-result-table td { border: 1px solid #000; color: #000; }
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
          <div><label for="cta-jenjang"><i class="fas fa-school mr-2"></i>Jenjang</label><select id="cta-jenjang" required><option value="">Pilih</option><option value="tk">TK</option><option value="sd">SD</option><option value="mi">MI</option><option value="smp">SMP</option><option value="mts">MTs</option><option value="sma">SMA</option><option value="ma">MA</option></select></div>
          <div><label for="cta-kelas"><i class="fas fa-users mr-2"></i>Kelas</label><select id="cta-kelas" required ${isClassLocked && userRole !== 'admin' ? 'disabled' : ''}><option value="">Pilih</option>${availableClasses.map(k => `<option value="${k}" ${k === defaultClass ? 'selected' : ''}>${k}</option>`).join('')}</select>${isClassLocked && userRole !== 'admin' ? `<p class="lock-indicator"><i class="fas fa-lock"></i> Terkunci untuk kelas yang Anda ampu</p>` : ''}</div>
          <div><label for="cta-semester"><i class="fas fa-clock mr-2"></i>Semester</label><select id="cta-semester" required><option value="">Pilih</option><option value="1" ${semesterFromParam === '1' ? 'selected' : ''}>1 (Ganjil)</option><option value="2" ${semesterFromParam === '2' ? 'selected' : ''}>2 (Genap)</option></select></div>
        </div>
        <div class="grid-cols-2">
          <div><label for="cta-mapel"><i class="fas fa-book mr-2"></i>Mata Pelajaran</label><select id="cta-mapel" required><option value="">Memuat daftar mapel...</option></select></div>
          <div><label for="cta-topik"><i class="fas fa-tag mr-2"></i>Topik/Materi</label><input type="text" id="cta-topik" placeholder="Contoh: Bilangan 1-20" required></div>
        </div>
        <button type="button" id="btn-generate" class="btn-generate"><i class="fas fa-magic"></i> Generate dengan AI</button>
      </form>
      
      <!-- TABLE FORMAT OUTPUT -->
      <div id="cta-result" class="hidden result-section">
        <h3 class="text-xl font-bold mb-4 text-gray-800">📋 Hasil Generate</h3>
        <table class="cta-result-table">
          <thead>
            <tr>
              <th class="label-col">Komponen</th>
              <th class="content-col">Konten</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="label-col">🎯 Capaian Pembelajaran (CP)</td>
              <td class="content-col" id="result-cp">CP akan muncul setelah generate...</td>
            </tr>
            <tr>
              <td class="label-col">🏁 Tujuan Pembelajaran (TP)</td>
              <td class="content-col" id="result-tp">TP akan muncul setelah generate...</td>
            </tr>
            <tr>
              <td class="label-col">📊 Alur Tujuan Pembelajaran (ATP)</td>
              <td class="content-col" id="result-atp">ATP akan muncul setelah generate...</td>
            </tr>
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
  
  // ✅ POPULATE MAPEL DROPDOWN WITH FILTERING + PASS userData
  const jenjangSelect = document.getElementById('cta-jenjang');
  if (jenjangSelect) {
    const initialJenjang = jenjangFromParam || userJenjangSekolah;
    if (initialJenjang) {
      jenjangSelect.value = initialJenjang;
      // ✅ PASS userData for filtering
      await populateMapelDropdown(initialJenjang, userMapelFromReg, userData);
    }
    
    jenjangSelect.addEventListener('change', async function() {
      const newJenjang = this.value;
      if (newJenjang) {
        const existingBadge = document.getElementById('cta-mapel')?.parentNode?.querySelector('.lock-indicator');
        if (existingBadge) existingBadge.remove();
        // ✅ PASS userData for filtering
        await populateMapelDropdown(newJenjang, userMapelFromReg, userData);
      }
    });
  }
  
  // ✅ DEBUG API STATUS
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
  
  // ✅ EVENT LISTENERS
  const btnPrint = document.getElementById('btn-print');
  if (btnPrint) btnPrint.addEventListener('click', () => { const cp = document.getElementById('result-cp')?.textContent || ''; if (!cp || cp.includes('⏳') || cp.includes('Error')) { alert('⚠️ Generate data dulu sebelum print!'); return; } window.print(); });
  
  const btnDownload = document.getElementById('btn-download');
  if (btnDownload) btnDownload.addEventListener('click', downloadCTAResult);
  
  const testKeyBtn = document.getElementById('btn-test-global-key');
  if (testKeyBtn && userRole === 'admin') testKeyBtn.addEventListener('click', async () => { try { const { getNextApiKey } = await import('./global-api-key.js'), key = await getNextApiKey(); if (key) { alert('✅ Global API Key ditemukan!'); location.reload(); } else alert('❌ Global API Key TIDAK ditemukan.'); } catch (e) { console.error('❌ [CTA Generator] Test error:', e); alert('❌ Error: ' + e.message); } });  
  
  hideDashboardSections(); 
  container.classList.remove('hidden'); 
  setupEventHandlers(); 
  loadCTAData(); 
  console.log('✅ [CTA Generator] UI rendered to #cita-container');
};

// ✅ LEGACY FUNCTION for backward compatibility
async function renderCTAGeneratorLegacy(jenjangFromParam, kelasFromParam, semesterFromParam, container) {
  console.log('⚠️ [CTA Generator] Using legacy renderCTAGenerator (fallback)');
  return window.renderCitaGenerator(jenjangFromParam, kelasFromParam, semesterFromParam);
}

function hideDashboardSections() { 
  document.querySelector('.dashboard-hero')?.closest('section')?.classList.add('hidden'); 
  document.querySelector('[aria-labelledby="rooms-heading"]')?.classList.add('hidden'); 
  document.querySelectorAll('#sd-section, #smp-section, #sma-section, #tk-section, #mi-section, #mts-section, #ma-section').forEach(s => s.classList.add('hidden')); 
}

function setupEventHandlers() { 
  const btnGenerate = document.getElementById('btn-generate'), btnSave = document.getElementById('btn-save'), btnRegenerate = document.getElementById('btn-regenerate'); 
  if (btnGenerate) btnGenerate.addEventListener('click', handleGenerate); 
  if (btnSave) btnSave.addEventListener('click', handleSave); 
  if (btnRegenerate) btnRegenerate.addEventListener('click', handleGenerate); 
}

// ✅ HANDLE GENERATE WITH SKEMA-COMPLIANT VALIDATION
async function handleGenerate() {
  console.log('🪄 [CTA Generator] Generate clicked');
  const user = auth.currentUser; if (!user) { alert('⚠️ Silakan login dulu!'); return; }
  const jenjang = document.getElementById('cta-jenjang')?.value, kelas = document.getElementById('cta-kelas')?.value, semester = document.getElementById('cta-semester')?.value, mapel = document.getElementById('cta-mapel')?.value, sekolah = document.getElementById('kop-sekolah')?.value, tahun = document.getElementById('kop-tahun')?.value, guru = document.getElementById('cta-guru')?.value, topik = document.getElementById('cta-topik')?.value;
  
  // ✅ VALIDATE WITH SKEMA-COMPLIANT FUNCTION
  if (userRole !== 'admin') {
    const validation = validateInputWithFilter({ sekolah, jenjang, kelas, semester, mapel, topik }, { 
      jenjang_sekolah: userJenjangSekolah, 
      kelas_diampu: userKelasDiampu, 
      mapel_yang_diampu: userMapelDiampu, 
      sd_mapel_type: userSdMapelType,
      role: userRole
    });
    if (!validation.valid) { alert('⚠️ ' + validation.errors.join('\n')); return; }
  }
  
  const aiReady = await isAiReady(); if (!aiReady) { const userDoc = await getDoc(doc(db, 'users', user.uid)), isAdmin = userDoc.exists() && userDoc.data()?.role === 'admin'; if (isAdmin) alert('⚠️ Global API Key belum terdeteksi.'); else alert('⚠️ AI belum aktif. Hubungi admin.'); return; }
  
  const resultDiv = document.getElementById('cta-result'); if (resultDiv) resultDiv.classList.remove('hidden');
  
  document.getElementById('result-cp').textContent = `⏳ Generating CP...`; 
  document.getElementById('result-tp').textContent = `⏳ Generating TP...`; 
  document.getElementById('result-atp').textContent = `⏳ Generating ATP...`; 
  resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
  
  try {
    console.log('🤖 [CTA Generator] Calling AI...');
    const inputData = { sekolah, jenjang, kelas, semester, mapel, guru, topik, tahun }, result = await generateWithGroq(inputData);
    
    document.getElementById('result-cp').textContent = result.cp; 
    document.getElementById('result-tp').textContent = result.tp; 
    document.getElementById('result-atp').textContent = result.atp;
    
    console.log('✅ [CTA Generator] Generation complete!');
    
    // ✅ AUTO-SAVE TO ADM.PEMBELAJARAN
    try {
      const { storage } = await import('./adm-pembelajaran/storage.js');
      storage.setUserId(user.uid);
      
      const docData = {
        jenis: 'cta',
        jenjang: jenjang || '',
        kelas: kelas || '',
        mapel: mapel || '',
        judul: `${mapel?.toUpperCase() || 'CTA'} - Kelas ${kelas || ''} - ${topik || ''}`.trim(),
        konten: `CP:\n${result.cp}\n\nTP:\n${result.tp}\n\nATP:\n${result.atp}`,
        tags: ['cta', mapel?.toLowerCase()],
        source: 'cta-generator',
        metadata: { sekolah, tahun, guru, semester }
      };
      
      await storage.autoSaveFromExternal('cta-generator', docData);
      console.log('✅ [CTA Generator] Auto-save to Adm.Pembelajaran successful');
      
      const notification = document.createElement('div');
      notification.className = 'fixed bottom-4 right-4 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg z-50 animate-fade-in';
      notification.innerHTML = `<div class="flex items-center gap-2"><i class="fas fa-check-circle"></i><span>Tersimpan di Adm.Pembelajaran!</span></div>`;
      document.body.appendChild(notification);
      setTimeout(() => { notification.style.opacity = '0'; setTimeout(() => notification.remove(), 300); }, 3000);
      
    } catch (autoSaveError) {
      console.warn('⚠️ [CTA Generator] Auto-save skipped:', autoSaveError.message);
    }
    
  } catch (error) {
    console.error('❌ [CTA Generator] Error:', error);
    let errorMessage = error.message;
    if (error.message.includes('API key')) errorMessage = 'API Key tidak valid.';
    else if (error.message.includes('quota') || error.message.includes('429')) errorMessage = 'Limit AI harian habis.';
    else if (error.message.includes('koneksi') || error.message.includes('network')) errorMessage = 'Koneksi internet bermasalah.';
    
    document.getElementById('result-cp').textContent = `❌ Error: ${errorMessage}`; 
    document.getElementById('result-tp').textContent = ''; 
    document.getElementById('result-atp').textContent = '';
    
    alert('❌ Gagal generate:\n\n' + errorMessage);
  }
}

async function handleSave() {
  console.log('💾 [CTA Generator] Save clicked');
  const user = auth.currentUser; if (!user) { alert('⚠️ Silakan login dulu!'); return; }
  
  const cp = document.getElementById('result-cp')?.textContent || '', 
        tp = document.getElementById('result-tp')?.textContent || '', 
        atp = document.getElementById('result-atp')?.textContent || '';
        
  if (!cp || !tp || !atp || cp.includes('Error') || cp.includes('Loading') || cp.includes('⏳')) { alert('⚠️ Generate data dulu sebelum menyimpan!'); return; }
  
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid)), isAdmin = userDoc.exists() && userDoc.data()?.role === 'admin';
    await addDoc(collection(db, 'cp_tp_atp'), { 
      userId: user.uid, 
      userEmail: user.email, 
      userName: user.displayName || 'Guru', 
      sekolah: document.getElementById('kop-sekolah')?.value, 
      tahun: document.getElementById('kop-tahun')?.value, 
      jenjang: document.getElementById('cta-jenjang')?.value, 
      kelas: document.getElementById('cta-kelas')?.value, 
      semester: document.getElementById('cta-semester')?.value, 
      mapel: document.getElementById('cta-mapel')?.value, 
      guru: document.getElementById('cta-guru')?.value, 
      topik: document.getElementById('cta-topik')?.value, 
      mode: 'AI', 
      cp: cp, 
      tp: tp, 
      atp: atp, 
      createdAt: serverTimestamp(), 
      updatedAt: serverTimestamp(), 
      isAdmin: isAdmin 
    });
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

export async function autoSaveCTA(generatedContent, metadata) {
  console.log('💾 [CTA Generator] Auto-saving to Adm.Pembelajaran...');
  
  try {
    const { storage } = await import('./adm-pembelajaran/storage.js');
    const { auth } = await import('./firebase-config.js');
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      console.warn('⚠️ [CTA Generator] No authenticated user, skipping auto-save');
      return null;
    }
    
    storage.setUserId(currentUser.uid);
    
    const docData = {
      jenis: 'cta',
      jenjang: metadata.jenjang || '',
      kelas: metadata.kelas || '',
      mapel: metadata.mapel || '',
      judul: metadata.judul || `CTA ${metadata.mapel || ''} Kelas ${metadata.kelas || ''}`.trim(),
      konten: generatedContent,
      tags: metadata.tags || ['cta'],
      source: 'cta-generator',
      createdAt: new Date().toISOString()
    };    
    
    const savedDoc = await storage.autoSaveFromExternal('cta-generator', docData);
    
    console.log('✅ [CTA Generator] Auto-save successful:', savedDoc.id);
    
    if (typeof document !== 'undefined') {
      const notification = document.createElement('div');
      notification.className = 'fixed bottom-4 right-4 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg z-50 animate-fade-in';
      notification.innerHTML = `
        <div class="flex items-center gap-2">
          <i class="fas fa-check-circle"></i>
          <span>Tersimpan di Adm.Pembelajaran!</span>
        </div>
      `;
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    }
    
    return savedDoc;
    
  } catch (e) {
    console.error('❌ [CTA Generator] Auto-save error:', e.message);
    return null;
  }
}

console.log('🟢 [CTA Generator] READY — Fixed: Function Name + Container + Table Output + SKEMA COMPLIANT');
// ✅ SAFE PATCH: Filter dropdown mapel untuk Guru Mapel SD/MI
// Tidak mengubah fungsi existing, hanya tambah event listener
(function safeMapelFilter() {
  const filterMapel = () => {
    const select = document.getElementById('cta-mapel');
    if (!select) return;
    const jenjang = localStorage.getItem('user_jenjang');
    const sdType = (localStorage.getItem('user_sd_mapel_type') || '').toLowerCase();
    const mapelList = JSON.parse(localStorage.getItem('user_mapel_yang_diampu') || '[]');
    if (!['sd','mi'].includes(jenjang) || sdType === 'kelas') return;
    const target = (sdType || mapelList[0] || '').toLowerCase();
    if (!target) return;
    [...select.options].forEach(opt => {
      if (!opt.value) return;
      const nama = opt.value.toLowerCase();
      if (!nama.includes(target) && !target.includes(nama)) {
        opt.disabled = true; opt.style.display = 'none';
      }
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', filterMapel);
  else setTimeout(filterMapel, 500);
})();
