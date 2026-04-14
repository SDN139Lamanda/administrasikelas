/**
 * PENILAIAN UTILS - Shared helpers
 * ✅ Pure functions, no side effects
 */

/**
 * Calculate NA (Nilai Akhir)
 * Formula: (avg(PH) × 2 + STS + SAS) / 4, rounded
 */
export function hitungNA(sIdx, jumlahPH, doc) {
  let totalPH = 0;
  for (let i = 0; i < jumlahPH; i++) {
    const el = doc.getElementById(`ph_${sIdx}_${i}`);
    if (el) totalPH += parseFloat(el.value) || 0;
  }
  
  const rPH = jumlahPH > 0 ? totalPH / jumlahPH : 0;
  const sts = parseFloat(doc.getElementById(`sts_${sIdx}`)?.value || 0);
  const sas = parseFloat(doc.getElementById(`sas_${sIdx}`)?.value || 0);
  const na = Math.round((rPH * 2 + sts + sas) / 4);
  
  const elNa = doc.getElementById(`na_${sIdx}`);
  
  return { na, elNa };
}

/**
 * Format nilai untuk display
 */
export function formatNilai(nilai, type = 'number') {
  if (type === 'number') {
    return nilai != null ? Math.round(nilai) : '-';
  }
  if (type === 'sikap') {
    const labels = { A: 'Sangat Baik', B: 'Baik', C: 'Cukup', D: 'Kurang' };
    return `${nilai} (${labels[nilai] || '-'})`;
  }
  return String(nilai);
}

/**
 * Toast notification helper
 */
export function showToast(message, type = 'info') {
  const colors = {
    success: 'bg-emerald-600',
    error: 'bg-rose-600', 
    info: 'bg-blue-600',
    warning: 'bg-amber-600'
  };
  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    info: 'fa-info-circle',
    warning: 'fa-exclamation-triangle'
  };
  
  // Remove existing toasts
  document.querySelectorAll('.penilaian-toast').forEach(t => t.remove());
  
  const toast = document.createElement('div');
  toast.className = `penilaian-toast fixed bottom-4 right-4 ${colors[type] || colors.info} text-white px-4 py-3 rounded-xl shadow-lg z-50 animate-fade-in flex items-center gap-2`;
  toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><span>${message}</span>`;
  
  document.body.appendChild(toast);
  
  // Auto-remove after 3s
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

console.log('✅ [Penilaian Utils] Loaded');
