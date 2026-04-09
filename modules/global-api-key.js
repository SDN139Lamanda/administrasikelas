/**
 * GLOBAL API KEY — SIMPLE & DIRECT
 * 4-6 keys, semua user bisa pakai
 */

let _cachedKey = null;
let _lastFetch = 0;

export async function getGlobalApiKey() {
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
        _cachedKey = keys[index].value;
        _lastFetch = Date.now();
        return _cachedKey;
      }
    }
  } catch (e) {
    console.error('❌ Global API Key error:', e.message);
  }
  
  // Fallback: localStorage (untuk backward compat)
  return localStorage.getItem('groq_api_key');
}
