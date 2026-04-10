/**
 * ============================================
 * MODULE: CTA TEMPLATES
 * Platform Administrasi Kelas Digital
 * ============================================
 * Helper functions for CTA Generator
 * ============================================
 */
console.log('🔴 [CTA Templates] Script START');

export function buildMatchingKey(jenjang, kelas, mapel, semester) { return `${jenjang}_${kelas}_${mapel}_${semester}`; }
export function parseMatchingKey(key) { const parts = key.split('_'); return { jenjang: parts[0] || '', kelas: parts[1] || '', mapel: parts[2] || '', semester: parts[3] || '' }; }
export function getFase(jenjang, kelas) { const k = parseInt(kelas, 10); if (jenjang === 'sd') { if (k <= 2) return 'A'; if (k <= 4) return 'B'; return 'C'; } else if (jenjang === 'smp') { return 'D'; } else if (jenjang === 'sma') { return k === 10 ? 'E' : 'F'; } return '-'; }
export function formatMapelName(mapel) { const names = { 'matematika': 'Matematika', 'ipas': 'IPAS', 'bahasa-indonesia': 'Bahasa Indonesia', 'pjok': 'PJOK', 'seni-budaya': 'Seni Budaya', 'lainnya': 'Lainnya' }; return names[mapel] || mapel; }
export function formatSemester(s) { return s === '1' ? '1 (Ganjil)' : '2 (Genap)'; }
export function buildKopDokumen(userData, pd) { return { sekolah: userData?.sekolah || '-', tahun: userData?.tahun || '2025/2026', jenjang: pd?.jenjang || '-', kelas: pd?.kelas || '-', semester: formatSemester(pd?.semester), mapel: formatMapelName(pd?.mapel), guru: userData?.guru || '-', topik: pd?.topik || '-', fase: getFase(pd?.jenjang, pd?.kelas) }; }
export function generateHeader(kop, type) { const typeNames = { 'cp': 'CAPAIAN PEMBELAJARAN (CP)', 'tp': 'TUJUAN PEMBELAJARAN (TP)', 'atp': 'ALUR TUJUAN PEMBELAJARAN (ATP)' }; let h = '═══════════════════════════════════════════════════════════\n'; h += `                    ${typeNames[type] || 'DOKUMEN'}\n`; h += '                  KURIKULUM MERDEKA\n'; h += '═══════════════════════════════════════════════════════════\n\n'; h += 'INFORMASI DOKUMEN\n'; h += '───────────────────────────────────────────────────────────\n'; h += `Nama Sekolah       : ${kop.sekolah}\n`; h += `Tahun Ajaran       : ${kop.tahun}\n`; h += `Jenjang/Kelas      : ${kop.jenjang?.toUpperCase() || '-'} / Kelas ${kop.kelas}\n`; h += `Fase               : ${kop.fase}\n`; h += `Semester           : ${kop.semester}\n`; h += `Mata Pelajaran     : ${kop.mapel}\n`; h += `Guru Pengampu      : ${kop.guru}\n`; h += `Topik/Materi       : ${kop.topik}\n\n`; return h; }

// ✅ ORIGINAL: Basic validation (preserved)
export function validateInput(d) { const errors = []; if (!d?.sekolah) errors.push('Nama Sekolah wajib'); if (!d?.jenjang) errors.push('Jenjang wajib'); if (!d?.kelas) errors.push('Kelas wajib'); if (!d?.semester) errors.push('Semester wajib'); if (!d?.mapel) errors.push('Mapel wajib'); if (!d?.topik) errors.push('Topik wajib'); return { valid: errors.length === 0, errors }; }

// ✅ NEW: Validation with user's assigned classes/mapel filter
export function validateInputWithFilter(d, userData) {
  // First run basic validation
  const basic = validateInput(d);
  if (!basic.valid) return basic;
  
  // If no userData, return basic validation
  if (!userData) return basic;
  
  const { jenjang_sekolah, kelas_diampu, mapel_diampu, sd_mapel_type } = userData;
  
  // Validate kelas against user's assigned classes
  if (kelas_diampu?.length > 0 && !kelas_diampu.includes(d?.kelas)) {
    return { valid: false, errors: [`Kelas ${d?.kelas} tidak termasuk dalam kelas yang Anda ampu`] };
  }
  
  // Validate mapel for SMP/SMA teachers
  if ((jenjang_sekolah === 'smp' || jenjang_sekolah === 'sma') && mapel_diampu?.length > 0) {
    if (!mapel_diampu.includes(d?.mapel)) {
      return { valid: false, errors: [`Mapel ${d?.mapel} tidak termasuk dalam mapel yang Anda ampu`] };
    }
  }
  
  // Validate mapel for SD Guru PAI/PJOK
  if (jenjang_sekolah === 'sd' && sd_mapel_type !== 'kelas') {
    const allowed = sd_mapel_type === 'pai' ? ['pai'] : ['pjok'];
    if (!allowed.includes(d?.mapel)) {
      return { valid: false, errors: [`Sebagai Guru ${sd_mapel_type.toUpperCase()}, hanya boleh memilih mapel ${sd_mapel_type.toUpperCase()}`] };
    }
  }
  
  return basic;
}

console.log('🟢 [CTA Templates] READY');
