/**
 * UTILS: Helper functions for adm-pembelajaran module
 */

export function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export function generateId(prefix = 'doc') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function formatDate(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID');
}

export function formatDateTime(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('id-ID');
}

export function truncateText(str, maxLength = 100) {
  if (!str) return '';
  return str.length <= maxLength ? str : str.substring(0, maxLength) + '...';
}

export function sanitizeFilename(str) {
  if (!str) return 'dokumen';
  return str.replace(/[^a-z0-9]/gi, '_');
}

console.log('✅ [Utils-Pembelajaran] Loaded - Shared helpers');
