/**
 * ============================================
 * MODULE: GROQ API INTEGRATION
 * Platform Administrasi Kelas Digital
 * ============================================
 * FUNGSI:
 * - Call Groq API dengan Llama 3.2 model
 * - Generate CP/TP/ATP dengan AI
 * - Error handling & fallback
 * ============================================
 */

console.log('🔴 [Groq API] Script START');

// ✅ GROQ API CONFIG
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.2-70b-versatile';

/**
 * Get Groq API key from localStorage
 * @returns {string|null} API key or null
 */
export function getGroqApiKey() {
  return localStorage.getItem('groq_api_key') || null;
}

/**
 * Save Groq API key to localStorage
 * @param {string} key - API key
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
 * @returns {boolean} True if key exists
 */
export function hasGroqApiKey() {
  const key = getGroqApiKey();
  return key && key.length > 10;
}

/**
 * Build prompt for CP/TP/ATP generation
 * @param {Object} data - Input data from form
 * @returns {string} Formatted prompt
 */
function buildPrompt(data) {
  return `Anda adalah asisten guru profesional yang ahli dalam Kurikulum Merdeka Indonesia.

Tugas: Buat dokumen CP/TP/ATP lengkap untuk pembelajaran.

DATA PEMBELAJARAN:
- Sekolah: ${data.sekolah}
- Jenjang: ${data.jenjang.toUpperCase()}
- Kelas: ${data.kelas}
- Semester: ${data.semester === '1' ? '1 (Ganjil)' : '2 (Genap)'}
- Mata Pelajaran: ${data.mapel}
- Topik/Materi: ${data.topik}
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
   • [Indikator 3]

[Minimal 4 elemen sesuai mapel]

═══════════════════════════════════════════════════════════
TUJUAN PEMBELAJARAN (TP)
═══════════════════════════════════════════════════════════

[Minimal 8-10 tujuan pembelajaran dengan format:]
1. [Deskripsi TP]
   Indikator Pencapaian:
   • [Indikator 1]
   • [Indikator 2]

═══════════════════════════════════════════════════════════
ALUR TUJUAN PEMBELAJARAN (ATP)
═══════════════════════════════════════════════════════════

[Minimal 12-15 minggu dengan format:]
MINGGU [X]
───────────────────────────────────────────────────────
Tujuan: [Tujuan pembelajaran minggu ini]

Kegiatan Pembelajaran:
  1. [Kegiatan 1]
  2. [Kegiatan 2]
  3. [Kegiatan 3]

Asesmen:
  • [Asesmen 1]
  • [Asesmen 2]

Bahasa: Indonesia formal, sesuai standar Kemendikbudristek.
Referensi: Kurikulum Merdeka 2022.
Panjang: Minimal 1500 kata total.`;
}

/**
 * Call Groq API to generate content
 * @param {Object} inputData - Form data
 * @returns {Promise<Object>} {cp, tp, atp}
 */
export async function generateWithGroq(inputData) {
  const apiKey = getGroqApiKey();
  
  if (!apiKey) {
    throw new Error('Groq API key tidak ditemukan. Silakan input API key di modal.');
  }
  
  console.log('🤖 [Groq API] Calling Groq API...');
  
  const prompt = buildPrompt(inputData);
  
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
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Groq API Error: ${error.message || response.status}`);
    }
    
    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;
    
    if (!aiResponse) {
      throw new Error('Response AI kosong');
    }
    
    console.log('✅ [Groq API] Response received');
    
    // Parse response
    return parseGroqResponse(aiResponse);
    
  } catch (error) {
    console.error('❌ [Groq API] Error:', error);
    throw error;
  }
}

/**
 * ✅ FIXED: Parse Groq response into CP, TP, ATP sections
 * Menggunakan string methods (indexOf/substring) yang lebih aman
 * @param {string} text - AI response text
 * @returns {Object} {cp, tp, atp}
 */
function parseGroqResponse(text) {
  let cp = '', tp = '', atp = '';
  
  try {
    // ✅ Extract sections using safe string methods
    const cpMarker = 'CAPAIAN PEMBELAJARAN';
    const tpMarker = 'TUJUAN PEMBELAJARAN';
    const atpMarker = 'ALUR TUJUAN PEMBELAJARAN';
    
    const cpIndex = text.indexOf(cpMarker);
    const tpIndex = text.indexOf(tpMarker);
    const atpIndex = text.indexOf(atpMarker);
    
    // Extract CP
    if (cpIndex !== -1) {
      if (tpIndex !== -1 && tpIndex > cpIndex) {
        cp = text.substring(cpIndex, tpIndex).trim();
      } else if (atpIndex !== -1 && atpIndex > cpIndex) {
        cp = text.substring(cpIndex, atpIndex).trim();
      } else {
        cp = text.substring(cpIndex).trim();
      }
    }
    
    // Extract TP
    if (tpIndex !== -1) {
      if (atpIndex !== -1 && atpIndex > tpIndex) {
        tp = text.substring(tpIndex, atpIndex).trim();
      } else {
        tp = text.substring(tpIndex).trim();
      }
    }
    
    // Extract ATP
    if (atpIndex !== -1) {
      atp = text.substring(atpIndex).trim();
    }
    
    // ✅ Fallback: split by double newlines if markers not found
    if (!cp && !tp && !atp) {
      const parts = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
      if (parts.length >= 3) {
        cp = parts.slice(0, Math.ceil(parts.length / 3)).join('\n\n');
        tp = parts.slice(Math.ceil(parts.length / 3), Math.ceil(parts.length * 2/3)).join('\n\n');
        atp = parts.slice(Math.ceil(parts.length * 2/3)).join('\n\n');
      } else if (parts.length >= 2) {
        cp = parts[0];
        tp = parts[1];
      } else if (parts.length === 1) {
        cp = parts[0];
      }
    }
    
  } catch (e) {
    console.error('❌ [Groq API] Parse error:', e);
    // Ultimate fallback: return entire text as CP
    cp = text;
    tp = '';
    atp = '';
  }
  
  return {
    cp: cp || text,
    tp: tp || '',
    atp: atp || ''
  };
}

/**
 * Test Groq API connection
 * @returns {Promise<boolean>} True if connection successful
 */
export async function testGroqConnection() {
  const apiKey = getGroqApiKey();
  if (!apiKey) return false;
  
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
    
    return response.ok;
  } catch {
    return false;
  }
}

console.log('🟢 [Groq API] READY — Export: getGroqApiKey, saveGroqApiKey, clearGroqApiKey, hasGroqApiKey, generateWithGroq, testGroqConnection');
