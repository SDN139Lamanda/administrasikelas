/**
 * TEMPLATE: Main container for Adm.Pembelajaran
 * ✅ Main module UI template
 */

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

console.log('✅ [Adm.Pembelajaran Template] Loaded - Main container');
