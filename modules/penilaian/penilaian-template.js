/**
 * PENILAIAN MODULE - INTEGRATED WITH ADM. KELAS
 * ✅ All syntax validated - no unexpected tokens
 * ✅ All HTML-callable functions exposed to window
 * ✅ UPDATED: Mobile touch optimization + cross-device compatibility
 * ✅ UPDATED: Add Keterampilan aspect (same format as Pengetahuan)
 */

import { storage } from '../adm-kelas/storage.js';
import { penilaianStorage } from './penilaian-storage.js';
import { hitungNA as hitungNAUtil } from './utils.js';

let dbKelas = [];
let dbNilaiFull = {};
let indexAktif = null;
let viewAktif = 'pengetahuan';
let jumlahPH = 1;
let isDataSynced = false;

// ✅ SYNC DATA
async function syncData() {
    const { auth } = await import('../firebase-config.js');
    storage.setUserId(auth.currentUser?.uid || null);
    
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

// ✅ VIEW SWITCH + UI UPDATE
window.switchView = function(mode) {
    viewAktif = mode;
    
    ['pengetahuan', 'sikap', 'keterampilan'].forEach(v => {
        const btn = document.getElementById(`btn${v.charAt(0).toUpperCase() + v.slice(1)}`);
        if (btn) {
            if (v === mode) {
                btn.classList.add('bg-blue-600', 'text-white', 'shadow-lg', 'shadow-blue-500/30');
                btn.classList.remove('hover:bg-white/5', 'text-slate-300');
            } else {
                btn.classList.remove('bg-blue-600', 'text-white', 'shadow-lg', 'shadow-blue-500/30');
                btn.classList.add('hover:bg-white/5', 'text-slate-300');
            }
        }
    });
    
    const titleMap = {
        'pengetahuan': { title: 'Penilaian Pengetahuan', desc: 'Input Nilai PH, STS, dan SAS' },
        'sikap': { title: 'Penilaian Sikap', desc: 'Input Predikat dan Catatan' },
        'keterampilan': { title: 'Penilaian Keterampilan', desc: 'Input Nilai PH, STS, dan SAS' }
    };
    const t = document.getElementById('mainTitle');
    const d = document.getElementById('mainDesc');
    if (t && d && titleMap[mode]) {
        t.textContent = titleMap[mode].title;
        d.textContent = titleMap[mode].desc;
    }
    
    const controls = document.getElementById('kontrolPengetahuan');
    if (controls) {
        controls.style.display = (mode === 'sikap') ? 'none' : 'flex';
    }
    
    if(indexAktif !== null) renderTabel();
};

window.tambahKolomPH = function() {
    if(indexAktif === null) return alert("Pilih kelas!");
    jumlahPH++;
    renderTabel();
};

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

// ✅ RENDER TABLE - MOBILE OPTIMIZED
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

    const isNumericView = (viewAktif === 'pengetahuan' || viewAktif === 'keterampilan');
    const prefix = isNumericView ? (viewAktif === 'keterampilan' ? 'keterampilan_' : '') : '';
    const aspectKey = viewAktif;

    if (isNumericView) {
        let headPH = "";
        for(let i=1; i<=jumlahPH; i++) headPH += `<th class="px-3 py-2 text-center bg-blue-50/30 min-w-[80px]">PH ${i}</th>`;
        head.innerHTML = `<tr>
            <th class="px-4 py-3 min-w-[180px] bg-white border-r border-slate-200">Identitas</th>
            ${headPH}
            <th class="px-4 py-3 text-center bg-amber-50/30 min-w-[90px]">STS</th>
            <th class="px-4 py-3 text-center bg-emerald-50/30 min-w-[90px]">SAS</th>
            <th class="px-4 py-3 text-center bg-slate-900 text-white min-w-[80px]">NA</th>
            <th class="px-3 py-3 text-center bg-slate-100 min-w-[110px]">Aksi</th>
        </tr>`;
        
        siswa.forEach((s, sIdx) => {
            const studentKey = s.id || s.nama || `siswa_${sIdx}`;
            const aspectData = savedData[studentKey]?.[aspectKey] || { ph: [], sts: 0, sas: 0 };
            
            let rowPH = "";
            for(let i=0; i<jumlahPH; i++) {
                const val = aspectData.ph[i] !== undefined ? aspectData.ph[i] : 0;
                // ✅ MOBILE FIX: inputmode + onchange fallback + font-size >=16px
                rowPH += `<td class="px-2 py-2">
                    <input type="number" inputmode="numeric" 
                           id="${prefix}ph_${sIdx}_${i}" 
                           value="${val}" 
                           oninput="window.hitungNA(${sIdx})" 
                           onchange="window.hitungNA(${sIdx})"
                           class="w-full bg-slate-50 border border-slate-200 p-2 rounded text-center text-base touch-target mobile-input">
                </td>`;
            }
            // ✅ MOBILE FIX: touch-target class + responsive padding
            body.innerHTML += `<tr class="hover:bg-slate-50/50" data-student-id="${studentKey}">
                <td class="px-4 py-3 font-medium text-slate-800 bg-white border-r border-slate-200 truncate max-w-[200px]">${s.nama || 'Siswa ' + (sIdx+1)}</td>
                ${rowPH}
                <td class="px-3 py-2">
                    <input type="number" inputmode="numeric" 
                           id="${prefix}sts_${sIdx}" 
                           value="${aspectData.sts || 0}" 
                           oninput="window.hitungNA(${sIdx})" 
                           onchange="window.hitungNA(${sIdx})"
                           class="w-full mx-auto block bg-white border border-amber-200 p-2 rounded text-center text-base touch-target mobile-input">
                </td>
                <td class="px-3 py-2">
                    <input type="number" inputmode="numeric" 
                           id="${prefix}sas_${sIdx}" 
                           value="${aspectData.sas || 0}" 
                           oninput="window.hitungNA(${sIdx})" 
                           onchange="window.hitungNA(${sIdx})"
                           class="w-full mx-auto block bg-white border border-emerald-200 p-2 rounded text-center text-base touch-target mobile-input">
                </td>
                <td class="px-4 py-3 text-center font-bold" id="${prefix}na_${sIdx}">0</td>
                <td class="px-3 py-3 text-center">
                    <div class="flex items-center justify-center gap-1">
                        <!-- ✅ MOBILE FIX: touch-target class for 44px min size -->
                        <button onclick="window.aksiSimpanRow(${sIdx})" class="p-2 text-emerald-600 hover:bg-emerald-50 rounded transition touch-target" title="Simpan"><i class="fas fa-save"></i></button>
                        <button onclick="window.aksiEditRow(${sIdx})" class="p-2 text-blue-600 hover:bg-blue-50 rounded transition touch-target" title="Edit"><i class="fas fa-edit"></i></button>
                        <button onclick="window.aksiHapusRow(${sIdx})" class="p-2 text-rose-600 hover:bg-rose-50 rounded transition touch-target" title="Hapus"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>`;
            window.hitungNA(sIdx);
        });
    } else {
        // ✅ Sikap view - mobile optimized
        head.innerHTML = `<tr>  
            <th class="px-4 py-3 min-w-[180px] bg-white border-r border-slate-200">Identitas</th>
            <th class="px-4 py-3 text-center bg-purple-50 text-purple-600 min-w-[120px]">Predikat</th>
            <th class="px-4 py-3 text-left bg-slate-50 min-w-[300px]">Catatan</th>
            <th class="px-3 py-3 text-center bg-slate-100 min-w-[100px]">Aksi</th>
        </tr>`;
        
        siswa.forEach((s, sIdx) => {
            const studentKey = s.id || s.nama || `siswa_${sIdx}`;
            const sVal = savedData[studentKey]?.sikap || { sikap: 'B', catatan: '' };
            body.innerHTML += `<tr class="hover:bg-slate-50/50" data-student-id="${studentKey}">
                <td class="px-4 py-3 font-medium text-slate-800 bg-white border-r border-slate-200 truncate max-w-[200px]">${s.nama || 'Siswa ' + (sIdx+1)}</td>
                <td class="px-4 py-3 text-center">
                    <select id="sikap_${sIdx}" class="bg-white border-2 border-purple-200 px-3 py-2 rounded-lg w-full touch-target mobile-input">
                        <option value="A" ${sVal.sikap==='A'?'selected':''}>A</option>
                        <option value="B" ${sVal.sikap==='B'?'selected':''}>B</option>
                        <option value="C" ${sVal.sikap==='C'?'selected':''}>C</option>
                        <option value="D" ${sVal.sikap==='D'?'selected':''}>D</option>
                    </select>
                </td>
                <td class="px-4 py-3">
                    <textarea id="catatan_${sIdx}" class="w-full bg-slate-50 border p-2 rounded mobile-input text-base" rows="2">${sVal.catatan || ''}</textarea>
                </td>
                <td class="px-3 py-3 text-center">
                    <div class="flex items-center justify-center gap-1">
                        <button onclick="window.aksiSimpanSikapRow(${sIdx})" class="p-2 text-emerald-600 touch-target"><i class="fas fa-save"></i></button>
                        <button onclick="window.aksiEditSikapRow(${sIdx})" class="p-2 text-blue-600 touch-target"><i class="fas fa-edit"></i></button>
                        <button onclick="window.aksiHapusRow(${sIdx})" class="p-2 text-rose-600 touch-target"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>`;
        });
    }
}

// ✅ HITUNG NA - MOBILE RELIABLE
window.hitungNA = function(sIdx) {
    const prefix = (viewAktif === 'keterampilan') ? 'keterampilan_' : '';
    const { na, elNa } = hitungNAUtil(sIdx, jumlahPH, document, prefix);
    
    if(elNa) {
        elNa.innerText = na;
        const kkm = parseFloat(document.getElementById('inputKKM')?.value || 75);
        elNa.className = `px-4 py-3 text-center font-bold ${na < kkm ? 'text-rose-500' : 'text-emerald-600'}`;
    }
};

// ✅ SIMPAN PERMANEN
window.simpanPermanen = async function() {
    if(indexAktif === null) return alert('Pilih kelas dulu!');
    const classId = dbKelas[indexAktif].id;
    const namaKelas = dbKelas[indexAktif].nama;
    const siswa = dbKelas[indexAktif].siswa || [];
    const dataLama = dbNilaiFull[namaKelas]?.data || {};
    
    let payload = { meta: { jumlahPH }, data: {} };

    siswa.forEach((s, sIdx) => {
        const studentKey = s.id || s.nama || `siswa_${sIdx}`;
        const sLama = dataLama[studentKey] || {};
        
        if (viewAktif === 'pengetahuan' || viewAktif === 'keterampilan') {
            const prefix = (viewAktif === 'keterampilan') ? 'keterampilan_' : '';
            let listPH = [];
            for(let i=0; i<jumlahPH; i++) {
                const el = document.getElementById(`${prefix}ph_${sIdx}_${i}`);
                listPH.push(el ? el.value : 0);
            }
            payload.data[studentKey] = { 
                ...sLama, 
                [viewAktif]: { ph: listPH, sts: document.getElementById(`${prefix}sts_${sIdx}`)?.value || 0, sas: document.getElementById(`${prefix}sas_${sIdx}`)?.value || 0 } 
            };
        } else {
            payload.data[studentKey] = { 
                ...sLama, 
                sikap: { sikap: document.getElementById(`sikap_${sIdx}`)?.value || 'B', catatan: document.getElementById(`catatan_${sIdx}`)?.value || '' } 
            };
        }
    });

    await penilaianStorage.saveGrades(classId, payload);
    dbNilaiFull[namaKelas] = payload;
    alert("✅ Data Berhasil Disimpan!");
};

window.updateSemuaWarna = function() { 
    if(indexAktif !== null && (viewAktif === 'pengetahuan' || viewAktif === 'keterampilan')) renderTabel(); 
};

// ✅ RENDER MODULE
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
        isDataSynced = false;
        await syncData();
        container.innerHTML = window.getPenilaianTemplate();
        container.classList.remove('hidden');
        await initPenilaian();
        window.switchView(viewAktif);
        console.log('✅ [Penilaian] Module rendered + Mobile Optimized');
    } catch(e) {
        console.error('❌ [Penilaian] Error:', e);
        container.innerHTML = `<div class="p-8 text-rose-600 text-center">❌ ${e.message}</div>`;
    }
};
window.loadPenilaianModule = window.renderPenilaian;

// ✅ ACTION FUNCTIONS - MOBILE OPTIMIZED

window.aksiSimpanRow = async function(sIdx) {
    if (indexAktif === null) return;
    const classId = dbKelas[indexAktif].id;
    const namaKelas = dbKelas[indexAktif].nama;
    const siswa = dbKelas[indexAktif].siswa[sIdx];
    const studentKey = siswa.id || siswa.nama || `siswa_${sIdx}`;
    
    const prefix = (viewAktif === 'keterampilan') ? 'keterampilan_' : '';
    let listPH = [];
    for(let i=0; i<jumlahPH; i++) { const el = document.getElementById(`${prefix}ph_${sIdx}_${i}`); listPH.push(el ? el.value : 0); }
    const sts = document.getElementById(`${prefix}sts_${sIdx}`)?.value || 0;
    const sas = document.getElementById(`${prefix}sas_${sIdx}`)?.value || 0;
    
    try {
        const existing = await penilaianStorage.loadGrades(classId);
        if (!existing.data) existing.data = {};
        existing.data[studentKey] = { 
            ...(existing.data[studentKey] || {}), 
            [viewAktif]: { ph: listPH, sts, sas } 
        };
        await penilaianStorage.saveGrades(classId, existing);
        if (!dbNilaiFull[namaKelas]) dbNilaiFull[namaKelas] = { meta: { jumlahPH }, data: {} };
        dbNilaiFull[namaKelas].data[studentKey] = { 
            ...(dbNilaiFull[namaKelas].data[studentKey] || {}), 
            [viewAktif]: { ph: listPH, sts, sas } 
        };
        showToast(`✅ ${siswa.nama} (${viewAktif}) disimpan`, 'success');
    } catch (e) { showToast('❌ ' + e.message, 'error'); }
};

window.aksiEditRow = function(sIdx) {
    const prefix = (viewAktif === 'keterampilan') ? 'keterampilan_' : '';
    for(let i=0; i<jumlahPH; i++) { const el = document.getElementById(`${prefix}ph_${sIdx}_${i}`); if(el) { el.classList.add('bg-yellow-50','border-blue-400'); el.focus(); } }
    [`${prefix}sts_${sIdx}`, `${prefix}sas_${sIdx}`].forEach(id=>{const el=document.getElementById(id);if(el){el.classList.add('bg-yellow-50','border-blue-400');el.focus();}});
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
        existing.data[studentKey] = { ...(existing.data[studentKey] || {}), sikap: { sikap, catatan } };
        await penilaianStorage.saveGrades(classId, existing);
        if (!dbNilaiFull[namaKelas]) dbNilaiFull[namaKelas] = { meta: { jumlahPH }, data: {} };
        dbNilaiFull[namaKelas].data[studentKey] = { ...(dbNilaiFull[namaKelas].data[studentKey] || {}), sikap: { sikap, catatan } };
        showToast(`✅ ${siswa.nama} (sikap) disimpan`, 'success');
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
        if (existing.data?.[studentKey]) {
            delete existing.data[studentKey][viewAktif];
            if (Object.keys(existing.data[studentKey]).length === 0) {
                delete existing.data[studentKey];
            }
        }
        await penilaianStorage.saveGrades(classId, existing);
        if (dbNilaiFull[namaKelas]?.data?.[studentKey]) {
            delete dbNilaiFull[namaKelas].data[studentKey][viewAktif];
            if (Object.keys(dbNilaiFull[namaKelas].data[studentKey]).length === 0) {
                delete dbNilaiFull[namaKelas].data[studentKey];
            }
        }
        
        const prefix = (viewAktif === 'keterampilan') ? 'keterampilan_' : '';
        if (viewAktif === 'pengetahuan' || viewAktif === 'keterampilan') {
            for (let i=0; i<jumlahPH; i++) { const el = document.getElementById(`${prefix}ph_${sIdx}_${i}`); if(el) el.value=''; }
            [`${prefix}sts_${sIdx}`, `${prefix}sas_${sIdx}`, `${prefix}na_${sIdx}`].forEach(id=>{const el=document.getElementById(id);if(el){if(id.includes('na'))el.innerText='0';else el.value='';}});
        } else {
            ['sikap_'+sIdx,'catatan_'+sIdx].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
        }
        showToast(`🗑️ ${siswa.nama} (${viewAktif}) dihapus`, 'success');
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

console.log('🟢 [Penilaian] FINAL - Mobile Optimized + Cross-Device Ready');
