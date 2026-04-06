/**
 * ============================================
 * MODULE: GROQ API INTEGRATION
 * Platform Administrasi Kelas Digital
 * ============================================
 */

console.log('🔴 [Groq API] Script START');

// ✅ GROQ API CONFIG — FIXED MODEL & LIMITS
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-70b-versatile'; // ✅ Model yang stabil & support ID

/**
 * Get Groq API key from localStorage
 */
export function getGroqApiKey() {
  return localStorage.getItem('groq_api_key') || null;
}

/**
 * Save Groq API key to localStorage
 */
export function saveGroqApiKey(key) {
  localStorage.setItem('groq_api_key', key);
  console.log('✅ [Groq API] API key saved');
}

/**
 * Clear Groq API key from localStorage
 */
export function clearGroqApiKey() {
  localStorage.removeItem('groq_api_key');
  console.log('🗑️ [Groq API] API key cleared');
}

/**
 * Check if Groq API key exists and valid
 */
export function hasGroqApiKey() {
  const key = getGroqApiKey();
  return key && key.length >= 20 && key.startsWith('gsk_');
}

/**
 * ✅ FIXED: Build prompt — COMPACT VERSION (under 6000 tokens)
 */
function buildPrompt(data) {
  return `Anda asisten guru Kurikulum Merdeka. Buat CP/TP/ATP singkat.

DATA:
Sekolah: ${data.sekolah} | Jenjang: ${data.jenjang?.toUpperCase()} | Kelas: ${data.kelas}
Semester: ${data.semester === '1' ? '1' : '2'} | Mapel: ${data.mapel} | Topik: ${data.topik}

OUTPUT FORMAT (singkat, jelas):

=== CP ===
Fase: [sesuai kelas]
• [Elemen 1]: [capaian singkat]
  Indikator: • [indikator 1] • [indikator 2]
• [Elemen 2]: [capaian singkat]
  Indikator: • [indikator 1] • [indikator 2]

=== TP ===
• [TP 1]
  Indikator: • [indikator 1] • [indikator 2]
• [TP 2]
  Indikator: • [indikator 1] • [indikator 2]

=== ATP ===
Minggu 1: [tujuan]
• Kegiatan: [kegiatan 1], [kegiatan 2]
• Asesmen: [asesmen]
Minggu 2: [tujuan]
• Kegiatan: [kegiatan 1], [kegiatan 2]
• Asesmen: [asesmen]

Bahasa: Indonesia. Total: ~800 kata.`;
}

/**
 * Test Groq API connection
 */
export async function testGroqConnection() {
  const apiKey = getGroqApiKey();
  if (!apiKey) return { success: false, error: 'API key tidak ditemukan' };
  
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 50
      })
    });
    
    if (response.ok) return { success: true };
    
    const error = await response.json().catch(() => ({}));
    return { 
      success: false, 
      error: response.status === 401 ? 'API Key invalid' : 
             response.status === 429 ? 'Quota habis' : 
             `Error: ${response.status}`
    };
  } catch (e) {
    return { success: false, error: 'Koneksi bermasalah' };
  }
}

/**
 * Call Groq API to generate content
 */
export async function generateWithGroq(inputData) {
  const apiKey = getGroqApiKey();
  
  console.log('🤖 [Groq API] Starting generation...');
  console.log('🔑 [Groq API] Key valid:', hasGroqApiKey());
  console.log('🤖 [Groq API] Model:', GROQ_MODEL);
  
  if (!apiKey || !hasGroqApiKey()) {
    throw new Error('Groq API key tidak valid. Input ulang di modal profil.');
  }
  
  // ✅ Test connection first
  const test = await testGroqConnection();
  if (!test.success) {
    throw new Error(test.error);
  }
  
  const prompt = buildPrompt(inputData);
  console.log('📝 [Groq API] Prompt length:', prompt.length, 'chars');
  
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL, // ✅ Explicit model name
        messages: [
          { role: 'system', content: 'Asisten guru Kurikulum Merdeka. Jawaban singkat, jelas, bahasa Indonesia.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2048, // ✅ Reduced from 4096 to avoid token limit
        top_p: 1,
        stream: false
      })
    });
    
    console.log('📊 [Groq API] Status:', response.status);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      
      if (response.status === 413 || error.error?.code === 'request_too_large') {
        throw new Error('Request terlalu besar. Coba dengan topik lebih spesifik.');
      } else if (response.status === 401) {
        throw new Error('API Key tidak valid. Buat baru di console.groq.com/keys');
      } else if (response.status === 429) {
        throw new Error('Quota Groq habis. Tunggu 24 jam atau buat key baru.');
      } else if (response.status === 404) {
        throw new Error('Model tidak tersedia. Cek console.groq.com/models');
      }
      
      throw new Error(`Groq API Error: ${response.status}`);
    }
    
    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;
    
    if (!aiResponse) throw new Error('Response AI kosong');
    
    console.log('✅ [Groq API] Response received:', aiResponse.length, 'chars');
    
    return parseGroqResponse(aiResponse);
    
  } catch (error) {
    console.error('❌ [Groq API] Error:', error.message);
    
    if (error.name === 'TypeError') {
      throw new Error('Koneksi internet bermasalah.');
    }
    
    throw error;
  }
}

/**
 * Parse Groq response
 */
function parseGroqResponse(text) {
  let cp = '', tp = '', atp = '';
  
  try {
    const cpIdx = text.indexOf('=== CP ===');
    const tpIdx = text.indexOf('=== TP ===');
    const atpIdx = text.indexOf('=== ATP ===');
    
    if (cpIdx !== -1 && tpIdx !== -1) cp = text.substring(cpIdx, tpIdx).trim();
    else if (cpIdx !== -1) cp = text.substring(cpIdx).split('===')[0].trim();
    
    if (tpIdx !== -1 && atpIdx !== -1) tp = text.substring(tpIdx, atpIdx).trim();
    else if (tpIdx !== -1) tp = text.substring(tpIdx).split('===')[0].trim();
    
    if (atpIdx !== -1) atp = text.substring(atpIdx).trim();
    
    if (!cp && !tp && !atp) {
      const parts = text.split(/\n\s*\n/).filter(p => p.trim());
      if (parts.length >= 3) {
        const third = Math.ceil(parts.length / 3);
        cp = parts.slice(0, third).join('\n\n');
        tp = parts.slice(third, third*2).join('\n\n');
        atp = parts.slice(third*2).join('\n\n');
      } else {
        cp = text;
      }
    }
  } catch (e) {
    console.error('❌ Parse error:', e);
    cp = text;
  }
  
  return { cp: cp || text, tp: tp || '', atp: atp || '' };
}

console.log('🟢 [Groq API] READY — Model: llama-3.1-70b-versatile, max_tokens: 2048');
