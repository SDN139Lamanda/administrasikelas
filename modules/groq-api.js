/**
 * ============================================
 * MODULE: GROQ API INTEGRATION
 * Platform Administrasi Kelas Digital
 * ============================================
 */

console.log('🔴 [Groq API] Script START');

// ✅ GROQ API CONFIG — UPDATED ENDPOINT & MODEL
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-70b-versatile'; // ✅ Model lebih stabil

/**
 * Get Groq API key from localStorage
 */
export function getGroqApiKey() {
  const key = localStorage.getItem('groq_api_key');
  return key || null;
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
  // ✅ Valid Groq key: starts with 'gsk_' and min 20 chars
  const valid = key && key.length >= 20 && key.startsWith('gsk_');
  console.log('🔑 [Groq API] Has valid key:', valid);
  console.log('🔑 [Groq API] Key length:', key?.length);
  console.log('🔑 [Groq API] Key starts with gsk_:', key?.startsWith('gsk_'));
  return valid;
}

/**
 * Build prompt for CP/TP/ATP generation
 */
function buildPrompt(data) {
  return `Anda adalah asisten guru profesional yang ahli dalam Kurikulum Merdeka Indonesia.

Tugas: Buat dokumen CP/TP/ATP lengkap untuk pembelajaran.

DATA PEMBELAJARAN:
- Sekolah: ${data.sekolah}
- Jenjang: ${data.jenjang?.toUpperCase() || '-'}
- Kelas: ${data.kelas || '-'}
- Semester: ${data.semester === '1' ? '1 (Ganjil)' : '2 (Genap)'}
- Mata Pelajaran: ${data.mapel || '-'}
- Topik/Materi: ${data.topik || '-'}
- Guru: ${data.guru || '-'}
- Tahun Ajaran: ${data.tahun || '2025/2026'}

FORMAT OUTPUT (WAJIB IKUTI STRUKTUR INI):

═══════════════════════════════════════════════════════════
CAPAIAN PEMBELAJARAN (CP)
═══════════════════════════════════════════════════════════

Fase: [Fase sesuai kelas]
Elemen:
1. [Nama Elemen]
   [Deskripsi capaian pembelajaran detail minimal 100 kata]
   Indikator:
   • [Indikator 1]
   • [Indikator 2]

[Minimal 3 elemen sesuai mapel]

═══════════════════════════════════════════════════════════
TUJUAN PEMBELAJARAN (TP)
═══════════════════════════════════════════════════════════

[Minimal 5-8 tujuan pembelajaran]

═══════════════════════════════════════════════════════════
ALUR TUJUAN PEMBELAJARAN (ATP)
═══════════════════════════════════════════════════════════

[Minimal 8-12 minggu dengan kegiatan dan asesmen]

Bahasa: Indonesia formal.
Panjang: Minimal 1500 kata.`;
}

/**
 * ✅ TEST API KEY FIRST — Before generate
 */
export async function testGroqConnection() {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    console.error('❌ [Groq API] No API key for test');
    return { success: false, error: 'API key tidak ditemukan' };
  }
  
  console.log('🧪 [Groq API] Testing connection...');
  
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
        max_tokens: 10
      })
    });
    
    console.log('📊 [Groq API] Test response:', response.status);
    
    if (response.ok) {
      console.log('✅ [Groq API] Connection successful!');
      return { success: true };
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ [Groq API] Test failed:', errorData);
      
      if (response.status === 401) {
        return { success: false, error: 'API Key tidak valid (401)' };
      } else if (response.status === 404) {
        return { success: false, error: 'API endpoint tidak ditemukan (404)' };
      } else if (response.status === 429) {
        return { success: false, error: 'Quota API habis (429)' };
      } else {
        return { success: false, error: `Groq API Error: ${response.status}` };
      }
    }
  } catch (error) {
    console.error('❌ [Groq API] Test error:', error);
    return { success: false, error: 'Koneksi internet bermasalah' };
  }
}

/**
 * Call Groq API to generate content
 */
export async function generateWithGroq(inputData) {
  const apiKey = getGroqApiKey();
  
  console.log('🤖 [Groq API] Starting generation...');
  console.log('🔑 [Groq API] API Key exists:', !!apiKey);
  console.log('🔑 [Groq API] API Key length:', apiKey?.length);
  console.log('🔑 [Groq API] API Key starts with gsk_:', apiKey?.startsWith('gsk_'));
  
  // ✅ VALIDATE API KEY
  if (!apiKey) {
    console.error('❌ [Groq API] No API key!');
    throw new Error('Groq API key tidak ditemukan. Silakan input API key di modal profil.');
  }
  
  if (!apiKey.startsWith('gsk_')) {
    console.error('❌ [Groq API] Invalid key format!');
    throw new Error('Groq API key tidak valid (harus dimulai dengan gsk_)');
  }
  
  if (apiKey.length < 20) {
    console.error('❌ [Groq API] Key too short!');
    throw new Error('Groq API key terlalu pendek. Copy ulang dari console.groq.com');
  }
  
  // ✅ TEST CONNECTION FIRST
  console.log('🧪 [Groq API] Testing connection before generate...');
  const testResult = await testGroqConnection();
  if (!testResult.success) {
    console.error('❌ [Groq API] Connection test failed:', testResult.error);
    throw new Error(testResult.error);
  }
  console.log('✅ [Groq API] Connection test passed!');
  
  const prompt = buildPrompt(inputData);
  
  console.log('🌐 [Groq API] URL:', GROQ_API_URL);
  console.log('🤖 [Groq API] Model:', GROQ_MODEL);
  console.log('📝 [Groq API] Input:', { 
    jenjang: inputData.jenjang, 
    kelas: inputData.kelas, 
    mapel: inputData.mapel 
  });
  
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          {
            role: 'system',
            content: 'Anda adalah asisten guru profesional yang ahli dalam Kurikulum Merdeka Indonesia. Buat dokumen CP/TP/ATP lengkap, detail, dan sesuai standar Kemendikbudristek.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4096,
        top_p: 1,
        stream: false
      })
    });
    
    console.log('📊 [Groq API] Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ [Groq API] API Error:', errorData);
      
      let errorMessage = `Groq API Error: ${response.status}`;
      
      if (response.status === 401) {
        errorMessage = 'API Key TIDAK VALID. Silakan: 1) Buka console.groq.com/keys 2) Buat API key baru 3) Input ulang di modal profil';
      } else if (response.status === 404) {
        errorMessage = 'API endpoint tidak ditemukan. Kemungkinan: 1) API key invalid 2) Model tidak tersedia. Coba buat API key baru di console.groq.com';
      } else if (response.status === 429) {
        errorMessage = 'Quota Groq API habis (14,400 req/hari). Tunggu 24 jam atau buat API key baru.';
      } else if (response.status === 500) {
        errorMessage = 'Groq server error. Coba lagi nanti.';
      }
      
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log('✅ [Groq API] Response received:', data);
    
    const aiResponse = data.choices?.[0]?.message?.content;
    
    if (!aiResponse) {
      console.error('❌ [Groq API] Empty response!');
      throw new Error('Response AI kosong');
    }
    
    console.log('📝 [Groq API] Response length:', aiResponse.length);
    
    // Parse response
    return parseGroqResponse(aiResponse);
    
  } catch (error) {
    console.error('❌ [Groq API] Error:', error.name, error.message);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Koneksi internet bermasalah. Cek koneksi HP Anda.');
    }
    
    throw error;
  }
}

/**
 * Parse Groq response into CP, TP, ATP sections
 */
function parseGroqResponse(text) {
  console.log('🔍 [Groq API] Parsing response...');
  
  let cp = '', tp = '', atp = '';
  
  try {
    const cpMarkers = ['CAPAIAN PEMBELAJARAN', 'CAPAIAN PEMBELAJARAN (CP)'];
    const tpMarkers = ['TUJUAN PEMBELAJARAN', 'TUJUAN PEMBELAJARAN (TP)'];
    const atpMarkers = ['ALUR TUJUAN PEMBELAJARAN', 'ALUR TUJUAN PEMBELAJARAN (ATP)'];
    
    let cpIndex = -1, tpIndex = -1, atpIndex = -1;
    
    cpMarkers.forEach(m => { const i = text.indexOf(m); if (i !== -1 && (cpIndex === -1 || i < cpIndex)) cpIndex = i; });
    tpMarkers.forEach(m => { const i = text.indexOf(m); if (i !== -1 && (tpIndex === -1 || i < tpIndex)) tpIndex = i; });
    atpMarkers.forEach(m => { const i = text.indexOf(m); if (i !== -1 && (atpIndex === -1 || i < atpIndex)) atpIndex = i; });
    
    console.log('📍 [Groq API] Markers:', { cpIndex, tpIndex, atpIndex });
    
    if (cpIndex !== -1) {
      const end = (tpIndex !== -1 && tpIndex > cpIndex) ? tpIndex : (atpIndex !== -1 ? atpIndex : text.length);
      cp = text.substring(cpIndex, end).trim();
    }
    if (tpIndex !== -1) {
      const end = (atpIndex !== -1 && atpIndex > tpIndex) ? atpIndex : text.length;
      tp = text.substring(tpIndex, end).trim();
    }
    if (atpIndex !== -1) {
      atp = text.substring(atpIndex).trim();
    }
    
    if (!cp && !tp && !atp) {
      console.log('⚠️ [Groq API] Markers not found, using fallback');
      const parts = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
      if (parts.length >= 3) {
        const third = Math.ceil(parts.length / 3);
        cp = parts.slice(0, third).join('\n\n');
        tp = parts.slice(third, third * 2).join('\n\n');
        atp = parts.slice(third * 2).join('\n\n');
      } else {
        cp = text;
      }
    }
    
    console.log('✅ [Groq API] Parse result:', { cpLength: cp.length, tpLength: tp.length, atpLength: atp.length });
    
  } catch (e) {
    console.error('❌ [Groq API] Parse error:', e);
    cp = text;
  }
  
  return { cp: cp || text, tp: tp || '', atp: tp || '' };
}

console.log('🟢 [Groq API] READY — Model: llama-3.1-70b-versatile');
