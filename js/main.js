/**
 * ============================================
 * GLOBAL INITIALIZATION - main.js
 * Platform Administrasi Kelas Digital
 * ============================================
 */

// ============================================
// DOM READY INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Platform Administrasi Kelas loaded');
    initAccessibility();
    initSmoothScroll();
    initFadeInAnimations();
    logEnvironmentInfo();
});

// ============================================
// ACCESSIBILITY ENHANCEMENTS
// ============================================

function initAccessibility() {
    const skipLink = document.querySelector('a[href="#main-content"]');
    if (skipLink) {
        skipLink.addEventListener('click', (e) => {
            e.preventDefault();
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                mainContent.setAttribute('tabindex', '-1');
                mainContent.focus();
            }
        });
    }
    
    const currentPath = window.location.pathname.split('/').pop();
    document.querySelectorAll('nav a[href]').forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath === currentPath) {
            link.setAttribute('aria-current', 'page');
        }
    });
    
    console.log('♿ Accessibility features initialized');
}

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                history.pushState(null, null, href);
            }
        });
    });
}

// ============================================
// FADE-IN ANIMATIONS ON SCROLL
// ============================================

function initFadeInAnimations() {
    if (!('IntersectionObserver' in window)) {
        document.querySelectorAll('.fade-in').forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
        return;
    }
    
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.feature-card, .step-card, .benefit-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(10px)';
        el.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        observer.observe(el);
    });
}

// ============================================
// ENVIRONMENT LOGGING
// ============================================

function logEnvironmentInfo() {
    console.group('🔍 Environment Info');
    console.log('📱 Device:', getDeviceType());
    console.log('🌐 URL:', window.location.href);
    console.log('🕐 Loaded:', new Date().toLocaleTimeString('id-ID'));
    console.log('📦 CSS loaded:', document.styleSheets.length, 'stylesheets');
    console.log('📦 Scripts loaded:', document.scripts.length, 'scripts');
    console.groupEnd();
}

function getDeviceType() {
    const width = window.innerWidth;
    if (width < 768) return 'Mobile';
    if (width < 1024) return 'Tablet';
    if (width < 1280) return 'Laptop';
    return 'Desktop';
}

// ============================================
// GLOBAL ERROR HANDLERS
// ============================================

window.addEventListener('error', (event) => {
    console.error('❌ Global error:', {
        message: event.message,
        source: event.filename,
        line: event.lineno,
        column: event.colno,
        error: event.error
    });
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Unhandled promise rejection:', event.reason);
});

// ============================================
// UTILITY FUNCTIONS (Local + Window + Export)
// ============================================

// ✅ showAlert
function showAlert(type, message, duration = 5000) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} fade-in`;
    alert.setAttribute('role', 'alert');
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle'
    };
    
    alert.innerHTML = `
        <i class="fas ${icons[type] || icons.info} mr-2" aria-hidden="true"></i>
        <span>${message}</span>
        <button class="alert-close" aria-label="Tutup" style="margin-left: auto; background: none; border: none; color: inherit; cursor: pointer;">
            <i class="fas fa-times" aria-hidden="true"></i>
        </button>
    `;
    
    Object.assign(alert.style, {
        position: 'fixed', top: '1rem', right: '1rem', left: '1rem',
        maxWidth: '28rem', margin: '0 auto', padding: '1rem 1.25rem',
        borderRadius: '0.5rem', backgroundColor: getAlertBgColor(type),
        color: getAlertTextColor(type), borderLeft: '4px solid',
        borderLeftColor: getAlertBorderColor(type), display: 'flex',
        alignItems: 'center', gap: '0.5rem', zIndex: '100',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    });
    
    const closeBtn = alert.querySelector('.alert-close');
    if (closeBtn) closeBtn.addEventListener('click', () => alert.remove());
    
    document.body.appendChild(alert);
    
    if (duration > 0) {
        setTimeout(() => {
            alert.style.opacity = '0';
            alert.style.transition = 'opacity 0.2s ease';
            setTimeout(() => alert.remove(), 200);
        }, duration);
    }
    
    return alert;
}
window.showAlert = showAlert;

function getAlertBgColor(type) {
    const colors = { success: '#f0fdf4', error: '#fef2f2', info: '#eff6ff', warning: '#fefce8' };
    return colors[type] || colors.info;
}

function getAlertTextColor(type) {
    const colors = { success: '#166534', error: '#991b1b', info: '#1e40af', warning: '#854d0e' };
    return colors[type] || colors.info;
}

function getAlertBorderColor(type) {
    const colors = { success: '#22c55e', error: '#ef4444', info: '#3b82f6', warning: '#eab308' };
    return colors[type] || colors.info;
}

// ✅ confirmAction
const confirmAction = (message = 'Apakah Anda yakin?') => {
    return new Promise((resolve) => {
        const result = confirm(message);
        resolve(result);
    });
};
window.confirmAction = confirmAction;

// ✅ copyToClipboard
const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        window.showAlert('success', 'Teks berhasil disalin!', 2000);
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        window.showAlert('error', 'Gagal menyalin teks', 3000);
        return false;
    }
};
window.copyToClipboard = copyToClipboard;

// ✅ formatDate
const formatDate = (date, options = {}) => {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '-';
    const defaultOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return d.toLocaleDateString('id-ID', { ...defaultOptions, ...options });
};
window.formatDate = formatDate;

// ✅ formatRupiah
const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(amount);
};
window.formatRupiah = formatRupiah;
// ============================================
// PROTSMA GLOBAL HELPERS
// ============================================

// ✅ FIX 1: Buat cek status user - dipake protsma.js
window.isUserApproved = () => {
    return window.currentUserData?.status === 'approved' || window.currentUserRole === 'admin';
};

// ✅ FIX 2: Tombol Kembali ke Dashboard - dipake protsma.js  
window.backToDashboard = () => {
    const protsmaContainer = document.getElementById('protsma-container');
    const dashboardContainer = document.getElementById('dashboard-container');
    
    if (protsmaContainer) protsmaContainer.innerHTML = '';
    if (dashboardContainer) dashboardContainer.style.display = 'block';
    
    // Scroll ke atas
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ✅ FIX 3: Expose currentUserData global biar protsma.js bisa baca
window.currentUserData = window.currentUserData || null;
window.currentUserRole = window.currentUserRole || null;

// Set data user pas login di dashboard.js
document.addEventListener('userDataReady', (e) => {
    window.currentUserData = e.detail.userData;
    window.currentUserRole = e.detail.role;
});

// ============================================
// EXPORT FOR MODULE USAGE
// ============================================

// ✅ Semua fungsi sekarang didefinisikan sebagai local variable, jadi bisa di-export
export {
    initAccessibility,
    initSmoothScroll,
    initFadeInAnimations,
    showAlert,
    confirmAction,
    copyToClipboard,
    formatDate,
    formatRupiah
};
