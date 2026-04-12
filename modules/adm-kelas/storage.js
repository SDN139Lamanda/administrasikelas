/**
 * STORAGE: Firebase Only (Clean Architecture)
 */

import * as fb from '../firebase-config.js';

const USE_FIREBASE = true;

function isFirebaseMode(userId) {
  return USE_FIREBASE && userId && typeof userId === 'string' && userId.length > 0;
}

export const storage = {
  userId: null,
  
  setUserId: function(uid) {
    if (uid && typeof uid === 'string' && uid.length > 0) {
      this.userId = uid;
      console.log('🔧 [Storage] userId set:', uid.substring(0, 10) + '...');
    } else {
      this.userId = null;
      console.warn('⚠️ [Storage] userId set to null (invalid)');
    }
  },
  
  loadClasses: async function() {
    if (!isFirebaseMode(this.userId)) return [];
    try {
      const q = fb.query(fb.collection(fb.db, 'classes'), fb.where('userId', '==', this.userId));
      const snapshot = await fb.getDocs(q, { source: 'server' });
      return snapshot.docs.map(doc => {
        const data = doc.data();
        const { id: _, ...rest } = data;
        return { id: doc.id, ...rest };
      });
    } catch (e) {
      console.error('❌ [Storage] loadClasses error:', e.message);
      return [];
    }
  },
  
  addClass: async function(classData) {
    if (!isFirebaseMode(this.userId)) throw new Error('addClass: userId not set');
    if (!classData?.nama?.trim()) throw new Error('addClass: nama is required');
    try {
      const newClass = {
        nama: classData.nama.trim(),
        siswa: classData.siswa || [],
        absen: classData.absen || [],
        userId: this.userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const colRef = fb.collection(fb.db, 'classes');
      const docRef = await fb.addDoc(colRef, newClass);
      console.log('✅ [Storage] addClass:', docRef.id);
      return { id: docRef.id, ...newClass };
    } catch (e) {
      console.error('❌ [Storage] addClass error:', e.message);
      throw e;
    }
  },
  
  updateClass: async function(classId, updates) {
    if (!isFirebaseMode(this.userId)) throw new Error('updateClass: userId not set');
    if (!classId) throw new Error('updateClass: classId is required');
    try {
      const docRef = fb.doc(fb.db, 'classes', classId);
      await fb.updateDoc(docRef, { ...updates, userId: this.userId, updatedAt: new Date().toISOString() });
      console.log('✅ [Storage] updateClass:', classId);
      return { id: classId, ...updates };
    } catch (e) {
      console.error('❌ [Storage] updateClass error:', e.message);
      throw e;
    }
  },
  
  deleteClass: async function(classId) {
    if (!isFirebaseMode(this.userId)) throw new Error('deleteClass: userId not set');
    if (!classId) throw new Error('deleteClass: classId is required');
    try {
      const docRef = fb.doc(fb.db, 'classes', classId);
      await fb.deleteDoc(docRef);
      console.log('✅ [Storage] deleteClass:', classId);
    } catch (e) {
      console.error('❌ [Storage] deleteClass error:', e.message);
      throw e;
    }
  },
  
  addStudent: async function(classId, studentData) {
    if (!isFirebaseMode(this.userId)) throw new Error('addStudent: userId not set');
    try {
      const docRef = fb.doc(fb.db, 'classes', classId);
      const q = fb.query(fb.collection(fb.db, 'classes'), fb.where('userId', '==', this.userId), fb.where(fb.documentId(), '==', classId));
      const classSnap = await fb.getDocs(q, { source: 'server' });
      if (classSnap.empty) throw new Error('Class not found or not owned by user');
      const classData = classSnap.docs[0].data();
      classData.siswa = classData.siswa || [];
      const newStudent = { id: studentData.id || `stu_${Date.now()}`, nama: studentData.nama?.trim(), gender: studentData.gender || 'L', createdAt: new Date().toISOString() };
      if (!newStudent.nama) throw new Error('addStudent: nama is required');
      classData.siswa.push(newStudent);
      await fb.updateDoc(docRef, { siswa: classData.siswa, userId: this.userId, updatedAt: new Date().toISOString() });
      console.log('✅ [Storage] addStudent:', newStudent.id);
      return studentData;
    } catch (e) {
      console.error('❌ [Storage] addStudent error:', e.message);
      throw e;
    }
  },
  
  deleteStudent: async function(classId, studentId) {
    if (!isFirebaseMode(this.userId)) throw new Error('deleteStudent: userId not set');
    try {
      const docRef = fb.doc(fb.db, 'classes', classId);
      const q = fb.query(fb.collection(fb.db, 'classes'), fb.where('userId', '==', this.userId), fb.where(fb.documentId(), '==', classId));
      const classSnap = await fb.getDocs(q, { source: 'server' });
      if (!classSnap.empty) {
        const classData = classSnap.docs[0].data();
        classData.siswa = (classData.siswa || []).filter(s => s.id !== studentId);
        await fb.updateDoc(docRef, { siswa: classData.siswa, userId: this.userId, updatedAt: new Date().toISOString() });
        console.log('✅ [Storage] deleteStudent:', studentId);
      }
    } catch (e) {
      console.error('❌ [Storage] deleteStudent error:', e.message);
      throw e;
    }
  },
  
  saveAttendance: async function(classId, date, attendanceData) {
    if (!isFirebaseMode(this.userId)) throw new Error('saveAttendance: userId not set');
    try {
      const docRef = fb.doc(fb.db, 'classes', classId);
      const q = fb.query(fb.collection(fb.db, 'classes'), fb.where('userId', '==', this.userId), fb.where(fb.documentId(), '==', classId));
      const classSnap = await fb.getDocs(q, { source: 'server' });
      if (!classSnap.empty) {
        const classData = classSnap.docs[0].data();
        classData.absen = (classData.absen || []).filter(a => a.tanggal !== date);
        classData.absen.push({ tanggal: date,  attendanceData, savedAt: new Date().toISOString() });
        await fb.updateDoc(docRef, { absen: classData.absen, userId: this.userId, updatedAt: new Date().toISOString() });
        console.log('✅ [Storage] saveAttendance:', date);
      }
    } catch (e) {
      console.error('❌ [Storage] saveAttendance error:', e.message);
      throw e;
    }
  }
};

console.log('✅ [Storage] Loaded - Firebase Only (Rules-Compliant)');
