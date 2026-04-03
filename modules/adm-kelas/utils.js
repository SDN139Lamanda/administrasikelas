/**
 * ============================================
 * UTILS: Helper Functions for Adm. Kelas Module
 * ============================================
 */

// ✅ Sanitize HTML to prevent XSS
export function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ✅ Generate unique ID (timestamp + random)
export function generateId(prefix = '') {
  return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ✅ Format date to Indonesian locale
export function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('id-ID', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// ✅ Parse Excel gender value
export function parseGender(value) {
  if (!value) return 'L';
  const v = value.toString().toUpperCase().trim();
  return ['L', 'P'].includes(v) ? v : 'L';
}

// ✅ Calculate attendance percentage
export function calculatePercentage(hadir, total) {
  if (total === 0) return 0;
  return Math.round((hadir / total) * 100);
}

// ✅ Get color class for status
export function getStatusColor(status) {
  const colors = {
    'H': 'text-emerald-500 bg-emerald-50',
    'I': 'text-blue-500 bg-blue-50',
    'S': 'text-amber-500 bg-amber-50',
    'A': 'text-rose-500 bg-rose-50',
    'B': 'text-slate-900 bg-slate-100'
  };
  return colors[status] || 'text-slate-500';
}

console.log('✅ [AdmKelas Utils] Loaded');
