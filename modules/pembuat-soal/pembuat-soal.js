/**
 * ============================================
 * GENERATOR PEMBUAT SOAL - Main Logic
 * Folder: modules/pembuat-soal/pembuat-soal.js
 * ✅ UPDATE: Mobile Responsive + Touch Optimization
 * ============================================
 * 
 * ✅ FIX UTAMA: Tambah 'prompt: prompt' ke generateWithGroq()
 * ✅ FIXES APPLIED:
 * 1. generateWithGroq: Kirim prompt custom agar AI generate soal (bukan CP)
 * 2. parseAIOutput: Regex-based parsing untuk handle variasi marker
 * 3. buildPrompt: Lebih strict + contoh output konkret + negative constraints
 * 4. Debug logging: Tampilkan raw AI response untuk troubleshooting
 * 5. ✅ MOBILE: Responsive table, form grid, touch targets, font-size
 * ============================================
 */

console.log('🔴 [PembuatSoal] Module START + Mobile Optimized');

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
            <div class="pembuat-soal-container p-4">
                <div class="pembuat-soal-alert pembuat-soal-alert-warning p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
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
    
    console.log('🟢 [PembuatSoal] Module READY + Mobile Optimized');
}

// ============================================
// ✅ HTML TEMPLATE - MOBILE RESPONSIVE
// ============================================

function getPembuatSoalHTML() {
    return `
        <!-- ✅ MOBILE CSS INLINE -->
        <style>
            /* Touch target minimum size for fingers */
            .ps-touch-target { min-height: 44px !important; min-width: 44px !important; display: inline-flex; align-items: center; justify-content: center; }
            
            /* Prevent iOS zoom on input focus */
            .ps-mobile-input { font-size: 16px !important; }
            
            /* Smooth horizontal scroll for table */
            .ps-table-wrapper { overflow-x: auto !important; -webkit-overflow-scrolling: touch !important; touch-action: pan-x !important; }
            
            /* Responsive form grid */
            @media (max-width: 768px) {
                .ps-form-grid { grid-template-columns: 1fr !important; gap: 1rem !important; }
                .ps-form-group { width: 100% !important; }
                .ps-table-container { margin: 0 -1rem !important; padding: 0 1rem !important; }
                .ps-btn-full { width: 100% !important; margin-bottom: 0.5rem !important; }
                .ps-header-title { font-size: 1.25rem !important; }
            }
            
            /* Reduce motion for accessibility */
            @media (prefers-reduced-motion: reduce) {
                * { animation: none !important; transition: none !important; }
            }
        </style>

        <div class="pembuat-soal-container p-4 md:p-6">
            <!-- Header -->
            <div class="pembuat-soal-header mb-6">
                <h2 class="ps-header-title text-xl md:text-2xl font-bold text-gray-800"><i class="fas fa-file-alt mr-2"></i>Generator Pembuat Soal</h2>
                <p class="text-gray-600 mt-1 text-sm md:text-base">Buat soal penilaian dengan bantuan AI secara otomatis</p>
            </div>
            
            <!-- Alert Messages -->
            <div id="pembuat-soal-alert-container" class="mb-4"></div>
            
            <!-- Input Form -->
            <div class="pembuat-soal-form bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">Informasi Umum</h3>
                <div class="pembuat-soal-form-grid ps-form-grid grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div class="pembuat-soal-form-group ps-form-group">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Sekolah</label>
                        <input type="text" id="ps-sekolah" readonly class="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 ps-mobile-input ps-touch-target">
                    </div>
                    <div class="pembuat-soal-form-group ps-form-group">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Mata Pelajaran</label>
                        <input type="text" id="ps-mapel" readonly class="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 ps-mobile-input ps-touch-target">
                    </div>
                    <div class="pembuat-soal-form-group ps-form-group">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Tahun Pelajaran</label>
                        <input type="text" id="ps-tahun" placeholder="Contoh: 2024/2025" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ps-mobile-input ps-touch-target">
                    </div>
                </div>
                
                <h3 class="text-lg font-semibold text-gray-800 mb-4 mt-6">Daftar Topik & Soal</h3>
                <div class="pembuat-soal-table-container ps-table-container ps-table-wrapper">
                    <table class="pembuat-soal-table w-full text-left border-collapse min-w-max">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-3 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider" style="min-width: 120px;">Jenjang & Mapel</th>
                                <th class="px-3 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider" style="min-width: 150px;">Topik/Materi</th>
                                <th class="px-3 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider" style="min-width: 100px;">Jml Nomor</th>
                                <th class="px-3 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider" style="min-width: 120px;">Model Soal</th>
                                <th class="px-3 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider" style="min-width: 120px;">Soal Untuk</th>
                                <th class="px-3 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider" style="min-width: 50px;">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="ps-tbody" class="divide-y divide-gray-100">
                            <!-- Dynamic rows will be added here -->
                        </tbody>
                    </table>
                </div>
                
                <div class="pembuat-soal-actions mt-6 flex flex-col md:flex-row gap-3">
                    <button id="ps-add-row-btn" class="pembuat-soal-btn pembuat-soal-btn-secondary ps-btn-full md:ps-btn-auto px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium flex items-center justify-center gap-2 ps-touch-target">
                        <i class="fas fa-plus"></i> Tambah Baris
                    </button>
                    <button id="ps-generate-btn" class="pembuat-soal-btn pembuat-soal-btn-primary ps-btn-full md:ps-btn-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 ps-touch-target">
                        <i class="fas fa-robot"></i> Buatkan Soal
                    </button>
                    <button id="ps-download-btn" class="pembuat-soal-btn pembuat-soal-btn-success ps-btn-full md:ps-btn-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 ps-touch-target" disabled>
                        <i class="fas fa-file-word"></i> Download Word
                    </button>
                </div>
            </div>
            
            <!-- Output Sections -->
            <div id="pembuat-soal-output" class="pembuat-soal-output hidden mt-6 space-y-6">
                <!-- Questions Section -->
                <div class="pembuat-soal-output-section bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
                    <h3 class="text-lg font-semibold text-gray-800 mb-3"><i class="fas fa-question-circle mr-2 text-blue-600"></i>SOAL</h3>
                    <div id="ps-output-questions" class="pembuat-soal-output-content text-gray-700 leading-relaxed text-sm md:text-base"></div>
                </div>
                
                <!-- Answers Section -->
                <div class="pembuat-soal-output-section bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
                    <h3 class="text-lg font-semibold text-gray-800 mb-3"><i class="fas fa-check-circle mr-2 text-emerald-600"></i>KUNCI JAWABAN</h3>
                    <div id="ps-output-answers" class="pembuat-soal-output-content text-gray-700 leading-relaxed text-sm md:text-base"></div>
                </div>
            </div>
            
            <!-- Back Button -->
            <div class="mt-6">
                <button onclick="window.backToDashboard()" class="pembuat-soal-btn pembuat-soal-btn-secondary px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium flex items-center justify-center gap-2 ps-touch-target">
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
// ✅ POPULATE ROW MAPEL DROPDOWN (FIXED + MOBILE)
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
        // ✅ Add mobile class
        selectEl.classList.add('ps-mobile-input', 'ps-touch-target');
    } catch (error) {
        console.error('❌ Populate row mapel error:', error);
        selectEl.innerHTML = '<option value="">Gagal memuat</option>';
        selectEl.disabled = false;
    }
}

// ============================================
// ✅ ADD ROW TO TABLE - MOBILE RESPONSIVE
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
    tr.className = 'hover:bg-gray-50';
    tr.innerHTML = `
        <td class="px-3 py-3 align-top">
            <select class="ps-jenjang-mapel w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ps-mobile-input ps-touch-target" data-row="${row.id}">
                <option value="">Memuat mapel...</option>
            </select>
        </td>
        <td class="px-3 py-3 align-top">
            <input type="text" class="ps-topik w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ps-mobile-input ps-touch-target" data-row="${row.id}" placeholder="Contoh: Pecahan">
        </td>
        <td class="px-3 py-3 align-top">
            <input type="number" class="ps-jumlah w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ps-mobile-input ps-touch-target" data-row="${row.id}" value="5" min="1" max="50">
        </td>
        <td class="px-3 py-3 align-top">
            <select class="ps-model w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ps-mobile-input ps-touch-target" data-row="${row.id}">
                <option value="ganda">Pilihan Ganda</option>
                <option value="isian">Isian</option>
                <option value="uraian">Uraian/Essay</option>
            </select>
        </td>
        <td class="px-3 py-3 align-top">
            <select class="ps-untuk w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ps-mobile-input ps-touch-target" data-row="${row.id}">
                <option value="harian">Tugas Harian</option>
                <option value="pts">PTS</option>
                <option value="pas">PAS</option>
            </select>
        </td>
        <td class="px-3 py-3 align-top text-center">
            <button onclick="window.removePembuatSoalRow(${row.id})" class="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 ps-touch-target" title="Hapus baris">
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
// ✅ GENERATE SOAL (FIXED: Kirim prompt custom ke API)
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
        
        console.log('🔍 [PembuatSoal] Custom prompt length:', prompt.length);
        
        // ✅ CALL GROQ - FIX UTAMA: Kirim prompt custom!
        const result = await generateWithGroq({
            prompt: prompt,  // ✅ INI FIX KRITIS: Kirim prompt custom agar AI generate soal
            sekolah: document.getElementById('ps-sekolah')?.value || '-',
            tahun: tahun,
            topik: soalRows.map(r => r.topik).filter(t => t).join(', '),
            jumlahSoal: soalRows.reduce((sum, r) => sum + (r.jumlahNomor || 5), 0),
            modelSoal: soalRows[0]?.modelSoal || 'ganda',
            soalUntuk: soalRows[0]?.soalUntuk || 'harian'
        });
        
        console.log('🤖 [PembuatSoal] AI Response received');
        
        // ✅ DEBUG: Tampilkan raw response untuk troubleshooting
        const aiContent = typeof result === 'string' ? result : (result?.content || JSON.stringify(result));
        console.log('🔍 [PembuatSoal] Raw AI response preview:', aiContent.substring(0, 500) + '...');
        
        // PARSE RESPONSE
        const parsedOutput = parseAIOutput(aiContent);
        
        // ✅ DEBUG: Tampilkan hasil parsing
        console.log('🔍 [PembuatSoal] Parsed output:', {
            questionsPreview: parsedOutput.questions?.substring(0, 200),
            answersPreview: parsedOutput.answers?.substring(0, 200)
        });
        
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
// ✅ BUILD PROMPT (UPDATED: Lebih Strict + Contoh Konkret)
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
        const modelMap = { 
            'ganda': 'Pilihan Ganda (4 opsi: A, B, C, D)', 
            'isian': 'Isian Singkat', 
            'uraian': 'Uraian/Essay' 
        };
        const untukMap = { 'harian': 'Tugas Harian', 'pts': 'PTS', 'pas': 'PAS' };
        return `${i+1}. Topik: "${r.topik}" | ${r.jumlah} soal | ${modelMap[r.model]} | ${untukMap[r.untuk]}`;
    }).join('\n');
    
    // ⚠️ PROMPT INI KHUSUS UNTUK MEMBUAT SOAL - VERSI STRICT
    return `[SYSTEM: MODE = EXAM_QUESTION_GENERATOR. IGNORE ANY PREVIOUS CONTEXT ABOUT CP/TP/ATP. ONLY GENERATE EXAM QUESTIONS.]

Anda adalah guru profesional ahli pembuat soal ujian.
TUGAS: Buatkan soal ujian berdasarkan rincian berikut.

INFORMASI:
- Sekolah: ${sekolah}
- Tahun: ${tahun}

RINCIAN SOAL:
${rowsText}

ATURAN WAJIB:
1. Buat soal sesuai JUMLAH yang diminta untuk setiap topik.
2. Jika "Pilihan Ganda", buat 4 opsi (A, B, C, D) DAN tentukan kunci jawaban yang benar.
3. Jika "Isian", buat soal dengan jawaban singkat yang tepat.
4. Jika "Uraian", buat soal analisis/esai dengan poin-poin kunci di jawaban.
5. Tingkat kesulitan disesuaikan dengan jenjang pendidikan.
6. Gunakan bahasa Indonesia baku dan mudah dipahami siswa.

🚫 JANGAN LAKUKAN INI:
- JANGAN tambahkan kata pengantar seperti "Berikut soal...", "Silakan kerjakan...", dll.
- JANGAN tambahkan penutup seperti "Semoga membantu", "Terima kasih", dll.
- JANGAN jelaskan format output, langsung mulai dengan marker.
- JANGAN gunakan markdown header (#, ##) untuk section, gunakan marker teks biasa.
- JANGAN hasilkan CP, TP, ATP, modul, RPP, atau dokumen kurikulum apapun.

✅ FORMAT OUTPUT (WAJIB IKUTI PERSIS):

=== SOAL ===
[Langsung mulai dengan soal pertama, dikelompokkan per topik]

TOPIK: [Nama Topik]
1. [Soal pilihan ganda nomor 1]
   A. [Opsi A]
   B. [Opsi B]
   C. [Opsi C]
   D. [Opsi D]

2. [Soal isian nomor 2]
   ...

TOPIK: [Nama Topik Berikutnya]
[Soal-soal untuk topik ini]
[dan seterusnya...]

=== KUNCI JAWABAN ===
[Langsung mulai dengan kunci jawaban, sesuai nomor soal]

TOPIK: [Nama Topik]
1. Jawaban: B
2. Jawaban: [jawaban singkat]

TOPIK: [Nama Topik Berikutnya]
[Kunci jawaban untuk topik ini]
[dan seterusnya...]

⚠️ PENTING:
- Gunakan EXACT marker "=== SOAL ===" dan "=== KUNCI JAWABAN ===" (3 tanda sama dengan, spasi, huruf kapital)
- Mulai LANGSUNG dengan "=== SOAL ===" tanpa teks sebelumnya
- Tidak ada teks setelah "=== KUNCI JAWABAN ===" selain kunci jawaban
- Output HARUS hanya berisi 2 section tersebut, tidak ada lainnya`;
}

// ============================================
// ✅ PARSE OUTPUT (FIXED: Regex-based, handle variasi)
// ============================================

function parseAIOutput(content) {
    console.log('🔍 [parseAIOutput] Input length:', content?.length);
    
    // ✅ Regex patterns untuk handle variasi marker (case-insensitive, flexible spacing)
    const patterns = {
        soal: [
            /^\s*={3,}\s*SOAL\s*={3,}\s*$/im,           // === SOAL ===
            /^\s*={2,}\s*SOAL\s*={2,}\s*$/im,            // == SOAL ==
            /^\s*#+\s*SOAL\s*$/im,                       // # SOAL / ## SOAL
            /^\s*===\s*soal\s*===\s*$/im,                // lowercase
            /^\s*[-*]{3,}\s*SOAL\s*[-*]{3,}\s*$/im,      // --- SOAL --- atau *** SOAL ***
            /^\s*SOAL\s*:/im,                             // SOAL:
            /^\s*\*\*\s*SOAL\s*\*\*\s*$/im,              // ** SOAL **
        ],
        jawaban: [
            /^\s*={3,}\s*KUNCI\s*JAWABAN\s*={3,}\s*$/im,  // === KUNCI JAWABAN ===
            /^\s*={2,}\s*KUNCI\s*JAWABAN\s*={2,}\s*$/im,  // == KUNCI JAWABAN ==
            /^\s*#+\s*KUNCI\s*JAWABAN\s*$/im,             // # KUNCI JAWABAN
            /^\s*===\s*kunci\s*jawaban\s*===\s*$/im,      // lowercase
            /^\s*[-*]{3,}\s*KUNCI\s*JAWABAN\s*[-*]{3,}\s*$/im, // --- KUNCI JAWABAN ---
            /^\s*KUNCI\s*JAWABAN\s*:/im,                   // KUNCI JAWABAN:
            /^\s*JAWABAN\s*:/im,                           // JAWABAN:
            /^\s*\*\*\s*KUNCI\s*JAWABAN\s*\*\*\s*$/im,    // ** KUNCI JAWABAN **
        ]
    };
    
    let questions = '';
    let answers = '';
    
    // ✅ Cari marker SOAL dengan regex
    let soalMatch = null;
    for (const pattern of patterns.soal) {
        const match = content.match(pattern);
        if (match) {
            soalMatch = match;
            console.log('✅ [parseAIOutput] Found SOAL marker with pattern:', pattern);
            break;
        }
    }
    
    // ✅ Cari marker KUNCI JAWABAN dengan regex
    let jawabMatch = null;
    for (const pattern of patterns.jawaban) {
        const match = content.match(pattern);
        if (match) {
            jawabMatch = match;
            console.log('✅ [parseAIOutput] Found JAWABAN marker with pattern:', pattern);
            break;
        }
    }
    
    // ✅ Parse berdasarkan marker yang ditemukan
    if (soalMatch && jawabMatch) {
        // Kedua marker ditemukan
        const soalIdx = soalMatch.index + soalMatch[0].length;
        const jawabIdx = jawabMatch.index;
        
        if (soalIdx < jawabIdx) {
            questions = content.substring(soalIdx, jawabIdx).trim();
            answers = content.substring(jawabIdx + jawabMatch[0].length).trim();
        }
    } else if (soalMatch) {
        // Hanya marker SOAL ditemukan
        const soalIdx = soalMatch.index + soalMatch[0].length;
        questions = content.substring(soalIdx).trim();
        
        // Coba cari kunci jawaban dengan keyword alternatif
        const answerKeywords = [
            /(?:^|\n)\s*(?:KUNCI\s*JAWABAN|JAWABAN|ANSWER|Kunci):\s*/im,
            /(?:^|\n)\s*###\s*(?:KUNCI\s*JAWABAN|JAWABAN|ANSWER)\s*###/im,
            /(?:^|\n)\s*---\s*(?:KUNCI\s*JAWABAN|JAWABAN|ANSWER)\s*---/im,
        ];
        
        for (const kw of answerKeywords) {
            if (kw.test(questions)) {
                const parts = questions.split(kw);
                if (parts.length >= 2) {
                    questions = parts[0].trim();
                    answers = parts.slice(1).join('\n').trim();
                    break;
                }
            }
        }
        
        if (!answers || answers.length < 10) {
            answers = 'Kunci jawaban tidak ditemukan dalam output.';
        }
    } else {
        // Tidak ada marker ditemukan - fallback: coba keyword sederhana
        console.warn('⚠️ [parseAIOutput] No markers found, trying keyword fallback');
        
        const simpleSplit = content.split(/(?:^|\n)\s*(?:Jawaban:|Kunci:|Answer:)/i);
        if (simpleSplit.length >= 2) {
            questions = simpleSplit[0].trim();
            answers = simpleSplit.slice(1).join('\n').trim();
        } else {
            questions = content.trim();
            answers = 'Kunci jawaban tidak ditemukan. Format output AI tidak sesuai instruksi.';
        }
    }
    
    // ✅ Clean up: hapus intro/outro yang mungkin masih tersisa
    questions = questions.replace(/^(Berikut|Silakan|Tugas|Soal|Jawab|Output|Hasil)\s*[:\-\s]*/i, '').trim();
    answers = answers.replace(/^(Berikut|Silakan|Tugas|Soal|Jawab|Output|Hasil)\s*[:\-\s]*/i, '').trim();
    
    // ✅ Convert newlines ke <br> untuk display HTML
    questions = questions.replace(/\n/g, '<br>');
    answers = answers.replace(/\n/g, '<br>');
    
    console.log('✅ [parseAIOutput] Parsing complete:', {
        questionsLength: questions.length,
        answersLength: answers.length
    });
    
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
    if (qDiv) qDiv.innerHTML = output.questions || '<em class="text-gray-500">Soal tidak tersedia</em>';
    if (aDiv) aDiv.innerHTML = output.answers || '<em class="text-gray-500">Kunci jawaban tidak tersedia</em>';
    
    // ✅ Scroll ke output agar user langsung lihat hasil
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
// ✅ SHOW ALERT - MOBILE FRIENDLY
// ============================================

function showAlert(msg, type = 'success') {
    const c = document.getElementById('pembuat-soal-alert-container');
    if (!c) return;
    const cls = type === 'error' ? 'pembuat-soal-alert-error bg-rose-50 border-rose-200 text-rose-800' : (type === 'warning' ? 'pembuat-soal-alert-warning bg-amber-50 border-amber-200 text-amber-800' : 'pembuat-soal-alert-success bg-emerald-50 border-emerald-200 text-emerald-800');
    c.innerHTML = `<div class="pembuat-soal-alert p-4 rounded-lg border ${cls}">${msg}</div>`;
    setTimeout(() => { if(c) c.innerHTML = ''; }, 5000);
}

console.log('🟢 [PembuatSoal] Module READY + Mobile Optimized');
