/**
 * ============================================
 * MODULE: ADM. KELAS (Attendance Management)
 * Platform Administrasi Kelas Digital
 * ============================================
 */

console.log('🔴 [AdmKelas Module] Script START');

// ✅ Import dependencies
import { storage } from './storage.js';
import { escapeHtml, generateId, formatDate, parseGender, calculatePercentage, getStatusColor } from './utils.js';
import { getMainTemplate, renderClassCard, renderStudentRow, renderAttendanceRow, renderRecapRow } from './adm-kelas-template.js';

// ✅ State management
let classes = [];
let activeClassIndex = null;
let currentUser = null;

// ============================================
// ✅ GLOBAL FUNCTION: Render Module to Container
// ============================================
window.renderAdmKelas = async function() {
  console.log('📦 [AdmKelas] renderAdmKelas() called');
  
  const container = document.getElementById('module-container');
  if (!container) {
    console.error('❌ Container #module-container not found');
    return;
  }
  
  try {
    const { auth } = await import('../firebase-config.js');
    currentUser = auth.currentUser;
  } catch (e) {
    console.log('⚠️ Auth not available, using LocalStorage mode');
  }
  
  storage.userId = currentUser?.uid || null;
  classes = await storage.loadClasses();
  console.log('✅ [AdmKelas] Classes loaded:', classes.length);
  
  container.innerHTML = getMainTemplate();
  container.classList.remove('hidden');
  
  const dateInput = document.getElementById('inputTgl');
  if (dateInput) dateInput.valueAsDate = new Date();
  
  // ✅ CALL methods from window.admKelas object
  window.admKelas.renderClassesGrid();
  window.admKelas.populateClassSelects();
  window.admKelas.setupEventListeners();
  
  console.log('✅ [AdmKelas] Module rendered successfully');
};

// ============================================
// ✅ MAIN OBJECT: window.admKelas (SEMUA FUNGSI DI SINI!)
// ============================================
window.admKelas = {
  
  // ✅ RENDER FUNCTIONS
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
    const selects = ['selectKelasAbsen', 'selectKelasRekap'];
    selects.forEach(id => {
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
    if (siswa.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="px-4 py-8 text-center text-slate-400">Belum ada siswa</td></tr>`;
      return;
    }
    
    tbody.innerHTML = siswa.map((s, i) => renderStudentRow(s, i)).join('');
  },
  
  renderAttendanceTable: function() {
    console.log('📋 [AdmKelas] renderAttendanceTable() called');
    console.log('🎯 [AdmKelas] activeClassIndex:', activeClassIndex);
    
    const tbody = document.getElementById('tabelPresensi');
    if (!tbody) {
      console.error('❌ [AdmKelas] tabelPresensi not found!');
      return;
    }
    
    if (activeClassIndex === null || !classes[activeClassIndex]) {
      console.error('❌ [AdmKelas] No active class selected');
      tbody.innerHTML = '<tr><td colspan="2" class="p-4 text-center text-red-500">Pilih kelas dulu!</td></tr>';
      return;
    }
    
    const siswa = classes[activeClassIndex].siswa;
    console.log('👥 [AdmKelas] Siswa count:', siswa?.length);
    
    if (!siswa || siswa.length === 0) {
      tbody.innerHTML = '<tr><td colspan="2" class="p-4 text-center text-gray-500">Belum ada siswa di kelas ini</td></tr>';
      return;
    }
    
    tbody.innerHTML = siswa.map((s, i) => renderAttendanceRow(s, i)).join('');
    console.log('✅ [AdmKelas] Attendance table rendered');
  },
  
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
      detailWaktu = 'Harian: ' + formatDate(val);
    } else if (tipe === 'bulan') {
      const val = document.getElementById('fBulan')?.value;
      filteredAbsen = classes[activeClassIndex].absen?.filter(a => a.tanggal?.startsWith(val)) || [];
      if (val) {
        const [y, m] = val.split('-');
        detailWaktu = `Bulan: ${new Date(y, m-1).toLocaleString('id-ID', { month: 'long' })} ${y}`;
      }
    } else {
      const smt = document.getElementById('fSmt')?.value;
      const thn = document.getElementById('fThn')?.value;
      filteredAbsen = classes[activeClassIndex].absen?.filter(a => {
        if (!a.tanggal?.startsWith(thn)) return false;
        const bln = parseInt(a.tanggal.split('-')[1]);
        return smt === 'ganjil' ? bln >= 7 : bln <= 6;
      }) || [];
      detailWaktu = `Semester ${smt?.toUpperCase()} ${thn}`;
    }
    
    info.innerText = detailWaktu;
    tbody.innerHTML = '';
    
    const totalPertemuan = filteredAbsen.length;
    let tH=0, tI=0, tS=0, tA=0, tB=0;
    
    classes[activeClassIndex].siswa.forEach(s => {
      let stats = { H:0, I:0, S:0, A:0, B:0, total:0, logI:[], logS:[], logA:[], logB:[] };
      
      filteredAbsen.forEach(log => {
        const record = log.data?.find(r => r.studentId === s.id || r.nama === s.nama);
        if (record) {
          const tglShort = log.tanggal?.split('-')?.reverse()?.join('/')?.substring(0,5) || '';
          if (record.status === 'H') stats.H++;
          else if (record.status === 'I') { stats.I++; stats.logI.push(tglShort); }
          else if (record.status === 'S') { stats.S++; stats.logS.push(tglShort); }
          else if (record.status === 'A') { stats.A++; stats.logA.push(tglShort); }
          else if (record.status === 'B') { stats.B++; stats.logB.push(tglShort); }
        }
      });
      
      stats.total = stats.H + stats.I + stats.S + stats.A + stats.B;
      tH += stats.H; tI += stats.I; tS += stats.S; tA += stats.A; tB += stats.B;
      
      tbody.innerHTML += renderRecapRow(s, stats, totalPertemuan);
    });
    
    document.getElementById('rekapStats').innerHTML = `
      <div class="p-4 bg-emerald-50 rounded-xl text-center"><p class="text-[10px] font-medium text-emerald-600">HADIR</p><p class="text-xl font-bold">${tH}</p></div>
      <div class="p-4 bg-blue-50 rounded-xl text-center"><p class="text-[10px] font-medium text-blue-600">IZIN</p><p class="text-xl font-bold">${tI}</p></div>
      <div class="p-4 bg-amber-50 rounded-xl text-center"><p class="text-[10px] font-medium text-amber-600">SAKIT</p><p class="text-xl font-bold">${tS}</p></div>
      <div class="p-4 bg-rose-50 rounded-xl text-center"><p class="text-[10px] font-medium text-rose-600">ALPA</p><p class="text-xl font-bold">${tA}</p></div>
      <div class="p-4 bg-slate-900 rounded-xl text-center"><p class="text-[10px] font-medium text-slate-400">BOLOS</p><p class="text-xl font-bold text-white">${tB}</p></div>
    `;
  },
  
  toggleFilterView: function() {
    const tipe = document.getElementById('tipeRekap').value;
    const container = document.getElementById('filterInputs');
    container.innerHTML = '';
    
    const today = new Date();
    if (tipe === 'hari') {
      container.innerHTML = `<input type="date" id="fHari" class="bg-slate-100 px-4 py-2 rounded-xl outline-none" value="${today.toISOString().split('T')[0]}">`;
    } else if (tipe === 'bulan') {
      const ym = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}`;
      container.innerHTML = `<input type="month" id="fBulan" class="bg-slate-100 px-4 py-2 rounded-xl outline-none" value="${ym}">`;
    } else {
      container.innerHTML = `
        <select id="fSmt" class="bg-slate-100 px-4 py-2 rounded-xl outline-none">
          <option value="ganjil">Ganjil (Jul-Des)</option>
          <option value="genap">Genap (Jan-Jun)</option>
        </select>
        <input type="number" id="fThn" class="bg-slate-100 px-4 py-2 rounded-xl w-20" value="${today.getFullYear()}">
      `;
    }
  },
  
  setupEventListeners: function() {
    const dateInput = document.getElementById('inputTgl');
    if (dateInput) dateInput.valueAsDate = new Date();
    
    const tipeRekap = document.getElementById('tipeRekap');
    if (tipeRekap) {
      tipeRekap.addEventListener('change', () => this.toggleFilterView());
    }
  },
  
  // ✅ VIEW NAVIGATION
  showView: function(viewId) {
    console.log('👁️ [AdmKelas] showView called with:', viewId);
    document.querySelectorAll('.view-section').forEach(v => v.classList.add('hidden'));
    document.getElementById(viewId)?.classList.remove('hidden');
    console.log('✅ [AdmKelas] View displayed:', viewId);
  },
  
  navigateToAttendance: async function() {
    console.log('🔴 [AdmKelas] navigateToAttendance() DIPANGGIL');
    
    try {
      classes = await storage.loadClasses();
      console.log('✅ [AdmKelas] Classes loaded:', classes.length, 'classes');
      
      if (!classes || classes.length === 0) {
        console.warn('⚠️ [AdmKelas] No classes found');
        return alert('Buat kelas dulu!');
      }
      
      console.log('🔄 [AdmKelas] Calling populateClassSelects()');
      this.populateClassSelects();
      
      console.log('🎯 [AdmKelas] activeClassIndex:', activeClassIndex);
      
      if (activeClassIndex === null || activeClassIndex >= classes.length) {
        console.log('⚠️ [AdmKelas] activeClassIndex invalid, setting to 0');
        activeClassIndex = 0;
      }
      
      const selectEl = document.getElementById('selectKelasAbsen');
      console.log('🔍 [AdmKelas] selectKelasAbsen element:', selectEl);
      
      if (selectEl && classes[activeClassIndex]) {
        selectEl.value = classes[activeClassIndex].id;
        console.log('✅ [AdmKelas] Set select value to:', classes[activeClassIndex].id);
      }
      
      console.log('📋 [AdmKelas] Calling renderAttendanceTable()');
      this.renderAttendanceTable();
      
      console.log('👁️ [AdmKelas] Calling showView("viewPresensi")');
      this.showView('viewPresensi');
      
      console.log('🟢 [AdmKelas] navigateToAttendance() SELESAI');
      
    } catch (error) {
      console.error('❌ [AdmKelas] navigateToAttendance ERROR:', error);
      alert('Error membuka presensi: ' + error.message);
    }
  },
  
  navigateToRecap: async function() {
    console.log('📊 [AdmKelas] navigateToRecap() called');
    
    if (!classes || classes.length === 0) {
      return alert('Belum ada data!');
    }
    
    this.populateClassSelects();
    
    if (activeClassIndex !== null && classes[activeClassIndex]) {
      const selectEl = document.getElementById('selectKelasRekap');
      if (selectEl) {
        selectEl.value = classes[activeClassIndex].id;
      }
    }
    
    this.toggleFilterView();
    this.showView('viewRekap');
  },
  
  // ✅ MODAL FUNCTIONS
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
  },
  
  editClass: function(index) {
    document.getElementById('editClassIdx').value = index;
    document.getElementById('namaKelas').value = classes[index].nama;
    this.openClassModal();
  },
  
  deleteClass: async function(index) {
    if (!confirm('Hapus kelas ini beserta semua data siswa dan absensi?')) return;
    
    const classId = classes[index].id;
    await storage.deleteClass(classId);
    
    classes = await storage.loadClasses();
    if (activeClassIndex === index) activeClassIndex = null;
    
    this.renderClassesGrid();
    this.populateClassSelects();
    alert('✅ Kelas dihapus!');
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
    
    const classId = classes[activeClassIndex].id;
    await storage.addStudent(classId, { nama, gender });
    
    document.getElementById('namaSiswa').value = '';
    classes = await storage.loadClasses();
    this.updateRealtimeCounter();
    this.renderStudentTable();
    this.closeModal('modalSiswa');
  },
  
  deleteStudent: async function(studentIndex) {
    if (!confirm('Hapus siswa ini?')) return;
    
    const classId = classes[activeClassIndex].id;
    const studentId = classes[activeClassIndex].siswa[studentIndex].id;
    
    await storage.deleteStudent(classId, studentId);
    
    classes = await storage.loadClasses();
    this.updateRealtimeCounter();
    this.renderStudentTable();
  },
  
  // ✅ ATTENDANCE FUNCTIONS
  changeAttendanceClass: function(classId) {
    activeClassIndex = classes.findIndex(c => c.id === classId);
    console.log('🎯 [AdmKelas] Active class changed to index:', activeClassIndex);
    this.renderAttendanceTable();
  },
  
  markAllPresent: function() {
    if (activeClassIndex === null) return;
    const siswa = classes[activeClassIndex].siswa;
    siswa.forEach((_, i) => {
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
    
    const classId = classes[activeClassIndex].id;
    await storage.saveAttendance(classId, tanggal, attendanceData);
    
    alert('✨ Absensi berhasil disimpan!');
    this.showView('viewKelas');
  },
  
  // ✅ RECAP FUNCTIONS
  changeRecapClass: function(classId) {
    activeClassIndex = classes.findIndex(c => c.id === classId);
    this.renderRecap();
  },
  
  deleteAllData: async function() {
    if (!confirm('⚠️ HAPUS SEMUA DATA? Tindakan ini tidak bisa dibatalkan!')) return;
    if (!confirm('Apakah Anda BENAR-BENAR yakin?')) return;
    
    await storage.saveClasses([]);
    classes = [];
    activeClassIndex = null;
    this.renderClassesGrid();
    this.populateClassSelects();
    alert('✅ Semua data telah dihapus!');
    window.location.reload();
  },
  
  // ✅ EXPORT FUNCTIONS
  downloadPDF: async function() {
    try {
      const { jsPDF } = await import('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
      await import('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js');
      
      const doc = new jsPDF('l', 'mm', 'a4');
      const className = classes[activeClassIndex]?.nama || 'Kelas';
      const periode = document.getElementById('infoPeriode')?.innerText || '';
      
      doc.setFontSize(14);
      doc.text(`REKAP ABSENSI - ${className}`, 14, 15);
      doc.setFontSize(10);
      doc.text(periode, 14, 22);
      
      doc.autoTable({
        startY: 30,
        html: '#tableToPDF',
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [30, 41, 59] }
      });
      
      doc.save(`Laporan_${className.replace(/\s+/g, '_')}.pdf`);
    } catch (e) {
      console.error('❌ PDF export error:', e);
      alert('Gagal export PDF. Pastikan koneksi internet untuk load library.');
    }
  },
  
  processExcel: async function(input) {
    const file = input.files[0];
    if (!file) return;
    
    try {
      const { read, utils } = await import('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
      
      const reader = new FileReader();
      reader.onload = async function(e) {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = read(data, { type: 'array' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = utils.sheet_to_json(worksheet);
          
          if (jsonData.length === 0) return alert('Excel kosong!');
          
          let added = 0;
          const classId = classes[activeClassIndex].id;
          
          for (const row of jsonData) {
            const nama = row.Nama || row.nama || row.NAMA;
            const gender = parseGender(row.Gender || row.gender || row.GENDER);
            
            if (nama) {
              await storage.addStudent(classId, {
                nama: nama.toString().trim(),
                gender
              });
              added++;
            }
          }
          
          classes = await storage.loadClasses();
          window.admKelas.updateRealtimeCounter();
          window.admKelas.renderStudentTable();
          window.admKelas.renderClassesGrid();
          
          alert(`✅ Berhasil mengimpor ${added} siswa!`);
          input.value = '';
        } catch (err) {
          console.error('Excel parse error:', err);
          alert('Gagal membaca file. Pastikan format .xlsx');
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (e) {
      console.error('SheetJS load error:', e);
      alert('Gagal load library Excel. Periksa koneksi internet.');
    }
  },
  
  // ✅ BACK TO DASHBOARD
  backToDashboard: function() {
    console.log('🏠 [AdmKelas] backToDashboard() called');
    
    const container = document.getElementById('module-container');
    if (container) {
      container.innerHTML = '';
      container.classList.add('hidden');
      console.log('✅ [AdmKelas] Module container hidden');
    }
    
    const welcomeSection = document.querySelector('.dashboard-hero')?.closest('section');
    if (welcomeSection) {
      welcomeSection.classList.remove('hidden');
      console.log('✅ [AdmKelas] Welcome section shown');
    }
    
    const roomsSection = document.querySelector('[aria-labelledby="rooms-heading"]');
    if (roomsSection) {
      roomsSection.classList.remove('hidden');
      console.log('✅ [AdmKelas] Rooms section shown');
    }
    
    document.querySelectorAll('#sd-section, #smp-section, #sma-section').forEach(section => {
      section.classList.add('hidden');
    });
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    console.log('🟢 [AdmKelas] backToDashboard() SELESAI');
  }
};

// ============================================
// ✅ CONFIRM MODULE LOADED
// ============================================
console.log('🟢 [AdmKelas] window.renderAdmKelas:', typeof window.renderAdmKelas);
console.log('🟢 [AdmKelas] window.admKelas:', typeof window.admKelas);
console.log('🟢 [AdmKelas] window.admKelas.renderClassesGrid:', typeof window.admKelas?.renderClassesGrid);
console.log('🟢 [AdmKelas] window.admKelas.saveClass:', typeof window.admKelas?.saveClass);
console.log('🟢 [AdmKelas] window.admKelas.backToDashboard:', typeof window.admKelas?.backToDashboard);
console.log('🟢 [AdmKelas] Module FINISHED - Ready to use!');
