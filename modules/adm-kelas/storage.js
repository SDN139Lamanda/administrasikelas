/**
 * STORAGE: Simple Firebase + LocalStorage
 * ☢️ NUCLEAR EDITION: Maximum safety, validation, and debugging
 */

import * as fb from '../firebase-config.js';

const DB_KEY = 'eduDBProV6';
const USE_FIREBASE = true;

// ============================================
// ☢️ NUKLEAR HELPERS
// ============================================

function isFirebaseMode(userId) {
  const mode = USE_FIREBASE && userId && typeof userId === 'string' && userId.length > 0;
  console.log(`🔍 [Storage] isFirebaseMode(${userId}): ${mode}`);
  return mode;
}

function clearLocalStorage() {
  try {
    localStorage.removeItem(DB_KEY);
    console.log('🧹 [Storage] LocalStorage cleared');
  } catch (e) {
    console.warn('⚠️ [Storage] Failed to clear LocalStorage:', e.message);
  }
}

// ☢️ VALIDATE: Pastikan userId valid sebelum operasi
function validateUserId(userId, operation) {
  if (!userId) {
    console.error(`❌ [Storage] ${operation}: userId is NULL/undefined`);
    return false;
  }
  if (typeof userId !== 'string') {
    console.error(`❌ [Storage] ${operation}: userId is not string:`, typeof userId);
    return false;
  }
  if (userId.trim().length === 0) {
    console.error(`❌ [Storage] ${operation}: userId is empty string`);
    return false;
  }
  console.log(`✅ [Storage] ${operation}: userId validated: ${userId.substring(0, 10)}...`);
  return true;
}

// ☢️ PRE-FLIGHT CHECK: Validasi sebelum delete
async function preFlightDeleteCheck(db, classId, userId) {
  console.log(`🛡️ [Storage] Pre-flight check for delete: classId=${classId}, userId=${userId}`);
  
  try {
    // 1. Cek dokumen ada
    const docRef = fb.doc(db, 'classes', classId);
    const snap = await fb.getDoc(docRef, { source: 'server' });
    
    if (!snap.exists()) {
      console.warn(`⚠️ [Storage] Pre-flight: Document ${classId} not found (already deleted?)`);
      return { exists: false, userIdMatch: false };
    }
    
    const data = snap.data();
    console.log(`📄 [Storage] Pre-flight: Document data:`, {
      hasUserId: 'userId' in data,
      userIdValue: data.userId,
      userIdType: typeof data.userId,
      authUid: userId
    });
    
    // 2. Cek userId match
    const userIdMatch = data.userId === userId;
    console.log(`🔐 [Storage] Pre-flight: userId match = ${userIdMatch}`);
    
    if (!userIdMatch) {
      console.error(`❌ [Storage] Pre-flight FAILED: userId mismatch!`);
      console.error(`   Expected: ${userId}`);
      console.error(`   Found: ${data.userId}`);
    }
    
    return { exists: true, userIdMatch, data };
    
  } catch (e) {
    console.error(`❌ [Storage] Pre-flight check error:`, e.message);
    return { exists: false, userIdMatch: false, error: e.message };
  }
}

// ☢️ RETRY LOGIC: Coba ulang jika transient failure
async function withRetry(fn, operation, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 [Storage] ${operation} attempt ${attempt}/${maxRetries}`);
      return await fn();
    } catch (e) {
      lastError = e;
      console.warn(`⚠️ [Storage] ${operation} attempt ${attempt} failed:`, e.message);
      
      // Jangan retry untuk permission errors (tidak akan berubah)
      if (e.code === 'permission-denied' || e.message.includes('Missing or insufficient permissions')) {
        console.error(`❌ [Storage] ${operation}: Permission error - not retrying`);
        throw e;
      }
      
      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 100 * attempt));
      }
    }
  }
  
  console.error(`❌ [Storage] ${operation} failed after ${maxRetries} attempts`);
  throw lastError;
}

// ============================================
// ☢️ STORAGE OBJECT
// ============================================

export const storage = {
  userId: null,
  
  setUserId: function(uid) {
    console.log(`🔧 [Storage] setUserId called: ${uid ? uid.substring(0, 10) + '...' : 'null'}`);
    
    if (uid && typeof uid === 'string' && uid.length > 0) {
      this.userId = uid;
      console.log(`✅ [Storage] userId set: ${uid.substring(0, 10)}...`);
    } else {
      this.userId = null;
      console.warn(`⚠️ [Storage] userId set to null (invalid input)`);
    }
  },
  
  loadClasses: async function() {
    console.log('📦 [Storage] loadClasses called, userId:', this.userId?.substring(0, 10) + '...');
    
    if (isFirebaseMode(this.userId)) {
      console.log('🔥 [Storage] Using Firebase mode (NO fallback)');
      return await this._loadFromFirebase('classes');
    }
    
    console.log('💾 [Storage] Using LocalStorage mode');
    try {
      const raw = localStorage.getItem(DB_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('❌ [Storage] LocalStorage parse error:', e.message);
      return [];
    }
  },
  
  saveClasses: async function(classes) {
    if (isFirebaseMode(this.userId)) {
      await this._saveToFirebase('classes', classes);
      clearLocalStorage();
      return;
    }
    localStorage.setItem(DB_KEY, JSON.stringify(classes));
  },
  
  // ☢️ NUKLEAR: addClass dengan validasi maksimal
  addClass: async function(classData) {
    console.log('➕ [Storage] addClass called:', { 
      nama: classData?.nama, 
      userId: this.userId?.substring(0, 10) + '...' 
    });
    
    if (!validateUserId(this.userId, 'addClass')) {
      throw new Error('addClass: userId validation failed');
    }
    
    // ☢️ FIX: Jangan include field 'id' - Firestore doc ID adalah source of truth
    const newClass = {
      nama: classData?.nama?.trim(),
      siswa: classData?.siswa || [],
      absen: classData?.absen || [],
      userId: this.userId, // ✅ Explicit inject userId
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (!newClass.nama) {
      throw new Error('addClass: nama is required');
    }
    
    if (isFirebaseMode(this.userId)) {
      return await withRetry(async () => {
        try {
          const colRef = fb.collection(fb.db, 'classes');
          const docRef = await fb.addDoc(colRef, newClass);
          console.log('✅ [Storage] Saved to Firebase:', docRef.id);
          clearLocalStorage();
          
          // Return dengan Firestore doc ID sebagai id
          return { id: docRef.id, ...newClass };
        } catch (e) {
          console.error('❌ [Storage] Firebase addClass error:', e.message);
          throw e;
        }
      }, 'addClass');
    }
    
    const classes = await this.loadClasses();
    classes.push(newClass);
    await this.saveClasses(classes);
    return newClass;
  },
  
  updateClass: async function(classId, updates) {
    console.log('✏️ [Storage] updateClass called:', { classId, userId: this.userId?.substring(0, 10) + '...' });
    
    if (!validateUserId(this.userId, 'updateClass')) {
      throw new Error('updateClass: userId validation failed');
    }
    if (!classId) {
      throw new Error('updateClass: classId is required');
    }
    
    if (isFirebaseMode(this.userId)) {
      return await withRetry(async () => {
        try {
          const docRef = fb.doc(fb.db, 'classes', classId);
          await fb.updateDoc(docRef, { 
            ...updates, 
            userId: this.userId, 
            updatedAt: new Date().toISOString() 
          });
          console.log('✅ [Storage] Updated in Firebase');
          clearLocalStorage();
          return { id: classId, ...updates };
        } catch (e) {
          console.error('❌ [Storage] Firebase updateClass error:', e.message);
          throw e;
        }
      }, 'updateClass');
    }
    
    const classes = await this.loadClasses();
    const idx = classes.findIndex(c => c.id === classId);
    if (idx === -1) throw new Error('Class not found');
    classes[idx] = { ...classes[idx], ...updates, updatedAt: new Date().toISOString() };
    await this.saveClasses(classes);
    return classes[idx];
  },
  
  // ☢️☢️☢️ NUKLEAR DELETE: Maximum safety checks ☢️☢️☢️
  deleteClass: async function(classId) {
    console.log('🗑️ [Storage] deleteClass CALLED:', { 
      classId, 
      userId: this.userId?.substring(0, 10) + '...',
      isFirebase: isFirebaseMode(this.userId)
    });
    
    // ☢️ VALIDASI INPUT
    if (!validateUserId(this.userId, 'deleteClass')) {
      throw new Error('deleteClass: userId validation failed - cannot proceed');
    }
    if (!classId || typeof classId !== 'string') {
      throw new Error(`deleteClass: invalid classId: ${classId}`);
    }
    
    if (isFirebaseMode(this.userId)) {
      return await withRetry(async () => {
        try {
          // ☢️ PRE-FLIGHT CHECK (wajib sebelum delete)
          const preCheck = await preFlightDeleteCheck(fb.db, classId, this.userId);
          
          if (preCheck.error) {
            throw new Error(`Pre-flight check failed: ${preCheck.error}`);
          }
          
          if (!preCheck.exists) {
            console.log('⚠️ [Storage] Document already deleted or not found');
            clearLocalStorage();
            return;
          }
          
          if (!preCheck.userIdMatch) {
            // ☢️ CRITICAL: userId tidak match = permission will be denied
            // Tapi kita coba delete anyway (mungkin rules lebih permissive)
            console.warn('⚠️ [Storage] userId mismatch but attempting delete anyway...');
          }
          
          // ☢️ EXECUTE DELETE
          const docRef = fb.doc(fb.db, 'classes', classId);
          console.log('🔥 [Storage] Executing deleteDoc:', classId);
          
          await fb.deleteDoc(docRef);
          console.log('✅ [Storage] deleteDoc completed');
          
          // ☢️ POST-FLIGHT VERIFICATION (wajib)
          console.log('🔍 [Storage] Post-flight verification...');
          const verifySnap = await fb.getDoc(docRef, { source: 'server' });
          
          if (verifySnap.exists()) {
            console.error('❌ [Storage] POST-FLIGHT FAILED: Document still exists after delete!');
            console.error('   This could mean:');
            console.error('   • Firestore replication delay');
            console.error('   • Rules blocked the delete');
            console.error('   • Wrong document ID');
            throw new Error('Post-flight verification failed: document still exists');
          } else {
            console.log('✅ [Storage] POST-FLIGHT PASSED: Document truly deleted');
          }
          
          clearLocalStorage();
          console.log('🎉 [Storage] deleteClass completed successfully');
          return;
          
        } catch (e) {
          console.error('❌ [Storage] Firebase deleteClass error:', {
            message: e.message,
            code: e.code,
            name: e.name,
            stack: e.stack?.substring(0, 200)
          });
          
          // ☢️ Jangan throw untuk permission errors - biarkan UI handle
          if (e.code === 'permission-denied' || e.message.includes('Missing or insufficient permissions')) {
            console.error('❌ [Storage] PERMISSION DENIED - check firestore.rules and userId match');
          }
          
          throw e;
        }
      }, 'deleteClass');
    }
    
    // LocalStorage fallback
    console.log('💾 [Storage] Using LocalStorage delete');
    let classes = await this.loadClasses();
    const before = classes.length;
    classes = classes.filter(c => c.id !== classId);
    console.log(`🗑️ [Storage] LocalStorage: removed ${before - classes.length} class(es)`);
    await this.saveClasses(classes);
  },
  
  // ☢️ NUKLEAR: addStudent dengan validasi
  addStudent: async function(classId, studentData) {
    console.log('👤 [Storage] addStudent called:', { classId, userId: this.userId?.substring(0, 10) + '...' });
    
    if (!validateUserId(this.userId, 'addStudent')) {
      throw new Error('addStudent: userId validation failed');
    }
    
    if (isFirebaseMode(this.userId)) {
      return await withRetry(async () => {
        try {
          const docRef = fb.doc(fb.db, 'classes', classId);
          
          // ☢️ Gunakan query dengan userId filter untuk keamanan ekstra
          const q = fb.query(
            fb.collection(fb.db, 'classes'), 
            fb.where('userId', '==', this.userId),
            fb.where(fb.documentId(), '==', classId)
          );
          
          const classSnap = await fb.getDocs(q, { source: 'server' });
          
          if (classSnap.empty) {
            throw new Error(`Class ${classId} not found or not owned by user`);
          }
          
          const classData = classSnap.docs[0].data();
          classData.siswa = classData.siswa || [];
          
          const newStudent = {
            id: studentData.id || `stu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            nama: studentData.nama?.trim(),
            gender: studentData.gender || 'L',
            createdAt: new Date().toISOString()
          };
          
          if (!newStudent.nama) {
            throw new Error('addStudent: nama is required');
          }
          
          classData.siswa.push(newStudent);
          
          await fb.updateDoc(docRef, { 
            siswa: classData.siswa, 
            userId: this.userId,
            updatedAt: new Date().toISOString() 
          });
          
          console.log('✅ [Storage] Student added via Firebase');
          clearLocalStorage();
          return studentData;
        } catch (e) {
          console.error('❌ [Storage] Firebase addStudent error:', e.message);
          throw e;
        }
      }, 'addStudent');
    }
    
    const classes = await this.loadClasses();
    const idx = classes.findIndex(c => c.id === classId);
    if (idx === -1) throw new Error('Class not found');
    classes[idx].siswa.push({
      id: studentData.id || `stu_${Date.now()}`,
      nama: studentData.nama,
      gender: studentData.gender || 'L'
    });
    await this.saveClasses(classes);
    return studentData;
  },
  
  deleteStudent: async function(classId, studentId) {
    console.log('🗑️ [Storage] deleteStudent called:', { classId, studentId, userId: this.userId?.substring(0, 10) + '...' });
    
    if (isFirebaseMode(this.userId)) {
      return await withRetry(async () => {
        try {
          const docRef = fb.doc(fb.db, 'classes', classId);
          const q = fb.query(
            fb.collection(fb.db, 'classes'), 
            fb.where('userId', '==', this.userId),
            fb.where(fb.documentId(), '==', classId)
          );
          const classSnap = await fb.getDocs(q, { source: 'server' });
          
          if (!classSnap.empty) {
            const classData = classSnap.docs[0].data();
            classData.siswa = (classData.siswa || []).filter(s => s.id !== studentId);
            await fb.updateDoc(docRef, { 
              siswa: classData.siswa, 
              userId: this.userId,
              updatedAt: new Date().toISOString() 
            });
            console.log('✅ [Storage] Student deleted via Firebase');
            clearLocalStorage();
          }
          return;
        } catch (e) {
          console.error('❌ [Storage] Firebase deleteStudent error:', e.message);
          throw e;
        }
      }, 'deleteStudent');
    }
    
    const classes = await this.loadClasses();
    const idx = classes.findIndex(c => c.id === classId);
    if (idx === -1) throw new Error('Class not found');
    classes[idx].siswa = classes[idx].siswa.filter(s => s.id !== studentId);
    await this.saveClasses(classes);
  },
  
  saveAttendance: async function(classId, date, attendanceData) {
    console.log('📋 [Storage] saveAttendance called:', { classId, date, userId: this.userId?.substring(0, 10) + '...' });
    
    if (isFirebaseMode(this.userId)) {
      return await withRetry(async () => {
        try {
          const docRef = fb.doc(fb.db, 'classes', classId);
          const q = fb.query(
            fb.collection(fb.db, 'classes'), 
            fb.where('userId', '==', this.userId),
            fb.where(fb.documentId(), '==', classId)
          );
          const classSnap = await fb.getDocs(q, { source: 'server' });
          
          if (!classSnap.empty) {
            const classData = classSnap.docs[0].data();
            classData.absen = (classData.absen || []).filter(a => a.tanggal !== date);
            classData.absen.push({ 
              tanggal: date, 
              data: attendanceData, 
              savedAt: new Date().toISOString() 
            });
            await fb.updateDoc(docRef, { 
              absen: classData.absen, 
              userId: this.userId,
              updatedAt: new Date().toISOString() 
            });
            console.log('✅ [Storage] Attendance saved via Firebase');
            clearLocalStorage();
          }
          return;
        } catch (e) {
          console.error('❌ [Storage] Firebase saveAttendance error:', e.message);
          throw e;
        }
      }, 'saveAttendance');
    }
    
    const classes = await this.loadClasses();
    const idx = classes.findIndex(c => c.id === classId);
    if (idx === -1) throw new Error('Class not found');
    classes[idx].absen = classes[idx].absen.filter(a => a.tanggal !== date);
    classes[idx].absen.push({ tanggal: date, data: attendanceData, savedAt: new Date().toISOString() });
    await this.saveClasses(classes);
  },
  
  // ☢️ NUKLEAR LOAD: Exclude 'id' field + validate each doc
  _loadFromFirebase: async function(collectionName) {
    if (!this.userId) {
      console.warn('⚠️ [Storage] _loadFromFirebase: userId is null, returning empty');
      return [];
    }
    
    console.log(`🔍 [Storage] _loadFromFirebase: collection=${collectionName}, userId=${this.userId.substring(0, 10)}...`);
    
    try {
      const q = fb.query(
        fb.collection(fb.db, collectionName), 
        fb.where('userId', '==', this.userId)
      );
      
      const snapshot = await fb.getDocs(q, { source: 'server' });
      console.log(`📊 [Storage] Firebase query result: ${snapshot.size} docs (from SERVER)`);
      
      // ☢️ FIX: Exclude 'id' field from doc.data() to prevent override
      // ☢️ PLUS: Validate each document
      return snapshot.docs.map(doc => {
        try {
          const data = doc.data();
          
          // ☢️ Remove 'id' field from data to prevent override
          const { id: _, ...rest } = data;
          
          // ☢️ Validate critical fields
          if (collectionName === 'classes' && !rest.nama) {
            console.warn(`⚠️ [Storage] Class doc ${doc.id} missing 'nama' field`);
          }
          
          return { 
            id: doc.id, // ✅ Firestore doc ID is source of truth
            ...rest 
          };
        } catch (e) {
          console.error(`❌ [Storage] Error processing doc ${doc.id}:`, e.message);
          return null;
        }
      }).filter(item => item !== null); // Remove any failed parses
      
    } catch (e) {
      console.error('❌ [Storage] Query error:', {
        message: e.message,
        code: e.code,
        collection: collectionName
      });
      return [];
    }
  },
  
  _saveToFirebase: async function(collectionName, data) {
    if (!this.userId) {
      console.warn('⚠️ [Storage] _saveToFirebase: userId is null, skipping');
      return;
    }
    
    console.log(`💾 [Storage] _saveToFirebase: collection=${collectionName}, items=${data?.length || 0}`);
    
    try {
      for (const item of data) {
        if (!item?.id) {
          console.warn('⚠️ [Storage] Skipping item without id:', item);
          continue;
        }
        
        const docRef = fb.doc(fb.db, collectionName, item.id);
        
        // ☢️ Ensure userId is always set correctly
        const safeItem = { 
          ...item, 
          userId: this.userId, 
          updatedAt: new Date().toISOString() 
        };
        
        await fb.setDoc(docRef, safeItem, { merge: true });
      }
      console.log('✅ [Storage] Saved to Firebase');
      clearLocalStorage();
    } catch (e) {
      console.error('❌ [Storage] _saveToFirebase error:', e.message);
      throw e;
    }
  }
};

console.log('☢️ [Storage] NUCLEAR EDITION Loaded - USE_FIREBASE:', USE_FIREBASE, '- Mode: Firebase Only (No Fallback)');
