/**
 * ============================================
 * MODULE: CTA GENERATOR (CP/TP/ATP)
 * Platform Administrasi Kelas Digital
 * ============================================
 * FITUR:
 * - AI-ONLY: 100% menggunakan Groq AI
 * - NO Mock JSON fallback
 * - Simple & clean code
 * - Clear error messages
 * ============================================
 */

console.log('🔴 [CTA Generator] Script START — AI-ONLY MODE');

// ✅ IMPORT MODULES
import {
  hasGroqApiKey,
  generateWithGroq
} from './groq-api.js';

import { 
  validateInput
} from './cta-templates.js';

import { 
  db, 
  auth, 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  doc,
  getDoc,
  serverTimestamp 
} from './firebase-config.js';

console.log('✅ [CTA Generator] All imports successful');

// ✅ REGISTER GLOBAL FUNCTION
window.renderCTAGenerator = function(jenjangFromParam, kelasFromParam, semesterFromParam) {
  console.log('📝 [CTA Generator] renderCTAGenerator() called');
  
  const container = document.getElementById('module-container');
  if (!container) { console.error('❌ Container not found!'); return; }
  
  const user = auth.currentUser;
  
  // ✅ AMBIL DATA DARI MODAL (LOCALSTORAGE)
  const userNama = localStorage.getItem('user_nama_lengkap') || '';
  const userSekolah = localStorage.getItem('user_nama_sekolah') || '';
  const groqKeyExists = hasGroqApiKey();
  
  console.log('👤 [CTA Generator] User ', { userNama, userSekolah });
  console.log('🔑 [CTA Generator] Has Groq Key:', groqKeyExists);
  
  container.innerHTML = `
    <style>
      .cta-generator-form { max-width: 950px; margin: auto; padding: 30px; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
      .cta-generator-form h2 { text-align: center; color: #0891b2; margin-bottom: 10px; font-size: 28px; }
      .subtitle { text-align: center; color: #6b7280; margin-bottom: 30px; }
      .section-title { font-size: 18px; font-weight: 700; color: #374151; margin: 25px 0 15px 0; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb; display: flex; align-items: center; gap: 8px; }
      .cta-generator-form label { display: block; margin-top: 12px; font-weight: 600; color: #374151; font-size: 14px; }
      .cta-generator-form select, .cta-generator-form input, .cta-generator-form textarea { width: 100%; margin-top: 8px; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 14px; font-family: inherit; }
      .cta-generator-form textarea { min-height: 120px; resize: vertical; line-height: 1.6; }
      .btn-generate, .btn-save, .btn-secondary { margin-top: 20px; padding: 14px 30px; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600; width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; }
      .btn-generate { background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); color: white; }
      .btn-generate:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(8,145,178,0.3); }
      .btn-save { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; }
      .btn-save:hover { background: linear-gradient(135deg, #059669 0%, #047857 100%); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(16,185,129,0.3); }
      .btn-secondary { background: #6b7280; color: white; margin-top: 10px; }
      .btn-secondary:hover { background: #4b5563; transform: translateY(-2px); }
      .btn-back { margin-top: 20px; padding: 12px 30px; background: #6b7280; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; width: auto; }
      .btn-back:hover { background: #4b5563; }
      .hidden { display: none !important; }
      .auto-filled { background: #f0fdf4; border-color: #10b981 !important; }
      .grid-cols-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
      .grid-cols-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
      @media (max-width: 768px) { .grid-cols-2, .grid-cols-3 { grid-template-columns: 1fr; } }
      #result-cp, #result-tp, #result-atp { width: 100%; min-height: 200px; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; font-family: monospace; font-size: 13px; line-height: 1.5; white-space: pre-wrap; margin-top: 8px; }
      .loading-spinner { text-align: center; padding: 40px; color: #6b7280; }
      .cta-item { background: white; padding: 20px; margin-top: 15px; border-radius: 8px; border-left: 4px solid #0891b2; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
      .mode-badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-left: 12px; background: #dcfce7; color: #166534; }
      .api-warning { background: #fef3c7; padding: 16px; border-radius: 8px; margin-bottom: 20px; color: #92400e; font-size: 13px; border-left: 4px solid #f59e0b; }
    </style>
    
    <div class="cta-generator-form">
      <h2>📄 Generator CP/TP/ATP</h2>
      <p class="subtitle">
        Buat Perangkat Pembelajaran dengan AI
        <span class="mode-badge">🤖 Groq AI Mode</span>
      </p>
      
      ${!groqKeyExists ? `
        <div class="api-warning">
          <strong>⚠️ Groq API Key Tidak Ditemukan</strong><br><br>
          Silakan input API key di modal profil untuk menggunakan generator ini.<br><br>
          <strong>Cara mendapatkan API key gratis:</strong><br>
          1. Buka <a href="https://console.groq.com/keys" target="_blank" style="color:#0891b2;text-decoration:underline;">console.groq.com/keys</a><br>
          2. Login dengan Google/GitHub<br>
          3. Klik "Create API Key"<br>
          4. Copy key (dimulai dengan gsk_...)<br>
          5. Clear localStorage: <code style="background:#fbbf24;padding:2px 6px;border-radius:4px;">localStorage.clear()</code><br>
          6. Refresh halaman dan input key di modal
        </div>
      ` : '<p style="background:#dcfce7;padding:12px;border-radius:8px;margin-bottom:20px;color:#166534;font-size:13px;">✅ Groq API key terdeteksi — AI siap digunakan!</p>'}
      
      <button class="btn-back" onclick="backToDashboard()">
        <i class="fas fa-arrow-left mr-2"></i>Kembali ke Dashboard
      </button>
      
      <form id="cta-form">
        <div class="section-title"><i class="fas fa-university"></i><span>1. Informasi Sekolah (Auto-Fill)</span></div>
        
        <div>
          <label for="kop-sekolah"><i class="fas fa-school mr-2"></i>Nama Sekolah</label>
          <input type="text" id="kop-sekolah" placeholder="Masukkan nama sekolah" value="${userSekolah}" class="${userSekolah ? 'auto-filled' : ''}" required>
          ${userSekolah ? '<p style="font-size:11px;color:#10b981;margin-top:4px;">✅ Auto-filled dari modal (bisa diedit)</p>' : ''}
        </div>
        
        <div class="grid-cols-2">
          <div>
            <label for="kop-tahun"><i class="fas fa-calendar mr-2"></i>Tahun Ajaran</label>
            <input type="text" id="kop-tahun" placeholder="2025/2026" value="2025/2026">
          </div>
          <div>
            <label for="cta-guru"><i class="fas fa-chalkboard-teacher mr-2"></i>Nama Guru</label>
            <input type="text" id="cta-guru" placeholder="Opsional" value="${userNama}" class="${userNama ? 'auto-filled' : ''}">
            ${userNama ? '<p style="font-size:11px;color:#10b981;margin-top:4px;">✅ Auto-filled dari modal (bisa diedit)</p>' : ''}
          </div>
        </div>
        
        <div class="section-title"><i class="fas fa-book-open"></i><span>2. Informasi Pembelajaran</span></div>
        
        <div class="grid-cols-3">
          <div>
            <label for="cta-jenjang"><i class="fas fa-school mr-2"></i>Jenjang</label>
            <select id="cta-jenjang" required>
              <option value="">Pilih</option>
              <option value="sd" ${jenjangFromParam === 'sd' ? 'selected' : ''}>SD</option>
              <option value="smp" ${jenjangFromParam === 'smp' ? 'selected' : ''}>SMP</option>
              <option value="sma" ${jenjangFromParam === 'sma' ? 'selected' : ''}>SMA</option>
            </select>
          </div>
          <div>
            <label for="cta-kelas"><i class="fas fa-users mr-2"></i>Kelas</label>
            <select id="cta-kelas" required>
              <option value="">Pilih</option>
              <option value="1" ${kelasFromParam === '1' ? 'selected' : ''}>1</option>
              <option value="2" ${kelasFromParam === '2' ? 'selected' : ''}>2</option>
              <option value="3" ${kelasFromParam === '3' ? 'selected' : ''}>3</option>
              <option value="4" ${kelasFromParam === '4' ? 'selected' : ''}>4</option>
              <option value="5" ${kelasFromParam === '5' ? 'selected' : ''}>5</option>
              <option value="6" ${kelasFromParam === '6' ? 'selected' : ''}>6</option>
              <option value="7" ${kelasFromParam === '7' ? 'selected' : ''}>7</option>
              <option value="8" ${kelasFromParam === '8' ? 'selected' : ''}>8</option>
              <option value="9" ${kelasFromParam === '9' ? 'selected' : ''}>9</option>
              <option value="10" ${kelasFromParam === '10' ? 'selected' : ''}>10</option>
              <option value="11" ${kelasFromParam === '11' ? 'selected' : ''}>11</option>
              <option value="12" ${kelasFromParam === '12' ? 'selected' : ''}>12</option>
            </select>
          </div>
          <div>
            <label for="cta-semester"><i class="fas fa-clock mr-2"></i>Semester</label>
            <select id="cta-semester" required>
              <option value="">Pilih</option>
              <option value="1" ${semesterFromParam === '1' ? 'selected' : ''}>1 (Ganjil)</option>
              <option value="2" ${semesterFromParam === '2' ? 'selected' : ''}>2 (Genap)</option>
            </select>
          </div>
        </div>
        
        <div class="grid-cols-2">
          <div>
            <label for="cta-mapel"><i class="fas fa-book mr-2"></i>Mata Pelajaran</label>
            <select id="cta-mapel" required>
              <option value="">Pilih</option>
              <option value="matematika">Matematika</option>
              <option value="ipas">IPAS</option>
              <option value="bahasa-indonesia">Bahasa Indonesia</option>
              <option value="pjok">PJOK</option>
              <option value="seni-budaya">Seni Budaya</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>
          <div>
            <label for="cta-topik"><i class="fas fa-tag mr-2"></i>Topik/Materi</label>
            <input type="text" id="cta-topik" placeholder="Contoh: Bilangan 1-20" required>
          </div>
        </div>
        
        <button type="button" id="btn-generate" class="btn-generate">
          <i class="fas fa-magic"></i> Generate dengan AI
        </button>
      </form>
      
      <div id="cta-result" class="hidden result-section">
        <h3 class="text-xl font-bold mb-4 text-gray-800">📋 Hasil Generate</h3>
        
        <label for="result-cp"><i class="fas fa-bullseye mr-2"></i>Capaian Pembelajaran (CP)</label>
        <textarea id="result-cp" placeholder="CP akan muncul setelah generate..." readonly></textarea>
        
        <label for="result-tp"><i class="fas fa-flag-checkered mr-2"></i>Tujuan Pembelajaran (TP)</label>
        <textarea id="result-tp" placeholder="TP akan muncul setelah generate..." readonly></textarea>
        
        <label for="result-atp"><i class="fas fa-stream mr-2"></i>Alur Tujuan Pembelajaran (ATP)</label>
        <textarea id="result-atp" placeholder="ATP akan muncul setelah generate..." readonly></textarea>
        
        <div style="display: flex; gap: 12px; margin-top: 16px;">
          <button type="button" id="btn-save" class="btn-save" style="flex: 2;">
            <i class="fas fa-save"></i> Simpan ke Firestore
          </button>
          <button type="button" id="btn-regenerate" class="btn-secondary" style="flex: 1;">
            <i class="fas fa-redo"></i> Generate Ulang
          </button>
        </div>
      </div>
      
      <div class="mt-12">
        <h3 class="text-xl font-bold mb-4 text-gray-800">
          <i class="fas fa-archive mr-2"></i>CP/TP/ATP Tersimpan (<span id="saved-count">0</span>)
        </h3>
        <div id="cta-list" class="space-y-4">
          <div class="loading-spinner"><i class="fas fa-spinner fa-spin text-2xl mb-3"></i><p>Memuat...</p></div>
        </div>
      </div>
    </div>
  `;
  
  hideDashboardSections();
  container.classList.remove('hidden');
  
  if (user) {
    setupEventHandlers();
    loadCTAData();
  }
  
  console.log('✅ [CTA Generator] UI rendered — AI-ONLY MODE');
};

// ✅ HELPER: Hide Dashboard Sections
function hideDashboardSections() {
  document.querySelector('.dashboard-hero')?.closest('section')?.classList.add('hidden');
  document.querySelector('[aria-labelledby="rooms-heading"]')?.classList.add('hidden');
  document.querySelectorAll('#sd-section, #smp-section, #sma-section').forEach(s => s.classList.add('hidden'));
}

// ✅ HELPER: Setup Event Handlers
function setupEventHandlers() {
  const btnGenerate = document.getElementById('btn-generate');
  const btnSave = document.getElementById('btn-save');
  const btnRegenerate = document.getElementById('btn-regenerate');
  
  if (btnGenerate) btnGenerate.addEventListener('click', handleGenerate);
  if (btnSave) btnSave.addEventListener('click', handleSave);
  if (btnRegenerate) btnRegenerate.addEventListener('click', handleGenerate);
}

// ✅ HANDLE GENERATE — AI-ONLY (NO FALLBACK)
async function handleGenerate() {
  console.log('🪄 [CTA Generator] Generate clicked');
  
  const user = auth.currentUser;
  if (!user) { alert('⚠️ Silakan login dulu!'); return; }
  
  // ✅ Get form values
  const jenjang = document.getElementById('cta-jenjang')?.value;
  const kelas = document.getElementById('cta-kelas')?.value;
  const semester = document.getElementById('cta-semester')?.value;
  const mapel = document.getElementById('cta-mapel')?.value;
  const sekolah = document.getElementById('kop-sekolah')?.value;
  const tahun = document.getElementById('kop-tahun')?.value;
  const guru = document.getElementById('cta-guru')?.value;
  const topik = document.getElementById('cta-topik')?.value;
  
  // ✅ Validate input
  const validation = validateInput({ sekolah, jenjang, kelas, semester, mapel, topik });
  if (!validation.valid) {
    alert('⚠️ ' + validation.errors.join('\n'));
    return;
  }
  
  // ✅ Check API Key
  const groqKeyExists = hasGroqApiKey();
  if (!groqKeyExists) {
    alert('⚠️ Groq API Key tidak ditemukan!\n\nSilakan input API key di modal profil pertama kali login.');
    return;
  }
  
  const resultDiv = document.getElementById('cta-result');
  if (resultDiv) resultDiv.classList.remove('hidden');
  
  // ✅ Show loading state
  document.getElementById('result-cp').value = `⏳ Generating CP dengan Groq AI...`;
  document.getElementById('result-tp').value = `⏳ Generating TP dengan Groq AI...`;
  document.getElementById('result-atp').value = `⏳ Generating ATP dengan Groq AI...`;
  resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
  
  try {
    console.log('🤖 [CTA Generator] Calling Groq API...');
    
    const inputData = { sekolah, jenjang, kelas, semester, mapel, guru, topik, tahun };
    const result = await generateWithGroq(inputData);
    
    // ✅ Display results
    document.getElementById('result-cp').value = result.cp;
    document.getElementById('result-tp').value = result.tp;
    document.getElementById('result-atp').value = result.atp;
    
    console.log('✅ [CTA Generator] AI generation complete!');
    console.log('📊 Result:', { cpLength: result.cp.length, tpLength: result.tp.length, atpLength: result.atp.length });
    
  } catch (error) {
    console.error('❌ [CTA Generator] Groq API Error:', error);
    
    let errorMessage = error.message;
    
    // ✅ User-friendly error messages
    if (error.message.includes('API key')) {
      errorMessage = 'Groq API Key tidak valid. Silakan input ulang di modal profil.';
    } else if (error.message.includes('quota') || error.message.includes('rate limit')) {
      errorMessage = 'Quota Groq API habis (14,400 req/hari). Tunggu 24 jam atau gunakan API key baru.';
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      errorMessage = 'Koneksi internet bermasalah. Cek koneksi Anda.';
    }
    
    document.getElementById('result-cp').value = `❌ Error: ${errorMessage}`;
    document.getElementById('result-tp').value = '';
    document.getElementById('result-atp').value = '';
    
    alert('❌ Gagal generate dengan Groq AI:\n\n' + errorMessage + '\n\nSilakan cek console (F12) untuk detail error.');
  }
}

// ✅ HANDLE SAVE TO FIRESTORE
async function handleSave() {
  console.log('💾 [CTA Generator] Save clicked');
  
  const user = auth.currentUser;
  if (!user) { alert('⚠️ Silakan login dulu!'); return; }
  
  const cp = document.getElementById('result-cp')?.value;
  const tp = document.getElementById('result-tp')?.value;
  const atp = document.getElementById('result-atp')?.value;
  
  if (!cp || !tp || !atp || cp.includes('Error') || cp.includes('Loading') || cp.includes('⏳')) {
    alert('⚠️ Generate data dulu sebelum menyimpan!');
    return;
  }
  
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const isAdmin = userDoc.exists() && userDoc.data()?.role === 'admin';
    
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
      mode: 'AI (Groq)',
      cp: cp,
      tp: tp,
      atp: atp,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isAdmin: isAdmin
    });
    
    console.log('✅ [CTA Generator] Data saved!');
    alert('✅ CP/TP/ATP berhasil disimpan!');
    loadCTAData();
    document.getElementById('cta-result').classList.add('hidden');
    document.getElementById('cta-form').reset();
  } catch (error) {
    console.error('❌ [CTA Generator] Save error:', error);
    alert('❌ Gagal simpan: ' + error.message);
  }
}

// ✅ LOAD CTA DATA FROM FIRESTORE
function loadCTAData() {
  const list = document.getElementById('cta-list');
  const countSpan = document.getElementById('saved-count');
  if (!list) { console.error('❌ List container not found!'); return; }
  
  const user = auth.currentUser;
  if (!user) {
    list.innerHTML = `<div class="text-center py-8 text-gray-500"><p>Silakan login untuk melihat data</p></div>`;
    return;
  }
  
  (async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const isAdmin = userDoc.exists() && userDoc.data()?.role === 'admin';
      
      let q;
      if (isAdmin) {
        q = query(collection(db, 'cp_tp_atp'), orderBy('createdAt', 'desc'));
      } else {
        q = query(collection(db, 'cp_tp_atp'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
      }
      
      onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
          list.innerHTML = `<div class="text-center py-8 text-gray-500"><p>Belum ada CP/TP/ATP tersimpan</p></div>`;
          return;
        }
        if (countSpan) countSpan.textContent = snapshot.docs.length;
        list.innerHTML = snapshot.docs.map(docSnap => {
          const d = docSnap.data();
          const date = d.createdAt?.toDate?.()?.toLocaleString('id-ID') || '-';
          const modeBadge = d.mode ? `<span style="background:#dbeafe;color:#1e40af;padding:2px 8px;border-radius:10px;font-size:10px;">${d.mode}</span>` : '';
          return `
            <div class="cta-item">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <strong class="text-lg">${d.mapel?.toUpperCase() || '-'} - Kelas ${d.kelas}</strong>
                  ${modeBadge}
                  <br><small class="text-gray-500">${d.userName} • ${d.sekolah || '-'}</small>
                </div>
                <small class="text-gray-400">${date}</small>
              </div>
              <p class="text-gray-700 mt-2"><strong>📋 Topik:</strong> ${d.topik || '-'}</p>
              <p class="text-gray-600 text-sm">${d.cp?.substring(0, 150) || '-'}...</p>
            </div>
          `;
        }).join('');
      });
    } catch (e) {
      console.error('❌ [CTA Generator] Load error:', e);
    }
  })();
}

console.log('🟢 [CTA Generator] READY — AI-ONLY MODE (100% Groq AI)');
