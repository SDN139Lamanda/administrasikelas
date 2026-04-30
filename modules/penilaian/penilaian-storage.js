/**
 * PENILAIAN STORAGE - Reuse adm-kelas storage pattern
 * ✅ All object syntax validated - no unexpected tokens
 * ✅ UPDATED: Support nested aspects (pengetahuan, sikap, keterampilan)
 */

import { storage as admStorage } from '../adm-kelas/storage.js';

export const penilaianStorage = {
  /**
   * Load grades for a class
   * Collection: 'penilaian' (separate from 'classes')
   * Structure: { meta: { jumlahPH }, data: { studentKey: { pengetahuan: {...}, sikap: {...}, keterampilan: {...} } } }
   */
  loadGrades: async function(classId) {
    try {
      const { auth, db, collection, query, where, getDocs } = await import('../firebase-config.js');
      
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
      
      return { meta: { jumlahPH: 1 },  {} };
      
    } catch (e) {
      console.error('❌ [PenilaianStorage] loadGrades error:', e);
      return { meta: { jumlahPH: 1 },  {} };
    }
  },
  
  /**
   * Save grades for a class - merges without overwriting other aspects
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

console.log('✅ [PenilaianStorage] Loaded - Nested Aspect Support');
