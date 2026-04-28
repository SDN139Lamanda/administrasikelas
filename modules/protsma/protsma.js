/**
 * ============================================
 * PROTA & PROMES GENERATOR - Main Logic
 * Folder: modules/protsma/protsma.js
 * FIXED VERSION - Static Firebase Import
 * ============================================
 */

console.log('🔴 [Protsma] Module START');

// ✅ FIX 1: STATIC IMPORT FIREBASE (ganti dynamic import yang error 404)
// Path: modules/protsma/protsma.js → modules/firebase-config.js = ../firebase-config.js
import { 
  db, auth, collection, addDoc, query, where, orderBy, 
  onSnapshot, doc, getDoc, serverTimestamp, getDocs 
} from '../firebase-config.js';

console.log('✅ [Protsma] Firebase imports successful');

let protsmaData = { prota: [], promes: [] };
let currentTab = 'prota';

// ❌ HAPUS: const FIREBASE_CONFIG_PATH = '../../firebase-config.js'; // Tidak dipakai lagi

export async function renderProtsma() {
    console.log('📊 [Protsma] renderProtsma called');

    const container = document.getElementById('protsma-container');
    if (!container) {
        console.error('❌ [Protsma] Container not found');
        return;
    }

    // ✅ Cek fungsi global aman
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
    initProtsmaListeners();
    await loadSavedData();

    console.log('🟢 [Protsma] Module READY');
}

function getProtsmaHTML() {
    return `
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
        document.head.appendChild(link);
    }
}

function initProtsmaListeners() {
    document.querySelectorAll('.protsma-tab').forEach(tab => {
        tab.addEventListener('click', (e) => switchTab(e.target.dataset.tab));
    });

    ['prota', 'promes'].forEach(type => {
        const prefix = type === 'prota'? 'protsma' : 'promes';
        document.getElementById(`${prefix}-jenjang`)?.addEventListener('change', () => updateKelasOptions(type));
        document.getElementById(`${type}-ai-btn`)?.addEventListener('click', () => callAIForHelp(type));
        document.getElementById(`${type}-add-btn`)?.addEventListener('click', () => addDataRow(type));
        document.getElementById(`${type}-generate-btn`)?.addEventListener('click', () => generateTable(type));
        document.getElementById(`${type}-save-btn`)?.addEventListener('click', () => saveToFirebase(type));
        document.getElementById(`${type}-pdf-btn`)?.addEventListener('click', () => downloadPDF(type));
    });
}

function switchTab(tabName) {
    currentTab = tabName;
    document.querySelectorAll('.protsma-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    document.querySelectorAll('.protsma-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-content`);
    });
}

function updateKelasOptions(type) {
    const prefix = type === 'prota'? 'protsma' : 'promes';
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

// ✅ FIX 2: Fix path groq-api.js (dari modules/protsma/ ke modules/)
async function callAIForHelp(type) {
    const prefix = type === 'prota'? 'protsma' : 'promes';
    const jenjang = document.getElementById(`${prefix}-jenjang`).value;
    const kelas = document.getElementById(`${prefix}-kelas`).value;
    const topik = document.getElementById(`${prefix}-topik`).value;
    const aiBtn = document.getElementById(`${type}-ai-btn`);

    if (!topik) {
        showAlert(type, 'Silakan isi Topik/Materi terlebih dahulu', 'warning');
        return;
    }

    aiBtn.disabled = true;
    aiBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses AI...';

    try {
        // ✅ FIX: Path dari modules/protsma/ ke modules/groq-api.js = ../groq-api.js
        const { generateWithGroq } = await import('../groq-api.js');

        const prompt = `Buatkan rencana untuk Prota/Promes:
Jenjang: ${jenjang?.toUpperCase()}
Kelas: ${kelas}
Topik: ${topik}

Balas HANYA JSON: {"minggu": angka, "alokasi": angka}`;

        const result = await generateWithGroq(prompt);

        // Parse hasil AI
        const match = result.match(/\{[\s\S]*\}/);
        if (!match) throw new Error('AI tidak mengembalikan JSON');

        const aiResult = JSON.parse(match[0]);

        if (aiResult.minggu) document.getElementById(`${prefix}-minggu`).value = aiResult.minggu;
        if (aiResult.alokasi) document.getElementById(`${prefix}-alokasi`).value = aiResult.alokasi;

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
    const prefix = type === 'prota'? 'protsma' : 'promes';
    const jenjang = document.getElementById(`${prefix}-jenjang`).value;
    const kelas = document.getElementById(`${prefix}-kelas`).value;
    const mapel = document.getElementById(`${prefix}-mapel`).value;
    const topik = document.getElementById(`${prefix}-topik`).value;
    const minggu = document.getElementById(`${prefix}-minggu`).value;
    const alokasi = document.getElementById(`${prefix}-alokasi`).value;
    const bulan = document.getElementById(`${prefix}-bulan`)?.value;

    if (!jenjang ||!kelas ||!mapel ||!topik) {
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

    document.getElementById(`${prefix}-topik`).value = '';
    document.getElementById(`${prefix}-minggu`).value = '';
    document.getElementById(`${prefix}-alokasi`).value = '';

    showAlert(type, '✅ Baris berhasil ditambahkan!', 'success');
}

function renderTable(type) {
    const tbody = document.getElementById(`${type}-tbody`);
    if (!tbody) return;

    const data = protsmaData[type];

    if (data.length === 0) {
        const colspan = type === 'prota'? 6 : 7;
        tbody.innerHTML = `<tr><td colspan="${colspan}" class="text-center py-8 text-gray-500">Belum ada data. Isi form dan klik "Tambah Baris"</td></tr>`;
        return;
    }

    tbody.innerHTML = data.map((row, index) => `
        <tr>
            <td>Kelas ${row.kelas}</td>
            <td>${row.mapel}</td>
            <td>${row.topik}</td>
            ${type === 'promes'? `<td>${getBulanName(row.bulan)}</td>` : ''}
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

function getBulanName(bulanNum) {
    const bulanMap = {
        '1': 'Januari', '2': 'Februari', '3': 'Maret', '4': 'April',
        '5': 'Mei', '6': 'Juni', '7': 'Juli', '8': 'Agustus',
        '9': 'September', '10': 'Oktober', '11': 'November', '12': 'Desember'
    };
    return bulanMap[bulanNum] || bulanNum;
}

window.removeProtsmaRow = function(type, index) {
    protsmaData[type].splice(index, 1);
    renderTable(type);
};

function generateTable(type) {
    if (protsmaData[type].length === 0) {
        showAlert(type, 'Belum ada data untuk digenerate!', 'warning');
        return;
    }
    showAlert(type, `✅ Tabel ${type.toUpperCase()} berhasil digenerate dengan ${protsmaData[type].length} baris!`, 'success');
}

// ✅ FIX 3: Ganti dynamic import dengan static import yang sudah dideklarasikan di atas
async function saveToFirebase(type) {
    if (protsmaData[type].length === 0) {
        showAlert(type, 'Tidak ada data untuk disimpan!', 'warning');
        return;
    }

    const saveBtn = document.getElementById(`${type}-save-btn`);
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';

    try {
        // ✅ FIX: Gunakan static import (db, collection, addDoc, serverTimestamp, auth sudah di-import di atas)
        // ❌ HAPUS: const { db, collection, addDoc, serverTimestamp, auth } = await import(FIREBASE_CONFIG_PATH);

        const user = auth.currentUser;
        if (!user) throw new Error('User tidak terautentikasi!');

        const prefix = type === 'prota'? 'protsma' : 'promes';
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

    } catch (error) {
        console.error('❌ [Protsma] Save Error:', error);
        showAlert(type, `❌ Gagal menyimpan: ${error.message}`, 'error');
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Simpan ke Firebase';
    }
}

// ✅ FIX 4: Ganti dynamic import dengan static import yang sudah dideklarasikan di atas
async function loadSavedData() {
    try {
        // ✅ FIX: Gunakan static import (db, collection, query, where, getDocs, auth sudah di-import di atas)
        // ❌ HAPUS: const { db, collection, query, where, getDocs, auth } = await import(FIREBASE_CONFIG_PATH);

        const user = auth.currentUser;
        if (!user) return;

        const protaQuery = query(collection(db, 'protsma'), where('uid', '==', user.uid), where('type', '==', 'prota'));
        const protaSnap = await getDocs(protaQuery);

        if (!protaSnap.empty) {
            const lastDoc = protaSnap.docs[protaSnap.docs.length - 1];
            protsmaData.prota = lastDoc.data().data || [];
            renderTable('prota');
        }

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

// ✅ FIX 5: Cek html2pdf dulu (unchanged)
function downloadPDF(type) {
    if (protsmaData[type].length === 0) {
        showAlert(type, 'Tidak ada data untuk diexport!', 'warning');
        return;
    }

    if (typeof html2pdf === 'undefined') {
        showAlert(type, 'Library PDF belum dimuat. Tambahkan CDN html2pdf di index.html', 'error');
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
}

function showAlert(type, message, status = 'success') {
    const container = document.getElementById('protsma-alert-container');
    if (!container) return;

    const alertClass = {
        'success': 'protsma-alert-success',
        'error': 'protsma-alert-error',
        'warning': 'protsma-alert-warning'
    }[status];

    container.innerHTML = `<div class="protsma-alert ${alertClass}">${message}</div>`;
    setTimeout(() => { container.innerHTML = ''; }, 5000);
}

console.log('🟢 [Protsma] Module READY — Static Firebase Import + Fixed Paths');
