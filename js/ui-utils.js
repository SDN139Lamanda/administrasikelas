(function() {
  'use strict';
  window.GS_UI = {
    status(msg, type, targetId = 'gs-status') {
      const el = document.getElementById(targetId);
      if (!el) return;
      const icons = { loading: '🔄', success: '✅', error: '❌' };
      el.innerHTML = `<div class="gs-msg gs-${type}">${type==='loading'?'<span class="gs-spinner"></span>':icons[type]} ${msg}</div>`;
      if (type === 'success') setTimeout(() => { if(el.querySelector('.gs-success')) el.innerHTML = ''; }, 5000);
    },
    copyResults() {
      const soal = document.getElementById('gs-soal')?.textContent;
      const jawab = document.getElementById('gs-jawaban')?.textContent;
      if (!soal || soal.includes('Hasil soal akan muncul')) { this.status('⚠️ Belum ada hasil', 'error'); return; }
      navigator.clipboard.writeText(`=== SOAL ===\n${soal}\n\n=== KUNCI ===\n${jawab}`)
        .then(() => this.status('📋 Berhasil dicopy!', 'success'))
        .catch(() => this.status('❌ Gagal copy', 'error'));
    }
  };
})();
