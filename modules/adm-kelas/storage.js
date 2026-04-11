/**
 * STORAGE: Simple Firebase + LocalStorage
 * FIX: Firebase Only Mode (No Fallback) - Opsi 1
 */

// ✅ IMPORT SEMUA dari firebase-config.js (sudah include db + functions)
import * as fb from '../firebase-config.js';

const DB_KEY = 'eduDBProV6';
const USE_FIREBASE = true;

// ✅ HELPER: Cek Firebase mode
function isFirebaseMode(userId) {
  return USE_FIREBASE && userId;
}

// ✅ HELPER: Clear LocalStorage (untuk sinkronisasi)
function clearLocalStorage() {
  try {
    localStorage.removeItem(DB_KEY);
    console.log('🧹 [Storage] LocalStorage cleared');
  } catch (e) {
    console.warn('⚠️ [Storage] Failed to clear LocalStorage:', e.message);
  }
}

// ✅ STORAGE OBJECT
export const storage = {
  userId: null,
  
  setUserId: function(uid) {
    this.userId = uid;
    console.log('🔧 [Storage] setUserId:', uid, '→ Firebase:', isFirebaseMode(uid));
  },
  
  loadClasses: async function() {
    console.log('📦 [Storage] loadClasses, userId:', this.userId);
    
    if (isFirebaseMode(this.userId)) {
      console.log('🔥 [Storage] Using Firebase mode (NO fallback)');
      // ✅ FIX OPSI 1: JANGAN fallback ke LocalStorage
      return await this._loadFromFirebase('classes');
    }
    
    console.log('💾 [Storage] Using LocalStorage mode');
    return JSON.parse(localStorage.getItem(DB_KEY) || '[]');
  },
  
  saveClasses: async function(classes) {
    if (isFirebaseMode(this.userId)) {
      await this._saveToFirebase('classes', classes);
      // ✅ Clear LocalStorage setelah Firebase sukses
      clearLocalStorage();
      return;
    }
    localStorage.setItem(DB_KEY, JSON.stringify(classes));
  },
  
  addClass: async function(classData) {
    console.log('➕ [Storage] addClass:', classData.nama, 'userId:', this.userId);
    
    const newClass = {
      id: classData.id || `class_${Date.now()}`,
      nama: classData.nama,
      siswa: classData.siswa || [],
      absen: classData.absen || [],
      userId: this.userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (isFirebaseMode(this.userId)) {
      try {
        // ✅ PAKAI functions dari firebase-config.js
        const colRef = fb.collection(fb.db, 'classes');
        const docRef = await fb.addDoc(colRef, newClass);
        console.log('✅ [Storage] Saved to Firebase:', docRef.id);
        
        // ✅ Clear LocalStorage setelah Firebase sukses
        clearLocalStorage();
        
        return { id: docRef.id, ...newClass };
      } catch (e) {
        console.error('❌ [Storage] Firebase addClass error:', e.message);
        throw e; // ✅ Jangan fallback, lempar error agar user tahu
      }
    }
    
    const classes = await this.loadClasses();
    classes.push(newClass);
    await this.saveClasses(classes);
    return newClass;
  },
  
  updateClass: async function(classId, updates) {
    if (isFirebaseMode(this.userId)) {
      try {
        const docRef = fb.doc(fb.db, 'classes', classId);
        await fb.updateDoc(docRef, { ...updates, userId: this.userId, updatedAt: new Date().toISOString() });
        console.log('✅ [Storage] Updated in Firebase');
        
        // ✅ Clear LocalStorage setelah Firebase sukses
        clearLocalStorage();
        
        return { id: classId, ...updates };
      } catch (e) {
        console.error('❌ [Storage] Firebase updateClass error:', e.message);
        throw e;
      }
    }
    
    const classes = await this.loadClasses();
    const idx = classes.findIndex(c => c.id === classId);
    if (idx === -1) throw new Error('Class not found');
    classes[idx] = { ...classes[idx], ...updates, updatedAt: new Date().toISOString() };
    await this.saveClasses(classes);
    return classes[idx];
  },
  
  deleteClass: async function(classId) {
    if (isFirebaseMode(this.userId)) {
      try {
        await fb.deleteDoc(fb.doc(fb.db, 'classes', classId));
        console.log('✅ [Storage] Deleted from Firebase');
        
        // ✅ Clear LocalStorage setelah Firebase sukses
        clearLocalStorage();
        
        return;
      } catch (e) {
        console.error('❌ [Storage] Firebase deleteClass error:', e.message);
        throw e;
      }
    }
    
    let classes = await this.loadClasses();
    classes = classes.filter(c => c.id !== classId);
    await this.saveClasses(classes);
  },
  
  addStudent: async function(classId, studentData) {
    if (isFirebaseMode(this.userId)) {
      try {
        const docRef = fb.doc(fb.db, 'classes', classId);
        const q = fb.query(
          fb.collection(fb.db, 'classes'), 
          fb.where('id', '==', classId), 
          fb.where('userId', '==', this.userId)
        );
        const classSnap = await fb.getDocs(q);
        if (!classSnap.empty) {
          const classData = classSnap.docs[0].data();
          classData.siswa = classData.siswa || [];
          classData.siswa.push({
            id: studentData.id || `stu_${Date.now()}`,
            nama: studentData.nama,
            gender: studentData.gender || 'L',
            createdAt: new Date().toISOString()
          });
          await fb.updateDoc(docRef, { siswa: classData.siswa, userId: this.userId });
          console.log('✅ [Storage] Student added via Firebase');
          
          // ✅ Clear LocalStorage setelah Firebase sukses
          clearLocalStorage();
        }
        return studentData;
      } catch (e) {
        console.error('❌ [Storage] Firebase addStudent error:', e.message);
        throw e;
      }
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
    if (isFirebaseMode(this.userId)) {
      try {
        const docRef = fb.doc(fb.db, 'classes', classId);
        const q = fb.query(
          fb.collection(fb.db, 'classes'), 
          fb.where('id', '==', classId), 
          fb.where('userId', '==', this.userId)
        );
        const classSnap = await fb.getDocs(q);
        if (!classSnap.empty) {
          const classData = classSnap.docs[0].data();
          classData.siswa = (classData.siswa || []).filter(s => s.id !== studentId);
          await fb.updateDoc(docRef, { siswa: classData.siswa, userId: this.userId });
          console.log('✅ [Storage] Student deleted via Firebase');
          
          // ✅ Clear LocalStorage setelah Firebase sukses
          clearLocalStorage();
        }
        return;
      } catch (e) {
        console.error('❌ [Storage] Firebase deleteStudent error:', e.message);
        throw e;
      }
    }
    
    const classes = await this.loadClasses();
    const idx = classes.findIndex(c => c.id === classId);
    if (idx === -1) throw new Error('Class not found');
    classes[idx].siswa = classes[idx].siswa.filter(s => s.id !== studentId);
    await this.saveClasses(classes);
  },
  
  saveAttendance: async function(classId, date, attendanceData) {
    if (isFirebaseMode(this.userId)) {
      try {
        const docRef = fb.doc(fb.db, 'classes', classId);
        const q = fb.query(
          fb.collection(fb.db, 'classes'), 
          fb.where('id', '==', classId), 
          fb.where('userId', '==', this.userId)
        );
        const classSnap = await fb.getDocs(q);
        if (!classSnap.empty) {
          const classData = classSnap.docs[0].data();
          classData.absen = (classData.absen || []).filter(a => a.tanggal !== date);
          classData.absen.push({ tanggal: date,  attendanceData, savedAt: new Date().toISOString() });
          await fb.updateDoc(docRef, { absen: classData.absen, userId: this.userId });
          console.log('✅ [Storage] Attendance saved via Firebase');
          
          // ✅ Clear LocalStorage setelah Firebase sukses
          clearLocalStorage();
        }
        return;
      } catch (e) {
        console.error('❌ [Storage] Firebase saveAttendance error:', e.message);
        throw e;
      }
    }
    
    const classes = await this.loadClasses();
    const idx = classes.findIndex(c => c.id === classId);
    if (idx === -1) throw new Error('Class not found');
    classes[idx].absen = classes[idx].absen.filter(a => a.tanggal !== date);
    classes[idx].absen.push({ tanggal: date,  attendanceData, savedAt: new Date().toISOString() });
    await this.saveClasses(classes);
  },
  
  _loadFromFirebase: async function(collectionName) {
    if (!this.userId) return [];
    
    try {
      const q = fb.query(
        fb.collection(fb.db, collectionName), 
        fb.where('userId', '==', this.userId)
      );
      const snapshot = await fb.getDocs(q);
      console.log('📊 [Storage] Firebase query result:', snapshot.size, 'docs');
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error('❌ [Storage] Query error:', e.message);
      return [];
    }
  },
  
  _saveToFirebase: async function(collectionName, data) {
    if (!this.userId) return;
    
    try {
      for (const item of data) {
        const docRef = fb.doc(fb.db, collectionName, item.id);
        await fb.setDoc(docRef, { ...item, userId: this.userId, updatedAt: new Date().toISOString() }, { merge: true });
      }
      console.log('✅ [Storage] Saved to Firebase');
      
      // ✅ Clear LocalStorage setelah Firebase sukses
      clearLocalStorage();
    } catch (e) {
      console.error('❌ [Storage] _saveToFirebase error:', e.message);
      throw e;
    }
  }
};

console.log('✅ [Storage] Loaded - USE_FIREBASE:', USE_FIREBASE, '- Mode: Firebase Only (No Fallback)');
