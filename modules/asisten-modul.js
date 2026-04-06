/**
 * ============================================
 * MODULE: ASISTEN MODUL AJAR
 * Platform Administrasi Kelas Digital
 * ============================================
 * FITUR:
 * - Auto-fill data user dari localStorage (modal)
 * - MOCK MODE ONLY (No API Key)
 * - Editable fields (user bisa ubah auto-fill)
 * - Profil Pancasila included
 * - Clean result display (no scroll frame)
 * - Kop format sesuai standar modul ajar
 * ============================================
 */

console.log('🔴 [Asisten Modul] Script START — MOCK MODE');

import { 
  db, 
  auth, 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  doc,
  getDoc,
  serverTimestamp 
} from './firebase-config.js';

console.log('✅ [Asisten Modul] Firebase imports successful');

window.renderGeneratorModule = function() {
  console.log('📝 [Asisten Modul] renderGeneratorModule() called');
  
  const container = document.getElementById('module-container');
  if (!container) { console.error('❌ Container not found!'); return; }
  
  const user = auth.currentUser;
  
  // ✅ AMBIL DATA DARI MODAL (LOCALSTORAGE)
  const userNama = localStorage.getItem('user_nama_lengkap') || '';
  const userNIP = localStorage.getItem('user_nip') || '';
  const userKepsek = localStorage.getItem('user_nama_kepsek') || '';
  const userNIPKepsek = localStorage.getItem('user_nip_kepsek') || '';
  const userSekolah = localStorage.getItem('user_nama_sekolah') || '';
  
  console.log('👤 [Asisten Modul] User data from modal:', { userNama, userSekolah });
  
  container.innerHTML = `
    <style>
      .modul-form { max-width: 950px; margin: auto; padding: 30px; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
      .modul-form h2 { text-align: center; color: #7c3aed; margin-bottom: 10px; font-size: 28px; }
      .subtitle { text-align: center; color: #6b7280; margin-bottom: 30px; }
      .section-title { font-size: 18px; font-weight: 700; color: #374151; margin: 25px 0 15px 0; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb; display: flex; align-items: center; gap: 8px; }
      .modul-form label { display: block; margin-top: 12px; font-weight: 600; color: #374151; font-size: 14px; }
      .modul-form select, .modul-form input, .modul-form textarea { width: 100%; margin-top: 8px; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 14px; font-family: inherit; }
      .modul-form textarea { min-height: 100px; resize: vertical; line-height: 1.6; }
      .btn-generate, .btn-save, .btn-secondary { margin-top: 20px; padding: 14px 30px; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600; width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; }
      .btn-generate { background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); color: white; }
      .btn-generate:hover { background: linear-gradient(135deg, #6d28d9 0%, #5b21b6 100%); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(124,58,237,0.3); }
      .btn-save { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; }
      .btn-save:hover { background: linear-gradient(135deg, #059669 0%, #047857 100%); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(16,185,129,0.3); }
      .btn-secondary { background: #6b7280; color: white; margin-top: 10px; }
      .btn-secondary:hover { background: #4b5563; transform: translateY(-2px); }
      .result-section { background: transparent; padding: 0; margin-top: 20px; }
      .btn-back { margin-top: 20px; padding: 12px 30px; background: #6b7280; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; width: auto; }
      .btn-back:hover { background: #4b5563; }
      .hidden { display: none !important; }
      .auto-filled { background: #f0fdf4; border-color: #10b981 !important; }
      .grid-cols-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
      .grid-cols-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
      @media (max-width: 768px) { .grid-cols-2, .grid-cols-3 { grid-template-columns: 1fr; } }
      
      /* ✅ HASIL GENERATE — TANPA BINGKAI/SCROLL */
      #result-modul {
        width: 100%;
        min-height: 500px;
        padding: 20px;
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        font-family: monospace;
        font-size: 13px;
        line-height: 1.5;
        white-space: pre-wrap;
        margin-top: 12px;
      }
    </style>
    
    <div class="modul-form">
      <h2>📚 Asisten Modul Ajar</h2>
      <p class="subtitle">Buat Modul Ajar dengan Template Kurikulum Merdeka</p>
      
      <button class="btn-back" onclick="backToDashboard()">
        <i class="fas fa-arrow-left mr-2"></i>Kembali ke Dashboard
      </button>
      
      <form id="modul-form">
        <!-- ✅ SECTION 1: INFORMASI GURU (AUTO-FILL DARI MODAL) -->
        <div class="section-title"><i class="fas fa-user-tie"></i><span>1. Informasi Guru (Auto-Fill)</span></div>
        
        <div class="grid-cols-2">
          <div>
            <label for="modul-guru"><i class="fas fa-chalkboard-teacher mr-2"></i>Nama Guru</label>
            <input type="text" id="modul-guru" placeholder="Nama lengkap guru" value="${userNama}" class="${userNama ? 'auto-filled' : ''}">
            ${userNama ? '<p style="font-size:11px;color:#10b981;margin-top:4px;">✅ Auto-filled dari modal (bisa diedit)</p>' : ''}
          </div>
          <div>
            <label for="modul-nip"><i class="fas fa-id-card mr-2"></i>NIP</label>
            <input type="text" id="modul-nip" placeholder="NIP guru" value="${userNIP}" class="${userNIP ? 'auto-filled' : ''}">
            ${userNIP ? '<p style="font-size:11px;color:#10b981;margin-top:4px;">✅ Auto-filled dari modal (bisa diedit)</p>' : ''}
          </div>
        </div>
        
        <!-- ✅ SECTION 2: INFORMASI SEKOLAH (AUTO-FILL DARI MODAL) -->
        <div class="section-title"><i class="fas fa-school"></i><span>2. Informasi Sekolah (Auto-Fill)</span></div>
        
        <div>
          <label for="modul-sekolah"><i class="fas fa-university mr-2"></i>Nama Sekolah</label>
          <input type="text" id="modul-sekolah" placeholder="Nama sekolah" value="${userSekolah}" class="${userSekolah ? 'auto-filled' : ''}" required>
          ${userSekolah ? '<p style="font-size:11px;color:#10b981;margin-top:4px;">✅ Auto-filled dari modal (bisa diedit)</p>' : ''}
        </div>
        
        <div class="grid-cols-2">
          <div>
            <label for="modul-tahun"><i class="fas fa-calendar mr-2"></i>Tahun Ajaran</label>
            <input type="text" id="modul-tahun" placeholder="2025/2026" value="2025/2026">
          </div>
          <div>
            <label for="modul-alokasi"><i class="fas fa-clock mr-2"></i>Alokasi Waktu</label>
            <input type="text" id="modul-alokasi" placeholder="Contoh: 2 x 35 menit">
          </div>
        </div>
        
        <!-- ✅ SECTION 3: INFORMASI MODUL -->
        <div class="section-title"><i class="fas fa-book"></i><span>3. Informasi Modul</span></div>
        
        <div class="grid-cols-3">
          <div>
            <label for="modul-jenjang"><i class="fas fa-school mr-2"></i>Jenjang</label>
            <select id="modul-jenjang" required>
              <option value="">Pilih</option>
              <option value="sd">SD</option>
              <option value="smp">SMP</option>
              <option value="sma">SMA</option>
            </select>
          </div>
          <div>
            <label for="modul-kelas"><i class="fas fa-users mr-2"></i>Kelas</label>
            <select id="modul-kelas" required>
              <option value="">Pilih</option>
              <option value="1">1</option><option value="2">2</option><option value="3">3</option>
              <option value="4">4</option><option value="5">5</option><option value="6">6</option>
              <option value="7">7</option><option value="8">8</option><option value="9">9</option>
              <option value="10">10</option><option value="11">11</option><option value="12">12</option>
            </select>
          </div>
          <div>
            <label for="modul-mapel"><i class="fas fa-book mr-2"></i>Mapel</label>
            <select id="modul-mapel" required>
              <option value="">Pilih</option>
              <option value="matematika">Matematika</option>
              <option value="ipas">IPAS</option>
              <option value="bahasa-indonesia">B. Indonesia</option>
              <option value="pjok">PJOK</option>
              <option value="seni-budaya">Seni Budaya</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>
        </div>
        
        <div>
          <label for="modul-topik"><i class="fas fa-tag mr-2"></i>Topik/Materi</label>
          <input type="text" id="modul-topik" placeholder="Contoh: Pecahan Sederhana" required>
        </div>
        
        <!-- ✅ SECTION 4: PROFIL PELAJAR PANCASILA (RESTORED) -->
        <div class="section-title"><i class="fas fa-star"></i><span>4. Profil Pelajar Pancasila</span></div>
        
        <div class="grid-cols-3">
          <div><label><input type="checkbox" id="ppp-1" value="Beriman, Bertakwa"> Beriman, Bertakwa</label></div>
          <div><label><input type="checkbox" id="ppp-2" value="Berkebinekaan Global"> Berkebinekaan Global</label></div>
          <div><label><input type="checkbox" id="ppp-3" value="Bergotong Royong"> Bergotong Royong</label></div>
          <div><label><input type="checkbox" id="ppp-4" value="Mandiri"> Mandiri</label></div>
          <div><label><input type="checkbox" id="ppp-5" value="Bernalar Kritis"> Bernalar Kritis</label></div>
          <div><label><input type="checkbox" id="ppp-6" value="Kreatif"> Kreatif</label></div>
        </div>
        
        <button type="button" id="btn-generate" class="btn-generate">
          <i class="fas fa-magic"></i> Generate Modul Ajar
        </button>
      </form>
      
      <!-- ✅ HASIL GENERATE — TANPA BINGKAI SCROLL -->
      <div id="modul-result" class="hidden result-section">
        <h3 class="text-xl font-bold mb-4 text-gray-800">📋 Hasil Generate</h3>
        <textarea id="result-modul" placeholder="Modul akan muncul setelah generate..." style="min-height: 600px; width: 100%; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; font-family: monospace; font-size: 13px; line-height: 1.5; white-space: pre-wrap;"></textarea>
        
        <div style="display: flex; gap: 12px; margin-top: 16px;">
          <button type="button" id="btn-save" class="btn-save" style="flex: 2;">
            <i class="fas fa-save"></i> Simpan ke Firestore
          </button>
          <button type="button" id="btn-regenerate" class="btn-secondary" style="flex: 1;">
            <i class="fas fa-redo"></i> Ulang
          </button>
        </div>
      </div>
      
      <!-- Daftar Modul Tersimpan -->
      <div class="mt-12">
        <h3 class="text-xl font-bold mb-4 text-gray-800">
          <i class="fas fa-archive mr-2"></i>Modul Tersimpan (<span id="saved-count">0</span>)
        </h3>
        <div id="modul-list" class="space-y-4">
          <div class="loading-spinner"><i class="fas fa-spinner fa-spin text-2xl mb-3"></i><p>Memuat...</p></div>
        </div>
      </div>
    </div>
  `;
  
  hideDashboardSections();
  container.classList.remove('hidden');
  
  if (user) {
    setupEventHandlers();
    loadModulData();
  }
};

function hideDashboardSections() {
  document.querySelector('.dashboard-hero')?.closest('section')?.classList.add('hidden');
  document.querySelector('[aria-labelledby="rooms-heading"]')?.classList.add('hidden');
  document.querySelectorAll('#sd-section, #smp-section, #sma-section').forEach(s => s.classList.add('hidden'));
}

function setupEventHandlers() {
  const btnGenerate = document.getElementById('btn-generate');
  const btnSave = document.getElementById('btn-save');
  const btnRegenerate = document.getElementById('btn-regenerate');
  
  if (btnGenerate) btnGenerate.addEventListener('click', handleGenerate);
  if (btnSave) btnSave.addEventListener('click', handleSave);
  if (btnRegenerate) btnRegenerate.addEventListener('click', handleGenerate);
}

// ✅ MOCK GENERATE — RESTORED: Profil Pancasila + Kop Tanpa Kepsek
async function mockGenerateModul(guru, nip, sekolah, tahun, jenjang, kelas, mapel, topik, alokasi, profilPancasila) {
  console.log('📝 [Asisten Modul] Generating mock modul...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const jenjangCapital = jenjang.toUpperCase();
  const mapelCapital = mapel.toUpperCase();
  const pppList = profilPancasila.filter(p => p.checked).map(p => p.value).join(', ') || '-';
  
  return `
═══════════════════════════════════════════════════════════
                    MODUL AJAR
                  KURIKULUM MERDEKA
═══════════════════════════════════════════════════════════

I. INFORMASI UMUM
───────────────────────────────────────────────────────────
Nama Penyusun      : ${guru || '-'}
NIP                : ${nip || '-'}
Nama Sekolah       : ${sekolah || '-'}
Tahun Ajaran       : ${tahun || '2025/2026'}
Jenjang/Kelas      : ${jenjangCapital} / Kelas ${kelas}
Mata Pelajaran     : ${mapelCapital}
Topik/Materi       : ${topik || '-'}
Alokasi Waktu      : ${alokasi || '-'}

II. PROFIL PELAJAR PANCASILA
───────────────────────────────────────────────────────────
${pppList}

═══════════════════════════════════════════════════════════

III. KOMPONEN INTI
───────────────────────────────────────────────────────────

A. TUJUAN PEMBELAJARAN
   Setelah mengikuti pembelajaran ini, peserta didik dapat:
   1. Memahami konsep dasar ${topik || 'materi'} dengan benar
   2. Menerapkan ${topik || 'materi'} dalam situasi nyata
   3. Menganalisis hubungan antar konsep ${topik || 'materi'}
   4. Menyajikan hasil pembelajaran dengan jelas

B. PEMAHAMAN BERMAKNA
   Peserta didik memahami bahwa ${topik || 'materi ini'} 
   memiliki keterkaitan dengan kehidupan sehari-hari dan 
   dapat diterapkan dalam berbagai konteks.

C. PERTANYAAN PEMANTIK
   1. Apa yang kalian ketahui tentang ${topik || 'materi ini'}?
   2. Bagaimana ${topik || 'materi ini'} digunakan dalam kehidupan?
   3. Mengapa ${topik || 'materi ini'} penting untuk dipelajari?

D. KEGIATAN PEMBELAJARAN
   ┌─────────────────────────────────────────────────────┐
   │ PERTEMUAN 1                                         │
   ├─────────────────────────────────────────────────────┤
   │ Pendahuluan (10 menit)                             │
   │ • Salam dan doa                                    │
   │ • Apersepsi                                        │
   │ • Penyampaian tujuan                               │
   ├─────────────────────────────────────────────────────┤
   │ Kegiatan Inti (50 menit)                           │
   │ • Eksplorasi konsep                                │
   │ • Diskusi kelompok                                 │
   │ • Presentasi hasil                                 │
   ├─────────────────────────────────────────────────────┤
   │ Penutup (10 menit)                                 │
   │ • Refleksi                                         │
   │ • Kesimpulan                                       │
   │ • Doa penutup                                      │
   └─────────────────────────────────────────────────────┘

E. ASESMEN
   1. Asesmen Diagnostik: Kuis awal
   2. Asesmen Formatif: Observasi, lembar kerja
   3. Asesmen Sumatif: Tes tertulis

F. PENGAYAAN DAN REMEDIAL
   • Pengayaan: Tugas proyek tambahan
   • Remedial: Pembelajaran ulang dengan metode berbeda

G. LAMPIRAN
   • Lembar Kerja Peserta Didik (LKPD)
   • Rubrik Penilaian
   • Bahan Bacaan Guru dan Peserta Didik

═══════════════════════════════════════════════════════════
Mengetahui,
Kepala Sekolah


( ${userKepsek || '.....................'} )
NIP. ${userNIPKepsek || '.....................'}

Guru Mata Pelajaran


( ${guru || '.....................'} )
NIP. ${nip || '.....................'}
═══════════════════════════════════════════════════════════
  `.trim();
}

async function handleGenerate() {
  console.log('🪄 [Asisten Modul] Generate clicked');
  
  const user = auth.currentUser;
  if (!user) { alert('⚠️ Silakan login dulu!'); return; }
  
  const guru = document.getElementById('modul-guru')?.value;
  const nip = document.getElementById('modul-nip')?.value;
  const sekolah = document.getElementById('modul-sekolah')?.value;
  const tahun = document.getElementById('modul-tahun')?.value;
  const jenjang = document.getElementById('modul-jenjang')?.value;
  const kelas = document.getElementById('modul-kelas')?.value;
  const mapel = document.getElementById('modul-mapel')?.value;
  const topik = document.getElementById('modul-topik')?.value;
  const alokasi = document.getElementById('modul-alokasi')?.value;
  
  // ✅ Ambil Profil Pancasila
  const profilPancasila = [
    { id: 'ppp-1', value: 'Beriman, Bertakwa' },
    { id: 'ppp-2', value: 'Berkebinekaan Global' },
    { id: 'ppp-3', value: 'Bergotong Royong' },
    { id: 'ppp-4', value: 'Mandiri' },
    { id: 'ppp-5', value: 'Bernalar Kritis' },
    { id: 'ppp-6', value: 'Kreatif' }
  ].map(p => ({ checked: document.getElementById(p.id)?.checked, value: p.value }));
  
  if (!sekolah) { alert('⚠️ Nama Sekolah wajib diisi!'); return; }
  if (!jenjang || !kelas || !mapel || !topik) { alert('⚠️ Lengkapi Informasi Modul!'); return; }
  
  const resultDiv = document.getElementById('modul-result');
  if (resultDiv) resultDiv.classList.remove('hidden');
  
  document.getElementById('result-modul').value = '⏳ Sedang generate...';
  resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
  
  try {
    const result = await mockGenerateModul(guru, nip, sekolah, tahun, jenjang, kelas, mapel, topik, alokasi, profilPancasila);
    document.getElementById('result-modul').value = result;
    console.log('✅ [Asisten Modul] Generate complete!');
  } catch (error) {
    console.error('❌ [Asisten Modul] Error:', error);
    alert('❌ Gagal generate: ' + error.message);
  }
}

async function handleSave() {
  console.log('💾 [Asisten Modul] Save clicked');
  
  const user = auth.currentUser;
  if (!user) { alert('⚠️ Silakan login dulu!'); return; }
  
  const modul = document.getElementById('result-modul')?.value;
  if (!modul || modul === '⏳ Sedang generate...') {
    alert('⚠️ Generate data dulu sebelum menyimpan!');
    return;
  }
  
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const isAdmin = userDoc.exists() && userDoc.data()?.role === 'admin';
    
    await addDoc(collection(db, 'modul_ajar'), {
      userId: user.uid,
      userEmail: user.email,
      userName: user.displayName || 'Guru',
      guru: document.getElementById('modul-guru')?.value,
      nip: document.getElementById('modul-nip')?.value,
      sekolah: document.getElementById('modul-sekolah')?.value,
      tahun: document.getElementById('modul-tahun')?.value,
      jenjang: document.getElementById('modul-jenjang')?.value,
      kelas: document.getElementById('modul-kelas')?.value,
      mapel: document.getElementById('modul-mapel')?.value,
      topik: document.getElementById('modul-topik')?.value,
      alokasi: document.getElementById('modul-alokasi')?.value,
      profilPancasila: Array.from(document.querySelectorAll('#modul-form input[type="checkbox"]:checked')).map(cb => cb.value),
      modul: modul,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isAdmin: isAdmin
    });
    
    console.log('✅ [Asisten Modul] Data saved!');
    alert('✅ Modul Ajar berhasil disimpan!');
    loadModulData();
    document.getElementById('modul-result').classList.add('hidden');
    document.getElementById('modul-form').reset();
  } catch (error) {
    console.error('❌ [Asisten Modul] Save error:', error);
    alert('❌ Gagal simpan: ' + error.message);
  }
}

function loadModulData() {
  const list = document.getElementById('modul-list');
  const countSpan = document.getElementById('saved-count');
  if (!list) { console.error('❌ List container not found!'); return; }
  
  const user = auth.currentUser;
  if (!user) {
    list.innerHTML = `<div class="text-center py-8 text-gray-500"><p>Silakan login untuk melihat data</p></div>`;
    return;
  }
  
  (async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const isAdmin = userDoc.exists() && userDoc.data()?.role === 'admin';
      
      let q;
      if (isAdmin) {
        q = query(collection(db, 'modul_ajar'), orderBy('createdAt', 'desc'));
      } else {
        q = query(collection(db, 'modul_ajar'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
      }
      
      onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
          list.innerHTML = `<div class="text-center py-8 text-gray-500"><p>Belum ada modul tersimpan</p></div>`;
          return;
        }
        if (countSpan) countSpan.textContent = snapshot.docs.length;
        list.innerHTML = snapshot.docs.map(docSnap => {
          const d = docSnap.data();
          const date = d.createdAt?.toDate?.()?.toLocaleString('id-ID') || '-';
          return `
            <div class="cta-item">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <strong class="text-lg">${d.mapel?.toUpperCase() || '-'} - Kelas ${d.kelas}</strong>
                  <br><small class="text-gray-500">${d.userName} • ${d.sekolah || '-'}</small>
                </div>
                <small class="text-gray-400">${date}</small>
              </div>
              <p class="text-gray-700 mt-2"><strong>📋 Topik:</strong> ${d.topik || '-'}</p>
              <p class="text-gray-600 text-sm">${d.modul?.substring(0, 150) || '-'}...</p>
            </div>
          `;
        }).join('');
      });
    } catch (e) {
      console.error('❌ [Asisten Modul] Load error:', e);
    }
  })();
}

console.log('🟢 [Asisten Modul] READY — AUTO-FILL + PROFIL PANCASILA + CLEAN RESULT');
