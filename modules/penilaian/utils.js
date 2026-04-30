/**
 * PENILAIAN UTILS - Shared helpers
 * ✅ Pure functions, no side effects
 */

export function hitungNA(sIdx, jumlahPH, doc, prefix = '') {
  let totalPH = 0;
  for (let i = 0; i < jumlahPH; i++) {
    const el = doc.getElementById(`${prefix}ph_${sIdx}_${i}`);
    if (el) totalPH += parseFloat(el.value) || 0;
  }
  const rPH = jumlahPH > 0 ? totalPH / jumlahPH : 0;
  const sts = parseFloat(doc.getElementById(`${prefix}sts_${sIdx}`)?.value || 0);
  const sas = parseFloat(doc.getElementById(`${prefix}sas_${sIdx}`)?.value || 0);
  const na = Math.round((rPH * 2 + sts + sas) / 4);
  const elNa = doc.getElementById(`${prefix}na_${sIdx}`);
  return { na, elNa };
}

export function formatNilai(nilai, type = 'number') {
  if (type === 'number') return nilai != null ? Math.round(nilai) : '-';
  if (type === 'sikap') {
    const labels = { A: 'Sangat Baik', B: 'Baik', C: 'Cukup', D: 'Kurang' };
    return `${nilai} (${labels[nilai] || '-'})`;
  }
  return String(nilai);
}

export function showToast(message, type = 'info') {
  const colors = { success: 'bg-emerald-600', error: 'bg-rose-600', info: 'bg-blue-600' };
  const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
  document.querySelectorAll('.penilaian-toast').forEach(t => t.remove());
  const toast = document.createElement('div');
  toast.className = `penilaian-toast fixed bottom-4 right-4 ${colors[type]} text-white px-4 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2`;
  toast.innerHTML = `<i class="fas ${icons[type]}"></i><span>${message}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
}

console.log('✅ [Penilaian Utils] Loaded');
