/**
 * ============================================
 * MODULE: TANYA AI GURU
 * Folder: modules/tanya-ai-guru.js
 * Platform Administrasi Kelas Digital
 * ✅ FINAL: Form Q&A + LocalStorage History + Pure AI
 * ============================================
 */

console.log('🔴 [Tanya AI Guru] Script START');

import { auth } from './firebase-config.js';
import { generateWithGroq } from './groq-api.js';

console.log('✅ [Tanya AI Guru] Imports successful');

const STORAGE_KEY = 'tanya_ai_guru_history';
const MAX_HISTORY = 20; // Batas riwayat agar localStorage tidak penuh

// ============================================
// ✅ RENDER FUNCTION
// ============================================

export function renderTanyaAIGuru() {
  console.log('📝 [Tanya AI Guru] renderTanyaAIGuru() called');
  
  const container = document.getElementById('module-container');
  if (!container) {
    console.error('❌ [Tanya AI Guru] Container #module-container NOT FOUND');
    return;
  }
  
  const user = auth.currentUser;
  if (!user) {
    container.innerHTML = '<div class="p-8 text-center text-gray-500">⚠️ Silakan login untuk menggunakan Tanya AI Guru.</div>';
    return;
  }
  
  container.innerHTML = `
    <style>
      .tanya-ai-form { max-width: 850px; margin: auto; padding: 25px; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
      .tanya-ai-form h2 { text-align: center; color: #2563eb; margin-bottom: 10px; font-size: 26px; }
      .subtitle { text-align: center; color: #6b7280; margin-bottom: 25px; font-size: 14px; }
      .section-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin-bottom: 20px; }
      .tanya-ai-form label { display: block; font-weight: 600; color: #374151; margin-bottom: 8px; }
      .tanya-ai-form textarea { width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; line-height: 1.6; resize: vertical; min-height: 100px; font-family: inherit; }
      .tanya-ai-form textarea:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
      .btn-ask { width: 100%; padding: 14px; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 12px; }
      .btn-ask:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(37,99,235,0.3); }
      .btn-ask:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
      .answer-box { background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 16px; border-radius: 0 8px 8px 0; margin-top: 12px; white-space: pre-wrap; line-height: 1.7; font-size: 14px; color: #1e293b; min-height: 80px; }
      .history-item { border-bottom: 1px solid #e2e8f0; padding: 12px 0; }
      .history-item:last-child { border-bottom: none; }
      .history-q { font-weight: 600; color: #334155; margin-bottom: 6px; }
      .history-a { color: #475569; font-size: 13px; white-space: pre-wrap; line-height: 1.6; background: #f8fafc; padding: 10px; border-radius: 6px; margin-top: 6px; }
      .history-meta { font-size: 11px; color: #94a3b8; margin-top: 4px; display: flex; justify-content: space-between; align-items: center; }
      .btn-clear { background: #ef4444; color: white; padding: 6px 12px; border: none; border-radius: 6px; font-size: 12px; cursor: pointer; }
      .btn-clear:hover { background: #dc2626; }
      .btn-back { margin-top: 20px; padding: 12px 25px; background: #64748b; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; width: auto; display: inline-flex; align-items: center; gap: 6px; }
      .hidden { display: none !important; }
    </style>
    
    <div class="tanya-ai-form">
      <h2>🎓 Tanya AI Guru</h2>
      <p class="subtitle">Konsultasi pedagogis, materi, atau administrasi kelas secara mendalam</p>
      
      <button class="btn-back" id="btn-back-ai"><i class="fas fa-arrow-left"></i> Kembali ke Dashboard</button>
      
      <div class="section-box">
        <label for="tanya-ai-input"><i class="fas fa-question-circle mr-2"></i>Ajukan Pertanyaan Anda</label>
        <textarea id="tanya-ai-input" placeholder="Contoh: Bagaimana strategi diferensiasi pembelajaran untuk kelas heterogen? Jelaskan langkah praktisnya."></textarea>
        <button id="btn-tanya-ai" class="btn-ask"><i class="fas fa-paper-plane"></i> Tanya AI</button>
      </div>
      
      <div id="tanya-ai-result" class="hidden">
        <div class="section-box" style="border-left: 4px solid #2563eb; background: white;">
          <label style="margin-bottom:12px;"><i class="fas fa-robot mr-2"></i>Jawaban AI</label>
          <div id="tanya-ai-answer" class="answer-box"></div>
        </div>
      </div>
      
      <div class="section-box" style="margin-top: 25px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
          <label style="margin:0;"><i class="fas fa-history mr-2"></i>Riwayat Pertanyaan</label>
          <button id="btn-clear-history" class="btn-clear">Hapus Riwayat</button>
        </div>
        <div id="tanya-ai-history-list">
          <p class="text-center py-6 text-gray-500" style="text-align:center; padding:20px 0; color:#94a3b8;">Belum ada riwayat pertanyaan.</p>
        </div>
      </div>
    </div>
  `;
  
  // Setup UI logic
  setTimeout(() => {
    setupAIGuruHandlers();
    loadAIHistory();
    console.log('✅ [Tanya AI Guru] UI & listeners ready');
  }, 80);
  
  // Hide main sections
  document.querySelector('.dashboard-hero')?.closest('section')?.classList.add('hidden');
  document.querySelector('[aria-labelledby="rooms-heading"]')?.classList.add('hidden');
  container.classList.remove('hidden');
}

window.renderTanyaAIGuru = renderTanyaAIGuru;

// ============================================
// ✅ HANDLERS & LOGIC
// ============================================

function setupAIGuruHandlers() {
  const backBtn = document.getElementById('btn-back-ai');
  if (backBtn) backBtn.addEventListener('click', () => {
    if (typeof window.backToDashboard === 'function') window.backToDashboard();
    else document.getElementById('module-container')?.classList.add('hidden');
  });
  
  const askBtn = document.getElementById('btn-tanya-ai');
  if (askBtn) askBtn.addEventListener('click', handleAskAI);
  
  const clearBtn = document.getElementById('btn-clear-history');
  if (clearBtn) clearBtn.addEventListener('click', () => {
    if (confirm('Yakin ingin menghapus semua riwayat pertanyaan?')) {
      localStorage.removeItem(STORAGE_KEY);
      loadAIHistory();
    }
  });
}

async function handleAskAI() {
  const input = document.getElementById('tanya-ai-input');
  const askBtn = document.getElementById('btn-tanya-ai');
  const resDiv = document.getElementById('tanya-ai-result');
  const resBox = document.getElementById('tanya-ai-answer');
  
  const question = input?.value?.trim();
  if (!question) return alert('⚠️ Silakan tulis pertanyaan terlebih dahulu.');
  if (question.length < 10) return alert('⚠️ Pertanyaan terlalu pendek. Jelaskan lebih detail agar AI bisa menjawab secara komprehensif.');
  
  askBtn.disabled = true;
  askBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> AI sedang menganalisis...';
  resDiv?.classList.remove('hidden');
  resBox.textContent = '⏳ Menyusun jawaban pedagogis...';
  
  try {
    const prompt = `Anda adalah asisten guru profesional & pakar pendidikan Indonesia. Jawab pertanyaan berikut secara komprehensif, terstruktur, dan menggunakan bahasa Indonesia yang baku namun mudah dipahami. Sertakan contoh praktis, landasan teori (jika relevan), dan saran implementasi di kelas. Hindari jawaban yang terlalu singkat atau umum.

Pertanyaan Guru:
${question}`;

    const result = await generateWithGroq({ prompt, temperature: 0.7, max_tokens: 1500 });
    
    if (!result || typeof result !== 'string') throw new Error('Respon AI tidak valid.');
    if (result.includes('❌ Error:')) throw new Error(result.replace('❌ Error: ', ''));
    
    resBox.textContent = result;
    
    // ✅ Simpan ke LocalStorage
    saveToHistory(question, result);
    loadAIHistory();
    input.value = '';
    
    console.log('✅ [Tanya AI Guru] Answer generated & saved');
  } catch (err) {
    console.error('❌ [Tanya AI Guru] Error:', err);
    resBox.textContent = `❌ Gagal mendapatkan jawaban:\n${err.message}\n\n💡 Pastikan API Key aktif & koneksi stabil. Coba lagi.`;
    alert(`❌ Gagal generate: ${err.message}`);
  } finally {
    askBtn.disabled = false;
    askBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Tanya AI';
  }
}

// ============================================
// ✅ LOCALSTORAGE HISTORY
// ============================================

function saveToHistory(question, answer) {
  try {
    let history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    history.unshift({
      id: Date.now(),
      question,
      answer,
      timestamp: new Date().toISOString()
    });
    // Batasi jumlah agar tidak membebani storage
    if (history.length > MAX_HISTORY) history = history.slice(0, MAX_HISTORY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.warn('⚠️ [Tanya AI Guru] LocalStorage save failed:', e);
  }
}

function loadAIHistory() {
  const list = document.getElementById('tanya-ai-history-list');
  if (!list) return;
  
  try {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (history.length === 0) {
      list.innerHTML = '<p class="text-center py-6 text-gray-500">Belum ada riwayat pertanyaan.</p>';
      return;
    }
    
    list.innerHTML = history.map(item => `
      <div class="history-item">
        <div class="history-q">❓ ${item.question}</div>
        <div class="history-a">🤖 ${item.answer}</div>
        <div class="history-meta">
          <span>${new Date(item.timestamp).toLocaleString('id-ID')}</span>
          <button onclick="window.copyTanyaAI('${item.id}')" style="background:none;border:none;cursor:pointer;color:#2563eb;font-size:12px;"><i class="fas fa-copy"></i> Salin</button>
        </div>
      </div>
    `).join('');
  } catch (e) {
    console.error('❌ [Tanya AI Guru] Load history failed:', e);
    list.innerHTML = '<p class="text-center py-6 text-red-500">Gagal memuat riwayat.</p>';
  }
}

// Expose copy function to window
window.copyTanyaAI = function(id) {
  try {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const item = history.find(h => h.id == id);
    if (item) {
      navigator.clipboard.writeText(`Pertanyaan:\n${item.question}\n\nJawaban AI:\n${item.answer}`);
      alert('✅ Jawaban berhasil disalin ke clipboard!');
    }
  } catch (e) {
    alert('⚠️ Gagal menyalin teks.');
  }
};

console.log('🟢 [Tanya AI Guru] READY — Form Q&A + LocalStorage History');
