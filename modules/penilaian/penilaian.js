/**
 * PENILAIAN MODULE - INTEGRATED WITH ADM. KELAS
 * ✅ Reads from adm-kelas storage
 * ✅ Auto-sync with class & student data
 * ✅ Save & load nilai via penilaian-storage.js
 */

import { storage } from '../adm-kelas/storage.js';
import { penilaianStorage } from './penilaian-storage.js';

let dbKelas = [];
let dbNilaiFull = {};
let indexAktif = null;
let viewAktif = 'pengetahuan';
let jumlahPH = 1;

// ✅ SYNC DATA
async function syncData() {
    dbKelas = await storage.loadClasses();
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

// ✅ SWITCH VIEW
function switchView(mode) {
    viewAktif = mode;
    if(indexAktif !== null) renderTabel();
}

function tambahKolomPH() {
    if(indexAktif === null) return alert("Pilih kelas!");
    jumlahPH++;
    renderTabel();
}

// ✅ INIT TABLE
async function inisialisasiTabel(classId) {
    if(classId === "") {
        indexAktif = null;
        document.getElementById('tabelNilaiBody').innerHTML = `<tr><td colspan="6">Pilih kelas untuk mengaktifkan tabel</td></tr>`;
        return;
    }
    const classIndex = dbKelas.findIndex(k => k.id === classId);
    if(classIndex === -1) return alert('❌ Kelas tidak ditemukan!');
    indexAktif = classIndex;
    const namaKelas = dbKelas[classIndex].nama;
    dbNilaiFull[namaKelas] = await penilaianStorage.loadGrades(classId);
    jumlahPH = dbNilaiFull[namaKelas]?.meta?.jumlahPH || 1;
    renderTabel();
}

// ✅ RENDER TABLE
function renderTabel() {
    if(indexAktif === null) return;
    const head = document.getElementById('tabelHead');
    const body = document.getElementById('tabelNilaiBody');
    const kelas = dbKelas[indexAktif];
    const siswa = kelas.siswa || [];
    const namaKelas = kelas.nama;
    const savedData = dbNilaiFull[namaKelas]?.data || {};
    body.innerHTML = "";

    if(viewAktif === 'pengetahuan') {
        // header
        let headPH = "";
        for(let i=1; i<=jumlahPH; i++) headPH += `<th>PH ${i}</th>`;
        head.innerHTML = `<tr><th>Identitas Siswa</th>${headPH}<th>STS</th><th>SAS</th><th>NA</th></tr>`;
        // body
        siswa.forEach((s, sIdx) => {
            const studentKey = s.id;
            const sVal = savedData[studentKey] || { ph: [], sts: 0, sas: 0 };
            let rowPH = "";
            for(let i=0; i<jumlahPH; i++) {
                rowPH += `<td><input type="number" id="ph_${sIdx}_${i}" value="${sVal.ph[i] || 0}" oninput="hitungNA(${sIdx})"></td>`;
            }
            body.innerHTML += `<tr><td>${s.nama}</td>${rowPH}
                <td><input type="number" id="sts_${sIdx}" value="${sVal.sts || 0}" oninput="hitungNA(${sIdx})"></td>
                <td><input type="number" id="sas_${sIdx}" value="${sVal.sas || 0}" oninput="hitungNA(${sIdx})"></td>
                <td id="na_${sIdx}">0</td></tr>`;
            hitungNA(sIdx);
        });
    } else {
        // header sikap
        head.innerHTML = `<tr><th>Identitas Siswa</th><th>Predikat</th><th>Catatan</th></tr>`;
        // body sikap
        siswa.forEach((s, sIdx) => {
            const studentKey = s.id;
            const sVal = savedData[studentKey] || { sikap: 'B', catatan: '' };
            body.innerHTML += `<tr><td>${s.nama}</td>
                <td><select id="sikap_${sIdx}">
                    <option value="A" ${sVal.sikap==='A'?'selected':''}>A (Sangat Baik)</option>
                    <option value="B" ${sVal.sikap==='B'?'selected':''}>B (Baik)</option>
                    <option value="C" ${sVal.sikap==='C'?'selected':''}>C (Cukup)</option>
                    <option value="D" ${sVal.sikap==='D'?'selected':''}>D (Kurang)</option>
                </select></td>
                <td><textarea id="catatan_${sIdx}">${sVal.catatan || ''}</textarea></td></tr>`;
        });
    }
}

// ✅ CALCULATE NA
function hitungNA(sIdx) {
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
        elNa.className = na < kkm ? 'text-rose-500' : 'text-emerald-600';
    }
}

// ✅ SAVE
async function simpanPermanen() {
    if(indexAktif === null) return alert('Pilih kelas dulu!');
    const classId = dbKelas[indexAktif].id;
    const namaKelas = dbKelas[indexAktif].nama;
    const siswa = dbKelas[indexAktif].siswa || [];
    const dataLama = dbNilaiFull[namaKelas]?.data || {};
    let payload = { meta: { jumlahPH }, data: {} };

    siswa.forEach((s, sIdx) => {
        const studentKey = s.id;
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

function updateSemuaWarna() { 
    if(indexAktif !== null && viewAktif === 'pengetahuan') renderTabel(); 
}

 // ✅ EXPORT FUNCTION
window.renderPenilaian = async function() {
    const container = document.getElementById('penilaian-container');
    if(!container) {
        console.error('❌ penilaian-container not found');
        return;
    }
    if(typeof getPenilaianTemplate !== 'function') {
        console.error('❌ getPenilaianTemplate not found');
        container.innerHTML = '<div class="p-8 text-rose-600 text-center font-bold">❌ Template tidak ditemukan</div>';
        return;
    }
    try {
        await syncData();
        container.innerHTML = getPenilaianTemplate();
        container.classList.remove('hidden');
        initPenilaian();
        console.log('✅ [Penilaian] Module rendered successfully');
    } catch(e) {
        console.error('❌ [Penilaian] Render error:', e);
        container.innerHTML = `<div class="p-8 text-rose-600 text-center font-bold">❌ Error: ${e.message}</div>`;
    }
};

window.loadPenilaianModule = window.renderPenilaian;

console.log('🟢 [Penilaian] Module LOADED - Integrated with Adm. Kelas');
