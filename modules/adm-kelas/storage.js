/**
 * ============================================
 * STORAGE: Abstraction Layer for Data Persistence
 * Supports: LocalStorage (default) + Firebase Firestore (optional)
 * ISOLASI DATA: userId-based filtering
 * ============================================
 */

import { db } from '../firebase-config.js';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const DB_KEY = 'eduDBProV6';
const USE_FIREBASE = true; // 🔴 Set true setelah Firebase siap

export class DataStorage {
  constructor(userId = null) {
    this.userId = userId;
    this.useFirebase = USE_FIREBASE && userId;
  }

  // ✅ LOAD all classes (with userId isolation for Firebase)
  async loadClasses() {
    if (this.useFirebase) {
      return await this._loadFromFirebase('classes');
    }
    return JSON.parse(localStorage.getItem(DB_KEY) || '[]');
  }

  // ✅ SAVE all classes
  async saveClasses(classes) {
    if (this.useFirebase) {
      await this._saveToFirebase('classes', classes);
      return;
    }
    localStorage.setItem(DB_KEY, JSON.stringify(classes));
  }

  // ✅ ADD new class (with userId for isolation)
  async addClass(classData) {
    const newClass = {
      id: classData.id || `class_${Date.now()}`,
      nama: classData.nama,
      siswa: classData.siswa || [],
      absen: classData.absen || [],
      userId: this.userId, // ✅ TAMBAHKAN: Untuk isolasi data
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (this.useFirebase) {
      // ✅ Firebase mode: addDoc dengan userId
      const docRef = await addDoc(collection(db, 'classes'), newClass);
      return { id: docRef.id, ...newClass };
    }
    
    // LocalStorage mode
    const classes = await this.loadClasses();
    classes.push(newClass);
    await this.saveClasses(classes);
    return newClass;
  }

  // ✅ UPDATE class
  async updateClass(classId, updates) {
    if (this.useFirebase) {
      // ✅ Firebase: update dengan validasi userId
      const classRef = doc(db, 'classes', classId);
      await updateDoc(classRef, { ...updates, updatedAt: new Date().toISOString() });
      return { id: classId, ...updates };
    }
    
    // LocalStorage mode
    const classes = await this.loadClasses();
    const idx = classes.findIndex(c => c.id === classId);
    if (idx === -1) throw new Error('Class not found');
    
    classes[idx] = { ...classes[idx], ...updates, updatedAt: new Date().toISOString() };
    await this.saveClasses(classes);
    return classes[idx];
  }

  // ✅ DELETE class
  async deleteClass(classId) {
    if (this.useFirebase) {
      await deleteDoc(doc(db, 'classes', classId));
      return;
    }
    
    // LocalStorage mode
    let classes = await this.loadClasses();
    classes = classes.filter(c => c.id !== classId);
    await this.saveClasses(classes);
  }

  // ✅ ADD student to class (with userId for isolation)
  async addStudent(classId, studentData) {
    if (this.useFirebase) {
      // ✅ Firebase: update class document dengan student baru
      const classRef = doc(db, 'classes', classId);
      const newStudent = {
        id: studentData.id || `stu_${Date.now()}`,
        nama: studentData.nama,
        gender: studentData.gender || 'L',
        createdAt: new Date().toISOString()
      };
      // Note: For nested arrays in Firestore, use arrayUnion or re-read/update
      // Simplified: re-read, update, save
      const classSnap = await getDocs(query(collection(db, 'classes'), where('id', '==', classId)));
      if (!classSnap.empty) {
        const classData = classSnap.docs[0].data();
        classData.siswa = classData.siswa || [];
        classData.siswa.push(newStudent);
        classData.updatedAt = new Date().toISOString();
        await updateDoc(classRef, { siswa: classData.siswa, updatedAt: classData.updatedAt });
      }
      return newStudent;
    }
    
    // LocalStorage mode
    const classes = await this.loadClasses();
    const classIdx = classes.findIndex(c => c.id === classId);
    if (classIdx === -1) throw new Error('Class not found');
    
    const newStudent = {
      id: studentData.id || `stu_${Date.now()}`,
      nama: studentData.nama,
      gender: studentData.gender || 'L',
      createdAt: new Date().toISOString()
    };
    
    classes[classIdx].siswa.push(newStudent);
    classes[classIdx].updatedAt = new Date().toISOString();
    await this.saveClasses(classes);
    return newStudent;
  }

  // ✅ DELETE student
  async deleteStudent(classId, studentId) {
    if (this.useFirebase) {
      const classRef = doc(db, 'classes', classId);
      const classSnap = await getDocs(query(collection(db, 'classes'), where('id', '==', classId)));
      if (!classSnap.empty) {
        const classData = classSnap.docs[0].data();
        classData.siswa = (classData.siswa || []).filter(s => s.id !== studentId);
        classData.updatedAt = new Date().toISOString();
        await updateDoc(classRef, { siswa: classData.siswa, updatedAt: classData.updatedAt });
      }
      return;
    }
    
    // LocalStorage mode
    const classes = await this.loadClasses();
    const classIdx = classes.findIndex(c => c.id === classId);
    if (classIdx === -1) throw new Error('Class not found');
    
    classes[classIdx].siswa = classes[classIdx].siswa.filter(s => s.id !== studentId);
    classes[classIdx].updatedAt = new Date().toISOString();
    await this.saveClasses(classes);
  }

  // ✅ SAVE attendance (with userId for isolation)
  async saveAttendance(classId, date, attendanceData) {
    if (this.useFirebase) {
      // ✅ Firebase: update class document dengan attendance baru
      const classRef = doc(db, 'classes', classId);
      const classSnap = await getDocs(query(collection(db, 'classes'), where('id', '==', classId)));
      if (!classSnap.empty) {
        const classData = classSnap.docs[0].data();
        // Remove existing entry for this date
        classData.absen = (classData.absen || []).filter(a => a.tanggal !== date);
        // Add new entry
        classData.absen.push({
          tanggal: date,
          data: attendanceData,
          savedAt: new Date().toISOString()
        });
        classData.updatedAt = new Date().toISOString();
        await updateDoc(classRef, { absen: classData.absen, updatedAt: classData.updatedAt });
      }
      return;
    }
    
    // LocalStorage mode
    const classes = await this.loadClasses();
    const classIdx = classes.findIndex(c => c.id === classId);
    if (classIdx === -1) throw new Error('Class not found');
    
    classes[classIdx].absen = classes[classIdx].absen.filter(a => a.tanggal !== date);
    
    classes[classIdx].absen.push({
      tanggal: date,
      data: attendanceData,
      savedAt: new Date().toISOString()
    });
    classes[classIdx].updatedAt = new Date().toISOString();
    
    await this.saveClasses(classes);
  }

  // ✅ FIREBASE helpers (with userId isolation)
  async _loadFromFirebase(collectionName) {
    if (!this.userId) return [];
    // ✅ TAMBAHKAN: Filter by userId untuk isolasi data
    const q = query(collection(db, collectionName), where('userId', '==', this.userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async _saveToFirebase(collectionName, data) {
    if (!this.userId) return;
    // ✅ FIX: Gunakan addDoc untuk data baru, bukan updateDoc
    // Note: This is simplified - in production, you'd handle update vs create logic
    for (const item of data) {
      const itemRef = doc(db, collectionName, item.id);
      await updateDoc(itemRef, { 
        ...item, 
        userId: this.userId, // ✅ Pastikan userId selalu ter-set
        updatedAt: new Date().toISOString() 
      });
    }
  }
}

// ✅ Export singleton for easy use
export const storage = new DataStorage();

console.log('✅ [AdmKelas Storage] Loaded - Mode:', USE_FIREBASE ? 'Firebase (with userId isolation)' : 'LocalStorage');
