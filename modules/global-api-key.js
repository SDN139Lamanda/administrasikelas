/**
 * ============================================
 * MODULE: GLOBAL API KEY MANAGER
 * Handle multiple API keys with rotation
 * ============================================
 */

console.log('🔴 [Global API Key] Module START');

let _cachedKeys = null;
let _lastFetch = null;
let _fetchError = null; // Track last error for debugging
const CACHE_DURATION_MS = 5 * 60 * 1000;

/**
 * Fetch API keys config from Firestore with detailed debug logging
 */
export async function fetchApiKeysConfig() {
    // Return cached if fresh
    if (_cachedKeys && _lastFetch && (Date.now() - _lastFetch) < CACHE_DURATION_MS) {
        console.log('🔄 [Global API Key] Using cached config');
        return _cachedKeys;
    }
    
    try {
        console.log('🔑 [Global API Key] Fetching from Firestore: settings/api_key');
        
        const { db, doc, getDoc } = await import('./firebase-config.js');
        
        const configDoc = await getDoc(doc(db, 'settings', 'api_key'));
        
        if (configDoc.exists()) {
            console.log('✅ [Global API Key] Document found');
            const config = configDoc.data();
            
            // Debug: Log config structure (without exposing keys)
            console.log('📋 [Global API Key] Config structure:', {
                hasKeys: !!config.keys,
                keysIsArray: Array.isArray(config.keys),
                keysLength: config.keys?.length || 0,
                active: config.active,
                rotation_enabled: config.rotation_enabled
            });
            
            if (!config.keys || !Array.isArray(config.keys) || config.keys.length === 0) {
                console.warn('⚠️ [Global API Key] No valid keys in config');
                return null;
            }
            
            // Filter only active keys with valid format
            const activeKeys = config.keys
                .filter(k => {
                    const isValid = k.active && k.value && k.value.startsWith('gsk_');
                    if (!isValid) {
                        console.log('🔍 [Global API Key] Skipping invalid key:', {
                            id: k.id,
                            active: k.active,
                            hasValue: !!k.value,
                            startsWithGsk: k.value?.startsWith('gsk_')
                        });
                    }
                    return isValid;
                })
                .map(k => ({
                    id: k.id,
                    value: k.value,
                    label: k.label || 'Unnamed'
                }));
            
            if (activeKeys.length === 0) {
                console.warn('⚠️ [Global API Key] No active keys found after filtering');
                return null;
            }
            
            _cachedKeys = {
                active: config.active !== false,
                rotation_enabled: config.rotation_enabled !== false,
                keys: activeKeys,
                fallback: config.fallback_key || null
            };
            
            _lastFetch = Date.now();
            _fetchError = null;
            
            console.log(`✅ [Global API Key] Loaded ${activeKeys.length} active key(s)`);
            console.log(`🔑 [Global API Key] Key labels: ${activeKeys.map(k => k.label).join(', ')}`);
            return _cachedKeys;
            
        } else {
            console.warn('⚠️ [Global API Key] Document NOT found at settings/api_key');
            console.warn('💡 [Global API Key] Check: 1) Document exists, 2) Firestore rules allow read');
            _fetchError = 'Document not found';
            return null;
        }
        
    } catch (error) {
        console.error('❌ [Global API Key] Error fetching config:', {
            name: error.name,
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        
        // Help diagnose common issues
        if (error.code === 'permission-denied') {
            console.error('🔐 [Global API Key] PERMISSION DENIED - Check Firestore rules for settings collection');
        } else if (error.code === 'not-found') {
            console.error('📄 [Global API Key] DOCUMENT NOT FOUND - Check if settings/api_key exists');
        }
        
        _fetchError = error.message;
        return null;
    }
}

/**
 * Get next API key with rotation logic
 */
export async function getNextApiKey() {
    const config = await fetchApiKeysConfig();
    
    if (!config || !config.active || config.keys.length === 0) {
        // Fallback to localStorage for backward compatibility
        const localKey = localStorage.getItem('groq_api_key');
        if (localKey && localKey.startsWith('gsk_') && localKey.length >= 20) {
            console.log('🔄 [Global API Key] Using localStorage fallback');
            return localKey;
        }
        
        console.error('❌ [Global API Key] No keys available (global or local)');
        if (_fetchError) {
            console.error(`💡 [Global API Key] Last fetch error: ${_fetchError}`);
        }
        return null;
    }
    
    // If rotation enabled, use timestamp-based round-robin
    if (config.rotation_enabled && config.keys.length > 1) {
        const index = Math.floor(Date.now() / 60000) % config.keys.length;
        const key = config.keys[index];
        console.log(`🔄 [Global API Key] Using: ${key.label} (rotation, index=${index})`);
        return key.value;
    }
    
    // Static: always use first active key
    const key = config.keys[0];
    console.log(`✅ [Global API Key] Using: ${key.label} (static)`);
    return key.value;
}

/**
 * Get all active keys info (for admin dashboard)
 */
export async function getKeysInfo() {
    const config = await fetchApiKeysConfig();
    if (!config) return [];
    
    return config.keys.map(k => ({
        id: k.id,
        label: k.label,
        value_preview: k.value ? k.value.substring(0, 10) + '...' : 'N/A',
        active: true
    }));
}

/**
 * Debug: Force refresh cache (for testing)
 */
export async function refreshKeysCache() {
    console.log('🔄 [Global API Key] Forcing cache refresh...');
    _cachedKeys = null;
    _lastFetch = null;
    return await fetchApiKeysConfig();
}

// ✅ Auto-fetch on module load (for initial caching)
fetchApiKeysConfig();

console.log('🟢 [Global API Key] Module READY');
console.log('💡 Usage: await getNextApiKey()');
console.log('🔧 Debug: await refreshKeysCache()');
