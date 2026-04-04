/**
 * ============================================
 * MODULE: CTA GENERATOR (CP/TP/ATP)
 * Platform Administrasi Kelas Digital
 * ============================================
 * Fitur:
 * - Generate CP, TP, ATP dengan AI (Gemini) + Fallback Mock
 * - 1 Engine untuk semua mapel & kelas
 * - Isolasi data (userId-based)
 * - Admin bypass untuk monitoring
 * - Auto-fill jenjang, kelas, semester dari parameter
 * ============================================
 */

console.log('🔴 [CTA Generator] Script START');

// ✅ STEP 1: Import Firebase
import { 
  db, 
  auth, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  doc,
  getDoc,
  serverTimestamp 
} from './firebase-config.js';

console.log('✅ [CTA Generator] Firebase imports successful');

// ✅ STEP 2: Template Prompt (SD - MVP)
const promptTemplates = {
  // Matematika SD
  'matematika_sd_1': "Buat CP TP ATP Matematika SD Kelas 1. Fokus: bilangan 1-20, penjumlahan pengurangan dasar.",
  'matematika_sd_2': "Buat CP TP ATP Matematika SD Kelas 2. Fokus: bilangan 1-100, perkalian pembagian dasar.",
  'matematika_sd_3': "Buat CP TP ATP Matematika SD Kelas 3. Fokus: bilangan 1-1000, pecahan sederhana.",
  'matematika_sd_4': "Buat CP TP ATP Matematika SD Kelas 4. Fokus: bilangan romawi, KPK FPB, pecahan desimal.",
  'matematika_sd_5': "Buat CP TP ATP Matematika SD Kelas 5. Fokus: operasi hitung campuran, pecahan persen.",
  'matematika_sd_6': "Buat CP TP ATP Matematika SD Kelas 6. Fokus: bilangan bulat negatif, sistem koordinat.",
  
  // IPA SD
  'ipa_sd_1': "Buat CP TP ATP IPA SD Kelas 1. Fokus: pengenalan anggota tubuh, hewan dan tumbuhan.",
  'ipa_sd_2': "Buat CP TP ATP IPA SD Kelas 2. Fokus: bagian tubuh hewan/tumbuhan, daur hidup.",
  'ipa_sd_3': "Buat CP TP ATP IPA SD Kelas 3. Fokus: ciri-ciri makhluk hidup, energi.",
  'ipa_sd_4': "Buat CP TP ATP IPA SD Kelas 4. Fokus: bagian tumbuhan, gaya dan gerak.",
  'ipa_sd_5': "Buat CP TP ATP IPA SD Kelas 5. Fokus: organ pernapasan, sistem pencernaan.",
  'ipa_sd_6': "Buat CP TP ATP IPA SD Kelas 6. Fokus: sistem tata surya, listrik dan magnet.",
  
  // Default
  'default': "Buat CP TP ATP untuk {mapel} Kelas {kelas}. Sesuaikan dengan kurikulum merdeka."
};

// ✅ STEP 3: Register Global Function (WITH AUTO-FILL PARAMETERS)
window.renderCTAGenerator = function(jenjangFromParam, kelasFromParam, semesterFromParam) {
  console.log('📝 [CTA Generator] renderCTAGenerator() called');
  console.log('📝 [CTA Generator] Params:', jenjangFromParam, kelasFromParam, semesterFromParam);
  
  const container = document.getElementById('module-container');
  
  if (!container) {
    console.error('❌ [CTA Generator] Container #module-container NOT FOUND!');
    alert('Error: Container tidak ditemukan di HTML!');
    return;
  }
  
  console.log('✅ [CTA Generator] Container found');
  
  const user = auth.currentUser;
  console.log('👤 [CTA Generator] Current user:', user?.email || 'Not logged in');
  
  // ✅ STEP 4: Render UI (WITH AUTO-FILL)
  container.innerHTML = `
    <style>
      .cta-generator-form {
        max-width: 900px;
        margin: auto;
        padding: 30px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .cta-generator-form h2 {
        text-align: center;
        color: #0891b2;
        margin-bottom: 10px;
        font-size: 28px;
      }
      .cta-generator-form .subtitle {
        text-align: center;
        color: #6b7280;
        margin-bottom: 30px;
      }
      .section-title {
        font-size: 18px;
        font-weight: 700;
        color: #374151;
        margin: 25px 0 15px 0;
        padding-bottom: 8px;
        border-bottom: 2px solid #e5e7eb;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .cta-generator-form label {
        display: block;
        margin-top: 12px;
        font-weight: 600;
        color: #374151;
        font-size: 14px;
      }
      .cta-generator-form select,
      .cta-generator-form input,
      .cta-generator-form textarea {
        width: 100%;
        margin-top: 8px;
        padding: 12px;
        border-radius: 8px;
        border: 1px solid #d1d5db;
        font-size: 14px;
        font-family: inherit;
        transition: border-color 0.2s;
      }
      .cta-generator-form select:focus,
      .cta-generator-form input:focus,
      .cta-generator-form textarea:focus {
        outline: none;
        border-color: #0891b2;
        box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.1);
      }
      .cta-generator-form textarea {
        min-height: 120px;
        resize: vertical;
        line-height: 1.6;
      }
      .btn-generate,
      .btn-save,
      .btn-secondary {
        margin-top: 20px;
        padding: 14px 30px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 16px;
        font-weight: 600;
        width: 100%;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      .btn-generate {
        background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%);
        color: white;
      }
      .btn-generate:hover {
        background: linear-gradient(135deg, #0e7490 0%, #155e75 100%);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(8, 145, 178, 0.3);
      }
      .btn-save {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
      }
      .btn-save:hover {
        background: linear-gradient(135deg, #059669 0%, #047857 100%);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      }
      .btn-secondary {
        background: #6b7280;
        color: white;
        margin-top: 10px;
      }
      .btn-secondary:hover {
        background: #4b5563;
        transform: translateY(-2px);
      }
      .cta-item {
        background: white;
        padding: 20px;
        margin-top: 15px;
        border-radius: 8px;
        border-left: 4px solid #0891b2;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        transition: transform 0.2s;
      }
      .cta-item:hover {
        transform: translateX(4px);
      }
      .cta-badge {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
        margin-right: 8px;
        margin-top: 8px;
      }
      .badge-mapel { background: #dbeafe; color: #1e40af; }
      .badge-kelas { background: #dcfce7; color: #166534; }
      .badge-jenjang { background: #fef3c7; color: #92400e; }
      .badge-semester { background: #f3e8ff; color: #7e22ce; }
      .loading-spinner {
        text-align: center;
        padding: 40px;
        color: #6b7280;
      }
      .result-section {
        background: #f0f9ff;
        padding: 20px;
        border-radius: 8px;
        margin-top: 20px;
        border: 1px solid #bae6fd;
      }
      .kop-preview {
        background: white;
        padding: 20px;
        border-radius: 8px;
        border: 2px solid #0891b2;
        margin-bottom: 20px;
        text-align: center;
      }
      .kop-preview h3 {
        margin: 0 0 5px 0;
        font-size: 18px;
        color: #1e40af;
      }
      .kop-preview p {
        margin: 3px 0;
        font-size: 14px;
        color: #374151;
      }
      .kop-preview .topik {
        margin-top: 10px;
        padding-top: 10px;
        border-top: 1px dashed #bae6fd;
        font-style: italic;
        color: #0891b2;
      }
      .btn-back {
        margin-top: 20px;
        padding: 12px 30px;
        background: #6b7280;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 16px;
        width: auto;
      }
      .btn-back:hover {
        background: #4b5563;
      }
      .hidden { display: none !important; }
      @media (max-width: 768px) {
        .cta-generator-form { margin: 20px; padding: 20px; }
        .grid-cols-3, .grid-cols-2 { grid-template-columns: 1fr; }
      }
    </style>
    
    <div class="cta-generator-form">
      <h2>📄 Generator CP/TP/ATP</h2>
      <p class="subtitle">Buat Perangkat Pembelajaran dengan AI Assistant</p>
      
      <button class="btn-back" onclick="backToDashboard()">
        <i class="fas fa-arrow-left mr-2"></i>Kembali ke Dashboard
      </button>
      
      <form id="cta-form">
        <!-- ✅ SECTION 1: KOP DOKUMEN -->
        <div class="section-title"><i class="fas fa-university"></i><span>1. Informasi Sekolah (Kop Dokumen)</span></div>
        
        <div>
          <label for="kop-sekolah"><i class="fas fa-school mr-2"></i>Nama Sekolah</label>
          <input type="text" id="kop-sekolah" placeholder="Contoh: SDN 139 Lamanda" required>
        </div>
        
        <div>
          <label for="kop-tahun"><i class="fas fa-calendar mr-2"></i>Tahun Ajaran</label>
          <input type="text" id="kop-tahun" placeholder="Contoh: 2025/2026" value="2025/2026">
        </div>
        
        <!-- ✅ SECTION 2: INFORMASI PEMBELAJARAN (AUTO-FILL) -->
        <div class="section-title"><i class="fas fa-book-open"></i><span>2. Informasi Pembelajaran (Auto-Fill)</span></div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label for="cta-jenjang"><i class="fas fa-school mr-2"></i>Jenjang</label>
            <select id="cta-jenjang" required>
              <option value="">Pilih Jenjang</option>
              <option value="sd" ${jenjangFromParam === 'sd' ? 'selected' : ''}>SD</option>
              <option value="smp" ${jenjangFromParam === 'smp' ? 'selected' : ''}>SMP</option>
              <option value="sma" ${jenjangFromParam === 'sma' ? 'selected' : ''}>SMA</option>
            </select>
          </div>
          <div>
            <label for="cta-kelas"><i class="fas fa-users mr-2"></i>Kelas</label>
            <select id="cta-kelas" required>
              <option value="">Pilih Kelas</option>
              <option value="1" ${kelasFromParam === '1' ? 'selected' : ''}>Kelas 1</option>
              <option value="2" ${kelasFromParam === '2' ? 'selected' : ''}>Kelas 2</option>
              <option value="3" ${kelasFromParam === '3' ? 'selected' : ''}>Kelas 3</option>
              <option value="4" ${kelasFromParam === '4' ? 'selected' : ''}>Kelas 4</option>
              <option value="5" ${kelasFromParam === '5' ? 'selected' : ''}>Kelas 5</option>
              <option value="6" ${kelasFromParam === '6' ? 'selected' : ''}>Kelas 6</option>
              <option value="7" ${kelasFromParam === '7' ? 'selected' : ''}>Kelas 7</option>
              <option value="8" ${kelasFromParam === '8' ? 'selected' : ''}>Kelas 8</option>
              <option value="9" ${kelasFromParam === '9' ? 'selected' : ''}>Kelas 9</option>
              <option value="10" ${kelasFromParam === '10' ? 'selected' : ''}>Kelas 10</option>
              <option value="11" ${kelasFromParam === '11' ? 'selected' : ''}>Kelas 11</option>
              <option value="12" ${kelasFromParam === '12' ? 'selected' : ''}>Kelas 12</option>
            </select>
          </div>
          <div>
            <label for="cta-semester"><i class="fas fa-clock mr-2"></i>Semester</label>
            <select id="cta-semester" required>
              <option value="">Pilih Semester</option>
              <option value="1" ${semesterFromParam === '1' ? 'selected' : ''}>Semester 1 (Ganjil)</option>
              <option value="2" ${semesterFromParam === '2' ? 'selected' : ''}>Semester 2 (Genap)</option>
            </select>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="cta-mapel"><i class="fas fa-book mr-2"></i>Mata Pelajaran</label>
            <select id="cta-mapel" required>
              <option value="">Pilih Mapel</option>
              <option value="matematika">Matematika</option>
              <option value="ipas">IPAS</option>
              <option value="bahasa-indonesia">Bahasa Indonesia</option>
              <option value="pjok">PJOK</option>
              <option value="seni-budaya">Seni Budaya</option>
              <option value="pendidikan kewarganegaraan">PKn</option>
              <option value="paibd">PAIBD</option>
              <option value="fisika">FISIKA</option>
              <option value="kimia">KIMIA</option>
              <option value="biologi">BIOLOGI</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>
          <div>
            <label for="cta-guru"><i class="fas fa-chalkboard-teacher mr-2"></i>Nama Guru</label>
            <input type="text" id="cta-guru" placeholder="Contoh: Siti Rahayu, S.Pd">
          </div>
        </div>
        
        <!-- ✅ SECTION 3: MATERI/TOPIK -->
        <div class="section-title"><i class="fas fa-lightbulb"></i><span>3. Materi / Topik Pembelajaran</span></div>
        
        <div>
          <label for="cta-topik"><i class="fas fa-tag mr-2"></i>Materi / Topik</label>
          <input type="text" id="cta-topik" placeholder="Contoh: Pecahan Sederhana, Sistem Pernapasan Manusia, dll" required>
          <p class="text-xs text-gray-500 mt-1"><i class="fas fa-info-circle mr-1"></i>Topik spesifik akan membuat hasil generate lebih relevan</p>
        </div>
        
        <button type="button" id="btn-generate" class="btn-generate">
          <i class="fas fa-magic"></i> Generate CP/TP/ATP
        </button>
      </form>
      
      <!-- Hasil Generate -->
      <div id="cta-result" class="hidden result-section">
        <h3 class="text-xl font-bold mb-4 text-gray-800">📋 Hasil Generate</h3>
        
        <!-- Kop Preview -->
        <div id="kop-preview" class="kop-preview">
          <h3 id="preview-sekolah">SDN 139 LAMANDA</h3>
          <p><strong>CP/TP/ATP - Kurikulum Merdeka</strong></p>
          <p id="preview-detail">Matematika - Kelas 4 - Semester 1</p>
          <p id="preview-tahun">Tahun Ajaran 2025/2026</p>
          <p id="preview-topik" class="topik"><strong>Topik:</strong> Pecahan Sederhana</p>
        </div>
        
        <label for="result-cp"><i class="fas fa-bullseye mr-2"></i>Capaian Pembelajaran (CP)</label>
        <textarea id="result-cp" placeholder="CP akan muncul di sini setelah generate..."></textarea>
        
        <label for="result-tp"><i class="fas fa-flag-checkered mr-2"></i>Tujuan Pembelajaran (TP)</label>
        <textarea id="result-tp" placeholder="TP akan muncul di sini setelah generate..." style="min-height: 100px;"></textarea>
        
        <label for="result-atp"><i class="fas fa-stream mr-2"></i>Alur Tujuan Pembelajaran (ATP)</label>
        <textarea id="result-atp" placeholder="ATP akan muncul di sini setelah generate..." style="min-height: 150px;"></textarea>
        
        <button type="button" id="btn-save" class="btn-save">
          <i class="fas fa-save"></i> Simpan ke Firestore
        </button>
        <button type="button" id="btn-regenerate" class="btn-secondary">
          <i class="fas fa-redo"></i> Generate Ulang
        </button>
      </div>
      
      <!-- Daftar CTA Tersimpan -->
      <div class="mt-12">
        <h3 class="text-xl font-bold mb-4 text-gray-800">
          <i class="fas fa-archive mr-2"></i>CP/TP/ATP Tersimpan (<span id="saved-count">0</span>)
        </h3>
        <div id="cta-list" class="space-y-4">
          <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin text-2xl mb-3"></i>
            <p>Memuat data...</p>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // ✅ STEP 5: Hide Dashboard Sections (konsisten dengan module lain)
  hideDashboardSections();
  container.classList.remove('hidden');
  console.log('✅ [CTA Generator] Container displayed');
  
  // ✅ STEP 6: Add Event Handlers
  if (user) {
    setupEventHandlers();
    loadCTAData();
  }
  
  console.log('✅ [CTA Generator] Event handlers attached');
};

// ✅ Helper: Hide Dashboard Sections
function hideDashboardSections() {
  const welcomeSection = document.querySelector('.dashboard-hero')?.closest('section');
  if (welcomeSection) {
    welcomeSection.classList.add('hidden');
    console.log('✅ [CTA Generator] Welcome section hidden');
  }
  const roomsSection = document.querySelector('[aria-labelledby="rooms-heading"]');
  if (roomsSection) {
    roomsSection.classList.add('hidden');
    console.log('✅ [CTA Generator] Rooms section hidden');
  }
  document.querySelectorAll('#sd-section, #smp-section, #sma-section').forEach(section => {
    section.classList.add('hidden');
    console.log('✅ [CTA Generator] Jenjang section hidden:', section.id);
  });
}

// ✅ Helper: Setup Event Handlers
function setupEventHandlers() {
  const btnGenerate = document.getElementById('btn-generate');
  const btnSave = document.getElementById('btn-save');
  const btnRegenerate = document.getElementById('btn-regenerate');
  
  if (btnGenerate) btnGenerate.addEventListener('click', handleGenerate);
  if (btnSave) btnSave.addEventListener('click', handleSave);
  if (btnRegenerate) btnRegenerate.addEventListener('click', handleGenerate);
}

// ✅ TAMBAHAN 1: REAL AI GENERATE dengan Google Gemini
async function realAIGenerate(prompt, mapel, jenjang, kelas, semester, sekolah, guru, topik) {
    console.log('🤖 [CTA Generator] Calling Gemini API...');
    
    const API_KEY = window.GEMINI_API_KEY;
    
    if (!API_KEY) {
        throw new Error('API Key tidak ditemukan! Silakan masukkan Gemini API Key yang valid.');
    }
    
    const fullPrompt = `${prompt}

Konteks Pembelajaran:
- Sekolah: ${sekolah}
- Mata Pelajaran: ${mapel}
- Jenjang: ${jenjang.toUpperCase()}
- Kelas: ${kelas}
- Semester: ${semester === '1' ? '1 (Ganjil)' : '2 (Genap)'}
- Topik/Materi: ${topik}
- Guru Pengampu: ${guru || '-'}
- Tahun Ajaran: 2025/2026

Format Output yang Diinginkan:
1. CAPAIAN PEMBELAJARAN (CP): 1-2 paragraf yang menjelaskan kompetensi akhir
2. TUJUAN PEMBELAJARAN (TP): 4-6 poin tujuan pembelajaran spesifik
3. ALUR TUJUAN PEMBELAJARAN (ATP): Tabel dengan kolom: Minggu, Tujuan Pembelajaran, Kegiatan Pembelajaran, Asesmen

Gunakan bahasa Indonesia yang formal dan sesuai dengan Kurikulum Merdeka.`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: fullPrompt }] }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 2048,
                    }
                })
            }
        );
        
        const data = await response.json();
        
        if (data.error) {
            console.error('❌ Gemini API Error:', data.error);
            throw new Error(data.error.message || 'API Error: ' + JSON.stringify(data.error));
        }
        
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!aiResponse) {
            throw new Error('Response AI kosong atau tidak valid');
        }
        
        console.log('✅ [CTA Generator] AI Response received');
        return parseAIResponse(aiResponse);
        
    } catch (error) {
        console.error('❌ [CTA Generator] AI API Error:', error);
        throw error;
    }
}

// ✅ TAMBAHAN 2: Parse AI Response menjadi CP, TP, ATP
function parseAIResponse(text) {
    console.log('📋 [CTA Generator] Parsing AI response...');
    
    let cp = '', tp = '', atp = '';
    
    // Try to find sections by common patterns (case-insensitive)
    const cpMatch = text.match(/1\.?\s*CAPAIAN PEMBELAJARAN.*?(?=2\.|\n\n\n|$)/is);
    const tpMatch = text.match(/2\.?\s*TUJUAN PEMBELAJARAN.*?(?=3\.|\n\n\n|$)/is);
    const atpMatch = text.match(/3\.?\s*(?:ALUR TUJUAN PEMBELAJARAN|ALUR).*?(?=$)/is);
    
    cp = cpMatch ? cpMatch[0].trim().replace(/^\d+\.\s*/i, '').trim() : text.split('\n\n')[0] || text;
    tp = tpMatch ? tpMatch[0].trim().replace(/^\d+\.\s*/i, '').trim() : text.split('\n\n')[1] || '';
    atp = atpMatch ? atpMatch[0].trim().replace(/^\d+\.\s*/i, '').trim() : text.split('\n\n')[2] || text;
    
    return { 
        cp: cp.trim(), 
        tp: tp.trim(), 
        atp: atp.trim() 
    };
}

// ✅ STEP 7: Handle Generate (REAL AI dengan FALLBACK ke Mock)
async function handleGenerate() {
  console.log('🪄 [CTA Generator] Generate button clicked');
  
  const user = auth.currentUser;
  if (!user) {
    alert('⚠️ Silakan login dulu!');
    return;
  }
  
  const jenjang = document.getElementById('cta-jenjang')?.value;
  const kelas = document.getElementById('cta-kelas')?.value;
  const semester = document.getElementById('cta-semester')?.value;
  const mapel = document.getElementById('cta-mapel')?.value;
  const sekolah = document.getElementById('kop-sekolah')?.value;
  const tahun = document.getElementById('kop-tahun')?.value;
  const guru = document.getElementById('cta-guru')?.value;
  const topik = document.getElementById('cta-topik')?.value;
  
  if (!sekolah) { alert('⚠️ Nama Sekolah wajib diisi!'); document.getElementById('kop-sekolah')?.focus(); return; }
  if (!jenjang || !kelas || !semester || !mapel || !topik) { alert('⚠️ Lengkapi semua Informasi Pembelajaran dan Topik!'); return; }
  
  const resultDiv = document.getElementById('cta-result');
  if (resultDiv) resultDiv.classList.remove('hidden');
  
  updateKopPreview(sekolah, tahun, mapel, kelas, semester, topik);
  
  document.getElementById('result-cp').value = '⏳ Sedang generate...';
  document.getElementById('result-tp').value = '';
  document.getElementById('result-atp').value = '';
  
  resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
  
  try {
    const templateKey = `${mapel}_${jenjang}_${kelas}`;
    const prompt = promptTemplates[templateKey] || promptTemplates.default;
    console.log('📋 [CTA Generator] Using template:', templateKey);
    
    // ✅ TAMBAHAN 3: Coba Real AI dulu, fallback ke mock jika gagal
    let result;
    let usedMock = false;
    
    try {
      console.log('🤖 [CTA Generator] Attempting real AI generate...');
      result = await realAIGenerate(prompt, mapel, jenjang, kelas, semester, sekolah, guru, topik);
      console.log('✅ [CTA Generator] Real AI generate successful!');
    } catch (aiError) {
      console.warn('⚠️ [CTA Generator] Real AI failed, falling back to mock:', aiError.message);
      result = await mockAIGenerate(prompt, mapel, jenjang, kelas, semester, sekolah, guru, topik);
      usedMock = true;
    }
    
    document.getElementById('result-cp').value = result.cp;
    document.getElementById('result-tp').value = result.tp;
    document.getElementById('result-atp').value = result.atp;
    
    // Tampilkan info jika menggunakan mock
    if (usedMock) {
      const infoDiv = document.createElement('div');
      infoDiv.className = 'mt-2 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800';
      infoDiv.innerHTML = '⚠️ Menggunakan mode offline. <button onclick="this.parentElement.remove()" class="ml-2 text-amber-600 hover:underline">Tutup</button>';
      document.getElementById('cta-result').insertBefore(infoDiv, document.getElementById('cta-result').firstChild);
    }
    
    console.log('✅ [CTA Generator] Generate complete');
    
  } catch (error) {
    console.error('❌ [CTA Generator] Generate error:', error);
    alert('❌ Gagal generate: ' + error.message);
  }
}

// ✅ Update Kop Preview
function updateKopPreview(sekolah, tahun, mapel, kelas, semester, topik) {
  document.getElementById('preview-sekolah').textContent = sekolah.toUpperCase();
  document.getElementById('preview-detail').textContent = `${mapel.toUpperCase()} - Kelas ${kelas} - Semester ${semester === '1' ? '1 (Ganjil)' : '2 (Genap)'}`;
  document.getElementById('preview-tahun').textContent = `Tahun Ajaran ${tahun || '2025/2026'}`;
  document.getElementById('preview-topik').innerHTML = `<strong>Topik:</strong> ${topik}`;
}

// ✅ Mock AI Generate (Fallback jika API gagal) - TIDAK DIUBAH
async function mockAIGenerate(prompt, mapel, jenjang, kelas, semester, sekolah, guru, topik) {
  await new Promise(resolve => setTimeout(resolve, 2000));
  const mapelCapital = mapel.toUpperCase();
  const jenjangCapital = jenjang.toUpperCase();
  const semesterText = semester === '1' ? '1 (Ganjil)' : '2 (Genap)';
  return {
    cp: `CAPAIAN PEMBELAJARAN\n\nMata Pelajaran: ${mapelCapital}\nJenjang: ${jenjangCapital} Kelas ${kelas} | Semester ${semesterText}\nSekolah: ${sekolah}\nGuru: ${guru || '-'}\nTopik: ${topik}\n\nPeserta didik mampu memahami dan menerapkan konsep dasar ${topik} sesuai dengan tahap perkembangan kognitif kelas ${kelas}.`,
    tp: `TUJUAN PEMBELAJARAN\n\nSetelah mengikuti pembelajaran ${topik}, peserta didik dapat:\n\n1. Menjelaskan konsep ${topik} dengan benar\n2. Menerapkan ${topik} dalam situasi nyata\n3. Menyelesaikan masalah terkait ${topik}\n4. Menyajikan hasil pembelajaran dengan jelas`,
    atp: `ALUR TUJUAN PEMBELAJARAN (ATP)\n\n${mapelCapital} - ${jenjangCapital} Kelas ${kelas} | Semester ${semesterText}\nTopik: ${topik}\n\n┌─────────────────────────────────────────────────────────┐\n│ MINGGU 1-2: Pengenalan ${topik}                        │\n├─────────────────────────────────────────────────────────┤\n│ Kegiatan: Diskusi, demonstrasi, eksplorasi             │\n│ Asesmen: Observasi, kuis                               │\n└─────────────────────────────────────────────────────────┘\n\n┌─────────────────────────────────────────────────────────┐\n│ MINGGU 3-4: Latihan ${topik}                           │\n├─────────────────────────────────────────────────────────┤\n│ Kegiatan: Latihan terbimbing, kerja kelompok           │\n│ Asesmen: Lembar kerja, presentasi                      │\n└─────────────────────────────────────────────────────────┘`
  };
}

// ✅ STEP 8: Handle Save to Firestore (WITH ISOLASI + ADMIN BYPASS) - TIDAK DIUBAH
async function handleSave() {
  console.log('💾 [CTA Generator] Save button clicked');
  
  const user = auth.currentUser;
  if (!user) {
    alert('⚠️ Silakan login dulu!');
    return;
  }
  
  const jenjang = document.getElementById('cta-jenjang')?.value;
  const kelas = document.getElementById('cta-kelas')?.value;
  const semester = document.getElementById('cta-semester')?.value;
  const mapel = document.getElementById('cta-mapel')?.value;
  const sekolah = document.getElementById('kop-sekolah')?.value;
  const tahun = document.getElementById('kop-tahun')?.value;
  const guru = document.getElementById('cta-guru')?.value;
  const topik = document.getElementById('cta-topik')?.value;
  const cp = document.getElementById('result-cp')?.value;
  const tp = document.getElementById('result-tp')?.value;
  const atp = document.getElementById('result-atp')?.value;
  
  if (!cp || !tp || !atp) {
    alert('⚠️ Generate data dulu sebelum menyimpan!');
    return;
  }
  
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.exists() ? userDoc.data() : null;
    const isAdmin = userData?.role === 'admin';
    console.log('👑 [CTA Generator] Is admin:', isAdmin);
    
    await addDoc(collection(db, 'cp_tp_atp'), {
      userId: user.uid,
      userEmail: user.email,
      userName: user.displayName || 'Guru',
      sekolah: sekolah,
      tahun: tahun,
      jenjang: jenjang,
      kelas: kelas,
      semester: semester,
      mapel: mapel,
      guru: guru,
      topik: topik,
      cp: cp,
      tp: tp,
      atp: atp,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isAdmin: isAdmin
    });
    
    console.log('✅ [CTA Generator] Data saved successfully!');
    alert('✅ CP/TP/ATP berhasil disimpan!');
    loadCTAData();
    document.getElementById('cta-result').classList.add('hidden');
    document.getElementById('cta-form').reset();
  } catch (error) {
    console.error('❌ [CTA Generator] Save error:', error);
    alert('❌ Gagal simpan: ' + (error.code === 'permission-denied' ? 'Izin ditolak. Cek Firebase Rules!' : error.message));
  }
}

// ✅ STEP 9: Load CTA Data (WITH ISOLASI + ADMIN BYPASS) - TIDAK DIUBAH
function loadCTAData() {
  const list = document.getElementById('cta-list');
  const countSpan = document.getElementById('saved-count');
  if (!list) { console.error('❌ [CTA Generator] List container not found!'); return; }
  console.log('🔄 [CTA Generator] Setting up realtime listener...');
  const user = auth.currentUser;
  if (!user) {
    list.innerHTML = `<div class="text-center py-8 text-gray-500"><i class="fas fa-lock text-3xl mb-3"></i><p>Silakan login untuk melihat data</p></div>`;
    return;
  }
  (async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.exists() ? userDoc.data() : null;
      const isAdmin = userData?.role === 'admin';
      console.log('👑 [CTA Generator] Admin check:', isAdmin);
      let q;
      if (isAdmin) {
        console.log('👑 [CTA Generator] Admin user - loading all CTA data');
        q = query(collection(db, 'cp_tp_atp'), orderBy('createdAt', 'desc'));
      } else {
        console.log('👤 [CTA Generator] Regular user - loading own CTA data only');
        q = query(collection(db, 'cp_tp_atp'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
      }
      onSnapshot(q, (snapshot) => {
        console.log('📥 [CTA Generator] Realtime update:', snapshot.docs.length, 'documents');
        if (snapshot.empty) {
          list.innerHTML = `<div class="text-center py-8 text-gray-500"><i class="fas fa-inbox text-3xl mb-3"></i><p>Belum ada CP/TP/ATP tersimpan. Generate yang pertama!</p></div>`;
          return;
        }
        if (countSpan) countSpan.textContent = snapshot.docs.length;
        list.innerHTML = snapshot.docs.map(docSnap => {
          const d = docSnap.data();
          const date = d.createdAt?.toDate?.()?.toLocaleString('id-ID') || '-';
          const semesterText = d.semester === '1' ? 'Semester 1 (Ganjil)' : 'Semester 2 (Genap)';
          return `
            <div class="cta-item">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <strong class="text-lg">${d.mapel?.toUpperCase() || 'Tanpa Mapel'} - Kelas ${d.kelas}</strong>
                  <br>
                  <small class="text-gray-500">${d.userName} • ${d.userEmail}</small>
                </div>
                <small class="text-gray-400">${date}</small>
              </div>
              <div class="text-sm mb-2">
                <span class="cta-badge badge-jenjang">${d.jenjang?.toUpperCase()}</span>
                <span class="cta-badge badge-mapel">${d.mapel?.toUpperCase()}</span>
                <span class="cta-badge badge-kelas">Kelas ${d.kelas}</span>
                <span class="cta-badge badge-semester">${semesterText}</span>
              </div>
              <p class="text-gray-700 mt-2"><strong>📋 Topik:</strong> ${d.topik || '-'}</p>
              <p class="text-gray-600 text-sm whitespace-pre-line">${d.cp?.substring(0, 200) || '-'}${d.cp?.length > 200 ? '...' : ''}</p>
            </div>
          `;
        }).join('');
      }, (error) => {
        console.error('❌ [CTA Generator] Realtime error:', error);
        list.innerHTML = `<div class="text-center py-8 text-red-500"><i class="fas fa-exclamation-circle text-3xl mb-3"></i><p>Gagal memuat: ${error.message}</p></div>`;
      });
    } catch (e) {
      console.error('❌ [CTA Generator] Error checking admin status:', e);
      const q = query(collection(db, 'cp_tp_atp'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
      onSnapshot(q, () => {});
    }
  })();
}

// ✅ STEP 10: Confirm Registration
console.log('🟢 [CTA Generator] window.renderCTAGenerator:', typeof window.renderCTAGenerator);
console.log('🟢 [CTA Generator] Module FINISHED - Ready to use!');
