<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit Profil - Platform Guru SD/SMP/SMA</title>
    <meta name="description" content="Edit Profil Guru">
    
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="css/styles.css">
    <link rel="stylesheet" href="css/components.css">
    <link rel="stylesheet" href="css/dashboard.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <style>
        .profile-card { max-width: 600px; margin: 40px auto; padding: 30px; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .profile-card h2 { text-align: center; color: #0891b2; margin-bottom: 24px; font-size: 24px; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; font-weight: 600; color: #374151; margin-bottom: 8px; font-size: 14px; }
        .form-group input { width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; }
        .form-group input:focus { outline: none; border-color: #0891b2; }
        .form-group input:disabled { background: #f3f4f6; color: #6b7280; cursor: not-allowed; }
        .btn-group { display: flex; gap: 12px; margin-top: 24px; }
        .btn-profile { flex: 1; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .btn-primary { background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); color: white; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(8,145,178,0.3); }
        .btn-secondary { background: #6b7280; color: white; }
        .btn-secondary:hover { background: #4b5563; transform: translateY(-2px); }
        .msg { margin-top: 16px; padding: 12px; border-radius: 8px; font-size: 14px; display: none; }
        .msg.success { background: #dcfce7; color: #166534; border: 1px solid #86efac; display: block; }
        .msg.error { background: #fef2f2; color: #991b1b; border: 1px solid #fca5a5; display: block; }
        .loading { text-align: center; padding: 40px; color: #6b7280; }
        @media (max-width: 640px) { .profile-card { margin: 20px; padding: 20px; } }
    </style>
</head>
<body class="bg-gray-50">

    <!-- Navbar (same as dashboard for consistency) -->
    <nav class="navbar" role="navigation" aria-label="Navigasi Utama">
        <div class="container">
            <div class="nav-content">
                <div class="nav-brand">
                    <a href="dashboard.html" class="flex items-center gap-3" aria-label="Kembali ke Dashboard">
                        <div class="nav-logo" aria-hidden="true"><i class="fas fa-school"></i></div>
                        <div>
                            <h1 class="nav-title">Administrasi Kelas</h1>
                            <p class="nav-subtitle">Platform Guru SD/SMP/SMA</p>
                        </div>
                    </a>
                </div>
                <div class="nav-actions flex items-center gap-4">
                    <div class="user-info hidden sm:flex items-center gap-2">
                        <span class="text-sm text-gray-600" id="userEmail">Loading...</span>
                        <img class="h-8 w-8 rounded-full" src="https://ui-avatars.com/api/?name=User&background=7c3aed&color=fff" alt="Profile" id="userAvatar">
                    </div>
                    <div class="relative">
                        <button id="profileMenuBtn" class="btn btn-ghost flex items-center gap-2" aria-label="Menu Profil">
                            <i class="fas fa-user-circle text-xl"></i><i class="fas fa-chevron-down text-xs"></i>
                        </button>
                        <div id="profileDropdown" class="hidden absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                            <div class="px-4 py-2 border-b border-gray-100">
                                <p class="text-sm font-medium text-gray-900" id="profileName">Loading...</p>
                                <p class="text-xs text-gray-500" id="profileEmailSub">Loading...</p>
                            </div>
                            <a href="change-password.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-lock mr-2"></i>Ganti Password</a>
                            <a href="profile.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-user-edit mr-2"></i>Edit Profil</a>
                            <div class="border-t border-gray-100 my-1"></div>
                            <button onclick="logout()" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"><i class="fas fa-sign-out-alt mr-2"></i>Logout</button>
                        </div>
                    </div>
                    <button onclick="logout()" class="btn btn-ghost sm:hidden"><i class="fas fa-sign-out-alt mr-2"></i>Keluar</button>
                </div>
            </div>
        </div>
    </nav>

    <main id="main-content">
        <section class="hero dashboard-hero">
            <div class="container">
                <h1 class="hero-title text-white"><i class="fas fa-user-edit mr-3"></i>Edit Profil</h1>
                <p class="hero-subtitle text-white">Update informasi profil Anda</p>
            </div>
        </section>

        <div class="container py-8">
            <div id="profileLoading" class="loading">
                <i class="fas fa-spinner fa-spin text-3xl mb-4"></i>
                <p>Memuat data profil...</p>
            </div>
            
            <div id="profileForm" class="profile-card hidden">
                <h2><i class="fas fa-user mr-2"></i>Profil Guru</h2>
                
                <div class="form-group">
                    <label for="nama_guru"><i class="fas fa-user mr-2"></i>Nama Guru</label>
                    <input id="nama_guru" type="text" placeholder="Masukkan nama lengkap" required>
                </div>
                
                <div class="form-group">
                    <label for="nip_guru"><i class="fas fa-id-card mr-2"></i>NIP Guru</label>
                    <input id="nip_guru" type="text" placeholder="Opsional">
                </div>
                
                <div class="form-group">
                    <label for="nama_sekolah"><i class="fas fa-school mr-2"></i>Nama Sekolah</label>
                    <input id="nama_sekolah" type="text" placeholder="Masukkan nama sekolah" required>
                </div>
                
                <div class="form-group">
                    <label for="nama_kepala_sekolah"><i class="fas fa-user-tie mr-2"></i>Nama Kepala Sekolah</label>
                    <input id="nama_kepala_sekolah" type="text" placeholder="Opsional">
                </div>
                
                <div class="form-group">
                    <label for="nip_kepala_sekolah"><i class="fas fa-id-card mr-2"></i>NIP Kepala Sekolah</label>
                    <input id="nip_kepala_sekolah" type="text" placeholder="Opsional">
                </div>
                
                <div class="form-group">
                    <label for="email"><i class="fas fa-envelope mr-2"></i>Email</label>
                    <input id="email" type="email" disabled class="bg-gray-100">
                    <p class="text-xs text-gray-500 mt-1">Email tidak dapat diubah. Hubungi admin jika perlu update.</p>
                </div>
                
                <div id="profileMsg" class="msg" role="status"></div>
                
                <div class="btn-group">
                    <button id="saveProfileBtn" class="btn-profile btn-primary"><i class="fas fa-save"></i> Simpan Perubahan</button>
                    <button id="backToDashboardBtn" class="btn-profile btn-secondary"><i class="fas fa-arrow-left"></i> Kembali</button>
                </div>
            </div>
        </div>
    </main>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2026 Platform Administrasi Kelas Digital.</p>
            <p class="mt-2">Dibuat untuk Guru SD/SMP/SMA</p>
        </div>
    </footer>

    <!-- ✅ Firebase Config Import -->
    <script type="module">
        import { auth, db, doc, getDoc, updateDoc, onAuthStateChanged } from './modules/firebase-config.js';
        
        console.log('🔴 [Profile] Module START');
        
        // DOM Elements
        const els = {
            profileLoading: document.getElementById('profileLoading'),
            profileForm: document.getElementById('profileForm'),
            profileMsg: document.getElementById('profileMsg'),
            namaGuru: document.getElementById('nama_guru'),
            nipGuru: document.getElementById('nip_guru'),
            namaSekolah: document.getElementById('nama_sekolah'),
            namaKepsek: document.getElementById('nama_kepala_sekolah'),
            nipKepsek: document.getElementById('nip_kepala_sekolah'),
            email: document.getElementById('email'),
            saveBtn: document.getElementById('saveProfileBtn'),
            backBtn: document.getElementById('backToDashboardBtn'),
            // Dropdown elements (for consistency)
            profileName: document.getElementById('profileName'),
            profileEmailSub: document.getElementById('profileEmailSub'),
            userEmail: document.getElementById('userEmail'),
            userAvatar: document.getElementById('userAvatar'),
            profileMenuBtn: document.getElementById('profileMenuBtn'),
            profileDropdown: document.getElementById('profileDropdown')
        };
        
        let currentUser = null;
        
        // Profile dropdown toggle (same as dashboard)
        if (els.profileMenuBtn && els.profileDropdown) {
            els.profileMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                els.profileDropdown.classList.toggle('hidden');
            });
            document.addEventListener('click', (e) => {
                if (!els.profileDropdown?.contains(e.target) && !els.profileMenuBtn?.contains(e.target)) {
                    els.profileDropdown?.classList.add('hidden');
                }
            });
        }
        
        // ✅ Load user data & populate form
        async function loadProfileData(userId) {
            try {
                console.log('👤 [Profile] Loading user:', userId);
                const userDoc = await getDoc(doc(db, 'users', userId));
                
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    console.log('✅ [Profile] User data loaded:', data);
                    
                    // Populate form fields
                    if (els.namaGuru) els.namaGuru.value = data.nama_lengkap || '';
                    if (els.nipGuru) els.nipGuru.value = data.nip_guru || '';
                    if (els.namaSekolah) els.namaSekolah.value = data.nama_sekolah || '';
                    if (els.namaKepsek) els.namaKepsek.value = data.nama_kepala_sekolah || '';
                    if (els.nipKepsek) els.nipKepsek.value = data.nip_kepala_sekolah || '';
                    if (els.email) els.email.value = data.email || '';
                    
                    // Update dropdown display
                    if (els.profileName) els.profileName.textContent = data.nama_lengkap || 'User';
                    if (els.profileEmailSub) els.profileEmailSub.textContent = data.email || '';
                    if (els.userEmail) els.userEmail.textContent = data.email || '';
                    if (els.userAvatar && data.nama_lengkap) {
                        els.userAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.nama_lengkap)}&background=7c3aed&color=fff`;
                    }
                    
                    // Show form, hide loading
                    els.profileLoading.classList.add('hidden');
                    els.profileForm.classList.remove('hidden');
                    
                    console.log('✅ [Profile] Form populated');
                } else {
                    showError('❌ Data profil tidak ditemukan.');
                }
            } catch (e) {
                console.error('❌ [Profile] Load error:', e);
                showError('❌ Gagal memuat data: ' + e.message);
            }
        }
        
        // ✅ Save profile data to Firestore
        async function saveProfileData() {
            if (!currentUser) {
                showError('⚠️ Silakan login dulu.');
                return;
            }
            
            // Validate required fields
            if (!els.namaGuru?.value.trim() || !els.namaSekolah?.value.trim()) {
                showError('⚠️ Nama Guru dan Nama Sekolah wajib diisi.');
                return;
            }
            
            try {
                console.log('💾 [Profile] Saving data...');
                els.saveBtn.disabled = true;
                els.saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
                
                const updateData = {
                    nama_lengkap: els.namaGuru.value.trim(),
                    nip_guru: els.nipGuru?.value.trim() || '',
                    nama_sekolah: els.namaSekolah.value.trim(),
                    nama_kepala_sekolah: els.namaKepsek?.value.trim() || '',
                    nip_kepala_sekolah: els.nipKepsek?.value.trim() || '',
                    updatedAt: new Date().toISOString()
                };
                
                await updateDoc(doc(db, 'users', currentUser.uid), updateData);
                
                console.log('✅ [Profile] Data saved');
                showSuccess('✅ Profil berhasil diperbarui!');
                
                // Update localStorage for other modules
                localStorage.setItem('user_nama_lengkap', els.namaGuru.value.trim());
                localStorage.setItem('user_nama_sekolah', els.namaSekolah.value.trim());
                
                // Auto-refresh dashboard data
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
                
            } catch (e) {
                console.error('❌ [Profile] Save error:', e);
                showError('❌ Gagal menyimpan: ' + e.message);
            } finally {
                els.saveBtn.disabled = false;
                els.saveBtn.innerHTML = '<i class="fas fa-save"></i> Simpan Perubahan';
            }
        }
        
        // ✅ Show success message
        function showSuccess(msg) {
            els.profileMsg.textContent = msg;
            els.profileMsg.className = 'msg success';
            setTimeout(() => { els.profileMsg.className = 'msg'; }, 3000);
        }
        
        // ✅ Show error message
        function showError(msg) {
            els.profileMsg.textContent = msg;
            els.profileMsg.className = 'msg error';
        }
        
        // ✅ Setup event listeners
        function setupEventListeners() {
            if (els.saveBtn) {
                els.saveBtn.addEventListener('click', saveProfileData);
            }
            if (els.backBtn) {
                els.backBtn.addEventListener('click', () => {
                    window.location.href = 'dashboard.html';
                });
            }
            // Allow Enter key to save
            document.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && els.profileForm?.classList.contains('hidden') === false) {
                    e.preventDefault();
                    saveProfileData();
                }
            });
        }
        
        // ✅ Auth state listener
        onAuthStateChanged(auth, (user) => {
            console.log('🔐 [Profile] Auth:', user ? `IN (${user.uid})` : 'OUT');
            
            if (user) {
                currentUser = user;
                loadProfileData(user.uid);
            } else {
                // Not logged in → redirect to login
                window.location.href = 'index.html';
            }
        });
        
        // Setup listeners after DOM ready
        document.addEventListener('DOMContentLoaded', setupEventListeners);
        
        console.log('🟢 [Profile] Module READY');
    </script>
    
    <!-- ✅ Logout function (same as dashboard) -->
    <script>
        function logout() {
            import('./modules/firebase-config.js').then(({ auth, signOut }) => {
                signOut(auth).then(() => {
                    localStorage.clear();
                    window.location.href = 'index.html';
                }).catch((error) => {
                    console.error('❌ Logout error:', error);
                    alert('❌ Gagal logout: ' + error.message);
                });
            });
        }
    </script>
    
</body>
</html>
