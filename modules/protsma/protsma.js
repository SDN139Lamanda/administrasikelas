/**
 * ============================================
 * PROTA & PROMES GENERATOR - Main Logic
 * Folder: modules/protsma/protsma.js
 * ============================================
 */

console.log('🔴 [Protsma] Module START');

// ============================================
// ✅ GLOBAL STATE
// ============================================

let protsmaData = {
    prota: [],
    promes: []
};

let currentTab = 'prota';

// ============================================
// ✅ MAIN RENDER FUNCTION (Called from dashboard.js)
// ============================================

export async function renderProtsma() {
    console.log('📊 [Protsma] renderProtsma called');
    
    const container = document.getElementById('protsma-container');
    if (!container) {
        console.error('❌ [Protsma] Container not found');
        return;
    }
    
    // ✅ Auth check
    if (!window.isUserApproved?.() && window.currentUserRole !== 'admin') {
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
    
    // Render UI
    container.innerHTML = getProtsmaHTML();
    
    // Load CSS
    loadProtsmaCSS();
    
    // Initialize event listeners
    initProtsmaListeners();
    
    // Load saved data from Firebase
    await loadSavedData();
    
    console.log('🟢 [Protsma] Module READY');
}

// ============================================
// ✅ HTML TEMPLATE
// ============================================

function getProtsmaHTML() {
    return `
        <div class="protsma-container">
            <!-- Header -->
            <div class="protsma-header">
                <h2><i class="fas fa-calendar-alt mr-2"></i>Generator Prota & Promes</h2>
                <p>Buat Program Tahunan dan Semester dengan bantuan AI</p>
            </div>
            
            <!-- Alert Messages -->
            <div id="protsma-alert-container"></div>
            
            <!-- Tabs -->
            <div class="protsma-tabs">
                <button class="protsma-tab active" data-tab="prota">Prota</button>
                <button class="protsma-tab" data-tab="promes">Promes</button>
            </div>
            
            <!-- Prota Content -->
            <div id="prota-content" class="protsma-content active">
                <!-- Input Form -->
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
                
                <!-- Data Table -->
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
            
            <!-- Promes Content -->
            <div id="promes-content" class="protsma-content">
                <!-- Input Form (same as Prota) -->
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
                
                <!-- Data Table -->
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
            
            <!-- Back Button -->
            <div class="mt-6">
                <button onclick="window.backToDashboard()" class="protsma-btn protsma-btn-secondary">
                    <i class="fas fa-arrow-left mr-2"></i>Kembali ke Dashboard
                </button>
            </div>
        </div>
    `;
}

// ============================================
// ✅ LOAD CSS
// ============================================

function loadProtsmaCSS() {
    const linkId = 'protsma-css';
    if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = './modules/protsma/protsma.css';
        document.head.appendChild(link);
    }
}

// ============================================
// ✅ INITIALIZE EVENT LISTENERS
// ============================================

function initProtsmaListeners() {
    // Tab switching
    document.querySelectorAll('.protsma-tab').forEach(tab => {
        tab.addEventListener('click', (e) => switchTab(e.target.dataset.tab));
    });
    
    // Jenjang change → update kelas options
    ['prota', 'promes'].forEach(type => {
        const jenjangSelect = document.getElementById(`${type}-jenjang`);
        if (jenjangSelect) {
            jenjangSelect.addEventListener('change', () => updateKelasOptions(type));
        }
        
        // AI button
        const aiBtn = document.getElementById(`${type}-ai-btn`);
        if (aiBtn) {
            aiBtn.addEventListener('click', () => callAIForHelp(type));
        }
        
        // Add button
        const addBtn = document.getElementById(`${type}-add-btn`);
        if (addBtn) {
            addBtn.addEventListener('click', () => addDataRow(type));
        }
        
        // Generate button
        const genBtn = document.getElementById(`${type}-generate-btn`);
        if (genBtn) {
            genBtn.addEventListener('click', () => generateTable(type));
        }
        
        // Save button
        const saveBtn = document.getElementById(`${type}-save-btn`);
        if (saveBtn) {
            saveBtn.addEventListener('click', () => saveToFirebase(type));
        }
        
        // PDF button
        const pdfBtn = document.getElementById(`${type}-pdf-btn`);
        if (pdfBtn) {
            pdfBtn.addEventListener('click', () => downloadPDF(type));
        }
    });
}

// ============================================
// ✅ TAB SWITCHING
// ============================================

function switchTab(tabName) {
    currentTab = tabName;
    
    // Update tab styles
    document.querySelectorAll('.protsma-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    // Update content visibility
    document.querySelectorAll('.protsma-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-content`);
    });
}

// ============================================
// ✅ UPDATE KELAS OPTIONS BASED ON JENJANG
// ============================================

function updateKelasOptions(type) {
    const jenjang = document.getElementById(`${type}-jenjang`).value;
    const kelasSelect = document.getElementById(`${type}-kelas`);
    
    if (!jenjang) {
        kelasSelect.disabled = true;
        kelasSelect.innerHTML = '<option value="">Pilih Kelas</option>';
        return;
    }
    
    // Kelas options per jenjang
    const kelasMap = {
        'tk': ['A', 'B'],
        'sd': ['1', '2', '3', '4', '5', '6'],
        'mi': ['1', '2', '3', '4', '5', '6'],
        'smp': ['7', '8', '9'],
        'mts': ['7', '8', '9'],
        'sma': ['10', '11', '12'],
        'ma': ['10', '11', '12']
    };
    
    const kelasList = kelasMap[jenjang] || [];
    
    kelasSelect.innerHTML = '<option value="">Pilih Kelas</option>' +
        kelasList.map(k => `<option value="${k}">Kelas ${k}</option>`).join('');
    
    kelasSelect.disabled = false;
}

// ============================================
// ✅ CALL AI FOR HELP (Groq API)
// ============================================

async function callAIForHelp(type) {
    const jenjang = document.getElementById(`${type}-jenjang`).value;
    const kelas = document.getElementById(`${type}-kelas`).value;
    const topik = document.getElementById(`${type}-topik`).value;
    const aiBtn = document.getElementById(`${type}-ai-btn`);
    
    if (!topik) {
        showAlert(type, 'Silakan isi Topik/Materi terlebih dahulu', 'warning');
        return;
    }
    
    // Disable button during AI call
    aiBtn.disabled = true;
    aiBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses AI...';
    
    try {
        // Get Groq API key
        const apiKey = await window.getApiKey?.();
        
        if (!apiKey) {
            showAlert(type, 'API Key tidak ditemukan. Silakan hubungi admin.', 'error');
            return;
        }
        
        // Build prompt for AI
        const prompt = `Bantu saya membuat rencana pembelajaran untuk:
- Jenjang: ${jenjang?.toUpperCase()}
- Kelas: ${kelas}
- Topik: ${topik}

Berikan dalam format JSON:
{
    "minggu": number (minggu ke berapa),
    "alokasi": number (alokasi waktu dalam JP)
}

Hanya berikan JSON, tanpa penjelasan lain.`;
        
        // Call Groq API
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 200
            })
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        const aiContent = data.choices?.[0]?.message?.content || '{}';
        
        // Parse JSON response
        const aiResult = JSON.parse(aiContent.replace(/```json|```/g, '').trim());
        
        // Fill form with AI suggestions
        if (aiResult.minggu) {
            document.getElementById(`${type}-minggu`).value = aiResult.minggu;
        }
        if (aiResult.alokasi) {
            document.getElementById(`${type}-alokasi`).value = aiResult.alokasi;
        }
        
        showAlert(type, '✅ AI berhasil mengisi Minggu dan Alokasi!', 'success');
        
    } catch (error) {
        console.error('❌ [Protsma] AI Error:', error);
        showAlert(type, `❌ Gagal memanggil AI: ${error.message}`, 'error');
    } finally {
        // Re-enable button
        aiBtn.disabled = false;
        aiBtn.innerHTML = '<i class="fas fa-robot"></i> Bantu Isi dengan AI';
    }
}

// ============================================
// ✅ ADD DATA ROW
// ============================================

function addDataRow(type) {
    const prefix = type;
    const jenjang = document.getElementById(`${prefix}-jenjang`).value;
    const kelas = document.getElementById(`${prefix}-kelas`).value;
    const mapel = document.getElementById(`${prefix}-mapel`).value;
    const topik = document.getElementById(`${prefix}-topik`).value;
    const minggu = document.getElementById(`${prefix}-minggu`).value;
    const alokasi = document.getElementById(`${prefix}-alokasi`).value;
    const bulan = document.getElementById(`${prefix}-bulan`)?.value;
    
    // Validation
    if (!jenjang || !kelas || !mapel || !topik) {
        showAlert(type, 'Silakan lengkapi semua field wajib!', 'warning');
        return;
    }
    
    // Add to data array
    const rowData = {
        jenjang,
        kelas,
        mapel,
        topik,
        minggu: minggu || '1',
        alokasi: alokasi || '2',
        ...(bulan && { bulan })
    };
    
    protsmaData[type].push(rowData);
    
    // Update table
    renderTable(type);
    
    // Clear form
    document.getElementById(`${prefix}-topik`).value = '';
    document.getElementById(`${prefix}-minggu`).value = '';
    document.getElementById(`${prefix}-alokasi`).value = '';
    
    showAlert(type, '✅ Baris berhasil ditambahkan!', 'success');
}

// ============================================
// ✅ RENDER TABLE
// ============================================

function renderTable(type) {
    const tbody = document.getElementById(`${type}-tbody`);
    if (!tbody) return;
    
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
                        class="text-red-600 hover:text-red-800">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Helper: Get bulan name
function getBulanName(bulanNum) {
    const bulanMap = {
        '1': 'Januari', '2': 'Februari', '3': 'Maret', '4': 'April',
        '5': 'Mei', '6': 'Juni', '7': 'Juli', '8': 'Agustus',
        '9': 'September', '10': 'Oktober', '11': 'November', '12': 'Desember'
    };
    return bulanMap[bulanNum] || bulanNum;
}

// ============================================
// ✅ REMOVE ROW (Global function for onclick)
// ============================================

window.removeProtsmaRow = function(type, index) {
    protsmaData[type].splice(index, 1);
    renderTable(type);
};

// ============================================
// ✅ GENERATE TABLE (Finalize)
// ============================================

function generateTable(type) {
    if (protsmaData[type].length === 0) {
        showAlert(type, 'Belum ada data untuk digenerate!', 'warning');
        return;
    }
    
    showAlert(type, `✅ Tabel ${type.toUpperCase()} berhasil digenerate dengan ${protsmaData[type].length} baris!`, 'success');
}

// ============================================
// ✅ SAVE TO FIREBASE
// ============================================

async function saveToFirebase(type) {
    if (protsmaData[type].length === 0) {
        showAlert(type, 'Tidak ada data untuk disimpan!', 'warning');
        return;
    }
    
    const saveBtn = document.getElementById(`${type}-save-btn`);
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
    
    try {
        const { db, collection, addDoc, serverTimestamp, auth } = await import('../firebase-config.js');
        
        const user = auth.currentUser;
        if (!user) {
            showAlert(type, 'User tidak terautentikasi!', 'error');
            return;
        }
        
        // Save to Firestore
        await addDoc(collection(db, 'protsma'), {
            uid: user.uid,
            type: type,
            jenjang: document.getElementById(`${type}-jenjang`).value,
            kelas: document.getElementById(`${type}-kelas`).value,
            data: protsmaData[type],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        
        showAlert(type, '✅ Data berhasil disimpan ke Firebase!', 'success');
        
    } catch (error) {
        console.error('❌ [Protsma] Save Error:', error);
        showAlert(type, `❌ Gagal menyimpan: ${error.message}`, 'error');
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Simpan ke Firebase';
    }
}

// ============================================
// ✅ LOAD SAVED DATA FROM FIREBASE
// ============================================

async function loadSavedData() {
    try {
        const { db, collection, query, where, getDocs, auth } = await import('../firebase-config.js');
        
        const user = auth.currentUser;
        if (!user) return;
        
        // Load Prota
        const protaQuery = query(collection(db, 'protsma'), where('uid', '==', user.uid), where('type', '==', 'prota'));
        const protaSnap = await getDocs(protaQuery);
        
        if (!protaSnap.empty) {
            const lastDoc = protaSnap.docs[protaSnap.docs.length - 1];
            protsmaData.prota = lastDoc.data().data || [];
            renderTable('prota');
        }
        
        // Load Promes
        const promesQuery = query(collection(db, 'protsma'), where('uid', '==', user.uid), where('type', '==', 'promes'));
        const promesSnap = await getDocs(promesQuery);
        
        if (!promesSnap.empty) {
            const lastDoc = promesSnap.docs[promesSnap.docs.length - 1];
            protsmaData.promes = lastDoc.data().data || [];
            renderTable('promes');
        }
        
    } catch (error) {
        console.error('❌ [Protsma] Load Error:', error);
    }
}

// ============================================
// ✅ DOWNLOAD PDF
// ============================================

function downloadPDF(type) {
    if (protsmaData[type].length === 0) {
        showAlert(type, 'Tidak ada data untuk diexport!', 'warning');
        return;
    }
    
    const element = document.getElementById(`${type}-table`);
    if (!element) return;
    
    // Check if html2pdf is available
    if (typeof html2pdf === 'undefined') {
        showAlert(type, 'Library PDF tidak ditemukan!', 'error');
        return;
    }
    
    const opt = {
        margin: 10,
        filename: `Prota_Promes_${type}_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };
    
    html2pdf().set(opt).from(element).save();
    
    showAlert(type, '✅ PDF sedang diunduh!', 'success');
}

// ============================================
// ✅ SHOW ALERT
// ============================================

function showAlert(type, message, status = 'success') {
    const container = document.getElementById('protsma-alert-container');
    if (!container) return;
    
    const alertClass = {
        'success': 'protsma-alert-success',
        'error': 'protsma-alert-error',
        'warning': 'protsma-alert-warning'
    }[status];
    
    container.innerHTML = `
        <div class="protsma-alert ${alertClass}">
            ${message}
        </div>
    `;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        container.innerHTML = '';
    }, 5000);
}

// ✅ EXPORT sudah di function declaration (line ~25)
// Tidak perlu export lagi di sini

console.log('🟢 [Protsma] Module READY');
