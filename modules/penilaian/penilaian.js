/**
 * PENILAIAN MODULE - INTEGRATED WITH ADM. KELAS
 * ✅ Reads from adm-kelas storage
 * ✅ Auto-sync with class & student data
 * ✅ Save & load nilai via penilaian-storage.js
 * ✅ FIX: Container + Template loading + Student data integration
 * ✅ UPDATE: Action buttons (Simpan/Edit/Hapus) per row
 */

import { storage } from '../adm-kelas/storage.js';
import { penilaianStorage } from './penilaian-storage.js';
// ✅ FIX: Tidak perlu import getPenilaianTemplate karena template.js pakai IIFE
// Fungsi akan tersedia di window setelah template.js load

let dbKelas = [];
let dbNilaiFull = {};
let indexAktif = null;
let viewAktif = 'pengetahuan';
let jumlahPH = 1;
let isDataSynced = false; // ✅ UPDATE: Track sync status

// ✅ SYNC DATA
async function syncData() {
    // ✅ UPDATE: Hindari sync berulang jika sudah ada data
    if (isDataSynced && dbKelas.length > 0) {
        console.log('🔄 [Penilaian] Data already synced, skipping...');
        return;
    }
    
    dbKelas = await storage.loadClasses();
    isDataSynced = true;
    console.log('🔄 [Penilaian] Data synced - Classes:', dbKelas.length);
}

// ✅ INIT DROPDOWN
async function initPenilaian() {
    await syncData();
    const select = document.getElementById('selectKelasNilai');
    if(!select) return;
    select.innerHTML = '<option value="">-- Pilih Kelas --</option>';
    if(dbKelas.length === 0) {
        select.innerHTML += '<option disabled>📝 Belum ada kelas. Buat di Adm. Kelas dulu!</option>';
        return;
    }
    dbKelas.forEach((k) => {
        const siswaCount = k.siswa?.length || 0;
        select.innerHTML += `<option value="${k.id}">${k.nama} (${siswaCount} siswa)</option>`;
    });
}

// ✅ SWITCH VIEW - ✅ FIX 1: Expose to window for HTML onclick
window.switchView = function(mode) {
    viewAktif = mode;
    if(indexAktif !== null) renderTabel();
}

// ✅ TAMBAH KOLOM PH - ✅ FIX 2: Expose to window for HTML onclick
window.tambahKolomPH = function() {
    if(indexAktif === null) return alert("Pilih kelas!");
    jumlahPH++;
    renderTabel();
}

// ✅ INIT TABLE - ✅ FIX 3: Expose to window for HTML onchange
window.inisialisasiTabel = async function(classId) {
    if(classId === "") {
        indexAktif = null;
        const body = document.getElementById('tabelNilaiBody');
        if(body) body.innerHTML = `<tr><td colspan="7">Pilih kelas untuk mengaktifkan tabel</td></tr>`;
        return;
    }
    
    // ✅ UPDATE: Pastikan data sync sebelum cari class
    await syncData();
    
    const classIndex = dbKelas.findIndex(k => k.id === classId);
    if(classIndex === -1) return alert('❌ Kelas tidak ditemukan!');
    indexAktif = classIndex;
    
    const kelas = dbKelas[classIndex];
    const namaKelas = kelas.nama;
    
    // ✅ UPDATE: Handle jika tidak ada siswa
    if (!kelas.siswa || kelas.siswa.length === 0) {
        const body = document.getElementById('tabelNilaiBody');
        if (body) {
            body.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-slate-500">
                ⚠️ Belum ada siswa di kelas ini. 
                <br><a href="javascript:void(0)" onclick="backToDashboard()" class="text-blue-600 underline">
                Tambah siswa di Adm. Kelas dulu!
                </a>
            </td></tr>`;
        }
        return;
    }
    
    dbNilaiFull[namaKelas] = await penilaianStorage.loadGrades(classId);
    jumlahPH = dbNilaiFull[namaKelas]?.meta?.jumlahPH || 1;
    renderTabel();
}

// ✅ RENDER TABLE
function renderTabel() {
    if(indexAktif === null) return;
    const head = document.getElementById('tabelHead');
    const body = document.getElementById('tabelNilaiBody');
    if(!head || !body) return;
    
    const kelas = dbKelas[indexAktif];
    const siswa = kelas.siswa || [];
    const namaKelas = kelas.nama;
    const savedData = dbNilaiFull[namaKelas]?.data || {};
    body.innerHTML = "";

    if(viewAktif === 'pengetahuan') {
        // header
        let headPH = "";
        for(let i=1; i<=jumlahPH; i++) headPH += `<th class="px-4 py-2 text-center bg-blue-50/30 min-w-[80px]">PH ${i}</th>`;
        // ✅ UPDATE: Tambah kolom Aksi di header
        head.innerHTML = `<tr>
            <th class="px-8 py-4 sticky-col min-w-[250px] bg-white">Identitas Siswa</th>
            ${headPH}
            <th class="px-6 py-4 text-center bg-amber-50/30 min-w-[100px]">STS</th>
            <th class="px-6 py-4 text-center bg-emerald-50/30 min-w-[100px]">SAS</th>
            <th class="px-6 py-4 text-center bg-slate-900 text-white">NA</th>
            <!-- ✅ TAMBAH: Kolom Aksi -->
            <th class="px-4 py-4 text-center bg-slate-100 min-w-[120px]">Aksi</th>
        </tr>`;
        
        // body
        siswa.forEach((s, sIdx) => {
            // ✅ UPDATE: Fallback key jika s.id tidak ada
            const studentKey = s.id || s.nama || `siswa_${sIdx}`;
            const sVal = savedData[studentKey] || { ph: [], sts: 0, sas: 0 };
            let rowPH = "";
            for(let i=0; i<jumlahPH; i++) {
                rowPH += `<td class="px-2 py-2"><input type="number" id="ph_${sIdx}_${i}" value="${sVal.ph[i] || 0}" oninput="window.hitungNA(${sIdx})" class="w-full bg-slate-50 border border-slate-200 p-2 rounded text-center"></td>`;
            }
            // ✅ UPDATE: Tambah kolom tombol aksi di setiap row
            body.innerHTML += `<tr class="hover:bg-slate-50/50" data-student-id="${studentKey}">
                <td class="px-8 py-3 sticky-col font-medium text-slate-800 bg-white">${s.nama || 'Siswa ' + (sIdx+1)}</td>
                ${rowPH}
                <td class="px-4 py-3"><input type="number" id="sts_${sIdx}" value="${sVal.sts || 0}" oninput="window.hitungNA(${sIdx})" class="w-16 mx-auto block bg-white border border-amber-200 p-2 rounded text-center"></td>
                <td class="px-4 py-3"><input type="number" id="sas_${sIdx}" value="${sVal.sas || 0}" oninput="window.hitungNA(${sIdx})" class="w-16 mx-auto block bg-white border border-emerald-200 p-2 rounded text-center"></td>
                <td class="px-6 py-3 text-center font-bold" id="na_${sIdx}">0</td>
                <!-- ✅ TAMBAH: Kolom Tombol Aksi -->
                <td class="px-4 py-3 text-center">
                    <div class="flex items-center justify-center gap-1">
                        <button onclick="window.aksiSimpanRow(${sIdx})" class="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition" title="Simpan">
                            <i class="fas fa-save text-sm"></i>
                        </button>
                        <button onclick="window.aksiEditRow(${sIdx})" class="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition" title="Edit">
                            <i class="fas fa-edit text-sm"></i>
                        </button>
                        <button onclick="window.aksiHapusRow(${sIdx})" class="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition" title="Hapus">
                            <i class="fas fa-trash text-sm"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
            window.hitungNA(sIdx);
        });
    } else {
        // header sikap
        // ✅ UPDATE: Tambah colspan untuk aksi
        head.innerHTML = `<tr>
            <th class="px-8 py-4 sticky-col min-w-[250px] bg-white">Identitas Siswa</th>
            <th class="px-8 py-4 text-center bg-purple-50 text-purple-600 min-w-[150px]">Predikat</th>
            <th class="px-8 py-4 text-left bg-slate-50 min-w-[400px]">Catatan Deskripsi Sikap</th>
            <!-- ✅ TAMBAH: Kolom Aksi untuk view Sikap -->
            <th class="px-4 py-4 text-center bg-slate-100 min-w-[120px]">Aksi</th>
        </tr>`;
        
        // body sikap
        siswa.forEach((s, sIdx) => {
            // ✅ UPDATE: Fallback key jika s.id tidak ada
            const studentKey = s.id || s.nama || `siswa_${sIdx}`;
            const sVal = savedData[studentKey] || { sikap: 'B', catatan: '' };
            // ✅ UPDATE: Tambah kolom tombol aksi untuk view Sikap
            body.innerHTML += `<tr class="hover:bg-slate-50/50" data-student-id="${studentKey}">
                <td class="px-8 py-4 sticky-col font-medium text-slate-800 bg-white">${s.nama || 'Siswa ' + (sIdx+1)}</td>
                <td class="px-8 py-4 text-center">
                    <select id="sikap_${sIdx}" class="bg-white border-2 border-purple-200 px-3 py-2 rounded-lg font-medium text-purple-600">
                        <option value="A" ${sVal.sikap==='A'?'selected':''}>A (Sangat Baik)</option>
                        <option value="B" ${sVal.sikap==='B'?'selected':''}>B (Baik)</option>
                        <option value="C" ${sVal.sikap==='C'?'selected':''}>C (Cukup)</option>
                        <option value="D" ${sVal.sikap==='D'?'selected':''}>D (Kurang)</option>
                    </select>
                </td>
                <td class="px-8 py-4">
                    <textarea id="catatan_${sIdx}" placeholder="Catatan sikap..." class="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg text-sm outline-none focus:ring-2 ring-purple-300 resize-none" rows="2">${sVal.catatan || ''}</textarea>
                </td>
                <!-- ✅ TAMBAH: Kolom Tombol Aksi untuk Sikap -->
                <td class="px-4 py-4 text-center">
                    <div class="flex items-center justify-center gap-1">
                        <button onclick="window.aksiSimpanSikapRow(${sIdx})" class="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition" title="Simpan">
                            <i class="fas fa-save text-sm"></i>
                        </button>
                        <button onclick="window.aksiEditSikapRow(${sIdx})" class="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition" title="Edit">
                            <i class="fas fa-edit text-sm"></i>
                        </button>
                        <button onclick="window.aksiHapusRow(${sIdx})" class="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition" title="Hapus">
                            <i class="fas fa-trash text-sm"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
        });
    }
}

// ✅ CALCULATE NA - ✅ FIX 4: Expose to window for HTML oninput
window.hitungNA = function(sIdx) {
    let totalPH = 0;
    for(let i=0; i<jumlahPH; i++) {
        const el = document.getElementById(`ph_${sIdx}_${i}`);
        if(el) totalPH += parseFloat(el.value) || 0;
    }
    const rPH = jumlahPH > 0 ? totalPH / jumlahPH : 0;
    const sts = parseFloat(document.getElementById(`sts_${sIdx}`)?.value || 0);
    const sas = parseFloat(document.getElementById(`sas_${sIdx}`)?.value || 0);
    const na = Math.round((rPH * 2 + sts + sas) / 4);
    const elNa = document.getElementById(`na_${sIdx}`);
    if(elNa) {
        elNa.innerText = na;
        const kkm = parseFloat(document.getElementById('inputKKM')?.value || 75);
        elNa.className = `px-6 py-3 text-center font-bold ${na < kkm ? 'text-rose-500' : 'text-emerald-600'}`;
    }
}

// ✅ SAVE - ✅ FIX 5: Expose to window for HTML onclick + ✅ FIX 6: Valid object syntax
window.simpanPermanen = async function() {
    if(indexAktif === null) return alert('Pilih kelas dulu!');
    const classId = dbKelas[indexAktif].id;
    const namaKelas = dbKelas[indexAktif].nama;
    const siswa = dbKelas[indexAktif].siswa || [];
    const dataLama = dbNilaiFull[namaKelas]?.data || {};
    // ✅ FIX SYNTAX 1: Tambah "data:" key sebelum {}
    let payload = { meta: { jumlahPH },  {} };

    siswa.forEach((s, sIdx) => {
        // ✅ UPDATE: Fallback key jika s.id tidak ada
        const studentKey = s.id || s.nama || `siswa_${sIdx}`;
        const sLama = dataLama[studentKey] || {};
        if(viewAktif === 'pengetahuan') {
            let listPH = [];
            for(let i=0; i<jumlahPH; i++) {
                const el = document.getElementById(`ph_${sIdx}_${i}`);
                listPH.push(el ? el.value : 0);
            }
            payload.data[studentKey] = { 
                ...sLama, 
                ph: listPH, 
                sts: document.getElementById(`sts_${sIdx}`)?.value || 0, 
                sas: document.getElementById(`sas_${sIdx}`)?.value || 0 
            };
        } else {
            payload.data[studentKey] = { 
                ...sLama, 
                sikap: document.getElementById(`sikap_${sIdx}`)?.value || 'B', 
                catatan: document.getElementById(`catatan_${sIdx}`)?.value || '' 
            };
        }
    });

    await penilaianStorage.saveGrades(classId, payload);
    dbNilaiFull[namaKelas] = payload;
    alert("✅ Data Berhasil Disimpan!");
}

// ✅ UPDATE SEMUA WARNA - ✅ FIX 6: Expose to window for HTML oninput
window.updateSemuaWarna = function() { 
    if(indexAktif !== null && viewAktif === 'pengetahuan') renderTabel(); 
}

// ✅ EXPORT FUNCTION - FIXED
window.renderPenilaian = async function() {
    // ✅ FIX 1: Gunakan container yang konsisten dengan dashboard
    const container = document.getElementById('module-container');
    if(!container) {
        console.error('❌ module-container not found');
        return;
    }
    
    // ✅ FIX 2: Hide dashboard sections (seperti module lain)
    document.querySelectorAll('.dashboard-hero, [aria-labelledby="rooms-heading"], #sd-section, #smp-section, #sma-section')
        .forEach(el => el?.closest('section')?.classList.add('hidden'));
    
    // ✅ FIX 3: Wait for template to be available (IIFE pattern)
    if(typeof window.getPenilaianTemplate !== 'function') {
        console.warn('⚠️ getPenilaianTemplate not ready yet, waiting...');
        // Wait up to 2 seconds for template to load
        for(let i=0; i<20; i++) {
            await new Promise(r => setTimeout(r, 100));
            if(typeof window.getPenilaianTemplate === 'function') break;
        }
        if(typeof window.getPenilaianTemplate !== 'function') {
            console.error('❌ getPenilaianTemplate still not found after waiting');
            container.innerHTML = '<div class="p-8 text-rose-600 text-center font-bold">❌ Template tidak ditemukan. Pastikan penilaian-template.js load sebelum penilaian.js</div>';
            return;
        }
    }
    
    try {
        // ✅ UPDATE: Reset sync flag saat module dirender ulang
        isDataSynced = false;
        await syncData();
        container.innerHTML = window.getPenilaianTemplate();
        container.classList.remove('hidden');
        await initPenilaian();
        console.log('✅ [Penilaian] Module rendered successfully');
    } catch(e) {
        console.error('❌ [Penilaian] Render error:', e);
        container.innerHTML = `<div class="p-8 text-rose-600 text-center font-bold">❌ Error: ${e.message}</div>`;
    }
};

// ✅ Aliases for compatibility
window.loadPenilaianModule = window.renderPenilaian;
// ✅ HAPUS: window.safeRenderPenilaian = window.renderPenilaian; 
// (dashboard.html sudah punya safe wrapper sendiri)

// ============================================
// ✅ FUNGSI AKSI ROW: Simpan / Edit / Hapus (BARU)
// ============================================

// 💾 Simpan satu row siswa (Pengetahuan)
window.aksiSimpanRow = async function(sIdx) {
    if (indexAktif === null) return;
    
    const classId = dbKelas[indexAktif].id;
    const namaKelas = dbKelas[indexAktif].nama;
    const siswa = dbKelas[indexAktif].siswa[sIdx];
    const studentKey = siswa.id || siswa.nama || `siswa_${sIdx}`;
    
    // Ambil nilai dari input
    let listPH = [];
    for(let i=0; i<jumlahPH; i++) {
        const el = document.getElementById(`ph_${sIdx}_${i}`);
        listPH.push(el ? el.value : 0);
    }
    const sts = document.getElementById(`sts_${sIdx}`)?.value || 0;
    const sas = document.getElementById(`sas_${sIdx}`)?.value || 0;
    
    // Load existing data first (merge, don't replace all)
    const existing = await penilaianStorage.loadGrades(classId);
    if (!existing.data) existing.data = {};
    
    // Update only this student's data
    existing.data[studentKey] = { 
        ...(existing.data[studentKey] || {}),
        ph: listPH, 
        sts: sts, 
        sas: sas 
    };
    
    try {
        await penilaianStorage.saveGrades(classId, existing);
        // Update local cache
        // ✅ FIX SYNTAX 2: Tambah "data:" key sebelum {}
        if (!dbNilaiFull[namaKelas]) dbNilaiFull[namaKelas] = { meta: { jumlahPH },  {} };
        dbNilaiFull[namaKelas].data[studentKey] = { ph: listPH, sts, sas };
        
        // Toast notification
        showToast(`✅ Nilai ${siswa.nama} disimpan!`, 'success');
    } catch (e) {
        showToast(`❌ Gagal simpan: ${e.message}`, 'error');
    }
};

// ✏️ Edit mode untuk Pengetahuan (enable input)
window.aksiEditRow = function(sIdx) {
    // Enable semua input di row ini
    for(let i=0; i<jumlahPH; i++) {
        const el = document.getElementById(`ph_${sIdx}_${i}`);
        if (el) {
            el.classList.remove('bg-slate-50');
            el.classList.add('bg-yellow-50', 'border-blue-300');
            el.focus();
        }
    }
    const stsEl = document.getElementById(`sts_${sIdx}`);
    const sasEl = document.getElementById(`sas_${sIdx}`);
    if (stsEl) { stsEl.classList.add('bg-yellow-50', 'border-blue-300'); stsEl.focus(); }
    if (sasEl) { sasEl.classList.add('bg-yellow-50', 'border-blue-300'); sasEl.focus(); }
    
    showToast('✏️ Edit mode aktif. Ubah nilai lalu klik 💾', 'info');
};

// 💾 Simpan satu row siswa (Sikap)
window.aksiSimpanSikapRow = async function(sIdx) {
    if (indexAktif === null) return;
    
    const classId = dbKelas[indexAktif].id;
    const namaKelas = dbKelas[indexAktif].nama;
    const siswa = dbKelas[indexAktif].siswa[sIdx];
    const studentKey = siswa.id || siswa.nama || `siswa_${sIdx}`;
    
    const sikap = document.getElementById(`sikap_${sIdx}`)?.value || 'B';
    const catatan = document.getElementById(`catatan_${sIdx}`)?.value || '';
    
    // Load existing data first
    const existing = await penilaianStorage.loadGrades(classId);
    if (!existing.data) existing.data = {};
    
    // Update only this student's sikap data
    existing.data[studentKey] = { 
        ...(existing.data[studentKey] || {}),
        sikap: sikap, 
        catatan: catatan 
    };
    
    try {
        await penilaianStorage.saveGrades(classId, existing);
        // Update local cache
        // ✅ FIX SYNTAX 3: Tambah "data:" key sebelum {}
        if (!dbNilaiFull[namaKelas]) dbNilaiFull[namaKelas] = { meta: { jumlahPH },  {} };
        dbNilaiFull[namaKelas].data[studentKey] = { 
            ...(dbNilaiFull[namaKelas].data[studentKey] || {}),
            sikap, catatan 
        };
        
        showToast(`✅ Sikap ${siswa.nama} disimpan!`, 'success');
    } catch (e) {
        showToast(`❌ Gagal simpan: ${e.message}`, 'error');
    }
};

// ✏️ Edit mode untuk Sikap
window.aksiEditSikapRow = function(sIdx) {
    const sikapEl = document.getElementById(`sikap_${sIdx}`);
    const catatanEl = document.getElementById(`catatan_${sIdx}`);
    
    if (sikapEl) { sikapEl.classList.add('bg-yellow-50', 'border-blue-300'); sikapEl.focus(); }
    if (catatanEl) { 
        catatanEl.classList.add('bg-yellow-50', 'border-blue-300'); 
        catatanEl.style.minHeight = '80px';
        catatanEl.focus(); 
    }
    
    showToast('✏️ Edit mode aktif. Ubah lalu klik 💾', 'info');
};

// 🗑️ Hapus data satu row siswa (works for both Pengetahuan & Sikap)
window.aksiHapusRow = async function(sIdx) {
    if (indexAktif === null) return;
    
    const siswa = dbKelas[indexAktif].siswa[sIdx];
    const studentKey = siswa.id || siswa.nama || `siswa_${sIdx}`;
    
    // Confirm dialog
    if (!confirm(`Hapus data nilai untuk ${siswa.nama}?`)) return;
    
    const classId = dbKelas[indexAktif].id;
    const namaKelas = dbKelas[indexAktif].nama;
    
    try {
        // Load existing data
        const existing = await penilaianStorage.loadGrades(classId);
        // Delete student key
        if (existing.data?.[studentKey]) {
            delete existing.data[studentKey];
        }
        // Save back
        await penilaianStorage.saveGrades(classId, existing);
        // Update local cache
        if (dbNilaiFull[namaKelas]?.data?.[studentKey]) {
            delete dbNilaiFull[namaKelas].data[studentKey];
        }
        
        // Clear input values di UI (Pengetahuan)
        for(let i=0; i<jumlahPH; i++) {
            const el = document.getElementById(`ph_${sIdx}_${i}`);
            if (el) el.value = '';
        }
        const stsEl = document.getElementById(`sts_${sIdx}`);
        const sasEl = document.getElementById(`sas_${sIdx}`);
        if (stsEl) stsEl.value = '';
        if (sasEl) sasEl.value = '';
        const naEl = document.getElementById(`na_${sIdx}`);
        if (naEl) naEl.innerText = '0';
        
        // Clear input values di UI (Sikap)
        const sikapEl = document.getElementById(`sikap_${sIdx}`);
        const catatanEl = document.getElementById(`catatan_${sIdx}`);
        if (sikapEl) sikapEl.value = 'B';
        if (catatanEl) catatanEl.value = '';
        
        showToast(`🗑️ Data ${siswa.nama} dihapus!`, 'success');
    } catch (e) {
        showToast(`❌ Gagal hapus: ${e.message}`, 'error');
    }
};

// 🍞 Helper: Toast notification
function showToast(message, type = 'info') {
    const colors = {
        success: 'bg-emerald-600',
        error: 'bg-rose-600',
        info: 'bg-blue-600'
    };
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 ${colors[type]} text-white px-4 py-3 rounded-xl shadow-lg z-50 animate-fade-in`;
    toast.innerHTML = `<div class="flex items-center gap-2"><i class="fas ${icons[type]}"></i><span>${message}</span></div>`;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

console.log('🟢 [Penilaian] Module LOADED - Integrated with Adm. Kelas + Student Data Fix + Action Buttons');
