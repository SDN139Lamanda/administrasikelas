// ✅ REPLACE fungsi populateMapelDropdown() DI cta-generator.js DENGAN INI:

async function populateMapelDropdown(jenjang, userMapelFromReg = null, userData = null) {
  const mapelSelect = document.getElementById('cta-mapel');
  if (!mapelSelect || !jenjang) return;
  
  const originalValue = mapelSelect.value;
  mapelSelect.innerHTML = '<option value="">Memuat daftar mapel...</option>';
  mapelSelect.disabled = true;
  
  try {
    const mapelList = await fetchMapelData(jenjang);
    mapelSelect.innerHTML = '<option value="">Pilih Mata Pelajaran</option>';
    
    // ✅ DEBUG: Lihat apa yang sebenarnya terbaca
    console.log('🔍 [Mapel Debug] userData:', userData);
    console.log('🔍 [Mapel Debug] localStorage sd_mapel_type:', localStorage.getItem('user_sd_mapel_type'));
    console.log('🔍 [Mapel Debug] localStorage mapel_yang_diampu:', localStorage.getItem('user_mapel_yang_diampu'));

    // ✅ DETERMINE FILTER RULE (ROBUST + FALLBACK)
    const getFilterRule = () => {
      if (!userData) return { type: 'none' };
      
      // Ambil dari userData dulu
      let { jenjang_sekolah, sd_mapel_type, mapel_yang_diampu, role } = userData;
      
      // ✅ FALLBACK ke localStorage jika userData kosong/parsial
      if (!jenjang_sekolah) jenjang_sekolah = localStorage.getItem('user_jenjang') || jenjang_sekolah;
      if (!sd_mapel_type) sd_mapel_type = localStorage.getItem('user_sd_mapel_type') || sd_mapel_type;
      if (!mapel_yang_diampu) {
        try { mapel_yang_diampu = JSON.parse(localStorage.getItem('user_mapel_yang_diampu') || '[]'); } 
        catch(e) { mapel_yang_diampu = []; }
      }
      if (!role) role = localStorage.getItem('user_role') || 'teacher';

      console.log('🔧 [Mapel Debug] Resolved Data:', { jenjang_sekolah, sd_mapel_type, mapel_yang_diampu, role });

      if (role === 'admin') return { type: 'none' };
      if (jenjang_sekolah === 'tk') return { type: 'none' };

      // SD/MI Guru Kelas: EXCLUDE PAI/PJOK/PAIBD
      if (['sd', 'mi'].includes(jenjang_sekolah) && sd_mapel_type?.toLowerCase() === 'kelas') {
        return { type: 'exclude', values: ['pai', 'pjok', 'paibd', 'pendidikan agama', 'pendidikan jasmani'] };
      }

      // SD/MI Guru Mapel: Ambil dari sd_mapel_type ATAU mapel_yang_diampu[0]
      let targetMapel = '';
      if (sd_mapel_type && sd_mapel_type.toLowerCase() !== 'kelas') {
        targetMapel = sd_mapel_type.toLowerCase();
      } else if (mapel_yang_diampu && mapel_yang_diampu.length > 0) {
        targetMapel = mapel_yang_diampu[0].toLowerCase();
      }

      if (['sd', 'mi'].includes(jenjang_sekolah) && targetMapel) {
        console.log('🎯 [Mapel Debug] Guru Mapel detected. Filtering to:', targetMapel);
        return { type: 'include', values: [targetMapel] };
      }

      // SMP/MTs/SMA/MA
      if (['smp', 'mts', 'sma', 'ma'].includes(jenjang_sekolah) && mapel_yang_diampu?.length > 0) {
        return { type: 'include', values: mapel_yang_diampu.map(m => (m || '').toLowerCase()) };
      }

      return { type: 'none' };
    };
    
    const filterRule = getFilterRule();
    console.log('🔍 [Mapel] Final Filter Rule:', filterRule);
    
    mapelList.forEach(item => {
      const namaLower = (item.nama || '').toLowerCase();
      
      // ✅ APPLY ROBUST FILTER
      if (filterRule.type === 'exclude' && filterRule.values.some(v => namaLower.includes(v))) {
        return; // Skip
      }
      if (filterRule.type === 'include' && !filterRule.values.some(v => namaLower.includes(v) || v.includes(namaLower))) {
        return; // Skip
      }
      
      const opt = document.createElement('option');
      opt.value = item.nama;
      opt.textContent = item.nama;
      mapelSelect.appendChild(opt);
    });
    
    // ✅ AUTO-LOCK (UNCHANGED)
    if (userMapelFromReg) {
      const match = Array.from(mapelSelect.options).find(opt => 
        (opt.value || '').toLowerCase().includes(userMapelFromReg.toLowerCase()) || 
        (opt.textContent || '').toLowerCase().includes(userMapelFromReg.toLowerCase())
      );
      if (match) {
        mapelSelect.value = match.value;
        mapelSelect.disabled = true;
        const lockBadge = document.createElement('span');
        lockBadge.className = 'lock-indicator';
        lockBadge.innerHTML = `<i class="fas fa-lock text-emerald-600"></i> <strong>${userMapelFromReg}</strong> - Terkunci`;
        lockBadge.style.cssText = 'display:block;margin-top:6px;font-size:12px;color:#059669';
        const existingBadge = mapelSelect.parentNode.querySelector('.lock-indicator');
        if (existingBadge) existingBadge.remove();
        mapelSelect.parentNode.appendChild(lockBadge);
      } else {
        mapelSelect.disabled = false;
      }
    } else {
      if (originalValue && Array.from(mapelSelect.options).some(opt => opt.value === originalValue)) {
        mapelSelect.value = originalValue;
      }
      mapelSelect.disabled = false;
    }    
  } catch (error) {
    console.error('❌ [Mapel] Populate error:', error);
    mapelSelect.innerHTML = '<option value="">Gagal memuat mapel</option>';
    mapelSelect.disabled = false;
  }
}
// ✅ FALLBACK: Pastikan renderCitaGenerator tersedia secara global
if (typeof window.renderCitaGenerator !== 'function') {
  console.warn('⚠️ [CTA Generator] window.renderCitaGenerator not found, defining fallback...');
  window.renderCitaGenerator = async function(jenjang, kelas, semester) {
    alert('⚠️ Modul CTA Generator sedang dimuat. Silakan refresh halaman jika tidak muncul.');
    console.log('🔄 [CTA Generator] Fallback render called with:', { jenjang, kelas, semester });
  };
}

// ✅ DEBUG: Tambahkan listener global untuk deteksi klik
document.addEventListener('click', function(e) {
  if (e.target.closest('[data-cta-trigger]') || e.target.id === 'btn-cta-generator' || e.target.textContent?.includes('CTA Generator')) {
    console.log('🖱️ [CTA Debug] Click detected on CTA trigger');
    console.log('🖱️ [CTA Debug] window.renderCitaGenerator exists:', typeof window.renderCitaGenerator === 'function');
  }
}, true);

// ✅ AUTO-CHECK: Jalankan check 3 detik setelah load
setTimeout(() => {
  console.log('🔍 [CTA Debug] Auto-check: window.renderCitaGenerator =', typeof window.renderCitaGenerator);
  if (typeof window.renderCitaGenerator === 'function') {
    console.log('✅ [CTA Debug] Function is ready');
  } else {
    console.error('❌ [CTA Debug] Function NOT ready - check module import/router');
  }
}, 3000);
