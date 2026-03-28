
// ============================================
// MAIN INITIALIZATION - main.js
// ============================================

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Platform Administrasi Kelas loaded');
    
    // Add fade-in animation to sections on scroll (optional enhancement)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe feature cards and step cards for animation
    document.querySelectorAll('.feature-card, .step-card').forEach(card => {
        observer.observe(card);
    });
});

// Global error handler
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});
