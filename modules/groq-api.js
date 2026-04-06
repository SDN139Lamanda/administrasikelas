/**
 * GROQ API — ULTRA SIMPLE VERSION
 */
console.log('🔴 [Groq API] START');

const API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama3-8b-8192'; // ✅ Model yang pasti ada

export function hasGroqApiKey() {
  const k = localStorage.getItem('groq_api_key');
  return k && k.length >= 20 && k.startsWith('gsk_');
}

export async function generateWithGroq(data) {
  const key = localStorage.getItem('groq_api_key');
  if (!key || !hasGroqApiKey()) throw new Error('API key tidak valid');
  
  // ✅ Prompt super simple
  const prompt = `Buat CP/TP/ATP singkat untuk: ${data.mapel} Kelas ${data.kelas}, topik: ${data.topik}. Bahasa Indonesia.`;
  
  const body = {
    model: MODEL,
    messages: [
      { role: 'system', content: 'Asisten guru. Jawaban singkat.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 500,
    temperature: 0.7
  };
  
  console.log('📦 Request:', JSON.stringify(body).substring(0, 200) + '...');
  
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + key
    },
    body: JSON.stringify(body)
  });
  
  console.log('📊 Status:', res.status);
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error('❌ Groq Error:', err);
    throw new Error(`Groq ${res.status}: ${err.error?.message || 'Unknown'}`);
  }
  
  const json = await res.json();
  const text = json.choices?.[0]?.message?.content;
  
  if (!text) throw new Error('Response kosong');
  
  console.log('✅ Response length:', text.length);
  
  // ✅ Simple parse: return semua text sebagai CP
  return { cp: text, tp: '', atp: '' };
}

console.log('🟢 [Groq API] READY');
