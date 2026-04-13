// ✅ NON-MODULE VERSION: Langsung ke window tanpa import/export
(function() {
    console.log('🔴 [Penilaian Templates] START');
    
    window.getPenilaianTemplate = function() {
        return `
        <div class="penilaian-container min-h-screen flex flex-col md:flex-row bg-slate-50">
            <aside class="w-full md:w-72 sidebar-gradient text-slate-300 p-8 shadow-2xl z-20">
                <div class="flex items-center space-x-3 mb-12">
                    <div class="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <i class="fas fa-award"></i>
                    </div>
                    <h2 class="text-2xl font-extrabold text-white tracking-tight">EduAdmin</h2>
                </div>
                <nav class="space-y-4">
                    <div class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-4">Menu Penilaian</div>
                    <button onclick="switchView('pengetahuan')" id="btnPengetahuan" class="w-full flex items-center space-x-4 px-4 py-3 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 transition-all">
                        <i class="fas fa-brain w-5"></i> <span class="font-bold">Pengetahuan</span>
                    </button>
                    <button onclick="switchView('sikap')" id="btnSikap" class="w-full flex items-center space-x-4 px-4 py-3 rounded-2xl hover:bg-white/5 transition-all text-slate-300">
                        <i class="fas fa-heart w-5 text-rose-400"></i> <span class="font-bold">Sikap</span>
                    </button>
                </nav>
            </aside>

            <main class="flex-1 p-6 md:p-12 overflow-x-hidden">
                <header class="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-10 gap-6">
                    <div>
                        <h1 id="mainTitle" class="text-3xl font-extrabold text-slate-800 tracking-tight">Penilaian Pengetahuan</h1>
                        <p id="mainDesc" class="text-slate-500 font-medium text-sm">Input Nilai PH, STS, dan SAS</p>
                    </div>
                    <div class="flex flex-wrap gap-3">
                        <select id="selectKelasNilai" onchange="inisialisasiTabel(this.value)" class="bg-white border-2 border-slate-100 px-6 py-3 rounded-xl font-bold text-slate-700 outline-none shadow-sm focus:border-blue-500 transition-all">
                            <option value="">-- Pilih Kelas --</option>
                        </select>
                        <button onclick="simpanPermanen()" class="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all">
                            <i class="fas fa-save mr-2 text-blue-400"></i> Simpan Data
                        </button>
                    </div>
                </header>

                <div id="kontrolPengetahuan" class="flex flex-wrap gap-4 mb-8">
                    <button onclick="tambahKolomPH()" class="bg-blue-50 text-blue-600 px-5 py-3 rounded-xl font-bold hover:bg-blue-100 transition-all">
                        <i class="fas fa-plus-circle mr-2"></i> Tambah PH
                    </button>
                    <div class="flex items-center space-x-2 px-4 py-3 bg-slate-100 rounded-xl">
                        <span class="text-xs font-black text-slate-400 uppercase">KKM:</span>
                        <input type="number" id="inputKKM" value="75" oninput="updateSemuaWarna()" class="w-12 bg-transparent border-none text-center font-bold text-rose-600 outline-none">
                    </div>
                </div>

                <div class="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
                    <div class="overflow-x-auto">
                        <table id="tabelUtama" class="w-full text-left border-collapse">
                            <thead id="tabelHead" class="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b">
                            </thead>
                            <tbody id="tabelNilaiBody" class="divide-y divide-slate-100">
                                <tr><td colspan="6" class="p-20 text-center text-slate-300 font-bold italic">Pilih kelas untuk mengaktifkan tabel</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
        `;
    };
    
    console.log('🟢 [Penilaian Templates] READY - getPenilaianTemplate tersedia');
})();
