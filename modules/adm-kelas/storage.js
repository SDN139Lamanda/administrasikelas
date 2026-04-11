/**
 * ============================================
 * STORAGE: Abstraction Layer for Data Persistence
 * Supports: LocalStorage (default) + Firebase Firestore (optional)
 * ISOLASI DATA: userId-based filtering
 * ============================================
 */

import { db } from '../firebase-config.js';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const DB_KEY = 'eduDBProV6';
const USE_FIREBASE = true;

export class DataStorage {
  constructor(userId = null) {
    this.userId = userId;
    this.useFirebase = USE_FIREBASE && userId;
    console.log('🔧 [Storage] Constructor:', { userId, useFirebase: this.useFirebase });
  }

  async loadClasses() {
    console.log('📦 [Storage] loadClasses() called, useFirebase:', this.useFirebase, 'userId:', this.userId);
    if (this.useFirebase) {
      return await this._loadFromFirebase('classes');
    }
    const local = JSON.parse(localStorage.getItem(DB_KEY) || '[]');
    console.log('📦 [Storage] Loaded from LocalStorage:', local.length, 'classes');
    return local;
  }

  async saveClasses(classes) {
    if (this.useFirebase) {
      await this._saveToFirebase('classes', classes);
      return;
    }
    localStorage.setItem(DB_KEY, JSON.stringify(classes));
  }

  async addClass(classData) {
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
    
    if (this.useFirebase) {
      const docRef = await addDoc(collection(db, 'classes'), newClass);
      console.log('✅ [Storage] Class saved to Firebase, docId:', docRef.id);
      return { id: docRef.id, ...newClass };
    }
    
    const classes = await this.loadClasses();
    classes.push(newClass);
    await this.saveClasses(classes);
    return newClass;
  }

  async updateClass(classId, updates) {
    if (this.useFirebase) {
      const classRef = doc(db, 'classes', classId);
      await updateDoc(classRef, { 
        ...updates, 
        userId: this.userId,
        updatedAt: new Date().toISOString() 
      });
      return { id: classId, ...updates };
    }
    
    const classes = await this.loadClasses();
    const idx = classes.findIndex(c => c.id === classId);
    if (idx === -1) throw new Error('Class not found');
    
    classes[idx] = { ...classes[idx], ...updates, updatedAt: new Date().toISOString() };
    await this.saveClasses(classes);
    return classes[idx];
  }

  async deleteClass(classId) {
    if (this.useFirebase) {
      await deleteDoc(doc(db, 'classes', classId));
      return;
    }
    
    let classes = await this.loadClasses();
    classes = classes.filter(c => c.id !== classId);
    await this.saveClasses(classes);
  }

  async addStudent(classId, studentData) {
    if (this.useFirebase) {
      const classRef = doc(db, 'classes', classId);
      const newStudent = {
        id: studentData.id || `stu_${Date.now()}`,
        nama: studentData.nama,
        gender: studentData.gender || 'L',
        createdAt: new Date().toISOString()
      };
      
      const classSnap = await getDocs(query(
        collection(db, 'classes'), 
        where('id', '==', classId),
        where('userId', '==', this.userId)
      ));
      if (!classSnap.empty) {
        const classData = classSnap.docs[0].data();
        classData.siswa = classData.siswa || [];
        classData.siswa.push(newStudent);
        classData.updatedAt = new Date().toISOString();
        await updateDoc(classRef, { 
          siswa: classData.siswa, 
          updatedAt: classData.updatedAt,
          userId: this.userId
        });
      }
      return newStudent;
    }
    
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

  async deleteStudent(classId, studentId) {
    if (this.useFirebase) {
      const classRef = doc(db, 'classes', classId);
      const classSnap = await getDocs(query(
        collection(db, 'classes'), 
        where('id', '==', classId),
        where('userId', '==', this.userId)
      ));
      if (!classSnap.empty) {
        const classData = classSnap.docs[0].data();
        classData.siswa = (classData.siswa || []).filter(s => s.id !== studentId);
        classData.updatedAt = new Date().toISOString();
        await updateDoc(classRef, { 
          siswa: classData.siswa, 
          updatedAt: classData.updatedAt,
          userId: this.userId
        });
      }
      return;
    }
    
    const classes = await this.loadClasses();
    const classIdx = classes.findIndex(c => c.id === classId);
    if (classIdx === -1) throw new Error('Class not found');
    
    classes[classIdx].siswa = classes[classIdx].siswa.filter(s => s.id !== studentId);
    classes[classIdx].updatedAt = new Date().toISOString();
    await this.saveClasses(classes);
  }

  async saveAttendance(classId, date, attendanceData) {
    if (this.useFirebase) {
      const classRef = doc(db, 'classes', classId);
      const classSnap = await getDocs(query(
        collection(db, 'classes'), 
        where('id', '==', classId),
        where('userId', '==', this.userId)
      ));
      if (!classSnap.empty) {
        const classData = classSnap.docs[0].data();
        classData.absen = (classData.absen || []).filter(a => a.tanggal !== date);
        classData.absen.push({
          tanggal: date,
          data: attendanceData,
          savedAt: new Date().toISOString()
        });
        classData.updatedAt = new Date().toISOString();
        await updateDoc(classRef, { 
          absen: classData.absen, 
          updatedAt: classData.updatedAt,
          userId: this.userId
        });
      }
      return;
    }
    
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

  async _loadFromFirebase(collectionName) {
    console.log('🔍 [Storage] _loadFromFirebase:', collectionName, 'userId:', this.userId);
    if (!this.userId) {
      console.warn('⚠️ [Storage] userId is null, returning empty array');
      return [];
    }
    
    const q = query(collection(db, collectionName), where('userId', '==', this.userId));
    console.log('🔍 [Storage] Query:', q);
    
    try {
      const snapshot = await getDocs(q);
      console.log('📊 [Storage] Query result:', snapshot.size, 'documents');
      
      if (snapshot.empty) {
        console.warn('⚠️ [Storage] No documents found. Possible causes:');
        console.warn('  1. No data with userId =', this.userId);
        console.warn('  2. Old data saved without userId field');
        console.warn('  3. Firestore Rules blocking read');
      }
      
      const result = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('📄 [Storage] Doc ', doc.id, 'has userId:', data.userId);
        return { id: doc.id, ...data };
      });
      
      return result;
    } catch (e) {
      console.error('❌ [Storage] Query error:', e);
      return [];
    }
  }

  async _saveToFirebase(collectionName, data) {
    if (!this.userId) {
      console.warn('⚠️ [Storage] userId is null, skipping Firebase save');
      return;
    }
    
    console.log('💾 [Storage] _saveToFirebase:', collectionName, 'items:', data.length, 'userId:', this.userId);
    
    for (const item of data) {
      const itemRef = doc(db, collectionName, item.id);
      await setDoc(itemRef, { 
        ...item, 
        userId: this.userId,
        updatedAt: new Date().toISOString() 
      }, { merge: true });
    }
    console.log('✅ [Storage] Save complete');
  }
}

export const storage = new DataStorage();

console.log('✅ [AdmKelas Storage] Loaded - Mode:', USE_FIREBASE ? 'Firebase (with userId isolation)' : 'LocalStorage');
