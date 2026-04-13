/**
 * PENILAIAN MODULE - INTEGRATED WITH ADM. KELAS
 * ✅ Reads from eduDBProV6 (same as adm-kelas)
 * ✅ Auto-sync with class & student data
 */

let dbKelas = JSON.parse(localStorage.getItem('eduDBProV6')) || [];
let dbNilaiFull = JSON.parse(localStorage.getItem('eduNilaiFullV1')) || {};
let indexAktif = null;
let viewAktif = 'pengetahuan';
let jumlahPH = 1;

console.log('🔴 [Penilaian] Module START');
console.log('📊 [Penilaian] dbKelas loaded:', dbKelas.length, 'classes');
console.log('📊 [Penilaian] dbNilaiFull keys:', Object.keys(dbNilaiFull));

// ✅ SYNC DATA: Load terbaru dari localStorage
function syncData() {
    dbKelas = JSON.parse(localStorage.getItem('eduDBProV6')) || [];
    dbNilaiFull = JSON.parse(localStorage.getItem('eduNilaiFullV1')) || {};
    console.log('🔄 [Penilaian] Data synced - Classes:', dbKelas.length);
}

// ✅ LOAD DROPDOWN: Populate dengan class ID (bukan index)
function initPenilaian() {
    console.log('🔴 [Penilaian] initPenilaian START');
    syncData();
    
    const select = document.getElementById('selectKelasNilai');
    if(!select) {
        console.error('❌ selectKelasNilai not found');
        return;
    }
    
    select.innerHTML = '<option value="">-- Pilih Kelas --</option>';
    
    if(dbKelas.length === 0) {
        select.innerHTML += '<option disabled>📝 Belum ada kelas. Buat di Adm. Kelas dulu!</option>';
        console.warn('⚠️ [Penilaian] No classes found');
        return;
    }
    
    dbKelas.forEach((k) => {
        const siswaCount = k.siswa?.length || 0;
        const label = `${k.nama} (${siswaCount} siswa)`;
        const option = `<option value="${k.id}">${label}</option>`;
        select.innerHTML += option;
        console.log(`  ✅ Added class: ${k.nama} [ID: ${k.id}]`);
    });
    
    console.log('✅ [Penilaian] initPenilaian DONE');
}

// ✅ SWITCH VIEW: Pengetahuan / Sikap
function switchView(mode) {
    console.log('👁️ [Penilaian] switchView:', mode);
    viewAktif = mode;
    const btnP = document.getElementById('btnPengetahuan');
    const btnS = document.getElementById('btnSikap');
    const kP = document.getElementById('kontrolPengetahuan');

    if(mode === 'pengetahuan') {
        btnP.className = "w-full flex items-center space-x-4 px-4 py-3 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 transition-all";
        btnS.className = "w-full flex items-center space-x-4 px-4 py-3 rounded-2xl hover:bg-white/5 transition-all text-slate-300";
        kP.classList.remove('hidden');
        document.getElementById('mainTitle').innerText = "Penilaian Pengetahuan";
        document.getElementById('mainDesc').innerText = "Input Nilai PH, STS, dan SAS";
    } else {
        btnS.className = "w-full flex items-center space-x-4 px-4 py-3 rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-500/30 transition-all";
        btnP.className = "w-full flex items-center space-x-4 px-4 py-3 rounded-2xl hover:bg-white/5 transition-all text-slate-300";
        kP.classList.add('hidden');
        document.getElementById('mainTitle').innerText = "Penilaian Sikap";
        document.getElementById('mainDesc').innerText = "Predikat Karakter & Catatan Deskripsi Siswa";
    }
    if(indexAktif !== null) renderTabel();
}

function tambahKolomPH() {
    if(indexAktif === null) return alert("Pilih kelas!");
    jumlahPH++;
    renderTabel();
}

// ✅ INITIALIZE TABLE: by classId (not index)
function inisialisasiTabel(classId) {
    console.log('🔄 [Penilaian] inisialisasiTabel:', classId);
    
    if(classId === "") {
        indexAktif = null;
        document.getElementById('tabelNilaiBody').innerHTML = `<tr><td colspan="6" class="p-20 text-center text-slate-300 font-bold italic">Pilih kelas untuk mengaktifkan tabel</td></tr>`;
        return;
    }
    
    // ✅ FIX: Find class by ID, not by index
    const classIndex = dbKelas.findIndex(k => k.id === classId);
    if(classIndex === -1) {
        console.error('❌ Class not found:', classId);
        alert('❌ Kelas tidak ditemukan!');
        return;
    }
    
    indexAktif = classIndex;
    const namaKelas = dbKelas[classIndex].nama;
    
    console.log(`✅ [Penilaian] Class selected: ${namaKelas}`);
    console.log(`   Siswa: ${dbKelas[classIndex].siswa?.length || 0}`);
    
    // Load saved data for this class
    jumlahPH = dbNilaiFull[namaKelas]?.meta?.jumlahPH || 1;
    
    renderTabel();
}

// ✅ RENDER TABLE: Display siswa + input fields
function renderTabel() {
    console.log('🎨 [Penilaian] renderTabel - view:', viewAktif);
    
    if(indexAktif === null) return;
    
    const head = document.getElementById('tabelHead');
    const body = document.getElementById('tabelNilaiBody');
    const kelas = dbKelas[indexAktif];
    const siswa = kelas.siswa || [];
    const namaKelas = kelas.nama;
    const savedData = dbNilaiFull[namaKelas]?.data || {};
    
    console.log(`   Rendering untuk: ${namaKelas}, Siswa: ${siswa.length}`);
    
    body.innerHTML = "";
    
    if(siswa.length === 0) {
        body.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-slate-400">❌ Belum ada siswa di kelas ini</td></tr>`;
        return;
    }

    if(viewAktif === 'pengetahuan') {
        // HEADER PENGETAHUAN
        let headPH = "";
        for(let i=1; i<=jumlahPH; i++) {
            headPH += `<th class="px-4 py-6 text-center bg-blue-50/30 min-w-[80px]">PH ${i}</th>`;
        }
        head.innerHTML = `<tr>
            <th class="px-8 py-6 sticky-col min-w-[250px]">Identitas Siswa</th>
            ${headPH}
            <th class="px-6 py-6 text-center bg-amber-50/30 min-w-[100px]">STS</th>
            <th class="px-6 py-6 text-center bg-emerald-50/30 min-w-[100px]">SAS</th>
            <th class="px-6 py-6 text-center bg-slate-900 text-white">NA</th>
        </tr>`;

        // BODY PENGETAHUAN
        siswa.forEach((s, sIdx) => {
            // ✅ FIX: Use student name as key (unique per class)
            const studentKey = s.nama;
            const sVal = savedData[studentKey] || { ph: [], sts: 0, sas: 0 };
            
            let rowPH = "";
            for(let i=0; i<jumlahPH; i++) {
                rowPH += `<td class="px-2 py-4">
                    <input type="number" 
                        oninput="hitungNA(${sIdx})" 
                        id="ph_${sIdx}_${i}" 
                        value="${sVal.ph[i] || 0}" 
                        class="w-full bg-slate-50 border-none p-2 rounded-lg text-center font-bold outline-none">
                </td>`;
            }
            
            body.innerHTML += `<tr class="hover:bg-slate-50/50">
                <td class="px-8 py-4 sticky-col font-black text-slate-800 text-sm">${s.nama}</td>
                ${rowPH}
                <td class="px-4 py-4">
                    <input type="number" 
                        oninput="hitungNA(${sIdx})" 
                        id="sts_${sIdx}" 
                        value="${sVal.sts || 0}" 
                        class="w-16 mx-auto block bg-white border border-amber-100 p-2 rounded-lg text-center font-bold">
                </td>
                <td class="px-4 py-4">
                    <input type="number" 
                        oninput="hitungNA(${sIdx})" 
                        id="sas_${sIdx}" 
                        value="${sVal.sas || 0}" 
                        class="w-16 mx-auto block bg-white border border-emerald-100 p-2 rounded-lg text-center font-bold">
                </td>
                <td class="px-6 py-4 text-center font-black text-lg" id="na_${sIdx}">0</td>
            </tr>`;
            
            hitungNA(sIdx);
        });
        
    } else {
        // HEADER SIKAP
        head.innerHTML = `<tr>
            <th class="px-8 py-6 sticky-col min-w-[250px]">Identitas Siswa</th>
            <th class="px-8 py-6 text-center bg-purple-50 text-purple-600 min-w-[150px]">Predikat</th>
            <th class="px-8 py-6 text-left bg-slate-50 min-w-[400px]">Catatan Deskripsi Sikap</th>
        </tr>`;
        
        // BODY SIKAP
        siswa.forEach((s, sIdx) => {
            const studentKey = s.nama;
            const sVal = savedData[studentKey] || { sikap: 'B', catatan: '' };
            
            body.innerHTML += `<tr class="hover:bg-slate-50/50">
                <td class="px-8 py-6 sticky-col font-black text-slate-800 text-sm">${s.nama}</td>
                <td class="px-8 py-6 text-center">
                    <select id="sikap_${sIdx}" class="bg-white border-2 border-purple-100 px-3 py-2 rounded-lg font-black text-purple-600">
                        <option value="A" ${sVal.sikap === 'A' ? 'selected' : ''}>A (Sangat Baik)</option>
                        <option value="B" ${sVal.sikap === 'B' ? 'selected' : ''}>B (Baik)</option>
                        <option value="C" ${sVal.sikap === 'C' ? 'selected' : ''}>C (Cukup)</option>
                        <option value="D" ${sVal.sikap === 'D' ? 'selected' : ''}>D (Kurang)</option>
                    </select>
                </td>
                <td class="px-8 py-6">
                    <textarea id="catatan_${sIdx}" 
                        placeholder="Contoh: Menunjukkan sikap santun dan tanggung jawab tinggi dalam tugas..." 
                        class="w-full bg-slate-50 border-none p-4 rounded-xl text-sm font-medium outline-none focus:ring-2 ring-rose-300 resize-none" 
                        rows="2">${sVal.catatan || ''}</textarea>
                </td>
            </tr>`;
        });
    }
}

// ✅ CALCULATE NA: Nilai Akhir
function hitungNA(sIdx) {
    let totalPH = 0;
    for(let i=0; i<jumlahPH; i++) {
        const el = document.getElementById(`ph_${sIdx}_${i}`);
        if(el) totalPH += parseFloat(el.value) || 0;
    }
    
    const rPH = jumlahPH > 0 ? totalPH / jumlahPH : 0;
    const elSts = document.getElementById(`sts_${sIdx}`);
    const elSas = document.getElementById(`sas_${sIdx}`);
    const elNa = document.getElementById(`na_${sIdx}`);
    
    const sts = elSts ? parseFloat(elSts.value) || 0 : 0;
    const sas = elSas ? parseFloat(elSas.value) || 0 : 0;
    const na = Math.round((rPH * 2 + sts + sas) / 4);
    
    if(elNa) {
        elNa.innerText = na;
        const kkm = parseFloat(document.getElementById('inputKKM')?.value || 75);
        elNa.className = `px-6 py-4 text-center font-black text-lg ${na < kkm ? 'text-rose-500' : 'text-emerald-600'}`;
    }
}

// ✅ SAVE: Simpan data ke localStorage
function simpanPermanen() {
    if(indexAktif === null) return alert('Pilih kelas dulu!');
    
    const namaKelas = dbKelas[indexAktif].nama;
    const dataLama = dbNilaiFull[namaKelas]?.data || {};
    const siswa = dbKelas[indexAktif].siswa || [];
    
    console.log('💾 [Penilaian] Saving:', namaKelas);
    
    let payload = { meta: { jumlahPH: jumlahPH }, data: {} };

    siswa.forEach((s, sIdx) => {
        const studentKey = s.nama;
        const sLama = dataLama[studentKey] || {};
        
        if(viewAktif === 'pengetahuan') {
            let listPH = [];
            for(let i=0; i<jumlahPH; i++) {
                const el = document.getElementById(`ph_${sIdx}_${i}`);
                listPH.push(el ? el.value : 0);
            }
            const elSts = document.getElementById(`sts_${sIdx}`);
            const elSas = document.getElementById(`sas_${sIdx}`);
            payload.data[studentKey] = { 
                ...sLama, 
                ph: listPH, 
                sts: elSts ? elSts.value : 0, 
                sas: elSas ? elSas.value : 0 
            };
        } else {
            const elSikap = document.getElementById(`sikap_${sIdx}`);
            const elCatatan = document.getElementById(`catatan_${sIdx}`);
            payload.data[studentKey] = { 
                ...sLama, 
                sikap: elSikap ? elSikap.value : 'B', 
                catatan: elCatatan ? elCatatan.value : '' 
            };
        }
    });

    dbNilaiFull[namaKelas] = { meta: payload.meta, data: { ...dataLama, ...payload.data } };
    localStorage.setItem('eduNilaiFullV1', JSON.stringify(dbNilaiFull));
    
    console.log('✅ [Penilaian] Saved:', namaKelas);
    alert("✅ Data Berhasil Disimpan!");
}

function updateSemuaWarna() { 
    if(indexAktif !== null && viewAktif === 'pengetahuan') renderTabel(); 
}

// ✅ EXPORT FUNCTION: Render modul
window.renderPenilaian = async function() {
    console.log('🔴 [Penilaian] renderPenilaian START');
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
        syncData();
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
