/**
 * ============================================
 * STORAGE: Abstraction Layer for Data Persistence
 * Supports: LocalStorage (default) + Firebase Firestore (optional)
 * ============================================
 */

import { db } from '../firebase-config.js';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const DB_KEY = 'eduDBProV6';
const USE_FIREBASE = false; // 🔴 Set true setelah Firebase siap

export class DataStorage {
  constructor(userId = null) {
    this.userId = userId;
    this.useFirebase = USE_FIREBASE && userId;
  }

  // ✅ LOAD all classes
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

  // ✅ ADD new class
  async addClass(classData) {
    const newClass = {
      id: classData.id || `class_${Date.now()}`,
      nama: classData.nama,
      siswa: classData.siswa || [],
      absen: classData.absen || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const classes = await this.loadClasses();
    classes.push(newClass);
    await this.saveClasses(classes);
    return newClass;
  }

  // ✅ UPDATE class
  async updateClass(classId, updates) {
    const classes = await this.loadClasses();
    const idx = classes.findIndex(c => c.id === classId);
    if (idx === -1) throw new Error('Class not found');
    
    classes[idx] = { ...classes[idx], ...updates, updatedAt: new Date().toISOString() };
    await this.saveClasses(classes);
    return classes[idx];
  }

  // ✅ DELETE class
  async deleteClass(classId) {
    let classes = await this.loadClasses();
    classes = classes.filter(c => c.id !== classId);
    await this.saveClasses(classes);
  }

  // ✅ ADD student to class
  async addStudent(classId, studentData) {
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
    const classes = await this.loadClasses();
    const classIdx = classes.findIndex(c => c.id === classId);
    if (classIdx === -1) throw new Error('Class not found');
    
    classes[classIdx].siswa = classes[classIdx].siswa.filter(s => s.id !== studentId);
    classes[classIdx].updatedAt = new Date().toISOString();
    await this.saveClasses(classes);
  }

  // ✅ SAVE attendance
  async saveAttendance(classId, date, attendanceData) {
    const classes = await this.loadClasses();
    const classIdx = classes.findIndex(c => c.id === classId);
    if (classIdx === -1) throw new Error('Class not found');
    
    // Remove existing entry for same date
    classes[classIdx].absen = classes[classIdx].absen.filter(a => a.tanggal !== date);
    
    // Add new entry
    classes[classIdx].absen.push({
      tanggal: date,
      data: attendanceData,
      savedAt: new Date().toISOString()
    });
    classes[classIdx].updatedAt = new Date().toISOString();
    
    await this.saveClasses(classes);
  }

  // ✅ FIREBASE helpers (for future migration)
  async _loadFromFirebase(collectionName) {
    if (!this.userId) return [];
    const q = query(collection(db, collectionName), where('userId', '==', this.userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async _saveToFirebase(collectionName, data) {
    if (!this.userId) return;
    // Simple overwrite for now (can be optimized later)
    const q = query(collection(db, collectionName), where('userId', '==', this.userId));
    const snapshot = await getDocs(q);
    snapshot.docs.forEach(async (docSnap) => {
      await updateDoc(doc(db, collectionName, docSnap.id), { data, updatedAt: new Date().toISOString() });
    });
  }
}

// ✅ Export singleton for easy use
export const storage = new DataStorage();

console.log('✅ [AdmKelas Storage] Loaded - Mode:', USE_FIREBASE ? 'Firebase' : 'LocalStorage');
