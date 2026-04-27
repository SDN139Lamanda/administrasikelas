/**
 * ============================================
 * MODULE: CTA LOADER
 * Folder: modules/cta-generator/cta-loader.js
 * Platform Administrasi Kelas Digital
 * ============================================
 * FUNGSI:
 * - Load data CP/TP/ATP dari JSON lokal atau Firestore
 * - Match data berdasarkan jenjang, kelas, mapel, semester
 * - Graceful fallback jika data tidak ditemukan
 * - Cache management untuk performa
 * ============================================
 */

console.log('🔴 [CTA Loader] Script START');

// ✅ BASE PATH untuk data JSON lokal
const DATA_BASE_PATH = './data';

// ✅ Cache untuk menyimpan data yang sudah di-load
const dataCache = {
  cp: {},
  tp: {},
  atp: {}
};

// ============================================
// ✅ LOAD JSON FILE DARI LOKAL
// ============================================

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
      // ✅ Jangan throw error — return null saja (graceful fallback)
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
    console.log('💡 [CTA Loader] Will use AI generation as fallback');
    return null;
  }
}

// ============================================
// ✅ GET CP DATA
// ============================================

export async function getCP(jenjang, kelas, mapel) {
  const data = await loadJSONData(jenjang, kelas, 'cp');
  
  // ✅ Handle null data
  if (!data) {
    console.warn('⚠️ [CTA Loader] CP data not found:', { jenjang, kelas, mapel });
    return null;
  }
  
  if (!data.mapel || !data.mapel[mapel]) {
    console.warn('⚠️ [CTA Loader] Mapel not found in CP data:', mapel);
    return null;
  }
  
  return data.mapel[mapel];
}

// ============================================
// ✅ GET TP DATA
// ============================================

export async function getTP(jenjang, kelas, mapel) {
  const data = await loadJSONData(jenjang, kelas, 'tp');
  
  if (!data) {
    console.warn('⚠️ [CTA Loader] TP data not found:', { jenjang, kelas, mapel });
    return null;
  }
  
  if (!data.mapel || !data.mapel[mapel]) {
    console.warn('⚠️ [CTA Loader] Mapel not found in TP data:', mapel);
    return null;
  }
  
  return data.mapel[mapel];
}

// ============================================
// ✅ GET ATP DATA
// ============================================

export async function getATP(jenjang, kelas, mapel) {
  const data = await loadJSONData(jenjang, kelas, 'atp');
  
  if (!data) {
    console.warn('⚠️ [CTA Loader] ATP data not found:', { jenjang, kelas, mapel });
    return null;
  }
  
  if (!data.mapel || !data.mapel[mapel]) {
    console.warn('⚠️ [CTA Loader] Mapel not found in ATP data:', mapel);
    return null;
  }
  
  return data.mapel[mapel];
}

// ============================================
// ✅ PROCESS CONTENT: Format CP/TP/ATP for display
// ============================================

export function processContent(cpData, tpData, atpData, topik) {
  console.log('🔄 [CTA Loader] Processing content for topik:', topik);
  
  return {
    cp: formatCP(cpData, topik),
    tp: formatTP(tpData, topik),
    atp: formatATP(atpData, topik)
  };
}

// ============================================
// ✅ FORMAT CP FOR DISPLAY
// ============================================

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

// ============================================
// ✅ FORMAT TP FOR DISPLAY
// ============================================

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

// ============================================
// ✅ FORMAT ATP FOR DISPLAY
// ============================================

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

// ============================================
// ✅ CLEAR CACHE (for development/testing)
// ============================================

export function clearCache() {
  dataCache.cp = {};
  dataCache.tp = {};
  dataCache.atp = {};
  console.log('🗑️ [CTA Loader] Cache cleared');
}

// ============================================
// ✅ PRELOAD DATA (for performance)
// ============================================

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
  }
}

console.log('🟢 [CTA Loader] READY — Export: getCP, getTP, getATP, processContent, preloadData, clearCache');
