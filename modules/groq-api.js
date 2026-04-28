/**
 * ============================================
 * MODULE: GROQ API INTEGRATION
 * Platform Administrasi Kelas Digital
 * ============================================
 * FIX: Support custom prompt untuk Pembuat Soal
 * ============================================
 */

console.log('🔴 [Groq API] Script START');

import { getNextApiKey } from './global-api-key.js';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';

export async function getGroqApiKey() {
  const globalKey = await getNextApiKey();
  if (globalKey) {
    console.log('🌐 [Groq API] Using global API key');
    return globalKey;
  }
  const localKey = localStorage.getItem('groq_api_key');
  if (localKey) {
    console.log('🔄 [Groq API] Using localStorage fallback');
    return localKey;
  }
  console.log('⚠️ [Groq API] No API key available');
  return null;
}

export function saveGroqApiKey(key) {
  localStorage.setItem('groq_api_key', key);
  console.log('✅ [Groq API] API key saved to localStorage');
}

export function clearGroqApiKey() {
  localStorage.removeItem('groq_api_key');
  console.log('🗑️ [Groq API] API key cleared from localStorage');
}

export function hasGroqApiKey() {
  const key = localStorage.getItem('groq_api_key');
  return key && key.length >= 20 && key.startsWith('gsk_');
}

/**
 * Build prompt CP/TP/ATP — Default untuk CTA Generator
 */
function buildCPPrompt(data) {
  const jenjang = (data.jenjang || '').toUpperCase();
  const semester = data.semester === '1'? '1' : '2';

  return `Buat CP/TP/ATP Kurikulum Merdeka singkat.

Data: ${data.sekolah}, ${jenjang} Kelas ${data.kelas}, Semester ${semester}, ${data.mapel}, Topik: ${data.topik}

Format:
CP: Fase [X], 3 elemen dengan indikator singkat
TP: 5 tujuan dengan indikator
ATP: 8 minggu dengan kegiatan dan asesmen

Bahasa Indonesia, total ~500 kata.`;
}

export async function testGroqConnection() {
  const apiKey = await getGroqApiKey();
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
 * ✅ FIX UTAMA: Support custom prompt + auto-detect mode
 */
export async function generateWithGroq(inputData) {
  const apiKey = await getGroqApiKey();

  console.log('🤖 [Groq API] Starting generation...');
  console.log('🔑 [Groq API] Key valid:', apiKey? true : false);
  console.log('🤖 [Groq API] Model:', GROQ_MODEL);

  if (!apiKey) {
    throw new Error('Groq API key tidak valid. Hubungi admin atau input di profil.');
  }

  const test = await testGroqConnection();
  if (!test.success) {
    throw new Error('Test koneksi gagal: ' + test.error);
  }

  // ✅ FIX: Prioritas prompt custom dari pembuat-soal.js
  let prompt;
  let isSoalMode = false;

  if (typeof inputData === 'string') {
    // Kalau dikirim string langsung, anggap itu prompt custom
    prompt = inputData;
    isSoalMode = true;
    console.log('📝 [Groq API] Using raw string prompt - Soal Mode');
  } else if (inputData.prompt || inputData.customPrompt) {
    // Kalau object ada key prompt/customPrompt, pake itu
    prompt = inputData.prompt || inputData.customPrompt;
    isSoalMode = true;
    console.log('📝 [Groq API] Using custom prompt - Soal Mode');
  } else {
    // Default: bikin prompt CP untuk CTA Generator
    prompt = buildCPPrompt(inputData);
    console.log('📝 [Groq API] Using CP/TP/ATP prompt - CTA Mode');
  }

  console.log('📝 [Groq API] Prompt length:', prompt.length, 'chars');

  const systemContent = isSoalMode
   ? 'Anda adalah guru ahli pembuat soal ujian. Output hanya soal + kunci jawaban sesuai format yang diminta. Jangan tambahkan pengantar atau penutup.'
    : 'Asisten guru Kurikulum Merdeka. Jawaban singkat, jelas, bahasa Indonesia.';

  const requestBody = {
    model: GROQ_MODEL,
    messages: [
      { role: 'system', content: systemContent },
      { role: 'user', content: prompt }
    ],
    temperature: isSoalMode? 0.5 : 0.7, // Lebih konsisten untuk soal
    max_tokens: isSoalMode? 2048 : 1024, // Soal butuh token lebih banyak
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

    // ✅ Untuk mode soal, return raw string. Untuk CTA, parse CP/TP/ATP
    if (isSoalMode) {
      return aiResponse; // Return string mentah biar pembuat-soal.js yang parsing
    } else {
      return parseGroqResponse(aiResponse);
    }

  } catch (error) {
    console.error('❌ [Groq API] Error:', error.name, error.message);

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Koneksi internet bermasalah. Cek koneksi Anda.');
    }

    throw error;
  }
}

/**
 * Parse Groq response untuk CP/TP/ATP
 */
function parseGroqResponse(text) {
  console.log('🔍 [Groq API] Parsing CP/TP/ATP response...');

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

    if (!cp &&!tp &&!atp) {
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

console.log('🟢 [Groq API] READY — Model: llama-3.1-8b-instant + Custom Prompt Support');
