/**
 * ============================================
 * REGISTER FORM LOGIC - register.js
 * Platform Administrasi Kelas Digital
 * ============================================
 */

import { registerGuru } from '../modules/auth-register.js';

// ============================================
// MATA PELAJARAN KURIKULUM MERDEKA
// ============================================
const MATA_PELAJARAN = {
    smp: [
        'Pendidikan Pancasila',
        'Bahasa Indonesia',
        'Matematika',
        'IPA (Ilmu Pengetahuan Alam)',
        'IPS (Ilmu Pengetahuan Sosial)',
        'Bahasa Inggris',
        'PJOK (Pendidikan Jasmani, Olahraga, dan Kesehatan)',
        'Seni Musik',
        'Seni Rupa',
        'Seni Tari',
        'Seni Teater',
        'Prakarya',
        'Informatika',
        'Bahasa Daerah',
        'Pendidikan Agama Islam',
        'Pendidikan Agama Kristen',
        'Pendidikan Agama Katolik',
        'Pendidikan Agama Hindu',
        'Pendidikan Agama Buddha',
        'Pendidikan Agama Khonghucu'
    ],
    sma: [
        'Pendidikan Pancasila',
        'Bahasa Indonesia',
        'Matematika',
        'Bahasa Inggris',
        'PJOK',
        'Seni Musik',
        'Seni Rupa',
        'Seni Tari',
        'Seni Teater',
        'Prakarya',
        'Informatika',
        'Fisika',
        'Kimia',
        'Biologi',
        'Geografi',
        'Sejarah',
        'Sosiologi',
        'Ekonomi',
        'Bahasa Jerman',
        'Bahasa Prancis',
        'Bahasa Arab',
        'Bahasa Jepang',
        'Bahasa Korea',
        'Bahasa Mandarin',
        'Pendidikan Agama Islam',
        'Pendidikan Agama Kristen',
        'Pendidikan Agama Katolik',
        'Pendidikan Agama Hindu',
        'Pendidikan Agama Buddha',
        'Pendidikan Agama Khonghucu'
    ]
};

// ============================================
// DOM ELEMENTS
// ============================================
let registerForm, jenjangSelect, kelasGroup, kelasSelect, mapelGroup, mapelSelect, submitBtn, loadingBtn, formAlert;

// ============================================
// INIT: Wait for DOM to be fully loaded
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('📋 Register page DOM loaded');
    
    // Get DOM elements
    registerForm = document.getElementById('registerForm');
    jenjangSelect = document.getElementById('jenjang');
    kelasGroup = document.getElementById('kelasGroup');
    kelasSelect = document.getElementById('kelas');
    mapelGroup = document.getElementById('mapelGroup');
    mapelSelect = document.getElementById('mataPelajaran');
    submitBtn = document.getElementById('submitBtn');
    loadingBtn = document.getElementById('loadingBtn');
    formAlert = document.getElementById('formAlert');
    
    // Debug log
    console.log('🔍 Elements:', {
        registerForm: !!registerForm,
        jenjangSelect: !!jenjangSelect,
        kelasGroup: !!kelasGroup,
        mapelGroup: !!mapelGroup
    });
    
    // Attach event listener for jenjang change
    if (jenjangSelect) {
        jenjangSelect.addEventListener('change', handleJenjangChange);
        console.log('✅ Event listener attached to jenjangSelect');
    }
    
    // Attach form submit handler
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterSubmit);
        console.log('✅ Form submit handler attached');
    }
    
    // Real-time validation on input
    document.querySelectorAll('.form-input').forEach(input => {
        input?.addEventListener('input', () => clearError(input.id));
        input?.addEventListener('blur', () => validateField(input.id));
    });
    
    // Initial check: if page loads with pre-filled jenjang (browser back button)
    if (jenjangSelect?.value) {
        handleJenjangChange({ target: jenjangSelect });
    }
});

// ============================================
// FUNGSI: Handle Jenjang Change
// ============================================
function handleJenjangChange(e) {
    const jenjang = e.target?.value || e.value;
    
    console.log('🔄 Jenjang changed to:', jenjang);
    
    // Reset both fields
    if (kelasSelect) kelasSelect.value = '';
    if (mapelSelect) mapelSelect.value = '';
    clearError('kelas');
    clearError('mataPelajaran');
    
    // Update aria-required based on jenjang
    if (kelasSelect) kelasSelect.setAttribute('aria-required', 'false');
    if (mapelSelect) mapelSelect.setAttribute('aria-required', 'false');
    
    // Show/hide based on jenjang
    if (jenjang === 'sd') {
        // ✅ SD: Show Kelas, Hide Mapel
        if (kelasGroup) {
            kelasGroup.classList.remove('hidden');
            console.log('✅ kelasGroup shown for SD');
        }
        if (mapelGroup) {
            mapelGroup.classList.add('hidden');
            console.log('❌ mapelGroup hidden for SD');
        }
        if (kelasSelect) {
            kelasSelect.setAttribute('aria-required', 'true');
            kelasSelect.required = true;
        }
        if (mapelSelect) {
            mapelSelect.setAttribute('aria-required', 'false');
            mapelSelect.required = false;
        }
    } else if (jenjang === 'smp' || jenjang === 'sma') {
        // ✅ SMP/SMA: Hide Kelas, Show Mapel
        if (kelasGroup) {
            kelasGroup.classList.add('hidden');
            console.log('❌ kelasGroup hidden for SMP/SMA');
        }
        if (mapelGroup) {
            mapelGroup.classList.remove('hidden');
            console.log('✅ mapelGroup shown for', jenjang);
        }
        populateMataPelajaran(jenjang);
        if (kelasSelect) {
            kelasSelect.setAttribute('aria-required', 'false');
            kelasSelect.required = false;
        }
        if (mapelSelect) {
            mapelSelect.setAttribute('aria-required', 'true');
            mapelSelect.required = true;
        }
    } else {
        // No jenjang selected
        if (kelasGroup) kelasGroup.classList.add('hidden');
        if (mapelGroup) mapelGroup.classList.add('hidden');
        if (kelasSelect) {
            kelasSelect.setAttribute('aria-required', 'false');
            kelasSelect.required = false;
        }
        if (mapelSelect) {
            mapelSelect.setAttribute('aria-required', 'false');
            mapelSelect.required = false;
        }
    }
}

// ============================================
// FUNGSI: Populate Mata Pelajaran Dropdown
// ============================================
function populateMataPelajaran(jenjang) {
    if (!mapelSelect) {
        console.error('❌ mapelSelect element not found!');
        return;
    }
    
    // Clear existing options (keep first option)
    mapelSelect.innerHTML = '<option value="">Pilih Mata Pelajaran</option>';
    
    // Get subjects for selected jenjang
    const subjects = MATA_PELAJARAN[jenjang] || [];
    
    console.log(`📚 Loading ${subjects.length} subjects for ${jenjang}`);
    
    // Add options
    subjects.forEach((subject, index) => {
        const option = document.createElement('option');
        option.value = subject;
        option.textContent = subject;
        mapelSelect.appendChild(option);
    });
    
    console.log('✅ Subjects populated');
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

function validateForm() {
    let isValid = true;
    
    // Nama Lengkap
    const namaLengkap = document.getElementById('namaLengkap')?.value.trim();
    if (!namaLengkap) {
        showError('namaLengkap', 'Nama lengkap wajib diisi');
        isValid = false;
    } else {
        clearError('namaLengkap');
    }
    
    // Email
    const email = document.getElementById('email')?.value.trim();
    if (!validateField('email')) isValid = false;
    
    // No HP
    const noHp = document.getElementById('noHp')?.value.trim();
    if (!validateField('noHp')) isValid = false;
    
    // Jenjang
    const jenjang = jenjangSelect?.value;
    if (!jenjang) {
        showError('jenjang', 'Jenjang pendidikan wajib dipilih');
        isValid = false;
    } else {
        clearError('jenjang');
    }
    
    // Kelas (jika SD)
    if (jenjang === 'sd') {
        const kelas = kelasSelect?.value;
        if (!kelas) {
            showError('kelas', 'Kelas yang diampu wajib dipilih');
            isValid = false;
        } else {
            clearError('kelas');
        }
    }
    
    // Mata Pelajaran (jika SMP/SMA)
    if (jenjang === 'smp' || jenjang === 'sma') {
        const mataPelajaran = mapelSelect?.value;
        if (!mataPelajaran) {
            showError('mataPelajaran', 'Mata pelajaran wajib dipilih');
            isValid = false;
        } else {
            clearError('mataPelajaran');
        }
    }
    
    // Sekolah
    const sekolah = document.getElementById('sekolah')?.value.trim();
    if (!sekolah) {
        showError('sekolah', 'Nama sekolah wajib diisi');
        isValid = false;
    } else {
        clearError('sekolah');
    }
    
    // Password
    if (!validateField('password')) isValid = false;
    
    // Confirm Password
    if (!validateField('confirmPassword')) isValid = false;
    
    // Terms
    const terms = document.getElementById('terms')?.checked;
    if (!terms) {
        showError('terms', 'Anda harus menyetujui syarat & ketentuan');
        isValid = false;
    } else {
        clearError('terms');
    }
    
    return isValid;
}

// ============================================
// FUNGSI: Handle Register Submit
// ============================================
async function handleRegisterSubmit(e) {
    e.preventDefault();
    
    console.log('📝 Register submit triggered');
    
    // Hide previous alerts
    hideAlert();
    
    // Validate form
    if (!validateForm()) {
        console.log('❌ Validation failed');
        showAlert('error', 'Mohon periksa kembali semua field yang wajib diisi');
        
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
    const jenjang = jenjangSelect?.value;
    const formData = {
        namaLengkap: document.getElementById('namaLengkap')?.value.trim(),
        email: document.getElementById('email')?.value.trim(),
        noHp: document.getElementById('noHp')?.value.trim(),
        jenjang: jenjang,
        kelas: jenjang === 'sd' ? kelasSelect?.value || null : null,
        mataPelajaran: (jenjang === 'smp' || jenjang === 'sma') ? mapelSelect?.value || null : null,
        sekolah: document.getElementById('sekolah')?.value.trim(),
        password: document.getElementById('password')?.value
    };
    
    console.log('📦 Register data:', { ...formData, password: '[REDACTED]' });
    
    try {
        const result = await registerGuru(formData);
        
        if (result.success) {
            console.log('✅ Registration successful');
            showAlert('success', `${result.message} Silakan cek email Anda untuk verifikasi.`);
            
            // Redirect to login after short delay
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            console.error('❌ Registration failed:', result.error);
            showAlert('error', result.error || 'Registrasi gagal. Silakan coba lagi.');
            
            // Reset button state
            if (submitBtn) submitBtn.classList.remove('hidden');
            if (loadingBtn) loadingBtn.classList.add('hidden');
        }
    } catch (error) {
        console.error('❌ Registration error:', error);
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
