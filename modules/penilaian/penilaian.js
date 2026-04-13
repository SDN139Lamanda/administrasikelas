let dbKelas = JSON.parse(localStorage.getItem('eduDBProV6')) || [];
let dbNilaiFull = JSON.parse(localStorage.getItem('eduNilaiFullV1')) || {};
let indexAktif = null;
let viewAktif = 'pengetahuan'; // 'pengetahuan' atau 'sikap'
let jumlahPH = 1;

// Load Dropdown
function initPenilaian() {
    const select = document.getElementById('selectKelasNilai');
    if(!select) return;
    select.innerHTML = '<option value="">-- Pilih Kelas --</option>';
    dbKelas.forEach((k, i) => { 
        select.innerHTML += `<option value="${i}">${k.nama}</option>`; 
    });
}

function switchView(mode) {
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

function inisialisasiTabel(val) {
    indexAktif = (val === "") ? null : val;
    if(indexAktif !== null) {
        const namaKelas = dbKelas[indexAktif].nama;
        jumlahPH = dbNilaiFull[namaKelas]?.meta?.jumlahPH || 1;
        renderTabel();
    } else {
        document.getElementById('tabelNilaiBody').innerHTML = `<tr><td colspan="6" class="p-20 text-center text-slate-300 font-bold italic">Pilih kelas untuk mengaktifkan tabel</td></tr>`;
    }
}

function renderTabel() {
    const head = document.getElementById('tabelHead');
    const body = document.getElementById('tabelNilaiBody');
    const siswa = dbKelas[indexAktif].siswa;
    const namaKelas = dbKelas[indexAktif].nama;
    const savedData = dbNilaiFull[namaKelas]?.data || {};
    
    body.innerHTML = "";

    if(viewAktif === 'pengetahuan') {
        // HEADER PENGETAHUAN
        let headPH = "";
        for(let i=1; i<=jumlahPH; i++) headPH += `<th class="px-4 py-6 text-center bg-blue-50/30 min-w-[80px]">PH ${i}</th>`;
        head.innerHTML = `<tr><th class="px-8 py-6 sticky-col min-w-[250px]">Identitas Siswa</th>${headPH}<th class="px-6 py-6 text-center bg-amber-50/30 min-w-[100px]">STS</th><th class="px-6 py-6 text-center bg-emerald-50/30 min-w-[100px]">SAS</th><th class="px-6 py-6 text-center bg-slate-900 text-white">NA</th></tr>`;

        // BODY PENGETAHUAN
        siswa.forEach((s, sIdx) => {
            const sVal = savedData[s.nama] || { ph: [], sts: 0, sas: 0 };
            let rowPH = "";
            for(let i=0; i<jumlahPH; i++) {
                rowPH += `<td class="px-2 py-4"><input type="number" oninput="hitungNA(${sIdx})" id="ph_${sIdx}_${i}" value="${sVal.ph[i] || 0}" class="w-full bg-slate-50 border-none p-2 rounded-lg text-center font-bold outline-none"></td>`;
            }
            body.innerHTML += `<tr class="hover:bg-slate-50/50"><td class="px-8 py-4 sticky-col font-black text-slate-800 text-sm">${s.nama}</td>${rowPH}<td class="px-4 py-4"><input type="number" oninput="hitungNA(${sIdx})" id="sts_${sIdx}" value="${sVal.sts || 0}" class="w-16 mx-auto block bg-white border border-amber-100 p-2 rounded-lg text-center font-bold"></td><td class="px-4 py-4"><input type="number" oninput="hitungNA(${sIdx})" id="sas_${sIdx}" value="${sVal.sas || 0}" class="w-16 mx-auto block bg-white border border-emerald-100 p-2 rounded-lg text-center font-bold"></td><td class="px-6 py-4 text-center font-black text-lg" id="na_${sIdx}">0</td></tr>`;
            hitungNA(sIdx);
        });
    } else {
        // HEADER SIKAP
        head.innerHTML = `<tr><th class="px-8 py-6 sticky-col min-w-[250px]">Identitas Siswa</th><th class="px-8 py-6 text-center bg-purple-50 text-purple-600 min-w-[150px]">Predikat</th><th class="px-8 py-6 text-left bg-slate-50 min-w-[400px]">Catatan Deskripsi Sikap</th></tr>`;
        
        // BODY SIKAP
        siswa.forEach((s, sIdx) => {
            const sVal = savedData[s.nama] || { sikap: 'B', catatan: '' };
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
                    <textarea id="catatan_${sIdx}" placeholder="Contoh: Menunjukkan sikap santun dan tanggung jawab tinggi dalam tugas..." class="w-full bg-slate-50 border-none p-4 rounded-xl text-sm font-medium outline-none focus:ring-2 ring-rose-300 resize-none" rows="2">${sVal.catatan || ''}</textarea>
                </td>
            </tr>`;
        });
    }
}

function hitungNA(sIdx) {
    let totalPH = 0;
    for(let i=0; i<jumlahPH; i++) totalPH += parseFloat(document.getElementById(`ph_${sIdx}_${i}`).value) || 0;
    const rPH = totalPH / jumlahPH;
    const sts = parseFloat(document.getElementById(`sts_${sIdx}`).value) || 0;
    const sas = parseFloat(document.getElementById(`sas_${sIdx}`).value) || 0;
    const na = Math.round((rPH * 2 + sts + sas) / 4);
    const el = document.getElementById(`na_${sIdx}`);
    el.innerText = na;
    el.className = `px-6 py-4 text-center font-black text-lg ${na < document.getElementById('inputKKM').value ? 'text-rose-500' : 'text-emerald-600'}`;
}

function simpanPermanen() {
    if(indexAktif === null) return;
    const namaKelas = dbKelas[indexAktif].nama;
    const dataLama = dbNilaiFull[namaKelas]?.data || {};
    
    let payload = { meta: { jumlahPH: jumlahPH }, data: {} };

    dbKelas[indexAktif].siswa.forEach((s, sIdx) => {
        const sLama = dataLama[s.nama] || {};
        if(viewAktif === 'pengetahuan') {
            let listPH = [];
            for(let i=0; i<jumlahPH; i++) listPH.push(document.getElementById(`ph_${sIdx}_${i}`).value);
            payload.data[s.nama] = { ...sLama, ph: listPH, sts: document.getElementById(`sts_${sIdx}`).value, sas: document.getElementById(`sas_${sIdx}`).value };
        } else {
            payload.data[s.nama] = { ...sLama, sikap: document.getElementById(`sikap_${sIdx}`).value, catatan: document.getElementById(`catatan_${sIdx}`).value };
        }
    });

    dbNilaiFull[namaKelas] = { meta: payload.meta, data: { ...dataLama, ...payload.data } };
    localStorage.setItem('eduNilaiFullV1', JSON.stringify(dbNilaiFull));
    alert("✅ Data Berhasil Disimpan!");
}

function updateSemuaWarna() { 
    if(indexAktif !== null && viewAktif === 'pengetahuan') renderTabel(); 
}

// Export render function for dashboard
window.renderPenilaian = async function() {
    const container = document.getElementById('penilaian-container');
    if(!container) return console.error('❌ penilaian-container not found');
    
    if(typeof getPenilaianTemplate === 'function') {
        container.innerHTML = getPenilaianTemplate();
        container.classList.remove('hidden');
        initPenilaian();
        console.log('✅ Penilaian module rendered');
    } else {
        console.error('❌ getPenilaianTemplate function not found');
    }
};

window.loadPenilaianModule = window.renderPenilaian;

console.log('✅ [Penilaian] Module loaded');
