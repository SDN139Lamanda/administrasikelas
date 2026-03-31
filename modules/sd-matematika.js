/**
 * ============================================
 * MODULE: SD MATEMATIKA (KURIKULUM MERDEKA)
 * Platform Administrasi Kelas Digital - SDN 139 Lamanda
 * ============================================
 * 
 * ✅ True Modular Architecture
 * ✅ Renders to #module-container
 * ✅ All functions on window object (onclick compatible)
 * ✅ Kurikulum Merdeka: CP, TP, ATP, Materi, Penilaian
 * ✅ Classes 1-6 SD with phase-appropriate content
 * ✅ LOAD DATA FROM JSON: data/sd/matematika-kelas{N}.json
 * ✅ SEMESTER FILTER: Semester 1 (Ganjil) / Semester 2 (Genap)
 */

console.log('🔴 [SD Matematika] Module START');

// ============================================
// ✅ FALLBACK DATA (Hardcoded) - Jika JSON gagal
// ============================================
const MATEMATIKA_SD_FALLBACK = {
  '1': { phase: 'A', topics: [] },
  '2': { phase: 'A', topics: [] },
  '3': { phase: 'B', topics: [] },
  '4': { phase: 'B', topics: [] },
  '5': { phase: 'C', topics: [] },
  '6': { phase: 'C', topics: [] }
};

// ============================================
// ✅ FUNGSI: Load Data Matematika by Kelas (FROM JSON)
// ============================================
async function loadMatematikaData(kelasId) {
  try {
    console.log(`📥 [SD Matematika] Loading data/sd/matematika-kelas${kelasId}.json...`);
    
    // ✅ LOAD dari file JSON per kelas
    const response = await fetch(`data/sd/matematika-kelas${kelasId}.json`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ [SD Matematika] Data loaded for Kelas ${kelasId}:`, data.metadata);
    return data;
    
  } catch (error) {
    console.error(`❌ [SD Matematika] Failed to load JSON for Kelas ${kelasId}:`, error);
    
    // ✅ FALLBACK: Gunakan data hardcoded jika JSON gagal
    console.log('🔄 [SD Matematika] Using fallback hardcoded data');
    return MATEMATIKA_SD_FALLBACK[kelasId] || null;
  }
}

// ============================================
// ✅ FUNGSI HELPER: Truncate Text
// ============================================
function truncateText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

// ============================================
// ✅ FUNGSI UTAMA: RENDER MATEMATIKA SD (WITH SEMESTER FILTER)
// ============================================
window.renderSDMatematika = async function(kelasId, semesterId = null) {
  console.log('🧮 [SD Matematika] Render for Kelas:', kelasId, 'Semester:', semesterId || 'all');
  
  // Hide all sections except module-container
  document.querySelectorAll('.section').forEach(section => {
    if (section.id !== 'module-container') {
      section.classList.add('hidden');
    }
  });
  
  // Get container
  const container = document.getElementById('module-container');
  if (!container) {
    console.error('❌ [SD Matematika] Module container not found!');
    return;
  }
  
  // Show loading state
  container.innerHTML = `<div class="p-8 text-center text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>Memuat data...</div>`;
  container.classList.remove('hidden');
  
  // Load data from JSON
  const data = await loadMatematikaData(kelasId);
  
  // Handle error / empty data
  if (!data || (!data.semester && !data.topics)) {
    container.innerHTML = `
      <div class="container py-8 text-center">
        <div class="p-8 bg-yellow-50 rounded-lg border border-yellow-200">
          <i class="fas fa-exclamation-circle text-yellow-600 text-4xl mb-4"></i>
          <h3 class="text-xl font-bold text-gray-800 mb-2">Data Tidak Ditemukan</h3>
          <p class="text-gray-600">Materi Matematika untuk Kelas ${kelasId} belum tersedia.</p>
          <button onclick="backToJenjang('sd')" class="mt-4 btn btn-ghost">
            <i class="fas fa-arrow-left mr-2"></i>Kembali
          </button>
        </div>
      </div>
    `;
    return;
  }
  
  // ✅ STRUKTUR BARU: data.semester (dari JSON) vs data.topics (fallback)
  let topics = [];
  let fase = data.metadata?.fase || data.phase || 'A';
  let hasSemesterFilter = !!data.semester;
  
  if (hasSemesterFilter) {
    // Struktur JSON: { semester: { "1": { topics: [...] }, "2": { topics: [...] } } }
    if (semesterId && data.semester?.[semesterId]) {
      topics = data.semester[semesterId].topics || [];
    } else if (semesterId === 'all' || !semesterId) {
      // Show all topics from both semesters
      topics = [
        ...(data.semester['1']?.topics || []),
        ...(data.semester['2']?.topics || [])
      ];
    }
  } else {
    // Fallback structure: { topics: [...] }
    topics = data.topics || [];
  }
  
  // Render UI
  container.innerHTML = `
    <div class="container py-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <div class="p-3 bg-blue-100 rounded-xl">
            <i class="fas fa-calculator text-blue-600 text-2xl"></i>
          </div>
          <div>
            <h2 class="text-2xl font-bold text-gray-800">Matematika - Kelas ${kelasId}</h2>
            <p class="text-gray-500 text-sm">Fase ${fase} • ${hasSemesterFilter ? (semesterId ? `Semester ${semesterId}` : 'Semua Semester') : 'Kurikulum Merdeka'} • Kurikulum Merdeka</p>
          </div>
        </div>
        <button onclick="backToJenjang('sd')" class="btn btn-ghost btn-sm">
          <i class="fas fa-arrow-left mr-2"></i>Kembali
        </button>
      </div>
      
      <!-- Semester Filter (ONLY if data has semester structure) -->
      ${hasSemesterFilter ? `
      <div class="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <label class="text-sm font-semibold text-gray-700">
          <i class="fas fa-filter mr-2"></i>Filter Semester:
        </label>
        <select class="px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 text-sm" 
                onchange="window.renderSDMatematika('${kelasId}', this.value)">
          <option value="all" ${!semesterId ? 'selected' : ''}>Semua Semester</option>
          <option value="1" ${semesterId === '1' ? 'selected' : ''}>Semester 1 (Ganjil)</option>
          <option value="2" ${semesterId === '2' ? 'selected' : ''}>Semester 2 (Genap)</option>
        </select>
        <span class="text-sm text-gray-500">${topics.length} topik ditampilkan</span>
      </div>
      ` : ''}
      
      <!-- Topics Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${topics.length > 0 ? topics.map(topic => `
          <article class="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer border-l-4 border-blue-500" 
                   onclick="showMatematikaDetail('${topic.id}', '${kelasId}', '${semesterId || ''}')">
            <div class="p-5">
              <div class="flex items-start justify-between mb-3">
                <h3 class="font-bold text-gray-800 text-lg">${topic.title}</h3>
                <span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">${topic.alokasi || '-'}</span>
              </div>
              <p class="text-sm text-gray-600 mb-4 line-clamp-2">${truncateText(topic.cp, 120)}</p>
              <div class="flex flex-wrap gap-2">
                <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">CP</span>
                <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">TP</span>
                <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">ATP</span>
              </div>
            </div>
          </article>
        `).join('') : `
          <div class="col-span-full text-center py-8 text-gray-500">
            <i class="fas fa-info-circle text-3xl mb-3"></i>
            <p>Tidak ada topik untuk filter ini</p>
          </div>
        `}
      </div>
      
      <!-- Info Footer -->
      <div class="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p class="text-sm text-blue-800">
          <i class="fas fa-info-circle mr-2"></i>
          Klik pada topik untuk melihat detail Capaian Pembelajaran (CP), Tujuan Pembelajaran (TP), 
          Alur Tujuan Pembelajaran (ATP), Materi, dan Penilaian.
        </p>
      </div>
      
      <!-- Data Source Info (for debugging) -->
      <div class="mt-4 text-xs text-gray-400 text-center">
        <i class="fas fa-database mr-1"></i>
        Data: ${hasSemesterFilter ? `data/sd/matematika-kelas${kelasId}.json` : 'Fallback hardcoded'}
      </div>
    </div>
  `;
  
  console.log('✅ [SD Matematika] Rendered', topics.length, 'topics for Kelas', kelasId);
};

// ============================================
// ✅ FUNGSI: SHOW DETAIL MODAL (WITH SEMESTER)
// ============================================
window.showMatematikaDetail = async function(topicId, kelasId, semesterId = null) {
  console.log('🔍 [SD Matematika] Show detail:', topicId, 'Kelas:', kelasId, 'Semester:', semesterId || 'all');
  
  // Load data to find topic
  const data = await loadMatematikaData(kelasId);
  if (!data) return;
  
  let topic = null;
  
  if (data.semester && semesterId) {
    // Search in specific semester
    topic = data.semester[semesterId]?.topics?.find(t => t.id === topicId);
  } else if (data.semester) {
    // Search in all semesters
    topic = [
      ...(data.semester['1']?.topics || []),
      ...(data.semester['2']?.topics || [])
    ].find(t => t.id === topicId);
  } else {
    // Fallback structure
    topic = data.topics?.find(t => t.id === topicId);
  }
  
  if (!topic) {
    console.error('❌ Topic not found:', topicId);
    return;
  }
  
  showCustomModal({
    title: `🧮 ${topic.title}`,
    subtitle: `Kelas ${kelasId} • ${semesterId ? `Semester ${semesterId}` : 'Semua Semester'} • Kurikulum Merdeka`,
    content: `
      <div class="space-y-4">
        <!-- CP -->
        <div class="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
          <h4 class="font-semibold text-blue-800 mb-2">🎯 Capaian Pembelajaran (CP)</h4>
          <p class="text-gray-700 text-sm">${topic.cp || '-'}</p>
        </div>
        
        <!-- TP -->
        <div class="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
          <h4 class="font-semibold text-green-800 mb-2">📌 Tujuan Pembelajaran (TP)</h4>
          <p class="text-gray-700 text-sm">${topic.tp || '-'}</p>
        </div>
        
        <!-- ATP -->
        <div class="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
          <h4 class="font-semibold text-purple-800 mb-2">📋 Alur Tujuan Pembelajaran (ATP)</h4>
          <ul class="list-disc pl-5 text-sm text-gray-700 space-y-1">
            ${(topic.atp || []).map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
        
        <!-- Materi -->
        <div class="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
          <h4 class="font-semibold text-yellow-800 mb-2">📚 Materi Pokok</h4>
          <ul class="list-disc pl-5 text-sm text-gray-700 space-y-1">
            ${(topic.materi || []).map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
        
        <!-- Penilaian -->
        <div class="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
          <h4 class="font-semibold text-red-800 mb-2">📊 Asesmen & Penilaian</h4>
          <ul class="list-disc pl-5 text-sm text-gray-700 space-y-1">
            ${(topic.penilaian || []).map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
        
        <!-- Info Tambahan -->
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div class="p-3 bg-gray-50 rounded">
            <p class="text-gray-500">Alokasi Waktu</p>
            <p class="font-semibold text-gray-800">${topic.alokasi || '-'}</p>
          </div>
          <div class="p-3 bg-gray-50 rounded">
            <p class="text-gray-500">Media Pembelajaran</p>
            <p class="font-semibold text-gray-800 text-xs">${truncateText(topic.media || '-', 60)}</p>
          </div>
        </div>
      </div>
    `,
    confirmText: 'Tutup',
    actions: `
      <button onclick="exportMatematikaTopic('${topicId}', '${kelasId}', '${semesterId || ''}')" 
              class="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm flex items-center justify-center gap-2">
        <i class="fas fa-download"></i> Export
      </button>
      <button onclick="printMatematikaTopic('${topicId}', '${kelasId}', '${semesterId || ''}')" 
              class="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm flex items-center justify-center gap-2">
        <i class="fas fa-print"></i> Print
      </button>
    `
  });
};

// ============================================
// ✅ FUNGSI: EXPORT TO CLIPBOARD (WITH SEMESTER)
// ============================================
window.exportMatematikaTopic = async function(topicId, kelasId, semesterId = null) {
  const data = await loadMatematikaData(kelasId);
  if (!data) return;
  
  let topic = null;
  if (data.semester && semesterId) {
    topic = data.semester[semesterId]?.topics?.find(t => t.id === topicId);
  } else if (data.semester) {
    topic = [...(data.semester['1']?.topics || []), ...(data.semester['2']?.topics || [])].find(t => t.id === topicId);
  } else {
    topic = data.topics?.find(t => t.id === topicId);
  }
  
  if (!topic) return;
  
  const content = `
MATEMATIKA - KELAS ${kelasId}${semesterId ? ` - SEMESTER ${semesterId}` : ''}
${topic.title}
${'='.repeat(60)}

CAPAIAN PEMBELAJARAN (CP):
${topic.cp || '-'}

TUJUAN PEMBELAJARAN (TP):
${topic.tp || '-'}

ALUR TUJUAN PEMBELAJARAN (ATP):
${(topic.atp || []).map((item, i) => `${i+1}. ${item}`).join('\n') || '-'}

MATERI POKOK:
${(topic.materi || []).map((item, i) => `• ${item}`).join('\n') || '-'}

ASESMEN & PENILAIAN:
${(topic.penilaian || []).map((item, i) => `• ${item}`).join('\n') || '-'}

Alokasi Waktu: ${topic.alokasi || '-'}
Media: ${topic.media || '-'}
  `.trim();
  
  navigator.clipboard.writeText(content).then(() => {
    alert('✅ Data Matematika berhasil disalin ke clipboard!\n\nTips: Paste ke Word/Google Docs untuk edit lebih lanjut.');
  }).catch(() => {
    const win = window.open('', '_blank');
    win.document.write(`<pre style="font-family:monospace;font-size:12px;white-space:pre-wrap;">${content}</pre>`);
    win.document.close();
  });
};

// ============================================
// ✅ FUNGSI: PRINT TOPIC (WITH SEMESTER)
// ============================================
window.printMatematikaTopic = async function(topicId, kelasId, semesterId = null) {
  const data = await loadMatematikaData(kelasId);
  if (!data) return;
  
  let topic = null;
  if (data.semester && semesterId) {
    topic = data.semester[semesterId]?.topics?.find(t => t.id === topicId);
  } else if (data.semester) {
    topic = [...(data.semester['1']?.topics || []), ...(data.semester['2']?.topics || [])].find(t => t.id === topicId);
  } else {
    topic = data.topics?.find(t => t.id === topicId);
  }
  
  if (!topic) return;
  
  const printContent = `
    <html>
    <head>
      <title>Matematika Kelas ${kelasId} - ${topic.title}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
        h1 { color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
        h2 { color: #1e40af; margin: 20px 0 10px; }
        .section { margin: 15px 0; padding: 15px; border-left: 4px solid #3b82f6; background: #f8fafc; }
        ul { padding-left: 20px; }
        li { margin: 5px 0; }
        .meta { display: flex; gap: 20px; margin: 20px 0; }
        .meta div { background: #f1f5f9; padding: 10px; border-radius: 4px; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <h1>🧮 Matematika - Kelas ${kelasId}${semesterId ? ` - Semester ${semesterId}` : ''}</h1>
      <p style="color:#64748b">Kurikulum Merdeka</p>
      <h2>${topic.title}</h2>
      
      <div class="section" style="border-color:#3b82f6">
        <strong>🎯 Capaian Pembelajaran (CP)</strong>
        <p>${topic.cp || '-'}</p>
      </div>
      <div class="section" style="border-color:#22c55e">
        <strong>📌 Tujuan Pembelajaran (TP)</strong>
        <p>${topic.tp || '-'}</p>
      </div>
      <div class="section" style="border-color:#a855f7">
        <strong>📋 Alur Tujuan Pembelajaran (ATP)</strong>
        <ul>${(topic.atp || []).map(item => `<li>${item}</li>`).join('') || '<li>-</li>'}</ul>
      </div>
      <div class="section" style="border-color:#eab308">
        <strong>📚 Materi Pokok</strong>
        <ul>${(topic.materi || []).map(item => `<li>${item}</li>`).join('') || '<li>-</li>'}</ul>
      </div>
      <div class="section" style="border-color:#ef4444">
        <strong>📊 Asesmen & Penilaian</strong>
        <ul>${(topic.penilaian || []).map(item => `<li>${item}</li>`).join('') || '<li>-</li>'}</ul>
      </div>
      <div class="meta">
        <div><strong>⏱️ Alokasi</strong><br>${topic.alokasi || '-'}</div>
        <div><strong>📦 Media</strong><br>${topic.media || '-'}</div>
      </div>
      <p style="margin-top:40px;font-size:12px;color:#64748b;text-align:center">
        SDN 139 Lamanda • Platform Administrasi Kelas Digital
      </p>
    </body>
    </html>
  `;
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.print();
};

// ============================================
// ✅ FUNGSI HELPER: Custom Modal (Reusable)
// ============================================
function showCustomModal({ title, subtitle, content, confirmText = 'Tutup', actions = '', onConfirm }) {
  document.getElementById('custom-modal-overlay')?.remove();
  
  const overlay = document.createElement('div');
  overlay.id = 'custom-modal-overlay';
  overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
  overlay.onclick = (e) => { if (e.target === overlay) closeCustomModal(); };
  
  overlay.innerHTML = `
    <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-fade-in">
      <div class="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white flex-shrink-0">
        <h3 class="text-xl font-bold">${title}</h3>
        ${subtitle ? `<p class="text-blue-100 text-sm mt-1">${subtitle}</p>` : ''}
      </div>
      <div class="p-6 overflow-y-auto flex-1">${content}</div>
      ${actions ? `<div class="px-6 pb-6 flex gap-3 flex-shrink-0">${actions}</div>` : ''}
      <div class="px-6 pb-6 ${actions ? 'hidden' : ''}">
        <button onclick="closeCustomModal()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition">${confirmText}</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  if (!document.getElementById('modal-animations')) {
    const style = document.createElement('style');
    style.id = 'modal-animations';
    style.textContent = `
      @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      .animate-fade-in { animation: fadeIn 0.2s ease-out; }
      .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    `;
    document.head.appendChild(style);
  }
  
  window.closeCustomModal = function() {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.2s ease';
    setTimeout(() => { overlay.remove(); if (onConfirm) onConfirm(); }, 200);
  };
}

// ============================================
// ✅ FUNGSI: Back to Jenjang (Unified)
// ============================================
window.backToSDMatematika = function() {
  console.log('🏠 [SD Matematika] Back to SD Classes');
  const container = document.getElementById('module-container');
  if (container) { container.classList.add('hidden'); container.innerHTML = ''; }
  const sdSection = document.getElementById('sd-section');
  if (sdSection) sdSection.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ============================================
// CONFIRM: Functions Registered
// ============================================
console.log('🟢 [SD Matematika] window.renderSDMatematika:', typeof window.renderSDMatematika);
console.log('🟢 [SD Matematika] window.showMatematikaDetail:', typeof window.showMatematikaDetail);
console.log('🟢 [SD Matematika] window.exportMatematikaTopic:', typeof window.exportMatematikaTopic);
console.log('💡 [SD Matematika] TEST: window.renderSDMatematika("1", "1") for Semester 1');
console.log('🟢 [SD Matematika] Module FINISHED');

// ============================================
// EXPORT (Optional)
// ============================================
export { loadMatematikaData, MATEMATIKA_SD_FALLBACK };
