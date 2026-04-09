/**
 * GLOBAL API KEY — SIMPLE & DIRECT
 * 4-6 keys, semua user bisa pakai
 * Export: getNextApiKey (match dengan groq-api.js)
 */

let _cachedKey = null;
let _lastFetch = 0;

/**
 * Fetch & return next API key with simple rotation
 * Export name: getNextApiKey (to match groq-api.js import)
 */
export async function getNextApiKey() {
  // Return cached if fresh (5 menit)
  if (_cachedKey && (Date.now() - _lastFetch) < 300000) {
    return _cachedKey;
  }
  
  try {
    const { db, doc, getDoc } = await import('./firebase-config.js');
    const snap = await getDoc(doc(db, 'settings', 'api_key'));
    
    if (snap.exists()) {
      const data = snap.data();
      const keys = data.keys?.filter(k => k.active && k.value?.startsWith('gsk_')) || [];
      
      if (keys.length > 0) {
        // Simple rotation: pakai key berdasarkan menit
        const index = Math.floor(Date.now() / 60000) % keys.length;
        const key = keys[index];
        _cachedKey = key.value;
        _lastFetch = Date.now();
        
        // Minimal logging untuk debug
        console.log(`✅ [Global API Key] Using: ${key.label || 'key_' + (index+1)}`);
        return _cachedKey;
      }
    }
  } catch (e) {
    console.error('❌ [Global API Key] Error:', e.message);
  }
  
  // Fallback: localStorage (untuk backward compat)
  const localKey = localStorage.getItem('groq_api_key');
  if (localKey) {
    console.log('🔄 [Global API Key] Using localStorage fallback');
    return localKey;
  }
  
  return null;
}

/**
 * Alias: getGlobalApiKey (same function, untuk fleksibilitas)
 * Bisa dipanggil dengan nama mana saja
 */
export const getGlobalApiKey = getNextApiKey;

console.log('🟢 [Global API Key] Module READY');
