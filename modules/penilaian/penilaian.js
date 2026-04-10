/**
 * ============================================
 * MODULE: PENILAIAN & RAPOR (Kurikulum Merdeka)
 * Platform Administrasi Kelas Digital
 * ============================================
 */
console.log('🔴 [Penilaian] Module START');

// ✅ CHANGE 1/2: Added updateDoc to import
import { db, auth, collection, addDoc, query, where, orderBy, onSnapshot, doc, getDoc, getDocs, serverTimestamp, updateDoc } from '../firebase-config.js';

// Global state
let currentSiswa = null;
let currentSemester = '1';
let nilaiData = {};

// ✅ Render main Penilaian/Rapor UI
window.renderPenilaian = async function() {
  console.log('📝 [Penilaian] renderPenilaian() called');
  const container = document.getElementById('penilaian-container');
  if (!container) { console.error('❌ Penilaian container not found!'); return; }
  
  const user = auth.currentUser;
  if (!user) { alert('⚠️ Silakan login dulu!'); return; }
  
  // Hide other sections
  document.querySelectorAll('#sd-section, #smp-section, #sma-section, #module-container, #refleksi-container').forEach(s => s.classList.add('hidden'));
  container.classList.remove('hidden');
  
  // Load user data
  let userData = {};
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) userData = userDoc.data();
  } catch (e) { console.error('❌ [Penilaian] Load user error:', e); }
  
  // Load students from classes collection (using existing collection)
  const students = await loadStudents(userData);
  
  // Render UI
  container.innerHTML = renderPenilaianUI(userData, students);
  
  // Setup event handlers
  setupPenilaianHandlers(userData, students);
  
  console.log('✅ [Penilaian] UI rendered');
};

// ✅ Load students from classes collection (FIXED: adm_kelas → classes)
async function loadStudents(userData) {
  const { jenjang_sekolah, kelas_diampu } = userData;
  if (!jenjang_sekolah || !kelas_diampu?.length) return [];
  
  try {
    // ✅ CHANGE 2/2: Changed 'adm_kelas' to 'classes'
    const q = query(
      collection(db, 'classes'),  // ← Changed from 'adm_kelas' to 'classes'
      where('jenjang', '==', jenjang_sekolah),
      where('kelas', 'in', kelas_diampu)
    );
    const snapshot = await getDocs(q);
    const students = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (data.siswa?.length) {
        data.siswa.forEach(s => {
          students.push({
            id: docSnap.id,
            nama: s.nama,
            nis: s.nis,
            kelas: data.kelas,
            jenjang: data.jenjang,
            absensi: s.absensi || {}
          });
        });
      }
    });
    console.log(`✅ [Penilaian] Loaded ${students.length} students`);
    return students;
  } catch (e) {
    console.error('❌ [Penilaian] Load students error:', e);
    return [];
  }
}

// ✅ Render Penilaian UI (Kurikulum Merdeka Format)
function renderPenilaianUI(userData, students) {
  const { nama_sekolah, nama_lengkap, jenjang_sekolah } = userData;
  
  return `
    <style>
      .penilaian-card { background: white; border-radius: 12px; padding: 24px; max-width: 1000px; margin: auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
      .penilaian-header { text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #e5e7eb; }
      .penilaian-header h2 { color: #0891b2; font-size: 24px; font-weight: 700; }
      .penilaian-header p { color: #6b7280; margin-top: 4px; }
      .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px; }
      .form-group label { display: block; font-weight: 600; color: #374151; margin-bottom: 8px; font-size: 14px; }
      .form-group select, .form-group input { width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; }
      .form-group select:focus, .form-group input:focus { outline: none; border-color: #0891b2; }
      .nilai-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
      .nilai-table th, .nilai-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
      .nilai-table th { background: #f9fafb; font-weight: 600; color: #374151; }
      .nilai-table input[type="number"] { width: 80px; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; text-align: center; }
      .btn-group { display: flex; gap: 12px; margin-top: 24px; flex-wrap: wrap; }
      .btn-penilaian { padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; display: flex; align-items: center; gap: 8px; }
      .btn-primary { background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); color: white; }
      .btn-success { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; }
      .btn-warning { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; }
      .btn-secondary { background: #6b7280; color: white; }
      .btn-penilaian:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
      .rapor-preview { margin-top: 32px; padding: 24px; background: #f9fafb; border-radius: 12px; display: none; }
      .rapor-preview.active { display: block; }
      .rapor-content { background: white; padding: 32px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); font-family: 'Times New Roman', serif; line-height: 1.6; }
      .rapor-header { text-align: center; border-bottom: 3px double #000; padding-bottom: 16px; margin-bottom: 24px; }
      .rapor-header h1 { font-size: 18px; font-weight: bold; margin: 0; }
      .rapor-header p { margin: 4px 0; font-size: 14px; }
      .rapor-section { margin-bottom: 24px; }
      .rapor-section h3 { font-size: 16px; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 8px; margin-bottom: 12px; }
      .rapor-table { width: 100%; border-collapse: collapse; font-size: 13px; }
      .rapor-table th, .rapor-table td { border: 1px solid #000; padding: 8px; text-align: left; }
      .rapor-table th { background: #f3f4f6; }
      .no-students { text-align: center; padding: 40px; color: #6b7280; }
      @media print {
        .btn-group, .form-grid, .penilaian-header { display: none !important; }
        .rapor-preview { display: block !important; }
        .rapor-content { box-shadow: none; padding: 0; }
        body { background: white; }
      }
    </style>
    
    <div class="penilaian-card">
      <div class="penilaian-header">
        <h2><i class="fas fa-chart-bar mr-2"></i>Penilaian & Rapor</h2>
        <p>${nama_sekolah || 'Nama Sekolah'} • ${nama_lengkap || 'Guru'}</p>
      </div>
      
      <!-- Form Input -->
      <div class="form-grid">
        <div class="form-group">
          <label><i class="fas fa-user mr-2"></i>Pilih Siswa</label>
          <select id="siswa-select">
            <option value="">-- Pilih Siswa --</option>
            ${students.map(s => `<option value="${s.nis}" data-nama="${s.nama}" data-kelas="${s.kelas}">${s.nama} - Kelas ${s.kelas}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label><i class="fas fa-calendar mr-2"></i>Semester</label>
          <select id="semester-select">
            <option value="1" ${currentSemester === '1' ? 'selected' : ''}>1 (Ganjil)</option>
            <option value="2" ${currentSemester === '2' ? 'selected' : ''}>2 (Genap)</option>
          </select>
        </div>
      </div>
      
      <!-- Input Nilai -->
      <div id="nilai-form" style="display: none;">
        <h3 class="text-lg font-bold mb-4 text-gray-800">Input Nilai - Kurikulum Merdeka</h3>
        
        <table class="nilai-table">
          <thead>
            <tr>
              <th>Komponen</th>
              <th>Nilai (0-100)</th>
              <th>Predikat</th>
              <th>Deskripsi</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Pengetahuan (KI-3)</td>
              <td><input type="number" id="nilai-pengetahuan" min="0" max="100" placeholder="0-100"></td>
              <td><span id="predikat-pengetahuan">-</span></td>
              <td><input type="text" id="deskripsi-pengetahuan" placeholder="Deskripsi capaian..." class="w-full"></td>
            </tr>
            <tr>
              <td>Keterampilan (KI-4)</td>
              <td><input type="number" id="nilai-keterampilan" min="0" max="100" placeholder="0-100"></td>
              <td><span id="predikat-keterampilan">-</span></td>
              <td><input type="text" id="deskripsi-keterampilan" placeholder="Deskripsi capaian..." class="w-full"></td>
            </tr>
            <tr>
              <td>Sikap Spiritual</td>
              <td><input type="number" id="nilai-spiritual" min="0" max="100" placeholder="0-100"></td>
              <td><span id="predikat-spiritual">-</span></td>
              <td><input type="text" id="deskripsi-spiritual" placeholder="Deskripsi sikap..." class="w-full"></td>
            </tr>
            <tr>
              <td>Sikap Sosial</td>
              <td><input type="number" id="nilai-sosial" min="0" max="100" placeholder="0-100"></td>
              <td><span id="predikat-sosial">-</span></td>
              <td><input type="text" id="deskripsi-sosial" placeholder="Deskripsi sikap..." class="w-full"></td>
            </tr>
          </tbody>
        </table>
        
        <div class="form-group" style="margin-top: 16px;">
          <label><i class="fas fa-sticky-note mr-2"></i>Catatan Wali Kelas</label>
          <textarea id="catatan-wali" rows="3" class="w-full p-3 border rounded-lg" placeholder="Catatan untuk orang tua..."></textarea>
        </div>
        
        <div class="form-group" style="margin-top: 16px;">
          <label><i class="fas fa-list mr-2"></i>Kehadiran (Hari)</label>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
            <div><label class="text-xs text-gray-600">Sakit</label><input type="number" id="absen-sakit" min="0" value="0" class="w-full p-2 border rounded"></div>
            <div><label class="text-xs text-gray-600">Izin</label><input type="number" id="absen-izin" min="0" value="0" class="w-full p-2 border rounded"></div>
            <div><label class="text-xs text-gray-600">Tanpa Keterangan</label><input type="number" id="absen-tk" min="0" value="0" class="w-full p-2 border rounded"></div>
          </div>
        </div>
      </div>
      
      <!-- Buttons -->
      <div class="btn-group">
        <button id="btn-preview" class="btn-penilaian btn-primary"><i class="fas fa-eye"></i> Preview Rapor</button>
        <button id="btn-save" class="btn-penilaian btn-success"><i class="fas fa-save"></i> Simpan</button>
        <button id="btn-pdf" class="btn-penilaian btn-warning"><i class="fas fa-file-pdf"></i> Download PDF</button>
        <button id="btn-word" class="btn-penilaian btn-warning"><i class="fas fa-file-word"></i> Download Word</button>
        <button id="btn-print" class="btn-penilaian btn-secondary"><i class="fas fa-print"></i> Print</button>
        <button id="btn-back" class="btn-penilaian btn-secondary"><i class="fas fa-arrow-left"></i> Kembali</button>
      </div>
      
      <!-- Rapor Preview -->
      <div id="rapor-preview" class="rapor-preview">
        <div id="rapor-content" class="rapor-content"></div>
      </div>
    </div>
  `;
}

// ✅ Setup event handlers
function setupPenilaianHandlers(userData, students) {
  const siswaSelect = document.getElementById('siswa-select');
  const semesterSelect = document.getElementById('semester-select');
  const nilaiForm = document.getElementById('nilai-form');
  const btnPreview = document.getElementById('btn-preview');
  const btnSave = document.getElementById('btn-save');
  const btnPdf = document.getElementById('btn-pdf');
  const btnWord = document.getElementById('btn-word');
  const btnPrint = document.getElementById('btn-print');
  const btnBack = document.getElementById('btn-back');
  
  // Auto-calculate predikat when nilai changes
  ['pengetahuan', 'keterampilan', 'spiritual', 'sosial'].forEach(komponen => {
    const input = document.getElementById(`nilai-${komponen}`);
    const predikat = document.getElementById(`predikat-${komponen}`);
    if (input && predikat) {
      input.addEventListener('input', () => {
        const nilai = parseInt(input.value) || 0;
        predikat.textContent = calculatePredikat(nilai);
      });
    }
  });
  
  // Siswa select change
  if (siswaSelect) {
    siswaSelect.addEventListener('change', () => {
      const selected = siswaSelect.options[siswaSelect.selectedIndex];
      if (selected.value) {
        currentSiswa = {
          nis: selected.value,
          nama: selected.dataset.nama,
          kelas: selected.dataset.kelas
        };
        nilaiForm.style.display = 'block';
        loadExistingNilai(currentSiswa.nis, semesterSelect.value);
      } else {
        currentSiswa = null;
        nilaiForm.style.display = 'none';
      }
    });
  }
  
  // Semester change
  if (semesterSelect) {
    semesterSelect.addEventListener('change', () => {
      currentSemester = semesterSelect.value;
      if (currentSiswa) loadExistingNilai(currentSiswa.nis, currentSemester);
    });
  }
  
  // Preview button
  if (btnPreview) {
    btnPreview.addEventListener('click', () => {
      if (!currentSiswa) { alert('⚠️ Pilih siswa dulu!'); return; }
      const raporContent = generateRaporPreview(userData, currentSiswa, currentSemester);
      document.getElementById('rapor-content').innerHTML = raporContent;
      document.getElementById('rapor-preview').classList.add('active');
      document.getElementById('rapor-preview').scrollIntoView({ behavior: 'smooth' });
    });
  }
  
  // Save button
  if (btnSave) {
    btnSave.addEventListener('click', async () => {
      if (!currentSiswa) { alert('⚠️ Pilih siswa dulu!'); return; }
      await saveNilai(userData, currentSiswa, currentSemester);
    });
  }
  
  // Download PDF
  if (btnPdf) {
    btnPdf.addEventListener('click', () => {
      if (!currentSiswa) { alert('⚠️ Pilih siswa dulu!'); return; }
      exportToPDF(userData, currentSiswa, currentSemester);
    });
  }
  
  // Download Word
  if (btnWord) {
    btnWord.addEventListener('click', () => {
      if (!currentSiswa) { alert('⚠️ Pilih siswa dulu!'); return; }
      exportToWord(userData, currentSiswa, currentSemester);
    });
  }
  
  // Print
  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      if (!currentSiswa) { alert('⚠️ Pilih siswa dulu!'); return; }
      const raporContent = generateRaporPreview(userData, currentSiswa, currentSemester);
      document.getElementById('rapor-content').innerHTML = raporContent;
      document.getElementById('rapor-preview').classList.add('active');
      setTimeout(() => window.print(), 100);
    });
  }
  
  // Back button
  if (btnBack) {
    btnBack.addEventListener('click', () => {
      document.getElementById('penilaian-container').classList.add('hidden');
      // Show dashboard again (simple approach)
      window.location.href = 'dashboard.html';
    });
  }
}

// ✅ Calculate predikat from nilai
function calculatePredikat(nilai) {
  if (nilai >= 90) return 'A (Sangat Baik)';
  if (nilai >= 80) return 'B (Baik)';
  if (nilai >= 70) return 'C (Cukup)';
  if (nilai >= 60) return 'D (Kurang)';
  return 'E (Sangat Kurang)';
}

// ✅ Load existing nilai from Firestore
async function loadExistingNilai(nis, semester) {
  try {
    const q = query(
      collection(db, 'rapor'),
      where('nis', '==', nis),
      where('semester', '==', semester)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const data = snapshot.docs[0].data();
      // Populate form
      document.getElementById('nilai-pengetahuan').value = data.nilai_pengetahuan || '';
      document.getElementById('nilai-keterampilan').value = data.nilai_keterampilan || '';
      document.getElementById('nilai-spiritual').value = data.nilai_spiritual || '';
      document.getElementById('nilai-sosial').value = data.nilai_sosial || '';
      document.getElementById('deskripsi-pengetahuan').value = data.deskripsi_pengetahuan || '';
      document.getElementById('deskripsi-keterampilan').value = data.deskripsi_keterampilan || '';
      document.getElementById('deskripsi-spiritual').value = data.deskripsi_spiritual || '';
      document.getElementById('deskripsi-sosial').value = data.deskripsi_sosial || '';
      document.getElementById('catatan-wali').value = data.catatan_wali || '';
      document.getElementById('absen-sakit').value = data.absen_sakit || 0;
      document.getElementById('absen-izin').value = data.absen_izin || 0;
      document.getElementById('absen-tk').value = data.absen_tk || 0;
      // Update predikat display
      ['pengetahuan', 'keterampilan', 'spiritual', 'sosial'].forEach(k => {
        const val = document.getElementById(`nilai-${k}`).value;
        const pred = document.getElementById(`predikat-${k}`);
        if (val && pred) pred.textContent = calculatePredikat(parseInt(val));
      });
      console.log('✅ [Penilaian] Existing nilai loaded');
    }
  } catch (e) {
    console.error('❌ [Penilaian] Load existing nilai error:', e);
  }
}

// ✅ Save nilai to Firestore
async function saveNilai(userData, siswa, semester) {
  const user = auth.currentUser;
  if (!user) return;
  
  const data = {
    userId: user.uid,
    userName: userData.nama_lengkap || 'Guru',
    sekolah: userData.nama_sekolah || '',
    jenjang: userData.jenjang_sekolah,
    nis: siswa.nis,
    namaSiswa: siswa.nama,
    kelas: siswa.kelas,
    semester: semester,
    nilai_pengetahuan: parseInt(document.getElementById('nilai-pengetahuan').value) || 0,
    nilai_keterampilan: parseInt(document.getElementById('nilai-keterampilan').value) || 0,
    nilai_spiritual: parseInt(document.getElementById('nilai-spiritual').value) || 0,
    nilai_sosial: parseInt(document.getElementById('nilai-sosial').value) || 0,
    deskripsi_pengetahuan: document.getElementById('deskripsi-pengetahuan').value || '',
    deskripsi_keterampilan: document.getElementById('deskripsi-keterampilan').value || '',
    deskripsi_spiritual: document.getElementById('deskripsi-spiritual').value || '',
    deskripsi_sosial: document.getElementById('deskripsi-sosial').value || '',
    catatan_wali: document.getElementById('catatan-wali').value || '',
    absen_sakit: parseInt(document.getElementById('absen-sakit').value) || 0,
    absen_izin: parseInt(document.getElementById('absen-izin').value) || 0,
    absen_tk: parseInt(document.getElementById('absen-tk').value) || 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  try {
    // Check if exists
    const q = query(collection(db, 'rapor'), where('nis', '==', siswa.nis), where('semester', '==', semester));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      // Update existing
      await updateDoc(doc(db, 'rapor', snapshot.docs[0].id), data);
      console.log('✅ [Penilaian] Nilai updated');
    } else {
      // Create new
      await addDoc(collection(db, 'rapor'), data);
      console.log('✅ [Penilaian] Nilai saved');
    }
    alert('✅ Berhasil disimpan!');
  } catch (e) {
    console.error('❌ [Penilaian] Save error:', e);
    alert('❌ Gagal simpan: ' + e.message);
  }
}

// ✅ Generate Rapor Preview HTML
function generateRaporPreview(userData, siswa, semester) {
  const { nama_sekolah, nama_lengkap, jenjang_sekolah } = userData;
  const labelJenjang = {sd:'SD', smp:'SMP', sma:'SMA'}[jenjang_sekolah] || jenjang_sekolah.toUpperCase();
  const labelSemester = semester === '1' ? 'Ganjil' : 'Genap';
  
  const nilai = {
    pengetahuan: parseInt(document.getElementById('nilai-pengetahuan').value) || 0,
    keterampilan: parseInt(document.getElementById('nilai-keterampilan').value) || 0,
    spiritual: parseInt(document.getElementById('nilai-spiritual').value) || 0,
    sosial: parseInt(document.getElementById('nilai-sosial').value) || 0
  };
  
  const deskripsi = {
    pengetahuan: document.getElementById('deskripsi-pengetahuan').value || '-',
    keterampilan: document.getElementById('deskripsi-keterampilan').value || '-',
    spiritual: document.getElementById('deskripsi-spiritual').value || '-',
    sosial: document.getElementById('deskripsi-sosial').value || '-'
  };
  
  const absen = {
    sakit: document.getElementById('absen-sakit').value || 0,
    izin: document.getElementById('absen-izin').value || 0,
    tk: document.getElementById('absen-tk').value || 0
  };
  
  const catatan = document.getElementById('catatan-wali').value || '-';
  
  return `
    <div class="rapor-header">
      <h1>RAPOR HASIL BELAJAR PESERTA DIDIK</h1>
      <p>KURIKULUM MERDEKA</p>
      <p style="margin-top: 8px;"><strong>${nama_sekolah || 'Nama Sekolah'}</strong></p>
      <p>${labelJenjang} • Kelas ${siswa.kelas} • Semester ${labelSemester}</p>
    </div>
    
    <div class="rapor-section">
      <h3>IDENTITAS PESERTA DIDIK</h3>
      <table class="rapor-table">
        <tr><td width="150">Nama Peserta Didik</td><td>: ${siswa.nama}</td></tr>
        <tr><td>NIS</td><td>: ${siswa.nis}</td></tr>
        <tr><td>Kelas</td><td>: ${siswa.kelas}</td></tr>
        <tr><td>Semester</td><td>: ${labelSemester}</td></tr>
        <tr><td>Tahun Ajaran</td><td>: 2025/2026</td></tr>
      </table>
    </div>
    
    <div class="rapor-section">
      <h3>HASIL BELAJAR</h3>
      <table class="rapor-table">
        <thead>
          <tr>
            <th width="30%">Komponen</th>
            <th width="15%">Nilai</th>
            <th width="25%">Predikat</th>
            <th>Deskripsi</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Pengetahuan (KI-3)</td><td>${nilai.pengetahuan}</td><td>${calculatePredikat(nilai.pengetahuan)}</td><td>${deskripsi.pengetahuan}</td></tr>
          <tr><td>Keterampilan (KI-4)</td><td>${nilai.keterampilan}</td><td>${calculatePredikat(nilai.keterampilan)}</td><td>${deskripsi.keterampilan}</td></tr>
          <tr><td>Sikap Spiritual</td><td>${nilai.spiritual}</td><td>${calculatePredikat(nilai.spiritual)}</td><td>${deskripsi.spiritual}</td></tr>
          <tr><td>Sikap Sosial</td><td>${nilai.sosial}</td><td>${calculatePredikat(nilai.sosial)}</td><td>${deskripsi.sosial}</td></tr>
        </tbody>
      </table>
    </div>
    
    <div class="rapor-section">
      <h3>KEHADIRAN</h3>
      <table class="rapor-table">
        <tr><td width="150">Sakit</td><td>: ${absen.sakit} hari</td></tr>
        <tr><td>Izin</td><td>: ${absen.izin} hari</td></tr>
        <tr><td>Tanpa Keterangan</td><td>: ${absen.tk} hari</td></tr>
      </table>
    </div>
    
    <div class="rapor-section">
      <h3>CATATAN WALI KELAS</h3>
      <p style="margin-top: 8px; min-height: 60px;">${catatan}</p>
    </div>
    
    <div style="margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
      <div style="text-align: center;">
        <p>Mengetahui,</p>
        <p style="margin-top: 40px;"><strong>Orang Tua/Wali</strong></p>
      </div>
      <div style="text-align: center;">
        <p>${userData.nama_sekolah?.split(',')[0] || 'Kota'}, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <p style="margin-top: 40px;"><strong>${nama_lengkap || 'Nama Guru'}</strong><br>Guru Kelas</p>
      </div>
    </div>
    
    <p style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
      Dokumen ini dibuat dengan Platform Administrasi Kelas Digital © 2026
    </p>
  `;
}

// ✅ Export to PDF (using jsPDF via CDN)
function exportToPDF(userData, siswa, semester) {
  // Load jsPDF dynamically
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
  script.onload = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const raporContent = generateRaporPreview(userData, siswa, semester);
    // Simple text-based PDF (for demo)
    doc.setFontSize(14);
    doc.text('RAPOR HASIL BELAJAR', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Nama: ${siswa.nama}`, 20, 40);
    doc.text(`Kelas: ${siswa.kelas}`, 20, 50);
    doc.text(`Semester: ${semester === '1' ? 'Ganjil' : 'Genap'}`, 20, 60);
    // Add more content as needed...
    
    doc.save(`Rapor_${siswa.nama.replace(/\s+/g, '_')}_Kelas${siswa.kelas}.pdf`);
  };
  document.head.appendChild(script);
}

// ✅ Export to Word
function exportToWord(userData, siswa, semester) {
  const raporContent = generateRaporPreview(userData, siswa, semester);
  const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Rapor</title></head><body>`;
  const footer = '</body></html>';
  const sourceHTML = header + raporContent + footer;
  
  const blob = new Blob(['\ufeff', sourceHTML], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Rapor_${siswa.nama.replace(/\s+/g, '_')}_Kelas${siswa.kelas}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

console.log('🟢 [Penilaian] Module READY');
