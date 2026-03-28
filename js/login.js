/**
 * ============================================
 * LOGIN FORM LOGIC - login.js
 * Platform Administrasi Kelas Digital
 * ============================================
 */

import { loginUser } from '../modules/auth-login.js';

// ============================================
// DOM ELEMENTS
// ============================================
let loginForm, emailInput, passwordInput, submitBtn, loadingBtn, formAlert;

// ============================================
// INIT: Wait for DOM to be fully loaded
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('📋 Login page DOM loaded');
    
    // Get DOM elements
    loginForm = document.getElementById('loginForm');
    emailInput = document.getElementById('email');
    passwordInput = document.getElementById('password');
    submitBtn = document.getElementById('submitBtn');
    loadingBtn = document.getElementById('loadingBtn');
    formAlert = document.getElementById('formAlert');
    
    // Debug log
    console.log('🔍 Elements:', {
        loginForm: !!loginForm,
        emailInput: !!emailInput,
        passwordInput: !!passwordInput
    });
    
    // Attach form submit handler
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
        console.log('✅ Form submit handler attached');
    }
    
    // Real-time validation on input
    if (emailInput) {
        emailInput.addEventListener('input', () => clearError('email'));
        emailInput.addEventListener('blur', () => validateField('email'));
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('input', () => clearError('password'));
        passwordInput.addEventListener('blur', () => validateField('password'));
    }
    
    // Check if user already logged in
    checkExistingSession();
});

// ============================================
// FUNGSI: Check Existing Session
// ============================================
function checkExistingSession() {
    try {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (currentUser && currentUser.uid) {
            console.log('✅ User already logged in:', currentUser.email);
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        }
    } catch (e) {
        console.warn('⚠️ No existing session');
    }
}

// ============================================
// FUNGSI: Toggle Password Visibility
// ============================================
window.togglePassword = (fieldId) => {
    const input = document.getElementById(fieldId);
    const icon = document.getElementById(`toggle${fieldId.charAt(0).toUpperCase() + fieldId.slice(1)}Icon`);
    
    if (!input || !icon) return;
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
};

// ============================================
// FUNGSI: Validation Helpers
// ============================================
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

function showError(fieldId, message) {
    const input = document.getElementById(fieldId);
    const errorEl = document.getElementById(`error-${fieldId}`);
    
    if (input) {
        input.classList.add('error');
        input.setAttribute('aria-invalid', 'true');
    }
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('visible');
        errorEl.setAttribute('role', 'alert');
    }
}

function clearError(fieldId) {
    const input = document.getElementById(fieldId);
    const errorEl = document.getElementById(`error-${fieldId}`);
    
    if (input) {
        input.classList.remove('error');
        input.removeAttribute('aria-invalid');
    }
    if (errorEl) {
        errorEl.textContent = '';
        errorEl.classList.remove('visible');
    }
}

function validateField(fieldId) {
    const input = document.getElementById(fieldId);
    if (!input) return true;
    
    const value = input.value.trim();
    
    switch(fieldId) {
        case 'email':
            if (!value) {
                showError('email', 'Email wajib diisi');
                return false;
            } else if (!validateEmail(value)) {
                showError('email', 'Format email tidak valid');
                return false;
            }
            break;
        case 'password':
            if (!value) {
                showError('password', 'Password wajib diisi');
                return false;
            }
            break;
    }
    
    clearError(fieldId);
    return true;
}

function showAlert(type, message) {
    if (!formAlert) return;
    
    formAlert.className = `alert alert-${type}`;
    formAlert.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2" aria-hidden="true"></i>
        <span>${message}</span>
    `;
    formAlert.classList.remove('hidden');
    
    // Auto-hide success alerts after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            formAlert.classList.add('hidden');
        }, 5000);
    }
}

function hideAlert() {
    if (formAlert) {
        formAlert.classList.add('hidden');
    }
}

// ============================================
// FUNGSI: Handle Login Submit
// ============================================
async function handleLoginSubmit(e) {
    e.preventDefault();
    
    console.log('🔐 Login submit triggered');
    
    // Hide previous alerts
    hideAlert();
    
    // Validate form
    const isEmailValid = validateField('email');
    const isPasswordValid = validateField('password');
    
    if (!isEmailValid || !isPasswordValid) {
        console.log('❌ Validation failed');
        showAlert('error', 'Mohon periksa kembali email dan password Anda');
        
        // Focus first error field
        const firstError = document.querySelector('.form-input.error');
        if (firstError) {
            firstError.focus();
        }
        return;
    }
    
    console.log('✅ Validation passed');
    
    // Show loading state
    if (submitBtn) submitBtn.classList.add('hidden');
    if (loadingBtn) loadingBtn.classList.remove('hidden');
    
    // Get form data
    const email = emailInput?.value.trim();
    const password = passwordInput?.value;
    const remember = document.getElementById('remember')?.checked;
    
    console.log('📦 Login attempt:', { email, remember });
    
    try {
        // Call login function from module
        const result = await loginUser(email, password);
        
        if (result.success) {
            console.log('✅ Login successful');
            
            // Save user data to session storage
            sessionStorage.setItem('currentUser', JSON.stringify(result.user));
            
            // Show success message
            showAlert('success', 'Login berhasil! Mengalihkan ke dashboard...');
            
            // Redirect to dashboard after short delay
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            console.error('❌ Login failed:', result.error);
            showAlert('error', result.error || 'Login gagal. Silakan coba lagi.');
            
            // Reset button state
            if (submitBtn) submitBtn.classList.remove('hidden');
            if (loadingBtn) loadingBtn.classList.add('hidden');
            
            // Focus password field for retry
            if (passwordInput) {
                passwordInput.focus();
                passwordInput.select();
            }
        }
    } catch (error) {
        console.error('❌ Login error:', error);
        showAlert('error', error.message || 'Terjadi kesalahan. Silakan coba lagi.');
        
        // Reset button state
        if (submitBtn) submitBtn.classList.remove('hidden');
        if (loadingBtn) loadingBtn.classList.add('hidden');
    }
}

// ============================================
// EXPORT FOR GLOBAL ACCESS
// ============================================
window.togglePassword = togglePassword;
