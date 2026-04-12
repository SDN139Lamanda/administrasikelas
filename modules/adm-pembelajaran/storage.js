/**
 * STORAGE: Firebase Only (Adm.Pembelajaran)
 * Shared storage for Section 1 (CTA + Asisten Modul), Section 2, Section 3
 */

import * as fb from '../firebase-config.js';

const USE_FIREBASE = true;

function isFirebaseMode(userId) {
  return USE_FIREBASE && userId && typeof userId === 'string' && userId.length > 0;
}

export const storage = {
  userId: null,
  
  // ✅ Set userId (called from adm-pembelajaran.js)
  setUserId: function(uid) {
    if (uid && typeof uid === 'string' && uid.length > 0) {
      this.userId = uid;
      console.log('🔧 [Storage-Pembelajaran] userId set:', uid.substring(0, 10) + '...');
    } else {
      this.userId = null;
      console.warn('⚠️ [Storage-Pembelajaran] userId set to null (invalid)');
    }
  },
  
  // ✅ LOAD all pembelajaran documents for current user
  loadDokumen: async function() {
    if (!isFirebaseMode(this.userId)) return [];
    try {
      const q = fb.query(
        fb.collection(fb.db, 'pembelajaran'),
        fb.where('userId', '==', this.userId),
        fb.orderBy('createdAt', 'desc')
      );
      const snapshot = await fb.getDocs(q, { source: 'server' });
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return { id: doc.id, ...data };
      });
    } catch (e) {
      console.error('❌ [Storage-Pembelajaran] loadDokumen error:', e.message);
      return [];
    }
  },
  
  // ✅ LOAD by jenis (cta or modul_ajar)
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
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return { id: doc.id, ...data };
      });
    } catch (e) {
      console.error('❌ [Storage-Pembelajaran] loadDokumenByJenis error:', e.message);
      return [];
    }
  },
  
  // ✅ SAVE document (for CTA Generator & Asisten Modul auto-save)
  saveDokumen: async function(docData) {
    if (!isFirebaseMode(this.userId)) throw new Error('saveDokumen: userId not set');
    if (!docData?.judul?.trim()) throw new Error('saveDokumen: judul is required');
    if (!docData?.jenis) throw new Error('saveDokumen: jenis is required (cta/modul_ajar)');
    
    try {
      const newDoc = {
        userId: this.userId,
        jenis: docData.jenis,           // 'cta' or 'modul_ajar'
        jenjang: docData.jenjang || '', // 'sd', 'smp', 'sma'
        kelas: docData.kelas || '',     // '1', '2', ..., '12'
        mapel: docData.mapel || '',     // 'Matematika', 'IPA', etc.
        judul: docData.judul.trim(),
        konten: docData.konten || '',   // Full HTML/text content
        tags: docData.tags || [],       // Optional tags for search
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
  
  // ✅ UPDATE document (for edit feature)
  updateDokumen: async function(docId, updates) {
    if (!isFirebaseMode(this.userId)) throw new Error('updateDokumen: userId not set');
    if (!docId) throw new Error('updateDokumen: docId is required');
    
    try {
      const docRef = fb.doc(fb.db, 'pembelajaran', docId);
      await fb.updateDoc(docRef, {
        ...updates,
        userId: this.userId,
        updatedAt: new Date().toISOString()
      });
      console.log('✅ [Storage-Pembelajaran] updateDokumen:', docId);
      return { id: docId, ...updates };
    } catch (e) {
      console.error('❌ [Storage-Pembelajaran] updateDokumen error:', e.message);
      throw e;
    }
  },
  
  // ✅ DELETE document
  deleteDokumen: async function(docId) {
    if (!isFirebaseMode(this.userId)) throw new Error('deleteDokumen: userId not set');
    if (!docId) throw new Error('deleteDokumen: docId is required');
    
    try {
      const docRef = fb.doc(fb.db, 'pembelajaran', docId);
      
      // ✅ Verify ownership before delete
      const docSnap = await fb.getDoc(docRef);
      if (docSnap.exists()) {
        const docData = docSnap.data();
        if (docData.userId && docData.userId !== this.userId) {
          throw new Error(`Permission denied: doc userId (${docData.userId}) != current user (${this.userId})`);
        }
      }
      
      await fb.deleteDoc(docRef);
      console.log('✅ [Storage-Pembelajaran] deleteDokumen:', docId);
    } catch (e) {
      console.error('❌ [Storage-Pembelajaran] deleteDokumen error:', e.message);
      throw e;
    }
  },
  
  // ✅ GET single document by ID
  getDokumenById: async function(docId) {
    if (!docId) throw new Error('getDokumenById: docId is required');
    
    try {
      const docRef = fb.doc(fb.db, 'pembelajaran', docId);
      const docSnap = await fb.getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Verify ownership
        if (data.userId && data.userId !== this.userId) {
          throw new Error('Permission denied: document not owned by current user');
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

console.log('✅ [Storage-Pembelajaran] Loaded - Firebase Only (Shared for 3 Sections)');
