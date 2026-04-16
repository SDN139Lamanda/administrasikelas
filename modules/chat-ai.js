/**
 * ============================================
 * CHAT AI - Integrasi Groq untuk FAQ Bot
 * Platform Administrasi Kelas Digital
 * ============================================
 * 
 * Fungsi:
 * - Jawab pertanyaan calon user tentang platform
 * - Fokus: FAQ standar (daftar, approval, tutorial)
 * - Menggunakan Groq API yang sudah ada
 */

import { generateWithGroq } from './groq-api.js';

// ✅ SYSTEM PROMPT: Batasi AI hanya jawab FAQ platform
const SYSTEM_PROMPT = `
Anda adalah asisten virtual untuk Platform Administrasi Kelas Digital (Guru SD/SMP/SMA).

TUGAS ANDA:
- Jawab pertanyaan tentang platform ini saja
- Fokus pada: cara daftar, syarat approval admin, tutorial penggunaan
- Jika pertanyaan di luar topik, arahkan user untuk hubungi admin
- Jawaban singkat, jelas, ramah, maksimal 100 kata
- Gunakan bahasa Indonesia yang baik

FAQ YANG BISA DIJAWAB:
1. Cara daftar: Buka register.html, isi form, tunggu approval admin
2. Syarat approval: Email valid, data lengkap, verifikasi email
3. Waktu approval: 1-3 hari kerja
4. Setelah approval: Bisa login dan akses semua fitur
5. Fitur platform: CTA Generator, Asisten Modul, Refleksi, Penilaian
6. Lupa password: Hubungi admin radiah.tifarahs@gmail.com
7. Error saat login: Cek email/password, pastikan email terverifikasi

JANGAN JAWAB:
- Pertanyaan politik, agama, SARA
- Pertanyaan pribadi di luar platform
- Hal-hal yang tidak terkait platform

FORMAT JAWABAN:
- Gunakan paragraf pendek
- Bisa pakai bullet points jika perlu
- Ramah dan membantu
`;

// ✅ FUNGSI: Generate jawaban dari Groq AI
export async function getChatResponse(userMessage) {
    console.log('🤖 [Chat AI] User question:', userMessage);
    
    try {
        // Combine system prompt + user message
        const prompt = `${SYSTEM_PROMPT}\n\nPERTANYAAN USER: ${userMessage}\n\nJAWABAN:`;
        
        // Call Groq API (reuse existing function)
        const response = await generateWithGroq({
            prompt: prompt,
            temperature: 0.7,  // Balanced creativity
            max_tokens: 300    // Limit response length
        });
        
        console.log('✅ [Chat AI] Response received');
        
        return {
            success: true,
            message: response.content || response.response || response
        };
        
    } catch (error) {
        console.error('❌ [Chat AI] Error:', error);
        
        // Fallback response jika API gagal
        return {
            success: false,
            message: `⚠️ Maaf, saya sedang gangguan teknis.\n\nSilakan hubungi admin:\n📧 radiah.tifarahs@gmail.com\n\nAtau coba lagi nanti.`
        };
    }
}

// ✅ FUNGSI: Predefined FAQ (fallback jika API tidak tersedia)
export function getFAQAnswer(question) {
    const q = question.toLowerCase();
    
    if (q.includes('daftar') || q.includes('register')) {
        return `📝 **Cara Daftar**:\n\n1. Buka halaman register.html\n2. Isi form dengan data lengkap\n3. Pilih jenjang (SD/SMP/SMA)\n4. Isi kelas & mapel yang diampu\n5. Submit dan verifikasi email\n6. Tunggu approval admin (1-3 hari)`;
    }
    
    if (q.includes('approval') || q.includes('persetujuan')) {
        return `⏳ **Proses Approval**:\n\n• Admin akan tinjau akun Anda\n• Waktu: 1-3 hari kerja\n• Anda akan dapat email notifikasi\n• Setelah approved, bisa login & akses semua fitur`;
    }
    
    if (q.includes('syarat')) {
        return `✅ **Syarat Daftar**:\n\n• Email aktif (untuk verifikasi)\n• Data lengkap (nama, sekolah, jenjang)\n• Kelas & mapel yang diampu\n• Password minimal 6 karakter`;
    }
    
    if (q.includes('login') || q.includes('masuk')) {
        return `🔐 **Cara Login**:\n\n1. Buka login.html\n2. Masukkan email & password\n3. Klik Login\n4. Jika pending approval, fitur akan terkunci\n5. Setelah approved, akses semua fitur`;
    }
    
    if (q.includes('fitur') || q.includes('bisa apa')) {
        return `🎯 **Fitur Platform**:\n\n• CTA Generator (CP/TP/ATP)\n• Asisten Modul AI\n• Refleksi Guru\n• Penilaian\n• Admin Kelas\n• Generator Modul`;
    }
    
    if (q.includes('hubungi') || q.includes('admin') || q.includes('bantuan')) {
        return `📧 **Hubungi Admin**:\n\nEmail: radiah.tifarahs@gmail.com\n\nWaktu respon: 1-3 hari kerja\n\nUntuk masalah teknis, sertakan screenshot error.`;
    }
    
    // Default response
    return `👋 Halo! Saya asisten virtual Platform Administrasi Kelas.\n\nSaya bisa bantu tentang:\n• Cara daftar\n• Syarat approval\n• Tutorial penggunaan\n• Fitur platform\n\nSilakan tanya! 😊`;
}

console.log('🟢 [Chat AI] Module READY');
