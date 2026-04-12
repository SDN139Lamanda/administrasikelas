/**
 * UTILS: Helper functions for adm-kelas module
 */

export function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

export function parseGender(value) {
  const v = String(value || '').toLowerCase().trim();
  if (['l', 'laki-laki', 'pria', 'male'].includes(v)) return 'L';
  if (['p', 'perempuan', 'wanita', 'female'].includes(v)) return 'P';
  return 'L';
}

export function calculatePercentage(part, total) {
  if (!total || total === 0) return 0;
  return Math.round((part / total) * 100);
}

export function getStatusColor(status) {
  const map = {
    'H': 'bg-emerald-100 text-emerald-700',
    'I': 'bg-blue-100 text-blue-700',
    'S': 'bg-amber-100 text-amber-700',
    'A': 'bg-rose-100 text-rose-700',
    'B': 'bg-rose-100 text-rose-700 text-white'
  };
  return map[status] || 'bg-slate-100 text-slate-700';
}

console.log('✅ [Utils] Loaded - adm-kelas helpers');
