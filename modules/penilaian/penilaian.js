/**
 * PENILAIAN MODULE - INTEGRATED WITH ADM. KELAS
 * ✅ Reads from adm-kelas storage
 * ✅ Auto-sync with class & student data
 * ✅ Save & load nilai via penilaian-storage.js
 * ✅ FIX: Container + Template loading + Student data integration
 * ✅ UPDATE: Action buttons (Simpan/Edit/Hapus) per row
 * ✅ FIX: All syntax validated + userId set for storage
 */

import { storage } from '../adm-kelas/storage.js';
import { penilaianStorage } from './penilaian-storage.js';

let dbKelas = [];
let dbNilaiFull = {};
let indexAktif = null;
let viewAktif = 'pengetahuan';
let jumlahPH = 1;
let isDataSynced = false;

// ✅ SYNC DATA - FIX: Set storage.userId before loadClasses
async function syncData() {
    // ✅ FIX: Set userId dari auth.currentUser
    const { auth } = await import('../firebase-config.js');
    const currentUser = auth.currentUser;
    
    if (currentUser?.uid) {
        storage.setUserId(currentUser.uid);
        console.log('🔧 [Penilaian] storage.userId set:', currentUser.uid);
    } else {
        console.warn('⚠️ [Penilaian] No authenticated user, skipping sync');
        return;
    }
    
    if (isDataSynced && dbKelas.length > 0) {
        console.log('🔄 [Penilaian] Data already synced, skipping...');
        return;
    }
    
    console.log('🔍 [Penilaian] Calling storage.loadClasses()...');
    dbKelas = await storage.loadClasses();
    
    console.log('📊 [Penilaian] loadClasses result:', {
        count: dbKelas?.length,
        firstClass: dbKelas?.[0]?.nama,
        firstClassStudents: dbKelas?.[0]?.siswa?.length
    });
    
    isDataSynced = true;
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

// ✅ SWITCH VIEW - Expose to window
window.switchView = function(mode) {
    viewAktif = mode;
    if(indexAktif !== null) renderTabel();
}

// ✅ TAMBAH KOLOM PH - Expose to window
window.tambahKolomPH = function() {
    if(indexAktif === null) return alert("Pilih kelas!");
    jumlahPH++;
    renderTabel();
}

// ✅ INIT TABLE - Expose to window
window.inisialisasiTabel = async function(classId) {
    if(classId === "") {
        indexAktif = null;
        const body = document.getElementById('tabelNilaiBody');
        if(body) body.innerHTML = `<tr><td colspan="7">Pilih kelas untuk mengaktifkan tabel</td></tr>`;
        return;
    }
    
    await syncData();
    
    const classIndex = dbKelas.findIndex(k => k.id === classId);
    if(classIndex === -1) return alert('❌ Kelas tidak ditemukan!');
    indexAktif = classIndex;
    
    const kelas = dbKelas[classIndex];
    const namaKelas = kelas.nama;
    
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
        let headPH = "";
        for(let i=1; i<=jumlahPH; i++) headPH += `<th class="px-4 py-2 text-center bg-blue-50/30 min-w-[80px]">PH ${i}</th>`;
        head.innerHTML = `<tr>
            <th class="px-8 py-4 sticky-col min-w-[250px] bg-white">Identitas Siswa</th>
            ${headPH}
            <th class="px-6 py-4 text-center bg-amber-50/30 min-w-[100px]">STS</th>
            <th class="px-6 py-4 text-center bg-emerald-50/30 min-w-[100px]">SAS</th>
            <th class="px-6 py-4 text-center bg-slate-900 text-white">NA</th>
            <th class="px-4 py-4 text-center bg-slate-100 min-w-[120px]">Aksi</th>
        </tr>`;
        
        siswa.forEach((s, sIdx) => {
            const studentKey = s.id || s.nama || `siswa_${sIdx}`;
            const sVal = savedData[studentKey] || { ph: [], sts: 0, sas: 0 };
            let rowPH = "";
            for(let i=0; i<jumlahPH; i++) {
                rowPH += `<td class="px-2 py-2"><input type="number" id="ph_${sIdx}_${i}" value="${sVal.ph[i] || 0}" oninput="hitungNA(${sIdx})" class="w-full bg-slate-50 border border-slate-200 p-2 rounded text-center"></td>`;
            }
            body.innerHTML += `<tr class="hover:bg-slate-50/50" data-student-id="${studentKey}">
                <td class="px-8 py-3 sticky-col font-medium text-slate-800 bg-white">${s.nama || 'Siswa ' + (sIdx+1)}</td>
                ${rowPH}
                <td class="px-4 py-3"><input type="number" id="sts_${sIdx}" value="${sVal.sts || 0}" oninput="hitungNA(${sIdx})" class="w-16 mx-auto block bg-white border border-amber-200 p-2 rounded text-center"></td>
                <td class="px-4 py-3"><input type="number" id="sas_${sIdx}" value="${sVal.sas || 0}" oninput="hitungNA(${sIdx})" class="w-16 mx-auto block bg-white border border-emerald-200 p-2 rounded text-center"></td>
                <td class="px-6 py-3 text-center font-bold" id="na_${sIdx}">0</td>
                <td class="px-4 py-3 text-center">
                    <div class="flex items-center justify-center gap-1">
                        <button onclick="aksiSimpanRow(${sIdx})" class="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition" title="Simpan">
                            <i class="fas fa-save text-sm"></i>
                        </button>
                        <button onclick="aksiEditRow(${sIdx})" class="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition" title="Edit">
                            <i class="fas fa-edit text-sm"></i>
                        </button>
                        <button onclick="aksiHapusRow(${sIdx})" class="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition" title="Hapus">
                            <i class="fas fa-trash text-sm"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
            hitungNA(sIdx);
        });
    } else {
        head.innerHTML = `<tr>
            <th class="px-8 py-4 sticky-col min-w-[250px] bg-white">Identitas Siswa</th>
            <th class="px-8 py-4 text-center bg-purple-50 text-purple-600 min-w-[150px]">Predikat</th>
            <th class="px-8 py-4 text-left bg-slate-50 min-w-[400px]">Catatan Deskripsi Sikap</th>
            <th class="px-4 py-4 text-center bg-slate-100 min-w-[120px]">Aksi</th>
        </tr>`;
        
        siswa.forEach((s, sIdx) => {
            const studentKey = s.id || s.nama || `siswa_${sIdx}`;
            const sVal = savedData[studentKey] || { sikap: 'B', catatan: '' };
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
                <td class="px-4 py-4 text-center">
                    <div class="flex items-center justify-center gap-1">
                        <button onclick="aksiSimpanSikapRow(${sIdx})" class="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition" title="Simpan">
                            <i class="fas fa-save text-sm"></i>
                        </button>
                        <button onclick="aksiEditSikapRow(${sIdx})" class="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition" title="Edit">
                            <i class="fas fa-edit text-sm"></i>
                        </button>
                        <button onclick="aksiHapusRow(${sIdx})" class="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition" title="Hapus">
                            <i class="fas fa-trash text-sm"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
        });
    }
}

// ✅ CALCULATE NA - Expose to window
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

// ✅ SAVE PERMANEN - Expose to window
window.simpanPermanen = async function() {
    if(indexAktif === null) return alert('Pilih kelas dulu!');
    const classId = dbKelas[indexAktif].id;
    const namaKelas = dbKelas[indexAktif].nama;
    const siswa = dbKelas[indexAktif].siswa || [];
    const dataLama = dbNilaiFull[namaKelas]?.data || {};
    let payload = { meta: { jumlahPH },  {} };

    siswa.forEach((s, sIdx) => {
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

// ✅ UPDATE SEMUA WARNA - Expose to window
window.updateSemuaWarna = function() { 
    if(indexAktif !== null && viewAktif === 'pengetahuan') renderTabel(); 
}

// ✅ EXPORT FUNCTION
window.renderPenilaian = async function() {
    const container = document.getElementById('module-container');
    if(!container) {
        console.error('❌ module-container not found');
        return;
    }
    
    document.querySelectorAll('.dashboard-hero, [aria-labelledby="rooms-heading"], #sd-section, #smp-section, #sma-section')
        .forEach(el => el?.closest('section')?.classList.add('hidden'));
    
    if(typeof window.getPenilaianTemplate !== 'function') {
        console.warn('⚠️ getPenilaianTemplate not ready yet, waiting...');
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

window.loadPenilaianModule = window.renderPenilaian;

// ============================================
// ✅ FUNGSI AKSI ROW
// ============================================

window.aksiSimpanRow = async function(sIdx) {
    if (indexAktif === null) return;
    const classId = dbKelas[indexAktif].id;
    const namaKelas = dbKelas[indexAktif].nama;
    const siswa = dbKelas[indexAktif].siswa[sIdx];
    const studentKey = siswa.id || siswa.nama || `siswa_${sIdx}`;
    
    let listPH = [];
    for(let i=0; i<jumlahPH; i++) {
        const el = document.getElementById(`ph_${sIdx}_${i}`);
        listPH.push(el ? el.value : 0);
    }
    const sts = document.getElementById(`sts_${sIdx}`)?.value || 0;
    const sas = document.getElementById(`sas_${sIdx}`)?.value || 0;
    
    const existing = await penilaianStorage.loadGrades(classId);
    if (!existing.data) existing.data = {};
    existing.data[studentKey] = { ...(existing.data[studentKey] || {}), ph: listPH, sts, sas };
    
    try {
        await penilaianStorage.saveGrades(classId, existing);
        if (!dbNilaiFull[namaKelas]) dbNilaiFull[namaKelas] = { meta: { jumlahPH },  {} };
        dbNilaiFull[namaKelas].data[studentKey] = { ph: listPH, sts, sas };
        showToast(`✅ Nilai ${siswa.nama} disimpan!`, 'success');
    } catch (e) {
        showToast(`❌ Gagal simpan: ${e.message}`, 'error');
    }
};

window.aksiEditRow = function(sIdx) {
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

window.aksiSimpanSikapRow = async function(sIdx) {
    if (indexAktif === null) return;
    const classId = dbKelas[indexAktif].id;
    const namaKelas = dbKelas[indexAktif].nama;
    const siswa = dbKelas[indexAktif].siswa[sIdx];
    const studentKey = siswa.id || siswa.nama || `siswa_${sIdx}`;
    
    const sikap = document.getElementById(`sikap_${sIdx}`)?.value || 'B';
    const catatan = document.getElementById(`catatan_${sIdx}`)?.value || '';
    
    const existing = await penilaianStorage.loadGrades(classId);
    if (!existing.data) existing.data = {};
    existing.data[studentKey] = { ...(existing.data[studentKey] || {}), sikap, catatan };
    
    try {
        await penilaianStorage.saveGrades(classId, existing);
        if (!dbNilaiFull[namaKelas]) dbNilaiFull[namaKelas] = { meta: { jumlahPH },  {} };
        dbNilaiFull[namaKelas].data[studentKey] = { ...(dbNilaiFull[namaKelas].data[studentKey] || {}), sikap, catatan };
        showToast(`✅ Sikap ${siswa.nama} disimpan!`, 'success');
    } catch (e) {
        showToast(`❌ Gagal simpan: ${e.message}`, 'error');
    }
};

window.aksiEditSikapRow = function(sIdx) {
    const sikapEl = document.getElementById(`sikap_${sIdx}`);
    const catatanEl = document.getElementById(`catatan_${sIdx}`);
    if (sikapEl) { sikapEl.classList.add('bg-yellow-50', 'border-blue-300'); sikapEl.focus(); }
    if (catatanEl) { catatanEl.classList.add('bg-yellow-50', 'border-blue-300'); catatanEl.style.minHeight = '80px'; catatanEl.focus(); }
    showToast('✏️ Edit mode aktif. Ubah lalu klik 💾', 'info');
};

window.aksiHapusRow = async function(sIdx) {
    if (indexAktif === null) return;
    const siswa = dbKelas[indexAktif].siswa[sIdx];
    const studentKey = siswa.id || siswa.nama || `siswa_${sIdx}`;
    
    if (!confirm(`Hapus data nilai untuk ${siswa.nama}?`)) return;
    
    const classId = dbKelas[indexAktif].id;
    const namaKelas = dbKelas[indexAktif].nama;
    
    try {
        const existing = await penilaianStorage.loadGrades(classId);
        if (existing.data?.[studentKey]) delete existing.data[studentKey];
        await penilaianStorage.saveGrades(classId, existing);
        if (dbNilaiFull[namaKelas]?.data?.[studentKey]) delete dbNilaiFull[namaKelas].data[studentKey];
        
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
        
        const sikapEl = document.getElementById(`sikap_${sIdx}`);
        const catatanEl = document.getElementById(`catatan_${sIdx}`);
        if (sikapEl) sikapEl.value = 'B';
        if (catatanEl) catatanEl.value = '';
        
        showToast(`🗑️ Data ${siswa.nama} dihapus!`, 'success');
    } catch (e) {
        showToast(`❌ Gagal hapus: ${e.message}`, 'error');
    }
};

function showToast(message, type = 'info') {
    const colors = { success: 'bg-emerald-600', error: 'bg-rose-600', info: 'bg-blue-600' };
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 ${colors[type]} text-white px-4 py-3 rounded-xl shadow-lg z-50 animate-fade-in`;
    toast.innerHTML = `<div class="flex items-center gap-2"><i class="fas ${icons[type]}"></i><span>${message}</span></div>`;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
}

console.log('🟢 [Penilaian] Module LOADED - All syntax validated + userId integration fixed');
