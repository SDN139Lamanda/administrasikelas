/**
 * ============================================
 * MODULE: ASISTEN MODUL AJAR
 * Platform Administrasi Kelas Digital
 * ✅ UPDATED: Full Groq API Integration + Signature Layout Fix
 * ============================================
 * FITUR:
 * - Auto-fill data user dari localStorage (modal)
 * - ✅ FULL GROQ API (No Mock) - Production Ready
 * - Editable fields (user bisa ubah auto-fill)
 * - Profil Pancasila included
 * - Clean result display (no scroll frame)
 * - Kop format sesuai standar modul ajar
 * - ✅ NEW: Field lengkap sesuai komposisi Kurikulum Merdeka
 * - ✅ NEW: Loading state + disable button
 * - ✅ NEW: Specific error handling
 * - ✅ NEW: Download/Print buttons
 * - ✅ NEW: Auto-save to Adm.Pembelajaran (non-blocking)
 * - ✅ NEW: Signature side-by-side layout
 * ============================================
 */

console.log('🔴 [Asisten Modul] Script START — Full Groq API Mode');

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

// ============================================
// ✅ API-READY WRAPPER — NOW USING GROQ API
// ============================================

/**
 * Generate modul dengan Groq API (Production Ready)
 */
async function generateModulWithAI(promptData) {
  console.log('🤖 [Asisten Modul] Generate called (Groq API Mode)');
  
  try {
    // ✅ Import Groq API function
    const { generateWithGroq } = await import('./groq-api.js');
    
    // ✅ Build prompt from form data
    const prompt = buildPromptForAI(promptData);
    
    // ✅ Call Groq API
    const result = await generateWithGroq({
      prompt: prompt,
      temperature: 0.7,
      max_tokens: 2000  // Increased for full modul output
    });
    
    console.log('✅ [Asisten Modul] Groq API response received');
    return result.content;
    
  } catch (error) {
    console.error('❌ [Asisten Modul] Groq API error:', error);
    
    // ✅ Fallback: Return helpful error message
    let errorMessage = 'Gagal generate modul. ';
    if (error.message?.includes('API key') || error.message?.includes('auth')) {
      errorMessage += 'API Key tidak valid atau belum terkonfigurasi.';
    } else if (error.message?.includes('quota') || error.message?.includes('429')) {
      errorMessage += 'Limit AI harian habis. Coba lagi nanti.';
    } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
      errorMessage += 'Koneksi internet bermasalah. Cek koneksi Anda.';
    } else {
      errorMessage += error.message || 'Silakan coba lagi.';
    }
    
    // ✅ Return formatted error for display
    return `❌ Error: ${errorMessage}\n\n💡 Tips:\n• Pastikan API Key sudah dikonfigurasi\n• Cek koneksi internet Anda\n• Coba lagi dalam beberapa menit jika limit habis`;
  }
}

/**
 * Build prompt untuk AI (optimized for Groq)
 */
function buildPromptForAI(data) {
  const pppChecked = data.profilPancasila?.filter(p => p.checked).map(p => p.value).join(', ') || '-';
  
  return `Anda adalah asisten guru profesional. Buat Modul Ajar Kurikulum Merdeka yang lengkap dan siap pakai.

SPESIFIKASI:
• Guru: ${data.guru || '-'} (${data.nip || 'N/A'})
• Sekolah: ${data.sekolah || '-'}, Tahun: ${data.tahun || '2025/2026'}
• Jenjang/Kelas: ${data.jenjang?.toUpperCase() || '-'}/Kelas ${data.kelas || '-'}
• Mapel: ${data.mapel?.toUpperCase() || '-'}, Topik: ${data.topik || '-'}
• Alokasi Waktu: ${data.alokasi || '-'}
• Kompetensi Awal: ${data.kompetensiAwal || 'Siswa telah memahami konsep dasar terkait topik ini.'}
• Sarana: ${data.sarana || 'Laptop, proyektor, alat peraga, lingkungan sekitar'}
• Target Peserta: ${data.targetPesertaDidik === 'reguler' ? 'Siswa Reguler' : data.targetPesertaDidik === 'kesulitan' ? 'Siswa dengan Kesulitan Belajar' : 'Siswa dengan Pencapaian Tinggi'}
• Model Pembelajaran: ${data.modelPembelajaran === 'pbl' ? 'Problem Based Learning (PBL)' : data.modelPembelajaran === 'pjbl' ? 'Project Based Learning (PjBL)' : data.modelPembelajaran === 'tatap-muka' ? 'Tatap Muka' : 'Lainnya'}

PROFIL PELAJAR PANCASILA: ${pppChecked}

LAMPIRAN YANG DIMINTA:
• LKPD: ${data.lkpd || 'Aktivitas eksplorasi, diskusi kelompok, presentasi hasil'}
• Bahan Bacaan: ${data.bahanBacaan || 'Rangkuman materi, contoh soal, referensi tambahan'}
• Glosarium: ${data.glosarium || 'Istilah penting dengan definisi'}
• Daftar Pustaka: ${data.daftarPustaka || 'Kementerian Pendidikan, sumber online terpercaya'}

INSTRUKSI OUTPUT:
1. Gunakan format teks plain dengan pemisah garis (===, ---)
2. Struktur: I. INFORMASI UMUM, II. PROFIL PELAJAR PANCASILA, III. KOMPONEN INTI, IV. LAMPIRAN
3. Komponen Inti harus mencakup: Tujuan Pembelajaran, Pemahaman Bermakna, Pertanyaan Pemantik, Kegiatan Pembelajaran (Pendahuluan-Inti-Penutup), Asesmen, Pengayaan/Remedial, Refleksi
4. Gunakan bahasa Indonesia formal yang mudah dipahami guru
5. Buat konten yang relevan dengan topik "${data.topik || 'materi'}" untuk kelas ${data.kelas || '-'} ${data.jenjang?.toUpperCase() || '-'}
6. Di bagian akhir, tambahkan tanda tangan side-by-side untuk Kepala Sekolah dan Guru

Output hanya berisi konten modul, tanpa penjelasan tambahan.
`.trim();
}

// ============================================
// ✅ MOCK GENERATOR (Fallback Only - For Testing)
// ============================================

async function mockGenerateModul(data) {
  console.log('📝 [Asisten Modul] Generating mock modul (fallback)...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const {
    guru, nip, sekolah, tahun, jenjang, kelas, mapel, topik, alokasi,
    kompetensiAwal, sarana, targetPesertaDidik, modelPembelajaran,
    profilPancasila,
    lkpd, bahanBacaan, glosarium, daftarPustaka,
    userKepsek, userNIPKepsek
  } = data;
  
  const jenjangCapital = jenjang?.toUpperCase() || '-';
  const mapelCapital = mapel?.toUpperCase() || '-';
  const pppList = profilPancasila?.filter(p => p.checked).map(p => p.value).join(', ') || '-';
  const targetLabel = {
    'reguler': 'Siswa Reguler',
    'kesulitan': 'Siswa dengan Kesulitan Belajar',
    'pencapaian-tinggi': 'Siswa dengan Pencapaian Tinggi'
  }[targetPesertaDidik] || 'Siswa Reguler';
  const modelLabel = {
    'pbl': 'Problem Based Learning (PBL)',
    'pjbl': 'Project Based Learning (PjBL)',
    'tatap-muka': 'Tatap Muka',
    'lainnya': 'Lainnya'
  }[modelPembelajaran] || 'Problem Based Learning (PBL)';
  
  // ✅ FIX: Signature side-by-side layout (monospace-friendly)
  const signatureBlock = `
═══════════════════════════════════════════════════════════
Mengetahui,

Kepala Sekolah                                  Guru Mata Pelajaran


( ${userKepsek || '.....................'.substring(0, 21)} )          ( ${guru || '.....................'.substring(0, 21)} )
NIP. ${userNIPKepsek || '.....................'.substring(0, 21)}          NIP. ${nip || '.....................'.substring(0, 21)}
═══════════════════════════════════════════════════════════
`.trim();
  
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

Kompetensi Awal    : ${kompetensiAwal || 'Siswa telah memahami konsep dasar terkait topik ini.'}
Sarana/Prasarana   : ${sarana || 'Laptop, proyektor, alat peraga, lingkungan sekitar'}
Target Peserta     : ${targetLabel}
Model Pembelajaran : ${modelLabel}

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

G. REFLEKSI
   • Peserta Didik: Apa yang paling menarik dari pembelajaran ini?
   • Guru: Apa yang perlu diperbaiki untuk pembelajaran berikutnya?

═══════════════════════════════════════════════════════════

IV. LAMPIRAN
───────────────────────────────────────────────────────────

📄 LEMBAR KERJA PESERTA DIDIK (LKPD)
${lkpd || '• Aktivitas 1: Eksplorasi konsep\n• Aktivitas 2: Diskusi kelompok\n• Aktivitas 3: Presentasi hasil'}

📚 BAHAN BACAAN GURU & PESERTA DIDIK
${bahanBacaan || '• Rangkuman materi\n• Contoh soal dan pembahasan\n• Referensi tambahan'}

📖 GLOSARIUM
${glosarium || '• Istilah 1: Definisi\n• Istilah 2: Definisi\n• Istilah 3: Definisi'}

📋 DAFTAR PUSTAKA
${daftarPustaka || '• Kementerian Pendidikan. (2022). Panduan Kurikulum Merdeka.\n• Sumber online terpercaya terkait topik.'}

${signatureBlock}
`.trim();
}

// ============================================
// ✅ UI RENDER FUNCTION
// ============================================

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
      .btn-generate, .btn-save, .btn-secondary, .btn-print, .btn-download { margin-top: 20px; padding: 14px 30px; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600; width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; }
      .btn-generate { background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); color: white; }
      .btn-generate:hover { background: linear-gradient(135deg, #6d28d9 0%, #5b21b6 100%); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(124,58,237,0.3); }
      .btn-save { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; }
      .btn-save:hover { background: linear-gradient(135deg, #059669 0%, #047857 100%); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(16,185,129,0.3); }
      .btn-print { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; }
      .btn-print:hover { background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(99,102,241,0.3); }
      .btn-download { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; }
      .btn-download:hover { background: linear-gradient(135deg, #d97706 0%, #b45309 100%); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(245,158,11,0.3); }
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
      
      /* ✅ SIGNATURE SIDE-BY-SIDE (for preview in textarea) */
      .signature-row { display: flex; justify-content: space-between; margin-top: 20px; }
      .signature-col { text-align: center; width: 45%; }
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
              <option value="paibd">paibd</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>
        </div>
        
        <div>
          <label for="modul-topik"><i class="fas fa-tag mr-2"></i>Topik/Materi</label>
          <input type="text" id="modul-topik" placeholder="Contoh: Pecahan Sederhana" required>
        </div>
        
        <!-- ✅ SECTION 4: INFORMASI UMUM (NEW - Sesuai Komposisi) -->
        <div class="section-title"><i class="fas fa-info-circle"></i><span>4. Informasi Umum (Lengkap)</span></div>
        
        <div>
          <label for="modul-kompetensi-awal"><i class="fas fa-brain mr-2"></i>Kompetensi Awal</label>
          <textarea id="modul-kompetensi-awal" placeholder="Pengetahuan/keterampilan yang perlu dimiliki siswa sebelum mempelajari topik ini..." rows="3"></textarea>
        </div>
        
        <div>
          <label for="modul-sarana"><i class="fas fa-tools mr-2"></i>Sarana dan Prasarana</label>
          <textarea id="modul-sarana" placeholder="Fasilitas dan media yang dibutuhkan (laptop, proyektor, alat peraga, lingkungan sekitar)..." rows="3"></textarea>
        </div>
        
        <div class="grid-cols-2">
          <div>
            <label for="modul-target"><i class="fas fa-bullseye mr-2"></i>Target Peserta Didik</label>
            <select id="modul-target">
              <option value="reguler">Siswa Reguler</option>
              <option value="kesulitan">Siswa dengan Kesulitan Belajar</option>
              <option value="pencapaian-tinggi">Siswa dengan Pencapaian Tinggi</option>
            </select>
          </div>
          <div>
            <label for="modul-model"><i class="fas fa-cogs mr-2"></i>Model Pembelajaran</label>
            <select id="modul-model">
              <option value="pbl">Problem Based Learning (PBL)</option>
              <option value="pjbl">Project Based Learning (PjBL)</option>
              <option value="tatap-muka">Tatap Muka</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>
        </div>
        
        <!-- ✅ SECTION 5: PROFIL PELAJAR PANCASILA (EXISTING) -->
        <div class="section-title"><i class="fas fa-star"></i><span>5. Profil Pelajar Pancasila</span></div>
        
        <div class="grid-cols-3">
          <div><label><input type="checkbox" id="ppp-1" value="Beriman, Bertakwa"> Beriman, Bertakwa</label></div>
          <div><label><input type="checkbox" id="ppp-2" value="Berkebinekaan Global"> Berkebinekaan Global</label></div>
          <div><label><input type="checkbox" id="ppp-3" value="Bergotong Royong"> Bergotong Royong</label></div>
          <div><label><input type="checkbox" id="ppp-4" value="Mandiri"> Mandiri</label></div>
          <div><label><input type="checkbox" id="ppp-5" value="Bernalar Kritis"> Bernalar Kritis</label></div>
          <div><label><input type="checkbox" id="ppp-6" value="Kreatif"> Kreatif</label></div>
        </div>
        
        <!-- ✅ SECTION 6: LAMPIRAN (NEW - Sesuai Komposisi) -->
        <div class="section-title"><i class="fas fa-paperclip"></i><span>6. Lampiran</span></div>
        
        <div>
          <label for="modul-lkpd"><i class="fas fa-file-alt mr-2"></i>Lembar Kerja Peserta Didik (LKPD)</label>
          <textarea id="modul-lkpd" placeholder="Deskripsi atau konten LKPD..." rows="3"></textarea>
        </div>
        
        <div>
          <label for="modul-bahan-bacaan"><i class="fas fa-book-reader mr-2"></i>Bahan Bacaan Guru & Peserta Didik</label>
          <textarea id="modul-bahan-bacaan" placeholder="Materi tambahan atau rangkuman teori..." rows="3"></textarea>
        </div>
        
        <div>
          <label for="modul-glosarium"><i class="fas fa-spell-check mr-2"></i>Glosarium</label>
          <textarea id="modul-glosarium" placeholder="Daftar istilah penting: Istilah - Definisi..." rows="3"></textarea>
        </div>
        
        <div>
          <label for="modul-pustaka"><i class="fas fa-list mr-2"></i>Daftar Pustaka</label>
          <textarea id="modul-pustaka" placeholder="Sumber referensi (buku, situs web, jurnal)..." rows="3"></textarea>
        </div>
        
        <button type="button" id="btn-generate" class="btn-generate">
          <i class="fas fa-magic"></i> Generate Modul Ajar
        </button>
      </form>
      
      <!-- ✅ HASIL GENERATE — TANPA BINGKAI SCROLL -->
      <div id="modul-result" class="hidden result-section">
        <h3 class="text-xl font-bold mb-4 text-gray-800">📋 Hasil Generate</h3>
        <textarea id="result-modul" placeholder="Modul akan muncul setelah generate..." style="min-height: 600px; width: 100%; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; font-family: monospace; font-size: 13px; line-height: 1.5; white-space: pre-wrap;" readonly></textarea>
        
        <div style="display: flex; gap: 12px; margin-top: 16px; flex-wrap: wrap;">
          <button type="button" id="btn-download" class="btn-download" style="flex: 1; min-width: 120px;">
            <i class="fas fa-download"></i> Download
          </button>
          <button type="button" id="btn-print" class="btn-print" style="flex: 1; min-width: 120px;">
            <i class="fas fa-print"></i> Print
          </button>
          <button type="button" id="btn-save" class="btn-save" style="flex: 2; min-width: 150px;">
            <i class="fas fa-save"></i> Simpan
          </button>
          <button type="button" id="btn-regenerate" class="btn-secondary" style="flex: 1; min-width: 120px;">
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

// ============================================
// ✅ HELPER FUNCTIONS
// ============================================

function hideDashboardSections() {
  document.querySelector('.dashboard-hero')?.closest('section')?.classList.add('hidden');
  document.querySelector('[aria-labelledby="rooms-heading"]')?.classList.add('hidden');
  document.querySelectorAll('#sd-section, #smp-section, #sma-section').forEach(s => s.classList.add('hidden'));
}

function setupEventHandlers() {
  const btnGenerate = document.getElementById('btn-generate');
  const btnSave = document.getElementById('btn-save');
  const btnRegenerate = document.getElementById('btn-regenerate');
  const btnPrint = document.getElementById('btn-print');
  const btnDownload = document.getElementById('btn-download');
  
  if (btnGenerate) btnGenerate.addEventListener('click', handleGenerate);
  if (btnSave) btnSave.addEventListener('click', handleSave);
  if (btnRegenerate) btnRegenerate.addEventListener('click', handleGenerate);
  if (btnPrint) btnPrint.addEventListener('click', handlePrint);
  if (btnDownload) btnDownload.addEventListener('click', handleDownload);
}

// ✅ Download function (seperti CTA Generator)
function handleDownload() {
  const modul = document.getElementById('result-modul')?.value;
  if (!modul || modul.includes('⏳') || modul.includes('❌ Error')) {
    alert('⚠️ Generate data dulu sebelum download!');
    return;
  }
  
  const topik = document.getElementById('modul-topik')?.value || 'modul';
  const kelas = document.getElementById('modul-kelas')?.value || '';
  const mapel = document.getElementById('modul-mapel')?.value || '';
  
  const blob = new Blob([modul], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ModulAjar_${mapel}_${kelas}_${topik.replace(/\s+/g, '_')}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  console.log('✅ [Asisten Modul] Download successful');
}

// ✅ Print function
function handlePrint() {
  const modul = document.getElementById('result-modul')?.value;
  if (!modul || modul.includes('⏳') || modul.includes('❌ Error')) {
    alert('⚠️ Generate data dulu sebelum print!');
    return;
  }
  window.print();
}

// ============================================
// ✅ MAIN GENERATE HANDLER (With Loading + Error Handling)
// ============================================

async function handleGenerate() {
  console.log('🪄 [Asisten Modul] Generate clicked');
  
  const user = auth.currentUser;
  if (!user) { alert('⚠️ Silakan login dulu!'); return; }
  
  // ✅ Ambil semua field dari form
  const data = {
    guru: document.getElementById('modul-guru')?.value,
    nip: document.getElementById('modul-nip')?.value,
    sekolah: document.getElementById('modul-sekolah')?.value,
    tahun: document.getElementById('modul-tahun')?.value,
    jenjang: document.getElementById('modul-jenjang')?.value,
    kelas: document.getElementById('modul-kelas')?.value,
    mapel: document.getElementById('modul-mapel')?.value,
    topik: document.getElementById('modul-topik')?.value,
    alokasi: document.getElementById('modul-alokasi')?.value,
    
    // ✅ NEW: Fields from komposisi - Informasi Umum
    kompetensiAwal: document.getElementById('modul-kompetensi-awal')?.value,
    sarana: document.getElementById('modul-sarana')?.value,
    targetPesertaDidik: document.getElementById('modul-target')?.value,
    modelPembelajaran: document.getElementById('modul-model')?.value,
    
    // ✅ Profil Pancasila
    profilPancasila: [
      { id: 'ppp-1', value: 'Beriman, Bertakwa' },
      { id: 'ppp-2', value: 'Berkebinekaan Global' },
      { id: 'ppp-3', value: 'Bergotong Royong' },
      { id: 'ppp-4', value: 'Mandiri' },
      { id: 'ppp-5', value: 'Bernalar Kritis' },
      { id: 'ppp-6', value: 'Kreatif' }
    ].map(p => ({ checked: document.getElementById(p.id)?.checked, value: p.value })),
    
    // ✅ NEW: Fields from komposisi - Lampiran
    lkpd: document.getElementById('modul-lkpd')?.value,
    bahanBacaan: document.getElementById('modul-bahan-bacaan')?.value,
    glosarium: document.getElementById('modul-glosarium')?.value,
    daftarPustaka: document.getElementById('modul-pustaka')?.value,
    
    // User data for signature
    userKepsek: localStorage.getItem('user_nama_kepsek') || '',
    userNIPKepsek: localStorage.getItem('user_nip_kepsek') || ''
  };
  
  // ✅ Validation
  if (!data.sekolah) { alert('⚠️ Nama Sekolah wajib diisi!'); return; }
  if (!data.jenjang || !data.kelas || !data.mapel || !data.topik) { alert('⚠️ Lengkapi Informasi Modul!'); return; }
  
  const btnGenerate = document.getElementById('btn-generate');
  const resultDiv = document.getElementById('modul-result');
  const resultTextarea = document.getElementById('result-modul');
  
  // ✅ Loading state: disable button + show spinner
  const originalBtnText = btnGenerate.innerHTML;
  btnGenerate.disabled = true;
  btnGenerate.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
  
  if (resultDiv) resultDiv.classList.remove('hidden');
  resultTextarea.value = '⏳ Sedang generate modul dengan AI...';
  resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
  
  try {
    // ✅ Call generator (Groq API now enabled)
    const result = await generateModulWithAI(data);
    
    // ✅ Check if result is error message
    if (result.includes('❌ Error:')) {
      resultTextarea.value = result;
      alert('⚠️ ' + result.replace('❌ Error: ', ''));
    } else {
      resultTextarea.value = result;
      console.log('✅ [Asisten Modul] Generate complete!');
    }
    
    // ✅ Auto-save to Adm.Pembelajaran (non-blocking, like CTA)
    try {
      const { storage } = await import('./adm-pembelajaran/storage.js');
      storage.setUserId(user.uid);
      
      const docData = {
        jenis: 'asisten-modul',
        jenjang: data.jenjang || '',
        kelas: data.kelas || '',
        mapel: data.mapel || '',
        judul: `${data.topik || 'Modul'} - Kelas ${data.kelas}`,
        konten: result,
        tags: ['modul', data.mapel?.toLowerCase()],
        source: 'asisten-modul',
        meta: { topik: data.topik, guru: data.guru, sekolah: data.sekolah }
      };
      
      await storage.autoSaveFromExternal('asisten-modul', docData);
      console.log('✅ [Asisten Modul] Auto-save to Adm.Pembelajaran successful');
    } catch (autoSaveError) {
      console.warn('⚠️ [Asisten Modul] Auto-save skipped:', autoSaveError.message);
      // Non-blocking: don't alert user
    }
    
  } catch (error) {
    console.error('❌ [Asisten Modul] Error:', error);
    
    resultTextarea.value = `❌ Error: ${error.message || 'Gagal generate modul'}`;
    alert('❌ Gagal generate modul:\n\n' + (error.message || 'Silakan coba lagi'));
    
  } finally {
    // ✅ Restore button state
    btnGenerate.disabled = false;
    btnGenerate.innerHTML = originalBtnText;
  }
}

// ============================================
// ✅ SAVE HANDLER
// ============================================

async function handleSave() {
  console.log('💾 [Asisten Modul] Save clicked');
  
  const user = auth.currentUser;
  if (!user) { alert('⚠️ Silakan login dulu!'); return; }
  
  const modul = document.getElementById('result-modul')?.value;
  if (!modul || modul.includes('⏳') || modul.includes('❌ Error')) {
    alert('⚠️ Generate data dulu sebelum menyimpan!');
    return;
  }
  
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const isAdmin = userDoc.exists() && userDoc.data()?.role === 'admin';
    
    // ✅ Save ALL fields to Firestore
    await addDoc(collection(db, 'modul_ajar'), {
      // Existing fields
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
      
      // ✅ NEW: Fields from komposisi - Informasi Umum
      kompetensiAwal: document.getElementById('modul-kompetensi-awal')?.value || '',
      sarana: document.getElementById('modul-sarana')?.value || '',
      targetPesertaDidik: document.getElementById('modul-target')?.value || 'reguler',
      modelPembelajaran: document.getElementById('modul-model')?.value || 'pbl',
      
      // ✅ NEW: Fields from komposisi - Lampiran
      lkpd: document.getElementById('modul-lkpd')?.value || '',
      bahanBacaan: document.getElementById('modul-bahan-bacaan')?.value || '',
      glosarium: document.getElementById('modul-glosarium')?.value || '',
      daftarPustaka: document.getElementById('modul-pustaka')?.value || '',
      
      // Content & metadata
      modul: modul,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isAdmin: isAdmin
    });
    
    console.log('✅ [Asisten Modul] Data saved!');
    alert('✅ Modul Ajar berhasil disimpan!');
    loadModulData();
    document.getElementById('modul-result').classList.add('hidden');
  } catch (error) {
    console.error('❌ [Asisten Modul] Save error:', error);
    
    let errorMessage = error.message;
    if (error.message.includes('permission') || error.message.includes('security')) {
      errorMessage = 'Anda tidak memiliki akses untuk menyimpan. Hubungi admin.';
    } else if (error.message.includes('network')) {
      errorMessage = 'Koneksi internet bermasalah. Cek koneksi Anda.';
    }
    
    alert('❌ Gagal simpan: ' + errorMessage);
  }
}

// ============================================
// ✅ LOAD DATA HANDLER
// ============================================

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

console.log('🟢 [Asisten Modul] READY — Full Groq API + Signature Fix Applied');
