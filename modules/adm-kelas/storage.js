/**
 * STORAGE: Simple Firebase + LocalStorage
 * Firebase SDK: 9.22.0 (match firebase-config.js)
 */

import { db } from '../firebase-config.js';
import { 
  collection, addDoc, getDocs, updateDoc, deleteDoc, 
  doc, query, where, setDoc 
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

const DB_KEY = 'eduDBProV6';
const USE_FIREBASE = true;

// ✅ SIMPLE: Cek Firebase mode setiap kali
function isFirebaseMode(userId) {
  return USE_FIREBASE && userId;
}

// ✅ Storage object (bukan class)
export const storage = {
  userId: null,
  
  // Set userId secara eksplisit
  setUserId: function(uid) {
    this.userId = uid;
    console.log('🔧 [Storage] setUserId:', uid, '→ Firebase:', isFirebaseMode(uid));
  },
  
  // Load classes
  loadClasses: async function() {
    console.log('📦 [Storage] loadClasses, userId:', this.userId);
    
    if (isFirebaseMode(this.userId)) {
      console.log('🔥 [Storage] Using Firebase mode');
      return await this._loadFromFirebase('classes');
    }
    
    console.log('💾 [Storage] Using LocalStorage mode');
    return JSON.parse(localStorage.getItem(DB_KEY) || '[]');
  },
  
  // Save classes
  saveClasses: async function(classes) {
    if (isFirebaseMode(this.userId)) {
      return await this._saveToFirebase('classes', classes);
    }
    localStorage.setItem(DB_KEY, JSON.stringify(classes));
  },
  
  // Add class
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
      const docRef = await addDoc(collection(db, 'classes'), newClass);
      console.log('✅ [Storage] Saved to Firebase:', docRef.id);
      return { id: docRef.id, ...newClass };
    }
    
    const classes = await this.loadClasses();
    classes.push(newClass);
    await this.saveClasses(classes);
    return newClass;
  },
  
  // Update class
  updateClass: async function(classId, updates) {
    if (isFirebaseMode(this.userId)) {
      const classRef = doc(db, 'classes', classId);
      await updateDoc(classRef, { ...updates, userId: this.userId, updatedAt: new Date().toISOString() });
      return { id: classId, ...updates };
    }
    
    const classes = await this.loadClasses();
    const idx = classes.findIndex(c => c.id === classId);
    if (idx === -1) throw new Error('Class not found');
    classes[idx] = { ...classes[idx], ...updates, updatedAt: new Date().toISOString() };
    await this.saveClasses(classes);
    return classes[idx];
  },
  
  // Delete class
  deleteClass: async function(classId) {
    if (isFirebaseMode(this.userId)) {
      return await deleteDoc(doc(db, 'classes', classId));
    }
    let classes = await this.loadClasses();
    classes = classes.filter(c => c.id !== classId);
    await this.saveClasses(classes);
  },
  
  // Add student
  addStudent: async function(classId, studentData) {
    if (isFirebaseMode(this.userId)) {
      const classRef = doc(db, 'classes', classId);
      const classSnap = await getDocs(query(collection(db, 'classes'), where('id', '==', classId), where('userId', '==', this.userId)));
      if (!classSnap.empty) {
        const classData = classSnap.docs[0].data();
        classData.siswa = classData.siswa || [];
        classData.siswa.push({
          id: studentData.id || `stu_${Date.now()}`,
          nama: studentData.nama,
          gender: studentData.gender || 'L',
          createdAt: new Date().toISOString()
        });
        await updateDoc(classRef, { siswa: classData.siswa, userId: this.userId });
      }
      return studentData;
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
  
  // Delete student
  deleteStudent: async function(classId, studentId) {
    if (isFirebaseMode(this.userId)) {
      const classRef = doc(db, 'classes', classId);
      const classSnap = await getDocs(query(collection(db, 'classes'), where('id', '==', classId), where('userId', '==', this.userId)));
      if (!classSnap.empty) {
        const classData = classSnap.docs[0].data();
        classData.siswa = (classData.siswa || []).filter(s => s.id !== studentId);
        await updateDoc(classRef, { siswa: classData.siswa, userId: this.userId });
      }
      return;
    }
    
    const classes = await this.loadClasses();
    const idx = classes.findIndex(c => c.id === classId);
    if (idx === -1) throw new Error('Class not found');
    classes[idx].siswa = classes[idx].siswa.filter(s => s.id !== studentId);
    await this.saveClasses(classes);
  },
  
  // Save attendance
  saveAttendance: async function(classId, date, attendanceData) {
    if (isFirebaseMode(this.userId)) {
      const classRef = doc(db, 'classes', classId);
      const classSnap = await getDocs(query(collection(db, 'classes'), where('id', '==', classId), where('userId', '==', this.userId)));
      if (!classSnap.empty) {
        const classData = classSnap.docs[0].data();
        classData.absen = (classData.absen || []).filter(a => a.tanggal !== date);
        classData.absen.push({ tanggal: date, data: attendanceData, savedAt: new Date().toISOString() });
        await updateDoc(classRef, { absen: classData.absen, userId: this.userId });
      }
      return;
    }
    
    const classes = await this.loadClasses();
    const idx = classes.findIndex(c => c.id === classId);
    if (idx === -1) throw new Error('Class not found');
    classes[idx].absen = classes[idx].absen.filter(a => a.tanggal !== date);
    classes[idx].absen.push({ tanggal: date,  attendanceData, savedAt: new Date().toISOString() });
    await this.saveClasses(classes);
  },
  
  // Load from Firebase
  _loadFromFirebase: async function(collectionName) {
    if (!this.userId) return [];
    const q = query(collection(db, collectionName), where('userId', '==', this.userId));
    const snapshot = await getDocs(q);
    console.log('📊 [Storage] Firebase query result:', snapshot.size, 'docs');
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  // Save to Firebase
  _saveToFirebase: async function(collectionName, data) {
    if (!this.userId) return;
    for (const item of data) {
      const itemRef = doc(db, collectionName, item.id);
      await setDoc(itemRef, { ...item, userId: this.userId, updatedAt: new Date().toISOString() }, { merge: true });
    }
    console.log('✅ [Storage] Saved to Firebase');
  }
};

console.log('✅ [Storage] Loaded - USE_FIREBASE:', USE_FIREBASE);
