/**
 * TEMPLATE: Main container for Adm.Pembelajaran
 * ✅ Added: Source badge integration
 */

// ✅ Import getSourceLabel from storage
import { getSourceLabel } from './storage.js';

export function getMainTemplate() {
  return `
    <div class="adm-pembelajaran-module">
      <div class="flex items-center justify-between mb-6 pb-4 border-b">
        <h2 class="text-xl font-bold text-slate-800">📚 Administrasi Pembelajaran</h2>
        <button onclick="window.admPembelajaran.backToDashboard()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-medium transition">
          ← Kembali ke Dashboard
        </button>
      </div>

      <div class="flex gap-2 mb-6">
        <button onclick="window.admPembelajaran.showSection('section1')" 
                class="nav-section-btn flex-1 py-3 px-4 rounded-xl text-sm font-medium transition bg-indigo-600 text-white"
                data-section="section1">
          📋 Dokumen CTA & Modul
        </button>
        <button onclick="window.admPembelajaran.showSection('section2')" 
                class="nav-section-btn flex-1 py-3 px-4 rounded-xl text-sm font-medium transition bg-slate-100 text-slate-600"
                data-section="section2">
          📁 Fitur 2 (Coming Soon)
        </button>
        <button onclick="window.admPembelajaran.showSection('section3')" 
                class="nav-section-btn flex-1 py-3 px-4 rounded-xl text-sm font-medium transition bg-slate-100 text-slate-600"
                data-section="section3">
          📁 Fitur 3 (Coming Soon)
        </button>
      </div>

      <div id="section1" class="pembelajaran-section">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-slate-700">📋 Dokumen Saya</h3>
          <p class="text-xs text-slate-500">Otomatis tersimpan dari CTA Generator & Asisten Modul</p>
        </div>
        <div id="section1-content" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>
      </div>

      <div id="section2" class="pembelajaran-section hidden">
        <div id="section2-content"></div>
      </div>

      <div id="section3" class="pembelajaran-section hidden">
        <div id="section3-content"></div>
      </div>
    </div>
  `;
}

// ✅ Helper: Render document card WITH source badge
export function renderDocumentCard(doc) {
  const sourceBadge = doc.source ? `<span class="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded-full">${getSourceLabel(doc.source)}</span>` : '';
  
  return `
    <div class="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all group">
      <div class="flex items-start justify-between mb-3">
        <div class="flex gap-2 items-center">
          <span class="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">
            ${doc.jenis === 'cta' ? '📝 CTA' : '🤖 AI'}
          </span>
          ${sourceBadge}
        </div>
        <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onclick="window.admPembelajaran.viewDokumen('${doc.id}')" class="p-1.5 text-slate-400 hover:text-blue-600 rounded" title="Lihat">
            <i class="fas fa-eye text-xs"></i>
          </button>
          <button onclick="window.admPembelajaran.downloadDokumen('${doc.id}')" class="p-1.5 text-slate-400 hover:text-emerald-600 rounded" title="Download">
            <i class="fas fa-download text-xs"></i>
          </button>
          <button onclick="window.admPembelajaran.deleteDokumen('${doc.id}')" class="p-1.5 text-slate-400 hover:text-rose-600 rounded" title="Hapus">
            <i class="fas fa-trash text-xs"></i>
          </button>
        </div>
      </div>
      <h4 class="font-semibold text-slate-800 text-sm mb-2 line-clamp-2">${doc.judul}</h4>
      <div class="text-xs text-slate-500 space-y-1">
        <p><span class="font-medium">Kelas:</span> ${doc.kelas || '-'}</p>
        <p><span class="font-medium">Mapel:</span> ${doc.mapel || '-'}</p>
        <p class="text-[10px] text-slate-400">${new Date(doc.createdAt).toLocaleDateString('id-ID')}</p>
      </div>
    </div>
  `;
}

console.log('✅ [Template] Loaded - adm-pembelajaran main + Source Badge');
