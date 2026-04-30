// ✅ NON-MODULE VERSION: Langsung ke window tanpa import/export
(function() {
    console.log('🔴 [Penilaian Templates] START + Mobile CSS');
    
    window.getPenilaianTemplate = function() {
        return `
        <!-- ✅ MOBILE OPTIMIZATION CSS -->
        <style>
          /* Touch target minimum size for fingers */
          .touch-target { min-height: 44px !important; min-width: 44px !important; display: inline-flex; align-items: center; justify-content: center; }
          
          /* Prevent iOS zoom on input focus */
          .mobile-input { font-size: 16px !important; }
          
          /* Smooth horizontal scroll on mobile */
          .mobile-scroll { overflow-x: auto !important; -webkit-overflow-scrolling: touch !important; touch-action: pan-x !important; }
          
          /* Prevent double-tap zoom on buttons */
          .no-zoom { touch-action: manipulation; cursor: pointer; }
          
          /* Responsive adjustments */
          @media (max-width: 768px) {
            .penilaian-sidebar { width: 100% !important; position: relative !important; padding: 1rem !important; }
            .penilaian-main { padding: 1rem !important; }
            .touch-target { padding: 0.75rem 1rem !important; }
            #tabelUtama { min-width: 100% !important; }
            th, td { padding: 0.5rem !important; font-size: 0.875rem !important; }
          }
          
          /* Reduce motion for accessibility */
          @media (prefers-reduced-motion: reduce) {
            * { animation: none !important; transition: none !important; }
          }
        </style>

        <div class="penilaian-container min-h-screen flex flex-col md:flex-row bg-slate-50">
            <!-- Sidebar -->
            <aside class="w-full md:w-72 sidebar-gradient text-slate-300 p-8 shadow-2xl z-20 penilaian-sidebar">
                <div class="flex items-center space-x-3 mb-12">
                    <div class="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <i class="fas fa-award"></i>
                    </div>
                    <h2 class="text-2xl font-extrabold text-white tracking-tight">EduAdmin</h2>
                </div>
                <nav class="space-y-4">
                    <div class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-4">Menu Penilaian</div>
                    <button onclick="window.switchView('pengetahuan')" id="btnPengetahuan" class="w-full flex items-center space-x-4 px-4 py-3 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 transition-all no-zoom touch-target">
                        <i class="fas fa-brain w-5"></i> <span class="font-bold">Pengetahuan</span>
                    </button>
                    <button onclick="window.switchView('sikap')" id="btnSikap" class="w-full flex items-center space-x-4 px-4 py-3 rounded-2xl hover:bg-white/5 transition-all text-slate-300 no-zoom touch-target">
                        <i class="fas fa-heart w-5 text-rose-400"></i> <span class="font-bold">Sikap</span>
                    </button>
                    <button onclick="window.switchView('keterampilan')" id="btnKeterampilan" class="w-full flex items-center space-x-4 px-4 py-3 rounded-2xl hover:bg-white/5 transition-all text-slate-300 no-zoom touch-target">
                        <i class="fas fa-tools w-5 text-emerald-400"></i> <span class="font-bold">Keterampilan</span>
                    </button>
                </nav>
            </aside>

            <!-- Main Content -->
            <main class="flex-1 p-6 md:p-12 overflow-x-hidden penilaian-main">
                <!-- Header -->
                <header class="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-4">
                    <div>
                        <h1 id="mainTitle" class="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Penilaian Pengetahuan</h1>
                        <p id="mainDesc" class="text-slate-500 font-medium text-sm">Input Nilai PH, STS, dan SAS</p>
                    </div>
                    <div class="flex flex-wrap gap-3 w-full md:w-auto">
                        <select id="selectKelasNilai" onchange="window.inisialisasiTabel(this.value)" class="w-full md:w-auto bg-white border-2 border-slate-100 px-4 py-3 rounded-xl font-bold text-slate-700 outline-none shadow-sm focus:border-blue-500 transition-all mobile-input">
                            <option value="">-- Pilih Kelas --</option>
                        </select>
                        <button onclick="window.simpanPermanen()" class="flex-1 md:flex-none bg-slate-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all no-zoom touch-target">
                            <i class="fas fa-save mr-2 text-blue-400"></i> Simpan Data
                        </button>
                    </div>
                </header>

                <!-- Controls (Pengetahuan & Keterampilan only) -->
                <div id="kontrolPengetahuan" class="flex flex-wrap gap-3 mb-6">
                    <button onclick="window.tambahKolomPH()" class="bg-blue-50 text-blue-600 px-4 py-3 rounded-xl font-bold hover:bg-blue-100 transition-all no-zoom touch-target">
                        <i class="fas fa-plus-circle mr-2"></i> Tambah PH
                    </button>
                    <div class="flex items-center space-x-2 px-3 py-3 bg-slate-100 rounded-xl">
                        <span class="text-xs font-black text-slate-400 uppercase">KKM:</span>
                        <input type="number" id="inputKKM" value="75" class="w-14 bg-transparent border-none text-center font-bold text-rose-600 outline-none mobile-input">
                    </div>
                </div>

                <!-- Table - Mobile Scroll Optimized -->
                <div class="bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden mobile-scroll">
                    <div class="overflow-x-auto">
                        <table id="tabelUtama" class="w-full text-left border-collapse min-w-max">
                            <thead id="tabelHead" class="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b">
                            </thead>
                            <tbody id="tabelNilaiBody" class="divide-y divide-slate-100">
                                <tr><td colspan="7" class="p-16 md:p-20 text-center text-slate-300 font-bold italic">Pilih kelas untuk mengaktifkan tabel</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
        `;
    };
    
    console.log('🟢 [Penilaian Templates] READY - Mobile CSS Included');
})();
