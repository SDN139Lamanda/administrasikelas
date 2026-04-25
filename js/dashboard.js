        // ✅ UPDATED: Navigation & Sub-Feature Routing WITH APPROVAL CHECK
        window.currentJenjang = null; 
        window.currentKelas = null;
        window.currentUserJenjang = null; // Store user's registered jenjang
        
        window.showJenjangSection = function(jenjang) {
            // ✅ ACCESS CHECK: Validate if user can access this jenjang
            if (!window.isUserApproved?.() && window.currentUserRole !== 'admin') {
                alert('⏳ Akun Anda masih menunggu persetujuan admin.\n\nFitur belum dapat diakses.');
                return; // Block access
            }
            
            // If access granted, proceed normally
            document.querySelectorAll('section[data-jenjang]').forEach(sec => sec.classList.add('hidden'));
            const target = document.getElementById(`${jenjang}-section`);
            if (target) { 
                target.classList.remove('hidden'); 
                window.scrollTo({ top: 0, behavior: 'smooth' }); 
            }
            // Hide module containers but NOT main sections yet (user still in jenjang selection)
            ['module-container','refleksi-container','penilaian-container','asisten-container','cita-container']
                .forEach(id => {
                    const el = document.getElementById(id); 
                    if(el) { el.classList.add('hidden'); el.innerHTML = ''; }
                });
        };
        
        // ✅ UPDATED: Sub-feature modal - APPROVAL CHECK HERE + hide main sections
        window.showSubFeatureModal = function(jenjang, kelas) {
            // ✅ CRITICAL: Check approval BEFORE allowing sub-feature access
            if (!window.isUserApproved?.() && window.currentUserRole !== 'admin') {
                console.log('🔒 [SubFeature] User pending, blocking modal');
                alert('⏳ Akun Anda masih menunggu persetujuan admin.\n\nFitur belum dapat diakses.');
                return; // Block access
            }
            
            // If access granted, proceed
            window.currentJenjang = jenjang; 
            window.currentKelas = kelas;
            window.currentUserJenjang = localStorage.getItem('user_jenjang') || '';
            
            const lbl = {tk:'TK', sd:'SD', mi:'MI', smp:'SMP', mts:'MTs', sma:'SMA', ma:'MA'}[jenjang] || jenjang.toUpperCase();
            document.getElementById('modal-jenjang-kelas').textContent = `${lbl} - Kelas ${kelas}`;
            document.getElementById('subfeature-modal').classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            
            // ✅ Hide main sections ONLY when sub-feature modal is open
            window.hideMainSectionsForSubFeature?.() || hideMainSectionsForSubFeatureFallback();
        };
        
        // ✅ Fallback function if not defined elsewhere
        function hideMainSectionsForSubFeatureFallback() {
            document.querySelector('.dashboard-hero')?.closest('section')?.classList.add('hidden');
            document.querySelector('[aria-labelledby="rooms-heading"]')?.classList.add('hidden');
            document.getElementById('admin-access-badge')?.classList.add('hidden');
        }
        
        window.closeSubFeatureModal = function() {
            document.getElementById('subfeature-modal').classList.add('hidden');
            document.body.style.overflow = ''; 
            window.currentJenjang = null; 
            window.currentKelas = null;
            
            // ✅ Show main sections when modal closes
            window.showMainSections?.() || showMainSectionsFallback();
        };
        
        function showMainSectionsFallback() {
            document.querySelector('.dashboard-hero')?.closest('section')?.classList.remove('hidden');
            document.querySelector('[aria-labelledby="rooms-heading"]')?.classList.remove('hidden');
            ['module-container','refleksi-container','penilaian-container','asisten-container','cita-container']
                .forEach(id => {
                    const el = document.getElementById(id); 
                    if(el) { el.classList.add('hidden'); el.innerHTML = ''; }
                });
        }

        function hideModuleContainers() {
            ['module-container','refleksi-container','penilaian-container','asisten-container','cita-container'].forEach(id => {
                const el = document.getElementById(id); if(el) { el.classList.add('hidden'); el.innerHTML = ''; }
            });
        }

        // ✅ ROUTER TO SAFE WRAPPERS - APPROVAL CHECK AT SUB-FEATURE LEVEL ONLY
        window.loadSubFeature = async function(subfitur) {
            const j = window.currentJenjang, k = window.currentKelas;
            const userJenjang = window.currentUserJenjang || localStorage.getItem('user_jenjang') || '';
            
            if (!j || !k) { alert('❌ Konteks kelas tidak ditemukan.'); return; }
            
            // ✅ CRITICAL: Block if user not approved
            if (!window.isUserApproved?.() && window.currentUserRole !== 'admin') {
                console.log('🔒 [LoadSubFeature] User pending, blocking feature load');
                alert('⏳ Akun Anda masih menunggu persetujuan admin.\n\nFitur belum dapat diakses.');
                return;
            }
            
            localStorage.setItem('current_jenjang', j); 
            localStorage.setItem('current_kelas', k); 
            localStorage.setItem('current_subfitur', subfitur);
            
            closeSubFeatureModal(); // Close modal first
            hideModuleContainers();
            
            // ✅ Ensure main sections are hidden when loading sub-feature
            (window.hideMainSectionsForSubFeature || hideMainSectionsForSubFeatureFallback)();
            
            // Show the specific container for this sub-feature
            const containerMap = {
                'adm-kelas': 'module-container',
                'adm-pembelajaran': 'module-container', 
                'penilaian': 'penilaian-container',
                'refleksi': 'refleksi-container',
                'asisten-modul': 'asisten-container',
                'cita-generator': 'cita-container'
            };
            const targetContainer = document.getElementById(containerMap[subfitur] || 'module-container');
            if (targetContainer) targetContainer.classList.remove('hidden');

            try {
                switch(subfitur) {
                    case 'adm-kelas': await window.safeRenderAdmKelas(); break;
                    case 'adm-pembelajaran': await window.safeRenderAdmPembelajaran(); break;
                    case 'penilaian': await window.safeRenderPenilaian(); break;
                    case 'refleksi': await window.safeRenderRefleksiForm(); break;
                    case 'asisten-modul':
                        if (typeof window.renderAsistenModul === 'function') await window.renderAsistenModul(j, k);
                        else { const m = await import('./modules/asisten-modul.js'); (m.renderAsistenModul || m.default)?.(j, k); }
                        break;
                    case 'cita-generator':
                        if (typeof window.renderCitaGenerator === 'function') await window.renderCitaGenerator(j, k);
                        else { const m = await import('./modules/cta-generator.js'); (m.renderCitaGenerator || m.default)?.(j, k); }
                        break;
                    default: 
                        if (['fitur-7','fitur-8','fitur-9','fitur-10'].includes(subfitur)) {
                            alert('🚧 Fitur ini sedang dalam pengembangan. Segera hadir!');
                        } else {
                            console.warn(`⚠️ Sub-fitur ${subfitur} belum terpasang.`);
                        }
                }
            } catch (err) { 
                console.error('Load Error:', err); 
                alert(`⚠️ Gagal memuat ${subfitur}.`); 
                // Show main sections again on error
                (window.showMainSections || showMainSectionsFallback)();
            }
        };
        
        window.backToDashboard = function() {
            // ✅ Show main sections when returning to dashboard
            (window.showMainSections || showMainSectionsFallback)();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
