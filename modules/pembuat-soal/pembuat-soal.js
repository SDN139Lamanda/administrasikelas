/**
 * ============================================
 * GENERATOR PEMBUAT SOAL - Main Logic
 * Folder: modules/pembuat-soal/pembuat-soal.js
 * ============================================
 * 
 * ✅ UPDATE: buildPrompt() diubah untuk menghasilkan SOAL UJIAN (Bukan CP).
 * ✅ FIXES APPLIED:
 * 1. Dropdown populate: Populate select di table row (bukan header).
 * 2. TDZ Error: Use 'foundRow' instead of 'row' in event listeners.
 * 3. API parsing: Handle string & object response dari generateWithGroq.
 * ============================================
 */

console.log('🔴 [PembuatSoal] Module START');

// ✅ IMPORTS
import { generateWithGroq, getGroqApiKey } from '../groq-api.js';
import { db, auth, doc, getDoc, collection, addDoc, serverTimestamp } from '../firebase-config.js';

console.log('✅ [PembuatSoal] All imports successful');

// ============================================
// ✅ GLOBAL STATE
// ============================================

let soalRows = [];
let generatedOutput = {
    questions: '',
    answers: ''
};

// Cache for mapel data
let _mapelCache = {};

// ============================================
// ✅ MAIN RENDER FUNCTION
// ============================================

export async function renderPembuatSoal() {
    console.log('📝 [PembuatSoal] renderPembuatSoal called');
    
    const container = document.getElementById('pembuat-soal-container');
    if (!container) {
        console.error('❌ [PembuatSoal] Container not found');
        return;
    }
    
    // ✅ Auth check
    if (!window.isUserApproved?.() && window.currentUserRole !== 'admin') {
        container.innerHTML = `
            <div class="pembuat-soal-container">
                <div class="pembuat-soal-alert pembuat-soal-alert-warning">
                    <i class="fas fa-lock mr-2"></i>
                    Akun Anda masih menunggu persetujuan admin.
                </div>
            </div>
        `;
        return;
    }
    
    // Render UI
    container.innerHTML = getPembuatSoalHTML();
    
    // Load CSS
    loadPembuatSoalCSS();
    
    // Initialize event listeners
    initPembuatSoalListeners();
    
    // Load user data
    await loadUserData();
    
    console.log('🟢 [PembuatSoal] Module READY');
}

// ============================================
// ✅ HTML TEMPLATE
// ============================================

function getPembuatSoalHTML() {
    return `
        <div class="pembuat-soal-container">
            <!-- Header -->
            <div class="pembuat-soal-header">
                <h2><i class="fas fa-file-alt mr-2"></i>Generator Pembuat Soal</h2>
                <p>Buat soal penilaian dengan bantuan AI secara otomatis</p>
            </div>
            
            <!-- Alert Messages -->
            <div id="pembuat-soal-alert-container"></div>
            
            <!-- Input Form -->
            <div class="pembuat-soal-form">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">Informasi Umum</h3>
                <div class="pembuat-soal-form-grid">
                    <div class="pembuat-soal-form-group">
                        <label>Sekolah</label>
                        <input type="text" id="ps-sekolah" readonly class="bg-gray-100">
                    </div>
                    <div class="pembuat-soal-form-group">
                        <label>Mata Pelajaran</label>
                        <input type="text" id="ps-mapel" readonly class="bg-gray-100">
                    </div>
                    <div class="pembuat-soal-form-group">
                        <label>Tahun Pelajaran</label>
                        <input type="text" id="ps-tahun" placeholder="Contoh: 2024/2025">
                    </div>
                </div>
                
                <h3 class="text-lg font-semibold text-gray-800 mb-4 mt-6">Daftar Topik & Soal</h3>
                <div class="pembuat-soal-table-container">
                    <table class="pembuat-soal-table" id="ps-table">
                        <thead>
                            <tr>
                                <th style="width: 25%;">Jenjang & Mapel</th>
                                <th style="width: 30%;">Topik/Materi</th>
                                <th style="width: 15%;">Jumlah Nomor</th>
                                <th style="width: 15%;">Model Soal</th>
                                <th style="width: 15%;">Soal Untuk</th>
                                <th style="width: 5%;">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="ps-tbody">
                            <!-- Dynamic rows will be added here -->
                        </tbody>
                    </table>
                </div>
                
                <div class="pembuat-soal-actions mt-4">
                    <button id="ps-add-row-btn" class="pembuat-soal-btn pembuat-soal-btn-secondary">
                        <i class="fas fa-plus"></i> Tambah Baris
                    </button>
                    <button id="ps-generate-btn" class="pembuat-soal-btn pembuat-soal-btn-primary">
                        <i class="fas fa-robot"></i> Buatkan Soal
                    </button>
                    <button id="ps-download-btn" class="pembuat-soal-btn pembuat-soal-btn-success" disabled>
                        <i class="fas fa-file-word"></i> Download Word
                    </button>
                </div>
            </div>
            
            <!-- Output Sections -->
            <div id="pembuat-soal-output" class="pembuat-soal-output hidden">
                <!-- Questions Section -->
                <div class="pembuat-soal-output-section">
                    <h3><i class="fas fa-question-circle mr-2"></i>SOAL</h3>
                    <div id="ps-output-questions" class="pembuat-soal-output-content"></div>
                </div>
                
                <!-- Answers Section -->
                <div class="pembuat-soal-output-section">
                    <h3><i class="fas fa-check-circle mr-2"></i>KUNCI JAWABAN</h3>
                    <div id="ps-output-answers" class="pembuat-soal-output-content"></div>
                </div>
            </div>
            
            <!-- Back Button -->
            <div class="mt-6">
                <button onclick="window.backToDashboard()" class="pembuat-soal-btn pembuat-soal-btn-secondary">
                    <i class="fas fa-arrow-left mr-2"></i>Kembali ke Dashboard
                </button>
            </div>
        </div>
    `;
}

// ============================================
// ✅ LOAD CSS
// ============================================

function loadPembuatSoalCSS() {
    const linkId = 'pembuat-soal-css';
    if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = './modules/pembuat-soal/pembuat-soal.css';
        document.head.appendChild(link);
    }
}

// ============================================
// ✅ INITIALIZE EVENT LISTENERS
// ============================================

function initPembuatSoalListeners() {
    const addRowBtn = document.getElementById('ps-add-row-btn');
    if (addRowBtn) addRowBtn.addEventListener('click', addRow);
    
    const generateBtn = document.getElementById('ps-generate-btn');
    if (generateBtn) generateBtn.addEventListener('click', generateSoal);
    
    const downloadBtn = document.getElementById('ps-download-btn');
    if (downloadBtn) downloadBtn.addEventListener('click', downloadWord);
}

// ============================================
// ✅ LOAD USER DATA
// ============================================

async function loadUserData() {
    try {
        const user = auth.currentUser;
        if (!user) return;
        
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
            const data = snap.data();
            
            // Auto-fill sekolah
            const sekolahInput = document.getElementById('ps-sekolah');
            if (sekolahInput) sekolahInput.value = data.nama_sekolah || '-';
            
            // Auto-fill mapel
            const mapelInput = document.getElementById('ps-mapel');
            if (mapelInput) {
                let mapelText = '-';
                if (data.jenjang_sekolah === 'sd' && data.sd_mapel_type === 'kelas') {
                    mapelText = 'Guru Kelas (' + (data.jenjang_sekolah || '').toUpperCase() + ')';
                } else if (data.mapel_yang_diampu && data.mapel_yang_diampu.length > 0) {
                    mapelText = data.mapel_yang_diampu.join(', ');
                } else if (data.sd_mapel_type && ['pai', 'pjok'].includes(data.sd_mapel_type)) {
                    mapelText = data.sd_mapel_type.toUpperCase();
                }
                mapelInput.value = mapelText;
            }
            
            // Auto-fill tahun
            const tahunInput = document.getElementById('ps-tahun');
            if (tahunInput) {
                const currentYear = new Date().getFullYear();
                tahunInput.value = `${currentYear}/${currentYear + 1}`;
            }
            
            await addRow();
        }
    } catch (error) {
        console.error('❌ [PembuatSoal] Load user data error:', error);
    }
}

// ============================================
// ✅ FETCH MAPEL DATA FROM JSON
// ============================================

async function fetchMapelData(jenjang) {
    if (!jenjang) return [];
    if (_mapelCache[jenjang]) return _mapelCache[jenjang];
    
    try {
        console.log(`📥 [Mapel] Fetching ./data/mapel/${jenjang}.json`);
        const response = await fetch(`./data/mapel/${jenjang}.json`, { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('Invalid JSON structure');
        _mapelCache[jenjang] = data;
        return data;
    } catch (error) {
        console.warn(`⚠️ [Mapel] Failed to fetch ${jenjang}.json:`, error.message);
        const fallback = [{ nama: 'Matematika', jenjang }, { nama: 'Bahasa Indonesia', jenjang }];
        _mapelCache[jenjang] = fallback;
        return fallback;
    }
}

// ============================================
// ✅ POPULATE ROW MAPEL DROPDOWN (FIXED)
// ============================================

async function populateRowMapelDropdown(selectEl, jenjang, userMapelFromReg = null) {
    if (!selectEl || !jenjang) return;
    
    selectEl.innerHTML = '<option value="">Memuat...</option>';
    selectEl.disabled = true;
    
    try {
        const mapelList = await fetchMapelData(jenjang);
        selectEl.innerHTML = '<option value="">Pilih Mata Pelajaran</option>';
        
        mapelList.forEach(item => {
            const opt = document.createElement('option');
            opt.value = `${jenjang}-${item.nama.toLowerCase().replace(/\s+/g, '-')}`;
            opt.textContent = `${jenjang.toUpperCase()} - ${item.nama}`;
            selectEl.appendChild(opt);
        });
        
        if (userMapelFromReg) {
            const match = Array.from(selectEl.options).find(opt => opt.textContent.includes(userMapelFromReg));
            if (match) {
                selectEl.value = match.value;
                selectEl.disabled = true;
                
                const lockBadge = document.createElement('span');
                lockBadge.className = 'lock-indicator';
                lockBadge.innerHTML = `<i class="fas fa-lock text-emerald-600"></i> ${userMapelFromReg}`;
                lockBadge.style.cssText = 'display:block;margin-top:4px;font-size:11px;color:#059669';
                
                const existing = selectEl.parentNode.querySelector('.lock-indicator');
                if (existing) existing.remove();
                selectEl.parentNode.appendChild(lockBadge);
            }
        }
        selectEl.disabled = false;
    } catch (error) {
        console.error('❌ Populate row mapel error:', error);
        selectEl.innerHTML = '<option value="">Gagal memuat</option>';
        selectEl.disabled = false;
    }
}

// ============================================
// ✅ ADD ROW TO TABLE
// ============================================

async function addRow() {
    const tbody = document.getElementById('ps-tbody');
    if (!tbody) return;
    
    const rowIndex = soalRows.length;
    const user = auth.currentUser;
    let userMapelFromReg = null;
    let userJenjang = 'sd';
    
    if (user) {
        try {
            const snap = await getDoc(doc(db, 'users', user.uid));
            if (snap.exists()) {
                const d = snap.data();
                userJenjang = d.jenjang_sekolah || 'sd';
                if (d.jenjang_sekolah === 'sd' && d.sd_mapel_type !== 'kelas') userMapelFromReg = d.sd_mapel_type.toUpperCase();
                else if (d.mapel_yang_diampu?.length > 0) userMapelFromReg = d.mapel_yang_diampu[0];
            }
        } catch (e) { console.warn('Load user data error:', e); }
    }
    
    const row = {
        id: Date.now() + rowIndex,
        jenjangMapel: userJenjang,
        topik: '',
        jumlahNomor: 5,
        modelSoal: 'ganda',
        soalUntuk: 'harian'
    };
    
    soalRows.push(row);
    
    const tr = document.createElement('tr');
    tr.dataset.rowId = row.id;
    tr.innerHTML = `
        <td>
            <select class="ps-jenjang-mapel" data-row="${row.id}">
                <option value="">Memuat mapel...</option>
            </select>
        </td>
        <td>
            <input type="text" class="ps-topik" data-row="${row.id}" placeholder="Contoh: Pecahan">
        </td>
        <td>
            <input type="number" class="ps-jumlah" data-row="${row.id}" value="5" min="1" max="50">
        </td>
        <td>
            <select class="ps-model" data-row="${row.id}">
                <option value="ganda">Pilihan Ganda</option>
                <option value="isian">Isian</option>
                <option value="uraian">Uraian/Essay</option>
            </select>
        </td>
        <td>
            <select class="ps-untuk" data-row="${row.id}">
                <option value="harian">Tugas Harian</option>
                <option value="pts">PTS</option>
                <option value="pas">PAS</option>
            </select>
        </td>
        <td>
            <button onclick="window.removePembuatSoalRow(${row.id})" class="text-red-600 hover:text-red-800">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    tbody.appendChild(tr);
    
    const jenjangSelect = tr.querySelector('.ps-jenjang-mapel');
    await populateRowMapelDropdown(jenjangSelect, userJenjang, userMapelFromReg);
    
    const topikInput = tr.querySelector('.ps-topik');
    const jumlahInput = tr.querySelector('.ps-jumlah');
    const modelSelect = tr.querySelector('.ps-model');
    const untukSelect = tr.querySelector('.ps-untuk');
    
    if (jenjangSelect) jenjangSelect.addEventListener('change', (e) => { const f = soalRows.find(r => r.id === row.id); if (f) f.jenjangMapel = e.target.value; });
    if (topikInput) topikInput.addEventListener('input', (e) => { const f = soalRows.find(r => r.id === row.id); if (f) f.topik = e.target.value; });
    if (jumlahInput) jumlahInput.addEventListener('input', (e) => { const f = soalRows.find(r => r.id === row.id); if (f) f.jumlahNomor = parseInt(e.target.value) || 5; });
    if (modelSelect) modelSelect.addEventListener('change', (e) => { const f = soalRows.find(r => r.id === row.id); if (f) f.modelSoal = e.target.value; });
    if (untukSelect) untukSelect.addEventListener('change', (e) => { const f = soalRows.find(r => r.id === row.id); if (f) f.soalUntuk = e.target.value; });
}

// ============================================
// ✅ REMOVE ROW
// ============================================

window.removePembuatSoalRow = function(rowId) {
    soalRows = soalRows.filter(r => r.id !== rowId);
    const tr = document.querySelector(`tr[data-row="${rowId}"]`);
    if (tr) tr.remove();
    showAlert('Baris berhasil dihapus', 'success');
};

// ============================================
// ✅ GENERATE SOAL
// ============================================

async function generateSoal() {
    const tahun = document.getElementById('ps-tahun')?.value;
    if (!tahun) { showAlert('Isi Tahun Pelajaran!', 'warning'); return; }
    if (soalRows.length === 0) { showAlert('Tambah minimal 1 baris!', 'warning'); return; }
    for (const row of soalRows) {
        if (!row.jenjangMapel || !row.topik) { showAlert('Lengkapi Jenjang & Topik!', 'warning'); return; }
    }
    
    const btn = document.getElementById('ps-generate-btn');
    const dwnBtn = document.getElementById('ps-download-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses AI...';
    dwnBtn.disabled = true;
    
    try {
        const apiKey = await getGroqApiKey();
        if (!apiKey) { showAlert('API Key tidak ditemukan.', 'error'); return; }
        
        // ✅ BUILD PROMPT (SOAL, BUKAN CP)
        const prompt = buildPrompt(tahun);
        
        // CALL GROQ
        const result = await generateWithGroq({
            sekolah: document.getElementById('ps-sekolah')?.value || '-',
            tahun: tahun,
            topik: soalRows.map(r => r.topik).filter(t => t).join(', '),
            jumlahSoal: soalRows.reduce((sum, r) => sum + (r.jumlahNomor || 5), 0),
            modelSoal: soalRows[0]?.modelSoal || 'ganda',
            soalUntuk: soalRows[0]?.soalUntuk || 'harian'
        });
        
        console.log('🤖 [PembuatSoal] AI Response received');
        
        // PARSE RESPONSE
        const aiContent = typeof result === 'string' ? result : (result?.content || JSON.stringify(result));
        const parsedOutput = parseAIOutput(aiContent);
        
        generatedOutput = parsedOutput;
        
        // DISPLAY
        displayOutput(parsedOutput);
        
        dwnBtn.disabled = false;
        
        // SAVE
        await saveToFirebase(tahun, parsedOutput);
        
        showAlert('✅ Soal berhasil digenerate!', 'success');
        
    } catch (error) {
        console.error('❌ Generate error:', error);
        let err = error.message;
        if (err.includes('API key')) err = 'API Key tidak valid.';
        else if (err.includes('429')) err = 'Limit AI habis.';
        showAlert(`❌ Gagal: ${err}`, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-robot"></i> Buatkan Soal';
    }
}

// ============================================
// ✅ BUILD PROMPT (UPDATED: SOAL, BUKAN CP)
// ============================================

function buildPrompt(tahun) {
    const sekolah = document.getElementById('ps-sekolah')?.value || '-';
    
    const rowsData = soalRows.map(row => ({
        topik: row.topik,
        jumlah: row.jumlahNomor,
        model: row.modelSoal,
        untuk: row.soalUntuk
    }));
    
    const rowsText = rowsData.map((r, i) => {
        const modelMap = { 'ganda': 'Pilihan Ganda (4 opsi)', 'isian': 'Isian Singkat', 'uraian': 'Uraian/Essay' };
        const untukMap = { 'harian': 'Tugas Harian', 'pts': 'PTS', 'pas': 'PAS' };
        return `${i+1}. Topik: "${r.topik}" | ${r.jumlah} soal | ${modelMap[r.model]} | ${untukMap[r.untuk]}`;
    }).join('\n');
    
    // ⚠️ PROMPT INI KHUSUS UNTUK MEMBUAT SOAL
    return `Anda adalah guru profesional ahli pembuat soal ujian.
TUGAS: Buatkan soal ujian berdasarkan rincian berikut.

INFORMASI:
- Sekolah: ${sekolah}
- Tahun: ${tahun}

RINCIAN SOAL:
${rowsText}

ATURAN:
1. Buat soal sesuai jumlah yang diminta.
2. Jika "Pilihan Ganda", buat 4 opsi (A, B, C, D) DAN tentukan kunci jawaban.
3. Jika "Isian", buat soal dengan jawaban singkat.
4. Jika "Uraian", buat soal analisis/esai.
5. Pisahkan SOAL dan KUNCI JAWABAN dengan jelas.

FORMAT OUTPUT (WAJIB IKUTI PERSIS):

=== SOAL ===
[Daftar semua soal di sini, dikelompokkan per Topik, beri nomor urut]
[Contoh untuk Pilihan Ganda:
1. Soal?
   A. ...
   B. ...
   C. ...
   D. ...
]

=== KUNCI JAWABAN ===
[Daftar kunci jawaban di sini sesuai nomor soal]
[Contoh: 1. Jawaban: B (Alasan)]

JANGAN MENAMBAH KATA PENGANTAR ATAU PENUTUP LAINNYA. MULAI LANGSUNG DENGAN "=== SOAL ===".`;
}

// ============================================
// ✅ PARSE OUTPUT
// ============================================

function parseAIOutput(content) {
    const soalMarker = '=== SOAL ===';
    const jawabanMarker = '=== KUNCI JAWABAN ===';
    
    let questions = '';
    let answers = '';
    
    const soalIdx = content.indexOf(soalMarker);
    const jawabIdx = content.indexOf(jawabanMarker);
    
    if (soalIdx !== -1 && jawabIdx !== -1) {
        questions = content.substring(soalIdx + soalMarker.length, jawabIdx).trim();
        answers = content.substring(jawabIdx + jawabanMarker.length).trim();
    } else if (soalIdx !== -1) {
        questions = content.substring(soalIdx + soalMarker.length).trim();
        answers = 'Kunci jawaban tidak ditemukan dalam output.';
    } else {
        questions = content;
        answers = 'Kunci jawaban tidak ditemukan dalam output.';
    }
    
    questions = questions.replace(/\n/g, '<br>');
    answers = answers.replace(/\n/g, '<br>');
    
    return { questions, answers };
}

// ============================================
// ✅ DISPLAY OUTPUT
// ============================================

function displayOutput(output) {
    const section = document.getElementById('pembuat-soal-output');
    const qDiv = document.getElementById('ps-output-questions');
    const aDiv = document.getElementById('ps-output-answers');
    
    if (section) section.classList.remove('hidden');
    if (qDiv) qDiv.innerHTML = output.questions;
    if (aDiv) aDiv.innerHTML = output.answers;
}

// ============================================
// ✅ SAVE TO FIREBASE
// ============================================

async function saveToFirebase(tahun, output) {
    try {
        const user = auth.currentUser;
        if (!user) return;
        const snap = await getDoc(doc(db, 'users', user.uid));
        const ud = snap.exists() ? snap.data() : {};
        
        await addDoc(collection(db, 'pembuat_soal'), {
            uid: user.uid,
            sekolah: ud.nama_sekolah || '',
            mapel: ud.mapel_yang_diampu?.join(', ') || ud.sd_mapel_type || '',
            tahunPelajaran: tahun,
            topics: soalRows,
            output: output,
            createdAt: serverTimestamp(),
            jenjang: ud.jenjang_sekolah || ''
        });
    } catch (e) { console.error('Save error:', e); }
}

// ============================================
// ✅ DOWNLOAD WORD
// ============================================

function downloadWord() {
    if (!generatedOutput.questions) return;
    const sekolah = document.getElementById('ps-sekolah')?.value || '-';
    const mapel = document.getElementById('ps-mapel')?.value || '-';
    const tahun = document.getElementById('ps-tahun')?.value || '-';
    
    const content = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'></head>
        <body>
            <h1 style="text-align:center">SOAL PENILAIAN</h1>
            <p>Sekolah: ${sekolah}<br>Mapel: ${mapel}<br>Tahun: ${tahun}</p><hr>
            <h2>SOAL</h2>
            <div>${generatedOutput.questions}</div>
            <hr>
            <h2>KUNCI JAWABAN</h2>
            <div>${generatedOutput.answers}</div>
        </body></html>`;
    
    const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Soal_${mapel}_${tahun}.doc`;
    a.click();
    URL.revokeObjectURL(url);
}

// ============================================
// ✅ SHOW ALERT
// ============================================

function showAlert(msg, type = 'success') {
    const c = document.getElementById('pembuat-soal-alert-container');
    if (!c) return;
    const cls = type === 'error' ? 'pembuat-soal-alert-error' : (type === 'warning' ? 'pembuat-soal-alert-warning' : 'pembuat-soal-alert-success');
    c.innerHTML = `<div class="pembuat-soal-alert ${cls}">${msg}</div>`;
    setTimeout(() => { if(c) c.innerHTML = ''; }, 5000);
}

console.log('🟢 [PembuatSoal] Module READY');
