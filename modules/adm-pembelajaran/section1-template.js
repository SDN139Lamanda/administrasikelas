/**
 * TEMPLATE: Section 1 - Dokumen CTA & Modul
 * ✅ Import paths corrected for ROOT folder location
 */

// ✅ FIX: firebase-config.js ada di parent folder (modules/)
import * as fb from '../firebase-config.js';  // ← ../ = naik 1 level ke modules/

// ✅ storage.js ada di folder yang sama (adm-pembelajaran/)
import { storage } from './storage.js';       // ← ./ = folder sama
import { getSourceLabel } from './storage.js';

// ✅ Helper: Render document card
export function renderDocumentCard(doc) {
  const sourceBadge = doc.source ? `<span class="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded-full">${getSourceLabel(doc.source)}</span>` : '';
  
  return `
    <div class="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all group">
      <div class="flex items-start justify-between mb-3">
        <div class="flex gap-2 items-center">
          <span class="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">
            ${doc.jenis === 'cta' ? '📝 CTA' : 
              doc.jenis === 'asisten-modul' ? '🤖 AI' : 
              '📚 Refleksi'}
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
      <h4 class="font-semibold text-slate-800 text-sm mb-2 line-clamp-2">${doc.judul || '-'}</h4>
      <div class="text-xs text-slate-500 space-y-1">
        <p><span class="font-medium">Kelas:</span> ${doc.kelas || '-'}</p>
        <p><span class="font-medium">Mapel:</span> ${doc.mapel || '-'}</p>
        <p class="text-[10px] text-slate-400">${doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('id-ID') : '-'}</p>
      </div>
    </div>
  `;
}

// ✅ Main export: Render section content
export function renderSection1Content(dokumenList) {
  if (!dokumenList || dokumenList.length === 0) {
    return `<div class="col-span-full text-center py-12 text-slate-400">
      <i class="fas fa-inbox text-4xl mb-4"></i>
      <p>Belum ada dokumen. Generate dari CTA Generator atau Asisten Modul!</p>
    </div>`;
  }
  
  const filteredDocs = dokumenList.filter(doc => 
    doc.jenis === 'cta' || 
    doc.jenis === 'asisten-modul' || 
    doc.jenis === 'refleksi'
  );
  
  if (filteredDocs.length === 0) {
    return `<div class="col-span-full text-center py-12 text-slate-400">
      <p>Tidak ada dokumen CTA/Modul/Refleksi. Coba generate dulu!</p>
    </div>`;
  }
  
  return filteredDocs.map(doc => renderDocumentCard(doc)).join('');
}

console.log('✅ [Section1 Template] Loaded - CTA & Modul & Refleksi documents');
