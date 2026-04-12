/**
 * MODULE: ADM. PEMBELAJARAN (Main Container)
 * 3 Independent Sections: Section 1 (CTA+Modul), Section 2 (Reserved), Section 3 (Reserved)
 */

console.log('🔴 [AdmPembelajaran Module] Script START');

import { storage } from './storage.js';
import { escapeHtml } from './utils.js';
import { getMainTemplate } from './adm-pembelajaran-template.js';
import { getSection1Template, renderSection1Dokumen } from './section1-template.js';
import { getSection2Template } from './section2-template.js';
import { getSection3Template } from './section3-template.js';

// ✅ State management
let dokumenList = [];
let activeSection = 'section1';
let selectedDocId = null;

// ============================================
// ✅ GLOBAL FUNCTION: Render Module
// ============================================
window.renderAdmPembelajaran = async function() {
  console.log('📦 [AdmPembelajaran] renderAdmPembelajaran() called');
  
  const container = document.getElementById('module-container');
  if (!container) return;
  
  // ✅ Wait for Firebase auth
  let authUser = null;
  try {
    const { auth, onAuthStateChanged } = await import('../firebase-config.js');
    
    if (auth.currentUser) {
      authUser = auth.currentUser;
      console.log('🔐 [AdmPembelajaran] Auth ready (sync):', authUser.uid.substring(0, 10) + '...');
    } else {
      console.log('⏳ [AdmPembelajaran] Waiting for auth state...');
      authUser = await new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          unsubscribe();
          resolve(user);
        });
        setTimeout(() => resolve(null), 3000);
      });
      console.log('🔐 [AdmPembelajaran] Auth ready (async):', authUser?.uid?.substring(0, 10) + '...' || 'null');
    }
  } catch (e) {
    console.warn('⚠️ Auth not available');
  }
  
  // ✅ CRITICAL: Set userId BEFORE any storage operation
  storage.userId = authUser?.uid || null;
  console.log('🔧 [AdmPembelajaran] storage.userId:', storage.userId?.substring(0, 10) + '...');
  
  // ✅ Load dokumen
  dokumenList = await storage.loadDokumen();
  console.log('✅ [AdmPembelajaran] Dokumen loaded:', dokumenList.length);
  
  container.innerHTML = getMainTemplate();
  container.classList.remove('hidden');
  
  // ✅ Hide dashboard sections
  document.querySelectorAll('.dashboard-hero, [aria-labelledby="rooms-heading"], #sd-section, #smp-section, #sma-section')
    .forEach(el => el?.closest('section')?.classList.add('hidden'));
  
  // ✅ Initialize UI
  window.admPembelajaran.renderNavigation();
  window.admPembelajaran.showSection('section1');
  
  console.log('✅ [AdmPembelajaran] Module rendered successfully');
};

// ============================================
// ✅ MAIN OBJECT: window.admPembelajaran
// ============================================
window.admPembelajaran = {
  
  // ✅ SECTION NAVIGATION
  showSection: function(sectionId) {
    console.log('👁️ [AdmPembelajaran] showSection:', sectionId);
    
    // Hide all sections
    document.querySelectorAll('.pembelajaran-section').forEach(s => s.classList.add('hidden'));
    
    // Show selected section
    const target = document.getElementById(sectionId);
    if (target) {
      target.classList.remove('hidden');
      activeSection = sectionId;
    }
    
    // Update nav buttons
    document.querySelectorAll('.nav-section-btn').forEach(btn => {
      btn.classList.remove('bg-indigo-600', 'text-white');
      btn.classList.add('bg-slate-100', 'text-slate-600');
    });
    const activeBtn = document.querySelector(`.nav-section-btn[data-section="${sectionId}"]`);
    if (activeBtn) {
      activeBtn.classList.remove('bg-slate-100', 'text-slate-600');
      activeBtn.classList.add('bg-indigo-600', 'text-white');
    }
    
    // Load section content
    if (sectionId === 'section1') {
      this.renderSection1();
    } else if (sectionId === 'section2') {
      this.renderSection2();
    } else if (sectionId === 'section3') {
      this.renderSection3();
    }
  },
  
  renderNavigation: function() {
    // Navigation is handled in template
    console.log('✅ [AdmPembelajaran] Navigation rendered');
  },
  
  // ✅ SECTION 1: CTA + Asisten Modul Documents
  renderSection1: function() {
    console.log('📄 [AdmPembelajaran] Rendering Section 1...');
    
    const container = document.getElementById('section1-content');
    if (!container) return;
    
    // Filter dokumen for Section 1 (jenis: cta or modul_ajar)
    const section1Dokumen = dokumenList.filter(d => 
      d.jenis === 'cta' || d.jenis === 'modul_ajar'
    );
    
    if (section1Dokumen.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12 text-slate-400">
          <i class="fas fa-inbox text-4xl mb-4"></i>
          <p>Belum ada dokumen.</p>
          <p class="text-sm mt-2">Generate dari CTA Generator atau Asisten Modul akan muncul di sini.</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = section1Dokumen.map((d, i) => this.renderDokumenCard(d, i)).join('');
  },
  
  renderDokumenCard: function(d, index) {
    const jenisLabel = d.jenis === 'cta' ? '📋 CTA' : '📚 Modul';
    const jenjangLabel = d.jenjang?.toUpperCase() || '-';
    const kelasLabel = d.kelas ? `Kelas ${d.kelas}` : '-';
    const mapelLabel = d.mapel || '-';
    const dateLabel = d.createdAt ? new Date(d.createdAt).toLocaleDateString('id-ID') : '-';
    
    return `
      <div class="bg-white rounded-2xl shadow-sm border p-4 hover:shadow-md transition">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <span class="px-2 py-1 text-xs font-medium ${d.jenis === 'cta' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'} rounded-lg">
                ${jenisLabel}
              </span>
              <span class="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-lg">
                ${jenjangLabel}
              </span>
            </div>
            <h4 class="font-semibold text-slate-800 mb-2">${escapeHtml(d.judul)}</h4>
            <div class="flex flex-wrap gap-2 text-xs text-slate-500">
              <span><i class="fas fa-graduation-cap mr-1"></i>${kelasLabel}</span>
              <span><i class="fas fa-book mr-1"></i>${mapelLabel}</span>
              <span><i class="fas fa-calendar mr-1"></i>${dateLabel}</span>
            </div>
          </div>
          <div class="flex flex-col gap-1 ml-4">
            <button onclick="window.admPembelajaran.viewDokumen('${d.id}')" class="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Lihat">
              <i class="fas fa-eye"></i>
            </button>
            <button onclick="window.admPembelajaran.downloadDokumen('${d.id}')" class="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition" title="Download">
              <i class="fas fa-download"></i>
            </button>
            <button onclick="window.admPembelajaran.deleteDokumen('${d.id}', ${index})" class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Hapus">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  },
  
  viewDokumen: async function(docId) {
    console.log('👁️ [AdmPembelajaran] viewDokumen:', docId);
    try {
      const doc = await storage.getDokumenById(docId);
      if (!doc) return alert('❌ Dokumen tidak ditemukan!');
      
      // Open in new window for viewing
      const viewWindow = window.open('', '', 'height=800,width=1000');
      viewWindow.document.write(`
        <html><head><title>${escapeHtml(doc.judul)}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { color: #1e293b; margin-bottom: 20px; }
          .meta { color: #64748b; font-size: 14px; margin-bottom: 30px; }
          .content { line-height: 1.8; color: #334155; }
        </style>
        </head><body>
          <h1>${escapeHtml(doc.judul)}</h1>
          <div class="meta">
            <p><strong>Jenis:</strong> ${doc.jenis === 'cta' ? 'CTA Generator' : 'Asisten Modul'}</p>
            <p><strong>Jenjang:</strong> ${doc.jenjang?.toUpperCase() || '-'}</p>
            <p><strong>Kelas:</strong> ${doc.kelas || '-'}</p>
            <p><strong>Mapel:</strong> ${doc.mapel || '-'}</p>
            <p><strong>Dibuat:</strong> ${new Date(doc.createdAt).toLocaleString('id-ID')}</p>
          </div>
          <div class="content">${doc.konten}</div>
        </body></html>
      `);
      viewWindow.document.close();
    } catch (e) {
      console.error('❌ [AdmPembelajaran] viewDokumen error:', e);
      alert('❌ Gagal membuka dokumen: ' + e.message);
    }
  },
  
  downloadDokumen: async function(docId) {
    console.log('📥 [AdmPembelajaran] downloadDokumen:', docId);
    try {
      const doc = await storage.getDokumenById(docId);
      if (!doc) return alert('❌ Dokumen tidak ditemukan!');
      
      // Create downloadable content
      const content = `
        ${doc.judul}
        ${'='.repeat(50)}
        
        Jenis: ${doc.jenis === 'cta' ? 'CTA Generator' : 'Asisten Modul'}
        Jenjang: ${doc.jenjang?.toUpperCase() || '-'}
        Kelas: ${doc.kelas || '-'}
        Mapel: ${doc.mapel || '-'}
        Dibuat: ${new Date(doc.createdAt).toLocaleString('id-ID')}
        
        ${'='.repeat(50)}
        
        ${doc.konten}
      `;
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.judul.replace(/[^a-z0-9]/gi, '_')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert('✅ Dokumen berhasil didownload!');
    } catch (e) {
      console.error('❌ [AdmPembelajaran] downloadDokumen error:', e);
      alert('❌ Gagal download: ' + e.message);
    }
  },
  
  deleteDokumen: async function(docId, index) {
    if (!confirm('Hapus dokumen ini?')) return;
    
    try {
      await storage.deleteDokumen(docId);
      dokumenList.splice(index, 1);
      this.renderSection1();
      alert('✅ Dokumen berhasil dihapus!');
    } catch (e) {
      console.error('❌ [AdmPembelajaran] deleteDokumen error:', e);
      alert('❌ Gagal menghapus: ' + e.message);
    }
  },
  
  // ✅ SECTION 2: Reserved (Stub)
  renderSection2: function() {
    console.log('📄 [AdmPembelajaran] Rendering Section 2 (Reserved)...');
    
    const container = document.getElementById('section2-content');
    if (!container) return;
    
    container.innerHTML = getSection2Template();
  },
  
  // ✅ SECTION 3: Reserved (Stub)
  renderSection3: function() {
    console.log('📄 [AdmPembelajaran] Rendering Section 3 (Reserved)...');
    
    const container = document.getElementById('section3-content');
    if (!container) return;
    
    container.innerHTML = getSection3Template();
  },
  
  // ✅ BACK TO DASHBOARD
  backToDashboard: function() {
    const container = document.getElementById('module-container');
    if (container) {
      container.innerHTML = '';
      container.classList.add('hidden');
    }
    
    document.querySelectorAll('.dashboard-hero, [aria-labelledby="rooms-heading"]')
      .forEach(el => el?.closest('section')?.classList.remove('hidden'));
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
  
  // ✅ REFRESH DOKUMEN (called after auto-save from CTA/Asisten)
  refreshDokumen: async function() {
    console.log('🔄 [AdmPembelajaran] Refreshing dokumen...');
    dokumenList = await storage.loadDokumen();
    if (activeSection === 'section1') {
      this.renderSection1();
    }
  }
};

console.log('🟢 [AdmPembelajaran] Module FINISHED - 3 Independent Sections');
