/**
 * ============================================
 * MODULE: RAPOR EXPORT (PDF/Word)
 * ============================================
 */
console.log('🔴 [Rapor Export] START');

// ✅ Export to PDF using jsPDF
export async function exportRaporToPDF(data) {
  // Load jsPDF dynamically if not already loaded
  if (!window.jspdf) {
    await loadJsPdf();
  }
  
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Simple text-based PDF generation
  const { siswa, userData, semester } = data;
  const labelSemester = semester === '1' ? 'Ganjil' : 'Genap';
  
  doc.setFontSize(16);
  doc.text('RAPOR HASIL BELAJAR', 105, 20, { align: 'center' });
  doc.setFontSize(12);
  doc.text('Kurikulum Merdeka', 105, 30, { align: 'center' });
  
  doc.text(`Nama Sekolah: ${userData.nama_sekolah || '-'}`, 20, 50);
  doc.text(`Nama Siswa: ${siswa.nama}`, 20, 60);
  doc.text(`Kelas: ${siswa.kelas}`, 20, 70);
  doc.text(`Semester: ${labelSemester}`, 20, 80);
  
  // Add more content as needed...
  
  const filename = `Rapor_${siswa.nama.replace(/\s+/g, '_')}_Kelas${siswa.kelas}.pdf`;
  doc.save(filename);
  
  console.log('✅ [Export] PDF downloaded:', filename);
}

// ✅ Export to Word (.doc)
export function exportRaporToWord(data) {
  const htmlContent = generateRaporHtml(data);
  const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Rapor</title></head><body>`;
  const footer = '</body></html>';
  const sourceHTML = header + htmlContent + footer;
  
  const blob = new Blob(['\ufeff', sourceHTML], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Rapor_${data.siswa.nama.replace(/\s+/g, '_')}_Kelas${data.siswa.kelas}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  console.log('✅ [Export] Word downloaded');
}

// ✅ Load jsPDF library dynamically
async function loadJsPdf() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load jsPDF'));
    document.head.appendChild(script);
  });
}

// ✅ Generate HTML for export
function generateRaporHtml(data) {
  // Reuse template from rapor-templates.js or generate here
  return `<h1>Rapor - ${data.siswa.nama}</h1><p>Kelas ${data.siswa.kelas}</p>`;
}

console.log('🟢 [Rapor Export] READY');
