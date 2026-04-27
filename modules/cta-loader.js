/**
 * ============================================
 * MODULE: CTA LOADER
 * Platform Administrasi Kelas Digital
 * ============================================
 * FUNGSI:
 * - Load JSON mock data dari folder data/
 * - Match data berdasarkan jenjang, kelas, mapel, semester
 * - Randomize konten berdasarkan topik
 * - Return CP, TP, ATP yang sudah di-process
 * - Graceful error handling (non-blocking)
 * ============================================
 * ✅ STATUS: Tidak perlu perubahan — filtering handled di UI layer
 */

console.log('🔴 [CTA Loader] Script START');

// ✅ BASE PATH untuk data JSON
const DATA_BASE_PATH = './data';

// ✅ Cache untuk menyimpan data yang sudah di-load
const dataCache = {
  cp: {},
  tp: {},
  atp: {}
};

/**
 * Load JSON file dari folder data/
 * @param {string} jenjang - sd, smp, sma
 * @param {string} kelas - 1-12
 * @param {string} type - cp, tp, atp
 * @returns {Promise<Object|null>} Data JSON yang sudah di-parse, atau null jika tidak ditemukan
 */
async function loadJSONData(jenjang, kelas, type) {
  const cacheKey = `${jenjang}_${kelas}_${type}`;
  
  // ✅ Cek cache dulu (performance optimization)
  if (dataCache[type][cacheKey]) {
    console.log('✅ [CTA Loader] Cache hit:', cacheKey);
    return dataCache[type][cacheKey];
  }
  
  try {
    // ✅ Build URL ke file JSON
    const url = `${DATA_BASE_PATH}/${jenjang}/kelas${kelas}-${type}.json`;
    console.log('📂 [CTA Loader] Loading:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      // ✅ Jangan throw error — return null saja
      console.warn('⚠️ [CTA Loader] JSON not found:', url);
      return null;
    }
    
    const data = await response.json();
    
    // ✅ Simpan ke cache
    dataCache[type][cacheKey] = data;
    console.log('✅ [CTA Loader] Data loaded & cached:', cacheKey);
    
    return data;
    
  } catch (error) {
    // ✅ Graceful error handling — return null, jangan throw
    console.warn('⚠️ [CTA Loader] Error loading JSON:', error.message);
    console.log('💡 [CTA Loader] Will use AI or load on-demand');
    return null;
  }
}

/**
 * Get CP berdasarkan jenjang, kelas, mapel
 * @param {string} jenjang - sd, smp, sma
 * @param {string} kelas - 1-12
 * @param {string} mapel - matematika, ipas, dll
 * @returns {Promise<Object|null>} CP data untuk mapel yang dipilih
 */
export async function getCP(jenjang, kelas, mapel) {
  const data = await loadJSONData(jenjang, kelas, 'cp');
  
  // ✅ Handle null data
  if (!data) {
    console.warn('⚠️ [CTA Loader] CP data not found:', { jenjang, kelas, mapel });
    return null;
  }
  
  if (!data.mapel || !data.mapel[mapel]) {
    console.warn('⚠️ [CTA Loader] Mapel not found:', mapel);
    return null;
  }
  
  return data.mapel[mapel];
}

/**
 * Get TP berdasarkan jenjang, kelas, mapel
 * @param {string} jenjang - sd, smp, sma
 * @param {string} kelas - 1-12
 * @param {string} mapel - matematika, ipas, dll
 * @returns {Promise<Object|null>} TP data untuk mapel yang dipilih
 */
export async function getTP(jenjang, kelas, mapel) {
  const data = await loadJSONData(jenjang, kelas, 'tp');
  
  // ✅ Handle null data
  if (!data) {
    console.warn('⚠️ [CTA Loader] TP data not found:', { jenjang, kelas, mapel });
    return null;
  }
  
  if (!data.mapel || !data.mapel[mapel]) {
    console.warn('⚠️ [CTA Loader] Mapel not found:', mapel);
    return null;
  }
  
  return data.mapel[mapel];
}

/**
 * Get ATP berdasarkan jenjang, kelas, mapel
 * @param {string} jenjang - sd, smp, sma
 * @param {string} kelas - 1-12
 * @param {string} mapel - matematika, ipas, dll
 * @returns {Promise<Object|null>} ATP data untuk mapel yang dipilih
 */
export async function getATP(jenjang, kelas, mapel) {
  const data = await loadJSONData(jenjang, kelas, 'atp');
  
  // ✅ Handle null data
  if (!data) {
    console.warn('⚠️ [CTA Loader] ATP data not found:', { jenjang, kelas, mapel });
    return null;
  }
  
  if (!data.mapel || !data.mapel[mapel]) {
    console.warn('⚠️ [CTA Loader] Mapel not found:', mapel);
    return null;
  }
  
  return data.mapel[mapel];
}

/**
 * Randomize/Select konten berdasarkan topik
 * @param {Object} cpData - Data CP dari JSON
 * @param {Object} tpData - Data TP dari JSON
 * @param {Object} atpData - Data ATP dari JSON
 * @param {string} topik - Topik yang dipilih user
 * @returns {Object} Konten yang sudah di-process
 */
export function processContent(cpData, tpData, atpData, topik) {
  console.log('🔄 [CTA Loader] Processing content for topik:', topik);
  
  // ✅ Format CP
  const cp = formatCP(cpData, topik);
  
  // ✅ Format TP
  const tp = formatTP(tpData, topik);
  
  // ✅ Format ATP
  const atp = formatATP(atpData, topik);
  
  return { cp, tp, atp };
}

/**
 * Format CP menjadi text yang siap ditampilkan
 * @param {Object} cpData - Data CP dari JSON
 * @param {string} topik - Topik yang dipilih
 * @returns {string} Formatted CP text
 */
function formatCP(cpData, topik) {
  if (!cpData) return 'CP data tidak tersedia';
  
  let text = `CAPAIAN PEMBELAJARAN (CP)\n`;
  text += `═══════════════════════════════════════════════════════════\n\n`;
  text += `Fase: ${cpData.fase || '-'}\n`;
  text += `Mata Pelajaran: ${cpData.cp_id || '-'}\n\n`;
  
  if (cpData.elemen && cpData.elemen.length > 0) {
    cpData.elemen.forEach((elemen, index) => {
      text += `${index + 1}. ${elemen.nama}\n`;
      text += `   ${elemen.capaian}\n\n`;
      
      if (elemen.indikator && elemen.indikator.length > 0) {
        text += `   Indikator:\n`;
        elemen.indikator.forEach((ind, i) => {
          text += `   • ${ind}\n`;
        });
        text += `\n`;
      }
    });
  }
  
  return text.trim();
}

/**
 * Format TP menjadi text yang siap ditampilkan
 * @param {Object} tpData - Data TP dari JSON
 * @param {string} topik - Topik yang dipilih
 * @returns {string} Formatted TP text
 */
function formatTP(tpData, topik) {
  if (!tpData) return 'TP data tidak tersedia';
  
  let text = `TUJUAN PEMBELAJARAN (TP)\n`;
  text += `═══════════════════════════════════════════════════════════\n\n`;
  text += `Fase: ${tpData.fase || '-'}\n`;
  text += `Kode: ${tpData.tp_id || '-'}\n\n`;
  
  if (tpData.tujuan_pembelajaran && tpData.tujuan_pembelajaran.length > 0) {
    tpData.tujuan_pembelajaran.forEach((tp, index) => {
      text += `${index + 1}. ${tp.deskripsi}\n`;
      
      if (tp.indikator_pencapaian && tp.indikator_pencapaian.length > 0) {
        text += `   Indikator Pencapaian:\n`;
        tp.indikator_pencapaian.forEach((ind, i) => {
          text += `   • ${ind}\n`;
        });
        text += `\n`;
      }
    });
  }
  
  return text.trim();
}

/**
 * Format ATP menjadi text yang siap ditampilkan
 * @param {Object} atpData - Data ATP dari JSON
 * @param {string} topik - Topik yang dipilih
 * @returns {string} Formatted ATP text
 */
function formatATP(atpData, topik) {
  if (!atpData) return 'ATP data tidak tersedia';
  
  let text = `ALUR TUJUAN PEMBELAJARAN (ATP)\n`;
  text += `═══════════════════════════════════════════════════════════\n\n`;
  text += `Fase: ${atpData.fase || '-'}\n`;
  text += `Kode: ${atpData.atp_id || '-'}\n\n`;
  
  if (atpData.alur_pembelajaran && atpData.alur_pembelajaran.length > 0) {
    atpData.alur_pembelajaran.forEach((minggu) => {
      text += `MINGGU ${minggu.minggu}\n`;
      text += `───────────────────────────────────────────────────────\n`;
      text += `Tujuan: ${minggu.tujuan}\n\n`;
      
      if (minggu.kegiatan && minggu.kegiatan.length > 0) {
        text += `Kegiatan Pembelajaran:\n`;
        minggu.kegiatan.forEach((keg, i) => {
          text += `  ${i + 1}. ${keg}\n`;
        });
        text += `\n`;
      }
      
      if (minggu.asesmen && minggu.asesmen.length > 0) {
        text += `Asesmen:\n`;
        minggu.asesmen.forEach((ases, i) => {
          text += `  • ${ases}\n`;
        });
        text += `\n`;
      }
      
      text += `\n`;
    });
  }
  
  return text.trim();
}

/**
 * Clear cache (untuk development/testing)
 */
export function clearCache() {
  dataCache.cp = {};
  dataCache.tp = {};
  dataCache.atp = {};
  console.log('🗑️ [CTA Loader] Cache cleared');
}

/**
 * ✅ FIXED: Preload data untuk performa lebih baik
 * Tidak throw error — hanya warning jika JSON tidak ada
 * @param {string} jenjang - sd, smp, sma
 * @param {string} kelas - 1-12
 */
export async function preloadData(jenjang, kelas) {
  console.log('⚡ [CTA Loader] Preloading data for', jenjang, kelas);
  
  try {
    await Promise.all([
      loadJSONData(jenjang, kelas, 'cp'),
      loadJSONData(jenjang, kelas, 'tp'),
      loadJSONData(jenjang, kelas, 'atp')
    ]);
    console.log('✅ [CTA Loader] Preload complete');
  } catch (error) {
    // ✅ JANGAN THROW ERROR — Cukup log warning
    console.warn('⚠️ [CTA Loader] Preload failed (some JSON files not found):', error.message);
    console.log('💡 [CTA Loader] Will load on-demand during generate');
    // ✅ TIDAK throw error — biarkan generate handle nanti
  }
}

console.log('🟢 [CTA Loader] READY — Export functions: getCP, getTP, getATP, processContent, preloadData, clearCache');
