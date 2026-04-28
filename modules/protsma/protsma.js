/**
 * ============================================
 * PROTA & PROMES GENERATOR - Main Logic
 * Folder: modules/protsma/protsma.js
 * FINAL FIX: AI Response Parsing + Button IDs
 * ============================================
 */

console.log('🔴 [Protsma] Module START');

// ✅ STATIC IMPORT FIREBASE
import { 
  db, auth, collection, addDoc, query, where, orderBy, 
  onSnapshot, doc, getDoc, serverTimestamp, getDocs 
} from '../firebase-config.js';

console.log('✅ [Protsma] Firebase imports successful');

// ✅ STATIC IMPORT GROQ API
import { generateWithGroq } from '../groq-api.js';

console.log('✅ [Protsma] Groq API import successful');

let protsmaData = { prota: [], promes: [] };
let currentTab = 'prota';

export async function renderProtsma() {
    console.log('📊 [Protsma] renderProtsma called');

    const container = document.getElementById('protsma-container');
    if (!container) {
        console.error('❌ [Protsma] Container #protsma-container not found!');
        return;
    }

    const isApproved = window.isUserApproved?.() || window.currentUserRole === 'admin';
    if (!isApproved) {
        container.innerHTML = `
            <div class="protsma-container">
                <div class="protsma-alert protsma-alert-warning">
                    <i class="fas fa-lock mr-2"></i>
                    Akun Anda masih menunggu persetujuan admin.
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = getProtsmaHTML();
    loadProtsmaCSS();
    
    setTimeout(() => {
        initProtsmaListeners();
        console.log('✅ [Protsma] Event listeners attached');
    }, 150);
    
    await loadSavedData();
    console.log('🟢 [Protsma] Module READY');
}

function getProtsmaHTML() {
    return `
        <style>
            .protsma-container { max-width: 1200px; margin: auto; padding: 20px; font-family: system-ui, sans-serif; }
            .protsma-header { text-align: center; margin-bottom: 24px; }
            .protsma-header h2 { color: #0891b2; margin-bottom: 8px; }
            .protsma-alert { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-weight: 500; }
            .protsma-alert-success { background: #dcfce7; color: #166534; }
            .protsma-alert-error { background: #fee2e2; color: #991b1b; }
            .protsma-alert-warning { background: #fef3c7; color: #92400e; }
            .protsma-tabs { display: flex; gap: 8px; margin-bottom: 20px; border-bottom: 2px solid #e5e7eb; }
            .protsma-tab { padding: 10px 20px; border: none; background: #f3f4f6; border-radius: 8px 8px 0 0; cursor: pointer; font-weight: 500; }
            .protsma-tab.active { background: #0891b2; color: white; }
            .protsma-content { display: none; }
            .protsma-content.active { display: block; }
            .protsma-form { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px; }
            .protsma-form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
            .protsma-form-group label { display: block; font-weight: 600; margin-bottom: 6px; color: #374151; }
            .protsma-form-group input, .protsma-form-group select { width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; }
            .protsma-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 20px; }
            .protsma-btn { padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; display: flex; align-items: center; gap: 6px; }
            .protsma-btn-primary { background: #0891b2; color: white; }
            .protsma-btn-success { background: #10b981; color: white; }
            .protsma-btn-secondary { background: #6b7280; color: white; }
            .protsma-ai-btn { background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; }
            .protsma-btn:disabled { opacity: 0.6; cursor: not-allowed; }
            .protsma-table-container { overflow-x: auto; background: white; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .protsma-table { width: 100%; border-collapse: collapse; }
            .protsma-table th { background: #0891b2; color: white; padding: 12px; text-align: left; font-weight: 600; }
            .protsma-table td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
            .protsma-table tr:hover { background: #f9fafb; }
            @media (max-width: 768px) { .protsma-form-grid { grid-template-columns: 1fr; } .protsma-actions { flex-direction: column; } }
        </style>
        <div class="protsma-container">
            <div class="protsma-header">
                <h2><i class="fas fa-calendar-alt mr-2"></i>Generator Prota & Promes</h2>
                <p>Buat Program Tahunan dan Semester dengan bantuan AI</p>
            </div>
            <div id="protsma-alert-container"></div>
            <div class="protsma-tabs">
                <button class="protsma-tab active" data-tab="prota">Prota</button>
                <button class="protsma-tab" data-tab="promes">Promes</button>
            </div>
            <div id="prota-content" class="protsma-content active">
                <div class="protsma-form">
                    <div class="protsma-form-grid">
                        <div class="protsma-form-group">
                            <label>Jenjang</label>
                            <select id="protsma-jenjang">
                                <option value="">Pilih Jenjang</option>
                                <option value="tk">TK</option>
                                <option value="sd">SD</option>
                                <option value="mi">MI</option>
                                <option value="smp">SMP</option>
                                <option value="mts">MTs</option>
                                <option value="sma">SMA</option>
                                <option value="ma">MA</option>
                            </select>
                        </div>
                        <div class="protsma-form-group">
                            <label>Kelas</label>
                            <select id="protsma-kelas" disabled>
                                <option value="">Pilih Kelas</option>
                            </select>
                        </div>
                        <div class="protsma-form-group">
                            <label>Mapel</label>
                            <input type="text" id="protsma-mapel" placeholder="Contoh: Matematika">
                        </div>
                        <div class="protsma-form-group">
                            <label>Topik/Materi</label>
                            <input type="text" id="protsma-topik" placeholder="Contoh: Pecahan">
                        </div>
                        <div class="protsma-form-group">
                            <label>Minggu Ke-</label>
                            <input type="number" id="protsma-minggu" placeholder="1" min="1">
                        </div>
                        <div class="protsma-form-group">
                            <label>Alokasi Waktu (JP)</label>
                            <input type="number" id="protsma-alokasi" placeholder="2" min="1">
                        </div>
                    </div>
                    <div class="protsma-actions">
                        <button id="protsma-ai-btn" class="protsma-ai-btn">
                            <i class="fas fa-robot"></i> Bantu Isi dengan AI
                        </button>
                        <button id="protsma-add-btn" class="protsma-btn protsma-btn-secondary">
                            <i class="fas fa-plus"></i> Tambah Baris
                        </button>
                        <button id="protsma-generate-btn" class="protsma-btn protsma-btn-primary">
                            <i class="fas fa-magic"></i> Generate Tabel
                        </button>
                        <button id="protsma-save-btn" class="protsma-btn protsma-btn-success">
                            <i class="fas fa-save"></i> Simpan ke Firebase
                        </button>
                        <button id="protsma-pdf-btn" class="protsma-btn protsma-btn-secondary">
                            <i class="fas fa-file-pdf"></i> Download PDF
                        </button>
                    </div>
                </div>
                <div class="protsma-table-container">
                    <table class="protsma-table" id="prota-table">
                        <thead>
                            <tr>
                                <th>Kelas</th>
                                <th>Mapel</th>
                                <th>Topik</th>
                                <th>Minggu</th>
                                <th>Alokasi (JP)</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="prota-tbody">
                            <tr><td colspan="6" class="text-center py-8 text-gray-500">Belum ada data. Isi form dan klik "Tambah Baris"</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div id="promes-content" class="protsma-content">
                <div class="protsma-form">
                    <div class="protsma-form-grid">
                        <div class="protsma-form-group">
                            <label>Jenjang</label>
                            <select id="promes-jenjang">
                                <option value="">Pilih Jenjang</option>
                                <option value="tk">TK</option>
                                <option value="sd">SD</option>
                                <option value="mi">MI</option>
                                <option value="smp">SMP</option>
                                <option value="mts">MTs</option>
                                <option value="sma">SMA</option>
                                <option value="ma">MA</option>
                            </select>
                        </div>
                        <div class="protsma-form-group">
                            <label>Kelas</label>
                            <select id="promes-kelas" disabled>
                                <option value="">Pilih Kelas</option>
                            </select>
                        </div>
                        <div class="protsma-form-group">
                            <label>Mapel</label>
                            <input type="text" id="promes-mapel" placeholder="Contoh: Matematika">
                        </div>
                        <div class="protsma-form-group">
                            <label>Topik/Materi</label>
                            <input type="text" id="promes-topik" placeholder="Contoh: Pecahan">
                        </div>
                        <div class="protsma-form-group">
                            <label>Bulan</label>
                            <select id="promes-bulan">
                                <option value="">Pilih Bulan</option>
                                <option value="1">Januari</option>
                                <option value="2">Februari</option>
                                <option value="3">Maret</option>
                                <option value="4">April</option>
                                <option value="5">Mei</option>
                                <option value="6">Juni</option>
                                <option value="7">Juli</option>
                                <option value="8">Agustus</option>
                                <option value="9">September</option>
                                <option value="10">Oktober</option>
                                <option value="11">November</option>
                                <option value="12">Desember</option>
                            </select>
                        </div>
                        <div class="protsma-form-group">
                            <label>Minggu Ke-</label>
                            <input type="number" id="promes-minggu" placeholder="1" min="1">
                        </div>
                        <div class="protsma-form-group">
                            <label>Alokasi Waktu (JP)</label>
                            <input type="number" id="promes-alokasi" placeholder="2" min="1">
                        </div>
                    </div>
                    <div class="protsma-actions">
                        <button id="promes-ai-btn" class="protsma-ai-btn">
                            <i class="fas fa-robot"></i> Bantu Isi dengan AI
                        </button>
                        <button id="promes-add-btn" class="protsma-btn protsma-btn-secondary">
                            <i class="fas fa-plus"></i> Tambah Baris
                        </button>
                        <button id="promes-generate-btn" class="protsma-btn protsma-btn-primary">
                            <i class="fas fa-magic"></i> Generate Tabel
                        </button>
                        <button id="promes-save-btn" class="protsma-btn protsma-btn-success">
                            <i class="fas fa-save"></i> Simpan ke Firebase
                        </button>
                        <button id="promes-pdf-btn" class="protsma-btn protsma-btn-secondary">
                            <i class="fas fa-file-pdf"></i> Download PDF
                        </button>
                    </div>
                </div>
                <div class="protsma-table-container">
                    <table class="protsma-table" id="promes-table">
                        <thead>
                            <tr>
                                <th>Kelas</th>
                                <th>Mapel</th>
                                <th>Topik</th>
                                <th>Bulan</th>
                                <th>Minggu</th>
                                <th>Alokasi (JP)</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="promes-tbody">
                            <tr><td colspan="7" class="text-center py-8 text-gray-500">Belum ada data. Isi form dan klik "Tambah Baris"</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="mt-6">
                <button onclick="window.backToDashboard?.()" class="protsma-btn protsma-btn-secondary">
                    <i class="fas fa-arrow-left mr-2"></i>Kembali ke Dashboard
                </button>
            </div>
        </div>
    `;
}

function loadProtsmaCSS() {
    const linkId = 'protsma-css';
    if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = './modules/protsma/protsma.css';
        link.onerror = () => console.log('⚠️ [Protsma] External CSS failed, using inline styles');
        document.head.appendChild(link);
    }
}

function initProtsmaListeners() {
    console.log('🔧 [Protsma] Initializing event listeners...');
    
    document.querySelectorAll('.protsma-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            console.log('📑 [Protsma] Tab clicked:', e.target.dataset.tab);
            switchTab(e.target.dataset.tab);
        });
    });

    ['prota', 'promes'].forEach(type => {
        const prefix = type === 'prota' ? 'protsma' : 'promes';
        console.log(`🔧 [Protsma] Setting up listeners for ${type} (prefix: ${prefix})`);
        
        const jenjangSelect = document.getElementById(`${prefix}-jenjang`);
        if (jenjangSelect) {
            jenjangSelect.addEventListener('change', () => updateKelasOptions(type));
        }
        
        const aiBtn = document.getElementById(`${prefix}-ai-btn`);
        if (aiBtn) {
            aiBtn.addEventListener('click', async () => {
                console.log(`🤖 [Protsma] ${type} AI button clicked`);
                await callAIForHelp(type);
            });
        }
        
        const addBtn = document.getElementById(`${prefix}-add-btn`);
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                console.log(`➕ [Protsma] ${type} add row clicked`);
                addDataRow(type);
            });
        }
        
        const genBtn = document.getElementById(`${prefix}-generate-btn`);
        if (genBtn) {
            genBtn.addEventListener('click', () => {
                console.log(`✨ [Protsma] ${type} generate clicked`);
                generateTable(type);
            });
        }
        
        const saveBtn = document.getElementById(`${prefix}-save-btn`);
        if (saveBtn) {
            saveBtn.addEventListener('click', async () => {
                console.log(`💾 [Protsma] ${type} save clicked`);
                await saveToFirebase(type);
            });
        }
        
        const pdfBtn = document.getElementById(`${prefix}-pdf-btn`);
        if (pdfBtn) {
            pdfBtn.addEventListener('click', () => {
                console.log(`📄 [Protsma] ${type} PDF clicked`);
                downloadPDF(type);
            });
        }
    });
    
    console.log('✅ [Protsma] All event listeners attached');
}

function switchTab(tabName) {
    currentTab = tabName;
    document.querySelectorAll('.protsma-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    document.querySelectorAll('.protsma-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-content`);
    });
    console.log('📑 [Protsma] Switched to tab:', tabName);
}

function updateKelasOptions(type) {
    const prefix = type === 'prota' ? 'protsma' : 'promes';
    const jenjang = document.getElementById(`${prefix}-jenjang`).value;
    const kelasSelect = document.getElementById(`${prefix}-kelas`);

    if (!jenjang) {
        kelasSelect.disabled = true;
        kelasSelect.innerHTML = '<option value="">Pilih Kelas</option>';
        return;
    }

    const kelasMap = {
        'tk': ['A', 'B'], 'sd': ['1', '2', '3', '4', '5', '6'], 'mi': ['1', '2', '3', '4', '5', '6'],
        'smp': ['7', '8', '9'], 'mts': ['7', '8', '9'], 'sma': ['10', '11', '12'], 'ma': ['10', '11', '12']
    };

    const kelasList = kelasMap[jenjang] || [];
    kelasSelect.innerHTML = '<option value="">Pilih Kelas</option>' +
        kelasList.map(k => `<option value="${k}">Kelas ${k}</option>`).join('');
    kelasSelect.disabled = false;
}

// ✅ FIX: Robust AI Response Parsing
async function callAIForHelp(type) {
    const prefix = type === 'prota' ? 'protsma' : 'promes';
    const jenjang = document.getElementById(`${prefix}-jenjang`).value;
    const kelas = document.getElementById(`${prefix}-kelas`).value;
    const topik = document.getElementById(`${prefix}-topik`).value;
    const aiBtn = document.getElementById(`${prefix}-ai-btn`);

    if (!topik) {
        showAlert(type, 'Silakan isi Topik/Materi terlebih dahulu', 'warning');
        return;
    }

    aiBtn.disabled = true;
    aiBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses AI...';

    try {
        console.log('🤖 [Protsma] Calling Groq API with prompt...');
        
        // ✅ FIX: Prompt yang lebih spesifik minta format sederhana
        const prompt = `Buatkan rencana singkat untuk Prota/Promes:
Jenjang: ${jenjang?.toUpperCase()}
Kelas: ${kelas}
Topik: ${topik}

Balas HANYA JSON sederhana dengan 2 field angka:
{"minggu": 6, "alokasi": 2}

Jangan pakai array, jangan pakai objek nested. Hanya 2 angka.`;

        const result = await generateWithGroq(prompt);
        console.log('🤖 [Protsma] AI raw response:', result);

        // ✅ FIX: Extract JSON yang valid
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('AI tidak mengembalikan format JSON');

        let aiResult;
        try {
            aiResult = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
            console.error('❌ JSON parse error:', parseError);
            throw new Error('Gagal parse respon AI');
        }

        // ✅ FIX: Handle berbagai format respon AI
        let mingguValue = aiResult.minggu;
        let alokasiValue = aiResult.alokasi;

        // Jika alokasi adalah array, ambil nilai pertama yang numeric
        if (Array.isArray(alokasiValue)) {
            const firstItem = alokasiValue[0];
            if (typeof firstItem === 'object' && firstItem.alokasi !== undefined) {
                alokasiValue = firstItem.alokasi;
            } else if (typeof firstItem === 'number') {
                alokasiValue = firstItem;
            }
        }

        // Konversi ke number dan validasi
        const mingguNum = parseInt(mingguValue, 10);
        const alokasiNum = typeof alokasiValue === 'number' ? alokasiValue : parseFloat(alokasiValue);

        if (!isNaN(mingguNum) && mingguNum > 0) {
            document.getElementById(`${prefix}-minggu`).value = mingguNum;
        }
        if (!isNaN(alokasiNum) && alokasiNum > 0) {
            document.getElementById(`${prefix}-alokasi`).value = alokasiNum;
        }

        console.log(`✅ [Protsma] AI parsed: minggu=${mingguNum}, alokasi=${alokasiNum}`);
        showAlert(type, '✅ AI berhasil mengisi Minggu dan Alokasi!', 'success');

    } catch (error) {
        console.error('❌ [Protsma] AI Error:', error);
        showAlert(type, `❌ Gagal memanggil AI: ${error.message}`, 'error');
    } finally {
        aiBtn.disabled = false;
        aiBtn.innerHTML = '<i class="fas fa-robot"></i> Bantu Isi dengan AI';
    }
}

function addDataRow(type) {
    const prefix = type === 'prota' ? 'protsma' : 'promes';
    const jenjang = document.getElementById(`${prefix}-jenjang`).value;
    const kelas = document.getElementById(`${prefix}-kelas`).value;
    const mapel = document.getElementById(`${prefix}-mapel`).value;
    const topik = document.getElementById(`${prefix}-topik`).value;
    const minggu = document.getElementById(`${prefix}-minggu`).value;
    const alokasi = document.getElementById(`${prefix}-alokasi`).value;
    const bulan = document.getElementById(`${prefix}-bulan`)?.value;

    if (!jenjang || !kelas || !mapel || !topik) {
        showAlert(type, 'Silakan lengkapi Jenjang, Kelas, Mapel, dan Topik!', 'warning');
        return;
    }

    const rowData = {
        jenjang, kelas, mapel, topik,
        minggu: minggu || '1',
        alokasi: alokasi || '2',
        ...(bulan && { bulan })
    };

    protsmaData[type].push(rowData);
    renderTable(type);

    // Clear form fields only (keep jenjang/kelas/mapel for convenience)
    document.getElementById(`${prefix}-topik`).value = '';
    document.getElementById(`${prefix}-minggu`).value = '';
    document.getElementById(`${prefix}-alokasi`).value = '';

    showAlert(type, '✅ Baris berhasil ditambahkan!', 'success');
    console.log(`➕ [Protsma] Added row to ${type}:`, rowData);
}

function renderTable(type) {
    const tbody = document.getElementById(`${type}-tbody`);
    if (!tbody) {
        console.error(`❌ [Protsma] tbody #${type}-tbody not found!`);
        return;
    }

    const data = protsmaData[type];

    if (data.length === 0) {
        const colspan = type === 'prota' ? 6 : 7;
        tbody.innerHTML = `<tr><td colspan="${colspan}" class="text-center py-8 text-gray-500">Belum ada data. Isi form dan klik "Tambah Baris"</td></tr>`;
        return;
    }

    tbody.innerHTML = data.map((row, index) => `
        <tr>
            <td>Kelas ${row.kelas}</td>
            <td>${row.mapel}</td>
            <td>${row.topik}</td>
            ${type === 'promes' ? `<td>${getBulanName(row.bulan)}</td>` : ''}
            <td>${row.minggu}</td>
            <td>${row.alokasi} JP</td>
            <td>
                <button onclick="window.removeProtsmaRow('${type}', ${index})"
                        class="text-red-600 hover:text-red-800" title="Hapus">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    console.log(`📊 [Protsma] Rendered ${data.length} rows for ${type}`);
}

function getBulanName(bulanNum) {
    const bulanMap = {
        '1': 'Januari', '2': 'Februari', '3': 'Maret', '4': 'April',
        '5': 'Mei', '6': 'Juni', '7': 'Juli', '8': 'Agustus',
        '9': 'September', '10': 'Oktober', '11': 'November', '12': 'Desember'
    };
    return bulanMap[bulanNum] || bulanNum;
}

window.removeProtsmaRow = function(type, index) {
    console.log(`🗑️ [Protsma] Removing row from ${type} at index ${index}`);
    protsmaData[type].splice(index, 1);
    renderTable(type);
};

function generateTable(type) {
    if (protsmaData[type].length === 0) {
        showAlert(type, 'Belum ada data untuk digenerate!', 'warning');
        return;
    }
    showAlert(type, `✅ Tabel ${type.toUpperCase()} berhasil digenerate dengan ${protsmaData[type].length} baris!`, 'success');
    console.log(`✨ [Protsma] Generated table for ${type} with ${protsmaData[type].length} rows`);
}

async function saveToFirebase(type) {
    if (protsmaData[type].length === 0) {
        showAlert(type, 'Tidak ada data untuk disimpan!', 'warning');
        return;
    }

    const prefix = type === 'prota' ? 'protsma' : 'promes';
    const saveBtn = document.getElementById(`${prefix}-save-btn`);
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';

    try {
        console.log('💾 [Protsma] Saving to Firebase...');
        
        const user = auth.currentUser;
        if (!user) throw new Error('User tidak terautentikasi!');

        await addDoc(collection(db, 'protsma'), {
            uid: user.uid,
            type: type,
            jenjang: document.getElementById(`${prefix}-jenjang`).value,
            kelas: document.getElementById(`${prefix}-kelas`).value,
            data: protsmaData[type],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        showAlert(type, '✅ Data berhasil disimpan ke Firebase!', 'success');
        console.log('💾 [Protsma] Save successful');

    } catch (error) {
        console.error('❌ [Protsma] Save Error:', error);
        showAlert(type, `❌ Gagal menyimpan: ${error.message}`, 'error');
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Simpan ke Firebase';
    }
}

async function loadSavedData() {
    try {
        console.log('📥 [Protsma] Loading saved data...');
        
        const user = auth.currentUser;
        if (!user) {
            console.log('⚠️ [Protsma] No user logged in, skip load');
            return;
        }

        const protaQuery = query(collection(db, 'protsma'), where('uid', '==', user.uid), where('type', '==', 'prota'));
        const protaSnap = await getDocs(protaQuery);

        if (!protaSnap.empty) {
            const lastDoc = protaSnap.docs[protaSnap.docs.length - 1];
            protsmaData.prota = lastDoc.data().data || [];
            renderTable('prota');
            console.log(`📥 [Protsma] Loaded ${protsmaData.prota.length} prota rows`);
        }

        const promesQuery = query(collection(db, 'protsma'), where('uid', '==', user.uid), where('type', '==', 'promes'));
        const promesSnap = await getDocs(promesQuery);

        if (!promesSnap.empty) {
            const lastDoc = promesSnap.docs[promesSnap.docs.length - 1];
            protsmaData.promes = lastDoc.data().data || [];
            renderTable('promes');
            console.log(`📥 [Protsma] Loaded ${protsmaData.promes.length} promes rows`);
        }

    } catch (error) {
        console.error('❌ [Protsma] Load Error:', error);
    }
}

function downloadPDF(type) {
    if (protsmaData[type].length === 0) {
        showAlert(type, 'Tidak ada data untuk diexport!', 'warning');
        return;
    }

    if (typeof html2pdf === 'undefined') {
        showAlert(type, 'Library PDF belum dimuat. Pastikan CDN html2pdf ada di index.html', 'error');
        console.warn('⚠️ [Protsma] html2pdf library not found');
        return;
    }

    const element = document.getElementById(`${type}-table`);
    const opt = {
        margin: 10,
        filename: `Prota_Promes_${type}_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(element).save();
    showAlert(type, '✅ PDF sedang diunduh!', 'success');
    console.log(`📄 [Protsma] PDF download initiated for ${type}`);
}

function showAlert(type, message, status = 'success') {
    const container = document.getElementById('protsma-alert-container');
    if (!container) {
        console.warn('⚠️ [Protsma] Alert container not found');
        return;
    }

    const alertClass = {
        'success': 'protsma-alert-success',
        'error': 'protsma-alert-error',
        'warning': 'protsma-alert-warning'
    }[status];

    container.innerHTML = `<div class="protsma-alert ${alertClass}">${message}</div>`;
    setTimeout(() => { container.innerHTML = ''; }, 5000);
}

console.log('🟢 [Protsma] Module READY — AI Parsing Fixed + All Buttons Work');
