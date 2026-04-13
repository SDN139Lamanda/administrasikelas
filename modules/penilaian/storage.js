/**
 * PENILAIAN STORAGE MODULE
 * ✅ Persamaan dengan adm-kelas (pakai Firebase storage.js)
 * ✅ Simpan & ambil nilai per kelas
 */

import { db } from '../firebase-config.js';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const penilaianStorage = {
  // Load semua nilai untuk kelas tertentu
  async loadGrades(classId) {
    try {
      const ref = doc(db, "grades", classId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        console.log("📊 [PenilaianStorage] Grades loaded:", classId);
        return snap.data();
      } else {
        console.warn("⚠️ [PenilaianStorage] No grades found for:", classId);
        return { meta: { jumlahPH: 1 }, data: {} };
      }
    } catch (e) {
      console.error("❌ [PenilaianStorage] loadGrades error:", e.message);
      return { meta: { jumlahPH: 1 }, data: {} };
    }
  },

  // Simpan nilai untuk kelas tertentu
  async saveGrades(classId, payload) {
    try {
      const ref = doc(db, "grades", classId);
      await setDoc(ref, payload, { merge: true });
      console.log("✅ [PenilaianStorage] Grades saved:", classId);
      return true;
    } catch (e) {
      console.error("❌ [PenilaianStorage] saveGrades error:", e.message);
      throw e;
    }
  }
};
