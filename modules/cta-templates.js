/**
 * ============================================
 * MODULE: CTA TEMPLATES
 * Platform Administrasi Kelas Digital
 * ✅ UPDATED: ROBUST VALIDATION MATCHING + FIXED 'paibd' (NO SLASH)
 * ============================================
 */
console.log('🔴 [CTA Templates] Script START');

export function buildMatchingKey(jenjang, kelas, mapel, semester) { return `${jenjang}_${kelas}_${mapel}_${semester}`; }
export function parseMatchingKey(key) { const parts = key.split('_'); return { jenjang: parts[0] || '', kelas: parts[1] || '', mapel: parts[2] || '', semester: parts[3] || '' }; }
export function getFase(jenjang, kelas) { const k = parseInt(kelas, 10); if (jenjang === 'sd') { if (k <= 2) return 'A'; if (k <= 4) return 'B'; return 'C'; } else if (jenjang === 'smp') { return 'D'; } else if (jenjang === 'sma') { return k === 10 ? 'E' : 'F'; } return '-'; }
export function formatMapelName(mapel) { const names = { 'matematika': 'Matematika', 'ipas': 'IPAS', 'bahasa-indonesia': 'Bahasa Indonesia', 'pjok': 'PJOK', 'paibd' : 'PAIBD', 'pkn': 'PKn', 'bahasa inggris': 'Bahasa Inggris', 'seni-budaya': 'Seni Budaya', 'lainnya': 'Lainnya' }; return names[mapel] || mapel; }
export function formatSemester(s) { return s === '1' ? '1 (Ganjil)' : '2 (Genap)'; }
export function buildKopDokumen(userData, pd) { return { sekolah: userData?.sekolah || '-', tahun: userData?.tahun || '2025/2026', jenjang: pd?.jenjang || '-', kelas: pd?.kelas || '-', semester: formatSemester(pd?.semester), mapel: formatMapelName(pd?.mapel), guru: userData?.guru || '-', topik: pd?.topik || '-', fase: getFase(pd?.jenjang, pd?.kelas) }; }
export function generateHeader(kop, type) { const typeNames = { 'cp': 'CAPAIAN PEMBELAJARAN (CP)', 'tp': 'TUJUAN PEMBELAJARAN (TP)', 'atp': 'ALUR TUJUAN PEMBELAJARAN (ATP)' }; let h = '═══════════════════════════════════════════════════════════\n'; h += `                    ${typeNames[type] || 'DOKUMEN'}\n`; h += '                  KURIKULUM MERDEKA\n'; h += '═══════════════════════════════════════════════════════════\n\n'; h += 'INFORMASI DOKUMEN\n'; h += '───────────────────────────────────────────────────────────\n'; h += `Nama Sekolah       : ${kop.sekolah}\n`; h += `Tahun Ajaran       : ${kop.tahun}\n`; h += `Jenjang/Kelas      : ${kop.jenjang?.toUpperCase() || '-'} / Kelas ${kop.kelas}\n`; h += `Fase               : ${kop.fase}\n`; h += `Semester           : ${kop.semester}\n`; h += `Mata Pelajaran     : ${kop.mapel}\n`; h += `Guru Pengampu      : ${kop.guru}\n`; h += `Topik/Materi       : ${kop.topik}\n\n`; return h; }

// ✅ ORIGINAL: Basic validation (preserved)
export function validateInput(d) { const errors = []; if (!d?.sekolah) errors.push('Nama Sekolah wajib'); if (!d?.jenjang) errors.push('Jenjang wajib'); if (!d?.kelas) errors.push('Kelas wajib'); if (!d?.semester) errors.push('Semester wajib'); if (!d?.mapel) errors.push('Mapel wajib'); if (!d?.topik) errors.push('Topik wajib'); return { valid: errors.length === 0, errors }; }

// ✅ UPDATED: ROBUST VALIDATION WITH CASE-INSENSITIVE MATCHING + FIXED 'paibd' (NO SLASH)
export function validateInputWithFilter(d, userData) {
  const basic = validateInput(d);
  if (!basic.valid) return basic;
  if (!userData) return basic;
  
  const { jenjang_sekolah, kelas_diampu, mapel_yang_diampu, sd_mapel_type, role } = userData;
  if (role === 'admin') return basic;
  
  const mapelLower = d?.mapel?.toLowerCase() || '';

  // ✅ VALIDATE KELAS
  if (jenjang_sekolah === 'tk' && !['A', 'B'].includes(d?.kelas)) return { valid: false, errors: ['Kelas TK hanya A atau B'] };
  if (['sd', 'mi'].includes(jenjang_sekolah) && sd_mapel_type?.toLowerCase() === 'kelas' && !kelas_diampu?.includes(d?.kelas)) {
    return { valid: false, errors: [`Kelas ${d?.kelas} tidak termasuk dalam kelas yang Anda ampu`] };
  }

  // ✅ VALIDATE MAPEL (ROBUST + FIXED 'paibd')
  if (['sd', 'mi'].includes(jenjang_sekolah) && sd_mapel_type?.toLowerCase() === 'kelas') {
    // ✅ FIXED: 'paibd' TANPA SLASH
    const excluded = ['pai', 'pjok', 'paibd', 'pendidikan agama', 'pendidikan jasmani', 'pendidikan keagamaan'];
    if (excluded.some(ex => mapelLower.includes(ex))) return { valid: false, errors: ['Mapel PAI/BD dan PJOK tidak tersedia untuk Guru Kelas'] };
  }
  
  if (['sd', 'mi'].includes(jenjang_sekolah) && sd_mapel_type && sd_mapel_type.toLowerCase() !== 'kelas') {
    const target = sd_mapel_type.toLowerCase();
    // ✅ 2-way includes check for flexible matching
    if (!mapelLower.includes(target) && !target.includes(mapelLower)) {
      return { valid: false, errors: [`Sebagai Guru Mapel, hanya boleh memilih mapel yang terdaftar (${sd_mapel_type})`] };
    }
  }
  
  if (['smp', 'mts', 'sma', 'ma'].includes(jenjang_sekolah) && mapel_yang_diampu?.length > 0) {
    const allowed = mapel_yang_diampu.map(m => (m || '').toLowerCase());
    if (!allowed.some(a => mapelLower.includes(a) || a.includes(mapelLower))) {
      return { valid: false, errors: [`Mapel ${d?.mapel} tidak termasuk dalam mapel yang Anda ampu`] };
    }
  }
  
  return basic;
}

console.log('🟢 [CTA Templates] READY');
