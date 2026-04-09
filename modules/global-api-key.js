/**
 * ============================================
 * MODULE: GLOBAL API KEY MANAGER
 * Handle multiple API keys with rotation
 * ============================================
 */

console.log('🔴 [Global API Key] Module START');

let _cachedKeys = null;
let _lastFetch = null;
const CACHE_DURATION_MS = 5 * 60 * 1000;

export async function fetchApiKeysConfig() {
    if (_cachedKeys && _lastFetch && (Date.now() - _lastFetch) < CACHE_DURATION_MS) {
        return _cachedKeys;
    }
    
    try {
        const { db, doc, getDoc } = await import('./firebase-config.js');
        const configDoc = await getDoc(doc(db, 'settings', 'api_key'));
        
        if (configDoc.exists()) {
            const config = configDoc.data();
            
            if (!config.keys || !Array.isArray(config.keys) || config.keys.length === 0) {
                console.warn('⚠️ [Global API Key] No valid keys in config');
                return null;
            }
            
            const activeKeys = config.keys
                .filter(k => k.active && k.value && k.value.startsWith('gsk_'))
                .map(k => ({
                    id: k.id,
                    value: k.value,
                    label: k.label || 'Unnamed'
                }));
            
            if (activeKeys.length === 0) {
                console.warn('⚠️ [Global API Key] No active keys found');
                return null;
            }
            
            _cachedKeys = {
                active: config.active !== false,
                rotation_enabled: config.rotation_enabled !== false,
                keys: activeKeys,
                fallback: config.fallback_key || null
            };
            
            _lastFetch = Date.now();
            console.log(`✅ [Global API Key] Loaded ${activeKeys.length} active key(s)`);
            return _cachedKeys;
            
        } else {
            console.warn('⚠️ [Global API Key] Document not found');
            return null;
        }
        
    } catch (error) {
        console.error('❌ [Global API Key] Error fetching:', error);
        return null;
    }
}

export async function getNextApiKey() {
    const config = await fetchApiKeysConfig();
    
    if (!config || !config.active || config.keys.length === 0) {
        const localKey = localStorage.getItem('groq_api_key');
        if (localKey) {
            return localKey;
        }
        console.error('❌ [Global API Key] No keys available');
        return null;
    }
    
    if (config.rotation_enabled && config.keys.length > 1) {
        const index = Math.floor(Date.now() / 60000) % config.keys.length;
        const key = config.keys[index];
        console.log(`🔄 [Global API Key] Using: ${key.label} (rotation)`);
        return key.value;
    }
    
    const key = config.keys[0];
    console.log(`✅ [Global API Key] Using: ${key.label} (static)`);
    return key.value;
}

export async function getKeysInfo() {
    const config = await fetchApiKeysConfig();
    if (!config) return [];
    return config.keys.map(k => ({
        id: k.id,
        label: k.label,
        value_preview: k.value ? k.value.substring(0, 10) + '...' : 'N/A'
    }));
}

fetchApiKeysConfig();

console.log('🟢 [Global API Key] Module READY');
console.log('💡 Usage: await getNextApiKey()');
