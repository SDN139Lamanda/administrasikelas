/**
 * ============================================
 * MODULE: CTA TEMPLATES
 * Platform Administrasi Kelas Digital
 * ============================================
 */
console.log('🔴 [CTA Templates] Script START');

export function buildMatchingKey(jenjang, kelas, mapel, semester) {
  return `${jenjang}_${kelas}_${mapel}_${semester}`;
}

export function parseMatchingKey(key) {
  const parts = key.split('_');
  return { jenjang: parts[0], kelas: parts[1], mapel: parts[2], semester: parts[3] };
}

export function getFase(jenjang, kelas) {
  const k = parseInt(kelas);
  if (jenjang === 'sd') { if (k <= 2) return 'A'; if (k <= 4) return 'B'; return 'C'; }
  else if (jenjang === 'smp') return 'D';
  else if (jenjang === 'sma') return k === 10 ? 'E' : 'F';
  return '-';
}

export function formatMapelName(mapel) {
  const names = {
    'matematika': 'Matematika', 'ipas': 'IPAS', 'bahasa-indonesia': 'Bahasa Indonesia',
    'pjok': 'PJOK', 'seni-budaya': 'Seni Budaya', 'lainnya': 'Lainnya'
  };
  return names[mapel] || mapel;
}

export function formatSemester(s) { return s === '1' ? '1 (Ganjil)' : '2 (Genap)'; }

export function buildKopDokumen(userData, pd) {
  return {
    sekolah: userData.sekolah || '-', tahun: userData.tahun || '2025/2026',
    jenjang: pd.jenjang || '-', kelas: pd.kelas || '-',
    semester: formatSemester(pd.semester), mapel: formatMapelName(pd.mapel),
    guru: userData.guru || '-', topik: pd.topik || '-',
    fase: getFase(pd.jenjang, pd.kelas)
  };
}

export function generateHeader(kop, type) {
  const tn = { 'cp': 'CAPAIAN PEMBELAJARAN (CP)', 'tp': 'TUJUAN PEMBELAJARAN (TP)', 'atp': 'ALUR TUJUAN PEMBELAJARAN (ATP)' };
  let h = `═══════════════════════════════════════════════════════════\n`;
  h += `                    ${tn[type] || 'DOKUMEN'}\n`;
  h += `                  KURIKULUM MERDEKA\n`;
  h += `═══════════════════════════════════════════════════════════\n\n`;
  h += `INFORMASI DOKUMEN\n───────────────────────────────────────────────────────────\n`;
  h += `Nama Sekolah       : ${kop.sekolah}\nTahun Ajaran       : ${kop.tahun}\n`;
  h += `Jenjang/Kelas      : ${kop.jenjang.toUpperCase()} / Kelas ${kop.kelas}\nFase: ${kop.fase}\n`;
  h += `Semester           : ${kop.semester}\nMata Pelajaran     : ${kop.mapel}\n`;
  h += `Guru Pengampu      : ${kop.guru}\nTopik/Materi       : ${kop.topik}\n\n`;
  return h;
}

export function validateInput(d) {
  const e = [];
  if (!d.sekolah) e.push('Nama Sekolah wajib');
  if (!d.jenjang) e.push('Jenjang wajib');
  if (!d.kelas) e.push('Kelas wajib');
  if (!d.semester) e.push('Semester wajib');
  if (!d.mapel) e.push('Mapel wajib');
  if (!d.topik) e.push('Topik wajib');
  return { valid: e.length === 0, errors: e };
}

console.log('🟢 [CTA Templates] READY');
