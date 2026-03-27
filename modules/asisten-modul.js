// modules/asisten-modul.js
// Asisten Modul Ajar - Generator Modul Pembelajaran Kurikulum Merdeka
// SDN 139 LAMANDA
// ✅ UPDATED: Responsive Layout untuk Semua Device (PC/Laptop/Tablet/HP)

import { db } from '../config-firebase.js';
import { auth } from '../config-firebase.js';
import { 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    deleteDoc, 
    query, 
    orderBy,
    where
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const collectionName = "modul-ajar";
const ADMIN_EMAIL = 'andi@139batuassung.com';

// ============================================
// FUNGSI RENDER - Menghasilkan HTML Module
// ============================================
export function render() {
    const div = document.createElement('div');
    div.innerHTML = `
        <!-- RESPONSIVE CSS FOR ALL DEVICES -->
        <style>
            /* Base Responsive Styles */
            .modul-preview-wrapper {
                width: 100%;
                overflow-x: auto;
                -webkit-overflow-scrolling: touch;
                scroll-behavior: smooth;
            }
            
            #modulBody {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
                line-height: 1.7;
                padding: 24px;
                max-width: 100%;
                overflow-wrap: break-word;
                word-wrap: break-word;
                word-break: break-word;
                color: #1f2937;
            }
            
            /* Tables - Scrollable on all devices */
            #modulBody table {
                width: 100%;
                font-size: 13px;
                display: block;
                overflow-x: auto;
                -webkit-overflow-scrolling: touch;
                border-collapse: collapse;
            }
            
            #modulBody table th,
            #modulBody table td {
                padding: 8px 12px;
                border: 1px solid #e5e7eb;
                text-align: left;
            }
            
            /* Responsive Typography */
            #modulBody h1 {
                font-size: 22px;
                font-weight: 700;
                margin: 24px 0 16px;
                line-height: 1.3;
                color: #111827;
            }
            
            #modulBody h2 {
                font-size: 19px;
                font-weight: 600;
                margin: 20px 0 12px;
                line-height: 1.3;
                color: #1f2937;
            }
            
            #modulBody h3 {
                font-size: 16px;
                font-weight: 600;
                margin: 16px 0 10px;
                line-height: 1.4;
                color: #374151;
            }
            
            #modulBody h4 {
                font-size: 14px;
                font-weight: 600;
                margin: 12px 0 8px;
                color: #4b5563;
            }
            
            #modulBody p {
                margin: 8px 0;
                color: #374151;
            }
            
            #modulBody ul,
            #modulBody ol {
                margin: 8px 0;
                padding-left: 24px;
            }
            
            #modulBody li {
                margin: 4px 0;
            }
            
            /* Grid & Flex - Responsive */
            #modulBody .grid,
            #modulBody .flex {
                display: flex;
                flex-wrap: wrap;
                gap: 12px;
            }
            
            #modulBody .grid > div,
            #modulBody .flex > div {
                flex: 1;
                min-width: 200px;
            }
            
            /* Cover Section */
            #modulBody .cover-section {
                text-align: center;
                padding: 20px 16px;
                border-bottom: 3px solid #7c3aed;
                margin-bottom: 24px;
            }
            
            #modulBody .cover-section h1 {
                font-size: 24px;
                margin-bottom: 8px;
                color: #111827;
            }
            
            #modulBody .cover-section h2 {
                font-size: 18px;
                color: #7c3aed;
                margin-bottom: 16px;
            }
            
            #modulBody .cover-info {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                gap: 8px 16px;
                text-align: left;
                max-width: 600px;
                margin: 0 auto;
                font-size: 13px;
            }
            
            /* Info Boxes */
            #modulBody .info-box {
                background: #f9fafb;
                border-left: 4px solid #7c3aed;
                padding: 12px 16px;
                margin: 12px 0;
                border-radius: 0 4px 4px 0;
            }
            
            #modulBody .info-box.green {
                background: #f0fdf4;
                border-left-color: #22c55e;
            }
            
            #modulBody .info-box.blue {
                background: #eff6ff;
                border-left-color: #3b82f6;
            }
            
            #modulBody .info-box.yellow {
                background: #fefce8;
                border-left-color: #eab308;
            }
            
            #modulBody .info-box.purple {
                background: #faf5ff;
                border-left-color: #a855f7;
            }
            
            #modulBody .info-box.red {
                background: #fef2f2;
                border-left-color: #ef4444;
            }
            
            /* Sections */
            #modulBody .section {
                margin: 24px 0;
            }
            
            #modulBody .section-title {
                font-size: 16px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 14px;
                color: #1f2937;
            }
            
            #modulBody .section-icon {
                width: 32px;
                height: 32px;
                background: #7c3aed;
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                flex-shrink: 0;
            }
            
            /* Content Indent */
            #modulBody .content-indent {
                padding-left: 44px;
            }
            
            @media (max-width: 640px) {
                #modulBody .content-indent {
                    padding-left: 36px;
                }
            }
            
            /* Signature Section */
            #modulBody .signature-section {
                display: flex;
                justify-content: space-between;
                margin-top: 40px;
                padding-top: 24px;
                border-top: 2px solid #d1d5db;
                gap: 40px;
            }
            
            #modulBody .signature-box {
                flex: 1;
                text-align: center;
            }
            
            #modulBody .signature-line {
                border-bottom: 2px solid #1f2937;
                padding: 0 40px;
                margin: 60px 0 4px 0;
                display: inline-block;
                min-width: 180px;
            }
            
            /* Footer */
            #modulBody .footer {
                border-top: 1px solid #e5e7eb;
                padding-top: 16px;
                margin-top: 32px;
                text-align: center;
                font-size: 12px;
                color: #6b7280;
            }
            
            /* Lists */
            #modulBody .list-disc {
                list-style-type: disc;
            }
            
            #modulBody .list-decimal {
                list-style-type: decimal;
            }
            
            /* Badges & Tags */
            #modulBody .badge {
                display: inline-block;
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 500;
            }
            
            #modulBody .badge-blue {
                background: #dbeafe;
                color: #1e40af;
            }
            
            /* Mobile Optimizations */
            @media (max-width: 768px) {
                #modulBody {
                    font-size: 13px;
                    padding: 16px 12px;
                }
                
                #modulBody h1 { font-size: 20px; margin: 20px 0 14px; }
                #modulBody h2 { font-size: 17px; margin: 16px 0 10px; }
                #modulBody h3 { font-size: 15px; margin: 14px 0 8px; }
                #modulBody h4 { font-size: 14px; }
                
                #modulBody .cover-section {
                    padding: 16px 12px;
                }
                
                #modulBody .cover-section h1 { font-size: 20px; }
                #modulBody .cover-section h2 { font-size: 16px; }
                
                #modulBody .cover-info {
                    grid-template-columns: 1fr;
                    text-align: center;
                }
                
                #modulBody .grid,
                #modulBody .flex {
                    flex-direction: column;
                }
                
                #modulBody .grid > div,
                #modulBody .flex > div {
                    width: 100%;
                    min-width: 100%;
                }
                
                #modulBody .section-title {
                    font-size: 15px;
                }
                
                #modulBody .section-icon {
                    width: 28px;
                    height: 28px;
                    font-size: 12px;
                }
                
                #modulBody .info-box {
                    padding: 10px 12px;
                    font-size: 12px;
                }
                
                #modulBody table {
                    font-size: 12px;
                }
                
                #modulBody table th,
                #modulBody table td {
                    padding: 6px 10px;
                }
            }
            
            @media (max-width: 480px) {
                #modulBody {
                    font-size: 12px;
                    padding: 12px 8px;
                }
                
                #modulBody h1 { font-size: 18px; margin: 16px 0 12px; }
                #modulBody h2 { font-size: 16px; margin: 14px 0 8px; }
                #modulBody h3 { font-size: 14px; margin: 12px 0 6px; }
                
                #modulBody .cover-section h1 { font-size: 18px; }
                #modulBody .cover-section h2 { font-size: 14px; }
                
                #modulBody .section-icon {
                    width: 26px;
                    height: 26px;
                    font-size: 11px;
                }
                
                #modulBody .info-box {
                    padding: 8px 10px;
                    font-size: 11px;
                }
                
                #modulBody table {
                    font-size: 11px;
                }
                
                #modulBody .signature-section {
                    flex-direction: column;
                    gap: 24px;
                }
                
                #modulBody .signature-line {
                    min-width: 160px;
                    padding: 0 30px;
                }
            }
            
            /* Print Styles */
            @media print {
                #modulBody {
                    padding: 0;
                    font-size: 11pt;
                    color: #000;
                }
                
                #modulBody .no-print {
                    display: none !important;
                }
                
                #modulBody a {
                    text-decoration: none;
                    color: #000;
                }
                
                @page {
                    margin: 2cm;
                }
            }
            
            /* Utility Classes */
            .text-center { text-align: center; }
            .text-left { text-align: left; }
            .font-bold { font-weight: 600; }
            .font-semibold { font-weight: 500; }
            .text-gray-500 { color: #6b7280; }
            .text-gray-600 { color: #4b5563; }
            .text-gray-700 { color: #374151; }
            .text-gray-800 { color: #1f2937; }
            .text-gray-900 { color: #111827; }
            .text-purple-600 { color: #7c3aed; }
            .bg-gray-50 { background: #f9fafb; }
            .bg-blue-50 { background: #eff6ff; }
            .bg-green-50 { background: #f0fdf4; }
            .bg-yellow-50 { background: #fefce8; }
            .bg-purple-50 { background: #faf5ff; }
            .bg-red-50 { background: #fef2f2; }
            .border-l-4 { border-left-width: 4px; border-left-style: solid; }
            .border-purple-600 { border-color: #7c3aed; }
            .border-blue-500 { border-color: #3b82f6; }
            .border-green-500 { border-color: #22c55e; }
            .border-yellow-500 { border-color: #eab308; }
            .border-red-500 { border-color: #ef4444; }
            .rounded { border-radius: 6px; }
            .p-3 { padding: 12px; }
            .p-4 { padding: 16px; }
            .mb-2 { margin-bottom: 8px; }
            .mb-3 { margin-bottom: 12px; }
            .mb-4 { margin-bottom: 16px; }
            .mb-6 { margin-bottom: 24px; }
            .mt-2 { margin-top: 8px; }
            .mt-4 { margin-top: 16px; }
            .space-y-2 > * + * { margin-top: 8px; }
            .space-y-3 > * + * { margin-top: 12px; }
            .space-y-4 > * + * { margin-top: 16px; }
            .pl-5 { padding-left: 20px; }
            .pl-11 { padding-left: 44px; }
            .pl-14 { padding-left: 56px; }
        </style>
        
        <!-- Header Section -->
        <div class="mb-6">
            <div class="flex items-center gap-3 mb-2">
                <div class="p-3 bg-purple-100 rounded-xl">
                    <i class="fas fa-wand-magic-sparkles text-purple-600 text-2xl"></i>
                </div>
                <div>
                    <h2 class="text-2xl font-bold text-gray-800">Asisten Modul Ajar</h2>
                    <p class="text-gray-500 text-sm">Generator Modul Pembelajaran Kurikulum Merdeka</p>
                </div>
            </div>
        </div>

        <!-- Tab Navigation -->
        <div class="border-b border-gray-200 mb-6">
            <nav class="-mb-px flex space-x-8 overflow-x-auto">
                <button onclick="window.showTab('generator')" id="tab-generator" 
                    class="tab-button py-4 px-1 border-b-2 font-medium text-sm active border-purple-500 text-purple-600 whitespace-nowrap">
                    <i class="fas fa-pen-fancy mr-2"></i>Generator Modul
                </button>
                <button onclick="window.showTab('riwayat')" id="tab-riwayat" 
                    class="tab-button py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 whitespace-nowrap">
                    <i class="fas fa-history mr-2"></i>Riwayat Modul
                </button>
            </nav>
        </div>

        <!-- TAB CONTENT: GENERATOR -->
        <div id="content-generator" class="tab-content">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Form Input (Left Column) -->
                <div class="lg:col-span-1">
                    <div class="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                        <h3 class="font-bold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-sliders-h text-purple-600 mr-2"></i>
                            Parameter Modul
                        </h3>

                        <form id="formModul" class="space-y-4">
                            <!-- Identitas -->
                            <div class="space-y-3">
                                <h4 class="text-sm font-semibold text-gray-700 border-b pb-2">📋 Identitas Modul</h4>
                                
                                <div>
                                    <label class="block text-gray-700 text-xs font-bold mb-1">Nama Penyusun *</label>
                                    <input type="text" id="namaPenyusun" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-purple-500 text-sm" 
                                        placeholder="Nama guru" required>
                                </div>
                                
                                <div>
                                    <label class="block text-gray-700 text-xs font-bold mb-1">Nama Sekolah *</label>
                                    <input type="text" id="namaSekolah" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-purple-500 text-sm" 
                                        value="SDN 139 LAMANDA" required>
                                </div>
                            </div>

                            <!-- Informasi -->
                            <div class="space-y-3">
                                <h4 class="text-sm font-semibold text-gray-700 border-b pb-2">📚 Informasi Pembelajaran</h4>
                                
                                <div>
                                    <label class="block text-gray-700 text-xs font-bold mb-1">Mata Pelajaran *</label>
                                    <select id="mapel" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-purple-500 text-sm" required>
                                        <option value="">Pilih Mapel</option>
                                        <option value="Matematika">Matematika</option>
                                        <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                                        <option value="IPA">IPA (Sains)</option>
                                        <option value="IPS">IPS</option>
                                        <option value="Pendidikan Pancasila">Pendidikan Pancasila</option>
                                        <option value="PJOK">PJOK</option>
                                        <option value="Seni Budaya">Seni Budaya</option>
                                        <option value="Bahasa Inggris">Bahasa Inggris</option>
                                    </select>
                                </div>

                                <div>
                                    <label class="block text-gray-700 text-xs font-bold mb-1">Kelas / Fase *</label>
                                    <select id="kelasFase" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-purple-500 text-sm" required>
                                        <option value="">Pilih Kelas</option>
                                        <option value="1-A">Kelas 1 (Fase A)</option>
                                        <option value="2-A">Kelas 2 (Fase A)</option>
                                        <option value="3-B">Kelas 3 (Fase B)</option>
                                        <option value="4-B">Kelas 4 (Fase B)</option>
                                        <option value="5-C">Kelas 5 (Fase C)</option>
                                        <option value="6-C">Kelas 6 (Fase C)</option>
                                    </select>
                                </div>

                                <div>
                                    <label class="block text-gray-700 text-xs font-bold mb-1">Alokasi Waktu *</label>
                                    <input type="text" id="alokasiWaktu" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-purple-500 text-sm" 
                                        placeholder="Contoh: 2 x 35 menit" value="2 x 35 menit" required>
                                </div>

                                <div>
                                    <label class="block text-gray-700 text-xs font-bold mb-1">Tahun Pelajaran</label>
                                    <input type="text" id="tahunPelajaran" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-purple-500 text-sm" 
                                        value="2025/2026">
                                </div>
                            </div>

                            <!-- Konten -->
                            <div class="space-y-3">
                                <h4 class="text-sm font-semibold text-gray-700 border-b pb-2">📝 Konten Pembelajaran</h4>
                                
                                <div>
                                    <label class="block text-gray-700 text-xs font-bold mb-1">Topik / Materi *</label>
                                    <input type="text" id="topik" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-purple-500 text-sm" 
                                        placeholder="Contoh: Pecahan Sederhana" required>
                                </div>

                                <div>
                                    <label class="block text-gray-700 text-xs font-bold mb-1">Capaian Pembelajaran (CP) *</label>
                                    <textarea id="capaianPembelajaran" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-purple-500 text-sm h-20" 
                                        placeholder="Salin CP dari dokumen kurikulum..." required></textarea>
                                    <p class="text-xs text-gray-500 mt-1">Dapat diisi manual atau biarkan kosong untuk auto-generate</p>
                                </div>

                                <div>
                                    <label class="block text-gray-700 text-xs font-bold mb-1">Tujuan Pembelajaran *</label>
                                    <textarea id="tujuanPembelajaran" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-purple-500 text-sm h-20" 
                                        placeholder="Setelah pembelajaran, siswa dapat..." required></textarea>
                                </div>

                                <div>
                                    <label class="block text-gray-700 text-xs font-bold mb-1">Profil Pelajar Pancasila</label>
                                    <select id="profilPancasila" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-purple-500 text-sm" multiple>
                                        <option value="Beriman">Beriman, Bertakwa kepada Tuhan YME</option>
                                        <option value="Berkebinekaan">Berkebinekaan Global</option>
                                        <option value="Bergotong-royong">Bergotong Royong</option>
                                        <option value="Mandiri">Mandiri</option>
                                        <option value="Bernalar Kritis">Bernalar Kritis</option>
                                        <option value="Kreatif">Kreatif</option>
                                    </select>
                                    <p class="text-xs text-gray-500 mt-1">Tahan Ctrl untuk pilih multiple</p>
                                </div>

                                <div>
                                    <label class="block text-gray-700 text-xs font-bold mb-1">Model Pembelajaran</label>
                                    <select id="modelPembelajaran" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-purple-500 text-sm">
                                        <option value="Tatap Muka">Tatap Muka</option>
                                        <option value="Blended Learning">Blended Learning</option>
                                        <option value="Daring">Daring (Online)</option>
                                        <option value="Luring">Luring (Offline)</option>
                                    </select>
                                </div>

                                <div>
                                    <label class="block text-gray-700 text-xs font-bold mb-1">Media & Sumber Belajar</label>
                                    <textarea id="mediaPembelajaran" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-purple-500 text-sm h-16" 
                                        placeholder="Contoh: PPT, Video, LKPD, Buku Siswa..."></textarea>
                                </div>
                            </div>

                            <!-- Action Buttons - Mobile Friendly -->
                            <div class="pt-4 space-y-2">
                                <button type="button" onclick="window.generateModul()" class="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2">
                                    <i class="fas fa-wand-magic-sparkles"></i> <span class="hidden sm:inline">Generate Modul Ajar</span><span class="sm:hidden">Generate</span>
                                </button>
                                <button type="button" onclick="window.resetForm()" class="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm transition">
                                    <i class="fas fa-undo"></i> <span class="hidden sm:inline">Reset Form</span><span class="sm:hidden">Reset</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Preview (Right Column) -->
                <div class="lg:col-span-2">
                    <!-- Empty State -->
                    <div id="emptyPreview" class="bg-white rounded-lg shadow-sm p-12 text-center">
                        <i class="fas fa-file-circle-plus text-6xl text-gray-300 mb-4"></i>
                        <h3 class="text-xl font-semibold text-gray-600 mb-2">Belum Ada Modul</h3>
                        <p class="text-gray-500">Isi form di sebelah kiri dan klik "Generate Modul Ajar"</p>
                    </div>

                    <!-- Loading State -->
                    <div id="loadingPreview" class="hidden bg-white rounded-lg shadow-sm p-12 text-center">
                        <i class="fas fa-spinner fa-spin text-4xl text-purple-500 mb-4"></i>
                        <h3 class="text-xl font-semibold text-gray-600 mb-2">Menyusun Modul Ajar...</h3>
                        <p class="text-gray-500">AI sedang menganalisis parameter Anda</p>
                    </div>

                    <!-- Preview Content - RESPONSIVE CONTAINER -->
                    <div id="previewContent" class="hidden">
                        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
                            <!-- Preview Header - Mobile Friendly Buttons -->
                            <div class="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 sm:p-6 no-print">
                                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                    <div class="flex-1">
                                        <h2 class="text-xl sm:text-2xl font-bold mb-1">MODUL AJAR</h2>
                                        <p class="text-purple-100 text-sm sm:text-base" id="previewTopik">Topik Pembelajaran</p>
                                    </div>
                                    <!-- Buttons wrap on mobile -->
                                    <div class="flex flex-wrap gap-2 w-full sm:w-auto">
                                        <button onclick="window.copyModul()" class="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded text-xs sm:text-sm flex items-center gap-1 transition flex-1 sm:flex-none justify-center">
                                            <i class="fas fa-copy"></i> <span class="hidden sm:inline">Copy</span>
                                        </button>
                                        <button onclick="window.downloadWord()" class="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded text-xs sm:text-sm flex items-center gap-1 transition flex-1 sm:flex-none justify-center">
                                            <i class="fas fa-file-word"></i> <span class="hidden sm:inline">Word</span>
                                        </button>
                                        <button onclick="window.downloadPDF()" class="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded text-xs sm:text-sm flex items-center gap-1 transition flex-1 sm:flex-none justify-center">
                                            <i class="fas fa-file-pdf"></i> <span class="hidden sm:inline">PDF</span>
                                        </button>
                                        <button onclick="window.saveToFirebase()" class="bg-green-500/80 hover:bg-green-500 text-white px-3 py-1.5 rounded text-xs sm:text-sm flex items-center gap-1 transition flex-1 sm:flex-none justify-center">
                                            <i class="fas fa-save"></i> <span class="hidden sm:inline">Simpan</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- Preview Body - SCROLLABLE ON MOBILE -->
                            <div class="modul-preview-wrapper">
                                <div id="modulBody">
                                    <!-- Content will be generated here -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- TAB CONTENT: RIWAYAT -->
        <div id="content-riwayat" class="tab-content hidden">
            <div class="bg-white rounded-lg shadow-sm p-6">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-lg font-bold text-gray-800">Riwayat Modul Ajar</h3>
                    <button onclick="window.loadRiwayat()" class="bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                        <i class="fas fa-sync-alt"></i> Refresh
                    </button>
                </div>

                <div id="loadingRiwayat" class="text-center py-8">
                    <i class="fas fa-spinner fa-spin text-3xl text-purple-500"></i>
                    <p class="text-gray-500 mt-2">Memuat riwayat...</p>
                </div>

                <div id="gridRiwayat" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 hidden">
                    <!-- Cards will be rendered here -->
                </div>

                <div id="emptyRiwayat" class="text-center py-8 hidden">
                    <i class="fas fa-inbox text-4xl text-gray-300 mb-3"></i>
                    <p class="text-gray-500">Belum ada modul yang disimpan</p>
                </div>
            </div>
        </div>
    `;

    setTimeout(() => initModule(), 0);
    return div;
}

// ============================================
// FUNGSI INIT - Mengaktifkan Logic Module
// ============================================
async function initModule() {
    const formModul = document.getElementById('formModul');
    const emptyPreview = document.getElementById('emptyPreview');
    const loadingPreview = document.getElementById('loadingPreview');
    const previewContent = document.getElementById('previewContent');
    const modulBody = document.getElementById('modulBody');
    const previewTopik = document.getElementById('previewTopik');

    // --- FUNGSI TAB ---
    window.showTab = (tabName) => {
        document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active', 'border-purple-500', 'text-purple-600');
            btn.classList.add('border-transparent', 'text-gray-500');
        });
        document.getElementById(`content-${tabName}`).classList.remove('hidden');
        document.getElementById(`tab-${tabName}`).classList.add('active', 'border-purple-500', 'text-purple-600');
        document.getElementById(`tab-${tabName}`).classList.remove('border-transparent', 'text-gray-500');

        if (tabName === 'riwayat') {
            loadRiwayat();
        }
    }

    // --- FUNGSI RESET FORM ---
    window.resetForm = () => {
        formModul.reset();
        document.getElementById('namaSekolah').value = 'SDN 139 LAMANDA';
        document.getElementById('tahunPelajaran').value = '2025/2026';
        document.getElementById('alokasiWaktu').value = '2 x 35 menit';
        emptyPreview.classList.remove('hidden');
        previewContent.classList.add('hidden');
    }

    // ============================================
    // 🔹 GENERATOR MODUL AJAR (COMPLEX)
    // ============================================

    window.generateModul = () => {
        // Get all form values
        const data = {
            namaPenyusun: document.getElementById('namaPenyusun').value.trim(),
            namaSekolah: document.getElementById('namaSekolah').value.trim(),
            mapel: document.getElementById('mapel').value,
            kelasFase: document.getElementById('kelasFase').value,
            alokasiWaktu: document.getElementById('alokasiWaktu').value.trim(),
            tahunPelajaran: document.getElementById('tahunPelajaran').value.trim(),
            topik: document.getElementById('topik').value.trim(),
            capaianPembelajaran: document.getElementById('capaianPembelajaran').value.trim(),
            tujuanPembelajaran: document.getElementById('tujuanPembelajaran').value.trim(),
            profilPancasila: Array.from(document.getElementById('profilPancasila').selectedOptions).map(opt => opt.value),
            modelPembelajaran: document.getElementById('modelPembelajaran').value,
            mediaPembelajaran: document.getElementById('mediaPembelajaran').value.trim()
        };

        // Validation
        const required = ['namaPenyusun', 'namaSekolah', 'mapel', 'kelasFase', 'alokasiWaktu', 'topik', 'tujuanPembelajaran'];
        const missing = required.filter(field => !data[field]);

        if (missing.length > 0) {
            alert('⚠️ Mohon lengkapi field bertanda *');
            return;
        }

        // Show loading
        emptyPreview.classList.add('hidden');
        previewContent.classList.add('hidden');
        loadingPreview.classList.remove('hidden');

        // Simulate AI processing
        setTimeout(() => {
            const modulHTML = createComplexModulTemplate(data);
            modulBody.innerHTML = modulHTML;
            previewTopik.textContent = `${data.topik} - ${data.mapel} Kelas ${data.kelasFase.split('-')[0]}`;

            loadingPreview.classList.add('hidden');
            previewContent.classList.remove('hidden');

            // Store for later use
            window.currentModulData = data;
            window.currentModulHTML = modulHTML;

            // Scroll to preview
            previewContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 2000);
    }

    // ============================================
    // COMPLEX MODUL TEMPLATE GENERATOR
    // ============================================
    function createComplexModulTemplate(data) {
        const { 
            namaPenyusun, namaSekolah, mapel, kelasFase, alokasiWaktu, tahunPelajaran,
            topik, capaianPembelajaran, tujuanPembelajaran, profilPancasila, 
            modelPembelajaran, mediaPembelajaran 
        } = data;

        const kelas = kelasFase.split('-')[0];
        const fase = kelasFase.split('-')[1];
        const tanggal = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        // Generate components
        const cpContent = capaianPembelajaran || generateCapaianPembelajaran(mapel, kelas);
        const langkahContent = generateLangkahPembelajaranDetail(kelas, topik, mapel, modelPembelajaran);
        const asesmenContent = generateAsesmenDetail(kelas, topik, mapel);
        const profilContent = generateProfilPancasilaSection(profilPancasila, topik);
        const mediaContent = mediaPembelajaran || generateMediaPembelajaran(mapel, kelas);

        return `
            <!-- COVER -->
            <div class="cover-section">
                <div class="flex justify-center mb-4">
                    <div class="w-16 h-16 sm:w-20 sm:h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                        <i class="fas fa-graduation-cap text-3xl sm:text-4xl text-purple-600"></i>
                    </div>
                </div>
                <h1 class="text-center">MODUL AJAR</h1>
                <h2 class="text-center text-purple-600">${topik.toUpperCase()}</h2>
                <div class="cover-info">
                    <p><strong>Mata Pelajaran:</strong> ${mapel}</p>
                    <p><strong>Kelas/Fase:</strong> Kelas ${kelas} / Fase ${fase}</p>
                    <p><strong>Alokasi Waktu:</strong> ${alokasiWaktu}</p>
                    <p><strong>Tahun Pelajaran:</strong> ${tahunPelajaran}</p>
                    <p><strong>Sekolah:</strong> ${namaSekolah}</p>
                    <p><strong>Penyusun:</strong> ${namaPenyusun}</p>
                </div>
                <p class="text-xs text-gray-500 mt-4">Generated: ${tanggal}</p>
            </div>

            <!-- A. INFORMASI UMUM -->
            <div class="section">
                <h3 class="section-title">
                    <span class="section-icon">A</span>
                    INFORMASI UMUM
                </h3>
                <div class="info-box space-y-2">
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <p class="text-gray-600"><strong>Kompetensi Awal:</strong></p>
                        <p class="col-span-2 text-gray-700">${generateKompetensiAwal(kelas, mapel)}</p>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <p class="text-gray-600"><strong>Profil Pelajar Pancasila:</strong></p>
                        <p class="col-span-2 text-gray-700">${profilPancasila.join(', ') || 'Bernalar Kritis, Kreatif, Mandiri'}</p>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <p class="text-gray-600"><strong>Sarana & Prasarana:</strong></p>
                        <p class="col-span-2 text-gray-700">${mediaContent}</p>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <p class="text-gray-600"><strong>Target Peserta Didik:</strong></p>
                        <p class="col-span-2 text-gray-700">Siswa reguler/tipikal; umum, tidak ada kesulitan dalam memahami konsep dan abstraksi</p>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <p class="text-gray-600"><strong>Model Pembelajaran:</strong></p>
                        <p class="col-span-2 text-gray-700">${modelPembelajaran} dengan pendekatan student-centered</p>
                    </div>
                </div>
            </div>

            <!-- B. KOMPONEN INTI -->
            <div class="section">
                <h3 class="section-title">
                    <span class="section-icon">B</span>
                    KOMPONEN INTI
                </h3>

                <!-- B.1 Tujuan Pembelajaran -->
                <div class="mb-4">
                    <h4 class="font-semibold text-gray-800 mb-2 content-indent">1. Tujuan Pembelajaran</h4>
                    <p class="text-gray-700 content-indent">${tujuanPembelajaran}</p>
                </div>

                <!-- B.2 Pemahaman Bermakna -->
                <div class="mb-4">
                    <h4 class="font-semibold text-gray-800 mb-2 content-indent">2. Pemahaman Bermakna</h4>
                    <p class="text-gray-700 content-indent">${generatePemahamanBermakna(topik, mapel, kelas)}</p>
                </div>

                <!-- B.3 Pertanyaan Pemantik -->
                <div class="mb-4">
                    <h4 class="font-semibold text-gray-800 mb-2 content-indent">3. Pertanyaan Pemantik</h4>
                    <ul class="list-disc pl-14 space-y-1 text-gray-700">
                        ${generatePertanyaanPemantikComplex(topik, kelas, mapel).map(q => `<li>${q}</li>`).join('')}
                    </ul>
                </div>

                <!-- B.4 Kegiatan Pembelajaran -->
                <div class="mb-4">
                    <h4 class="font-semibold text-gray-800 mb-2 content-indent">4. Kegiatan Pembelajaran</h4>
                    ${langkahContent}
                </div>

                <!-- B.5 Asesmen -->
                <div class="mb-4">
                    <h4 class="font-semibold text-gray-800 mb-2 content-indent">5. Asesmen Pembelajaran</h4>
                    ${asesmenContent}
                </div>

                <!-- B.6 Pengayaan & Remedial -->
                <div class="mb-4">
                    <h4 class="font-semibold text-gray-800 mb-2 content-indent">6. Pengayaan dan Remedial</h4>
                    <div class="info-box blue content-indent">
                        <p class="text-gray-700"><strong>Pengayaan:</strong> Siswa yang sudah mencapai tujuan pembelajaran dapat mengerjakan soal tantangan atau membantu teman yang belum memahami.</p>
                        <p class="text-gray-700 mt-2"><strong>Remedial:</strong> Siswa yang belum mencapai tujuan pembelajaran akan diberikan bimbingan khusus dengan pendekatan yang berbeda dan latihan tambahan.</p>
                    </div>
                </div>
            </div>

            <!-- C. LAMPIRAN -->
            <div class="section">
                <h3 class="section-title">
                    <span class="section-icon">C</span>
                    LAMPIRAN
                </h3>
                <div class="info-box space-y-3">
                    <p><strong>1. Lembar Kerja Peserta Didik (LKPD)</strong> - Terlampir terpisah</p>
                    <p><strong>2. Bahan Bacaan Guru & Peserta Didik</strong> - Sesuai materi ${topik}</p>
                    <p><strong>3. Glosarium</strong> - Daftar istilah kunci pada materi ${topik}</p>
                    <p><strong>4. Daftar Pustaka</strong> - Buku teks ${mapel} Kelas ${kelas}, Kurikulum Merdeka</p>
                </div>
            </div>

            <!-- MENGETAHUI -->
            <div class="border-t-2 border-gray-300 pt-6 mt-8">
                <div class="signature-section">
                    <div class="signature-box">
                        <p class="text-sm text-gray-700 mb-16">Mengetahui,<br>Kepala Sekolah</p>
                        <p class="font-semibold signature-line">_________________________</p>
                        <p class="text-xs text-gray-500 mt-1">NIP. ...........................</p>
                    </div>
                    <div class="signature-box">
                        <p class="text-sm text-gray-700 mb-16">${tanggal}<br>Guru Mata Pelajaran</p>
                        <p class="font-semibold signature-line">${namaPenyusun}</p>
                        <p class="text-xs text-gray-500 mt-1">NIP. ...........................</p>
                    </div>
                </div>
            </div>

            <!-- FOOTER -->
            <div class="footer">
                <p>Modul ini disusun menggunakan Asisten Modul Ajar - ${namaSekolah}</p>
                <p class="mt-1">Kurikulum Merdeka | Tahun Pelajaran ${tahunPelajaran}</p>
            </div>
        `;
    }

    // ============================================
    // HELPER FUNCTIONS (COMPLEX GENERATORS)
    // ============================================

    function generateCapaianPembelajaran(mapel, kelas) {
        const cpDatabase = {
            'Matematika': {
                '1': 'Peserta didik dapat melakukan operasi penjumlahan dan pengurangan bilangan cacah sampai 100',
                '2': 'Peserta didik dapat melakukan operasi perkalian dan pembagian bilangan cacah',
                '3': 'Peserta didik dapat melakukan operasi hitung bilangan cacah, pecahan, dan desimal',
                '4': 'Peserta didik dapat melakukan operasi hitung bilangan bulat dan pecahan',
                '5': 'Peserta didik dapat melakukan operasi hitung bilangan bulat, pecahan, dan desimal',
                '6': 'Peserta didik dapat melakukan operasi hitung bilangan bulat, pecahan, dan persentase'
            },
            'Bahasa Indonesia': {
                '1': 'Peserta didik mampu membaca kata-kata yang dikenal sehari-hari',
                '2': 'Peserta didik mampu membaca teks pendek dengan lancar',
                '3': 'Peserta didik mampu membaca teks dengan pemahaman yang baik',
                '4': 'Peserta didik mampu membaca dan memahami teks informatif',
                '5': 'Peserta didik mampu membaca dan menganalisis teks berbagai jenis',
                '6': 'Peserta didik mampu membaca kritis dan memahami teks kompleks'
            }
        };
        return cpDatabase[mapel]?.[kelas] || 'Capaian pembelajaran sesuai Kurikulum Merdeka';
    }

    function generateKompetensiAwal(kelas, mapel) {
        return `Siswa telah memahami konsep dasar ${mapel} pada pertemuan sebelumnya dan memiliki pengetahuan prasyarat yang cukup untuk mempelajari materi baru.`;
    }

    function generatePemahamanBermakna(topik, mapel, kelas) {
        return `Melalui pembelajaran ${topik}, siswa memahami bahwa konsep ini memiliki aplikasi nyata dalam kehidupan sehari-hari dan dapat digunakan untuk memecahkan masalah kontekstual yang relevan dengan lingkungan mereka.`;
    }

    function generatePertanyaanPemantikComplex(topik, kelas, mapel) {
        const questions = [
            `Apa yang kalian ketahui tentang ${topik.toLowerCase()}?`,
            `Mengapa ${topik.toLowerCase()} penting untuk dipelajari dalam ${mapel}?`,
            `Di mana kita dapat menemukan penerapan ${topik.toLowerCase()} dalam kehidupan sehari-hari?`,
            `Bagaimana jika ${topik.toLowerCase()} tidak ada? Apa dampaknya?`
        ];
        return questions;
    }

    function generateLangkahPembelajaranDetail(kelas, topik, mapel, model) {
        const isLower = ['1', '2', '3'].includes(kelas);
        
        return `
            <div class="space-y-4">
                <div class="info-box blue">
                    <p class="font-semibold text-blue-800 mb-2">🔹 KEGIATAN PENDAHULUAN (${isLower ? '10' : '15'} menit)</p>
                    <ul class="list-disc pl-5 text-sm text-gray-700 space-y-1">
                        <li>Guru membuka pembelajaran dengan salam, doa, dan presensi</li>
                        <li>Apersepsi: Mengaitkan materi sebelumnya dengan ${topik}</li>
                        <li>Menyampaikan tujuan pembelajaran dan manfaatnya</li>
                        <li>Memberikan motivasi dan ice breaker ${isLower ? '(lagu/tepuk semangat)' : '(pertanyaan pemantik)'}</li>
                    </ul>
                </div>
                
                <div class="info-box green">
                    <p class="font-semibold text-green-800 mb-2">🔹 KEGIATAN INTI (${isLower ? '45' : '55'} menit)</p>
                    <div class="text-sm text-gray-700 space-y-3">
                        <p><strong>Fase 1 - Orientasi:</strong></p>
                        <ul class="list-disc pl-5 space-y-1">
                            <li>Siswa mengamati stimulus (gambar/video/objek) terkait ${topik}</li>
                            <li>Guru mengajukan pertanyaan pemantik untuk memicu rasa ingin tahu</li>
                        </ul>
                        
                        <p class="mt-3"><strong>Fase 2 - Organisasi:</strong></p>
                        <ul class="list-disc pl-5 space-y-1">
                            <li>Siswa dibagi dalam kelompok ${isLower ? '4-5 orang' : '3-4 orang'}</li>
                            <li>Setiap kelompok menerima LKPD dan bahan diskusi</li>
                            <li>Siswa berdiskusi dan mengerjakan tugas secara kolaboratif</li>
                        </ul>
                        
                        <p class="mt-3"><strong>Fase 3 - Investigasi:</strong></p>
                        <ul class="list-disc pl-5 space-y-1">
                            <li>Siswa mengeksplorasi konsep ${topik} melalui aktivitas hands-on</li>
                            <li>Guru berkeliling memberikan scaffolding dan bimbingan</li>
                            <li>Siswa mencatat hasil temuan dan kesimpulan sementara</li>
                        </ul>
                        
                        <p class="mt-3"><strong>Fase 4 - Presentasi:</strong></p>
                        <ul class="list-disc pl-5 space-y-1">
                            <li>Perwakilan kelompok mempresentasikan hasil diskusi</li>
                            <li>Kelompok lain memberikan tanggapan dan pertanyaan</li>
                            <li>Guru memfasilitasi diskusi kelas dan memberikan penguatan</li>
                        </ul>
                    </div>
                </div>
                
                <div class="info-box purple">
                    <p class="font-semibold text-purple-800 mb-2">🔹 KEGIATAN PENUTUP (${isLower ? '10' : '15'} menit)</p>
                    <ul class="list-disc pl-5 text-sm text-gray-700 space-y-1">
                        <li>Siswa bersama guru menyimpulkan pembelajaran hari ini</li>
                        <li>Refleksi: Siswa menyebutkan 1 hal yang dipelajari dan 1 pertanyaan yang masih ada</li>
                        <li>Guru memberikan umpan balik terhadap proses pembelajaran</li>
                        <li>Penugasan/pengayaan (opsional) untuk pertemuan berikutnya</li>
                        <li>Penutup dengan doa dan salam</li>
                    </ul>
                </div>
            </div>
        `;
    }

    function generateAsesmenDetail(kelas, topik, mapel) {
        const isLower = ['1', '2', '3'].includes(kelas);
        
        return `
            <div class="space-y-4 text-sm text-gray-700">
                <div class="info-box yellow">
                    <p class="font-semibold text-yellow-800 mb-2">📊 Asesmen Formatif (Selama Proses)</p>
                    <ul class="list-disc pl-5 space-y-1">
                        <li><strong>Observasi:</strong> Keaktifan siswa dalam diskusi dan kerja kelompok</li>
                        <li><strong>Unjuk Kerja:</strong> Presentasi hasil diskusi dan kemampuan berkomunikasi</li>
                        <li><strong>Kuis Singkat:</strong> ${isLower ? '3-5 soal lisan' : '5-10 soal tertulis'} untuk cek pemahaman</li>
                        <li><strong>Lembar Ceklis:</strong> Penilaian keterampilan proses ${isLower ? 'sederhana' : 'kompleks'}</li>
                    </ul>
                </div>
                
                <div class="info-box red">
                    <p class="font-semibold text-red-800 mb-2">📝 Asesmen Sumatif (Akhir)</p>
                    <ul class="list-disc pl-5 space-y-1">
                        <li><strong>Tes Tertulis:</strong> ${isLower ? 'Soal pilihan ganda dan isian singkat' : 'Soal uraian dan analisis'} tentang ${topik}</li>
                        <li><strong>Produk/Karya:</strong> Membuat ${isLower ? 'gambar/poster sederhana' : 'laporan/proyek kecil'} terkait ${topik}</li>
                        <li><strong>Portofolio:</strong> Kumpulan hasil kerja siswa selama pembelajaran</li>
                    </ul>
                    <p class="mt-2 text-xs text-gray-600"><em>Kriteria Ketuntasan: Skor ≥ 75 (KKM)</em></p>
                </div>
                
                <div class="info-box green">
                    <p class="font-semibold text-green-800 mb-2">📋 Rubrik Penilaian</p>
                    <div class="text-xs space-y-2">
                        <p><strong>Sikap:</strong> Kerjasama, tanggung jawab, disiplin (Skala 1-4)</p>
                        <p><strong>Pengetahuan:</strong> Pemahaman konsep ${topik} (Skala 1-100)</p>
                        <p><strong>Keterampilan:</strong> Kemampuan menerapkan konsep dalam penyelesaian masalah (Skala 1-4)</p>
                    </div>
                </div>
            </div>
        `;
    }

    function generateProfilPancasilaSection(profilPancasila, topik) {
        if (!profilPancasila || profilPancasila.length === 0) {
            profilPancasila = ['Bernalar Kritis', 'Kreatif', 'Mandiri'];
        }
        
        const deskripsiProfil = {
            'Beriman': 'Siswa menunjukkan sikap beriman dan bertakwa dalam setiap aktivitas pembelajaran',
            'Berkebinekaan': 'Siswa menghargai perbedaan pendapat dan budaya dalam diskusi kelompok',
            'Bergotong-royong': 'Siswa bekerjasama dengan baik dalam menyelesaikan tugas kelompok',
            'Mandiri': 'Siswa mampu menyelesaikan tugas secara mandiri dengan tanggung jawab',
            'Bernalar Kritis': 'Siswa mampu menganalisis masalah dan mengajukan solusi yang logis',
            'Kreatif': 'Siswa menghasilkan ide-ide kreatif dalam penyelesaian masalah'
        };
        
        return profilPancasila.map(p => `
            <div class="flex items-start gap-2 mb-2">
                <i class="fas fa-check-circle text-green-500 mt-1"></i>
                <div>
                    <p class="font-semibold text-gray-800">${p}</p>
                    <p class="text-sm text-gray-600">${deskripsiProfil[p] || ''}</p>
                </div>
            </div>
        `).join('');
    }

    function generateMediaPembelajaran(mapel, kelas) {
        const mediaDatabase = {
            'Matematika': 'Papan tulis, spidol, kartu bilangan, manipulatif (blok dienes), LKPD, projector',
            'Bahasa Indonesia': 'Teks bacaan, gambar ilustrasi, audio cerita, LKPD, projector',
            'IPA': 'Alat peraga, gambar/foto, video eksperimen, LKPD, alat praktikum sederhana',
            'IPS': 'Peta, gambar, video dokumenter, LKPD, projector',
            'PJOK': 'Lapangan, bola, cone, peluit, stopwatch',
            'Seni Budaya': 'Kertas gambar, pensil warna, krayon, gunting, lem, contoh karya'
        };
        return mediaDatabase[mapel] || 'Papan tulis, LKPD, projector, bahan ajar sesuai materi';
    }

    // ============================================
    // EXPORT & SAVE FUNCTIONS
    // ============================================

    window.copyModul = () => {
        const content = modulBody.innerText;
        navigator.clipboard.writeText(content).then(() => {
            alert('✅ Modul berhasil disalin ke clipboard!');
        }).catch(err => {
            console.error('Gagal copy:', err);
            alert('❌ Gagal menyalin. Silakan blok teks dan copy manual.');
        });
    }

    window.downloadWord = () => {
        const content = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head><meta charset='utf-8'><title>Modul Ajar</title></head>
            <body>${modulBody.innerHTML}</body>
            </html>
        `;
        const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ModulAjar_${window.currentModulData?.topik?.replace(/\s+/g, '_') || 'modul'}.doc`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    window.downloadPDF = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>Modul Ajar - ${window.currentModulData?.topik || ''}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; }
                    .prose { max-width: 800px; margin: 0 auto; }
                </style>
            </head>
            <body>${modulBody.innerHTML}</body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }

    // ============================================
    // ✅ UPDATED: SAVE TO FIREBASE (With userId)
    // ============================================
    window.saveToFirebase = async () => {
        if (!confirm('Simpan modul ini ke database?')) return;

        const data = window.currentModulData;
        
        try {
            await addDoc(collection(db, collectionName), {
                ...data,
                htmlContent: window.currentModulHTML,
                userId: auth.currentUser?.uid,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            alert('✅ Modul berhasil disimpan!');
            window.showTab('riwayat');
        } catch (error) {
            console.error('Error saving modul:', error);
            alert('❌ Gagal menyimpan: ' + error.message);
        }
    }

    // ============================================
    // ✅ UPDATED: RIWAYAT MODULE (With userId filter)
    // ============================================
    window.loadRiwayat = async () => {
        const loadingRiwayat = document.getElementById('loadingRiwayat');
        const gridRiwayat = document.getElementById('gridRiwayat');
        const emptyRiwayat = document.getElementById('emptyRiwayat');

        loadingRiwayat.classList.remove('hidden');
        gridRiwayat.classList.add('hidden');
        emptyRiwayat.classList.add('hidden');

        try {
            const userEmail = auth.currentUser?.email;
            const isAdmin = userEmail === ADMIN_EMAIL;
            
            let q;
            if (isAdmin) {
                q = query(collection(db, collectionName), orderBy("createdAt", "desc"));
            } else {
                q = query(collection(db, collectionName), 
                    where("userId", "==", auth.currentUser?.uid),
                    orderBy("createdAt", "desc")
                );
            }
            
            const snapshot = await getDocs(q);

            gridRiwayat.innerHTML = '';

            if (snapshot.empty) {
                loadingRiwayat.classList.add('hidden');
                emptyRiwayat.classList.remove('hidden');
                return;
            }

            snapshot.forEach(docSnap => {
                const data = docSnap.data();
                const tanggal = new Date(data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt).toLocaleDateString('id-ID');
                
                gridRiwayat.innerHTML += `
                    <div class="border rounded-lg p-4 hover:shadow-md transition">
                        <div class="flex justify-between items-start mb-2">
                            <span class="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">${data.mapel}</span>
                            <button onclick="window.deleteModul('${docSnap.id}')" class="text-red-500 hover:text-red-700">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                        <h4 class="font-semibold text-gray-800 mb-1">${data.topik}</h4>
                        <p class="text-sm text-gray-600 mb-2">Kelas ${data.kelasFase?.split('-')[0]} | ${tanggal}</p>
                        <p class="text-xs text-gray-500">Oleh: ${data.namaPenyusun}</p>
                        <button onclick="window.viewModul('${docSnap.id}')" class="mt-3 w-full bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1.5 rounded text-sm">
                            <i class="fas fa-eye mr-1"></i> Lihat
                        </button>
                    </div>
                `;
            });

            loadingRiwayat.classList.add('hidden');
            gridRiwayat.classList.remove('hidden');

        } catch (error) {
            console.error('Error loading riwayat:', error);
            loadingRiwayat.classList.add('hidden');
            emptyRiwayat.innerHTML = `
                <i class="fas fa-exclamation-circle text-4xl text-red-300 mb-3"></i>
                <p class="text-red-500">Gagal memuat riwayat: ${error.message}</p>
            `;
            emptyRiwayat.classList.remove('hidden');
        }
    }

    window.deleteModul = async (id) => {
        if (!confirm('Hapus modul ini dari riwayat?')) return;
        
        try {
            await deleteDoc(doc(db, collectionName, id));
            alert('✅ Modul berhasil dihapus!');
            loadRiwayat();
        } catch (error) {
            alert('❌ Gagal menghapus: ' + error.message);
        }
    }

    window.viewModul = (id) => {
        alert('Fitur view modul akan segera hadir!');
    }

    // Initial load
    loadRiwayat();
}
