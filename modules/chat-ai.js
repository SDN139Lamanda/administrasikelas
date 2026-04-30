/**
 * ============================================
 * CHAT AI - Integrasi Groq untuk FAQ Bot
 * Platform Administrasi Kelas Digital
 * ✅ UPDATED: Tambah info donasi + fix tutorial response
 * ============================================
 */

import { generateWithGroq } from './groq-api.js';

// ✅ SYSTEM PROMPT: Batasi AI hanya jawab FAQ platform
const SYSTEM_PROMPT = `
Anda adalah asisten virtual untuk Platform Administrasi Kelas Digital (Guru SD/SMP/SMA).

TUGAS ANDA:
- Jawab pertanyaan tentang platform ini saja
- Fokus pada: cara daftar, syarat approval admin, tutorial penggunaan, donasi
- Jika pertanyaan di luar topik, arahkan user untuk hubungi admin
- Jawaban singkat, jelas, ramah, maksimal 100 kata
- Gunakan bahasa Indonesia yang baik

FAQ YANG BISA DIJAWAB:
1. Cara daftar: Buka register.html, isi form, verifikasi email, tunggu approval
2. Syarat approval: Email valid, data lengkap, verifikasi email, donasi Rp. 300.000/tahun
3. Donasi: Rp. 300.000 untuk periode 1 tahun penggunaan penuh
4. Waktu approval: 1-3 hari kerja setelah donasi & verifikasi
5. Setelah approval: Bisa login dan akses semua fitur
6. Fitur platform: CTA Generator, Asisten Modul, Refleksi, Penilaian, Admin Kelas
7. Tutorial: Setelah login, gunakan menu dashboard. Setiap fitur ada tooltip bantuan.
8. Lupa password: Hubungi admin radiah.tifarahs@gmail.com
9. Error saat login: Cek email/password, pastikan email terverifikasi

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
            temperature: 0.7,
            max_tokens: 300
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
    
    if (q.includes('daftar') || q.includes('register') || q.includes('sign up')) {
        return `📝 **Cara Daftar**:\n\n1. Buka halaman register.html\n2. Isi form dengan data lengkap\n3. Pilih jenjang (SD/SMP/SMA)\n4. Isi kelas & mapel yang diampu\n5. Submit dan verifikasi email\n6. Tunggu approval admin (1-3 hari)`;
    }
    
    if (q.includes('approval') || q.includes('persetujuan') || q.includes('disetujui')) {
        return `⏳ **Syarat Approval**:\n\n• Email aktif & terverifikasi\n• Data profil lengkap (nama, sekolah, jenjang)\n• Kelas & mapel yang diampu terisi\n• ✅ Donasi: Rp. 300.000 untuk periode 1 tahun\n• Admin akan tinjau dalam 1-3 hari kerja\n\nSetelah approved, Anda bisa login & akses semua fitur.`;
    }
    
    if (q.includes('donasi') || q.includes('donate') || q.includes('bayar') || q.includes('biaya')) {
        return `💰 **Informasi Donasi**:\n\n• Jumlah: Rp. 120.000\n• Periode: 1 tahun penggunaan penuh\n• Manfaat: Mendukung operasional platform\n• Pembayaran: Hubungi admin untuk info rekening\n• Setelah donasi: Akun akan diproses approval\n\nTerima kasih atas dukungan Anda! 🙏`;
    }
    
    if (q.includes('syarat')) {
        return `✅ **Syarat Daftar**:\n\n• Email aktif (untuk verifikasi)\n• Data lengkap (nama, sekolah, jenjang)\n• Kelas & mapel yang diampu\n• Password minimal 6 karakter\n• Donasi Rp. 300.000/tahun (setelah approval)`;
    }
    
    if (q.includes('login') || q.includes('masuk')) {
        return `🔐 **Cara Login**:\n\n1. Buka login.html\n2. Masukkan email & password\n3. Klik Login\n4. Jika pending approval, fitur akan terkunci\n5. Setelah approved, akses semua fitur`;
    }
    
    // ✅ FIX: Tutorial response - jawaban lengkap seperti "cara daftar"
    if (q.includes('tutorial') || q.includes('cara pakai') || q.includes('panduan') || q.includes('gunakan') || q.includes('petunjuk')) {
        return `🎓 **Tutorial Penggunaan**:\n\n1. **Setelah Login**:\n   • Dashboard menampilkan fitur sesuai profil Anda\n   • Klik kartu fitur untuk mulai menggunakan\n\n2. **Fitur Utama**:\n   • CTA Generator: Buat CP/TP/ATP dengan AI\n   • Asisten Modul: Generate modul ajar otomatis\n   • Refleksi: Catat jurnal pembelajaran\n   • Penilaian: Kelola nilai siswa\n\n3. **Tips**:\n   • Setiap form ada tooltip bantuan (?)\n   • Data auto-save ke cloud\n   • Bisa akses dari HP/laptop\n\nButuh bantuan? Klik chat ini lagi atau hubungi admin.`;
    }
    
    if (q.includes('fitur') || q.includes('bisa apa')) {
        return `🎯 **Fitur Platform**:\n\n• CTA Generator (CP/TP/ATP)\n• Asisten Modul AI\n• Refleksi Guru\n• Penilaian\n• Admin Kelas\n• Generator Modul`;
    }
    
    if (q.includes('hubungi') || q.includes('admin') || q.includes('bantuan') || q.includes('kontak')) {
        return `📧 **Hubungi Admin**:\n\nEmail: radiah.tifarahs@gmail.com\n\nWaktu respon: 1-3 hari kerja\n\nUntuk masalah teknis, sertakan screenshot error.`;
    }
    
    // Default response with suggested questions
    return `👋 Halo! Saya asisten virtual Platform Administrasi Kelas.\n\nSaya bisa bantu tentang:\n• Cara daftar\n• Syarat approval & donasi\n• Tutorial penggunaan\n• Fitur platform\n\n💡 **Pertanyaan populer**:\n- "Cara daftar?"\n- "Berapa biaya donasi?"\n- "Tutorial pakai fitur?"\n\nSilakan tanya! 😊`;
}

console.log('🟢 [Chat AI] Module READY');
