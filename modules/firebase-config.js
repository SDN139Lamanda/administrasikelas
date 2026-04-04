rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ============================================
    // HELPER FUNCTIONS
    // ============================================
    
    // Cek apakah user sudah login
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Cek apakah user adalah admin
    function isAdmin() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Cek apakah user mengakses data sendiri
    function isOwnData(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Get user data dari Firestore
    function getUserData(userId) {
      return get(/databases/$(database)/documents/users/$(userId)).data;
    }
    
    // ============================================
    // USERS COLLECTION (MAIN)
    // ============================================
    
    match /users/{userId} {
      
      // CREATE: Hanya admin yang bisa create user baru
      allow create: if isAdmin();
      
      // READ: 
      // • User bisa baca data sendiri
      // • Admin bisa baca semua data
      // • User bisa baca data lain HANYA jika jenjang sama & role=guru
      allow read: if isOwnData(userId) || 
                  isAdmin() ||
                  (isAuthenticated() && 
                   getUserData(request.auth.uid).jenjang == getUserData(userId).jenjang &&
                   getUserData(request.auth.uid).role == 'guru' &&
                   getUserData(userId).role == 'guru');
      
      // UPDATE: 
      // • User hanya bisa update field tertentu di data sendiri
      // • Admin bisa update semua field
      allow update: if isOwnData(userId) && 
                    // User hanya bisa update: lastLogin, namaLengkap, noHp
                    request.resource.data.diff(resource.data).affectedKeys().hasOnly([
                      'lastLogin', 'namaLengkap', 'noHp'
                    ]) ||
                    isAdmin();
      
      // DELETE: Hanya admin yang bisa hapus user
      allow delete: if isAdmin();
    }
    
    // ============================================
    // APPROVAL_LOGS COLLECTION (Admin Only)
    // ============================================
    
    match /approval_logs/{logId} {
      allow read, write: if isAdmin();
    }
    
    // ============================================
    // CLASSES COLLECTION (Adm. Kelas - storage.js)
    // ============================================
    
    match /classes/{classId} {
      // READ: User hanya bisa baca data kelas MILIK SENDIRI
      allow read: if isAuthenticated() && (
        isAdmin() ||  // Admin: akses semua
        resource.data.userId == request.auth.uid  // User: hanya data sendiri
      );
      
      // WRITE: User hanya bisa tulis data MILIK SENDIRI
      allow write: if isAuthenticated() && (
        isAdmin() ||  // Admin: bisa tulis semua
        (request.resource.data.userId == request.auth.uid)  // User: hanya data sendiri
      );
    }
    
    // ============================================
    // REFLECTIONS COLLECTION (Refleksi Module)
    // ============================================
    
    match /reflections/{reflectionId} {
      // READ: User hanya bisa baca refleksi MILIK SENDIRI
      allow read: if isAuthenticated() && (
        isAdmin() ||  // Admin: akses semua
        resource.data.guruId == request.auth.uid  // User: hanya refleksi sendiri
      );
      
      // CREATE: User bisa buat refleksi baru dengan guruId sendiri
      allow create: if isAuthenticated() && (
        isAdmin() ||
        request.resource.data.guruId == request.auth.uid  // Harus sesuai userId login
      );
      
      // UPDATE/DELETE: User hanya bisa edit/hapus refleksi MILIK SENDIRI
      allow update, delete: if isAuthenticated() && (
        isAdmin() ||
        resource.data.guruId == request.auth.uid
      );
    }
    
    // ============================================
    // PENILAIAN COLLECTION (Contoh)
    // ============================================
    
    match /penilaian/{docId} {
      allow read: if isAuthenticated() && (
        isAdmin() ||
        resource.data.userId == request.auth.uid ||
        // Guru bisa baca nilai siswa di kelas/mapel yang sama
        (getUserData(request.auth.uid).jenjang == 'sd' &&
         getUserData(request.auth.uid).kelas == resource.data.kelas) ||
        (getUserData(request.auth.uid).jenjang in ['smp', 'sma'] &&
         getUserData(request.auth.uid).mataPelajaranSMP == resource.data.mataPelajaran)
      );
      
      allow write: if isAuthenticated() && (
        isAdmin() ||
        resource.data.userId == request.auth.uid
      );
    }
    
    // ============================================
    // DEFAULT: DENY ALL (Safety Net)
    // ============================================
    
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
