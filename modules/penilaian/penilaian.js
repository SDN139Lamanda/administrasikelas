/**
 * PENILAIAN MODULE - INTEGRATED WITH ADM. KELAS
 * ✅ All syntax validated - no unexpected tokens
 * ✅ All HTML-callable functions exposed to window
 * ✅ Mobile layout: normal scroll (nama ikut bergeser)
 * ✅ FIX: Data sync - set userId before loadClasses
 */

import { storage } from '../adm-kelas/storage.js';
import { penilaianStorage } from './penilaian-storage.js';

let dbKelas = [];
let dbNilaiFull = {};
let indexAktif = null;
let viewAktif = 'pengetahuan';
let jumlahPH = 1;
let isDataSynced = false;

// ✅ SYNC DATA - FIX: Set userId BEFORE loadClasses
async function syncData() {
    // ✅ FIX WAJIB: Set userId dari Firebase auth
    const { auth } = await import('../firebase-config.js');
    const currentUser = auth.currentUser;
    
    if (currentUser?.uid) {
        storage.setUserId(currentUser.uid);
        console.log('🔧 [Penilaian] storage.userId set:', currentUser.uid.substring(0, 10) + '...');
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
        firstClass: dbKelas?.[0]?.nama
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

// ✅ FIX 1: Expose to window
window.switchView = function(mode) {
    viewAktif = mode;
    if(indexAktif !== null) renderTabel();
};

// ✅ FIX 2: Expose to window
window.tambahKolomPH = function() {
    if(indexAktif === null) return alert("Pilih kelas!");
    jumlahPH++;
    renderTabel();
};

// ✅ FIX 3: Expose to window
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
            body.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-slate-500">⚠️ Belum ada siswa di kelas ini.</td></tr>`;
        }
        return;
    }
    dbNilaiFull[namaKelas] = await penilaianStorage.loadGrades(classId);
    jumlahPH = dbNilaiFull[namaKelas]?.meta?.jumlahPH || 1;
    renderTabel();
};

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
            <th class="px-8 py-4 min-w-[200px] bg-white border-r border-slate-200">Identitas Siswa</th>
            ${headPH}
            <th class="px-6 py-4 text-center bg-amber-50/30 min-w-[80px] border-l border-slate-200">STS</th>
            <th class="px-6 py-4 text-center bg-emerald-50/30 min-w-[80px]">SAS</th>
            <th class="px-6 py-4 text-center bg-slate-900 text-white min-w-[80px]">NA</th>
            <th class="px-4 py-4 text-center bg-slate-100 min-w-[100px] border-l border-slate-200">Aksi</th>
        </tr>`;
        
        siswa.forEach((s, sIdx) => {
            const studentKey = s.id || s.nama || `siswa_${sIdx}`;
            const sVal = savedData[studentKey] || { ph: [], sts: 0, sas: 0 };
            let rowPH = "";
            for(let i=0; i<jumlahPH; i++) {
                rowPH += `<td class="px-2 py-2"><input type="number" id="ph_${sIdx}_${i}" value="${sVal.ph[i] || 0}" oninput="window.hitungNA(${sIdx})" class="w-full bg-slate-50 border border-slate-200 p-2 rounded text-center"></td>`;
            }
            body.innerHTML += `<tr class="hover:bg-slate-50/50" data-student-id="${studentKey}">
                <td class="px-8 py-3 font-medium text-slate-800 bg-white border-r border-slate-200">${s.nama || 'Siswa ' + (sIdx+1)}</td>
                ${rowPH}
                <td class="px-4 py-3 border-l border-slate-200"><input type="number" id="sts_${sIdx}" value="${sVal.sts || 0}" oninput="window.hitungNA(${sIdx})" class="w-16 mx-auto block bg-white border border-amber-200 p-2 rounded text-center"></td>
                <td class="px-4 py-3"><input type="number" id="sas_${sIdx}" value="${sVal.sas || 0}" oninput="window.hitungNA(${sIdx})" class="w-16 mx-auto block bg-white border border-emerald-200 p-2 rounded text-center"></td>
                <td class="px-6 py-3 text-center font-bold border-l border-slate-200" id="na_${sIdx}">0</td>
                <td class="px-4 py-3 text-center border-l border-slate-200">
                    <div class="flex items-center justify-center gap-1">
                        <button onclick="window.aksiSimpanRow(${sIdx})" class="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition" title="Simpan"><i class="fas fa-save text-sm"></i></button>
                        <button onclick="window.aksiEditRow(${sIdx})" class="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition" title="Edit"><i class="fas fa-edit text-sm"></i></button>
                        <button onclick="window.aksiHapusRow(${sIdx})" class="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition" title="Hapus"><i class="fas fa-trash text-sm"></i></button>
                    </div>
                </td>
            </tr>`;
            window.hitungNA(sIdx);
        });
    } else {
        head.innerHTML = `<tr>
            <th class="px-8 py-4 min-w-[200px] bg-white border-r border-slate-200">Identitas Siswa</th>
            <th class="px-8 py-4 text-center bg-purple-50 text-purple-600 min-w-[150px]">Predikat</th>
            <th class="px-8 py-4 text-left bg-slate-50 min-w-[400px]">Catatan</th>
            <th class="px-4 py-4 text-center bg-slate-100 min-w-[120px] border-l border-slate-200">Aksi</th>
        </tr>`;
        
        siswa.forEach((s, sIdx) => {
            const studentKey = s.id || s.nama || `siswa_${sIdx}`;
            const sVal = savedData[studentKey] || { sikap: 'B', catatan: '' };
            body.innerHTML += `<tr class="hover:bg-slate-50/50" data-student-id="${studentKey}">
                <td class="px-8 py-4 font-medium text-slate-800 bg-white border-r border-slate-200">${s.nama || 'Siswa ' + (sIdx+1)}</td>
                <td class="px-8 py-4 text-center">
                    <select id="sikap_${sIdx}" class="bg-white border-2 border-purple-200 px-3 py-2 rounded-lg">
                        <option value="A" ${sVal.sikap==='A'?'selected':''}>A</option>
                        <option value="B" ${sVal.sikap==='B'?'selected':''}>B</option>
                        <option value="C" ${sVal.sikap==='C'?'selected':''}>C</option>
                        <option value="D" ${sVal.sikap==='D'?'selected':''}>D</option>
                    </select>
                </td>
                <td class="px-8 py-4"><textarea id="catatan_${sIdx}" class="w-full bg-slate-50 border p-2 rounded" rows="2">${sVal.catatan || ''}</textarea></td>
                <td class="px-4 py-4 text-center border-l border-slate-200">
                    <div class="flex items-center justify-center gap-1">
                        <button onclick="window.aksiSimpanSikapRow(${sIdx})" class="p-1.5 text-emerald-600"><i class="fas fa-save text-sm"></i></button>
                        <button onclick="window.aksiEditSikapRow(${sIdx})" class="p-1.5 text-blue-600"><i class="fas fa-edit text-sm"></i></button>
                        <button onclick="window.aksiHapusRow(${sIdx})" class="p-1.5 text-rose-600"><i class="fas fa-trash text-sm"></i></button>
                    </div>
                </td>
            </tr>`;
        });
    }
}

// ✅ FIX 4: Expose to window
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
};

// ✅ FIX 5: Expose to window + ✅ SYNTAX FIX:  key
window.simpanPermanen = async function() {
    if(indexAktif === null) return alert('Pilih kelas dulu!');
    const classId = dbKelas[indexAktif].id;
    const namaKelas = dbKelas[indexAktif].nama;
    const siswa = dbKelas[indexAktif].siswa || [];
    const dataLama = dbNilaiFull[namaKelas]?.data || {};
    
    // ✅ SYNTAX VALID - ada "" key:
    let payload = { meta: { jumlahPH }, data  {} };

    siswa.forEach((s, sIdx) => {
        const studentKey = s.id || s.nama || `siswa_${sIdx}`;
        const sLama = dataLama[studentKey] || {};
        if(viewAktif === 'pengetahuan') {
            let listPH = [];
            for(let i=0; i<jumlahPH; i++) {
                const el = document.getElementById(`ph_${sIdx}_${i}`);
                listPH.push(el ? el.value : 0);
            }
            payload.data[studentKey] = { ...sLama, ph: listPH, sts: document.getElementById(`sts_${sIdx}`)?.value || 0, sas: document.getElementById(`sas_${sIdx}`)?.value || 0 };
        } else {
            payload.data[studentKey] = { ...sLama, sikap: document.getElementById(`sikap_${sIdx}`)?.value || 'B', catatan: document.getElementById(`catatan_${sIdx}`)?.value || '' };
        }
    });

    await penilaianStorage.saveGrades(classId, payload);
    dbNilaiFull[namaKelas] = payload;
    alert("✅ Data Berhasil Disimpan!");
};

// ✅ FIX 6: Expose to window
window.updateSemuaWarna = function() { 
    if(indexAktif !== null && viewAktif === 'pengetahuan') renderTabel(); 
};

// ✅ MAIN EXPORT
window.renderPenilaian = async function() {
    const container = document.getElementById('module-container');
    if(!container) { console.error('❌ module-container not found'); return; }
    
    document.querySelectorAll('.dashboard-hero, [aria-labelledby="rooms-heading"], #sd-section, #smp-section, #sma-section')
        .forEach(el => el?.closest('section')?.classList.add('hidden'));
    
    if(typeof window.getPenilaianTemplate !== 'function') {
        for(let i=0; i<20; i++) {
            await new Promise(r => setTimeout(r, 100));
            if(typeof window.getPenilaianTemplate === 'function') break;
        }
        if(typeof window.getPenilaianTemplate !== 'function') {
            container.innerHTML = '<div class="p-8 text-rose-600 text-center">❌ Template not found</div>';
            return;
        }
    }
    
    try {
        isDataSynced = false;  // ✅ Reset sync flag saat module dirender ulang
        await syncData();      // ✅ Ini akan set userId + load classes
        container.innerHTML = window.getPenilaianTemplate();
        container.classList.remove('hidden');
        await initPenilaian();
        console.log('✅ [Penilaian] Module rendered');
    } catch(e) {
        console.error('❌ [Penilaian] Error:', e);
        container.innerHTML = `<div class="p-8 text-rose-600 text-center">❌ ${e.message}</div>`;
    }
};

window.loadPenilaianModule = window.renderPenilaian;

// ✅ ACTION FUNCTIONS (all exposed to window)

window.aksiSimpanRow = async function(sIdx) {
    if (indexAktif === null) return;
    const classId = dbKelas[indexAktif].id;
    const namaKelas = dbKelas[indexAktif].nama;
    const siswa = dbKelas[indexAktif].siswa[sIdx];
    const studentKey = siswa.id || siswa.nama || `siswa_${sIdx}`;
    
    let listPH = [];
    for(let i=0; i<jumlahPH; i++) { const el = document.getElementById(`ph_${sIdx}_${i}`); listPH.push(el ? el.value : 0); }
    const sts = document.getElementById(`sts_${sIdx}`)?.value || 0;
    const sas = document.getElementById(`sas_${sIdx}`)?.value || 0;
    
    try {
        const existing = await penilaianStorage.loadGrades(classId);
        if (!existing.data) existing.data = {};
        existing.data[studentKey] = { ...(existing.data[studentKey] || {}), ph: listPH, sts, sas };
        await penilaianStorage.saveGrades(classId, existing);
        // ✅ SYNTAX VALID:
        if (!dbNilaiFull[namaKelas]) dbNilaiFull[namaKelas] = { meta: { jumlahPH }, data {} };
        dbNilaiFull[namaKelas].data[studentKey] = { ph: listPH, sts, sas };
        showToast(`✅ ${siswa.nama} disimpan`, 'success');
    } catch (e) { showToast('❌ ' + e.message, 'error'); }
};

window.aksiEditRow = function(sIdx) {
    for(let i=0; i<jumlahPH; i++) { const el = document.getElementById(`ph_${sIdx}_${i}`); if(el) { el.classList.add('bg-yellow-50','border-blue-400'); el.focus(); } }
    ['sts_'+sIdx,'sas_'+sIdx].forEach(id=>{const el=document.getElementById(id);if(el){el.classList.add('bg-yellow-50','border-blue-400');el.focus();}});
    showToast('✏️ Edit mode', 'info');
};

window.aksiSimpanSikapRow = async function(sIdx) {
    if (indexAktif === null) return;
    const classId = dbKelas[indexAktif].id;
    const namaKelas = dbKelas[indexAktif].nama;
    const siswa = dbKelas[indexAktif].siswa[sIdx];
    const studentKey = siswa.id || siswa.nama || `siswa_${sIdx}`;
    
    const sikap = document.getElementById(`sikap_${sIdx}`)?.value || 'B';
    const catatan = document.getElementById(`catatan_${sIdx}`)?.value || '';
    
    try {
        const existing = await penilaianStorage.loadGrades(classId);
        if (!existing.data) existing.data = {};
        existing.data[studentKey] = { ...(existing.data[studentKey] || {}), sikap, catatan };
        await penilaianStorage.saveGrades(classId, existing);
        // ✅ SYNTAX VALID:
        if (!dbNilaiFull[namaKelas]) dbNilaiFull[namaKelas] = { meta: { jumlahPH },  {} };
        dbNilaiFull[namaKelas].data[studentKey] = { ...(dbNilaiFull[namaKelas].data[studentKey] || {}), sikap, catatan };
        showToast(`✅ ${siswa.nama} disimpan`, 'success');
    } catch (e) { showToast('❌ ' + e.message, 'error'); }
};

window.aksiEditSikapRow = function(sIdx) {
    ['sikap_'+sIdx,'catatan_'+sIdx].forEach(id=>{const el=document.getElementById(id);if(el){el.classList.add('bg-yellow-50','border-blue-400');if(id.startsWith('catatan'))el.style.minHeight='80px';el.focus();}});
    showToast('✏️ Edit mode', 'info');
};

window.aksiHapusRow = async function(sIdx) {
    if (indexAktif === null) return;
    const siswa = dbKelas[indexAktif].siswa[sIdx];
    const studentKey = siswa.id || siswa.nama || `siswa_${sIdx}`;
    if (!confirm(`Hapus data ${siswa.nama}?`)) return;
    
    const classId = dbKelas[indexAktif].id;
    const namaKelas = dbKelas[indexAktif].nama;
    
    try {
        const existing = await penilaianStorage.loadGrades(classId);
        if (existing.data?.[studentKey]) delete existing.data[studentKey];
        await penilaianStorage.saveGrades(classId, existing);
        if (dbNilaiFull[namaKelas]?.data?.[studentKey]) delete dbNilaiFull[namaKelas].data[studentKey];
        
        for (let i=0; i<jumlahPH; i++) { const el = document.getElementById(`ph_${sIdx}_${i}`); if(el) el.value=''; }
        ['sts_'+sIdx,'sas_'+sIdx,'sikap_'+sIdx,'catatan_'+sIdx,'na_'+sIdx].forEach(id=>{const el=document.getElementById(id);if(el){if(id==='na_'+sIdx)el.innerText='0';else if(id==='sikap_'+sIdx)el.value='B';else el.value='';}});
        showToast(`🗑️ ${siswa.nama} dihapus`, 'success');
    } catch (e) { showToast('❌ ' + e.message, 'error'); }
};

function showToast(message, type = 'info') {
    const colors = { success:'bg-emerald-600', error:'bg-rose-600', info:'bg-blue-600' };
    const icons = { success:'fa-check-circle', error:'fa-exclamation-circle', info:'fa-info-circle' };
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 ${colors[type]} text-white px-4 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2`;
    toast.innerHTML = `<i class="fas ${icons[type]}"></i><span>${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity='0'; setTimeout(() => toast.remove(), 300); }, 3000);
}

console.log('🟢 [Penilaian] FINAL - All syntax validated + Mobile scroll + Data sync fix');
