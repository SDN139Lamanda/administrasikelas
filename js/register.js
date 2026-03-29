/**
 * ============================================
 * REGISTER FORM LOGIC - register.js
 * Platform Administrasi Kelas Digital
 * ============================================
 */

import { registerGuru } from '../modules/auth-register.js';

// ============================================
// DOM ELEMENTS
// ============================================
let registerForm, jenjangSelect, sdRoleGroup, sdRoleSelect, kelasGroup, kelasSelect, 
    mapelSDGroup, mapelSDSelect, mapelSMPGroup, mapelSMPSelect, mapelSMAGroup, mapelSMASelect,
    submitBtn, loadingBtn, formAlert;

// ============================================
// INIT: Wait for DOM to be fully loaded
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('📋 Register page DOM loaded');
    
    // Get DOM elements
    registerForm = document.getElementById('registerForm');
    jenjangSelect = document.getElementById('jenjang');
    sdRoleGroup = document.getElementById('sdRoleGroup');
    sdRoleSelect = document.getElementById('sdRole');
    kelasGroup = document.getElementById('kelasGroup');
    kelasSelect = document.getElementById('kelas');
    mapelSDGroup = document.getElementById('mapelSDGroup');
    mapelSDSelect = document.getElementById('mataPelajaranSD');
    mapelSMPGroup = document.getElementById('mapelSMPGroup');
    mapelSMPSelect = document.getElementById('mataPelajaranSMP');
    mapelSMAGroup = document.getElementById('mapelSMAGroup');
    mapelSMASelect = document.getElementById('mataPelajaranSMA');
    submitBtn = document.getElementById('submitBtn');
    loadingBtn = document.getElementById('loadingBtn');
    formAlert = document.getElementById('formAlert');
    
    // Attach event listener for jenjang change
    if (jenjangSelect) {
        jenjangSelect.addEventListener('change', handleJenjangChange);
    }
    
    // Attach event listener for SD role change
    if (sdRoleSelect) {
        sdRoleSelect.addEventListener('change', handleSDRoleChange);
    }
    
    // Attach form submit handler
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterSubmit);
    }
    
    // Real-time validation
    document.querySelectorAll('.form-input').forEach(input => {
        input?.addEventListener('input', () => clearError(input.id));
    });
    
    // Initial check
    if (jenjangSelect?.value) {
        handleJenjangChange({ target: jenjangSelect });
    }
});

// ============================================
// FUNGSI: Handle Jenjang Change
// ============================================
function handleJenjangChange(e) {
    const jenjang = e.target?.value;
    
    console.log('🔄 Jenjang changed to:', jenjang);
    
    // Reset all conditional fields
    resetConditionalFields();
    
    // Show/hide based on jenjang
    if (jenjang === 'sd') {
        // ✅ SD: Show role selection
        if (sdRoleGroup) sdRoleGroup.classList.remove('hidden');
        if (sdRoleSelect) sdRoleSelect.setAttribute('aria-required', 'true');
        if (sdRoleSelect) sdRoleSelect.required = true;
    } else if (jenjang === 'smp') {
        // ✅ SMP: Show mapel SMP
        if (mapelSMPGroup) mapelSMPGroup.classList.remove('hidden');
        if (mapelSMPSelect) mapelSMPSelect.setAttribute('aria-required', 'true');
        if (mapelSMPSelect) mapelSMPSelect.required = true;
    } else if (jenjang === 'sma') {
        // ✅ SMA: Show mapel SMA
        if (mapelSMAGroup) mapelSMAGroup.classList.remove('hidden');
        if (mapelSMASelect) mapelSMASelect.setAttribute('aria-required', 'true');
        if (mapelSMASelect) mapelSMASelect.required = true;
    } else {
        // No jenjang selected
        if (sdRoleGroup) sdRoleGroup.classList.add('hidden');
        if (mapelSMPGroup) mapelSMPGroup.classList.add('hidden');
        if (mapelSMAGroup) mapelSMAGroup.classList.add('hidden');
    }
}

// ============================================
// FUNGSI: Handle SD Role Change
// ============================================
function handleSDRoleChange(e) {
    const sdRole = e.target?.value;
    
    console.log('🔄 SD Role changed to:', sdRole);
    
    // Reset kelas & mapel SD
    if (kelasGroup) kelasGroup.classList.add('hidden');
    if (mapelSDGroup) mapelSDGroup.classList.add('hidden');
    if (kelasSelect) {
        kelasSelect.value = '';
        kelasSelect.required = false;
        kelasSelect.setAttribute('aria-required', 'false');
    }
    if (mapelSDSelect) {
        mapelSDSelect.value = '';
        mapelSDSelect.required = false;
        mapelSDSelect.setAttribute('aria-required', 'false');
    }
    
    // Show based on role
    if (sdRole === 'guru_kelas') {
        // Guru Kelas → Show kelas selection
        if (kelasGroup) kelasGroup.classList.remove('hidden');
        if (kelasSelect) kelasSelect.required = true;
        if (kelasSelect) kelasSelect.setAttribute('aria-required', 'true');
    } else if (sdRole === 'guru_agama' || sdRole === 'guru_mapel') {
        // Guru Agama/Mapel → Show mapel SD
        if (mapelSDGroup) mapelSDGroup.classList.remove('hidden');
        if (mapelSDSelect) mapelSDSelect.required = true;
        if (mapelSDSelect) mapelSDSelect.setAttribute('aria-required', 'true');
    }
}

// ============================================
// FUNGSI: Reset Conditional Fields
// ============================================
function resetConditionalFields() {
    // Hide all groups
    if (sdRoleGroup) sdRoleGroup.classList.add('hidden');
    if (kelasGroup) kelasGroup.classList.add('hidden');
    if (mapelSDGroup) mapelSDGroup.classList.add('hidden');
    if (mapelSMPGroup) mapelSMPGroup.classList.add('hidden');
    if (mapelSMAGroup) mapelSMAGroup.classList.add('hidden');
    
    // Reset values
    if (sdRoleSelect) sdRoleSelect.value = '';
    if (kelasSelect) kelasSelect.value = '';
    if (mapelSDSelect) mapelSDSelect.value = '';
    if (mapelSMPSelect) mapelSMPSelect.value = '';
    if (mapelSMASelect) mapelSMASelect.value = '';
    
    // Reset required
    [sdRoleSelect, kelasSelect, mapelSDSelect, mapelSMPSelect, mapelSMASelect].forEach(select => {
        if (select) {
            select.required = false;
            select.setAttribute('aria-required', 'false');
        }
    });
    
    // Clear errors
    ['sdRole', 'kelas', 'mataPelajaranSD', 'mataPelajaranSMP', 'mataPelajaranSMA'].forEach(fieldId => {
        clearError(fieldId);
    });
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

function validatePhone(phone) {
    const re = /^08[0-9]{8,11}$/;
    return re.test(phone);
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
        case 'noHp':
            if (!value) {
                showError('noHp', 'Nomor WhatsApp wajib diisi');
                return false;
            } else if (!validatePhone(value)) {
                showError('noHp', 'Format nomor tidak valid (08xxxxxxxxxx)');
                return false;
            }
            break;
        case 'password':
            if (!value) {
                showError('password', 'Password wajib diisi');
                return false;
            } else if (value.length < 8) {
                showError('password', 'Password minimal 8 karakter');
                return false;
            }
            break;
        case 'confirmPassword':
            const password = document.getElementById('password')?.value;
            if (!value) {
                showError('confirmPassword', 'Konfirmasi password wajib diisi');
                return false;
            } else if (value !== password) {
                showError('confirmPassword', 'Password tidak sama');
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
    
    if (type === 'success') {
        setTimeout(() => formAlert.classList.add('hidden'), 5000);
    }
}

function hideAlert() {
    if (formAlert) formAlert.classList.add('hidden');
}

function validateForm() {
    let isValid = true;
    const jenjang = jenjangSelect?.value;
    
    // Nama Lengkap
    const namaLengkap = document.getElementById('namaLengkap')?.value.trim();
    if (!namaLengkap) {
        showError('namaLengkap', 'Nama lengkap wajib diisi');
        isValid = false;
    } else clearError('namaLengkap');
    
    // Email
    if (!validateField('email')) isValid = false;
    
    // No HP
    if (!validateField('noHp')) isValid = false;
    
    // Jenjang
    if (!jenjang) {
        showError('jenjang', 'Jenjang pendidikan wajib dipilih');
        isValid = false;
    } else clearError('jenjang');
    
    // Conditional validation based on jenjang
    if (jenjang === 'sd') {
        const sdRole = sdRoleSelect?.value;
        if (!sdRole) {
            showError('sdRole', 'Peran di SD wajib dipilih');
            isValid = false;
        } else {
            clearError('sdRole');
            
            if (sdRole === 'guru_kelas') {
                const kelas = kelasSelect?.value;
                if (!kelas) {
                    showError('kelas', 'Kelas wajib dipilih');
                    isValid = false;
                } else clearError('kelas');
            } else if (sdRole === 'guru_agama' || sdRole === 'guru_mapel') {
                const mapel = mapelSDSelect?.value;
                if (!mapel) {
                    showError('mataPelajaranSD', 'Mata pelajaran wajib dipilih');
                    isValid = false;
                } else clearError('mataPelajaranSD');
            }
        }
    } else if (jenjang === 'smp') {
        const mapel = mapelSMPSelect?.value;
        if (!mapel) {
            showError('mataPelajaranSMP', 'Mata pelajaran wajib dipilih');
            isValid = false;
        } else clearError('mataPelajaranSMP');
    } else if (jenjang === 'sma') {
        const mapel = mapelSMASelect?.value;
        if (!mapel) {
            showError('mataPelajaranSMA', 'Mata pelajaran wajib dipilih');
            isValid = false;
        } else clearError('mataPelajaranSMA');
    }
    
    // Sekolah
    const sekolah = document.getElementById('sekolah')?.value.trim();
    if (!sekolah) {
        showError('sekolah', 'Nama sekolah wajib diisi');
        isValid = false;
    } else clearError('sekolah');
    
    // Password
    if (!validateField('password')) isValid = false;
    
    // Confirm Password
    if (!validateField('confirmPassword')) isValid = false;
    
    // Terms
    const terms = document.getElementById('terms')?.checked;
    if (!terms) {
        showError('terms', 'Anda harus menyetujui syarat & ketentuan');
        isValid = false;
    } else clearError('terms');
    
    return isValid;
}

// ============================================
// FUNGSI: Handle Register Submit
// ============================================
async function handleRegisterSubmit(e) {
    e.preventDefault();
    hideAlert();
    
    if (!validateForm()) {
        showAlert('error', 'Mohon periksa kembali semua field yang wajib diisi');
        const firstError = document.querySelector('.form-input.error');
        if (firstError) firstError.focus();
        return;
    }
    
    // Show loading
    if (submitBtn) submitBtn.classList.add('hidden');
    if (loadingBtn) loadingBtn.classList.remove('hidden');
    
    // Collect form data
    const jenjang = jenjangSelect?.value;
    const sdRole = sdRoleSelect?.value;
    
    const formData = {
        namaLengkap: document.getElementById('namaLengkap')?.value.trim(),
        email: document.getElementById('email')?.value.trim(),
        noHp: document.getElementById('noHp')?.value.trim(),
        jenjang: jenjang,
        sekolah: document.getElementById('sekolah')?.value.trim(),
        password: document.getElementById('password')?.value,
        
        // Context-based fields
        sdRole: jenjang === 'sd' ? sdRole || null : null,
        kelas: jenjang === 'sd' && sdRole === 'guru_kelas' ? kelasSelect?.value || null : null,
        mataPelajaranSD: jenjang === 'sd' && (sdRole === 'guru_agama' || sdRole === 'guru_mapel') ? mapelSDSelect?.value || null : null,
        mataPelajaranSMP: jenjang === 'smp' ? mapelSMPSelect?.value || null : null,
        mataPelajaranSMA: jenjang === 'sma' ? mapelSMASelect?.value || null : null
    };
    
    console.log('📦 Register ', { ...formData, password: '[REDACTED]' });
    
    try {
        const result = await registerGuru(formData);
        
        if (result.success) {
            showAlert('success', `${result.message} Silakan cek email untuk verifikasi.`);
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            showAlert('error', result.error || 'Registrasi gagal.');
            if (submitBtn) submitBtn.classList.remove('hidden');
            if (loadingBtn) loadingBtn.classList.add('hidden');
        }
    } catch (error) {
        showAlert('error', error.message || 'Terjadi kesalahan.');
        if (submitBtn) submitBtn.classList.remove('hidden');
        if (loadingBtn) loadingBtn.classList.add('hidden');
    }
}

// Export
window.togglePassword = togglePassword;
