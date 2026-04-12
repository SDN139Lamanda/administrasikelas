/**
 * MODULE: ADM. PEMBELAJARAN (Main Container)
 * 3 Independent Sections with separate folders
 */

console.log('🔴 [AdmPembelajaran Module] Script START');

import { storage } from './storage.js';
import { escapeHtml } from './utils.js';
import { getMainTemplate } from './adm-pembelajaran-template.js';
import { renderSection1Content } from './section1/section1-template.js';
import { renderSection2Content } from './section2/section2-template.js';
import { renderSection3Content } from './section3/section3-template.js';

let dokumenList = [];
let activeSection = 'section1';

// ============================================
// ✅ GLOBAL FUNCTION: Render Module
// ============================================
window.renderAdmPembelajaran = async function() {
  console.log('📦 [AdmPembelajaran] renderAdmPembelajaran() called');
  
  const container = document.getElementById('module-container');
  if (!container) return;
  
  let authUser = null;
  try {
    const { auth, onAuthStateChanged } = await import('../firebase-config.js');
    if (auth.currentUser) {
      authUser = auth.currentUser;
    } else {
      authUser = await new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          unsubscribe();
          resolve(user);
        });
        setTimeout(() => resolve(null), 3000);
      });
    }
  } catch (e) {
    console.warn('⚠️ Auth not available');
  }
  
  storage.userId = authUser?.uid || null;
  console.log('🔧 [AdmPembelajaran] storage.userId:', storage.userId?.substring(0, 10) + '...');
  
  dokumenList = await storage.loadDokumen();
  console.log('✅ [AdmPembelajaran] Dokumen loaded:', dokumenList.length);
  
  container.innerHTML = getMainTemplate();
  container.classList.remove('hidden');
  
  document.querySelectorAll('.dashboard-hero, [aria-labelledby="rooms-heading"], #sd-section, #smp-section, #sma-section')
    .forEach(el => el?.closest('section')?.classList.add('hidden'));
  
  window.admPembelajaran.showSection('section1');
  
  console.log('✅ [AdmPembelajaran] Module rendered successfully');
};

// ============================================
// ✅ MAIN OBJECT: window.admPembelajaran
// ============================================
window.admPembelajaran = {
  
  showSection: function(sectionId) {
    console.log('👁️ [AdmPembelajaran] showSection:', sectionId);
    
    document.querySelectorAll('.pembelajaran-section').forEach(s => s.classList.add('hidden'));
    
    const target = document.getElementById(sectionId);
    if (target) {
      target.classList.remove('hidden');
      activeSection = sectionId;
    }
    
    document.querySelectorAll('.nav-section-btn').forEach(btn => {
      btn.classList.remove('bg-indigo-600', 'text-white');
      btn.classList.add('bg-slate-100', 'text-slate-600');
    });
    const activeBtn = document.querySelector(`.nav-section-btn[data-section="${sectionId}"]`);
    if (activeBtn) {
      activeBtn.classList.remove('bg-slate-100', 'text-slate-600');
      activeBtn.classList.add('bg-indigo-600', 'text-white');
    }
    
    if (sectionId === 'section1') {
      document.getElementById('section1-content').innerHTML = renderSection1Content(dokumenList);
    } else if (sectionId === 'section2') {
      document.getElementById('section2-content').innerHTML = renderSection2Content();
    } else if (sectionId === 'section3') {
      document.getElementById('section3-content').innerHTML = renderSection3Content();
    }
  },
  
  viewDokumen: async function(docId) {
    try {
      const doc = await storage.getDokumenById(docId);
      if (!doc) return alert('❌ Dokumen tidak ditemukan!');
      
      const viewWindow = window.open('', '', 'height=800,width=1000');
      viewWindow.document.write(`
        <html><head><title>${escapeHtml(doc.judul)}</title>
        <style>body{font-family:Arial,sans-serif;padding:40px;max-width:800px;margin:0 auto;}h1{color:#1e293b;margin-bottom:20px;}.meta{color:#64748b;font-size:14px;margin-bottom:30px;}.content{line-height:1.8;color:#334155;}</style>
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
      console.error('❌ viewDokumen error:', e);
      alert('❌ Gagal membuka dokumen: ' + e.message);
    }
  },
  
  downloadDokumen: async function(docId) {
    try {
      const doc = await storage.getDokumenById(docId);
      if (!doc) return alert('❌ Dokumen tidak ditemukan!');
      
      const content = `${doc.judul}\n${'='.repeat(50)}\n\nJenis: ${doc.jenis}\nJenjang: ${doc.jenjang}\nKelas: ${doc.kelas}\nMapel: ${doc.mapel}\n\n${'='.repeat(50)}\n\n${doc.konten}`;
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
      console.error('❌ downloadDokumen error:', e);
      alert('❌ Gagal download: ' + e.message);
    }
  },
  
  deleteDokumen: async function(docId) {
    if (!confirm('Hapus dokumen ini?')) return;
    try {
      await storage.deleteDokumen(docId);
      dokumenList = dokumenList.filter(d => d.id !== docId);
      this.showSection(activeSection);
      alert('✅ Dokumen berhasil dihapus!');
    } catch (e) {
      console.error('❌ deleteDokumen error:', e);
      alert('❌ Gagal menghapus: ' + e.message);
    }
  },
  
  refreshDokumen: async function() {
    console.log('🔄 [AdmPembelajaran] Refreshing dokumen...');
    dokumenList = await storage.loadDokumen();
    this.showSection(activeSection);
  },
  
  backToDashboard: function() {
    const container = document.getElementById('module-container');
    if (container) {
      container.innerHTML = '';
      container.classList.add('hidden');
    }
    document.querySelectorAll('.dashboard-hero, [aria-labelledby="rooms-heading"]')
      .forEach(el => el?.closest('section')?.classList.remove('hidden'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

console.log('🟢 [AdmPembelajaran] Module FINISHED - 3 Independent Sections');
