/**
 * ============================================
 * MODULE: APPROVAL EMAIL (EmailJS)
 * Kirim email notifikasi saat admin approve user
 * ============================================
 */

console.log('🔴 [Approval Email] Module START');

// ✅ EMAILJS CONFIG — KEYS SUDAH DI-UPDATE!
const EMAILJS_CONFIG = {
    publicKey: 'KTa8qrV_lW-ehYAmq',           // ✅ Public Key Anda
    serviceId: 'service_5dm9d2e',           // ✅ Service ID Anda
    templateId: 'template_nufvhv'           // ✅ Template ID Anda
};

// ✅ Load EmailJS SDK
async function loadEmailJS() {
    if (window.emailjs) {
        console.log('✅ [Approval Email] EmailJS already loaded');
        return;
    }
    
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
        script.onload = () => {
            window.emailjs.init(EMAILJS_CONFIG.publicKey);
            console.log('✅ [Approval Email] EmailJS initialized');
            resolve();
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

/**
 * Kirim email approval ke user
 * @param {string} toEmail - Email user
 * @param {string} namaUser - Nama lengkap user
 * @param {string} sekolah - Nama sekolah
 */
export async function sendApprovalEmail(toEmail, namaUser, sekolah) {
    console.log('📧 [Approval Email] Preparing to send...');
    console.log('📧 [Approval Email] To:', toEmail);
    console.log('📧 [Approval Email] Name:', namaUser);
    
    try {
        // Load EmailJS SDK
        await loadEmailJS();
        
        // Prepare template parameters
        const templateParams = {
            to_email: toEmail,
            nama_user: namaUser,
            sekolah: sekolah || 'Sekolah Anda',
            reply_to: 'radiah.tifarahs@gmail.com'
        };
        
        console.log('📧 [Approval Email] Sending via EmailJS...');
        console.log('📧 [Approval Email] Service:', EMAILJS_CONFIG.serviceId);
        console.log('📧 [Approval Email] Template:', EMAILJS_CONFIG.templateId);
        
        // Send email
        const response = await window.emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templateId,
            templateParams
        );
        
        console.log('✅ [Approval Email] SUCCESS!', response);
        console.log('✅ [Approval Email] Email sent to:', toEmail);
        
        return { 
            success: true, 
            response: response,
            message: 'Email approval sent successfully'
        };
        
    } catch (error) {
        console.error('❌ [Approval Email] FAILED:', error);
        console.error('❌ [Approval Email] Error code:', error.code);
        console.error('❌ [Approval Email] Error text:', error.text);
        
        return { 
            success: false, 
            error: error,
            message: error.text || error.message || 'Failed to send email'
        };
    }
}

/**
 * Test email function (untuk debugging)
 */
export async function testEmailSend() {
    console.log('🧪 [Approval Email] Testing...');
    return await sendApprovalEmail(
        'radiah.tifarahs@gmail.com',
        'Test User',
        'SDN 139 Lamanda'
    );
}

console.log('🟢 [Approval Email] Module READY');
console.log('💡 [Approval Email] Usage: sendApprovalEmail(email, nama, sekolah)');
