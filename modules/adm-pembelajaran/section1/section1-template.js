/**
 * TEMPLATE: Section 1 - CTA + Asisten Modul Documents
 */

import { escapeHtml } from '../utils.js';

export function renderSection1Content(dokumenList) {
  const section1Dokumen = dokumenList.filter(d => d.jenis === 'cta' || d.jenis === 'modul_ajar');
  
  if (section1Dokumen.length === 0) {
    return `
      <div class="text-center py-12 text-slate-400">
        <i class="fas fa-inbox text-4xl mb-4"></i>
        <p>Belum ada dokumen.</p>
        <p class="text-sm mt-2">Generate dari CTA Generator atau Asisten Modul akan muncul di sini.</p>
      </div>
    `;
  }
  
  return section1Dokumen.map((d, i) => `
    <div class="bg-white rounded-2xl shadow-sm border p-4 hover:shadow-md transition">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2">
            <span class="px-2 py-1 text-xs font-medium ${d.jenis === 'cta' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'} rounded-lg">
              ${d.jenis === 'cta' ? '📋 CTA' : '📚 Modul'}
            </span>
            <span class="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-lg">
              ${d.jenjang?.toUpperCase() || '-'}
            </span>
          </div>
          <h4 class="font-semibold text-slate-800 mb-2">${escapeHtml(d.judul)}</h4>
          <div class="flex flex-wrap gap-2 text-xs text-slate-500">
            <span><i class="fas fa-graduation-cap mr-1"></i>${d.kelas ? 'Kelas ' + d.kelas : '-'}</span>
            <span><i class="fas fa-book mr-1"></i>${d.mapel || '-'}</span>
            <span><i class="fas fa-calendar mr-1"></i>${new Date(d.createdAt).toLocaleDateString('id-ID')}</span>
          </div>
        </div>
        <div class="flex flex-col gap-1 ml-4">
          <button onclick="window.admPembelajaran.viewDokumen('${d.id}')" class="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Lihat">
            <i class="fas fa-eye"></i>
          </button>
          <button onclick="window.admPembelajaran.downloadDokumen('${d.id}')" class="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition" title="Download">
            <i class="fas fa-download"></i>
          </button>
          <button onclick="window.admPembelajaran.deleteDokumen('${d.id}')" class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Hapus">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

console.log('✅ [Section1-Template] Loaded - CTA + Modul UI');
