/**
 * TEMPLATE: UI templates for adm-kelas module
 * FINAL: No ?. on CRUD buttons
 */

import { escapeHtml } from './utils.js';

export function getMainTemplate() {
  return `
    <div class="adm-kelas-module">
      <div class="flex items-center justify-between mb-6 pb-4 border-b">
        <h2 class="text-xl font-bold text-slate-800">📚 Administrasi Kelas</h2>
        <button onclick="window.admKelas.backToDashboard()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-medium transition">
          ← Kembali ke Dashboard
        </button>
      </div>

      <div id="viewDaftarKelas" class="view-section">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-slate-700">📋 Daftar Kelas Anda</h3>
          <button onclick="window.admKelas.openClassModal()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition">
            + Tambah Kelas Baru
          </button>
        </div>
        <div id="gridKelas" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>
      </div>

      <div id="viewPresensi" class="view-section hidden">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-slate-700">📝 Input Absensi</h3>
          <button onclick="window.admKelas.showView('viewDaftarKelas')" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition">
            ← Kembali
          </button>
        </div>
        <div class="bg-white rounded-2xl shadow-sm border p-4 mb-4">
          <label class="text-sm font-medium text-slate-700">Pilih Kelas:</label>
          <select id="selectKelasAbsen" onchange="window.admKelas.changeAttendanceClass(this.value)" class="ml-2 px-3 py-2 border rounded-lg text-sm w-64"></select>
        </div>
        <div class="bg-white rounded-2xl shadow-sm border p-4 mb-4">
          <label class="text-sm font-medium text-slate-700">Tanggal:</label>
          <input type="date" id="inputTgl" class="ml-2 px-3 py-2 border rounded-lg text-sm">
          <button onclick="window.admKelas.markAllPresent()" class="ml-4 px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg text-sm font-medium transition">
            ✓ Tandai Semua Hadir
          </button>
        </div>
        <div class="bg-white rounded-2xl shadow-sm border overflow-hidden mb-4">
          <table class="w-full">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600">No</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600">Nama Siswa</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-slate-600">H</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-slate-600">I</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-slate-600">S</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-slate-600">A</th>
              </tr>
            </thead>
            <tbody id="tabelPresensi" class="divide-y"></tbody>
          </table>
        </div>
        <button onclick="window.admKelas.saveAttendance()" class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition">
          💾 Simpan Absensi
        </button>
      </div>

      <div id="viewRekap" class="view-section hidden">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-slate-700">📊 Laporan / Rekap Absensi</h3>
          <button onclick="window.admKelas.showView('viewDaftarKelas')" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition">
            ← Kembali
          </button>
        </div>
        <div class="bg-white rounded-2xl shadow-sm border p-4 mb-4">
          <label class="text-sm font-medium text-slate-700">Pilih Kelas:</label>
          <select id="selectKelasRekap" onchange="window.admKelas.changeRecapClass(this.value)" class="ml-2 px-3 py-2 border rounded-lg text-sm w-64"></select>
        </div>
        <div class="bg-white rounded-2xl shadow-sm border p-4 mb-4">
          <label class="text-sm font-medium text-slate-700 mr-2">Periode:</label>
          <select id="tipeRekap" onchange="window.admKelas.toggleFilterView()" class="px-3 py-2 border rounded-lg text-sm mr-2">
            <option value="hari">Harian</option>
            <option value="bulan">Bulanan</option>
            <option value="semester">Semester</option>
          </select>
          <span id="filterInputs" class="inline-flex items-center gap-2"></span>
          <button onclick="window.admKelas.renderRecap()" class="ml-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition">
            Tampilkan
          </button>
        </div>
        <p id="infoPeriode" class="text-sm font-medium text-slate-700 mb-3"></p>
        <div id="rekapStats" class="grid grid-cols-4 gap-3 mb-4">
          <div class="p-4 bg-emerald-50 rounded-xl text-center"><p class="text-xs font-medium text-emerald-600">HADIR</p><p class="text-xl font-bold" id="statH">0</p></div>
          <div class="p-4 bg-blue-50 rounded-xl text-center"><p class="text-xs font-medium text-blue-600">IZIN</p><p class="text-xl font-bold" id="statI">0</p></div>
          <div class="p-4 bg-amber-50 rounded-xl text-center"><p class="text-xs font-medium text-amber-600">SAKIT</p><p class="text-xl font-bold" id="statS">0</p></div>
          <div class="p-4 bg-rose-50 rounded-xl text-center"><p class="text-xs font-medium text-rose-600">ALPA</p><p class="text-xl font-bold" id="statA">0</p></div>
        </div>
        <div class="bg-white rounded-2xl shadow-sm border overflow-hidden mb-4">
          <table class="w-full" id="tableToPDF">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600">Nama</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-slate-600">H</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-slate-600">I</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-slate-600">S</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-slate-600">A</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-slate-600">%</th>
              </tr>
            </thead>
            <tbody id="tabelRekap" class="divide-y"></tbody>
          </table>
        </div>
        <div class="flex gap-2 mt-4">
          <button onclick="window.admKelas.printRecap()" class="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition">
            🖨️ Print / Cetak
          </button>
          <button onclick="window.admKelas.downloadPDF()" class="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition">
            📄 Download PDF
          </button>
        </div>
      </div>

      <div id="viewSiswa" class="view-section hidden">
        <div class="flex items-center justify-between mb-4">
          <h3 id="judulKelasSiswa" class="font-semibold text-slate-700">👥 Daftar Siswa</h3>
          <div class="flex gap-2">
            <button onclick="window.admKelas.openStudentModal()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition">
              + Tambah Siswa
            </button>
            <button onclick="window.admKelas.showView('viewDaftarKelas')" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition">
              ← Kembali
            </button>
          </div>
        </div>
        <div class="bg-white rounded-2xl shadow-sm border overflow-hidden mb-4">
          <table class="w-full">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600">No</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600">Nama Siswa</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600">Gender</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-slate-600">Aksi</th>
              </tr>
            </thead>
            <tbody id="tabelSiswa" class="divide-y"></tbody>
          </table>
        </div>
        <p id="countRealtime" class="text-xs text-slate-500"></p>
      </div>

      <div id="modalKelas" class="fixed inset-0 bg-black/50 hidden items-center justify-center z-50">
        <div class="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
          <h3 class="text-lg font-bold mb-4">📝 Kelas Baru</h3>
          <input type="hidden" id="editClassIdx">
          <input type="text" id="namaKelas" placeholder="Nama kelas (contoh: 4A)" class="w-full px-4 py-3 border rounded-xl mb-4" autofocus>
          <div class="flex gap-3">
            <button onclick="window.admKelas.closeModal('modalKelas')" class="flex-1 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition">Batal</button>
            <button onclick="window.admKelas.saveClass()" class="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition">Simpan</button>
          </div>
        </div>
      </div>

      <div id="modalSiswa" class="fixed inset-0 bg-black/50 hidden items-center justify-center z-50">
        <div class="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
          <h3 class="text-lg font-bold mb-4">👤 Tambah Siswa</h3>
          <input type="text" id="namaSiswa" placeholder="Nama lengkap siswa" class="w-full px-4 py-3 border rounded-xl mb-3" autofocus>
          <select id="genderSiswa" class="w-full px-4 py-3 border rounded-xl mb-4">
            <option value="L">Laki-laki</option>
            <option value="P">Perempuan</option>
          </select>
          <div class="flex gap-3">
            <button onclick="window.admKelas.closeModal('modalSiswa')" class="flex-1 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition">Batal</button>
            <button onclick="window.admKelas.saveStudent()" class="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition">Tambah</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderClassCard(k, index) {
  return `
    <div class="bg-white rounded-2xl shadow-sm border p-4 hover:shadow-md transition cursor-pointer" onclick="window.admKelas.openClassDetail(${index})">
      <div class="flex items-start justify-between">
        <div>
          <h4 class="font-semibold text-slate-800">${escapeHtml(k.nama)}</h4>
          <p class="text-xs text-slate-500 mt-1">${k.siswa?.length || 0} siswa</p>
          ${k.siswa?.length === 0 ? '<p class="text-xs text-amber-600 mt-1">⚠️ Belum ada siswa</p>' : ''}
        </div>
        <div class="flex gap-1">
          <button onclick="event.stopPropagation(); window.admKelas.editClass(${index})" class="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Edit">
            <i class="fas fa-pen"></i>
          </button>
          <button onclick="event.stopPropagation(); window.admKelas.deleteClass(${index})" class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Hapus">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      <div class="mt-3 flex gap-2">
        <button onclick="event.stopPropagation(); window.admKelas.openClassDetail(${index})" class="flex-1 py-2 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition">
          👥 Kelola Siswa
        </button>
        <button onclick="event.stopPropagation(); window.admKelas.navigateToAttendance()" class="flex-1 py-2 text-xs ${k.siswa?.length > 0 ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'} rounded-lg font-medium transition" ${k.siswa?.length === 0 ? 'disabled' : ''}>
          📋 Absensi
        </button>
        <button onclick="event.stopPropagation(); window.admKelas.navigateToRecap()" class="flex-1 py-2 text-xs ${k.siswa?.length > 0 ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'} rounded-lg font-medium transition" ${k.siswa?.length === 0 ? 'disabled' : ''}>
          📊 Rekap
        </button>
      </div>
      ${k.siswa?.length === 0 ? `
        <div class="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p class="text-xs text-amber-700">
            ⚠️ <strong>Belum ada siswa!</strong><br>
            Klik "Kelola Siswa" untuk menambah siswa sebelum bisa input absensi.
          </p>
        </div>
      ` : ''}
    </div>
  `;
}

export function renderStudentRow(s, index) {
  return `
    <tr class="hover:bg-slate-50 transition">
      <td class="px-4 py-3 text-sm text-slate-600">${index + 1}</td>
      <td class="px-4 py-3 text-sm font-medium text-slate-800">${escapeHtml(s.nama)}</td>
      <td class="px-4 py-3 text-sm text-slate-600">${s.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
      <td class="px-4 py-3 text-right">
        <button onclick="window.admKelas.deleteStudent(${index})" class="px-3 py-1 text-xs bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg font-medium transition">
          Hapus
        </button>
      </td>
    </tr>
  `;
}

export function renderAttendanceRow(s, index) {
  return `
    <tr class="hover:bg-slate-50 transition">
      <td class="px-4 py-3 text-sm text-slate-600">${index + 1}</td>
      <td class="px-4 py-3 text-sm font-medium text-slate-800">${escapeHtml(s.nama)}</td>
      <td class="px-4 py-3 text-center">
        <label class="cursor-pointer">
          <input type="radio" name="abs_${index}" value="H" id="H_${index}" checked class="peer sr-only">
          <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 peer-checked:bg-emerald-600 peer-checked:text-white text-slate-400 hover:bg-emerald-100 transition">✓</span>
        </label>
      </td>
      <td class="px-4 py-3 text-center">
        <label class="cursor-pointer">
          <input type="radio" name="abs_${index}" value="I" class="peer sr-only">
          <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 peer-checked:bg-blue-600 peer-checked:text-white text-slate-400 hover:bg-blue-100 transition">I</span>
        </label>
      </td>
      <td class="px-4 py-3 text-center">
        <label class="cursor-pointer">
          <input type="radio" name="abs_${index}" value="S" class="peer sr-only">
          <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 peer-checked:bg-amber-600 peer-checked:text-white text-slate-400 hover:bg-amber-100 transition">S</span>
        </label>
      </td>
      <td class="px-4 py-3 text-center">
        <label class="cursor-pointer">
          <input type="radio" name="abs_${index}" value="A" class="peer sr-only">
          <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-rose-50 peer-checked:bg-rose-600 peer-checked:text-white text-slate-400 hover:bg-rose-100 transition">A</span>
        </label>
      </td>
    </tr>
  `;
}

export function renderRecapRow(s, stats, total) {
  const pct = total > 0 ? Math.round((stats.H / total) * 100) : 0;
  return `
    <tr class="hover:bg-slate-50 transition">
      <td class="px-4 py-3 text-sm font-medium text-slate-800">${escapeHtml(s.nama)}</td>
      <td class="px-4 py-3 text-center text-sm">${stats.H}</td>
      <td class="px-4 py-3 text-center text-sm">${stats.I}</td>
      <td class="px-4 py-3 text-center text-sm">${stats.S}</td>
      <td class="px-4 py-3 text-center text-sm">${stats.A}</td>
      <td class="px-4 py-3 text-center">
        <span class="inline-flex items-center justify-center w-10 h-6 rounded-full text-xs font-bold ${pct >= 75 ? 'bg-emerald-100 text-emerald-700' : pct >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}">
          ${pct}%
        </span>
      </td>
    </tr>
  `;
}

console.log('✅ [Template] Loaded - adm-kelas UI templates (FINAL)');
