/**
 * ============================================
 * MODULE: GROQ API INTEGRATION
 * Platform Administrasi Kelas Digital
 * ============================================
 */

console.log('🔴 [Groq API] Script START');

// ✅ GROQ API CONFIG — UPDATED MODEL (2026)
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant'; // ✅ Model aktif & stabil

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
 * Build prompt — Compact & Safe
 */
function buildPrompt(data) {
  const jenjang = (data.jenjang || '').toUpperCase();
  const semester = data.semester === '1' ? '1' : '2';
  
  return `Buat CP/TP/ATP Kurikulum Merdeka singkat.

Data: ${data.sekolah}, ${jenjang} Kelas ${data.kelas}, Semester ${semester}, ${data.mapel}, Topik: ${data.topik}

Format:
CP: Fase [X], 3 elemen dengan indikator singkat
TP: 5 tujuan dengan indikator
ATP: 8 minggu dengan kegiatan dan asesmen

Bahasa Indonesia, total ~500 kata.`;
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
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 20
      })
    });
    
    if (response.ok) return { success: true };
    const err = await response.json().catch(() => ({}));
    return { success: false, error: `Status ${response.status}: ${err.error?.message || ''}` };
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
    throw new Error('Test koneksi gagal: ' + test.error);
  }
  
  const prompt = buildPrompt(inputData);
  console.log('📝 [Groq API] Prompt length:', prompt.length, 'chars');
  
  const requestBody = {
    model: GROQ_MODEL,
    messages: [
      { role: 'system', content: 'Asisten guru Kurikulum Merdeka. Jawaban singkat, jelas, bahasa Indonesia.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 1024,
    top_p: 1,
    stream: false
  };
  
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('📊 [Groq API] Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ [Groq API] Error response:', errorData);
      
      const status = response.status;
      const errorMsg = errorData.error?.message || '';
      
      if (status === 400) {
        if (errorMsg.includes('decommissioned') || errorMsg.includes('model')) {
          throw new Error('Model AI tidak tersedia. Hubungi admin untuk update.');
        } else {
          throw new Error('Request tidak valid. Coba dengan topik lebih sederhana.');
        }
      } else if (status === 401) {
        throw new Error('API Key tidak valid. Buat baru di console.groq.com/keys');
      } else if (status === 429) {
        throw new Error('Limit AI harian habis. Tunggu 24 jam atau buat key baru.');
      } else if (status === 413) {
        throw new Error('Request terlalu besar. Gunakan topik lebih spesifik.');
      }
      
      throw new Error(`AI Error ${status}: ${errorMsg || 'Unknown error'}`);
    }
    
    const data = await response.json();
    console.log('✅ [Groq API] Response received');
    
    const aiResponse = data.choices?.[0]?.message?.content;
    
    if (!aiResponse) {
      throw new Error('Response AI kosong');
    }
    
    console.log('📝 [Groq API] Response length:', aiResponse.length, 'chars');
    
    return parseGroqResponse(aiResponse);
    
  } catch (error) {
    console.error('❌ [Groq API] Error:', error.name, error.message);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Koneksi internet bermasalah. Cek koneksi Anda.');
    }
    
    throw error;
  }
}

/**
 * Parse Groq response
 */
function parseGroqResponse(text) {
  console.log('🔍 [Groq API] Parsing response...');
  
  let cp = '', tp = '', atp = '';
  
  try {
    const parts = text.split(/===\s*(CP|TP|ATP)\s*===/i).filter(p => p.trim());
    
    for (let i = 0; i < parts.length; i++) {
      const marker = parts[i]?.trim().toUpperCase();
      const content = parts[i + 1]?.trim() || '';
      
      if (marker === 'CP') cp = content;
      else if (marker === 'TP') tp = content;
      else if (marker === 'ATP') atp = content;
    }
    
    if (!cp && !tp && !atp) {
      const lines = text.split(/\n\s*\n/).filter(l => l.trim());
      if (lines.length >= 3) {
        const third = Math.ceil(lines.length / 3);
        cp = lines.slice(0, third).join('\n\n');
        tp = lines.slice(third, third * 2).join('\n\n');
        atp = lines.slice(third * 2).join('\n\n');
      } else {
        cp = text;
      }
    }
    
    console.log('✅ [Groq API] Parse result:', { 
      cpLength: cp?.length || 0, 
      tpLength: tp?.length || 0, 
      atpLength: atp?.length || 0 
    });
    
  } catch (e) {
    console.error('❌ [Groq API] Parse error:', e);
    cp = text;
  }
  
  return { 
    cp: cp || 'CP tidak tersedia', 
    tp: tp || 'TP tidak tersedia', 
    atp: atp || 'ATP tidak tersedia' 
  };
}

console.log('🟢 [Groq API] READY — Model: llama-3.1-8b-instant');
