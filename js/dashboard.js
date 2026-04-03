/**
 * ============================================
 * DASHBOARD LOGIC - LAYOUT 2 KOLOM
 * ============================================
 */

// ✅ NEW FUNCTION: Show section in left content area
window.showSection = function(sectionId) {
  console.log('📂 [Dashboard] showSection:', sectionId);
  
  // Hide welcome view
  const welcomeView = document.getElementById('welcome-view');
  if (welcomeView) welcomeView.classList.add('hidden');
  
  // Hide all sections first
  document.querySelectorAll('#dynamic-content .section').forEach(section => {
    section.classList.add('hidden');
  });
  
  // Show dynamic content container
  const dynamicContent = document.getElementById('dynamic-content');
  if (dynamicContent) dynamicContent.classList.remove('hidden');
  
  // Show target section
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.remove('hidden');
    targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  
  // Update active state on menu
  document.querySelectorAll('.room-card-vertical').forEach(card => {
    card.classList.remove('active');
  });
  const activeCard = document.querySelector(`[onclick="showSection('${sectionId}')"]`)?.closest('.room-card-vertical');
  if (activeCard) activeCard.classList.add('active');
  
  console.log('✅ [Dashboard] Section shown:', sectionId);
};

// ✅ NEW FUNCTION: Back to dashboard (show welcome)
window.backToDashboard = function() {
  console.log('🏠 [Dashboard] backToDashboard called');
  
  // Show welcome view
  const welcomeView = document.getElementById('welcome-view');
  if (welcomeView) welcomeView.classList.remove('hidden');
  
  // Hide dynamic content
  const dynamicContent = document.getElementById('dynamic-content');
  if (dynamicContent) dynamicContent.classList.add('hidden');
  
  // Hide all sections
  document.querySelectorAll('#dynamic-content .section').forEach(section => {
    section.classList.add('hidden');
  });
  
  // Remove active state from menu
  document.querySelectorAll('.room-card-vertical').forEach(card => {
    card.classList.remove('active');
  });
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  console.log('✅ [Dashboard] Back to dashboard');
};

// ✅ Keep existing functions (loadSemester, etc.)
// ... (existing code remains the same)

console.log('✅ [Dashboard] Layout 2 kolom loaded');
