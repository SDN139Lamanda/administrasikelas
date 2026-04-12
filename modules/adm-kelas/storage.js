/**
 * STORAGE: Firebase Only (Clean Architecture)
 * Designed to match firestore.rules contracts
 */

import * as fb from '../firebase-config.js';

const USE_FIREBASE = true;

// ✅ HELPER: Cek Firebase mode + valid userId
function isFirebaseMode(userId) {
  return USE_FIREBASE && userId && typeof userId === 'string' && userId.length > 0;
}

// ✅ STORAGE OBJECT
export const storage = {
  userId: null,
  
  // ✅ SET USER ID (dengan validasi)
  setUserId: function(uid) {
    if (uid && typeof uid === 'string' && uid.length > 0) {
      this.userId = uid;
      console.log('🔧 [Storage] userId set:', uid.substring(0, 10) + '...');
    } else {
      this.userId = null;
      console.warn('⚠️ [Storage] userId set to null (invalid)');
    }
  },
  
  // ✅ LOAD CLASSES (filter by userId - required by rules)
  loadClasses: async function() {
    if (!isFirebaseMode(this.userId)) {
      console.warn('⚠️ [Storage] Not in Firebase mode, returning empty');
      return [];
    }
    
    try {
      // ✅ RULES CONTRACT: Query must filter by userId
      const q = fb.query(
        fb.collection(fb.db, 'classes'),
        fb.where('userId', '==', this.userId)
      );
      
      const snapshot = await fb.getDocs(q, { source: 'server' });
      
      // ✅ RULES CONTRACT: Use Firestore doc.id, exclude 'id' field from data
      return snapshot.docs.map(doc => {
        const data = doc.data();
        // Exclude 'id' field to prevent override of doc.id
        const { id: _, ...rest } = data;
        return { id: doc.id, ...rest };
      });
      
    } catch (e) {
      console.error('❌ [Storage] loadClasses error:', e.message);
      return [];
    }
  },
  
  // ✅ ADD CLASS (inject userId - required by rules)
  addClass: async function(classData) {
    if (!isFirebaseMode(this.userId)) {
      throw new Error('addClass: userId not set');
    }
    if (!classData?.nama?.trim()) {
      throw new Error('addClass: nama is required');
    }
    
    try {
      // ✅ RULES CONTRACT: Must include userId == auth.uid, must not be null
      // ✅ CRITICAL: Do NOT include 'id' field - Firestore doc.id is source of truth
      const newClass = {
        nama: classData.nama.trim(),
        siswa: classData.siswa || [],
        absen: classData.absen || [],
        userId: this.userId, // ← Explicit inject (required by rules)
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
        // NO 'id' field here!
      };
      
      const colRef = fb.collection(fb.db, 'classes');
      const docRef = await fb.addDoc(colRef, newClass);
      
      console.log('✅ [Storage] addClass:', docRef.id);
      
      // Return with Firestore doc.id as identifier
      return { id: docRef.id, ...newClass };
      
    } catch (e) {
      console.error('❌ [Storage] addClass error:', e.message);
      throw e;
    }
  },
  
  // ✅ UPDATE CLASS (inject userId - required by rules)
  updateClass: async function(classId, updates) {
    if (!isFirebaseMode(this.userId)) {
      throw new Error('updateClass: userId not set');
    }
    if (!classId) {
      throw new Error('updateClass: classId is required');
    }
    
    try {
      const docRef = fb.doc(fb.db, 'classes', classId);
      
      // ✅ RULES CONTRACT: Must ensure userId == auth.uid in updated data
      await fb.updateDoc(docRef, {
        ...updates,
        userId: this.userId, // ← Explicit inject (required by rules)
        updatedAt: new Date().toISOString()
      });
      
      console.log('✅ [Storage] updateClass:', classId);
      
      return { id: classId, ...updates };
      
    } catch (e) {
      console.error('❌ [Storage] updateClass error:', e.message);
      throw e;
    }
  },
  
  // ✅ DELETE CLASS (use Firestore doc.id)
  deleteClass: async function(classId) {
    if (!isFirebaseMode(this.userId)) {
      throw new Error('deleteClass: userId not set');
    }
    if (!classId) {
      throw new Error('deleteClass: classId is required');
    }
    
    try {
      const docRef = fb.doc(fb.db, 'classes', classId);
      
      // ✅ RULES CONTRACT: 
      // - resource.data.userId must == auth.uid (checked by rules)
      // - OR !resource.data.userId (backward compat)
      await fb.deleteDoc(docRef);
      
      console.log('✅ [Storage] deleteClass:', classId);
      
    } catch (e) {
      console.error('❌ [Storage] deleteClass error:', e.message);
      throw e;
    }
  },
  
  // ✅ ADD STUDENT (with userId filter for security)
  addStudent: async function(classId, studentData) {
    if (!isFirebaseMode(this.userId)) {
      throw new Error('addStudent: userId not set');
    }
    
    try {
      const docRef = fb.doc(fb.db, 'classes', classId);
      
      // ✅ Security: Verify class exists AND belongs to user
      const q = fb.query(
        fb.collection(fb.db, 'classes'),
        fb.where('userId', '==', this.userId),
        fb.where(fb.documentId(), '==', classId)
      );
      
      const classSnap = await fb.getDocs(q, { source: 'server' });
      
      if (classSnap.empty) {
        throw new Error('Class not found or not owned by user');
      }
      
      const classData = classSnap.docs[0].data();
      classData.siswa = classData.siswa || [];
      
      const newStudent = {
        id: studentData.id || `stu_${Date.now()}`,
        nama: studentData.nama?.trim(),
        gender: studentData.gender || 'L',
        createdAt: new Date().toISOString()
      };
      
      if (!newStudent.nama) {
        throw new Error('addStudent: nama is required');
      }
      
      classData.siswa.push(newStudent);
      
      // ✅ Inject userId on update (required by rules)
      await fb.updateDoc(docRef, {
        siswa: classData.siswa,
        userId: this.userId,
        updatedAt: new Date().toISOString()
      });
      
      console.log('✅ [Storage] addStudent:', newStudent.id);
      
      return studentData;
      
    } catch (e) {
      console.error('❌ [Storage] addStudent error:', e.message);
      throw e;
    }
  },
  
  // ✅ DELETE STUDENT
  deleteStudent: async function(classId, studentId) {
    if (!isFirebaseMode(this.userId)) {
      throw new Error('deleteStudent: userId not set');
    }
    
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
        
        console.log('✅ [Storage] deleteStudent:', studentId);
      }
      
    } catch (e) {
      console.error('❌ [Storage] deleteStudent error:', e.message);
      throw e;
    }
  },
  
  // ✅ SAVE ATTENDANCE
  saveAttendance: async function(classId, date, attendanceData) {
    if (!isFirebaseMode(this.userId)) {
      throw new Error('saveAttendance: userId not set');
    }
    
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
           attendanceData,
          savedAt: new Date().toISOString()
        });
        
        await fb.updateDoc(docRef, {
          absen: classData.absen,
          userId: this.userId,
          updatedAt: new Date().toISOString()
        });
        
        console.log('✅ [Storage] saveAttendance:', date);
      }
      
    } catch (e) {
      console.error('❌ [Storage] saveAttendance error:', e.message);
      throw e;
    }
  }
};

console.log('✅ [Storage] Loaded - Firebase Only (Rules-Compliant)');
