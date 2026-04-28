/**
 * ============================================
 * MODULE: ASISTEN MODUL KBC (KURIKULUM BERBASIS CINTA)
 * Folder: modules/asisten-modul-kbc.js
 * Platform Administrasi Kelas Digital
 * ✅ FINAL: Pure AI Only + Strict Schema Enforcement + KBC Specific
 * ============================================
 */

console.log('🔴 [Asisten KBC] Script START — Pure AI + Strict Schema');

// ✅ STATIC IMPORTS
import { 
  db, auth, collection, addDoc, query, where, orderBy, 
  onSnapshot, doc, getDoc, serverTimestamp 
} from './firebase-config.js';

import { generateWithGroq } from './groq-api.js';

console.log('✅ [Asisten KBC] Imports successful');

// ============================================
// ✅ STRICT PROMPT BUILDER (KORIDOR MUTLAK)
// ============================================

function buildPromptKBC(data) {
  const nilaiKBC = data.nilaiKBC?.filter(n => n.checked).map(n => n.value).join(', ') || '-';
  
  return `Anda adalah penyusun modul ajar madrasah profesional. Buat MODUL AJAR BERBASIS CINTA (KBC) lengkap dan siap pakai.

📋 DATA INPUT:
• Guru: ${data.guru || '-'} (${data.nip || 'N/A'})
• Sekolah: ${data.sekolah || '-'}, Tahun: ${data.tahun || '2025/2026'}
• Jenjang/Kelas: ${data.jenjang?.toUpperCase() || '-'}/Kelas ${data.kelas || '-'}
• Mapel: ${data.mapel?.toUpperCase() || '-'}, Topik: ${data.topik || '-'}
• Alokasi: ${data.alokasi || '-'}
• Model: ${data.modelPembelajaran || 'pbl'}
• Target: ${data.targetPesertaDidik === 'reguler' ? 'Reguler' : data.targetPesertaDidik === 'kesulitan' ? 'Kesulitan Belajar' : 'Pencapaian Tinggi'}
• Nilai KBC Dipilih: ${nilaiKBC}

📐 STRUKTUR OUTPUT (WAJIB & BERURUTAN MUTLAK):
I. IDENTITAS MODUL KBC
   - Nama Penyusun, NIP, Sekolah, Tahun, Jenjang/Kelas, Mapel, Topik, Alokasi, Model
II. LANDASAN FILOSOFIS KBC
   - Integrasi 6 Nilai KBC: ${nilaiKBC}
   - Penekanan keseimbangan Ruhiyah (spiritual), Qalbiyah (emosional), Aqliyah (intelektual)
   - Prinsip "Adab sebelum Ilmu" & pembelajaran berbasis kasih sayang
III. KOMPETENSI & TUJUAN PEMBELAJARAN
   - Kompetensi terintegrasi nilai KBC
   - Tujuan Pembelajaran (Kognitif, Afektif/Akhlak, Psikomotorik/Amal)
   - Pemahaman Bermakna & Pertanyaan Pemantik (bernuansa hikmah & refleksi)
IV. KEGIATAN PEMBELAJARAN
   A. Pendahuluan (Doa, apersepsi bernuansa adab, tujuan)
   B. Kegiatan Inti (Eksplorasi, diskusi taawun, praktik berbasis kasih sayang, presentasi)
   C. Penutup (Refleksi akhlak, doa penutup, tindak lanjut)
V. ASESMEN HOLISTIK
   - Kognitif (Ilmu), Afektif (Akhlak/Sikap), Psikomotorik (Amal/Praktik)
   - Pengayaan & Remedial (berbasis pembinaan & pendekatan personal)
VI. LAMPIRAN
   - LKPD: ${data.lkpd || 'Aktivitas eksplorasi & diskusi kelompok'}
   - Bahan Bacaan: ${data.bahanBacaan || 'Rangkuman materi & referensi'}
   - Doa Pembuka & Penutup: ${data.doa || 'Doa belajar & penutup majelis'}
   - Kisah Inspiratif/Tokoh: ${data.kisah || 'Kisah teladan ulama/cendekiawan terkait topik'}
   - Glosarium Adab/Syariah: ${data.glosarium || 'Istilah fiqih/adab & definisi'}
   - Daftar Pustaka: ${data.pustaka || 'KMA terkait, buku teks madrasah, sumber terpercaya'}
   - Tanda Tangan: Kepala Madrasah & Guru Mata Pelajaran

⚠️ ATURAN KETAT (NON-NEGOTIABLE):
1. Output HANYA berisi struktur I sampai VI secara BERURUTAN.
2. JANGAN tambahkan pembuka ("Berikut modul..."), penutup ("Semoga bermanfaat"), atau komentar di luar struktur.
3. Jika data input kurang, isi bagian tersebut dengan: [📝 Lengkapi manual]
4. Gunakan bahasa Indonesia baku, formal, bernuansa pedagogis madrasah.
5. Gunakan pemisah === dan --- untuk keterbacaan.
6. Output HARUS mengikuti urutan bab. Jika melenceng, output dianggap TIDAK VALID.`.trim();
}

// ============================================
// ✅ UI RENDER FUNCTION
// ============================================

export async function renderAsistenKBC() {
  console.log('📝 [Asisten KBC] renderAsistenKBC() called');
  
  const container = document.getElementById('module-container');
  if (!container) {
    console.error('❌ [Asisten KBC] Container #module-container NOT FOUND');
    return;
  }
  
  const user = auth.currentUser;
  if (!user) {
    container.innerHTML = '<div class="p-8 text-center text-gray-500">⚠️ Silakan login untuk mengakses modul ini.</div>';
    return;
  }
  
  const userNama = localStorage.getItem('user_nama_lengkap') || '';
  const userNIP = localStorage.getItem('user_nip') || '';
  const userSekolah = localStorage.getItem('user_nama_sekolah') || '';
  const userKepsek = localStorage.getItem('user_nama_kepsek') || '';
  const userNIPKepsek = localStorage.getItem('user_nip_kepsek') || '';
  const userJenjang = localStorage.getItem('user_jenjang') || '';
  
  container.innerHTML = `
    <style>
      .kbc-form { max-width: 950px; margin: auto; padding: 30px; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
      .kbc-form h2 { text-align: center; color: #059669; margin-bottom: 10px; font-size: 28px; }
      .subtitle { text-align: center; color: #6b7280; margin-bottom: 30px; }
      .section-title { font-size: 18px; font-weight: 700; color: #374151; margin: 25px 0 15px 0; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb; display: flex; align-items: center; gap: 8px; }
      .kbc-form label { display: block; margin-top: 12px; font-weight: 600; color: #374151; font-size: 14px; }
      .kbc-form select, .kbc-form input, .kbc-form textarea { width: 100%; margin-top: 8px; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 14px; font-family: inherit; }
      .kbc-form textarea { min-height: 90px; resize: vertical; line-height: 1.6; }
      .btn-generate, .btn-save, .btn-print, .btn-download, .btn-back { margin-top: 20px; padding: 14px 30px; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600; width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; }
      .btn-generate { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; }
      .btn-generate:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(5,150,105,0.3); }
      .btn-save { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; }
      .btn-print { background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: white; }
      .btn-download { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; }
      .btn-back { margin-top: 20px; padding: 12px 30px; background: #6b7280; color: white; width: auto; }
      .hidden { display: none !important; }
      .auto-filled { background: #f0fdf4; border-color: #059669 !important; }
      .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
      .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
      @media (max-width: 768px) { .grid-2, .grid-3 { grid-template-columns: 1fr; } }
      #result-modul-kbc { width: 100%; min-height: 500px; padding: 20px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; font-family: monospace; font-size: 13px; line-height: 1.5; white-space: pre-wrap; margin-top: 12px; }
    </style>
    
    <div class="kbc-form">
      <h2>🕌 Asisten Modul KBC</h2>
      <p class="subtitle">Kurikulum Berbasis Cinta | Madrasah Kemenag</p>
      
      <button class="btn-back" id="btn-back-kbc"><i class="fas fa-arrow-left mr-2"></i>Kembali ke Dashboard</button>
      
      <form id="kbc-form">
        <div class="section-title"><i class="fas fa-user-tie"></i><span>1. Identitas Guru & Sekolah</span></div>
        <div class="grid-2">
          <div><label>Nama Guru</label><input type="text" id="kbc-guru" value="${userNama}" class="${userNama?'auto-filled':''}"></div>
          <div><label>NIP</label><input type="text" id="kbc-nip" value="${userNIP}" class="${userNIP?'auto-filled':''}"></div>
        </div>
        <div><label>Nama Sekolah/Madrasah</label><input type="text" id="kbc-sekolah" value="${userSekolah}" required class="${userSekolah?'auto-filled':''}"></div>
        
        <div class="section-title"><i class="fas fa-book-open"></i><span>2. Informasi Pembelajaran</span></div>
        <div class="grid-3">
          <div><label>Jenjang</label><select id="kbc-jenjang" required><option value="">Pilih</option><option value="mi">MI</option><option value="mts">MTs</option><option value="ma">MA</option><option value="smp">SMP</option><option value="sma">SMA</option></select></div>
          <div><label>Kelas</label><select id="kbc-kelas" required><option value="">Pilih</option>${Array.from({length:12},(_,i)=>i+1).map(k=>`<option value="${k}">${k}</option>`).join('')}</select></div>
          <div><label>Mapel</label><select id="kbc-mapel" required><option value="">Pilih</option><option value="fiqih">Fiqih</option><option value="akidah">Akidah Akhlak</option><option value="quran">Al-Quran & Hadis</option><option value="sk">Sejarah Kebudayaan Islam</option><option value="bahasa-arab">Bahasa Arab</option><option value="pai">PAI</option><option value="umum">Umum</option></select></div>
        </div>
        <div><label>Topik/Materi</label><input type="text" id="kbc-topik" placeholder="Contoh: Adab kepada Orang Tua" required></div>
        <div class="grid-2">
          <div><label>Tahun Ajaran</label><input type="text" id="kbc-tahun" value="2025/2026"></div>
          <div><label>Alokasi Waktu</label><input type="text" id="kbc-alokasi" placeholder="Contoh: 2 x 40 menit"></div>
        </div>
        
        <div class="section-title"><i class="fas fa-cog"></i><span>3. Parameter Pembelajaran</span></div>
        <div><label>Kompetensi Awal</label><textarea id="kbc-kompetensi-awal" rows="2" placeholder="Pengetahuan/keterampilan awal siswa..."></textarea></div>
        <div><label>Sarana Prasarana</label><textarea id="kbc-sarana" rows="2" placeholder="Media & alat pendukung..."></textarea></div>
        <div class="grid-2">
          <div><label>Target Peserta</label><select id="kbc-target"><option value="reguler">Reguler</option><option value="kesulitan">Kesulitan Belajar</option><option value="pencapaian-tinggi">Pencapaian Tinggi</option></select></div>
          <div><label>Model Pembelajaran</label><select id="kbc-model"><option value="pbl">Problem Based Learning</option><option value="pjbl">Project Based Learning</option><option value="tatap-muka">Tatap Muka</option><option value="lainnya">Lainnya</option></select></div>
        </div>
        
        <div class="section-title"><i class="fas fa-heart"></i><span>4. Nilai Inti KBC (Pilih yang relevan)</span></div>
        <div class="grid-3">
          <div><label><input type="checkbox" id="kbc-nilai-1" value="Cinta Kasih & Empati" checked> Cinta Kasih & Empati</label></div>
          <div><label><input type="checkbox" id="kbc-nilai-2" value="Akhlak Mulia"> Akhlak Mulia</label></div>
          <div><label><input type="checkbox" id="kbc-nilai-3" value="Adab & Sopan Santun" checked> Adab & Sopan Santun</label></div>
          <div><label><input type="checkbox" id="kbc-nilai-4" value="Keseimbangan Ruhiyah"> Keseimbangan Ruhiyah</label></div>
          <div><label><input type="checkbox" id="kbc-nilai-5" value="Keseimbangan Qalbiyah"> Keseimbangan Qalbiyah</label></div>
          <div><label><input type="checkbox" id="kbc-nilai-6" value="Keseimbangan Aqliyah"> Keseimbangan Aqliyah</label></div>
        </div>
        
        <div class="section-title"><i class="fas fa-paperclip"></i><span>5. Lampiran Khusus KBC</span></div>
        <div><label>LKPD</label><textarea id="kbc-lkpd" rows="2" placeholder="Aktivitas kelompok/individu..."></textarea></div>
        <div><label>Bahan Bacaan</label><textarea id="kbc-bahan" rows="2" placeholder="Materi pendukung..."></textarea></div>
        <div class="grid-2">
          <div><label>Doa Pembuka & Penutup</label><textarea id="kbc-doa" rows="2" placeholder="Doa belajar, penutup majelis..."></textarea></div>
          <div><label>Kisah Inspiratif/Tokoh</label><textarea id="kbc-kisah" rows="2" placeholder="Teladan sahabat/ulama/cendekiawan..."></textarea></div>
        </div>
        <div class="grid-2">
          <div><label>Glosarium Adab/Syariah</label><textarea id="kbc-glosarium" rows="2" placeholder="Istilah & makna..."></textarea></div>
          <div><label>Daftar Pustaka</label><textarea id="kbc-pustaka" rows="2" placeholder="Referensi KMA, buku teks..."></textarea></div>
        </div>
        
        <button type="button" id="btn-generate-kbc" class="btn-generate"><i class="fas fa-magic"></i> Generate Modul KBC</button>
      </form>
      
      <div id="modul-result-kbc" class="hidden result-section">
        <h3 class="text-xl font-bold mb-4 text-gray-800">📋 Hasil Generate KBC</h3>
        <textarea id="result-modul-kbc" readonly></textarea>
        <div style="display:flex;gap:12px;margin-top:16px;flex-wrap:wrap;">
          <button type="button" id="btn-download-kbc" class="btn-download" style="flex:1"><i class="fas fa-download"></i> Download</button>
          <button type="button" id="btn-print-kbc" class="btn-print" style="flex:1"><i class="fas fa-print"></i> Print</button>
          <button type="button" id="btn-save-kbc" class="btn-save" style="flex:2"><i class="fas fa-save"></i> Simpan ke Firestore</button>
        </div>
      </div>
      
      <div class="mt-12"><h3 class="text-xl font-bold mb-4 text-gray-800"><i class="fas fa-archive mr-2"></i>Modul KBC Tersimpan (<span id="saved-count-kbc">0</span>)</h3><div id="modul-list-kbc" class="space-y-4"><div class="text-center py-6 text-gray-500"><i class="fas fa-spinner fa-spin"></i><p>Memuat...</p></div></div></div>
    </div>
  `;
  
  // Set default jenjang if known
  setTimeout(() => {
    const jSel = document.getElementById('kbc-jenjang');
    if (jSel && userJenjang) jSel.value = userJenjang;
  }, 50);
  
  hideDashboardSections();
  container.classList.remove('hidden');
  
  if (user) {
    setTimeout(() => {
      setupKBCHandlers();
      loadKBCData();
    }, 100);
  }
  
  console.log('🟢 [Asisten KBC] UI render complete');
}

window.renderAsistenKBC = renderAsistenKBC;

// ============================================
// ✅ HELPERS & HANDLERS
// ============================================

function hideDashboardSections() {
  document.querySelector('.dashboard-hero')?.closest('section')?.classList.add('hidden');
  document.querySelector('[aria-labelledby="rooms-heading"]')?.classList.add('hidden');
  document.querySelectorAll('#sd-section, #smp-section, #sma-section, #mi-section, #mts-section, #ma-section, #tk-section').forEach(s => s.classList.add('hidden'));
}

function setupKBCHandlers() {
  const backBtn = document.getElementById('btn-back-kbc');
  if (backBtn) backBtn.addEventListener('click', () => {
    if (typeof window.backToDashboard === 'function') window.backToDashboard();
    else document.getElementById('module-container')?.classList.add('hidden');
  });
  
  const actions = {
    'btn-generate-kbc': handleGenerateKBC,
    'btn-download-kbc': handleDownloadKBC,
    'btn-print-kbc': handlePrintKBC,
    'btn-save-kbc': handleSaveKBC
  };
  
  Object.entries(actions).forEach(([id, fn]) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
  });
}

function handleDownloadKBC() {
  const txt = document.getElementById('result-modul-kbc')?.value;
  if (!txt || txt.includes('⏳') || txt.includes('❌')) return alert('⚠️ Generate dulu!');
  const topik = document.getElementById('kbc-topik')?.value || 'modul';
  const mapel = document.getElementById('kbc-mapel')?.value || '';
  const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = `Modul_KBC_${mapel}_${topik.replace(/\s+/g,'_')}.txt`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(a.href);
}

function handlePrintKBC() {
  const txt = document.getElementById('result-modul-kbc')?.value;
  if (!txt || txt.includes('⏳') || txt.includes('❌')) return alert('⚠️ Generate dulu!');
  window.print();
}

// ============================================
// ✅ GENERATE (PURE AI, NO FALLBACK)
// ============================================

async function handleGenerateKBC() {
  const user = auth.currentUser;
  if (!user) return alert('⚠️ Silakan login!');
  
  const collect = id => document.getElementById(id)?.value || '';
  const isChecked = id => document.getElementById(id)?.checked || false;
  
  const data = {
    guru: collect('kbc-guru'), nip: collect('kbc-nip'), sekolah: collect('kbc-sekolah'),
    tahun: collect('kbc-tahun'), jenjang: collect('kbc-jenjang'), kelas: collect('kbc-kelas'),
    mapel: collect('kbc-mapel'), topik: collect('kbc-topik'), alokasi: collect('kbc-alokasi'),
    kompetensiAwal: collect('kbc-kompetensi-awal'), sarana: collect('kbc-sarana'),
    targetPesertaDidik: collect('kbc-target'), modelPembelajaran: collect('kbc-model'),
    nilaiKBC: [1,2,3,4,5,6].map(i => ({ checked: isChecked(`kbc-nilai-${i}`), value: document.getElementById(`kbc-nilai-${i}`)?.value })),
    lkpd: collect('kbc-lkpd'), bahanBacaan: collect('kbc-bahan'),
    doa: collect('kbc-doa'), kisah: collect('kbc-kisah'),
    glosarium: collect('kbc-glosarium'), pustaka: collect('kbc-pustaka')
  };
  
  if (!data.sekolah || !data.jenjang || !data.kelas || !data.mapel || !data.topik) {
    return alert('⚠️ Lengkapi data wajib: Sekolah, Jenjang, Kelas, Mapel, Topik!');
  }
  
  const btn = document.getElementById('btn-generate-kbc');
  const resDiv = document.getElementById('modul-result-kbc');
  const resText = document.getElementById('result-modul-kbc');
  const orig = btn.innerHTML;
  
  btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menghubungi AI...';
  resDiv?.classList.remove('hidden');
  resText.value = '⏳ AI sedang menyusun modul KBC sesuai struktur ketat...';
  resDiv?.scrollIntoView({ behavior: 'smooth' });
  
  try {
    const prompt = buildPromptKBC(data);
    const result = await generateWithGroq({ prompt, temperature: 0.6, max_tokens: 2500 });
    
    // ✅ VALIDASI STRUKTUR KETAT
    if (!result || typeof result !== 'string') throw new Error('Response AI kosong');
    if (result.includes('❌ Error:')) throw new Error(result.replace('❌ Error: ',''));
    
    const headers = ['I. ', 'II. ', 'III. ', 'IV. ', 'V. ', 'VI. '];
    const missing = headers.filter(h => !result.includes(h));
    
    resText.value = result;
    
    if (missing.length > 0) {
      console.warn('⚠️ [Asisten KBC] AI melewatkan section:', missing);
      alert(`⚠️ AI tidak mengikuti urutan struktur secara penuh.\nBagian yang hilang: ${missing.join(', ')}\n\nOutput tetap ditampilkan. Anda bisa edit manual.`);
    } else {
      console.log('✅ [Asisten KBC] Struktur AI VALID (I-VI lengkap)');
    }
    
  } catch (err) {
    console.error('❌ [Asisten KBC] Generate failed:', err);
    resText.value = `❌ Gagal Generate:\n${err.message}\n\n💡 Pastikan API Key aktif & koneksi stabil. Coba lagi.`;
    alert(`❌ Gagal generate: ${err.message}`);
  } finally {
    btn.disabled = false; btn.innerHTML = orig;
  }
}

// ============================================
// ✅ SAVE & LOAD (1 COLLECTION + METADATA)
// ============================================

async function handleSaveKBC() {
  const user = auth.currentUser;
  if (!user) return alert('⚠️ Silakan login!');
  const txt = document.getElementById('result-modul-kbc')?.value;
  if (!txt || txt.includes('⏳') || txt.includes('❌')) return alert('⚠️ Generate dulu!');
  
  try {
    const uDoc = await getDoc(doc(db, 'users', user.uid));
    await addDoc(collection(db, 'modul_ajar'), {
      userId: user.uid, userEmail: user.email, userName: user.displayName || 'Guru',
      jenis_kurikulum: 'kbc', // ✅ METADATA PEMISAH
      guru: document.getElementById('kbc-guru')?.value, sekolah: document.getElementById('kbc-sekolah')?.value,
      jenjang: document.getElementById('kbc-jenjang')?.value, kelas: document.getElementById('kbc-kelas')?.value,
      mapel: document.getElementById('kbc-mapel')?.value, topik: document.getElementById('kbc-topik')?.value,
      modul: txt, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
      isAdmin: uDoc.exists() && uDoc.data()?.role === 'admin'
    });
    alert('✅ Modul KBC berhasil disimpan!');
    loadKBCData();
    document.getElementById('modul-result-kbc')?.classList.add('hidden');
  } catch (e) { alert('❌ Gagal simpan: ' + e.message); }
}

function loadKBCData() {
  const list = document.getElementById('modul-list-kbc');
  const count = document.getElementById('saved-count-kbc');
  if (!list) return;
  const user = auth.currentUser;
  if (!user) { list.innerHTML = '<p class="text-center py-6 text-gray-500">Silakan login</p>'; return; }
  
  (async () => {
    try {
      const uDoc = await getDoc(doc(db, 'users', user.uid));
      const isAdmin = uDoc.exists() && uDoc.data()?.role === 'admin';
      
      // ✅ FILTER BY KEBUTUHAN + ORDER
      const baseQ = query(collection(db, 'modul_ajar'), where('jenis_kurikulum', '==', 'kbc'));
      const q = isAdmin ? query(baseQ, orderBy('createdAt', 'desc')) : query(baseQ, where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
        
      onSnapshot(q, snap => {
        if (snap.empty) { list.innerHTML = '<p class="text-center py-6 text-gray-500">Belum ada modul KBC tersimpan</p>'; return; }
        if (count) count.textContent = snap.docs.length;
        list.innerHTML = snap.docs.map(d => {
          const v = d.data();
          const t = v.createdAt?.toDate?.()?.toLocaleString('id-ID') || '-';
          return `<div class="p-4 bg-white border border-emerald-200 rounded-lg shadow-sm mb-3"><div class="flex justify-between items-start"><strong class="text-emerald-800">${v.mapel?.toUpperCase()} - K${v.kelas}</strong><span class="text-xs text-gray-500">${t}</span></div><p class="text-sm text-gray-700 mt-1">🕌 ${v.topik || 'Modul KBC'}</p></div>`;
        }).join('');
      });
    } catch(e) { console.error('❌ [KBC] Load error:', e); }
  })();
}

console.log('🟢 [Asisten KBC] READY — Pure AI + Strict Schema + Metadata Ready');
