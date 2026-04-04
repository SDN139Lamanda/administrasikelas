/**
 * ============================================
 * MODULE: JENJANG CLASSES NAVIGATION
 * Platform Administrasi Kelas Digital
 * ============================================
 */

console.log('🔴 [Jenjang Classes] Script START');

// ✅ GLOBAL FUNCTION: Load Semester Options
window.loadSemester = function(jenjang, kelas) {
  console.log('📚 [Jenjang Classes] loadSemester:', jenjang, 'Kelas', kelas);
  
  // ✅ Hide dashboard sections (konsisten dengan module lain)
  hideDashboardSections();
  
  // ✅ Show module container
  const container = document.getElementById('module-container');
  if (!container) {
    console.error('❌ [Jenjang Classes] #module-container not found!');
    return;
  }
  
  // ✅ Render Semester Selection UI
  container.innerHTML = `
    <style>
      .semester-selection {
        max-width: 600px;
        margin: 60px auto;
        padding: 40px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        text-align: center;
      }
      .semester-selection h2 {
        color: #0891b2;
        margin-bottom: 10px;
        font-size: 24px;
      }
      .semester-selection .subtitle {
        color: #6b7280;
        margin-bottom: 30px;
      }
      .semester-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-top: 30px;
      }
      .semester-card {
        padding: 30px;
        background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%);
        color: white;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 4px 6px rgba(8, 145, 178, 0.3);
      }
      .semester-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 16px rgba(8, 145, 178, 0.4);
      }
      .semester-card h3 {
        font-size: 20px;
        margin-bottom: 8px;
      }
      .semester-card p {
        font-size: 14px;
        opacity: 0.9;
      }
      .btn-back {
        margin-top: 30px;
        padding: 12px 30px;
        background: #6b7280;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 16px;
      }
      .btn-back:hover {
        background: #4b5563;
      }
    </style>
    
    <div class="semester-selection">
      <h2>📚 Pilih Semester</h2>
      <p class="subtitle">Jenjang: <strong>${jenjang.toUpperCase()}</strong> | Kelas: <strong>${kelas}</strong></p>
      
      <div class="semester-grid">
        <div class="semester-card" onclick="renderCTAGenerator('${jenjang}', '${kelas}', '1')">
          <h3>📖 Semester 1</h3>
          <p>Ganjil (Jul-Des)</p>
        </div>
        <div class="semester-card" onclick="renderCTAGenerator('${jenjang}', '${kelas}', '2')">
          <h3>📖 Semester 2</h3>
          <p>Genap (Jan-Jun)</p>
        </div>
      </div>
      
      <button class="btn-back" onclick="backToDashboard()">
        <i class="fas fa-arrow-left mr-2"></i>Kembali ke Dashboard
      </button>
    </div>
  `;
  
  container.classList.remove('hidden');
  console.log('✅ [Jenjang Classes] Semester selection displayed');
};

// ✅ Helper: Hide Dashboard Sections
function hideDashboardSections() {
  const welcomeSection = document.querySelector('.dashboard-hero')?.closest('section');
  if (welcomeSection) {
    welcomeSection.classList.add('hidden');
    console.log('✅ [Jenjang Classes] Welcome section hidden');
  }
  
  const roomsSection = document.querySelector('[aria-labelledby="rooms-heading"]');
  if (roomsSection) {
    roomsSection.classList.add('hidden');
    console.log('✅ [Jenjang Classes] Rooms section hidden');
  }
  
  document.querySelectorAll('#sd-section, #smp-section, #sma-section').forEach(section => {
    section.classList.add('hidden');
    console.log('✅ [Jenjang Classes] Jenjang section hidden:', section.id);
  });
}

console.log('🟢 [Jenjang Classes] window.loadSemester:', typeof window.loadSemester);
console.log('🟢 [Jenjang Classes] Module FINISHED - Ready to use!');
