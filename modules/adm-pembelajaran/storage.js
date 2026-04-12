/**
 * STORAGE: Firebase Only (Adm.Pembelajaran)
 * Shared storage for Section 1, Section 2, Section 3
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
      console.log('🔧 [Storage-Pembelajaran] userId set:', uid.substring(0, 10) + '...');
    } else {
      this.userId = null;
      console.warn('⚠️ [Storage-Pembelajaran] userId set to null (invalid)');
    }
  },
  
  loadDokumen: async function() {
    if (!isFirebaseMode(this.userId)) return [];
    try {
      const q = fb.query(
        fb.collection(fb.db, 'pembelajaran'),
        fb.where('userId', '==', this.userId),
        fb.orderBy('createdAt', 'desc')
      );
      const snapshot = await fb.getDocs(q, { source: 'server' });
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error('❌ [Storage-Pembelajaran] loadDokumen error:', e.message);
      return [];
    }
  },
  
  loadDokumenByJenis: async function(jenis) {
    if (!isFirebaseMode(this.userId)) return [];
    try {
      const q = fb.query(
        fb.collection(fb.db, 'pembelajaran'),
        fb.where('userId', '==', this.userId),
        fb.where('jenis', '==', jenis),
        fb.orderBy('createdAt', 'desc')
      );
      const snapshot = await fb.getDocs(q, { source: 'server' });
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error('❌ [Storage-Pembelajaran] loadDokumenByJenis error:', e.message);
      return [];
    }
  },
  
  saveDokumen: async function(docData) {
    if (!isFirebaseMode(this.userId)) throw new Error('saveDokumen: userId not set');
    if (!docData?.judul?.trim()) throw new Error('saveDokumen: judul is required');
    if (!docData?.jenis) throw new Error('saveDokumen: jenis is required');
    
    try {
      const newDoc = {
        userId: this.userId,
        jenis: docData.jenis,
        jenjang: docData.jenjang || '',
        kelas: docData.kelas || '',
        mapel: docData.mapel || '',
        judul: docData.judul.trim(),
        konten: docData.konten || '',
        tags: docData.tags || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const colRef = fb.collection(fb.db, 'pembelajaran');
      const docRef = await fb.addDoc(colRef, newDoc);
      console.log('✅ [Storage-Pembelajaran] saveDokumen:', docRef.id);
      return { id: docRef.id, ...newDoc };
    } catch (e) {
      console.error('❌ [Storage-Pembelajaran] saveDokumen error:', e.message);
      throw e;
    }
  },
  
  updateDokumen: async function(docId, updates) {
    if (!isFirebaseMode(this.userId)) throw new Error('updateDokumen: userId not set');
    if (!docId) throw new Error('updateDokumen: docId is required');
    
    try {
      const docRef = fb.doc(fb.db, 'pembelajaran', docId);
      await fb.updateDoc(docRef, { ...updates, userId: this.userId, updatedAt: new Date().toISOString() });
      console.log('✅ [Storage-Pembelajaran] updateDokumen:', docId);
      return { id: docId, ...updates };
    } catch (e) {
      console.error('❌ [Storage-Pembelajaran] updateDokumen error:', e.message);
      throw e;
    }
  },
  
  deleteDokumen: async function(docId) {
    if (!isFirebaseMode(this.userId)) throw new Error('deleteDokumen: userId not set');
    if (!docId) throw new Error('deleteDokumen: docId is required');
    
    try {
      const docRef = fb.doc(fb.db, 'pembelajaran', docId);
      const docSnap = await fb.getDoc(docRef);
      if (docSnap.exists()) {
        const docData = docSnap.data();
        if (docData.userId && docData.userId !== this.userId) {
          throw new Error(`Permission denied`);
        }
      }
      await fb.deleteDoc(docRef);
      console.log('✅ [Storage-Pembelajaran] deleteDokumen:', docId);
    } catch (e) {
      console.error('❌ [Storage-Pembelajaran] deleteDokumen error:', e.message);
      throw e;
    }
  },
  
  getDokumenById: async function(docId) {
    if (!docId) throw new Error('getDokumenById: docId is required');
    try {
      const docRef = fb.doc(fb.db, 'pembelajaran', docId);
      const docSnap = await fb.getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.userId && data.userId !== this.userId) {
          throw new Error('Permission denied');
        }
        return { id: docSnap.id, ...data };
      }
      return null;
    } catch (e) {
      console.error('❌ [Storage-Pembelajaran] getDokumenById error:', e.message);
      throw e;
    }
  }
};

console.log('✅ [Storage-Pembelajaran] Loaded - Firebase Only (Shared)');
