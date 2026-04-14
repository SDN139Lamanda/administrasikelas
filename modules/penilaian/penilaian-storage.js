/**
 * PENILAIAN STORAGE - Reuse adm-kelas storage for consistency
 * ✅ No duplicate Firebase config - use shared storage.js
 */

import { storage as admStorage } from '../adm-kelas/storage.js';

export const penilaianStorage = {
  /**
   * Load grades for a class
   * Collection: 'penilaian' (separate from 'classes')
   * Structure: { meta: { jumlahPH },  { studentKey: { ph, sts, sas, sikap, catatan } } }
   */
  loadGrades: async function(classId) {
    try {
      // Use adm-kelas storage pattern: set userId first
      const { auth } = await import('../firebase-config.js');
      admStorage.setUserId(auth.currentUser?.uid || null);
      
      // Query 'penilaian' collection
      const { db, collection, query, where, getDocs } = await import('../firebase-config.js');
      const q = query(
        collection(db, 'penilaian'),
        where('classId', '==', classId),
        where('userId', '==', auth.currentUser?.uid)
      );
      
      const snapshot = await getDocs(q, { source: 'server' });
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return doc.data();
      }
      
      // Return empty structure if not found
      return { meta: { jumlahPH: 1 },  {} };
      
    } catch (e) {
      console.error('❌ [PenilaianStorage] loadGrades error:', e);
      return { meta: { jumlahPH: 1 },  {} };
    }
  },
  
  /**
   * Save grades for a class
   * Auto-merge with existing data
   */
  saveGrades: async function(classId, payload) {
    try {
      const { auth, db, doc: docRef, setDoc, serverTimestamp } = await import('../firebase-config.js');
      
      // Set userId for adm-storage consistency
      admStorage.setUserId(auth.currentUser?.uid || null);
      
      const ref = docRef(db, 'penilaian', classId);
      
      await setDoc(ref, {
        ...payload,
        classId,
        userId: auth.currentUser?.uid,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      console.log('✅ [PenilaianStorage] Grades saved:', classId);
      return true;
      
    } catch (e) {
      console.error('❌ [PenilaianStorage] saveGrades error:', e);
      throw e;
    }
  }
};

console.log('✅ [PenilaianStorage] Loaded - Reuses adm-kelas storage pattern');
