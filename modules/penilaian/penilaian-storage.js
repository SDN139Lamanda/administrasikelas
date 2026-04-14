/**
 * PENILAIAN STORAGE - Reuse adm-kelas storage pattern
 * ✅ All object syntax validated - no unexpected tokens
 */

import { storage as admStorage } from '../adm-kelas/storage.js';

export const penilaianStorage = {
  /**
   * Load grades for a class
   * Collection: 'penilaian' (separate from 'classes')
   */
  loadGrades: async function(classId) {
    try {
      const { auth, db, collection, query, where, getDocs } = await import('../firebase-config.js');
      
      // Set userId for consistency
      admStorage.setUserId(auth.currentUser?.uid || null);
      
      const q = query(
        collection(db, 'penilaian'),
        where('classId', '==', classId),
        where('userId', '==', auth.currentUser?.uid)
      );
      
      const snapshot = await getDocs(q, { source: 'server' });
      
      if (!snapshot.empty) {
        return snapshot.docs[0].data();
      }
      
      // ✅ RETURN DENGAN SYNTAX VALID:
      return { meta: { jumlahPH: 1 }, data: {} };
      
    } catch (e) {
      console.error('❌ [PenilaianStorage] loadGrades error:', e);
      // ✅ RETURN DENGAN SYNTAX VALID:
      return { meta: { jumlahPH: 1 }, data: {} };
    }
  },
  
  /**
   * Save grades for a class
   */
  saveGrades: async function(classId, payload) {
    try {
      const { auth, db, doc: docRef, setDoc, serverTimestamp } = await import('../firebase-config.js');
      
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

console.log('✅ [PenilaianStorage] Loaded - Syntax Validated');
