/**
 * ============================================
 * GENERATOR PEMBUAT SOAL - Main Logic
 * Folder: modules/pembuat-soal/pembuat-soal.js
 * ============================================
 */

console.log('🔴 [PembuatSoal] Module START');

// ============================================
// ✅ GLOBAL STATE
// ============================================

let soalRows = [];
let generatedOutput = {
    questions: '',
    answers: ''
};

// ============================================
// ✅ MAIN RENDER FUNCTION (Called from dashboard)
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
    
    // Load user data for auto-fill
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
    // Add row button
    const addRowBtn = document.getElementById('ps-add-row-btn');
    if (addRowBtn) {
        addRowBtn.addEventListener('click', addRow);
    }
    
    // Generate button
    const generateBtn = document.getElementById('ps-generate-btn');
    if (generateBtn) {
        generateBtn.addEventListener('click', generateSoal);
    }
    
    // Download button
    const downloadBtn = document.getElementById('ps-download-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadWord);
    }
}

// ============================================
// ✅ LOAD USER DATA FOR AUTO-FILL
// ============================================

async function loadUserData() {
    try {
        const { auth, db, doc, getDoc } = await import('../firebase-config.js');
        const user = auth.currentUser;
        
        if (!user) return;
        
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
            const data = snap.data();
            
            // Auto-fill sekolah
            if (document.getElementById('ps-sekolah')) {
                document.getElementById('ps-sekolah').value = data.nama_sekolah || '-';
            }
            
            // Auto-fill mapel (get from mapel_yang_diampu or jenjang)
            if (document.getElementById('ps-mapel')) {
                let mapelText = '-';
                if (data.jenjang_sekolah === 'sd' && data.sd_mapel_type === 'kelas') {
                    mapelText = 'Guru Kelas (' + (data.jenjang_sekolah || '').toUpperCase() + ')';
                } else if (data.mapel_yang_diampu && data.mapel_yang_diampu.length > 0) {
                    mapelText = data.mapel_yang_diampu.join(', ');
                } else if (data.sd_mapel_type && ['pai', 'pjok'].includes(data.sd_mapel_type)) {
                    mapelText = data.sd_mapel_type.toUpperCase();
                }
                document.getElementById('ps-mapel').value = mapelText;
            }
            
            // Auto-fill tahun pelajaran (current year)
            if (document.getElementById('ps-tahun')) {
                const currentYear = new Date().getFullYear();
                const nextYear = currentYear + 1;
                document.getElementById('ps-tahun').value = `${currentYear}/${nextYear}`;
            }
            
            // Add first row by default
            addRow();
        }
    } catch (error) {
        console.error('❌ [PembuatSoal] Load user data error:', error);
    }
}

// ============================================
// ✅ ADD ROW TO TABLE
// ============================================

function addRow() {
    const tbody = document.getElementById('ps-tbody');
    if (!tbody) return;
    
    const rowIndex = soalRows.length;
    
    // Get jenjang & mapel options from user data
    const jenjangOptions = getJenjangMapelOptions();
    
    const row = {
        id: Date.now() + rowIndex,
        jenjangMapel: '',
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
                <option value="">Pilih Jenjang & Mapel</option>
                ${jenjangOptions}
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
                <option value="pts">Penilaian Tengah Semester</option>
                <option value="pas">Soal Semester</option>
            </select>
        </td>
        <td>
            <button onclick="window.removePembuatSoalRow(${row.id})" class="text-red-600 hover:text-red-800">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    tbody.appendChild(tr);
    
    // Add event listeners for row inputs
    const jenjangSelect = tr.querySelector('.ps-jenjang-mapel');
    const topikInput = tr.querySelector('.ps-topik');
    const jumlahInput = tr.querySelector('.ps-jumlah');
    const modelSelect = tr.querySelector('.ps-model');
    const untukSelect = tr.querySelector('.ps-untuk');
    
    if (jenjangSelect) {
        jenjangSelect.addEventListener('change', (e) => {
            const row = soalRows.find(r => r.id === row.id);
            if (row) row.jenjangMapel = e.target.value;
        });
    }
    
    if (topikInput) {
        topikInput.addEventListener('input', (e) => {
            const row = soalRows.find(r => r.id === row.id);
            if (row) row.topik = e.target.value;
        });
    }
    
    if (jumlahInput) {
        jumlahInput.addEventListener('input', (e) => {
            const row = soalRows.find(r => r.id === row.id);
            if (row) row.jumlahNomor = parseInt(e.target.value) || 5;
        });
    }
    
    if (modelSelect) {
        modelSelect.addEventListener('change', (e) => {
            const row = soalRows.find(r => r.id === row.id);
            if (row) row.modelSoal = e.target.value;
        });
    }
    
    if (untukSelect) {
        untukSelect.addEventListener('change', (e) => {
            const row = soalRows.find(r => r.id === row.id);
            if (row) row.soalUntuk = e.target.value;
        });
    }
}

// Helper: Get jenjang & mapel options
function getJenjangMapelOptions() {
    const jenjangMap = {
        'tk': 'TK',
        'sd': 'SD',
        'mi': 'MI',
        'smp': 'SMP',
        'mts': 'MTs',
        'sma': 'SMA',
        'ma': 'MA'
    };
    
    const options = [];
    for (const [key, label] of Object.entries(jenjangMap)) {
        options.push(`<option value="${key}">${label}</option>`);
    }
    
    return options.join('');
}

// ============================================
// ✅ REMOVE ROW (Global function for onclick)
// ============================================

window.removePembuatSoalRow = function(rowId) {
    soalRows = soalRows.filter(r => r.id !== rowId);
    
    const tr = document.querySelector(`tr[data-row="${rowId}"]`);
    if (tr) tr.remove();
    
    showAlert('Baris berhasil dihapus', 'success');
};

// ============================================
// ✅ GENERATE SOAL (Groq API)
// ============================================

async function generateSoal() {
    // Validate inputs
    const tahun = document.getElementById('ps-tahun')?.value;
    if (!tahun) {
        showAlert('Silakan isi Tahun Pelajaran!', 'warning');
        return;
    }
    
    if (soalRows.length === 0) {
        showAlert('Silakan tambah minimal 1 baris topik!', 'warning');
        return;
    }
    
    // Validate all rows
    for (const row of soalRows) {
        if (!row.jenjangMapel || !row.topik) {
            showAlert('Silakan lengkapi semua baris (Jenjang & Topik wajib diisi)!', 'warning');
            return;
        }
    }
    
    const generateBtn = document.getElementById('ps-generate-btn');
    const downloadBtn = document.getElementById('ps-download-btn');
    
    // Disable buttons during generation
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses AI...';
    downloadBtn.disabled = true;
    
    try {
        // Get Groq API key
        const apiKey = await window.getApiKey?.();
        
        if (!apiKey) {
            showAlert('API Key tidak ditemukan. Silakan hubungi admin.', 'error');
            return;
        }
        
        // Build prompt for AI
        const prompt = buildPrompt(tahun);
        
        // Call Groq API
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: 'Anda adalah guru profesional yang ahli membuat soal penilaian. Buat soal sesuai permintaan dengan format yang jelas dan terstruktur.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 4000
            })
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        const aiContent = data.choices?.[0]?.message?.content || '';
        
        // Parse AI output (expecting 2 sections: SOAL and KUNCI JAWABAN)
        const parsedOutput = parseAIOutput(aiContent);
        
        generatedOutput = parsedOutput;
        
        // Display output
        displayOutput(parsedOutput);
        
        // Enable download button
        downloadBtn.disabled = false;
        
        // Save to Firebase
        await saveToFirebase(tahun, parsedOutput);
        
        showAlert('✅ Soal berhasil digenerate!', 'success');
        
    } catch (error) {
        console.error('❌ [PembuatSoal] Generate error:', error);
        showAlert(`❌ Gagal generate soal: ${error.message}`, 'error');
    } finally {
        // Re-enable buttons
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-robot"></i> Buatkan Soal';
    }
}

// Build prompt for AI
function buildPrompt(tahun) {
    const sekolah = document.getElementById('ps-sekolah')?.value || '-';
    const mapel = document.getElementById('ps-mapel')?.value || '-';
    
    const rowsText = soalRows.map((row, index) => {
        const modelMap = {
            'ganda': 'Pilihan Ganda',
            'isian': 'Isian',
            'uraian': 'Uraian/Essay'
        };
        const untukMap = {
            'harian': 'Tugas Harian',
            'pts': 'Penilaian Tengah Semester (PTS)',
            'pas': 'Penilaian Akhir Semester (PAS)'
        };
        
        return `${index + 1}. Jenjang: ${row.jenjangMapel.toUpperCase()}, Topik: ${row.topik}, Jumlah: ${row.jumlahNomor} soal, Model: ${modelMap[row.modelSoal]}, Untuk: ${untukMap[row.soalUntuk]}`;
    }).join('\n');
    
    return `Buatkan soal penilaian dengan detail berikut:

SEKOLAH: ${sekolah}
MATA PELAJARAN: ${mapel}
TAHUN PELAJARAN: ${tahun}

DAFTAR TOPIK & SOAL:
${rowsText}

FORMAT OUTPUT (WAJIB IKUTI FORMAT INI):
=== SOAL ===
[Daftar semua soal di sini, dikelompokkan per topik, dengan nomor urut]

=== KUNCI JAWABAN ===
[Daftar kunci jawaban di sini, untuk pilihan ganda tulis huruf jawaban, untuk isian tulis jawaban singkat, untuk uraian tulis poin-poin penting yang harus ada]

PENTING:
1. Pisahkan dengan jelas antara bagian SOAL dan KUNCI JAWABAN
2. Gunakan marker "=== SOAL ===" dan "=== KUNCI JAWABAN ==="
3. Soal harus sesuai dengan jumlah yang diminta
4. Untuk soal pilihan ganda, berikan 4 pilihan (A, B, C, D)
5. Tingkat kesulitan disesuaikan dengan jenjang`;
}

// Parse AI output into 2 sections
function parseAIOutput(content) {
    const soalMarker = '=== SOAL ===';
    const jawabanMarker = '=== KUNCI JAWABAN ===';
    
    let questions = '';
    let answers = '';
    
    const soalIndex = content.indexOf(soalMarker);
    const jawabanIndex = content.indexOf(jawabanMarker);
    
    if (soalIndex !== -1 && jawabanIndex !== -1) {
        questions = content.substring(soalIndex + soalMarker.length, jawabanIndex).trim();
        answers = content.substring(jawabanIndex + jawabanMarker.length).trim();
    } else if (soalIndex !== -1) {
        questions = content.substring(soalIndex + soalMarker.length).trim();
        answers = 'Kunci jawaban tidak tersedia dalam output AI.';
    } else {
        questions = content;
        answers = 'Kunci jawaban tidak tersedia dalam output AI.';
    }
    
    // Convert markdown-style lists to HTML
    questions = questions.replace(/\n/g, '<br>');
    answers = answers.replace(/\n/g, '<br>');
    
    return { questions, answers };
}

// Display output
function displayOutput(output) {
    const outputSection = document.getElementById('pembuat-soal-output');
    const questionsDiv = document.getElementById('ps-output-questions');
    const answersDiv = document.getElementById('ps-output-answers');
    
    if (outputSection) outputSection.classList.remove('hidden');
    if (questionsDiv) questionsDiv.innerHTML = output.questions;
    if (answersDiv) answersDiv.innerHTML = output.answers;
}

// ============================================
// ✅ SAVE TO FIREBASE
// ============================================

async function saveToFirebase(tahun, output) {
    try {
        const { db, collection, addDoc, serverTimestamp, auth } = await import('../firebase-config.js');
        
        const user = auth.currentUser;
        if (!user) return;
        
        // Get user data for additional info
        const { doc, getDoc } = await import('../firebase-config.js');
        const userSnap = await getDoc(doc(db, 'users', user.uid));
        const userData = userSnap.exists() ? userSnap.data() : {};
        
        // Save to pembuat_soal collection
        await addDoc(collection(db, 'pembuat_soal'), {
            uid: user.uid,
            sekolah: userData.nama_sekolah || '',
            mapel: userData.mapel_yang_diampu?.join(', ') || userData.sd_mapel_type || '',
            tahunPelajaran: tahun,
            topics: soalRows,
            output: output,
            createdAt: serverTimestamp(),
            jenjang: userData.jenjang_sekolah || ''
        });
        
        // Also save to pembelajaran collection (as requested)
        await addDoc(collection(db, 'pembelajaran'), {
            uid: user.uid,
            type: 'pembuat_soal',
            sekolah: userData.nama_sekolah || '',
            mapel: userData.mapel_yang_diampu?.join(', ') || userData.sd_mapel_type || '',
            tahunPelajaran: tahun,
            data: {
                topics: soalRows,
                output: output
            },
            createdAt: serverTimestamp(),
            jenjang: userData.jenjang_sekolah || ''
        });
        
        console.log('✅ [PembuatSoal] Saved to Firebase');
        
    } catch (error) {
        console.error('❌ [PembuatSoal] Save error:', error);
        // Don't show error to user, save is optional
    }
}

// ============================================
// ✅ DOWNLOAD WORD
// ============================================

function downloadWord() {
    if (!generatedOutput.questions) {
        showAlert('Belum ada soal untuk diunduh!', 'warning');
        return;
    }
    
    const sekolah = document.getElementById('ps-sekolah')?.value || '-';
    const mapel = document.getElementById('ps-mapel')?.value || '-';
    const tahun = document.getElementById('ps-tahun')?.value || '-';
    
    // Create Word document content (HTML format that Word can open)
    const content = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>Soal Penilaian</title></head>
        <body>
            <h1 style="text-align: center;">SOAL PENILAIAN</h1>
            <p><strong>Sekolah:</strong> ${sekolah}</p>
            <p><strong>Mata Pelajaran:</strong> ${mapel}</p>
            <p><strong>Tahun Pelajaran:</strong> ${tahun}</p>
            <hr>
            <h2>SOAL</h2>
            <div>${generatedOutput.questions}</div>
            <hr>
            <h2>KUNCI JAWABAN</h2>
            <div>${generatedOutput.answers}</div>
        </body>
        </html>
    `;
    
    // Create blob and download
    const blob = new Blob(['\ufeff', content], {
        type: 'application/msword'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Soal_${mapel}_${tahun}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showAlert('✅ File Word sedang diunduh!', 'success');
}

// ============================================
// ✅ SHOW ALERT
// ============================================

function showAlert(message, status = 'success') {
    const container = document.getElementById('pembuat-soal-alert-container');
    if (!container) return;
    
    const alertClass = {
        'success': 'pembuat-soal-alert-success',
        'error': 'pembuat-soal-alert-error',
        'warning': 'pembuat-soal-alert-warning'
    }[status];
    
    container.innerHTML = `
        <div class="pembuat-soal-alert ${alertClass}">
            ${message}
        </div>
    `;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        container.innerHTML = '';
    }, 5000);
}

// ============================================
// ✅ EXPORT FOR MODULE IMPORT
// ============================================

export { renderPembuatSoal };

console.log('🟢 [PembuatSoal] Module READY');
