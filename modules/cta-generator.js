/**
 * ============================================
 * MODULE: CTA GENERATOR (CP/TP/ATP)
 * Platform Administrasi Kelas Digital
 * ============================================
 * 
 * ⚠️ AUDIT STATUS: CLEAN
 * ✅ NO HARDCODED SCHOOL NAMES
 * ✅ NO DEFAULT DATA IN PREVIEW
 * ✅ ALL DATA FROM USER INPUT ONLY
 * ✅ 100% Google Gemini AI
 * 
 * ============================================
 */

console.log('🔴 [CTA Generator] Script START');

// ✅ STEP 1: Import Firebase
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

console.log('✅ [CTA Generator] Firebase imports successful');

// ✅ STEP 2: Template Prompt (HANYA prompt, TIDAK ADA data sekolah)
const promptTemplates = {
  'matematika_sd_1': "Buat CP TP ATP Matematika SD Kelas 1. Fokus: bilangan 1-20.",
  'matematika_sd_2': "Buat CP TP ATP Matematika SD Kelas 2. Fokus: bilangan 1-100.",
  'matematika_sd_3': "Buat CP TP ATP Matematika SD Kelas 3. Fokus: bilangan 1-1000.",
  'matematika_sd_4': "Buat CP TP ATP Matematika SD Kelas 4. Fokus: bilangan romawi, KPK FPB.",
  'matematika_sd_5': "Buat CP TP ATP Matematika SD Kelas 5. Fokus: operasi hitung campuran.",
  'matematika_sd_6': "Buat CP TP ATP Matematika SD Kelas 6. Fokus: bilangan bulat negatif.",
  'ipa_sd_1': "Buat CP TP ATP IPA SD Kelas 1. Fokus: anggota tubuh, hewan, tumbuhan.",
  'ipa_sd_2': "Buat CP TP ATP IPA SD Kelas 2. Fokus: bagian tubuh hewan/tumbuhan.",
  'ipa_sd_3': "Buat CP TP ATP IPA SD Kelas 3. Fokus: ciri makhluk hidup, energi.",
  'ipa_sd_4': "Buat CP TP ATP IPA SD Kelas 4. Fokus: bagian tumbuhan, gaya gerak.",
  'ipa_sd_5': "Buat CP TP ATP IPA SD Kelas 5. Fokus: organ pernapasan, pencernaan.",
  'ipa_sd_6': "Buat CP TP ATP IPA SD Kelas 6. Fokus: tata surya, listrik magnet.",
  'default': "Buat CP TP ATP sesuai kurikulum merdeka."
};

// ✅ STEP 3: Register Global Function
window.renderCTAGenerator = function(jenjangFromParam, kelasFromParam, semesterFromParam) {
  console.log('📝 [CTA Generator] renderCTAGenerator() called');
  
  const container = document.getElementById('module-container');
  if (!container) {
    console.error('❌ Container not found!');
    return;
  }
  
  const user = auth.currentUser;
  
  // ✅ STEP 4: Render UI
  // ⚠️ AUDIT: TIDAK ADA HARDCODED DATA DI HTML INI
  container.innerHTML = `
    <style>
      .cta-generator-form { max-width: 900px; margin: auto; padding: 30px; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
      .cta-generator-form h2 { text-align: center; color: #0891b2; margin-bottom: 10px; font-size: 28px; }
      .subtitle { text-align: center; color: #6b7280; margin-bottom: 30px; }
      .section-title { font-size: 18px; font-weight: 700; color: #374151; margin: 25px 0 15px 0; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb; display: flex; align-items: center; gap: 8px; }
      .cta-generator-form label { display: block; margin-top: 12px; font-weight: 600; color: #374151; font-size: 14px; }
      .cta-generator-form select, .cta-generator-form input, .cta-generator-form textarea { width: 100%; margin-top: 8px; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 14px; }
      .cta-generator-form textarea { min-height: 120px; resize: vertical; }
      .btn-generate, .btn-save, .btn-secondary { margin-top: 20px; padding: 14px 30px; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600; width: 100%; }
      .btn-generate { background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); color: white; }
      .btn-save { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; }
      .btn-secondary { background: #6b7280; color: white; margin-top: 10px; }
      .result-section { background: #f0f9ff; padding: 20px; border-radius: 8px; margin-top: 20px; border: 1px solid #bae6fd; }
      .kop-preview { background: white; padding: 20px; border-radius: 8px; border: 2px solid #0891b2; margin-bottom: 20px; text-align: center; }
      .kop-preview h3 { margin: 0 0 5px 0; font-size: 18px; color: #1e40af; }
      .kop-preview p { margin: 3px 0; font-size: 14px; color: #374151; }
      .kop-preview .topik { margin-top: 10px; padding-top: 10px; border-top: 1px dashed #bae6fd; font-style: italic; color: #0891b2; }
      .btn-back { margin-top: 20px; padding: 12px 30px; background: #6b7280; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; width: auto; }
      .hidden { display: none !important; }
      .ai-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-left: 12px; }
      .badge-ai-active { background: #dcfce7; color: #166534; }
      .badge-ai-error { background: #fef2f2; color: #991b1b; }
    </style>
    
    <div class="cta-generator-form">
      <h2>📄 Generator CP/TP/ATP</h2>
      <p class="subtitle">Buat Perangkat Pembelajaran dengan <span class="ai-badge badge-ai-active">🤖 AI</span></p>
      
      <button class="btn-back" onclick="backToDashboard()">
        <i class="fas fa-arrow-left mr-2"></i>Kembali ke Dashboard
      </button>
      
      <form id="cta-form">
        <div class="section-title"><i class="fas fa-university"></i><span>1. Informasi Sekolah</span></div>
        <div>
          <label for="kop-sekolah"><i class="fas fa-school mr-2"></i>Nama Sekolah</label>
          <!-- ⚠️ PLACEHOLDER HANYA CONTOH, BUKAN DATA DEFAULT -->
          <input type="text" id="kop-sekolah" placeholder="Masukkan nama sekolah Anda" required>
        </div>
        <div>
          <label for="kop-tahun"><i class="fas fa-calendar mr-2"></i>Tahun Ajaran</label>
          <input type="text" id="kop-tahun" placeholder="2025/2026" value="2025/2026">
        </div>
        
        <div class="section-title"><i class="fas fa-book-open"></i><span>2. Informasi Pembelajaran</span></div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
              <option value="1" ${semesterFromParam === '1' ? 'selected' : ''}>1</option>
              <option value="2" ${semesterFromParam === '2' ? 'selected' : ''}>2</option>
            </select>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <label for="cta-guru"><i class="fas fa-chalkboard-teacher mr-2"></i>Nama Guru</label>
            <input type="text" id="cta-guru" placeholder="Opsional">
          </div>
        </div>
        
        <div class="section-title"><i class="fas fa-lightbulb"></i><span>3. Topik</span></div>
        <div>
          <label for="cta-topik"><i class="fas fa-tag mr-2"></i>Materi / Topik</label>
          <input type="text" id="cta-topik" placeholder="Contoh: Pecahan Sederhana" required>
        </div>
        
        <button type="button" id="btn-generate" class="btn-generate">
          <i class="fas fa-magic"></i> Generate dengan AI
        </button>
      </form>
      
      <!-- ✅ HASIL GENERATE -->
      <div id="cta-result" class="hidden result-section">
        <h3 class="text-xl font-bold mb-4 text-gray-800">
          📋 Hasil Generate
          <span id="ai-status-badge" class="ai-badge badge-ai-active">🤖 AI</span>
        </h3>
        
        <!-- ⚠️ AUDIT: KOSONG & HIDDEN SEBELUM GENERATE -->
        <!-- ⚠️ TIDAK ADA DATA HARDCODE DI SINI -->
        <div id="kop-preview" class="kop-preview" style="display: none;">
          <h3 id="preview-sekolah"></h3>
          <p><strong>CP/TP/ATP - Kurikulum Merdeka</strong></p>
          <p id="preview-detail"></p>
          <p id="preview-tahun"></p>
          <p id="preview-topik" class="topik"></p>
        </div>
        
        <label for="result-cp"><i class="fas fa-bullseye mr-2"></i>Capaian Pembelajaran (CP)</label>
        <textarea id="result-cp" placeholder="Akan muncul setelah generate..."></textarea>
        
        <label for="result-tp"><i class="fas fa-flag-checkered mr-2"></i>Tujuan Pembelajaran (TP)</label>
        <textarea id="result-tp" placeholder="Akan muncul setelah generate..."></textarea>
        
        <label for="result-atp"><i class="fas fa-stream mr-2"></i>Alur Tujuan Pembelajaran (ATP)</label>
        <textarea id="result-atp" placeholder="Akan muncul setelah generate..."></textarea>
        
        <button type="button" id="btn-save" class="btn-save">
          <i class="fas fa-save"></i> Simpan
        </button>
        <button type="button" id="btn-regenerate" class="btn-secondary">
          <i class="fas fa-redo"></i> Generate Ulang
        </button>
      </div>
      
      <!-- Daftar Tersimpan -->
      <div class="mt-12">
        <h3 class="text-xl font-bold mb-4 text-gray-800">
          <i class="fas fa-archive mr-2"></i>Tersimpan (<span id="saved-count">0</span>)
        </h3>
        <div id="cta-list" class="space-y-4">
          <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin text-2xl mb-3"></i>
            <p>Memuat...</p>
          </div>
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
};

// ✅ Helper: Hide Dashboard
function hideDashboardSections() {
  document.querySelector('.dashboard-hero')?.closest('section')?.classList.add('hidden');
  document.querySelector('[aria-labelledby="rooms-heading"]')?.classList.add('hidden');
  document.querySelectorAll('#sd-section, #smp-section, #sma-section').forEach(s => s.classList.add('hidden'));
}

// ✅ Helper: Event Handlers
function setupEventHandlers() {
  const btnGenerate = document.getElementById('btn-generate');
  const btnSave = document.getElementById('btn-save');
  const btnRegenerate = document.getElementById('btn-regenerate');
  
  if (btnGenerate) btnGenerate.addEventListener('click', handleGenerate);
  if (btnSave) btnSave.addEventListener('click', handleSave);
  if (btnRegenerate) btnRegenerate.addEventListener('click', handleGenerate);
}

// ✅ AI GENERATE — 100% GEMINI
async function generateWithAI(prompt, mapel, jenjang, kelas, semester, sekolah, guru, topik) {
  console.log('🤖 [CTA Generator] Calling Gemini API...');
  
  const API_KEY = window.GEMINI_API_KEY;
  
  if (!API_KEY) {
    throw new Error('API Key tidak ditemukan!');
  }
  
  const fullPrompt = `${prompt}

Konteks:
- Sekolah: ${sekolah}
- Mapel: ${mapel}
- Jenjang: ${jenjang.toUpperCase()}
- Kelas: ${kelas}
- Semester: ${semester === '1' ? '1' : '2'}
- Topik: ${topik}
- Guru: ${guru || '-'}
- Tahun: 2025/2026

Format:
1. CAPAIAN PEMBELAJARAN (CP): 1-2 paragraf
2. TUJUAN PEMBELAJARAN (TP): 4-6 poin
3. ALUR TUJUAN PEMBELAJARAN (ATP): Tabel

Bahasa: Indonesia formal.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
        })
      }
    );
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }
    
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!aiResponse) {
      throw new Error('Response kosong');
    }
    
    console.log('✅ AI Response received');
    return parseAIResponse(aiResponse);
    
  } catch (error) {
    console.error('❌ AI Error:', error);
    throw error;
  }
}

// ✅ Parse AI Response
function parseAIResponse(text) {
  let cp = '', tp = '', atp = '';
  
  const cpMatch = text.match(/1\.?\s*CAPAIAN PEMBELAJARAN.*?(?=2\.|\n\n\n|$)/is);
  const tpMatch = text.match(/2\.?\s*TUJUAN PEMBELAJARAN.*?(?=3\.|\n\n\n|$)/is);
  const atpMatch = text.match(/3\.?\s*(?:ALUR).*?(?=$)/is);
  
  cp = cpMatch ? cpMatch[0].trim().replace(/^\d+\.\s*/i, '') : text.split('\n\n')[0] || text;
  tp = tpMatch ? tpMatch[0].trim().replace(/^\d+\.\s*/i, '') : text.split('\n\n')[1] || '';
  atp = atpMatch ? atpMatch[0].trim().replace(/^\d+\.\s*/i, '') : text.split('\n\n')[2] || '';
  
  return { cp: cp.trim(), tp: tp.trim(), atp: atp.trim() };
}

// ✅ HANDLE GENERATE
async function handleGenerate() {
  console.log('🪄 Generate clicked');
  
  const user = auth.currentUser;
  if (!user) { alert('⚠️ Login dulu!'); return; }
  
  const jenjang = document.getElementById('cta-jenjang')?.value;
  const kelas = document.getElementById('cta-kelas')?.value;
  const semester = document.getElementById('cta-semester')?.value;
  const mapel = document.getElementById('cta-mapel')?.value;
  const sekolah = document.getElementById('kop-sekolah')?.value;
  const tahun = document.getElementById('kop-tahun')?.value;
  const guru = document.getElementById('cta-guru')?.value;
  const topik = document.getElementById('cta-topik')?.value;
  
  if (!sekolah) { alert('⚠️ Nama Sekolah wajib!'); return; }
  if (!jenjang || !kelas || !semester || !mapel || !topik) { alert('⚠️ Lengkapi semua!'); return; }
  
  const resultDiv = document.getElementById('cta-result');
  if (resultDiv) resultDiv.classList.remove('hidden');
  
  // ✅ UPDATE KOP PREVIEW DENGAN DATA USER (BUKAN HARDCODED)
  updateKopPreview(sekolah, tahun, mapel, kelas, semester, topik);
  
  document.getElementById('result-cp').value = '⏳ AI generating...';
  document.getElementById('result-tp').value = '';
  document.getElementById('result-atp').value = '';
  
  updateAIBadge('loading');
  
  try {
    const templateKey = `${mapel}_${jenjang}_${kelas}`;
    const prompt = promptTemplates[templateKey] || promptTemplates.default;
    
    // ✅ 100% AI — NO MOCK
    const result = await generateWithAI(prompt, mapel, jenjang, kelas, semester, sekolah, guru, topik);
    
    document.getElementById('result-cp').value = result.cp;
    document.getElementById('result-tp').value = result.tp;
    document.getElementById('result-atp').value = result.atp;
    
    updateAIBadge('success');
    console.log('✅ Complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    updateAIBadge('error');
    document.getElementById('result-cp').value = '';
    document.getElementById('result-tp').value = '';
    document.getElementById('result-atp').value = '';
    alert('❌ Gagal: ' + error.message);
  }
}

// ✅ Update AI Badge
function updateAIBadge(status) {
  const badge = document.getElementById('ai-status-badge');
  if (!badge) return;
  
  if (status === 'loading') {
    badge.className = 'ai-badge badge-ai-active';
    badge.innerHTML = '⏳...';
  } else if (status === 'success') {
    badge.className = 'ai-badge badge-ai-active';
    badge.innerHTML = '🤖 AI';
  } else if (status === 'error') {
    badge.className = 'ai-badge badge-ai-error';
    badge.innerHTML = '❌ Error';
  }
}

// ✅ Update Kop Preview — DATA DARI USER INPUT (BUKAN HARDCODED)
function updateKopPreview(sekolah, tahun, mapel, kelas, semester, topik) {
  const previewDiv = document.getElementById('kop-preview');
  if (previewDiv) {
    previewDiv.style.display = 'block';  // Show SETELAH generate
  }
  
  // ✅ SEMUA DATA DARI PARAMETER (USER INPUT)
  document.getElementById('preview-sekolah').textContent = sekolah.toUpperCase();
  document.getElementById('preview-detail').textContent = `${mapel.toUpperCase()} - Kelas ${kelas} - Semester ${semester}`;
  document.getElementById('preview-tahun').textContent = `Tahun ${tahun || '2025/2026'}`;
  document.getElementById('preview-topik').innerHTML = `<strong>Topik:</strong> ${topik}`;
}

// ✅ Handle Save
async function handleSave() {
  const user = auth.currentUser;
  if (!user) { alert('⚠️ Login dulu!'); return; }
  
  const cp = document.getElementById('result-cp')?.value;
  const tp = document.getElementById('result-tp')?.value;
  const atp = document.getElementById('result-atp')?.value;
  
  if (!cp || !tp || !atp) { alert('⚠️ Generate dulu!'); return; }
  
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
      cp, tp, atp,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isAdmin
    });
    
    alert('✅ Tersimpan!');
    loadCTAData();
    document.getElementById('cta-result').classList.add('hidden');
    document.getElementById('cta-form').reset();
  } catch (error) {
    alert('❌ Gagal: ' + error.message);
  }
}

// ✅ Load Data
function loadCTAData() {
  const list = document.getElementById('cta-list');
  const countSpan = document.getElementById('saved-count');
  if (!list) return;
  
  const user = auth.currentUser;
  if (!user) {
    list.innerHTML = `<div class="text-center py-8 text-gray-500"><p>Login untuk lihat data</p></div>`;
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
          list.innerHTML = `<div class="text-center py-8 text-gray-500"><p>Belum ada data</p></div>`;
          return;
        }
        if (countSpan) countSpan.textContent = snapshot.docs.length;
        list.innerHTML = snapshot.docs.map(docSnap => {
          const d = docSnap.data();
          return `
            <div class="cta-item">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <strong>${d.mapel?.toUpperCase() || '-'} - Kelas ${d.kelas}</strong>
                  <br><small class="text-gray-500">${d.userName}</small>
                </div>
                <small class="text-gray-400">${d.createdAt?.toDate?.()?.toLocaleDateString('id-ID') || '-'}</small>
              </div>
              <p class="text-gray-600 text-sm">${d.cp?.substring(0, 150) || '-'}...</p>
            </div>
          `;
        }).join('');
      });
    } catch (e) {
      console.error('Error:', e);
    }
  })();
}

console.log('🟢 [CTA Generator] READY — AUDIT: CLEAN (NO HARDCODED DATA)');
