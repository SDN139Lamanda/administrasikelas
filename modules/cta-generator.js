// ✅ FINAL FIX: validateInputWithFilter() - Handle 'mapel' generic type
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
    mapel_diampu,  // ✅ Support field name Firebase Anda
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
  
  // ============================================
  // ✅ VALIDATE MAPEL based on skema (FIXED)
  // ============================================
  
  // TK: all mapel allowed (no validation needed)
  
  // SD/MI Guru Kelas: EXCLUDE PAIBD & PJOK
  if (['sd', 'mi'].includes(jenjang_sekolah) && sd_mapel_type?.toLowerCase() === 'kelas') {
    const excluded = ['paibd', 'pjok', 'pendidikan agama', 'pendidikan jasmani', 'budi pekerti'];
    if (excluded.some(ex => mapelLower.includes(ex))) {
      return { 
        valid: false, 
        errors: ['Mapel PAIBD dan PJOK tidak tersedia untuk Guru Kelas. Silakan pilih mapel umum.'] 
      };
    }
  }
  
  // ✅ SD/MI Guru Mapel: Handle 'mapel' generic type + use actual assigned subjects
  if (['sd', 'mi'].includes(jenjang_sekolah) && sd_mapel_type && sd_mapel_type.toLowerCase() !== 'kelas') {
    
    // Determine allowed subjects
    let allowedSubjects = [];
    
    // Jika sd_mapel_type = 'mapel' (generic), pakai array assigned subjects
    if (sd_mapel_type.toLowerCase() === 'mapel') {
      // Support BOTH field names: mapel_diampu (Firebase Anda) atau mapel_yang_diampu (kode lama)
      const assigned = mapel_diampu?.length > 0 ? mapel_diampu : mapel_yang_diampu || [];
      allowedSubjects = assigned.map(s => (s || '').toLowerCase());
    } 
    // Jika sd_mapel_type spesifik (paibd/pjok), pakai itu
    else {
      allowedSubjects = [sd_mapel_type.toLowerCase()];
    }
    
    // Jika ada allowed subjects, validasi input user
    if (allowedSubjects.length > 0) {
      // Flexible matching: cek apakah input user match dengan salah satu allowed subject
      const isAllowed = allowedSubjects.some(allowed => 
        mapelLower.includes(allowed) || allowed.includes(mapelLower)
      );
      
      if (!isAllowed) {
        // Format allowed subjects untuk error message
        const allowedNames = allowedSubjects.map(s => formatMapelName(s)).join(', ');
        return { 
          valid: false, 
          errors: [`Sebagai Guru, Anda hanya dapat memilih mapel: ${allowedNames}`] 
        };
      }
    }
    // Jika tidak ada allowed subjects, skip validation (fallback)
  }
  
  // SMP/MTs/SMA/MA: ONLY allow mapel_yang_diampu
  if (['smp', 'mts', 'sma', 'ma'].includes(jenjang_sekolah)) {
    const assigned = mapel_diampu?.length > 0 ? mapel_diampu : mapel_yang_diampu || [];
    if (assigned.length > 0) {
      const allowed = assigned.map(m => (m || '').toLowerCase());
      if (!allowed.some(a => mapelLower.includes(a) || a.includes(mapelLower))) {
        const allowedNames = allowed.map(m => formatMapelName(m)).join(', ');
        return { 
          valid: false, 
          errors: [`Mapel "${d?.mapel}" tidak termasuk dalam mapel yang Anda ampu. Mapel tersedia: ${allowedNames}`] 
        };
      }
    }
  }
  
  // ✅ All validations passed
  return basic;
}
