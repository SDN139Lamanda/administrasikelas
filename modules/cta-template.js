/**
 * ============================================
 * MODULE: CTA TEMPLATES
 * Platform Administrasi Kelas Digital
 * ============================================
 * FUNGSI:
 * - Helper functions untuk manipulasi data
 * - Template builder untuk format output
 * - Utility functions untuk generator
 * ============================================
 */

console.log('🔴 [CTA Templates] Script START');

/**
 * Build matching key untuk load data yang tepat
 * @param {string} jenjang - sd, smp, sma
 * @param {string} kelas - 1-12
 * @param {string} mapel - matematika, ipas, dll
 * @param {string} semester - 1 atau 2
 * @returns {string} Matching key
 */
export function buildMatchingKey(jenjang, kelas, mapel, semester) {
  return `${jenjang}_${kelas}_${mapel}_${semester}`;
}

/**
 * Parse matching key menjadi object
 * @param {string} key - Matching key
 * @returns {Object} Parsed key components
 */
export function parseMatchingKey(key) {
  const parts = key.split('_');
  return {
    jenjang: parts[0],
    kelas: parts[1],
    mapel: parts[2],
    semester: parts[3]
  };
}

/**
 * Get fase berdasarkan jenjang dan kelas
 * @param {string} jenjang - sd, smp, sma
 * @param {string} kelas - 1-12
 * @returns {string} Fase (A, B, C, D, E, F)
 */
export function getFase(jenjang, kelas) {
  const kelasNum = parseInt(kelas);
  
  if (jenjang === 'sd') {
    if (kelasNum <= 2) return 'A';
    if (kelasNum <= 4) return 'B';
    return 'C';
  } else if (jenjang === 'smp') {
    return 'D';
  } else if (jenjang === 'sma') {
    if (kelasNum === 10) return 'E';
    return 'F';
  }
  
  return '-';
}

/**
 * Format nama mapel untuk display
 * @param {string} mapel - Kode mapel
 * @returns {string} Nama mapel lengkap
 */
export function formatMapelName(mapel) {
  const mapelNames = {
    'matematika': 'Matematika',
    'ipas': 'IPAS (Ilmu Pengetahuan Alam dan Sosial)',
    'bahasa-indonesia': 'Bahasa Indonesia',
    'pjok': 'PJOK (Pendidikan Jasmani, Olahraga, dan Kesehatan)',
    'seni-budaya': 'Seni Budaya',
    'pendidikan-kewarganegaraan': 'Pendidikan Kewarganegaraan',
    'paibd': 'Pendidikan Agama Islam dan Budi Pekerti',
    'fisika': 'Fisika',
    'kimia': 'Kimia',
    'biologi': 'Biologi',
    'lainnya': 'Lainnya'
  };
  
  return mapelNames[mapel] || mapel;
}

/**
 * Format semester untuk display
 * @param {string} semester - 1 atau 2
 * @returns {string} Semester text
 */
export function formatSemester(semester) {
  return semester === '1' ? '1 (Ganjil)' : '2 (Genap)';
}

/**
 * Build kop dokumen dari data user
 * @param {Object} userData - Data user dari localStorage
 * @param {Object} pembelajaranData - Data pembelajaran (jenjang, kelas, dll)
 * @returns {Object} Kop dokumen yang sudah diformat
 */
export function buildKopDokumen(userData, pembelajaranData) {
  return {
    sekolah: userData.sekolah || '-',
    tahun: userData.tahun || '2025/2026',
    jenjang: pembelajaranData.jenjang || '-',
    kelas: pembelajaranData.kelas || '-',
    semester: formatSemester(pembelajaranData.semester),
    mapel: formatMapelName(pembelajaranData.mapel),
    guru: userData.guru || '-',
    topik: pembelajaranData.topik || '-',
    fase: getFase(pembelajaranData.jenjang, pembelajaranData.kelas)
  };
}

/**
 * Generate header dokumen CP/TP/ATP
 * @param {Object} kop - Kop dokumen dari buildKopDokumen
 * @param {string} type - cp, tp, atau atp
 * @returns {string} Formatted header
 */
export function generateHeader(kop, type) {
  const typeNames = {
    'cp': 'CAPAIAN PEMBELAJARAN (CP)',
    'tp': 'TUJUAN PEMBELAJARAN (TP)',
    'atp': 'ALUR TUJUAN PEMBELAJARAN (ATP)'
  };
  
  let header = `═══════════════════════════════════════════════════════════\n`;
  header += `                    ${typeNames[type] || 'DOKUMEN'}\n`;
  header += `                  KURIKULUM MERDEKA\n`;
  header += `═══════════════════════════════════════════════════════════\n\n`;
  header += `INFORMASI DOKUMEN\n`;
  header += `───────────────────────────────────────────────────────────\n`;
  header += `Nama Sekolah       : ${kop.sekolah}\n`;
  header += `Tahun Ajaran       : ${kop.tahun}\n`;
  header += `Jenjang/Kelas      : ${kop.jenjang.toUpperCase()} / Kelas ${kop.kelas}\n`;
  header += `Fase               : ${kop.fase}\n`;
  header += `Semester           : ${kop.semester}\n`;
  header += `Mata Pelajaran     : ${kop.mapel}\n`;
  header += `Guru Pengampu      : ${kop.guru}\n`;
  header += `Topik/Materi       : ${kop.topik}\n`;
  header += `\n`;
  
  return header;
}

/**
 * Combine CP, TP, ATP menjadi satu dokumen lengkap
 * @param {string} cp - Text CP
 * @param {string} tp - Text TP
 * @param {string} atp - Text ATP
 * @param {Object} kop - Kop dokumen
 * @returns {string} Dokumen lengkap
 */
export function combineDokumen(cp, tp, atp, kop) {
  let dokumen = generateHeader(kop, 'cp');
  dokumen += `\n${cp}\n\n`;
  dokumen += `\n${generateHeader(kop, 'tp')}\n`;
  dokumen += `\n${tp}\n\n`;
  dokumen += `\n${generateHeader(kop, 'atp')}\n`;
  dokumen += `\n${atp}\n\n`;
  dokumen += `\n═══════════════════════════════════════════════════════════\n`;
  dokumen += `Dokumen ini dibuat secara otomatis oleh\n`;
  dokumen += `Platform Administrasi Kelas Digital\n`;
  dokumen += `═══════════════════════════════════════════════════════════\n`;
  
  return dokumen;
}

/**
 * Validate input data sebelum generate
 * @param {Object} data - Data input dari form
 * @returns {Object} Validation result {valid, errors}
 */
export function validateInput(data) {
  const errors = [];
  
  if (!data.sekolah) errors.push('Nama Sekolah wajib diisi');
  if (!data.jenjang) errors.push('Jenjang wajib dipilih');
  if (!data.kelas) errors.push('Kelas wajib dipilih');
  if (!data.semester) errors.push('Semester wajib dipilih');
  if (!data.mapel) errors.push('Mata Pelajaran wajib dipilih');
  if (!data.topik) errors.push('Topik/Materi wajib diisi');
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Get random item from array (untuk variasi)
 * @param {Array} array - Array to pick from
 * @returns {*} Random item
 */
export function getRandomItem(array) {
  if (!array || array.length === 0) return null;
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Shuffle array (untuk randomisasi urutan)
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
export function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Format tanggal untuk display
 * @param {Date} date - Date object
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

console.log('🟢 [CTA Templates] READY — Export functions: buildMatchingKey, parseMatchingKey, getFase, formatMapelName, formatSemester, buildKopDokumen, generateHeader, combineDokumen, validateInput, getRandomItem, shuffleArray, formatDate');
