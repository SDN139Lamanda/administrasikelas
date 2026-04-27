/**
 * ============================================
 * MODULE: CTA TEMPLATES
 * Folder: modules/cta-generator/cta-templates.js
 * Platform Administrasi Kelas Digital
 * ============================================
 * FUNGSI:
 * - Helper formatting (jenjang, semester, mapel)
 * - Validasi input sesuai skema akses user
 * - Build header dokumen CP/TP/ATP
 * ============================================
 */

console.log('🔴 [CTA Templates] Script START');

// ============================================
// ✅ HELPER: BUILD/PARSE MATCHING KEY
// ============================================

export function buildMatchingKey(jenjang, kelas, mapel, semester) {
  return `${jenjang}_${kelas}_${mapel}_${semester}`;
}

export function parseMatchingKey(key) {
  const parts = key.split('_');
  return {
    jenjang: parts[0] || '',
    kelas: parts[1] || '',
    mapel: parts[2] || '',
    semester: parts[3] || ''
  };
}

// ============================================
// ✅ HELPER: GET FASE BASED ON JENJANG + KELAS
// ============================================

export function getFase(jenjang, kelas) {
  const k = parseInt(kelas, 10);
  if (jenjang === 'sd' || jenjang === 'mi') {
    if (k <= 2) return 'A';
    if (k <= 4) return 'B';
    return 'C';
  } else if (jenjang === 'smp' || jenjang === 'mts') {
    return 'D';
  } else if (jenjang === 'sma' || jenjang === 'ma') {
    return k === 10 ? 'E' : 'F';
  }
  return '-';
}

// ============================================
// ✅ HELPER: FORMAT MAPEL NAME (DISPLAY)
// ============================================

export function formatMapelName(mapel) {
  if (!mapel) return '-';
  const names = {
    'matematika': 'Matematika',
    'bahasa indonesia': 'Bahasa Indonesia',
    'ipa': 'IPA',
    'ips': 'IPS',
    'ipas': 'IPAS',
    'pjok': 'PJOK',
    'paibd': 'PAIBD',
    'pendidikan agama islam': 'Pendidikan Agama Islam',
    'pendidikan jasmani': 'Pendidikan Jasmani',
    'pkn': 'PKn',
    'bahasa inggris': 'Bahasa Inggris',
    'seni budaya': 'Seni Budaya',
    'prakarya': 'Prakarya',
    'lainnya': 'Lainnya'
  };
  const key = mapel.toLowerCase().trim();
  return names[key] || mapel;
}

// ============================================
// ✅ HELPER: FORMAT SEMESTER LABEL
// ============================================

export function formatSemester(s) {
  if (!s) return '-';
  return s === '1' ? '1 (Ganjil)' : '2 (Genap)';
}

// ============================================
// ✅ HELPER: BUILD KOP DOKUMEN
// ============================================

export function buildKopDokumen(userData, pd) {
  return {
    sekolah: userData?.sekolah || '-',
    tahun: userData?.tahun || '2025/2026',
    jenjang: pd?.jenjang || '-',
    kelas: pd?.kelas || '-',
    semester: formatSemester(pd?.semester),
    mapel: formatMapelName(pd?.mapel),
    guru: userData?.guru || '-',
    topik: pd?.topik || '-',
    fase: getFase(pd?.jenjang, pd?.kelas)
  };
}

// ============================================
// ✅ HELPER: GENERATE HEADER DOKUMEN
// ============================================

export function generateHeader(kop, type) {
  const typeNames = {
    'cp': 'CAPAIAN PEMBELAJARAN (CP)',
    'tp': 'TUJUAN PEMBELAJARAN (TP)',
    'atp': 'ALUR TUJUAN PEMBELAJARAN (ATP)'
  };
  
  let h = '═══════════════════════════════════════════════════════════\n';
  h += `                    ${typeNames[type] || 'DOKUMEN'}\n`;
  h += '                  KURIKULUM MERDEKA\n';
  h += '═══════════════════════════════════════════════════════════\n\n';
  h += 'INFORMASI DOKUMEN\n';
  h += '───────────────────────────────────────────────────────────\n';
  h += `Nama Sekolah       : ${kop.sekolah}\n`;
  h += `Tahun Ajaran       : ${kop.tahun}\n`;
  h += `Jenjang/Kelas      : ${kop.jenjang?.toUpperCase() || '-'} / Kelas ${kop.kelas}\n`;
  h += `Fase               : ${kop.fase}\n`;
  h += `Semester           : ${kop.semester}\n`;
  h += `Mata Pelajaran     : ${kop.mapel}\n`;
  h += `Guru Pengampu      : ${kop.guru}\n`;
  h += `Topik/Materi       : ${kop.topik}\n\n`;
  return h;
}

// ============================================
// ✅ VALIDATION: BASIC INPUT CHECK
// ============================================

export function validateInput(d) {
  const errors = [];
  if (!d?.sekolah) errors.push('Nama Sekolah wajib diisi');
  if (!d?.jenjang) errors.push('Jenjang wajib dipilih');
  if (!d?.kelas) errors.push('Kelas wajib dipilih');
  if (!d?.semester) errors.push('Semester wajib dipilih');
  if (!d?.mapel) errors.push('Mata Pelajaran wajib dipilih');
  if (!d?.topik) errors.push('Topik/Materi wajib diisi');
  return { valid: errors.length === 0, errors };
}

// ============================================
// ✅ VALIDATION: WITH USER ACCESS FILTER (SKEMA COMPLIANT)
// ============================================

export function validateInputWithFilter(d, userData) {
  // Step 1: Basic validation
  const basic = validateInput(d);
  if (!basic.valid) return basic;
  
  // Step 2: If no userData, return basic (no filter)
  if (!userData) return basic;
  
  const {
    jenjang_sekolah,
    kelas_diampu,
    mapel_yang_diampu,
    sd_mapel_type,
    role
  } = userData;
  
  const mapelLower = (d?.mapel || '').toLowerCase();
  
  // ✅ ADMIN: bypass all filters
  if (role === 'admin') return basic;
  
  // ============================================
  // ✅ VALIDATE KELAS based on skema
  // ============================================
  
  // TK: only A or B
  if (jenjang_sekolah === 'tk' && !['A', 'B'].includes(d?.kelas)) {
    return { valid: false, errors: ['Kelas TK hanya tersedia: A atau B'] };
  }
  
  // SD/MI Guru Kelas: only assigned classes
  if (['sd', 'mi'].includes(jenjang_sekolah) && sd_mapel_type?.toLowerCase() === 'kelas') {
    if (!kelas_diampu?.includes(d?.kelas)) {
      return { 
        valid: false, 
        errors: [`Kelas ${d?.kelas} tidak termasuk dalam kelas yang Anda ampu. Kelas tersedia: ${kelas_diampu?.join(', ') || '-'}`] 
      };
    }
  }
  
  // SD/MI Guru Mapel, SMP/MTs/SMA/MA: all classes in jenjang allowed (no validation needed here)
  
  // ============================================
  // ✅ VALIDATE MAPEL based on skema
  // ============================================
  
  // TK: all mapel allowed (no validation needed)
  
  // SD/MI Guru Kelas: EXCLUDE PAIBD & PJOK
  if (['sd', 'mi'].includes(jenjang_sekolah) && sd_mapel_type?.toLowerCase() === 'kelas') {
    const excluded = ['paibd', 'pjok', 'pendidikan agama', 'pendidikan jasmani'];
    if (excluded.some(ex => mapelLower.includes(ex))) {
      return { 
        valid: false, 
        errors: ['Mapel PAIBD dan PJOK tidak tersedia untuk Guru Kelas. Silakan pilih mapel umum.'] 
      };
    }
  }
  
  // SD/MI Guru Mapel: ONLY allow their specific subject (PAIBD or PJOK)
  if (['sd', 'mi'].includes(jenjang_sekolah) && sd_mapel_type && sd_mapel_type.toLowerCase() !== 'kelas') {
    const targetType = sd_mapel_type.toLowerCase();
    // Flexible matching: check both directions
    if (!mapelLower.includes(targetType) && !targetType.includes(mapelLower)) {
      return { 
        valid: false, 
        errors: [`Sebagai Guru ${sd_mapel_type.toUpperCase()}, Anda hanya dapat memilih mapel ${formatMapelName(sd_mapel_type)}`] 
      };
    }
  }
  
  // SMP/MTs/SMA/MA: ONLY allow mapel_yang_diampu
  if (['smp', 'mts', 'sma', 'ma'].includes(jenjang_sekolah) && mapel_yang_diampu?.length > 0) {
    const allowed = mapel_yang_diampu.map(m => (m || '').toLowerCase());
    if (!allowed.some(a => mapelLower.includes(a) || a.includes(mapelLower))) {
      return { 
        valid: false, 
        errors: [`Mapel "${d?.mapel}" tidak termasuk dalam mapel yang Anda ampu. Mapel tersedia: ${mapel_yang_diampu.join(', ')}`] 
      };
    }
  }
  
  // ✅ All validations passed
  return basic;
}

// ============================================
// ✅ HELPER: CHECK IF MAPEL IS ALLOWED FOR USER
// (For dropdown filtering in cta-generator.js)
// ============================================

export function isMapelAllowedForUser(mapelNama, userData) {
  if (!userData) return true;
  if (userData.role === 'admin') return true;
  
  const { jenjang_sekolah, sd_mapel_type, mapel_yang_diampu } = userData;
  const namaLower = (mapelNama || '').toLowerCase();
  
  // TK: all allowed
  if (jenjang_sekolah === 'tk') return true;
  
  // SD/MI Guru Kelas: exclude PAIBD/PJOK
  if (['sd', 'mi'].includes(jenjang_sekolah) && sd_mapel_type?.toLowerCase() === 'kelas') {
    const excluded = ['paibd', 'pjok', 'pendidikan agama', 'pendidikan jasmani'];
    return !excluded.some(ex => namaLower.includes(ex));
  }
  
  // SD/MI Guru Mapel: only their subject
  if (['sd', 'mi'].includes(jenjang_sekolah) && sd_mapel_type && sd_mapel_type.toLowerCase() !== 'kelas') {
    const target = sd_mapel_type.toLowerCase();
    return namaLower.includes(target) || target.includes(namaLower);
  }
  
  // SMP/MTs/SMA/MA: only assigned mapel
  if (['smp', 'mts', 'sma', 'ma'].includes(jenjang_sekolah) && mapel_yang_diampu?.length > 0) {
    const allowed = mapel_yang_diampu.map(m => (m || '').toLowerCase());
    return allowed.some(a => namaLower.includes(a) || a.includes(namaLower));
  }
  
  // Default: allow
  return true;
}

console.log('🟢 [CTA Templates] READY — SKEMA COMPLIANT + ROBUST VALIDATION');
