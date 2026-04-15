/**
 * STORAGE: Firebase Only (Adm.Pembelajaran)
 * Shared storage for Section 1, Section 2, Section 3
 * ✅ FINAL FIX: Query tanpa orderBy untuk avoid index error
 */

import * as fb from './firebase-config.js';

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
  
  // ✅ FINAL FIX: Query tanpa orderBy
  loadDokumen: async function() {
    if (!isFirebaseMode(this.userId)) return [];
    try {
      console.log('🔍 [Storage] Loading dokumen for userId:', this.userId);
      
      const q = fb.query(
        fb.collection(fb.db, 'pembelajaran'),
        fb.where('userId', '==', this.userId)
      );
      
      const snapshot = await fb.getDocs(q, { source: 'server' });
      
      console.log('📊 [Storage] Query result:', snapshot.size, 'documents');
      
      const docs = snapshot.docs.map(doc => {
        const data = doc.data();
        return { id: doc.id, ...data };
      });
      
      // Sort manually
      return docs.sort((a, b) => 
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
      
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
        fb.where('jenis', '==', jenis)
      );
      
      const snapshot = await fb.getDocs(q, { source: 'server' });
      
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return docs.sort((a, b) => 
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
      
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
  },
  
  // ✅ AUTO-SAVE FROM EXTERNAL MODULES
  autoSaveFromExternal: async function(moduleName, docData) {
    if (!isFirebaseMode(this.userId)) throw new Error('autoSave: userId not set');
    
    try {
      const { db, doc: docRef, setDoc, serverTimestamp } = await import('../firebase-config.js');
      
      const id = docData.id || `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const ref = docRef(db, 'pembelajaran', id);
      
      const payload = {
        ...docData,
        userId: this.userId,
        source: moduleName,
        updatedAt: serverTimestamp(),
        createdAt: docData.createdAt || serverTimestamp()
      };
      
      await setDoc(ref, payload, { merge: true });
      console.log(`✅ [Storage-Pembelajaran] Auto-saved from ${moduleName}:`, id);
      
      return { id, ...payload };
    } catch (e) {
      console.error(`❌ [Storage-Pembelajaran] autoSaveFromExternal error:`, e);
      throw e;
    }
  }
};

// ✅ GET SOURCE LABEL FOR UI BADGE
export function getSourceLabel(source) {
  const labels = {
    'cta-generator': '📝 CTA',
    'asisten-modul': '🤖 AI',
    'manual': '✏️ Manual',
    'penilaian-auto': '📊 Auto'
  };
  return labels[source] || '✏️';
}

console.log('✅ [Storage-Pembelajaran] Loaded - Firebase Only + Auto-Save Integration');
