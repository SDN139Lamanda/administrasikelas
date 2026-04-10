/**
 * ============================================
 * MODULE: RAPOR TEMPLATES
 * Kurikulum Merdeka Format
 * ============================================
 */
console.log('🔴 [Rapor Templates] START');

// ✅ HTML Template for Rapor (Kurikulum Merdeka)
export function getRaporHtmlTemplate(data) {
  const { siswa, userData, semester, nilai, absen, deskripsi, catatan } = data;
  const labelJenjang = {sd:'SD', smp:'SMP', sma:'SMA'}[userData.jenjang_sekolah] || userData.jenjang_sekolah.toUpperCase();
  const labelSemester = semester === '1' ? 'Ganjil' : 'Genap';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Rapor - ${siswa.nama}</title>
      <style>
        body { font-family: 'Times New Roman', serif; line-height: 1.6; margin: 40px; color: #000; }
        .header { text-align: center; border-bottom: 3px double #000; padding-bottom: 16px; margin-bottom: 24px; }
        .header h1 { font-size: 18px; font-weight: bold; margin: 0; }
        .header p { margin: 4px 0; font-size: 14px; }
        .section { margin-bottom: 24px; }
        .section h3 { font-size: 16px; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 8px; margin-bottom: 12px; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th, td { border: 1px solid #000; padding: 8px; text-align: left; }
        th { background: #f3f4f6; }
        .signature { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
        .signature div { text-align: center; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
        @media print { body { margin: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>RAPOR HASIL BELAJAR PESERTA DIDIK</h1>
        <p>KURIKULUM MERDEKA</p>
        <p style="margin-top: 8px;"><strong>${userData.nama_sekolah || 'Nama Sekolah'}</strong></p>
        <p>${labelJenjang} • Kelas ${siswa.kelas} • Semester ${labelSemester}</p>
      </div>
      
      <div class="section">
        <h3>IDENTITAS PESERTA DIDIK</h3>
        <table>
          <tr><td width="150">Nama Peserta Didik</td><td>: ${siswa.nama}</td></tr>
          <tr><td>NIS</td><td>: ${siswa.nis}</td></tr>
          <tr><td>Kelas</td><td>: ${siswa.kelas}</td></tr>
          <tr><td>Semester</td><td>: ${labelSemester}</td></tr>
          <tr><td>Tahun Ajaran</td><td>: 2025/2026</td></tr>
        </table>
      </div>
      
      <div class="section">
        <h3>HASIL BELAJAR</h3>
        <table>
          <thead>
            <tr><th width="30%">Komponen</th><th width="15%">Nilai</th><th width="25%">Predikat</th><th>Deskripsi</th></tr>
          </thead>
          <tbody>
            <tr><td>Pengetahuan (KI-3)</td><td>${nilai.pengetahuan}</td><td>${calculatePredikat(nilai.pengetahuan)}</td><td>${deskripsi.pengetahuan}</td></tr>
            <tr><td>Keterampilan (KI-4)</td><td>${nilai.keterampilan}</td><td>${calculatePredikat(nilai.keterampilan)}</td><td>${deskripsi.keterampilan}</td></tr>
            <tr><td>Sikap Spiritual</td><td>${nilai.spiritual}</td><td>${calculatePredikat(nilai.spiritual)}</td><td>${deskripsi.spiritual}</td></tr>
            <tr><td>Sikap Sosial</td><td>${nilai.sosial}</td><td>${calculatePredikat(nilai.sosial)}</td><td>${deskripsi.sosial}</td></tr>
          </tbody>
        </table>
      </div>
      
      <div class="section">
        <h3>KEHADIRAN</h3>
        <table>
          <tr><td width="150">Sakit</td><td>: ${absen.sakit} hari</td></tr>
          <tr><td>Izin</td><td>: ${absen.izin} hari</td></tr>
          <tr><td>Tanpa Keterangan</td><td>: ${absen.tk} hari</td></tr>
        </table>
      </div>
      
      <div class="section">
        <h3>CATATAN WALI KELAS</h3>
        <p style="margin-top: 8px; min-height: 60px;">${catatan}</p>
      </div>
      
      <div class="signature">
        <div>
          <p>Mengetahui,</p>
          <p style="margin-top: 40px;"><strong>Orang Tua/Wali</strong></p>
        </div>
        <div>
          <p>${userData.nama_sekolah?.split(',')[0] || 'Kota'}, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p style="margin-top: 40px;"><strong>${userData.nama_lengkap || 'Nama Guru'}</strong><br>Guru Kelas</p>
        </div>
      </div>
      
      <p class="footer">Dokumen ini dibuat dengan Platform Administrasi Kelas Digital © 2026</p>
    </body>
    </html>
  `;
}

// ✅ Helper: Calculate predikat
function calculatePredikat(nilai) {
  if (nilai >= 90) return 'A (Sangat Baik)';
  if (nilai >= 80) return 'B (Baik)';
  if (nilai >= 70) return 'C (Cukup)';
  if (nilai >= 60) return 'D (Kurang)';
  return 'E (Sangat Kurang)';
}

console.log('🟢 [Rapor Templates] READY');
