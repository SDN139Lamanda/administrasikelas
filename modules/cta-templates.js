/**
 * ============================================
 * MODULE: CTA TEMPLATES
 * Platform Administrasi Kelas Digital
 * ============================================
 * Helper functions for CTA Generator
 * ✅ UPDATED: validateInputWithFilter() match skema akses user
 * ============================================
 */
console.log('🔴 [CTA Templates] Script START');

export function buildMatchingKey(jenjang, kelas, mapel, semester) { return `${jenjang}_${kelas}_${mapel}_${semester}`; }
export function parseMatchingKey(key) { const parts = key.split('_'); return { jenjang: parts[0] || '', kelas: parts[1] || '', mapel: parts[2] || '', semester: parts[3] || '' }; }
export function getFase(jenjang, kelas) { const k = parseInt(kelas, 10); if (jenjang === 'sd') { if (k <= 2) return 'A'; if (k <= 4) return 'B'; return 'C'; } else if (jenjang === 'smp') { return 'D'; } else if (jenjang === 'sma') { return k === 10 ? 'E' : 'F'; } return '-'; }
export function formatMapelName(mapel) { const names = { 'matematika': 'Matematika', 'ipas': 'IPAS', 'bahasa-indonesia': 'Bahasa Indonesia', 'pjok': 'PJOK', 'PAIBD' : 'PAIBD', 'PKn': 'PKn', 'Bahasa Inggris': 'Bahasa Inggris', 'seni-budaya': 'Seni Budaya', 'lainnya': 'Lainnya' }; return names[mapel] || mapel; }
export function formatSemester(s) { return s === '1' ? '1 (Ganjil)' : '2 (Genap)'; }
export function buildKopDokumen(userData, pd) { return { sekolah: userData?.sekolah || '-', tahun: userData?.tahun || '2025/2026', jenjang: pd?.jenjang || '-', kelas: pd?.kelas || '-', semester: formatSemester(pd?.semester), mapel: formatMapelName(pd?.mapel), guru: userData?.guru || '-', topik: pd?.topik || '-', fase: getFase(pd?.jenjang, pd?.kelas) }; }
export function generateHeader(kop, type) { const typeNames = { 'cp': 'CAPAIAN PEMBELAJARAN (CP)', 'tp': 'TUJUAN PEMBELAJARAN (TP)', 'atp': 'ALUR TUJUAN PEMBELAJARAN (ATP)' }; let h = '═══════════════════════════════════════════════════════════\n'; h += `                    ${typeNames[type] || 'DOKUMEN'}\n`; h += '                  KURIKULUM MERDEKA\n'; h += '═══════════════════════════════════════════════════════════\n\n'; h += 'INFORMASI DOKUMEN\n'; h += '───────────────────────────────────────────────────────────\n'; h += `Nama Sekolah       : ${kop.sekolah}\n`; h += `Tahun Ajaran       : ${kop.tahun}\n`; h += `Jenjang/Kelas      : ${kop.jenjang?.toUpperCase() || '-'} / Kelas ${kop.kelas}\n`; h += `Fase               : ${kop.fase}\n`; h += `Semester           : ${kop.semester}\n`; h += `Mata Pelajaran     : ${kop.mapel}\n`; h += `Guru Pengampu      : ${kop.guru}\n`; h += `Topik/Materi       : ${kop.topik}\n\n`; return h; }

// ✅ ORIGINAL: Basic validation (preserved)
export function validateInput(d) { const errors = []; if (!d?.sekolah) errors.push('Nama Sekolah wajib'); if (!d?.jenjang) errors.push('Jenjang wajib'); if (!d?.kelas) errors.push('Kelas wajib'); if (!d?.semester) errors.push('Semester wajib'); if (!d?.mapel) errors.push('Mapel wajib'); if (!d?.topik) errors.push('Topik wajib'); return { valid: errors.length === 0, errors }; }

// ✅ UPDATED: Validation with user's assigned classes/mapel filter — MATCH SKEMA 100%
export function validateInputWithFilter(d, userData) {
  // First run basic validation
  const basic = validateInput(d);
  if (!basic.valid) return basic;
  
  // If no userData, return basic validation
  if (!userData) return basic;
  
  const { jenjang_sekolah, kelas_diampu, mapel_yang_diampu, sd_mapel_type, role } = userData;
  
  // ✅ ADMIN: bypass all filters
  if (role === 'admin') return basic;
  
  // ✅ VALIDATE KELAS based on skema
  if (kelas_diampu?.length > 0) {
    // TK: only A/B allowed
    if (jenjang_sekolah === 'tk' && !['A', 'B'].includes(d?.kelas)) {
      return { valid: false, errors: ['Kelas TK hanya A atau B'] };
    }
    
    // SD/MI Guru Kelas: only kelas_diampu allowed
    if (['sd', 'mi'].includes(jenjang_sekolah) && sd_mapel_type === 'kelas') {
      if (!kelas_diampu.includes(d?.kelas)) {
        return { valid: false, errors: [`Kelas ${d?.kelas} tidak termasuk dalam kelas yang Anda ampu`] };
      }
    }
    
    // SD/MI Guru Mapel, SMP/MTs/SMA/MA: all classes in jenjang allowed (no validation needed)
  }
  
  // ✅ VALIDASI MAPEL based on skema
  const mapelLower = d?.mapel?.toLowerCase() || '';
  
  // TK: all mapel allowed (no validation needed)
  
  // SD/MI Guru Kelas: EXCLUDE PAI, PJOK, BD
  if (['sd', 'mi'].includes(jenjang_sekolah) && sd_mapel_type === 'kelas') {
    const excluded = ['pai', 'pjok', 'bd', 'pai/bd', 'pendidikan agama islam', 'pendidikan jasmani'];
    if (excluded.some(ex => mapelLower.includes(ex))) {
      return { valid: false, errors: ['Mapel PAI/BD dan PJOK tidak tersedia untuk Guru Kelas'] };
    }
  }
  
  // SD/MI Guru Mapel: ONLY PAI/PJOK/BD allowed
  if (['sd', 'mi'].includes(jenjang_sekolah) && ['pai', 'pjok', 'bd'].includes(sd_mapel_type)) {
    if (!mapelLower.includes(sd_mapel_type)) {
      return { valid: false, errors: [`Sebagai Guru ${sd_mapel_type.toUpperCase()}, hanya boleh memilih mapel ${sd_mapel_type.toUpperCase()}`] };
    }
  }
  
  // SMP/MTs/SMA/MA: ONLY mapel_yang_diampu allowed
  if (['smp', 'mts', 'sma', 'ma'].includes(jenjang_sekolah) && mapel_yang_diampu?.length > 0) {
    const allowed = mapel_yang_diampu.map(m => m.toLowerCase());
    if (!allowed.some(a => mapelLower.includes(a))) {
      return { valid: false, errors: [`Mapel ${d?.mapel} tidak termasuk dalam mapel yang Anda ampu`] };
    }
  }
  
  return basic;
}

console.log('🟢 [CTA Templates] READY');
