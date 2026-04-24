const functions = require('firebase-functions');
const fetch = require('node-fetch');

exports.generateSoalProxy = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');
  const { topics, apiKey } = data;
  if (!topics?.length) throw new functions.https.HttpsError('invalid-argument', 'Minimal 1 topik');
  if (!apiKey?.startsWith('gsk_')) throw new functions.https.HttpsError('invalid-argument', 'Invalid Groq key');

  const prompt = `Buat soal ${topics[0].peruntukan} mapel ${topics[0].mapel}.
TOPIK: ${topics.map((t,i)=>`${i+1}. "${t.topik}" (${t.jumlah} soal ${t.tipe})`).join('\n')}
OUTPUT WAJIB JSON: {"soal":"...","kunci_jawaban":"..."}`;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'llama3-8b-8192', messages: [{role:'user', content: prompt}], temperature: 0.7, max_tokens: 4000, response_format: {type:'json_object'} })
    });
    if (!res.ok) throw new Error(await res.text());
    const json = await res.json();
    return { success: true, data: { content: json.choices[0].message.content } };
  } catch (e) {
    throw new functions.https.HttpsError('internal', `Groq Error: ${e.message}`);
  }
});
