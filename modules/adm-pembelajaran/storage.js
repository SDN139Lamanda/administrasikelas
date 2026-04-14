/**
 * STORAGE: Firebase Only (Clean Architecture)
 * ✅ Added: autoSaveFromExternal + getSourceLabel for integration
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
  
  loadDokumen: async function() {
    if (!isFirebaseMode(this.userId)) return [];
    try {
      const q = fb.query(fb.collection(fb.db, 'dokumen'), fb.where('userId', '==', this.userId));
      const snapshot = await fb.getDocs(q, { source: 'server' });
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (e) {
      console.error('❌ [Storage] loadDokumen error:', e.message);
      return [];
    }
  },
  
  getDokumenById: async function(docId) {
    if (!isFirebaseMode(this.userId)) return null;
    try {
      const ref = fb.doc(fb.db, 'dokumen', docId);
      const snap = await fb.getDoc(ref);
      if (snap.exists() && snap.data().userId === this.userId) {
        return { id: snap.id, ...snap.data() };
      }
      return null;
    } catch (e) {
      console.error('❌ [Storage] getDokumenById error:', e.message);
      return null;
    }
  },
  
  saveDokumen: async function(docData) {
    if (!isFirebaseMode(this.userId)) throw new Error('saveDokumen: userId not set');
    try {
      const { db, doc: docRef, setDoc, serverTimestamp } = await import('../firebase-config.js');
      
      const id = docData.id || `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const ref = docRef(db, 'dokumen', id);
      
      const payload = {
        ...docData,
        userId: this.userId,
        updatedAt: serverTimestamp(),
        createdAt: docData.createdAt || serverTimestamp()
      };
      
      await setDoc(ref, payload, { merge: true });
      console.log('✅ [Storage] saveDokumen:', id);
      return { id, ...payload };
    } catch (e) {
      console.error('❌ [Storage] saveDokumen error:', e.message);
      throw e;
    }
  },
  
  deleteDokumen: async function(docId) {
    if (!isFirebaseMode(this.userId)) throw new Error('deleteDokumen: userId not set');
    try {
      const { db, doc: docRef, deleteDoc, getDoc } = await import('../firebase-config.js');
      
      const ref = docRef(db, 'dokumen', docId);
      const snap = await getDoc(ref);
      
      if (snap.exists() && snap.data().userId !== this.userId) {
        throw new Error('Permission denied: document not owned by user');
      }
      
      await deleteDoc(ref);
      console.log('✅ [Storage] deleteDokumen:', docId);
      return true;
    } catch (e) {
      console.error('❌ [Storage] deleteDokumen error:', e.message);
      throw e;
    }
  },
  
  // ✅ NEW: Auto-save from external modules (cta-generator, asisten-modul)
  autoSaveFromExternal: async function(moduleName, docData) {
    if (!isFirebaseMode(this.userId)) throw new Error('autoSave: userId not set');
    try {
      const { db, doc: docRef, setDoc, serverTimestamp } = await import('../firebase-config.js');
      
      const id = docData.id || `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const ref = docRef(db, 'dokumen', id);
      
      const payload = {
        ...docData,
        userId: this.userId,
        source: moduleName, // 'cta-generator' | 'asisten-modul'
        updatedAt: serverTimestamp(),
        createdAt: docData.createdAt || serverTimestamp()
      };
      
      await setDoc(ref, payload, { merge: true });
      console.log(`✅ [Storage] Auto-saved from ${moduleName}:`, id);
      return { id, ...payload };
    } catch (e) {
      console.error(`❌ [Storage] autoSaveFromExternal error:`, e);
      throw e;
    }
  }
};

// ✅ NEW: Get human-readable label for document source
export function getSourceLabel(source) {
  const labels = {
    'cta-generator': '📝 CTA',
    'asisten-modul': '🤖 AI',
    'manual': '✏️ Manual',
    'penilaian-auto': '📊 Auto'
  };
  return labels[source] || '✏️';
}

console.log('✅ [Storage] Loaded - Firebase Only + Auto-Save Integration');
