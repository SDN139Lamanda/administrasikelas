/**
 * MODULE: ADM. KELAS (Complete - All Features)
 * FIX: attendanceData sync + Print & Download Support
 */

console.log('🔴 [AdmKelas Module] Script START');

import { storage } from './storage.js';
import { escapeHtml } from './utils.js';
import { getMainTemplate, renderClassCard, renderStudentRow, renderAttendanceRow, renderRecapRow } from './adm-kelas-template.js';

// ✅ State management
let classes = [];
let activeClassIndex = null;

// ============================================
// ✅ GLOBAL FUNCTION: Render Module
// ============================================
window.renderAdmKelas = async function() {
  console.log('📦 [AdmKelas] renderAdmKelas() called');
  
  const container = document.getElementById('module-container');
  if (!container) return;
  
  // ✅ Wait for Firebase auth
  let authUser = null;
  try {
    const { auth, onAuthStateChanged } = await import('../firebase-config.js');
    
    if (auth.currentUser) {
      authUser = auth.currentUser;
      console.log('🔐 [AdmKelas] Auth ready (sync):', authUser.uid.substring(0, 10) + '...');
    } else {
      console.log('⏳ [AdmKelas] Waiting for auth state...');
      authUser = await new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          unsubscribe();
          resolve(user);
        });
        setTimeout(() => resolve(null), 3000);
      });
      console.log('🔐 [AdmKelas] Auth ready (async):', authUser?.uid?.substring(0, 10) + '...' || 'null');
    }
  } catch (e) {
    console.warn('⚠️ Auth not available');
  }
  
  // ✅ CRITICAL: Set userId BEFORE any storage operation
  storage.userId = authUser?.uid || null;
  console.log('🔧 [AdmKelas] storage.userId:', storage.userId?.substring(0, 10) + '...');
  
  // ✅ Load classes
  classes = await storage.loadClasses();
  console.log('✅ [AdmKelas] Classes loaded:', classes.length);
  
  container.innerHTML = getMainTemplate();
  container.classList.remove('hidden');
  
  // ✅ Hide dashboard sections
  document.querySelectorAll('.dashboard-hero, [aria-labelledby="rooms-heading"], #sd-section, #smp-section, #sma-section')
    .forEach(el => el?.closest('section')?.classList.add('hidden'));
  
  // ✅ Set default date
  const dateInput = document.getElementById('inputTgl');
  if (dateInput) dateInput.valueAsDate = new Date();
  
  // ✅ Initialize UI
  window.admKelas.renderClassesGrid();
  window.admKelas.populateClassSelects();
  window.admKelas.setupEventListeners();
  window.admKelas.showView('viewDaftarKelas');
  
  console.log('✅ [AdmKelas] Module rendered successfully');
};

// ============================================
// ✅ MAIN OBJECT: window.admKelas
// ============================================
window.admKelas = {
  
  // ✅ VIEW NAVIGATION
  showView: function(viewId) {
    console.log('👁️ [AdmKelas] showView:', viewId);
    document.querySelectorAll('.view-section').forEach(v => v.classList.add('hidden'));
    document.getElementById(viewId)?.classList.remove('hidden');
  },
  
  renderClassesGrid: function() {
    const grid = document.getElementById('gridKelas');
    if (!grid) return;
    
    if (classes.length === 0) {
      grid.innerHTML = `<div class="col-span-full text-center py-12 text-slate-400">
        <i class="fas fa-inbox text-4xl mb-4"></i><p>Belum ada kelas. Buat kelas baru!</p>
      </div>`;
      return;
    }
    
    grid.innerHTML = classes.map((k, i) => renderClassCard(k, i)).join('');
  },
  
  populateClassSelects: function() {
    ['selectKelasAbsen', 'selectKelasRekap'].forEach(id => {
      const select = document.getElementById(id);
      if (!select) return;
      
      select.innerHTML = '<option value="">-- Pilih Kelas --</option>';
      classes.forEach((k, i) => {
        select.innerHTML += `<option value="${k.id}">${escapeHtml(k.nama)}</option>`;
      });
    });
  },
  
  updateRealtimeCounter: function() {
    if (activeClassIndex === null) return;
    const count = classes[activeClassIndex]?.siswa?.length || 0;
    const el = document.getElementById('countRealtime');
    if (el) el.innerText = `${count} Murid Terdaftar`;
  },
  
  renderStudentTable: function() {
    const tbody = document.getElementById('tabelSiswa');
    if (!tbody || activeClassIndex === null) return;
    
    const siswa = classes[activeClassIndex].siswa;
    if (!siswa || siswa.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="px-4 py-8 text-center text-slate-400">Belum ada siswa</td></tr>`;
      return;
    }
    
    tbody.innerHTML = siswa.map((s, i) => renderStudentRow(s, i)).join('');
  },
  
  renderAttendanceTable: function() {
    const tbody = document.getElementById('tabelPresensi');
    if (!tbody) return;
    
    if (activeClassIndex === null || !classes[activeClassIndex]) {
      tbody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-red-500">Pilih kelas dulu!</td></tr>';
      return;
    }
    
    const siswa = classes[activeClassIndex].siswa;
    if (!siswa || siswa.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-gray-500">Belum ada siswa di kelas ini</td></tr>';
      return;
    }
    
    tbody.innerHTML = siswa.map((s, i) => renderAttendanceRow(s, i)).join('');
  },
  
  // ✅ FIX: attendanceData (bukan data) - CRITICAL FOR REKAP
  renderRecap: function() {
    if (activeClassIndex === null) return alert('Pilih kelas dulu!');
    
    const tipe = document.getElementById('tipeRekap').value;
    const tbody = document.getElementById('tabelRekap');
    const info = document.getElementById('infoPeriode');
    
    let filteredAbsen = [];
    let detailWaktu = '';
    
    if (tipe === 'hari') {
      const val = document.getElementById('fHari')?.value;
      filteredAbsen = classes[activeClassIndex].absen?.filter(a => a.tanggal === val) || [];
      detailWaktu = 'Harian: ' + (val || 'Hari ini');
    } else if (tipe === 'bulan') {
      const val = document.getElementById('fBulan')?.value;
      filteredAbsen = classes[activeClassIndex].absen?.filter(a => a.tanggal?.startsWith(val)) || [];
      detailWaktu = 'Bulanan: ' + (val || 'Bulan ini');
    } else {
      filteredAbsen = classes[activeClassIndex].absen || [];
      detailWaktu = 'Semester: Semua';
    }
    
    info.innerText = detailWaktu;
    tbody.innerHTML = '';
    
    const totalPertemuan = filteredAbsen.length;
    let tH=0, tI=0, tS=0, tA=0;
    
    classes[activeClassIndex].siswa.forEach(s => {
      let stats = { H:0, I:0, S:0, A:0, total:0 };
      
      filteredAbsen.forEach(log => {
        // ✅ CRITICAL FIX: attendanceData bukan data
        const record = log.attendanceData?.find(r => r.studentId === s.id || r.nama === s.nama);
        if (record) {
          if (record.status === 'H') stats.H++;
          else if (record.status === 'I') stats.I++;
          else if (record.status === 'S') stats.S++;
          else if (record.status === 'A') stats.A++;
        }
      });
      
      stats.total = stats.H + stats.I + stats.S + stats.A;
      tH += stats.H; tI += stats.I; tS += stats.S; tA += stats.A;
      
      tbody.innerHTML += renderRecapRow(s, stats, totalPertemuan || 1);
    });
    
    // Update stats cards
    document.getElementById('statH').innerText = tH;
    document.getElementById('statI').innerText = tI;
    document.getElementById('statS').innerText = tS;
    document.getElementById('statA').innerText = tA;
  },
  
  toggleFilterView: function() {
    const tipe = document.getElementById('tipeRekap').value;
    const container = document.getElementById('filterInputs');
    const today = new Date();
    
    if (tipe === 'hari') {
      container.innerHTML = `<input type="date" id="fHari" class="px-3 py-2 border rounded-lg text-sm" value="${today.toISOString().split('T')[0]}">`;
    } else if (tipe === 'bulan') {
      const ym = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}`;
      container.innerHTML = `<input type="month" id="fBulan" class="px-3 py-2 border rounded-lg text-sm" value="${ym}">`;
    } else {
      container.innerHTML = '';
    }
  },
  
  // ✅ NEW: PRINT REKAP
  printRecap: function() {
    const printContent = document.getElementById('tableToPDF').outerHTML;
    const kelasNama = document.getElementById('judulKelasSiswa')?.innerText || 'Rekap Absensi';
    const periode = document.getElementById('infoPeriode')?.innerText || '';
    
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(`
      <html><head><title>${kelasNama}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h2 { text-align: center; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
        th { background-color: #f3f4f6; }
        .info { margin-bottom: 20px; }
      </style>
      </head><body>
        <h2>${kelasNama} - Laporan Absensi</h2>
        <div class="info">${periode}</div>
        ${printContent}
        <p style="margin-top:30px;">Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  },
  
  // ✅ NEW: DOWNLOAD PDF (via Print-to-PDF)
  downloadPDF: function() {
    this.printRecap();
    alert('💡 Tips: Pada dialog print, pilih "Save as PDF" sebagai destination untuk download PDF.');
  },
  
  openClassModal: function() {
    document.getElementById('editClassIdx').value = '';
    document.getElementById('namaKelas').value = '';
    document.getElementById('modalKelas').classList.replace('hidden', 'flex');
  },
  
  openStudentModal: function() {
    document.getElementById('modalSiswa').classList.replace('hidden', 'flex');
  },
  
  closeModal: function(modalId) {
    document.getElementById(modalId)?.classList.replace('flex', 'hidden');
  },
  
  // ✅ CLASS CRUD
  saveClass: async function() {
    const nama = document.getElementById('namaKelas').value.trim();
    const editIdx = document.getElementById('editClassIdx').value;
    
    if (!nama) return alert('Nama kelas wajib diisi!');
    
    try {
      if (editIdx === '') {
        await storage.addClass({ nama });
      } else {
        const classId = classes[editIdx].id;
        await storage.updateClass(classId, { nama });
      }
      
      this.closeModal('modalKelas');
      classes = await storage.loadClasses();
      this.renderClassesGrid();
      this.populateClassSelects();
      alert('✅ Kelas berhasil disimpan!');
      
    } catch (e) {
      console.error('❌ [AdmKelas] saveClass error:', e.message);
      alert('❌ Gagal menyimpan: ' + e.message);
    }
  },
  
  editClass: function(index) {
    document.getElementById('editClassIdx').value = index;
    document.getElementById('namaKelas').value = classes[index].nama;
    this.openClassModal();
  },
  
  // ✅ DELETE CLASS
  deleteClass: async function(index) {
    if (!confirm('Hapus kelas ini beserta semua data siswa dan absensi?')) return;
    
    try {
      const classId = classes[index].id;
      console.log('🗑️ [AdmKelas] Deleting class:', classId);
      
      await storage.deleteClass(classId);
      
      classes = await storage.loadClasses();
      if (activeClassIndex === index) activeClassIndex = null;
      
      this.renderClassesGrid();
      this.populateClassSelects();
      alert('✅ Kelas berhasil dihapus!');
      
    } catch (e) {
      console.error('❌ [AdmKelas] deleteClass error:', e.message);
      alert('❌ Gagal menghapus: ' + e.message);
    }
  },
  
  openClassDetail: function(index) {
    activeClassIndex = index;
    document.getElementById('judulKelasSiswa').innerText = classes[index].nama;
    this.updateRealtimeCounter();
    this.renderStudentTable();
    this.showView('viewSiswa');
  },
  
  // ✅ STUDENT CRUD
  saveStudent: async function() {
    const nama = document.getElementById('namaSiswa').value.trim();
    const gender = document.getElementById('genderSiswa').value;
    
    if (!nama || activeClassIndex === null) return alert('Lengkapi data!');
    
    try {
      const classId = classes[activeClassIndex].id;
      await storage.addStudent(classId, { nama, gender });
      
      document.getElementById('namaSiswa').value = '';
      classes = await storage.loadClasses();
      this.updateRealtimeCounter();
      this.renderStudentTable();
      this.closeModal('modalSiswa');
      alert('✅ Siswa berhasil ditambahkan!');
      
    } catch (e) {
      console.error('❌ [AdmKelas] saveStudent error:', e.message);
      alert('❌ Gagal menambahkan: ' + e.message);
    }
  },
  
  deleteStudent: async function(studentIndex) {
    if (!confirm('Hapus siswa ini?')) return;
    
    try {
      const classId = classes[activeClassIndex].id;
      const studentId = classes[activeClassIndex].siswa[studentIndex].id;
      
      await storage.deleteStudent(classId, studentId);
      
      classes = await storage.loadClasses();
      this.updateRealtimeCounter();
      this.renderStudentTable();
      alert('✅ Siswa berhasil dihapus!');
      
    } catch (e) {
      console.error('❌ [AdmKelas] deleteStudent error:', e.message);
      alert('❌ Gagal menghapus: ' + e.message);
    }
  },
  
  // ✅ ATTENDANCE FUNCTIONS
  navigateToAttendance: async function() {
    classes = await storage.loadClasses();
    if (!classes || classes.length === 0) return alert('Buat kelas dulu!');
    
    this.populateClassSelects();
    
    if (activeClassIndex === null || activeClassIndex >= classes.length) {
      activeClassIndex = 0;
    }
    
    const selectEl = document.getElementById('selectKelasAbsen');
    if (selectEl && classes[activeClassIndex]) {
      selectEl.value = classes[activeClassIndex].id;
    }
    
    this.renderAttendanceTable();
    this.showView('viewPresensi');
  },
  
  navigateToRecap: async function() {
    classes = await storage.loadClasses();
    if (!classes || classes.length === 0) return alert('Belum ada data!');
    
    this.populateClassSelects();
    this.toggleFilterView();
    this.showView('viewRekap');
  },
  
  changeAttendanceClass: function(classId) {
    activeClassIndex = classes.findIndex(c => c.id === classId);
    this.renderAttendanceTable();
  },
  
  changeRecapClass: function(classId) {
    activeClassIndex = classes.findIndex(c => c.id === classId);
  },
  
  markAllPresent: function() {
    if (activeClassIndex === null) return;
    classes[activeClassIndex].siswa.forEach((_, i) => {
      const radio = document.getElementById(`H_${i}`);
      if (radio) radio.checked = true;
    });
  },
  
  saveAttendance: async function() {
    if (activeClassIndex === null) return alert('Pilih kelas!');
    
    const tanggal = document.getElementById('inputTgl').value;
    const siswa = classes[activeClassIndex].siswa;
    const attendanceData = [];
    
    siswa.forEach((s, i) => {
      const radio = document.querySelector(`input[name="abs_${i}"]:checked`);
      attendanceData.push({
        studentId: s.id,
        nama: s.nama,
        status: radio?.value || 'H'
      });
    });
    
    try {
      const classId = classes[activeClassIndex].id;
      await storage.saveAttendance(classId, tanggal, attendanceData);
      
      alert('✨ Absensi berhasil disimpan!');
      this.showView('viewDaftarKelas');
      
    } catch (e) {
      console.error('❌ [AdmKelas] saveAttendance error:', e.message);
      alert('❌ Gagal menyimpan: ' + e.message);
    }
  },
  
  deleteAllData: async function() {
    if (!confirm('⚠️ HAPUS SEMUA DATA?')) return;
    if (!confirm('Apakah Anda BENAR-BENAR yakin?')) return;
    
    try {
      for (const k of classes) {
        await storage.deleteClass(k.id);
      }
      classes = [];
      activeClassIndex = null;
      this.renderClassesGrid();
      this.populateClassSelects();
      alert('✅ Semua data dihapus!');
      window.location.reload();
    } catch (e) {
      console.error('❌ [AdmKelas] deleteAllData error:', e.message);
      alert('❌ Gagal: ' + e.message);
    }
  },
  
  backToDashboard: function() {
    const container = document.getElementById('module-container');
    if (container) {
      container.innerHTML = '';
      container.classList.add('hidden');
    }
    
    document.querySelectorAll('.dashboard-hero, [aria-labelledby="rooms-heading"]')
      .forEach(el => el?.closest('section')?.classList.remove('hidden'));
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
  
  setupEventListeners: function() {
    const dateInput = document.getElementById('inputTgl');
    if (dateInput) dateInput.valueAsDate = new Date();
    
    const tipeRekap = document.getElementById('tipeRekap');
    if (tipeRekap) {
      tipeRekap.addEventListener('change', () => this.toggleFilterView());
    }
  }
};

console.log('🟢 [AdmKelas] Module FINISHED - Complete Features + Print/Download');
